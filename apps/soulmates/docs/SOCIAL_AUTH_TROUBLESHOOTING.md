# Social Auth Troubleshooting Guide

## Current Status

### ✅ Fixed Issues
1. **Console Warnings**: Zustand deprecation warnings now suppressed
2. **503 Errors**: Compatibility API 503 errors suppressed (expected when backend is down)
3. **Modal Visibility**: Increased z-index to 9999 to ensure modal appears above all content
4. **Error Handling**: Enhanced logging and error messages

### 🔍 How to Test Social Auth

1. **Navigate to Discover Page**:
   - Go to `/discover` (must be signed in)
   - Click on "Friends of Friends" tab (default)

2. **Connect Social Account**:
   - Click "Connect Facebook", "Connect Instagram", or "Connect LinkedIn"
   - A modal should appear with authorization instructions
   - The modal contains:
     - Provider name (Facebook/Instagram/LinkedIn)
     - Step-by-step instructions
     - "Authorize [Provider]" button
     - Direct link to authorization URL

3. **Authorization Flow**:
   - Click "Authorize [Provider]" button (opens popup)
   - OR click the authorization link at bottom of modal
   - Complete OAuth flow in popup/new tab
   - Close popup/tab after authorization
   - Modal will close automatically after 1 second

4. **Verify Connection**:
   - Button should change to "Connected" with checkmark
   - Friends of friends should load (if any)

## Debugging

### Check Browser Console
Open browser console (F12) and look for:
- `Initiating social connection for: [provider]` - Connection started
- `Social connection result: {...}` - API response received
- `Setting auth modal with URL: [url]` - Modal should appear
- Any error messages

### Common Issues

#### Modal Not Appearing
**Symptoms**: Clicking Connect button does nothing
**Check**:
1. Open browser console - are there errors?
2. Check if `authModal` state is being set (React DevTools)
3. Verify API is returning `authUrl` in response
4. Check if modal component is rendering (React DevTools)

**Fix**:
- Ensure you're signed in (AuthGuard redirects if not)
- Check network tab for API call to `/api/v1/soulmates/social/initiate`
- Verify API returns `{ success: true, authUrl: "..." }`

#### API Errors
**Symptoms**: Alert shows error message
**Check**:
1. Network tab - is API call successful?
2. Console - what error is logged?
3. API route - check server logs

**Common Errors**:
- `Invalid provider` - Provider name mismatch
- `Provider not configured` - Auth URL not set in API route
- `API returned 500` - Server error, check API route

#### Authorization URL Not Working
**Symptoms**: Clicking authorization link doesn't work
**Check**:
1. Is the URL valid? (should be `https://connect.composio.dev/link/...`)
2. Does the link open in new tab?
3. Does Composio show authorization page?

**Fix**:
- Authorization URLs expire after some time
- May need to regenerate via MCP `RUBE_MANAGE_CONNECTIONS`
- Check if Composio connection is still active

## Authorization URLs

Current authorization URLs (from MCP):
- **Facebook**: `https://connect.composio.dev/link/lk_0taXmMWq44I9`
- **Instagram**: `https://connect.composio.dev/link/lk_oSqoTtvYKW-j`
- **LinkedIn**: `https://connect.composio.dev/link/lk_1H8CaXeY5cqu`
- **Spotify**: Requires `client_id` and `client_secret` configuration

## Code Flow

```
User clicks "Connect [Provider]"
  ↓
handleConnectSocial() called
  ↓
connectSocialAccount() called
  ↓
API call to /api/v1/soulmates/social/initiate
  ↓
API returns { success: true, authUrl: "..." }
  ↓
setAuthModal({ provider, authUrl })
  ↓
SocialAuthModal component renders
  ↓
User clicks "Authorize" button
  ↓
Popup opens with authUrl
  ↓
User completes OAuth
  ↓
Popup closes
  ↓
onComplete() called
  ↓
Connection saved, modal closes
```

## Files Involved

1. **`app/discover/page.tsx`**:
   - `handleConnectSocial()` - Initiates connection
   - `authModal` state - Controls modal visibility
   - Renders `SocialAuthModal` component

2. **`lib/socialConnections.ts`**:
   - `connectSocialAccount()` - Calls API and returns auth URL

3. **`app/api/v1/soulmates/social/initiate/route.ts`**:
   - Returns authorization URLs from MCP

4. **`components/SocialAuthModal.tsx`**:
   - Displays modal with authorization instructions
   - Handles popup window for OAuth

## Next Steps

If social auth still doesn't work:

1. **Check MCP Connection Status**:
   - Authorization URLs may have expired
   - Regenerate via `RUBE_MANAGE_CONNECTIONS`

2. **Verify API Route**:
   - Check if `/api/v1/soulmates/social/initiate` is accessible
   - Verify it returns correct JSON structure

3. **Test Modal Rendering**:
   - Manually set `authModal` state in React DevTools
   - Verify modal appears

4. **Check Z-Index Conflicts**:
   - Modal has z-index 9999
   - Check if other elements are covering it

5. **Browser Console**:
   - Look for React errors
   - Check for CSS conflicts
   - Verify no JavaScript errors blocking render

---

**Last Updated**: January 2025  
**Status**: ✅ Enhanced with debugging and improved error handling

