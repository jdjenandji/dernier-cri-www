# Supabase Setup Instructions

## 1. Create Supabase Project

1. Go to https://supabase.com and create a new project
2. Save your project URL and anon key

## 2. Run Migration

1. In your Supabase dashboard, go to the SQL Editor
2. Copy the contents of `migrations/001_initial_schema.sql`
3. Paste and run the SQL in the editor
4. Verify the `stations` table is created with 15 initial stations

## 3. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`
2. Update the values with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 4. Update Stream URLs (Important!)

The seeded stations include placeholder stream URLs. You'll need to update these with actual working stream URLs:

1. Research each station's actual streaming URL
2. Test each URL to ensure it works
3. Update the `stream_url` column in the `stations` table

## 5. Test Data Fetching

Run the development server and check that stations are loading:

```bash
npm run dev
```

## Notes

- The RLS policy allows public read access to active stations
- Use `is_active = false` to temporarily disable broken streams
- Update `display_order` to change the station sequence
