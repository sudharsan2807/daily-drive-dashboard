-- Drop user-specific RLS policies and restore permissive policy
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can create their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;

-- Restore permissive policy for all operations
CREATE POLICY "Allow all operations for now"
ON public.tasks
FOR ALL
USING (true)
WITH CHECK (true);