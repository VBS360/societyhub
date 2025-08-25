-- Fix function security issue
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add missing RLS policies for all tables

-- Announcements policies
CREATE POLICY "Society members can view announcements" ON public.announcements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id::text = auth.uid()::text 
      AND p.society_id = announcements.society_id
    )
  );

CREATE POLICY "Admins can create announcements" ON public.announcements
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id::text = auth.uid()::text 
      AND p.society_id = society_id
      AND p.role IN ('super_admin', 'society_admin', 'committee_member')
      AND p.id = created_by
    )
  );

-- Events policies
CREATE POLICY "Society members can view events" ON public.events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id::text = auth.uid()::text 
      AND p.society_id = events.society_id
    )
  );

CREATE POLICY "Admins can create events" ON public.events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id::text = auth.uid()::text 
      AND p.society_id = society_id
      AND p.role IN ('super_admin', 'society_admin', 'committee_member')
      AND p.id = created_by
    )
  );

-- Event RSVPs policies
CREATE POLICY "Society members can view event RSVPs" ON public.event_rsvps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      JOIN public.events e ON e.id = event_rsvps.event_id
      WHERE p.user_id::text = auth.uid()::text 
      AND p.society_id = e.society_id
    )
  );

CREATE POLICY "Users can create their own RSVPs" ON public.event_rsvps
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id::text = auth.uid()::text 
      AND p.id = profile_id
    )
  );

-- Visitors policies
CREATE POLICY "Society members can view visitors" ON public.visitors
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id::text = auth.uid()::text 
      AND p.society_id = visitors.society_id
    )
  );

CREATE POLICY "Users can create visitor entries for themselves" ON public.visitors
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id::text = auth.uid()::text 
      AND p.society_id = society_id
      AND p.id = host_profile_id
    )
  );

-- Amenities policies
CREATE POLICY "Society members can view amenities" ON public.amenities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id::text = auth.uid()::text 
      AND p.society_id = amenities.society_id
    )
  );

CREATE POLICY "Admins can manage amenities" ON public.amenities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id::text = auth.uid()::text 
      AND p.society_id = amenities.society_id
      AND p.role IN ('super_admin', 'society_admin', 'committee_member')
    )
  );

-- Amenity bookings policies
CREATE POLICY "Society members can view amenity bookings" ON public.amenity_bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      JOIN public.amenities a ON a.id = amenity_bookings.amenity_id
      WHERE p.user_id::text = auth.uid()::text 
      AND p.society_id = a.society_id
    )
  );

CREATE POLICY "Users can create their own bookings" ON public.amenity_bookings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id::text = auth.uid()::text 
      AND p.id = profile_id
    )
  );

-- Expenses policies  
CREATE POLICY "Society members can view expenses" ON public.expenses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id::text = auth.uid()::text 
      AND p.society_id = expenses.society_id
    )
  );

CREATE POLICY "Admins can create expenses" ON public.expenses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id::text = auth.uid()::text 
      AND p.society_id = society_id
      AND p.role IN ('super_admin', 'society_admin', 'committee_member')
      AND p.id = created_by
    )
  );