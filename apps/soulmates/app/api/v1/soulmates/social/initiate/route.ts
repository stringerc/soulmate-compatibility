import { NextRequest, NextResponse } from 'next/server';

/**
 * API route to initiate social OAuth connections via MCP
 * Returns authorization URLs for user to complete OAuth flow
 */
export async function POST(request: NextRequest) {
  try {
    const { provider } = await request.json();

    if (!provider || !['facebook', 'instagram', 'linkedin', 'spotify'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider' },
        { status: 400 }
      );
    }

    // Authorization URLs from MCP connection initiation
    // These were generated when we called RUBE_MANAGE_CONNECTIONS
    const authUrls: Record<string, string> = {
      facebook: 'https://connect.composio.dev/link/lk_0taXmMWq44I9',
      instagram: 'https://connect.composio.dev/link/lk_oSqoTtvYKW-j',
      linkedin: 'https://connect.composio.dev/link/lk_1H8CaXeY5cqu',
      spotify: '', // Requires client_id and client_secret
    };

    const authUrl = authUrls[provider];

    if (!authUrl) {
      return NextResponse.json(
        { 
          error: `${provider} requires additional configuration`,
          requiresConfig: true,
          message: provider === 'spotify' 
            ? 'Spotify requires client_id and client_secret. Please configure in MCP settings.'
            : 'Provider not configured',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      authUrl,
      provider,
      message: `Authorization URL generated for ${provider}`,
    });
  } catch (error: any) {
    console.error('Social connection initiation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initiate connection' },
      { status: 500 }
    );
  }
}

