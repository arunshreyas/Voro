# Storage Policy Setup Instructions

Since you can't modify storage.objects via SQL, follow these steps in the Supabase Dashboard:

## Step 1: Go to Storage
1. Open your Supabase Dashboard
2. Go to **Storage** in the left sidebar
3. Click on **Policies**

## Step 2: Create Storage Policies
Create these policies for the `objects` table:

### Policy 1: Upload Avatars
- **Name**: `Users can upload their own avatars`
- **Operation**: `INSERT`
- **Target roles**: `authenticated`
- **Policy definition**:
```sql
bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
```

### Policy 2: Update Avatars
- **Name**: `Users can update their own avatars`
- **Operation**: `UPDATE`
- **Target roles**: `authenticated`
- **Policy definition**:
```sql
bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
```

### Policy 3: Delete Avatars
- **Name**: `Users can delete their own avatars`
- **Operation**: `DELETE`
- **Target roles**: `authenticated`
- **Policy definition**:
```sql
bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
```

### Policy 4: View Avatars
- **Name**: `Anyone can view avatars`
- **Operation**: `SELECT`
- **Target roles**: `authenticated`
- **Policy definition**:
```sql
bucket_id = 'avatars'
```

## Step 3: Test
After creating these policies, try uploading an avatar in your app.
