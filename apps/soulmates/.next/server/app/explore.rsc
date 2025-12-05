2:I[5428,[],"ClientPageRoot"]
3:I[4920,["340","static/chunks/340-613d878cc8f9b260.js","387","static/chunks/387-f1220a8192bdced0.js","895","static/chunks/895-993b23634a6f583b.js","922","static/chunks/922-ca27e5687fce8996.js","607","static/chunks/app/explore/page-c1508692e258b3b5.js"],"default",1]
4:I[5092,[],""]
5:I[2023,[],""]
8:I[2277,["340","static/chunks/340-613d878cc8f9b260.js","387","static/chunks/387-f1220a8192bdced0.js","185","static/chunks/app/layout-7c9b98502bb413df.js"],"default"]
9:I[9473,["340","static/chunks/340-613d878cc8f9b260.js","387","static/chunks/387-f1220a8192bdced0.js","185","static/chunks/app/layout-7c9b98502bb413df.js"],"default"]
a:I[1496,["340","static/chunks/340-613d878cc8f9b260.js","387","static/chunks/387-f1220a8192bdced0.js","185","static/chunks/app/layout-7c9b98502bb413df.js"],"default"]
b:I[7426,["340","static/chunks/340-613d878cc8f9b260.js","387","static/chunks/387-f1220a8192bdced0.js","185","static/chunks/app/layout-7c9b98502bb413df.js"],"AnalyticsProvider"]
c:I[6,["340","static/chunks/340-613d878cc8f9b260.js","387","static/chunks/387-f1220a8192bdced0.js","185","static/chunks/app/layout-7c9b98502bb413df.js"],"default"]
6:T12c9,
              // ULTRA-EARLY suppression - runs BEFORE Vercel's instrument.js
              (function() {
                'use strict';
                // Store originals immediately
                const _warn = console.warn.bind(console);
                const _error = console.error.bind(console);
                const _log = console.log.bind(console);
                const _info = console.info.bind(console);
                
                // Suppress Zustand deprecation warnings (from Vercel analytics)
                console.warn = function() {
                  const msg = arguments[0]?.toString() || '';
                  if (
                    msg.includes('DEPRECATED') || 
                    msg.includes('zustand') || 
                    msg.includes('Default export is deprecated') ||
                    (msg.includes('create') && msg.includes('zustand'))
                  ) {
                    return; // Suppress completely
                  }
                  return _warn.apply(console, arguments);
                };
                
                // Suppress 503 errors for compatibility API
                console.error = function() {
                  const msg = arguments[0]?.toString() || '';
                  const argsArray = Array.from(arguments);
                  const hasCompatibilityUrl = argsArray.some(a => 
                    typeof a === 'string' && a.includes('/compatibility/explore')
                  );
                  
                  if (
                    (msg.includes('503') || msg.includes('Service Unavailable')) && 
                    (hasCompatibilityUrl || msg.includes('/compatibility/explore'))
                  ) {
                    return; // Suppress completely
                  }
                  
                  if (msg.includes('POST') && msg.includes('503') && hasCompatibilityUrl) {
                    return; // Suppress completely
                  }
                  
                  return _error.apply(console, arguments);
                };
                
                // Suppress network logs
                console.log = function() {
                  const msg = arguments[0]?.toString() || '';
                  if (
                    msg.includes('POST') && 
                    msg.includes('/compatibility/explore') && 
                    (msg.includes('503') || msg.includes('Service Unavailable'))
                  ) {
                    return; // Suppress completely
                  }
                  return _log.apply(console, arguments);
                };
                
                // Suppress console.info
                console.info = function() {
                  const msg = arguments[0]?.toString() || '';
                  if (
                    msg.includes('DEPRECATED') || 
                    msg.includes('zustand') ||
                    (msg.includes('POST') && msg.includes('/compatibility/explore') && msg.includes('503'))
                  ) {
                    return; // Suppress completely
                  }
                  return _info.apply(console, arguments);
                };
                
                // Intercept fetch immediately to prevent 503 logging
                if (window.fetch) {
                  const originalFetch = window.fetch;
                  window.fetch = function(input, init) {
                    const url = typeof input === 'string' ? input : 
                                input instanceof URL ? input.toString() : 
                                (input && typeof input === 'object' && 'url' in input ? input.url : '');
                    
                    if (url.includes('/compatibility/explore')) {
                      return originalFetch.call(this, input, init).then(
                        function(response) {
                          if (response.status === 503) {
                            return response; // Return response, don't log
                          }
                          return response;
                        },
                        function(error) {
                          // Return mock 503 response instead of throwing
                          return new Response(JSON.stringify({ 
                            error: 'Backend unavailable', 
                            fallback: true 
                          }), {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: { 'Content-Type': 'application/json' }
                          });
                        }
                      );
                    }
                    return originalFetch.call(this, input, init);
                  };
                }
              })();
            7:T677,
              // Backup inline suppression (in case external script fails to load)
              (function() {
                'use strict';
                try {
                  const _warn = console.warn || function(){};
                  const _error = console.error || function(){};
                  const _log = console.log || function(){};
                  
                  console.warn = function() {
                    const msg = arguments[0]?.toString() || '';
                    if (msg.includes('DEPRECATED') || msg.includes('zustand') || msg.includes('Default export')) {
                      return;
                    }
                    return _warn.apply(console, arguments);
                  };
                  
                  console.error = function() {
                    const msg = arguments[0]?.toString() || '';
                    const hasUrl = Array.from(arguments).some(a => typeof a === 'string' && a.includes('/compatibility/explore'));
                    if ((msg.includes('503') || msg.includes('Service Unavailable')) && hasUrl) {
                      return;
                    }
                    return _error.apply(console, arguments);
                  };
                  
                  console.log = function() {
                    const msg = arguments[0]?.toString() || '';
                    if (msg.includes('POST') && msg.includes('/compatibility/explore') && msg.includes('503')) {
                      return;
                    }
                    return _log.apply(console, arguments);
                  };
                } catch(e) {}
              })();
            0:["VxUgJtdx0y5_FWY249fGe",[[["",{"children":["explore",{"children":["__PAGE__",{}]}]},"$undefined","$undefined",true],["",{"children":["explore",{"children":["__PAGE__",{},[["$L1",["$","$L2",null,{"props":{"params":{},"searchParams":{}},"Component":"$3"}],null],null],null]},[null,["$","$L4",null,{"parallelRouterKey":"children","segmentPath":["children","explore","children"],"error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L5",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","notFoundStyles":"$undefined"}]],null]},[[[["$","link","0",{"rel":"stylesheet","href":"/_next/static/css/74384ae06a7fe474.css","precedence":"next","crossOrigin":"$undefined"}]],["$","html",null,{"lang":"en","suppressHydrationWarning":true,"children":[["$","head",null,{"children":[["$","link",null,{"rel":"manifest","href":"/manifest.json"}],["$","meta",null,{"name":"mobile-web-app-capable","content":"yes"}],["$","meta",null,{"name":"apple-mobile-web-app-capable","content":"yes"}],["$","meta",null,{"name":"apple-mobile-web-app-status-bar-style","content":"default"}],["$","meta",null,{"name":"apple-mobile-web-app-title","content":"Soulmates"}],["$","script",null,{"dangerouslySetInnerHTML":{"__html":"$6"}}],["$","script",null,{"src":"/suppress-console.js","async":false,"defer":false}],["$","script",null,{"dangerouslySetInnerHTML":{"__html":"$7"}}]]}],["$","body",null,{"className":"bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen transition-colors duration-200","children":[["$","$L8",null,{}],["$","$L9",null,{}],["$","$La",null,{"children":["$","$Lb",null,{"children":[["$","$Lc",null,{}],["$","$L4",null,{"parallelRouterKey":"children","segmentPath":["children"],"error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L5",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":[["$","title",null,{"children":"404: This page could not be found."}],["$","div",null,{"style":{"fontFamily":"system-ui,\"Segoe UI\",Roboto,Helvetica,Arial,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\"","height":"100vh","textAlign":"center","display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"center"},"children":["$","div",null,{"children":[["$","style",null,{"dangerouslySetInnerHTML":{"__html":"body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}"}}],["$","h1",null,{"className":"next-error-h1","style":{"display":"inline-block","margin":"0 20px 0 0","padding":"0 23px 0 0","fontSize":24,"fontWeight":500,"verticalAlign":"top","lineHeight":"49px"},"children":"404"}],["$","div",null,{"style":{"display":"inline-block"},"children":["$","h2",null,{"style":{"fontSize":14,"fontWeight":400,"lineHeight":"49px","margin":0},"children":"This page could not be found."}]}]]}]}]],"notFoundStyles":[]}]]}]}]]}]]}]],null],null],["$Ld",null]]]]
d:[["$","meta","0",{"name":"viewport","content":"width=device-width, initial-scale=1"}],["$","meta","1",{"charSet":"utf-8"}],["$","title","2",{"children":"Soulmates - Self-Discovery & Compatibility"}],["$","meta","3",{"name":"description","content":"Discover yourself and explore compatibility with soulmates.syncscript.app"}],["$","meta","4",{"name":"format-detection","content":"telephone=no"}],["$","meta","5",{"name":"apple-mobile-web-app-capable","content":"yes"}],["$","meta","6",{"name":"apple-mobile-web-app-title","content":"Soulmates"}],["$","meta","7",{"name":"apple-mobile-web-app-status-bar-style","content":"default"}],["$","link","8",{"rel":"icon","href":"/favicon.svg"}]]
1:null
