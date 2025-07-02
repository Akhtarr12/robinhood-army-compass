-- Create function to update timestamps (if it doesn't exist)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add tags field to children table for enhanced search
ALTER TABLE public.children ADD COLUMN tags TEXT[];

-- Add unavailability tracking for robins
CREATE TABLE public.robin_unavailability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  robin_id UUID NOT NULL REFERENCES public.robins(id) ON DELETE CASCADE,
  unavailable_date DATE NOT NULL,
  reason TEXT,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(robin_id, unavailable_date)
);

-- Enable RLS for robin_unavailability
ALTER TABLE public.robin_unavailability ENABLE ROW LEVEL SECURITY;

-- RLS policies for robin_unavailability
CREATE POLICY "Users can view own robin unavailability" 
ON public.robin_unavailability 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own robin unavailability" 
ON public.robin_unavailability 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own robin unavailability" 
ON public.robin_unavailability 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own robin unavailability" 
ON public.robin_unavailability 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add commute method and contributions to robin_drives
ALTER TABLE public.robin_drives ADD COLUMN commute_method TEXT;
ALTER TABLE public.robin_drives ADD COLUMN contribution_message TEXT;
ALTER TABLE public.robin_drives ADD COLUMN items_brought JSONB DEFAULT '[]'::jsonb;

-- Create drives table for comprehensive drive management
CREATE TABLE public.drives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  location TEXT NOT NULL,
  summary TEXT,
  robin_group_photo_url TEXT,
  children_group_photo_url TEXT,
  combined_group_photo_url TEXT,
  items_distributed JSONB DEFAULT '[]'::jsonb,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for drives
ALTER TABLE public.drives ENABLE ROW LEVEL SECURITY;

-- RLS policies for drives
CREATE POLICY "Users can view own drives" 
ON public.drives 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own drives" 
ON public.drives 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own drives" 
ON public.drives 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own drives" 
ON public.drives 
FOR DELETE 
USING (auth.uid() = user_id);

-- Link robin_drives to the drives table
ALTER TABLE public.robin_drives ADD COLUMN drive_id UUID REFERENCES public.drives(id) ON DELETE SET NULL;

-- Link child_attendance to the drives table  
ALTER TABLE public.child_attendance ADD COLUMN drive_id UUID REFERENCES public.drives(id) ON DELETE SET NULL;

-- Add trigger for drives updated_at
CREATE TRIGGER update_drives_updated_at
BEFORE UPDATE ON public.drives
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for tags search on children
CREATE INDEX idx_children_tags ON public.children USING GIN(tags);

-- Enable the pg_trgm extension for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add indexes for improved search performance (after extension is created)
CREATE INDEX idx_children_name_trgm ON public.children USING gin (name gin_trgm_ops);
CREATE INDEX idx_robins_name_trgm ON public.robins USING gin (name gin_trgm_ops);