-- Add location fields to existing tables
ALTER TABLE public.children 
ADD COLUMN location TEXT,
ADD COLUMN attendance_count INTEGER DEFAULT 0;

ALTER TABLE public.robins 
ADD COLUMN home_location TEXT,
ADD COLUMN drive_count INTEGER DEFAULT 0;

-- Make aadhaar_number optional for children
ALTER TABLE public.children 
ALTER COLUMN aadhaar_number DROP NOT NULL;

-- Create attendance tracking table for children
CREATE TABLE public.child_attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  location TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create drive tracking table for robins
CREATE TABLE public.robin_drives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  robin_id UUID REFERENCES public.robins(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  location TEXT NOT NULL,
  attendance_marked BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.child_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.robin_drives ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for child_attendance
CREATE POLICY "Users can view own child attendance" ON public.child_attendance
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own child attendance" ON public.child_attendance
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own child attendance" ON public.child_attendance
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own child attendance" ON public.child_attendance
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for robin_drives
CREATE POLICY "Users can view own robin drives" ON public.robin_drives
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own robin drives" ON public.robin_drives
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own robin drives" ON public.robin_drives
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own robin drives" ON public.robin_drives
  FOR DELETE USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX idx_child_attendance_child_id ON public.child_attendance(child_id);
CREATE INDEX idx_child_attendance_date ON public.child_attendance(date);
CREATE INDEX idx_robin_drives_robin_id ON public.robin_drives(robin_id);
CREATE INDEX idx_robin_drives_date ON public.robin_drives(date);

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.child_attendance;
ALTER PUBLICATION supabase_realtime ADD TABLE public.robin_drives;