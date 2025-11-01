# Google reCAPTCHA v3 Setup Guide

## Overview
This guide explains how to set up Google reCAPTCHA v3 for the contact form to prevent spam submissions. reCAPTCHA v3 works invisibly in the background without requiring any user interaction.

## Why reCAPTCHA v3?
- **Invisible Protection**: No user interaction required - works seamlessly in the background
- **Score-Based Detection**: Uses risk analysis (0.0-1.0) instead of challenges
- **Better UX**: Users never see a checkbox or challenge
- **Adaptive**: Learns from user behavior patterns across your site
- **Always Active**: Protects all form submissions automatically

## Setup Steps

### 1. Get reCAPTCHA v3 Keys

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Click **"+"** to register a new site
3. Fill in the form:
   - **Label**: `Cursuri Contact Form v3` (or your preferred name)
   - **reCAPTCHA type**: Select **reCAPTCHA v3**
   - **Domains**: Add your domains:
     - `localhost` (for development)
     - `cursuri.dev` (your production domain)
     - Any other domains you use
4. Accept the reCAPTCHA Terms of Service
5. Click **Submit**

### 2. Copy Your Keys

After registration, you'll receive:
- **Site Key** (public key - used in frontend)
- **Secret Key** (private key - keep secure!)

### 3. Add Keys to Environment Variables

1. Open your `.env.local` file (create it if it doesn't exist)
2. Add the following lines:

```env
# Google reCAPTCHA Configuration (v3 - invisible)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_v3_site_key_here
RECAPTCHA_SECRET_KEY=your_v3_secret_key_here
```

3. Replace `your_v3_site_key_here` and `your_v3_secret_key_here` with your actual v3 keys

### 4. Restart Development Server

```bash
npm run dev
```

## Implementation Details

### Contact Form Behavior

**For All Users (Anonymous & Authenticated):**
- reCAPTCHA v3 runs invisibly in the background
- No visible widget or checkbox
- No user interaction required
- Seamless form submission experience
- Risk score calculated automatically

**How v3 Works:**
- Analyzes user behavior without interruption
- Generates a score from 0.0 (bot) to 1.0 (human)
- Score can be used server-side for additional validation
- No impact on user experience

### Technical Implementation

The implementation includes:
- `react-google-recaptcha-v3` package for React integration
- GoogleReCaptchaProvider wrapping the contact form
- Automatic token generation on form submission
- Invisible operation - no UI elements
- Token included with form data for server-side validation (future)

### Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit keys to version control**
   - Keys are in `.env.local` which is gitignored
   - Use `.env.example` for documentation only

2. **Secret Key Protection**
   - The secret key should NEVER be exposed to the frontend
   - It's only used for server-side validation (future implementation)

3. **Domain Restrictions**
   - Configure allowed domains in reCAPTCHA admin console
   - This prevents unauthorized use of your keys

## Testing

### Test on Localhost

1. Ensure your `.env.local` has the correct keys
2. Run the development server: `npm run dev`
3. Navigate to the contact page
4. Try submitting the form without being logged in
5. Complete the reCAPTCHA challenge
6. Verify the form submits successfully

### Test on Production

1. Add your production domain to reCAPTCHA admin console
2. Deploy your application with environment variables configured
3. Test the contact form on your live site
4. Monitor submissions in the admin messages panel

## Troubleshooting

### reCAPTCHA Not Showing

**Issue**: reCAPTCHA widget doesn't appear

**Solutions**:
- Check that `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is set in `.env.local`
- Verify you're not logged in (authenticated users don't see reCAPTCHA)
- Check browser console for errors
- Ensure the domain is registered in reCAPTCHA admin console

### "Invalid Site Key" Error

**Issue**: reCAPTCHA shows error about invalid site key

**Solutions**:
- Verify the site key is copied correctly
- Check that `localhost` is added to allowed domains
- Ensure you're using the Site Key (not the Secret Key)

### Submit Button Always Disabled

**Issue**: Cannot submit form even after completing reCAPTCHA

**Solutions**:
- Check browser console for JavaScript errors
- Verify reCAPTCHA token is being set (check network tab)
- Try clearing browser cache and reloading

### reCAPTCHA in Wrong Language

**Issue**: reCAPTCHA displays in wrong language

**Solution**:
- reCAPTCHA auto-detects language based on browser settings
- You can override by adding `hl` parameter to the script URL

## Future Enhancements

Consider implementing these improvements:

1. **Server-Side Verification**
   - Add API endpoint to verify reCAPTCHA tokens server-side
   - Prevents client-side bypass attempts

2. **Invisible reCAPTCHA**
   - Upgrade to invisible reCAPTCHA for better UX
   - Challenges only shown when suspicious activity detected

3. **reCAPTCHA v3**
   - Risk-based scoring system
   - No user interaction required
   - More sophisticated bot detection

4. **Rate Limiting**
   - Combine with rate limiting to prevent abuse
   - Implement using Firebase security rules or middleware

## References

- [Google reCAPTCHA Documentation](https://developers.google.com/recaptcha/docs/display)
- [react-google-recaptcha GitHub](https://github.com/dozoisch/react-google-recaptcha)
- [reCAPTCHA Best Practices](https://developers.google.com/recaptcha/docs/faq)

## Support

If you encounter issues:
1. Check this documentation first
2. Review browser console for errors
3. Verify environment variables are set correctly
4. Check Firebase logs for submission errors
5. Consult the admin messages panel for successful submissions
