import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { Command } from 'commander';

const program = new Command();

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function setSuperAdmin(email: string) {
  try {
    console.log(`Setting up super admin for: ${email}`);
    
    // 1. Check if user exists
    console.log('Checking if user exists...');
    // First try to get user by email
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();
    
    let userId: string;
    
    if (userError || !userData) {
      // User doesn't exist, create a new one
      console.log('User not found. Creating new user...');
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: generateRandomPassword(),
        options: {
          data: {
            role: 'super_admin',
            full_name: email.split('@')[0]
          },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
        }
      });
      
      if (!authData.user) {
        throw new Error('Failed to create user: No user data returned');
      }
      
      userId = authData.user.id;
      console.log(`Created new user with ID: ${userId}`);
    } else {
      // User exists, update their role
      userId = userData.id;
      console.log(`User found with ID: ${userId}`);
      
      // Update the user's role in the profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'super_admin' })
        .eq('id', userId);
      
      if (updateError) {
        throw new Error(`Error updating user role: ${updateError.message}`);
      }
    }
    
    // 2. Update profile with super_admin role if not already set
    console.log('Updating profile with super_admin role...');
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        role: 'super_admin',
        is_active: true,
      })
      .eq('email', email);
    
    if (profileError) {
      throw new Error(`Error updating profile: ${profileError.message}`);
    }
    
    console.log('✅ Super admin setup completed successfully!');
    console.log(`User ${email} has been granted super admin privileges.`);
    
  } catch (error) {
    console.error('❌ Error setting up super admin:', error);
    process.exit(1);
  }
}

// Set up CLI
// Helper function to generate a random password
function generateRandomPassword(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  let result = '';
  const charsLength = chars.length;
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * charsLength));
  }
  return result;
}

program
  .requiredOption('-e, --email <email>', 'Email of the user to make super admin')
  .parse(process.argv);

const options = program.opts();

// Run the setup
setSuperAdmin(options.email);
