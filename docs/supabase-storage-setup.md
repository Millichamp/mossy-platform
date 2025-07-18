# Supabase Storage Setup Instructions

## Issue: Upload Errors
You're seeing upload errors because the Supabase Storage bucket needs to be set up.

## Steps to Fix:

### 1. Create Storage Bucket in Supabase
1. Go to your Supabase dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create bucket**
4. Name it: `images`
5. Make it **Public** (toggle the public setting)
6. Click **Create bucket**

### 2. Set Bucket Policies
After creating the bucket, you need to set up policies:

```sql
-- Allow public access to view images
INSERT INTO storage.objects_policies (bucket_id, policy_name, definition)
VALUES ('images', 'Public Access', 'true');

-- Allow authenticated users to upload images
INSERT INTO storage.objects_policies (bucket_id, policy_name, definition)
VALUES ('images', 'Authenticated Upload', 'auth.role() = ''authenticated''');
```

### 3. Alternative: Use RLS Policies
Or go to Storage > Policies and create:

**Policy 1: Public Read Access**
- Policy name: `Public read access`
- Operation: `SELECT`
- Target: `storage.objects`
- Policy definition: `bucket_id = 'images'`

**Policy 2: Authenticated Upload**
- Policy name: `Authenticated upload`
- Operation: `INSERT`
- Target: `storage.objects`
- Policy definition: `bucket_id = 'images' AND auth.role() = 'authenticated'`

### 4. Environment Variables
Make sure your `.env.local` file has:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 5. Test Connection
The upload function now includes better error reporting to help diagnose issues.

## Common Issues:
- **Bucket doesn't exist**: Create the `images` bucket
- **Permission denied**: Set up RLS policies
- **Authentication required**: Make sure user is logged in
- **File too large**: Check file size limits (10MB max)
- **Wrong file type**: Only JPG, PNG, WEBP allowed
