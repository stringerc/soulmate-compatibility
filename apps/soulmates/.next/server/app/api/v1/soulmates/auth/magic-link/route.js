"use strict";(()=>{var e={};e.id=2762,e.ids=[2762],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},84770:e=>{e.exports=require("crypto")},6005:e=>{e.exports=require("node:crypto")},71188:(e,t,i)=>{i.r(t),i.d(t,{originalPathname:()=>y,patchFetch:()=>v,requestAsyncStorage:()=>x,routeModule:()=>g,serverHooks:()=>b,staticGenerationAsyncStorage:()=>h});var o={};i.r(o),i.d(o,{POST:()=>m});var n=i(63036),r=i(5736),a=i(15262),s=i(60942),l=i(66205),p=i(84770),d=i(39526);let c=process.env.NEXTAUTH_SECRET||process.env.JWT_SECRET||process.env.JWT_SECRET_KEY||"fallback-secret-change-in-production-use-strong-random-key",u=new Map;async function m(e){try{let t;let{email:i,callback_url:o}=await e.json();if(!i||"string"!=typeof i||!i.includes("@"))return s.NextResponse.json({detail:"Valid email address is required"},{status:400});let n=i.toLowerCase().trim(),r=(0,p.randomUUID)(),a=Date.now()+9e5,m=await new l.N({sub:r,email:n,type:"magic_link",exp:Math.floor(a/1e3)}).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("15m").sign(new TextEncoder().encode(c));u.set(r,{email:n,expiresAt:a,callbackUrl:o});let g=process.env.NEXT_PUBLIC_FRONTEND_URL||process.env.NEXTAUTH_URL||process.env.FRONTEND_URL||e.headers.get("origin")||"http://localhost:3000",x=o||"/me",h=`${g}/auth/callback?token=${encodeURIComponent(m)}&callback_url=${encodeURIComponent(x)}`,b=process.env.RESEND_API_KEY,y="development"===process.env.ENVIRONMENT||!b,v=!1;if(b&&!y)try{let e=new d.R(b),i=process.env.RESEND_FROM_EMAIL||process.env.FROM_EMAIL||"onboarding@resend.dev",o=await e.emails.send({from:`Soulmate Compatibility <${i}>`,to:n,subject:"Sign In to Soulmate Compatibility - Secure Link",html:`
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Your Magic Link</title>
              </head>
              <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 24px;">✨ Your Magic Link</h1>
                </div>
                <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
                  <p style="font-size: 16px; margin-bottom: 20px;">Hello!</p>
                  <p style="font-size: 16px; margin-bottom: 20px;">Click the button below to sign in to your Soulmate Compatibility account. This link will expire in 15 minutes.</p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${h}" style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">Sign In Securely</a>
                  </div>
                  <p style="font-size: 14px; color: #6b7280; margin-top: 30px; margin-bottom: 10px;">Or copy and paste this link into your browser:</p>
                  <p style="font-size: 12px; color: #9ca3af; word-break: break-all; background: white; padding: 10px; border-radius: 4px; border: 1px solid #e5e7eb;">${h}</p>
                  <p style="font-size: 12px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">If you didn't request this link, you can safely ignore this email.</p>
                </div>
              </body>
            </html>
          `,text:`Sign in to Soulmate Compatibility

Click this link to sign in: ${h}

This link expires in 15 minutes.

If you didn't request this link, you can safely ignore this email.`});o.data?.id?(v=!0,console.log(`✅ Email sent via Resend to ${n} (ID: ${o.data.id})`)):(console.warn(`⚠️ Resend returned no email ID:`,o.error),t=h)}catch(e){console.error("❌ Error sending email via Resend:",e),t=h}else t=h,console.log(`🔗 Magic link for ${n}: ${h}`);return s.NextResponse.json({success:!0,message:v?"Magic link sent to your email":y?"Development mode: use the link below":"Magic link generated (email service not configured)",dev_link:t,email_sent:v})}catch(e){return console.error("Error generating magic link:",e),s.NextResponse.json({detail:e instanceof Error?e.message:"An unexpected error occurred. Please try again.",error:"Internal Server Error"},{status:500})}}setInterval(()=>{let e=Date.now();for(let[t,i]of u.entries())i.expiresAt<e&&u.delete(t)},3e5);let g=new n.AppRouteRouteModule({definition:{kind:r.x.APP_ROUTE,page:"/api/v1/soulmates/auth/magic-link/route",pathname:"/api/v1/soulmates/auth/magic-link",filename:"route",bundlePath:"app/api/v1/soulmates/auth/magic-link/route"},resolvedPagePath:"/Users/Apple/Documents/soul mate/apps/soulmates/app/api/v1/soulmates/auth/magic-link/route.ts",nextConfigOutput:"",userland:o}),{requestAsyncStorage:x,staticGenerationAsyncStorage:h,serverHooks:b}=g,y="/api/v1/soulmates/auth/magic-link/route";function v(){return(0,a.patchFetch)({serverHooks:b,staticGenerationAsyncStorage:h})}}};var t=require("../../../../../../webpack-runtime.js");t.C(e);var i=e=>t(t.s=e),o=t.X(0,[1193,1746,9526,6205],()=>i(71188));module.exports=o})();