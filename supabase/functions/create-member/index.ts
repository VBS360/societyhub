/// <reference path="./types.d.ts" />

import { serve, createClient } from "./deps.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type ProfileRole =
  | 'super_admin'
  | 'society_admin'
  | 'committee_member'
  | 'resident'
  | 'guest';

type MemberPayload = {
  email: string;
  phone?: string | null;
  fullName: string;
  societyId: string;
  memberData: {
    family_members?: string[] | null;
    role?: ProfileRole | null;
    is_owner?: boolean | null;
    unit_number?: string | null;
    emergency_contact?: string | null;
    vehicle_details?: string | null;
    is_active?: boolean | null;
  };
};

const createSupabaseAdminClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Missing Supabase configuration in Edge Function environment');
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

const generateTemporaryPassword = (length = 12): string => {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
  let password = '';
  const randomValues = crypto.getRandomValues(new Uint32Array(length));

  for (let i = 0; i < length; i++) {
    password += charset[randomValues[i] % charset.length];
  }

  return password;
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  try {
    const payload = (await req.json()) as MemberPayload;
    console.log('Received payload:', JSON.stringify(payload));

    const { email, phone, fullName, societyId, memberData } = payload;

    if (!email || !fullName || !societyId || !memberData) {
      console.error('Missing required fields:', { email: !!email, fullName: !!fullName, societyId: !!societyId, memberData: !!memberData });
      return new Response(
        JSON.stringify({ error: 'Missing required member details' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const supabase = createSupabaseAdminClient();
    const now = new Date().toISOString();

    const baseProfile = {
      full_name: fullName,
      email,
      phone: phone ?? null,
      family_members: memberData.family_members ?? null,
      role: memberData.role ?? 'resident',
      is_owner: memberData.is_owner ?? false,
      society_id: societyId,
      unit_number: memberData.unit_number ?? null,
      emergency_contact: memberData.emergency_contact ?? null,
      vehicle_details: memberData.vehicle_details ?? null,
      is_active: memberData.is_active ?? true,
      updated_at: now,
    };

    let userId: string | null = null;
    let operation: 'created' | 'updated' = 'created';
    let temporaryPassword: string | null = null;

    const { data: existingProfile, error: existingProfileError } = await supabase
      .from('profiles')
      .select('id, user_id')
      .eq('email', email)
      .maybeSingle();

    if (existingProfileError) {
      console.error('Error checking existing profile:', existingProfileError);
      return new Response(
        JSON.stringify({ error: 'Failed to look up existing member' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (existingProfile) {
      operation = 'updated';
      userId = existingProfile.user_id || existingProfile.id;

      if (!userId) {
        console.error('Existing profile record is missing a user identifier');
        return new Response(
          JSON.stringify({ error: 'Existing member record is misconfigured. Please contact support.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update(baseProfile)
        .eq('id', existingProfile.id);

      if (updateProfileError) {
        console.error('Error updating existing profile:', updateProfileError);
        return new Response(
          JSON.stringify({ error: 'Failed to update existing member profile' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      const { error: updateUserError } = await supabase.auth.admin.updateUserById(userId, {
        email,
        phone: phone ?? undefined,
        user_metadata: {
          full_name: fullName,
          phone: phone ?? undefined,
          role: memberData.role ?? 'resident',
          society_id: societyId,
        },
      });

      if (updateUserError) {
        console.error('Error updating auth user metadata:', updateUserError);
      }
    } else {
      const generatedPassword = generateTemporaryPassword();
      temporaryPassword = generatedPassword;

      const { data: createdUser, error: createUserError } = await supabase.auth.admin.createUser({
        email,
        password: generatedPassword,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          phone: phone ?? undefined,
          role: memberData.role ?? 'resident',
          society_id: societyId,
        },
      });

      if (createUserError || !createdUser.user) {
        console.error('Error creating auth user:', createUserError);
        return new Response(
          JSON.stringify({ error: 'Failed to create auth user' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      userId = createdUser.user.id;

      const profileInsert = {
        ...baseProfile,
        id: userId,
        user_id: userId,
        created_at: now,
      };

      const { error: insertProfileError } = await supabase
        .from('profiles')
        .insert(profileInsert);

      if (insertProfileError) {
        console.error('Error inserting profile:', insertProfileError);
        return new Response(
          JSON.stringify({ error: 'Failed to create member profile' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
    }

    return new Response(
      JSON.stringify({
        status: 'success',
        operation,
        userId,
        temporaryPassword,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Unhandled error in create-member function:', error);
    return new Response(
      JSON.stringify({ error: 'Unexpected error while processing member' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
