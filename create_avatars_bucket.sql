    -- CREATE AVATARS STORAGE BUCKET
    -- Run this if the avatars bucket doesn't exist

    -- 1. Create the avatars bucket
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
    'avatars',
    'avatars',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    )
    ON CONFLICT (id) DO NOTHING;

    -- 2. Create storage policies for avatars
    CREATE POLICY "Users can upload their own avatars"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

    CREATE POLICY "Users can update their own avatars"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1])
    WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

    CREATE POLICY "Users can delete their own avatars"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

    CREATE POLICY "Anyone can view avatars"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (bucket_id = 'avatars');

    -- 3. Verify bucket was created
    SELECT 'Avatars bucket created successfully' as status;
