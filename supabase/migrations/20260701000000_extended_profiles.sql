-- 1. Add new columns to the profiles table
ALTER TABLE public.profiles
ADD COLUMN surname TEXT,
ADD COLUMN username TEXT UNIQUE,
ADD COLUMN phone_number TEXT UNIQUE,
ADD COLUMN current_study TEXT;

-- 2. Create the Trigger Function to auto-insert a profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    surname,
    username,
    phone_number,
    current_study,
    university
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'surname',
    NEW.raw_user_meta_data ->> 'username',
    NEW.raw_user_meta_data ->> 'phone_number',
    NEW.raw_user_meta_data ->> 'current_study',
    NEW.raw_user_meta_data ->> 'university'
  );
  RETURN NEW;
END;
$$;

-- 3. Bind the Trigger to the auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
