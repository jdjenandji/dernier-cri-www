# Deployment Guide

## Prerequisites

Before deploying, ensure you have:
1. A Supabase project with the database schema deployed
2. Working radio station stream URLs configured in your database
3. A Git repository with your code

## Step 1: Set Up Supabase

### Create Supabase Project

1. Go to https://supabase.com and sign up/log in
2. Create a new project
3. Wait for the project to be provisioned (~2 minutes)
4. Save your project credentials:
   - Project URL (found in Settings > API)
   - Anon/Public Key (found in Settings > API)

### Deploy Database Schema

1. Open the Supabase SQL Editor
2. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
3. Paste and execute the SQL
4. Verify the `stations` table was created with 15 rows

### Update Stream URLs

The seeded data contains placeholder stream URLs. You need to update these with actual working streams:

```sql
-- Example: Update Radio Nova stream URL
UPDATE stations
SET stream_url = 'https://novazz.ice.infomaniak.ch/novazz-128.mp3'
WHERE name = 'Radio Nova';
```

To find working stream URLs:
- Check each station's official website
- Use browser developer tools to inspect their web player
- Look for .mp3, .aac, or .m3u8 stream URLs
- Test URLs in VLC or browser to verify they work

### Important: Stream URL Requirements

- Must be publicly accessible (no authentication)
- Should be HTTPS (not HTTP)
- Prefer MP3 or AAC formats for broad browser support
- Avoid HLS (.m3u8) streams if possible (requires additional setup)

## Step 2: Deploy to Vercel

### Connect Repository

1. Push your code to GitHub:
```bash
git add .
git commit -m "Initial commit: dernier cri live"
git push origin main
```

2. Go to https://vercel.com and sign up/log in
3. Click "Add New" → "Project"
4. Import your GitHub repository
5. Vercel will auto-detect Next.js settings

### Configure Environment Variables

In the Vercel project settings, add:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Important:** Do NOT commit `.env.local` to Git. These values should only be in Vercel.

### Deploy

1. Click "Deploy"
2. Wait for build to complete (~2 minutes)
3. Visit your deployed URL

## Step 3: Verify Deployment

Test the following:

### Basic Functionality
- [ ] App loads and shows "Tap to start" screen
- [ ] Clicking "Tap to start" begins audio playback
- [ ] Audio plays within 3 seconds
- [ ] Station name and logo are visible

### Navigation
- [ ] Swipe up goes to next station
- [ ] Swipe down goes to previous station
- [ ] Arrow keys work (desktop)
- [ ] Mouse wheel/trackpad scroll works
- [ ] Smooth crossfade between stations (~2 seconds)

### Error Handling
- [ ] Broken stream auto-skips after timeout
- [ ] Error message displays clearly
- [ ] App recovers and continues playing

### Mobile
- [ ] Works on iOS Safari
- [ ] Works on Android Chrome
- [ ] Touch swipe gestures work
- [ ] Audio continues in background

## Step 4: Custom Domain (Optional)

1. In Vercel project settings, go to "Domains"
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for DNS propagation (~24 hours max)

## Step 5: Post-Launch Monitoring

### Analytics Setup (Optional)

Add Vercel Analytics:
```bash
npm install @vercel/analytics
```

Update `app/layout.tsx`:
```tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Monitor Performance

Watch for:
- Error rates in Vercel dashboard
- Load times (should be <3s on 4G)
- User feedback on stream quality
- Station availability issues

## Troubleshooting

### "No stations available" error

**Cause:** Supabase credentials are incorrect or database is empty

**Solution:**
1. Verify environment variables in Vercel
2. Check Supabase project is active
3. Verify stations table has data with `is_active = true`

### Streams not playing

**Cause:** CORS issues or invalid stream URLs

**Solution:**
1. Test stream URLs directly in browser
2. Check browser console for CORS errors
3. Update stream URLs to HTTPS versions
4. Some streams may block web playback - replace them

### Audio autoplay blocked

**Cause:** Browser autoplay policies

**Solution:**
This is expected. The "Tap to start" screen handles this correctly.
User must interact with the page before audio can play.

### Crossfade glitches

**Cause:** Web Audio API issues or network problems

**Solution:**
1. Check browser compatibility (Chrome, Safari, Firefox latest versions)
2. Test on stable network connection
3. Verify stream bitrates are reasonable (<256kbps)

### Build fails

**Cause:** Missing dependencies or type errors

**Solution:**
1. Run `npm install` locally
2. Run `npm run build` to test
3. Check error messages for specific issues
4. Verify all imports are correct

## Performance Optimization

### Lighthouse Audit

Run Lighthouse audit and aim for:
- Performance: 90+
- Accessibility: 100
- Best Practices: 90+
- SEO: 90+

### Image Optimization

Station logos are optimized automatically by Next.js Image component.
Ensure logos are:
- Under 100KB each
- Square aspect ratio (1:1)
- Minimum 192x192px, maximum 512x512px

### Bundle Size

Current bundle:
- Main page: ~161KB First Load JS
- Target: <200KB total

Monitor bundle size with:
```bash
npm run build
```

## Scaling Considerations

### Adding More Stations

1. Insert new rows in Supabase `stations` table
2. Set unique `display_order` value
3. Ensure `is_active = true`
4. No redeployment needed (data is fetched at runtime)

### Traffic Scaling

Vercel automatically scales:
- Static assets via CDN
- Server functions (if added later)
- Database connections handled by Supabase

### Cost Estimates

Free tier limits:
- **Vercel:** 100GB bandwidth/month, unlimited deployments
- **Supabase:** 500MB database, 2GB bandwidth, 50,000 monthly active users

Paid tiers start at:
- **Vercel Pro:** $20/month (1TB bandwidth)
- **Supabase Pro:** $25/month (8GB database, 250GB bandwidth)

## Next Steps

After successful deployment:

1. **Test thoroughly** across devices and browsers
2. **Update stream URLs** regularly (stations change URLs sometimes)
3. **Monitor error rates** in Vercel dashboard
4. **Gather user feedback** via Product Hunt, Reddit, etc.
5. **Iterate on station catalog** based on user preferences

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Check Supabase logs
3. Test locally with `npm run dev`
4. Review browser console for errors
5. Open an issue on GitHub

## Security Notes

- Never commit `.env.local` to Git
- Supabase anon key is safe to expose (RLS policies protect data)
- No user authentication in MVP (no sensitive data)
- All streams are public radio stations (no licensing issues for embedding)

## Maintenance

### Regular Tasks

- **Weekly:** Check that all station streams are working
- **Monthly:** Review Vercel/Supabase usage and costs
- **Quarterly:** Update dependencies (`npm update`)
- **As needed:** Add/remove stations based on availability

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update all dependencies
npm update

# Test after updating
npm run build
npm run dev
```

## Rollback Procedure

If a deployment fails:

1. Go to Vercel project dashboard
2. Click "Deployments"
3. Find the last working deployment
4. Click "..." menu → "Promote to Production"

## Backup

### Database Backup

Supabase provides automatic backups on paid plans.

Manual backup:
1. Go to Supabase SQL Editor
2. Run: `SELECT * FROM stations;`
3. Export results as CSV
4. Store in safe location

### Code Backup

Code is backed up in Git repository. Ensure:
- Regular commits
- Push to GitHub frequently
- Consider enabling branch protection

---

**Congratulations!** Your radio streaming app is now live. 🎉
