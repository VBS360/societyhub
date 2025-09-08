-- Allow super admins to manage societies and admins to update their own
-- 1) Helper function to check if current user is super admin
create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.role = 'super_admin'
  );
$$;

-- 2) Drop and recreate policies for societies to ensure clean state
drop policy if exists "Super admins can view all societies" on public.societies;
drop policy if exists "Super admins can create societies" on public.societies;
drop policy if exists "Admins can update their society" on public.societies;
drop policy if exists "Super admins can update societies" on public.societies;
drop policy if exists "Super admins can delete societies" on public.societies;

-- Select: Super admins can view all societies
create policy "Super admins can view all societies"
on public.societies
for select
to authenticated
using (public.is_super_admin());

-- Insert: Only super admins can create societies
create policy "Super admins can create societies"
on public.societies
for insert
to authenticated
with check (public.is_super_admin());

-- Update: Admins of the society can update their society
create policy "Admins can update their society"
on public.societies
for update
to authenticated
using (public.is_admin_in_society(id));

-- Update: Super admins can update any society
create policy "Super admins can update societies"
on public.societies
for update
to authenticated
using (public.is_super_admin());

-- Delete: Super admins can delete societies
create policy "Super admins can delete societies"
on public.societies
for delete
to authenticated
using (public.is_super_admin());

-- 3) Ensure updated_at auto-updates on changes
drop trigger if exists update_societies_updated_at on public.societies;
create trigger update_societies_updated_at
before update on public.societies
for each row
execute function public.update_updated_at_column();