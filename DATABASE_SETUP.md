# Database Setup Instructions

## ✅ Connection Verified
Your Supabase connection is working correctly!

## 📋 Apply Database Schema

### Option 1: Using Supabase Dashboard (Recommended)

1. **Open Supabase SQL Editor:**
   - Go to: https://apqpsyugdmvrzaprugvw.supabase.co/project/apqpsyugdmvrzaprugvw/sql

2. **Create New Query:**
   - Click "New Query" button

3. **Copy and Paste Migration:**
   - Open the file: `supabase/migrations/001_initial_schema.sql`
   - Copy ALL the contents
   - Paste into the SQL Editor

4. **Run the Migration:**
   - Click "Run" or press `Cmd/Ctrl + Enter`
   - Wait for completion (should take a few seconds)

5. **Verify Tables Created:**
   - Click "Table Editor" in the left sidebar
   - You should see 6 tables:
     - ✓ profiles
     - ✓ inscriptions
     - ✓ masterclasses
     - ✓ questions
     - ✓ tests
     - ✓ user_roles

### Option 2: Using Supabase CLI

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref apqpsyugdmvrzaprugvw

# Apply migration
supabase db push
```

## 🔍 Verify Setup

After applying the migration, verify:

1. **Tables exist** - Check Table Editor
2. **RLS is enabled** - Each table should show "RLS enabled" badge
3. **Policies are created** - Click on a table → Policies tab

## 🎯 What Was Created

### Tables (6)
- **profiles** - User personal information
- **inscriptions** - Student registrations
- **masterclasses** - Course information
- **questions** - QCM question bank
- **tests** - Pre/post test results
- **user_roles** - Admin/tutor roles

### Security Features
- Row Level Security (RLS) on all tables
- Role-based access policies
- Proper foreign key relationships
- Indexed columns for performance

### Indexes Created
- `idx_inscriptions_profile_id`
- `idx_inscriptions_masterclass_id`
- `idx_questions_masterclass_id`
- `idx_tests_inscription_id`
- `idx_user_roles_user_id`

## 🚀 Next Steps

Once the database is set up:

```bash
# Start the development server
npm run dev
```

Visit: http://localhost:3000

## 📝 Create First Admin User

After the database is set up, you'll need to create an admin user:

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add user" → "Create new user"
3. Enter email and password
4. Copy the user's UUID
5. Go to SQL Editor and run:

```sql
-- Replace 'USER_UUID_HERE' with the actual UUID
INSERT INTO user_roles (user_id, role)
VALUES ('USER_UUID_HERE', 'admin');
```

Now you can login at: http://localhost:3000/auth/login

## ❓ Troubleshooting

### Migration Fails
- Check if tables already exist (drop them first if needed)
- Ensure you're using the service_role key for admin operations
- Check Supabase logs for detailed error messages

### RLS Policies Not Working
- Verify RLS is enabled on all tables
- Check policy definitions in the Policies tab
- Test with different user roles

### Connection Issues
- Verify `.env.local` has correct credentials
- Check Supabase project is not paused
- Run: `node scripts/test-connection.js`
