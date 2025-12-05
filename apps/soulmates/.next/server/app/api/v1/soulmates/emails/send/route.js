"use strict";(()=>{var e={};e.id=570,e.ids=[570],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},6005:e=>{e.exports=require("node:crypto")},66483:(e,t,o)=>{o.r(t),o.d(t,{originalPathname:()=>R,patchFetch:()=>k,requestAsyncStorage:()=>w,routeModule:()=>v,serverHooks:()=>j,staticGenerationAsyncStorage:()=>z});var i={};o.r(i),o.d(i,{POST:()=>h});var s=o(63036),r=o(5736),n=o(15262),a=o(60942),l=o(39526);function p(e,t,o){let i=t&&o?`
    <div style="text-align: center; margin: 30px 0;">
      <a href="${o}" style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">${t}</a>
    </div>
  `:"",s=`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Soulmate Compatibility</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">✨ Soulmate Compatibility</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
          ${e}
          ${i}
          <p style="font-size: 12px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            Questions? Reply to this email or visit <a href="https://soulmates.syncscript.app" style="color: #ec4899;">soulmates.syncscript.app</a>
          </p>
        </div>
      </body>
    </html>
  `,r=e.replace(/<[^>]*>/g,"").replace(/\n\s*\n/g,"\n\n");return{html:s,text:`Soulmate Compatibility

${r}${t&&o?`

${t}: ${o}`:""}

Questions? Visit https://soulmates.syncscript.app`,subject:""}}let u=process.env.RESEND_API_KEY,m=process.env.RESEND_FROM_EMAIL||process.env.FROM_EMAIL||"onboarding@resend.dev",c=u?new l.R(u):null;async function d(e,t,o,i){if(!c)return console.warn("Resend not configured, email not sent"),{success:!1,error:"Email service not configured"};try{let s=await c.emails.send({from:`Soulmate Compatibility <${m}>`,to:e,subject:t,html:o,text:i});if(s.data?.id)return{success:!0,messageId:s.data.id};return{success:!1,error:s.error?.message||"Unknown error"}}catch(e){return console.error("Error sending email:",e),{success:!1,error:e.message||"Failed to send email"}}}async function y(e,t){let o=function(e){let t=e?` ${e}`:"",o=p(`
    <p style="font-size: 16px; margin-bottom: 20px;">Hello${t}!</p>
    <p style="font-size: 16px; margin-bottom: 20px;">
      Welcome to Soulmate Compatibility! 🎉 We're thrilled to have you join our community of people discovering deeper connections through compatibility insights.
    </p>
    <p style="font-size: 16px; margin-bottom: 20px;">
      <strong>What's next?</strong>
    </p>
    <ul style="font-size: 16px; margin-bottom: 20px; padding-left: 20px;">
      <li style="margin-bottom: 10px;">Take our interactive StoryQuest test to discover your compatibility archetype</li>
      <li style="margin-bottom: 10px;">Explore how you connect with different personality types</li>
      <li style="margin-bottom: 10px;">Track your relationship journey and growth</li>
    </ul>
    <p style="font-size: 16px; margin-bottom: 20px;">
      Ready to begin? Your journey starts with understanding yourself first.
    </p>
  `,"Start Your Compatibility Journey","https://soulmates.syncscript.app/onboarding");return o.subject="Welcome to Soulmate Compatibility! ✨",o}(t);return d(e,o.subject,o.html,o.text)}async function g(e,t){let o=function(e){let t=e?` ${e}`:"",o=p(`
    <p style="font-size: 16px; margin-bottom: 20px;">Hello${t}!</p>
    <p style="font-size: 16px; margin-bottom: 20px;">
      Great news! 🎉 You've completed your compatibility test, and your results are ready to view.
    </p>
    <p style="font-size: 16px; margin-bottom: 20px;">
      <strong>Your results include:</strong>
    </p>
    <ul style="font-size: 16px; margin-bottom: 20px; padding-left: 20px;">
      <li style="margin-bottom: 10px;">✨ Your unique compatibility archetype</li>
      <li style="margin-bottom: 10px;">💝 Your attachment style and love languages</li>
      <li style="margin-bottom: 10px;">📊 Detailed compatibility breakdowns</li>
      <li style="margin-bottom: 10px;">🔮 Insights for deeper relationships</li>
    </ul>
    <p style="font-size: 16px; margin-bottom: 20px;">
      Sign in now to unlock your complete results and save them to your account. Your test data is saved for 7 days, so don't miss out!
    </p>
  `,"View Your Results","https://soulmates.syncscript.app/login?callbackUrl="+encodeURIComponent("/onboarding?showResults=true"));return o.subject="Your Compatibility Results Are Ready! \uD83C\uDF89",o}(t);return d(e,o.subject,o.html,o.text)}async function x(e,t,o){let i=function(e,t){let o=e?` ${e}`:"",i=t?` You're a <strong>${t}</strong>!`:"",s=p(`
    <p style="font-size: 16px; margin-bottom: 20px;">Hello${o}!</p>
    <p style="font-size: 16px; margin-bottom: 20px;">
      Welcome back! 🎉 Your compatibility profile has been saved to your account.${i}
    </p>
    <p style="font-size: 16px; margin-bottom: 20px;">
      <strong>What you can do now:</strong>
    </p>
    <ul style="font-size: 16px; margin-bottom: 20px; padding-left: 20px;">
      <li style="margin-bottom: 10px;">📊 View your complete compatibility profile</li>
      <li style="margin-bottom: 10px;">🔍 Explore compatibility with different archetypes</li>
      <li style="margin-bottom: 10px;">💑 Try Couple Mode with a partner</li>
      <li style="margin-bottom: 10px;">📝 Track your relationship journey</li>
    </ul>
    <p style="font-size: 16px; margin-bottom: 20px;">
      Your data is now safely stored and accessible from any device. Start exploring!
    </p>
  `,"Go to Dashboard","https://soulmates.syncscript.app/me");return s.subject="Your Profile is Ready! ✨",s}(t,o);return d(e,i.subject,i.html,i.text)}async function b(e,t){let o=function(e){let t=e?` ${e}`:"",o=p(`
    <p style="font-size: 16px; margin-bottom: 20px;">Hello${t}!</p>
    <p style="font-size: 16px; margin-bottom: 20px;">
      We noticed you haven't explored the Compatibility Explorer yet. There's so much waiting for you!
    </p>
    <p style="font-size: 16px; margin-bottom: 20px;">
      <strong>Discover:</strong>
    </p>
    <ul style="font-size: 16px; margin-bottom: 20px; padding-left: 20px;">
      <li style="margin-bottom: 10px;">🔍 How compatible you are with 8 different archetypal profiles</li>
      <li style="margin-bottom: 10px;">💡 Insights into relationship dynamics</li>
      <li style="margin-bottom: 10px;">📈 Detailed compatibility breakdowns</li>
      <li style="margin-bottom: 10px;">🎯 Personalized recommendations</li>
    </ul>
    <p style="font-size: 16px; margin-bottom: 20px;">
      Each exploration reveals new insights about yourself and your relationships. Start your journey today!
    </p>
  `,"Explore Compatibility","https://soulmates.syncscript.app/explore");return o.subject="Discover Your Compatibility Matches \uD83D\uDD0D",o}(t);return d(e,o.subject,o.html,o.text)}async function f(e,t){let o=function(e){let t=e?` ${e}`:"",o=p(`
    <p style="font-size: 16px; margin-bottom: 20px;">Hello${t}!</p>
    <p style="font-size: 16px; margin-bottom: 20px;">
      We miss you! 💜 It's been a while since you've visited Soulmate Compatibility.
    </p>
    <p style="font-size: 16px; margin-bottom: 20px;">
      Relationships evolve, and so do you. Consider retaking the test to see how your compatibility profile has changed, or explore new features we've added:
    </p>
    <ul style="font-size: 16px; margin-bottom: 20px; padding-left: 20px;">
      <li style="margin-bottom: 10px;">💑 Couple Mode - Deep compatibility analysis with a partner</li>
      <li style="margin-bottom: 10px;">🔬 Resonance Lab - Track relationship dynamics over time</li>
      <li style="margin-bottom: 10px;">📝 Soul Journey - Journal your relationship insights</li>
    </ul>
    <p style="font-size: 16px; margin-bottom: 20px;">
      Your journey of self-discovery continues. Come back and explore!
    </p>
  `,"Return to Dashboard","https://soulmates.syncscript.app/me");return o.subject="We Miss You! \uD83D\uDC9C",o}(t);return d(e,o.subject,o.html,o.text)}async function h(e){try{let t;let{email:o,emailType:i,userName:s,archetype:r}=await e.json();if(!o||"string"!=typeof o||!o.includes("@"))return a.NextResponse.json({detail:"Valid email address is required"},{status:400});let n=["welcome","test_completion_reminder","results_access","engagement","reengagement"];if(!i||!n.includes(i))return a.NextResponse.json({detail:`Valid emailType required. Must be one of: ${n.join(", ")}`},{status:400});let l=o.toLowerCase().trim();switch(i){case"welcome":t=await y(l,s);break;case"test_completion_reminder":t=await g(l,s);break;case"results_access":t=await x(l,s,r);break;case"engagement":t=await b(l,s);break;case"reengagement":t=await f(l,s);break;default:return a.NextResponse.json({detail:"Invalid email type"},{status:400})}if(t.success)return a.NextResponse.json({success:!0,message:"Email sent successfully",messageId:t.messageId});return a.NextResponse.json({detail:t.error||"Failed to send email",error:"Email sending failed"},{status:500})}catch(e){return console.error("Error sending email:",e),a.NextResponse.json({detail:e instanceof Error?e.message:"An unexpected error occurred",error:"Internal Server Error"},{status:500})}}let v=new s.AppRouteRouteModule({definition:{kind:r.x.APP_ROUTE,page:"/api/v1/soulmates/emails/send/route",pathname:"/api/v1/soulmates/emails/send",filename:"route",bundlePath:"app/api/v1/soulmates/emails/send/route"},resolvedPagePath:"/Users/Apple/Documents/soul mate/apps/soulmates/app/api/v1/soulmates/emails/send/route.ts",nextConfigOutput:"",userland:i}),{requestAsyncStorage:w,staticGenerationAsyncStorage:z,serverHooks:j}=v,R="/api/v1/soulmates/emails/send/route";function k(){return(0,n.patchFetch)({serverHooks:j,staticGenerationAsyncStorage:z})}}};var t=require("../../../../../../webpack-runtime.js");t.C(e);var o=e=>t(t.s=e),i=t.X(0,[193,746,526],()=>o(66483));module.exports=i})();