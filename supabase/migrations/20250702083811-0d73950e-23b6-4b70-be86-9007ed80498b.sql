-- Add drive count tracking and first drive functionality

-- Add drive_count and is_first_drive to robins table
ALTER TABLE public.robins 
ADD COLUMN IF NOT EXISTS is_first_drive boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS total_drives_participated integer DEFAULT 0;

-- Add first_drive tracking to robin_drives table
ALTER TABLE public.robin_drives
ADD COLUMN IF NOT EXISTS is_first_drive boolean DEFAULT false;

-- Function to update drive counts when a robin participates in a drive
CREATE OR REPLACE FUNCTION public.update_robin_drive_count()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update the robin's drive count
  UPDATE public.robins 
  SET 
    drive_count = COALESCE(drive_count, 0) + 1,
    total_drives_participated = COALESCE(total_drives_participated, 0) + 1,
    is_first_drive = false
  WHERE id = NEW.robin_id;
  
  -- Mark if this is their first drive
  UPDATE public.robin_drives
  SET is_first_drive = (
    SELECT is_first_drive 
    FROM public.robins 
    WHERE id = NEW.robin_id
  )
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Create trigger for drive count updates
DROP TRIGGER IF EXISTS update_robin_drive_count_trigger ON public.robin_drives;
CREATE TRIGGER update_robin_drive_count_trigger
  AFTER INSERT ON public.robin_drives
  FOR EACH ROW
  EXECUTE FUNCTION public.update_robin_drive_count();

-- Function to handle manual drive count entry for existing users
CREATE OR REPLACE FUNCTION public.set_initial_drive_count(_robin_id uuid, _drive_count integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.robins
  SET 
    total_drives_participated = _drive_count,
    drive_count = _drive_count,
    is_first_drive = (_drive_count = 0)
  WHERE id = _robin_id;
END;
$$;