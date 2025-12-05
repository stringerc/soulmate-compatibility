exports.id=7110,exports.ids=[7110],exports.modules={11124:(e,t,s)=>{Promise.resolve().then(s.bind(s,51708)),Promise.resolve().then(s.bind(s,19975)),Promise.resolve().then(s.bind(s,33783)),Promise.resolve().then(s.bind(s,17702)),Promise.resolve().then(s.bind(s,47114))},78482:(e,t,s)=>{Promise.resolve().then(s.t.bind(s,24424,23)),Promise.resolve().then(s.t.bind(s,37752,23)),Promise.resolve().then(s.t.bind(s,75275,23)),Promise.resolve().then(s.t.bind(s,29842,23)),Promise.resolve().then(s.t.bind(s,1633,23)),Promise.resolve().then(s.t.bind(s,9224,23))},51708:(e,t,s)=>{"use strict";s.d(t,{AnalyticsProvider:()=>n});var r=s(73227);function n({children:e}){return r.jsx(r.Fragment,{children:e})}s(23677)},19975:(e,t,s)=>{"use strict";function r(){return null}s.d(t,{default:()=>r})},33783:(e,t,s)=>{"use strict";function r(){return null}s.d(t,{default:()=>r}),s(23677)},17702:(e,t,s)=>{"use strict";s.d(t,{default:()=>c});var r=s(73227),n=s(20649),a=s(65479);s(9925);var i=s(34666),o=s(98985),l=s(6);function c(){let{isAuthenticated:e,isLoading:t,userEmail:s}=(0,a.a)(),c=async()=>{};return r.jsx("nav",{className:"border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50",children:r.jsx("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:(0,r.jsxs)("div",{className:"flex justify-between items-center h-16",children:[(0,r.jsxs)(n.default,{href:"/",className:"flex items-center gap-2",children:[r.jsx(i.Z,{className:"w-6 h-6 text-pink-600 dark:text-pink-400"}),r.jsx("span",{className:"text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent",children:"Soulmates"})]}),(0,r.jsxs)("div",{className:"flex items-center gap-6",children:[r.jsx(n.default,{href:"/pricing",className:"text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition font-medium",children:"Pricing"}),r.jsx(n.default,{href:"/explore",className:"text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition",children:"Explore"}),r.jsx(n.default,{href:"/discover",className:"text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition",children:"Discover"}),r.jsx(n.default,{href:"/bonds",className:"text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition",children:"Bonds"}),!t&&r.jsx(r.Fragment,{children:e?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)(n.default,{href:"/me",className:"flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition",children:[r.jsx(o.Z,{className:"w-4 h-4"}),r.jsx("span",{className:"hidden sm:inline",children:s||"Dashboard"})]}),(0,r.jsxs)("button",{onClick:c,className:"flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition",title:"Sign out",children:[r.jsx(l.Z,{className:"w-4 h-4"}),r.jsx("span",{className:"hidden sm:inline",children:"Sign Out"})]})]}):(0,r.jsxs)(r.Fragment,{children:[r.jsx(n.default,{href:"/login",className:"text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition",children:"Sign In"}),r.jsx(n.default,{href:"/signup",className:"px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 font-semibold transition shadow-lg hover:shadow-xl",children:"Sign Up"})]})})]})]})})})}},47114:(e,t,s)=>{"use strict";s.d(t,{default:()=>a});var r=s(73227),n=s(9925);function a({children:e}){return r.jsx(n.SessionProvider,{children:e})}},65479:(e,t,s)=>{"use strict";s.d(t,{a:()=>a});var r=s(23677),n=s(9925);function a(){let{data:e,status:t}=(0,n.useSession)(),[s,a]=(0,r.useState)({isAuthenticated:!1,isLoading:!0,userId:null,userEmail:null});return"loading"===t?{isAuthenticated:!1,isLoading:!0,userId:null,userEmail:null}:e?{isAuthenticated:!0,isLoading:!1,userId:e.userId||e.user?.id||null,userEmail:e.user?.email||null}:s}},43740:(e,t,s)=>{"use strict";s.r(t),s.d(t,{default:()=>u,metadata:()=>d});var r=s(99013);s(20001);var n=s(53189);let a=(0,n.createProxy)(String.raw`/Users/Apple/Documents/soul mate/apps/soulmates/components/AnalyticsProvider.tsx#AnalyticsProvider`),i=(0,n.createProxy)(String.raw`/Users/Apple/Documents/soul mate/apps/soulmates/components/SessionProvider.tsx#default`),o=(0,n.createProxy)(String.raw`/Users/Apple/Documents/soul mate/apps/soulmates/components/NavBar.tsx#default`),l=(0,n.createProxy)(String.raw`/Users/Apple/Documents/soul mate/apps/soulmates/components/MobileOptimizer.tsx#default`),c=(0,n.createProxy)(String.raw`/Users/Apple/Documents/soul mate/apps/soulmates/components/ConsoleSuppressor.tsx#default`),d={title:"Soulmates - Self-Discovery & Compatibility",description:"Discover yourself and explore compatibility with soulmates.syncscript.app",icons:{icon:"/favicon.svg"},viewport:{width:"device-width",initialScale:1,maximumScale:5,userScalable:!0,viewportFit:"cover"},themeColor:[{media:"(prefers-color-scheme: light)",color:"#ec4899"},{media:"(prefers-color-scheme: dark)",color:"#1f2937"}],appleWebApp:{capable:!0,statusBarStyle:"default",title:"Soulmates"},formatDetection:{telephone:!1}};function u({children:e}){return(0,r.jsxs)("html",{lang:"en",suppressHydrationWarning:!0,children:[(0,r.jsxs)("head",{children:[r.jsx("link",{rel:"manifest",href:"/manifest.json"}),r.jsx("meta",{name:"mobile-web-app-capable",content:"yes"}),r.jsx("meta",{name:"apple-mobile-web-app-capable",content:"yes"}),r.jsx("meta",{name:"apple-mobile-web-app-status-bar-style",content:"default"}),r.jsx("meta",{name:"apple-mobile-web-app-title",content:"Soulmates"}),r.jsx("script",{dangerouslySetInnerHTML:{__html:`
              // ULTRA-EARLY console suppression - runs before ANY other script
              // This must execute synchronously before Vercel's instrument.js
              (function() {
                'use strict';
                try {
                  // Capture console methods immediately
                  const _warn = console.warn;
                  const _error = console.error;
                  const _log = console.log;
                  
                  // Suppress Zustand warnings
                  console.warn = function() {
                    const msg = arguments[0]?.toString() || '';
                    if (msg.includes('DEPRECATED') || msg.includes('zustand') || msg.includes('Default export')) {
                      return;
                    }
                    return _warn.apply(console, arguments);
                  };
                  
                  // Suppress 503 errors
                  console.error = function() {
                    const msg = arguments[0]?.toString() || '';
                    const hasUrl = Array.from(arguments).some(a => typeof a === 'string' && a.includes('/compatibility/explore'));
                    if ((msg.includes('503') || msg.includes('Service Unavailable')) && hasUrl) {
                      return;
                    }
                    return _error.apply(console, arguments);
                  };
                  
                  // Suppress network logs
                  console.log = function() {
                    const msg = arguments[0]?.toString() || '';
                    if (msg.includes('POST') && msg.includes('/compatibility/explore') && msg.includes('503')) {
                      return;
                    }
                    return _log.apply(console, arguments);
                  };
                } catch(e) {
                  // Silently fail if suppression doesn't work
                }
              })();
            `}})]}),(0,r.jsxs)("body",{className:"bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen transition-colors duration-200",children:[r.jsx(c,{}),r.jsx(l,{}),r.jsx(i,{children:(0,r.jsxs)(a,{children:[r.jsx(o,{}),e]})})]})]})}},20001:()=>{}};