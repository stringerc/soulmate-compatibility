2:I[5428,[],"ClientPageRoot"]
3:I[5359,["387","static/chunks/387-f1220a8192bdced0.js","155","static/chunks/app/journaling/page-ce39895d446ada02.js"],"default",1]
4:I[5092,[],""]
5:I[2023,[],""]
7:I[9473,["340","static/chunks/340-613d878cc8f9b260.js","387","static/chunks/387-f1220a8192bdced0.js","185","static/chunks/app/layout-2b3bb0cf37fbe34f.js"],"default"]
8:I[1496,["340","static/chunks/340-613d878cc8f9b260.js","387","static/chunks/387-f1220a8192bdced0.js","185","static/chunks/app/layout-2b3bb0cf37fbe34f.js"],"default"]
9:I[7426,["340","static/chunks/340-613d878cc8f9b260.js","387","static/chunks/387-f1220a8192bdced0.js","185","static/chunks/app/layout-2b3bb0cf37fbe34f.js"],"AnalyticsProvider"]
a:I[6,["340","static/chunks/340-613d878cc8f9b260.js","387","static/chunks/387-f1220a8192bdced0.js","185","static/chunks/app/layout-2b3bb0cf37fbe34f.js"],"default"]
6:T859,
              // EARLIEST POSSIBLE console warning suppression (before ANY other scripts)
              (function() {
                'use strict';
                // Suppress Zustand deprecation warnings
                const originalWarn = console.warn;
                console.warn = function(...args) {
                  const msg = args[0]?.toString() || '';
                  if (msg.includes('DEPRECATED') || msg.includes('Default export is deprecated') || msg.includes('zustand')) {
                    return; // Suppress
                  }
                  originalWarn.apply(console, args);
                };
                
                // Suppress 503 errors for compatibility API
                const originalError = console.error;
                console.error = function(...args) {
                  const msg = args[0]?.toString() || '';
                  const url = args.find(a => typeof a === 'string' && a.includes('/compatibility/explore'))?.toString() || '';
                  if (msg.includes('503') || msg.includes('Service Unavailable') || url.includes('/compatibility/explore')) {
                    return; // Suppress expected 503 errors
                  }
                  originalError.apply(console, args);
                };
                
                // Override fetch to suppress 503 network errors
                if (typeof window !== 'undefined' && window.fetch) {
                  const originalFetch = window.fetch;
                  window.fetch = function(input, init) {
                    return originalFetch.call(this, input, init).catch(function(error) {
                      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input && typeof input === 'object' && 'url' in input ? input.url : '');
                      if (url.includes('/compatibility/explore')) {
                        // Silently handle - client-side fallback works
                        throw error;
                      }
                      throw error;
                    });
                  };
                }
              })();
            0:["cgrUa9bSgplk209p67NiL",[[["",{"children":["journaling",{"children":["__PAGE__",{}]}]},"$undefined","$undefined",true],["",{"children":["journaling",{"children":["__PAGE__",{},[["$L1",["$","$L2",null,{"props":{"params":{},"searchParams":{}},"Component":"$3"}],null],null],null]},[null,["$","$L4",null,{"parallelRouterKey":"children","segmentPath":["children","journaling","children"],"error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L5",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","notFoundStyles":"$undefined"}]],null]},[[[["$","link","0",{"rel":"stylesheet","href":"/_next/static/css/1b0e986f8cca1baf.css","precedence":"next","crossOrigin":"$undefined"}]],["$","html",null,{"lang":"en","suppressHydrationWarning":true,"children":[["$","head",null,{"children":[["$","link",null,{"rel":"manifest","href":"/manifest.json"}],["$","meta",null,{"name":"mobile-web-app-capable","content":"yes"}],["$","meta",null,{"name":"apple-mobile-web-app-capable","content":"yes"}],["$","meta",null,{"name":"apple-mobile-web-app-status-bar-style","content":"default"}],["$","meta",null,{"name":"apple-mobile-web-app-title","content":"Soulmates"}],["$","script",null,{"dangerouslySetInnerHTML":{"__html":"$6"}}]]}],["$","body",null,{"className":"bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen transition-colors duration-200","children":[["$","$L7",null,{}],["$","$L8",null,{"children":["$","$L9",null,{"children":[["$","$La",null,{}],["$","$L4",null,{"parallelRouterKey":"children","segmentPath":["children"],"error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L5",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":[["$","title",null,{"children":"404: This page could not be found."}],["$","div",null,{"style":{"fontFamily":"system-ui,\"Segoe UI\",Roboto,Helvetica,Arial,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\"","height":"100vh","textAlign":"center","display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"center"},"children":["$","div",null,{"children":[["$","style",null,{"dangerouslySetInnerHTML":{"__html":"body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}"}}],["$","h1",null,{"className":"next-error-h1","style":{"display":"inline-block","margin":"0 20px 0 0","padding":"0 23px 0 0","fontSize":24,"fontWeight":500,"verticalAlign":"top","lineHeight":"49px"},"children":"404"}],["$","div",null,{"style":{"display":"inline-block"},"children":["$","h2",null,{"style":{"fontSize":14,"fontWeight":400,"lineHeight":"49px","margin":0},"children":"This page could not be found."}]}]]}]}]],"notFoundStyles":[]}]]}]}]]}]]}]],null],null],["$Lb",null]]]]
b:[["$","meta","0",{"name":"viewport","content":"width=device-width, initial-scale=1"}],["$","meta","1",{"charSet":"utf-8"}],["$","title","2",{"children":"Soulmates - Self-Discovery & Compatibility"}],["$","meta","3",{"name":"description","content":"Discover yourself and explore compatibility with soulmates.syncscript.app"}],["$","meta","4",{"name":"format-detection","content":"telephone=no"}],["$","meta","5",{"name":"apple-mobile-web-app-capable","content":"yes"}],["$","meta","6",{"name":"apple-mobile-web-app-title","content":"Soulmates"}],["$","meta","7",{"name":"apple-mobile-web-app-status-bar-style","content":"default"}],["$","link","8",{"rel":"icon","href":"/favicon.svg"}]]
1:null
