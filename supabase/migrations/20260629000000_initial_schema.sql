-- Create custom types
CREATE TYPE note_status AS ENUM ('draft', 'processing', 'published', 'rejected');
CREATE TYPE purchase_status AS ENUM ('pending', 'completed', 'escrow', 'released', 'refunded');

-- Create Profiles Table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
    full_name TEXT,
    university TEXT,
    payfast_payout_details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create Notes Table
CREATE TABLE public.notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    course_code TEXT NOT NULL,
    description TEXT,
    price_zar DECIMAL(10, 2) NOT NULL,
    file_path TEXT NOT NULL, -- Path in Supabase Storage
    status note_status DEFAULT 'draft'::note_status NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create Purchases Table
CREATE TABLE public.purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    buyer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    note_id UUID REFERENCES public.notes(id) ON DELETE SET NULL,
    amount_zar DECIMAL(10, 2) NOT NULL,
    status purchase_status DEFAULT 'pending'::purchase_status NOT NULL,
    payfast_pf_payment_id TEXT UNIQUE,
    download_token UUID UNIQUE DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create Reviews Table
CREATE TABLE public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE NOT NULL,
    buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Profiles RLS
CREATE POLICY "Public profiles are viewable by everyone."
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile."
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile."
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Notes RLS
CREATE POLICY "Published notes are viewable by everyone."
    ON public.notes FOR SELECT
    USING (status = 'published');

CREATE POLICY "Sellers can view all their own notes."
    ON public.notes FOR SELECT
    USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can insert their own notes."
    ON public.notes FOR INSERT
    WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own notes."
    ON public.notes FOR UPDATE
    USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete their own notes."
    ON public.notes FOR DELETE
    USING (auth.uid() = seller_id);

-- Purchases RLS
CREATE POLICY "Buyers can view their own purchases."
    ON public.purchases FOR SELECT
    USING (auth.uid() = buyer_id);

CREATE POLICY "Sellers can view purchases of their notes."
    ON public.purchases FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.notes
            WHERE notes.id = purchases.note_id
            AND notes.seller_id = auth.uid()
        )
    );

-- Reviews RLS
CREATE POLICY "Reviews are viewable by everyone."
    ON public.reviews FOR SELECT
    USING (true);

CREATE POLICY "Buyers can insert a review if they purchased the note."
    ON public.reviews FOR INSERT
    WITH CHECK (
        auth.uid() = buyer_id AND
        EXISTS (
            SELECT 1 FROM public.purchases
            WHERE purchases.note_id = reviews.note_id
            AND purchases.buyer_id = auth.uid()
            AND purchases.status = 'completed'
        )
    );
