-- Robin Profile Management and Unavailability Enhancements

-- Add profile management fields to robins table
ALTER TABLE public.robins 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact TEXT,
ADD COLUMN IF NOT EXISTS skills TEXT[],
ADD COLUMN IF NOT EXISTS availability_preferences TEXT,
ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS profile_created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS can_edit_profile BOOLEAN DEFAULT true;

-- Add real-time status tracking to robin_unavailability
ALTER TABLE public.robin_unavailability 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS notification_sent BOOLEAN DEFAULT false;

-- Create function to check if a robin is registered
CREATE OR REPLACE FUNCTION public.is_robin_registered(_robin_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT registration_completed 
  FROM public.robins 
  WHERE id = _robin_id
$$;

-- Create function to get robin profile permissions
CREATE OR REPLACE FUNCTION public.can_edit_robin_profile(_robin_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    CASE 
      WHEN r.profile_created_by = _user_id THEN true
      WHEN r.can_edit_profile = false THEN false
      WHEN public.has_role(_user_id, 'admin') THEN true
      ELSE false
    END
  FROM public.robins r
  WHERE r.id = _robin_id
$$;

-- Update RLS policies for robins to allow viewing all profiles but editing only own
DROP POLICY IF EXISTS "Users can view own robins" ON public.robins;
CREATE POLICY "Users can view all robins" ON public.robins
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own robins" ON public.robins;
CREATE POLICY "Users can update robin profiles with permission" ON public.robins
  FOR UPDATE USING (
    public.can_edit_robin_profile(id, auth.uid()) OR 
    public.has_role(auth.uid(), 'admin')
  );

-- Add function to mark robin as unavailable with real-time updates
CREATE OR REPLACE FUNCTION public.mark_robin_unavailable(
  _robin_id uuid,
  _unavailable_date date,
  _reason text DEFAULT null
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _unavailability_id uuid;
BEGIN
  -- Insert unavailability record
  INSERT INTO public.robin_unavailability (
    robin_id, 
    unavailable_date, 
    reason, 
    user_id,
    status
  ) VALUES (
    _robin_id, 
    _unavailable_date, 
    _reason, 
    auth.uid(),
    'approved'
  ) RETURNING id INTO _unavailability_id;
  
  -- Update robin status if it's today's drive
  IF _unavailable_date = CURRENT_DATE THEN
    UPDATE public.robins 
    SET status = 'unavailable'
    WHERE id = _robin_id;
  END IF;
  
  RETURN _unavailability_id;
END;
$$;

-- Create function to get today's assigned robins
CREATE OR REPLACE FUNCTION public.get_todays_assigned_robins()
RETURNS TABLE (
  robin_id uuid,
  robin_name text,
  assigned_location text,
  status text,
  is_unavailable boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    r.id as robin_id,
    r.name as robin_name,
    r.assigned_location,
    r.status,
    CASE WHEN ru.id IS NOT NULL THEN true ELSE false END as is_unavailable
  FROM public.robins r
  LEFT JOIN public.robin_unavailability ru ON r.id = ru.robin_id 
    AND ru.unavailable_date = CURRENT_DATE
    AND ru.status = 'approved'
  WHERE r.assigned_date = CURRENT_DATE
    AND r.status = 'active'
$$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_robins_registration_completed ON public.robins(registration_completed);
CREATE INDEX IF NOT EXISTS idx_robins_profile_created_by ON public.robins(profile_created_by);
CREATE INDEX IF NOT EXISTS idx_robin_unavailability_status ON public.robin_unavailability(status);
CREATE INDEX IF NOT EXISTS idx_robin_unavailability_date_status ON public.robin_unavailability(unavailable_date, status);

-- Enable realtime for robin_unavailability
ALTER PUBLICATION supabase_realtime ADD TABLE public.robin_unavailability; 