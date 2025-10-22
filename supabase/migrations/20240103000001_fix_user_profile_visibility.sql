-- Fix: Allow all users to view user profiles (but not edit them)
-- This fixes the "Updated by: Unknown" issue in metric history
-- where RLS was blocking access to other users' profile information

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;

-- Create a new policy that allows everyone to view user profiles
CREATE POLICY "User profiles are viewable by everyone" ON public.user_profiles
    FOR SELECT USING (true);

-- Keep the existing policies for INSERT and UPDATE (users can only modify their own profiles)
-- These should already exist:
-- CREATE POLICY "Users can update their own profile" ON public.user_profiles
--     FOR UPDATE USING (auth.uid() = id);
-- CREATE POLICY "Users can insert their own profile" ON public.user_profiles
--     FOR INSERT WITH CHECK (auth.uid() = id);