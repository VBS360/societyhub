-- Fix recursive RLS on profiles by using SECURITY DEFINER helper
-- Creates helper function and replaces the admin SELECT policy

-- Helper function to check if current user is admin of a given society
create or replace function public.is_admin_in_society(target_society uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and p.society_id = target_society
      and p.role in ('super_admin','society_admin','committee_member')
  );
$$;

-- Ensure execution privileges for typical roles
grant execute on function public.is_admin_in_society(uuid) to anon, authenticated, service_role;

-- Replace the recursive policy
drop policy if exists "Admins can view all profiles in their society" on public.profiles;

create policy "Admins can view profiles in their society" on public.profiles
  for select using (
    public.is_admin_in_society(society_id)
  );

-- Note: existing policies remain
--   "Users can view their own profile" (SELECT USING auth.uid()::text = user_id::text)
--   "Users can update their own profile" (UPDATE USING auth.uid()::text = user_id::text)
