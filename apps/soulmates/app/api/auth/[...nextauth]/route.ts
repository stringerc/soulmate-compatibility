import NextAuth, { NextAuthOptions } from "next-auth";
import Auth0Provider from "next-auth/providers/auth0";
import GoogleProvider from "next-auth/providers/google";

/**
 * NextAuth.js Configuration with Auth0 and Google OAuth
 * 
 * Supports both Auth0 (if configured) and Google OAuth (direct)
 * Falls back to Google OAuth if Auth0 is not configured
 */
const authOptions: NextAuthOptions = {
  providers: [
    // Auth0 Provider (preferred - handles OAuth complexity)
    // Auth0 makes Google OAuth much easier - no redirect URI config needed!
    ...(process.env.AUTH0_CLIENT_ID && 
        process.env.AUTH0_CLIENT_SECRET && 
        process.env.AUTH0_DOMAIN
      ? [
          Auth0Provider({
            clientId: process.env.AUTH0_CLIENT_ID,
            clientSecret: process.env.AUTH0_CLIENT_SECRET,
            issuer: process.env.AUTH0_ISSUER || `https://${process.env.AUTH0_DOMAIN}`,
            authorization: {
              params: {
                prompt: "login",
              },
            },
          }),
        ]
      : []),
    
    // Fallback: Direct Google OAuth (if Auth0 not configured)
    ...(!process.env.AUTH0_CLIENT_ID && 
        process.env.GOOGLE_CLIENT_ID && 
        process.env.GOOGLE_CLIENT_SECRET && 
        process.env.GOOGLE_CLIENT_ID !== "" && 
        process.env.GOOGLE_CLIENT_SECRET !== ""
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // Initial sign in
      if (account && user) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
        token.provider = account.provider;
        
        // Store user ID from Auth0 or Google
        if (account.provider === "auth0" && account.providerAccountId) {
          token.userId = account.providerAccountId;
        } else if (user.id) {
          token.userId = user.id;
        } else if (profile?.sub) {
          token.userId = profile.sub;
        }
        
        // Store email
        if (user.email) {
          token.email = user.email;
        } else if (profile?.email) {
          token.email = profile.email;
        }
      }
      
      return token;
    },
    
    async session({ session, token }) {
      // Add token data to session
      if (token) {
        session.accessToken = token.accessToken as string;
        session.userId = token.userId as string;
        session.provider = token.provider as string;
      }
      
      return session;
    },
    
    async signIn({ user, account, profile }) {
      // Allow all sign-ins
      // You can add custom logic here (e.g., domain restrictions)
      return true;
    },
  },
  
  pages: {
    signIn: "/login",
    error: "/login", // Error page
  },
  
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "fallback-secret-change-in-production",
  
  // Debug mode in development
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

