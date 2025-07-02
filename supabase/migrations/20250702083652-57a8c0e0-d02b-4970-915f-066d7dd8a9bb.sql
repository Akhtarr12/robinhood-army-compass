-- Update age group constraints to allow 3-20 years

-- Update children table age_group constraint
ALTER TABLE public.children 
DROP CONSTRAINT IF EXISTS children_age_group_check;

ALTER TABLE public.children 
ADD CONSTRAINT children_age_group_check 
CHECK (age_group >= 3 AND age_group <= 20);

-- Update educational_content table age_group constraint  
ALTER TABLE public.educational_content 
DROP CONSTRAINT IF EXISTS educational_content_age_group_check;

ALTER TABLE public.educational_content 
ADD CONSTRAINT educational_content_age_group_check 
CHECK (age_group >= 3 AND age_group <= 20);