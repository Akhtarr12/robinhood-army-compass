-- Update RLS policies for role-based access control

-- Children table: Children can edit their own data, Robins can view
DROP POLICY IF EXISTS "Users can delete own children" ON public.children;
DROP POLICY IF EXISTS "Users can insert own children" ON public.children;
DROP POLICY IF EXISTS "Users can update own children" ON public.children;
DROP POLICY IF EXISTS "Users can view own children" ON public.children;

-- New policies for children table
CREATE POLICY "Children can manage their own data"
ON public.children
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Robins can view all children data"
ON public.children
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'robin') OR public.has_role(auth.uid(), 'admin'));

-- Robins table: Only admins and robins can view, only specific robin can edit their own
DROP POLICY IF EXISTS "Users can delete own robins" ON public.robins;
DROP POLICY IF EXISTS "Users can insert own robins" ON public.robins;
DROP POLICY IF EXISTS "Users can update own robins" ON public.robins;
DROP POLICY IF EXISTS "Users can view own robins" ON public.robins;

CREATE POLICY "Everyone can view robins data"
ON public.robins
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage all robins"
ON public.robins
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Robins can update their own data"
ON public.robins
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND public.has_role(auth.uid(), 'robin'))
WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'robin'));

-- Drives table: Everyone can view and edit drives
DROP POLICY IF EXISTS "Users can delete own drives" ON public.drives;
DROP POLICY IF EXISTS "Users can insert own drives" ON public.drives;
DROP POLICY IF EXISTS "Users can update own drives" ON public.drives;
DROP POLICY IF EXISTS "Users can view own drives" ON public.drives;

CREATE POLICY "Everyone can view drives"
ON public.drives
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Everyone can manage drives"
ON public.drives
FOR ALL
TO authenticated
USING (true)
WITH CHECK (auth.uid() = user_id);

-- Educational content: Private to each user
DROP POLICY IF EXISTS "Users can insert own educational content" ON public.educational_content;
DROP POLICY IF EXISTS "Users can view own educational content" ON public.educational_content;

CREATE POLICY "Users can manage their own educational content"
ON public.educational_content
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);