# Social OAuth Setup Guide

## Overview

Social media OAuth integrations are now automated using MCP (Model Context Protocol) tools via Composio. This eliminates the need for manual OAuth configuration and handles the entire flow automatically.

## Current Status

### ✅ Configured and Ready
- **Facebook**: Authorization URL generated
- **Instagram**: Authorization URL generated  
- **LinkedIn**: Authorization URL generated

### ⚠️ Requires Configuration
- **Spotify**: Requires `client_id`, `client_secret`, and `base_url` parameters

## Authorization URLs

The following authorization URLs have been generated via MCP:

### Facebook
**Authorization URL**: [https://connect.composio.dev/link/lk_0taXmMWq44I9](https://connect.composio.dev/link/lk_0taXmMWq44I9)

**Steps**:
1. User clicks "Connect Facebook" on `/discover` page
2. Modal opens with authorization link
3. User authorizes in popup window
4. Connection is automatically saved
5. Friends list is fetched and stored

### Instagram
**Authorization URL**: [https://connect.composio.dev/link/lk_oSqoTtvYKW-j](https://connect.composio.dev/link/lk_oSqoTtvYKW-j)

**Steps**:
1. User clicks "Connect Instagram" on `/discover` page
2. Modal opens with authorization link
3. User authorizes in popup window
4. Connection is automatically saved
5. Connections are fetched and stored

### LinkedIn
**Authorization URL**: [https://connect.composio.dev/link/lk_1H8CaXeY5cqu](https://connect.composio.dev/link/lk_1H8CaXeY5cqu)

**Steps**:
1. User clicks "Connect LinkedIn" on `/discover` page
2. Modal opens with authorization link
3. User authorizes in popup window
4. Connection is automatically saved
5. Connections are fetched and stored

## Spotify Configuration

Spotify requires additional parameters. To configure:

1. **Get Spotify API Credentials**:
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new app
   - Get `client_id` and `client_secret`
   - Set redirect URI: `https://soulmates.syncscript.app/api/v1/soulmates/social/callback`

2. **Configure in MCP**:
   ```bash
   # Use RUBE_MANAGE_CONNECTIONS with custom auth
   {
     "toolkit": "spotify",
     "client_id": "your_spotify_client_id",
     "client_secret": "your_spotify_client_secret",
     "full": "https://api.spotify.com/v1"
   }
   ```

## How It Works

### Architecture

1. **Frontend** (`/discover` page):
   - User clicks "Connect [Provider]"
   - Calls `/api/v1/soulmates/social/initiate`
   - Receives authorization URL
   - Shows `SocialAuthModal` with link

2. **API Route** (`/api/v1/soulmates/social/initiate`):
   - Returns pre-generated authorization URLs
   - URLs are from MCP connection initiation

3. **MCP Tools** (Composio):
   - Handles OAuth flow automatically
   - Stores tokens securely
   - Provides API access

4. **Callback Handler** (Future):
   - Will handle OAuth callback
   - Store tokens in backend
   - Fetch friends/connections
   - Update user's social graph

### Data Flow

```
User clicks "Connect" 
  → API returns auth URL
  → Modal shows authorization link
  → User authorizes in popup
  → MCP handles callback
  → Tokens stored automatically
  → Friends/connections fetched
  → Stored in localStorage (temporary)
  → Synced to backend (future)
```

## Implementation Details

### Files Created/Modified

1. **`lib/mcpSocialConnections.ts`**:
   - MCP-based social connection utilities
   - Handles OAuth initiation
   - Fetches connections via MCP tools

2. **`lib/socialConnections.ts`**:
   - Updated to use MCP-based connections
   - Falls back to mock data if MCP unavailable

3. **`lib/sharedInterests.ts`**:
   - Updated Spotify connection to use MCP
   - Handles OAuth flow

4. **`components/SocialAuthModal.tsx`**:
   - Modal component for OAuth authorization
   - Opens authorization in popup window
   - Handles completion callback

5. **`app/api/v1/soulmates/social/initiate/route.ts`**:
   - API route that returns authorization URLs
   - Uses pre-generated URLs from MCP

6. **`app/discover/page.tsx`**:
   - Updated to show auth modal
   - Handles OAuth completion

## Next Steps

### Immediate
1. ✅ Authorization URLs generated
2. ✅ UI components created
3. ✅ API routes implemented
4. ⏳ User testing of OAuth flow

### Future Enhancements
1. **Backend Token Storage**:
   - Store OAuth tokens securely in database
   - Encrypt sensitive tokens
   - Handle token refresh

2. **Friends/Connections Fetching**:
   - Use MCP tools to fetch friend lists
   - Store in backend database
   - Build social graph

3. **Interest Extraction**:
   - Use Spotify API to get top artists/tracks
   - Convert to interests format
   - Store in user profile

4. **Real-time Updates**:
   - Webhook handlers for connection updates
   - Automatic sync of new connections
   - Update compatibility matches

## Testing

### Manual Testing Steps

1. **Test Facebook Connection**:
   - Navigate to `/discover`
   - Click "Connect Facebook"
   - Verify modal opens with auth URL
   - Click authorization link
   - Complete OAuth flow
   - Verify connection saved

2. **Test Instagram Connection**:
   - Same steps as Facebook
   - Verify Instagram-specific data fetched

3. **Test LinkedIn Connection**:
   - Same steps as Facebook
   - Verify LinkedIn-specific data fetched

4. **Test Spotify Connection**:
   - Configure Spotify credentials first
   - Follow same steps
   - Verify music interests extracted

## Troubleshooting

### Authorization URL Not Working
- Check if URL is still valid (may expire)
- Re-initiate connection via MCP if needed
- Verify MCP server is running

### Connection Not Saving
- Check browser console for errors
- Verify localStorage is accessible
- Check API route responses

### Spotify Configuration Issues
- Verify client_id and client_secret are correct
- Check redirect URI matches Spotify app settings
- Ensure base_url is set correctly

## Security Considerations

1. **Token Storage**:
   - Currently: localStorage (temporary)
   - Future: Encrypted backend storage

2. **OAuth Scopes**:
   - Request minimal required scopes
   - Only access necessary data

3. **Privacy**:
   - User must explicitly authorize
   - Clear privacy policy
   - Opt-in only

## Support

For issues or questions:
- Check MCP connection status
- Verify authorization URLs are valid
- Review API route logs
- Check browser console for errors

---

**Last Updated**: January 2025  
**Status**: ✅ Ready for Testing

