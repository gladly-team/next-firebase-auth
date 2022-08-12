/*! For license information please see index.node.js.LICENSE.txt */
(()=>{"use strict";var e={933:(e,t,r)=>{var n=r(352)("cookies"),i=r(815),o=r(685),s={},a=/^[\u0009\u0020-\u007e\u0080-\u00ff]+$/,u=/^(?:lax|none|strict)$/i;function c(e,t,r){if(!(this instanceof c))return new c(e,t,r);this.secure=void 0,this.request=e,this.response=t,r&&(Array.isArray(r)?(n('"keys" argument; provide using options {"keys": [...]}'),this.keys=new i(r)):r.constructor&&"Keygrip"===r.constructor.name?(n('"keys" argument; provide using options {"keys": keygrip}'),this.keys=r):(this.keys=Array.isArray(r.keys)?new i(r.keys):r.keys,this.secure=r.secure))}function l(e,t,r){if(!a.test(e))throw new TypeError("argument name is invalid");if(t&&!a.test(t))throw new TypeError("argument value is invalid");for(var e in this.name=e,this.value=t||"",r)this[e]=r[e];if(this.value||(this.expires=new Date(0),this.maxAge=null),this.path&&!a.test(this.path))throw new TypeError("option path is invalid");if(this.domain&&!a.test(this.domain))throw new TypeError("option domain is invalid");if(this.sameSite&&!0!==this.sameSite&&!u.test(this.sameSite))throw new TypeError("option sameSite is invalid")}function h(e,t){if(t.overwrite)for(var r=e.length-1;r>=0;r--)0===e[r].indexOf(t.name+"=")&&e.splice(r,1);e.push(t.toHeader())}c.prototype.get=function(e,t){var r,n,i,o,a,u,c=e+".sig",l=t&&void 0!==t.signed?t.signed:!!this.keys;if((r=this.request.headers.cookie)&&(n=r.match(function(e){return s[e]?s[e]:s[e]=new RegExp("(?:^|;) *"+e.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&")+"=([^;]*)")}(e)),n)){if(i=n[1],!t||!l)return i;if(o=this.get(c)){if(a=e+"="+i,!this.keys)throw new Error(".keys required for signed cookies");if(!((u=this.keys.index(a,o))<0))return u&&this.set(c,this.keys.sign(a),{signed:!1}),i;this.set(c,null,{path:"/",signed:!1})}}},c.prototype.set=function(e,t,r){var i=this.response,s=this.request,a=i.getHeader("Set-Cookie")||[],u=void 0!==this.secure?!!this.secure:"https"===s.protocol||s.connection.encrypted,c=new l(e,t,r),p=r&&void 0!==r.signed?r.signed:!!this.keys;if("string"==typeof a&&(a=[a]),!u&&r&&r.secure)throw new Error("Cannot send secure cookie over unencrypted connection");if(c.secure=r&&void 0!==r.secure?r.secure:u,r&&"secureProxy"in r&&(n('"secureProxy" option; use "secure" option, provide "secure" to constructor if needed'),c.secure=r.secureProxy),h(a,c),r&&p){if(!this.keys)throw new Error(".keys required for signed cookies");c.value=this.keys.sign(c.toString()),c.name+=".sig",h(a,c)}return(i.set?o.OutgoingMessage.prototype.setHeader:i.setHeader).call(i,"Set-Cookie",a),this},l.prototype.path="/",l.prototype.expires=void 0,l.prototype.domain=void 0,l.prototype.httpOnly=!0,l.prototype.sameSite=!1,l.prototype.secure=!1,l.prototype.overwrite=!1,l.prototype.toString=function(){return this.name+"="+this.value},l.prototype.toHeader=function(){var e=this.toString();return this.maxAge&&(this.expires=new Date(Date.now()+this.maxAge)),this.path&&(e+="; path="+this.path),this.expires&&(e+="; expires="+this.expires.toUTCString()),this.domain&&(e+="; domain="+this.domain),this.sameSite&&(e+="; samesite="+(!0===this.sameSite?"strict":this.sameSite.toLowerCase())),this.secure&&(e+="; secure"),this.httpOnly&&(e+="; httponly"),e},Object.defineProperty(l.prototype,"maxage",{configurable:!0,enumerable:!0,get:function(){return this.maxAge},set:function(e){return this.maxAge=e}}),n.property(l.prototype,"maxage",'"maxage"; use "maxAge" instead'),c.connect=c.express=function(e){return function(t,r,n){t.cookies=r.cookies=new c(t,r,{keys:e}),n()}},c.Cookie=l,e.exports=c},679:(e,t,r)=>{var n=r(469),i={childContextTypes:!0,contextType:!0,contextTypes:!0,defaultProps:!0,displayName:!0,getDefaultProps:!0,getDerivedStateFromError:!0,getDerivedStateFromProps:!0,mixins:!0,propTypes:!0,type:!0},o={name:!0,length:!0,prototype:!0,caller:!0,callee:!0,arguments:!0,arity:!0},s={$$typeof:!0,compare:!0,defaultProps:!0,displayName:!0,propTypes:!0,type:!0},a={};function u(e){return n.isMemo(e)?s:a[e.$$typeof]||i}a[n.ForwardRef]={$$typeof:!0,render:!0,defaultProps:!0,displayName:!0,propTypes:!0},a[n.Memo]=s;var c=Object.defineProperty,l=Object.getOwnPropertyNames,h=Object.getOwnPropertySymbols,p=Object.getOwnPropertyDescriptor,d=Object.getPrototypeOf,f=Object.prototype;e.exports=function e(t,r,n){if("string"!=typeof r){if(f){var i=d(r);i&&i!==f&&e(t,i,n)}var s=l(r);h&&(s=s.concat(h(r)));for(var a=u(t),g=u(r),y=0;y<s.length;++y){var v=s[y];if(!(o[v]||n&&n[v]||g&&g[v]||a&&a[v])){var b=p(r,v);try{c(t,v,b)}catch(e){}}}}return t}},352:e=>{e.exports=require("depd")},324:e=>{e.exports=require("firebase/app")},610:e=>{e.exports=require("firebase/auth")},815:e=>{e.exports=require("keygrip")},469:e=>{e.exports=require("react-is")},685:e=>{e.exports=require("http")}},t={};function r(n){var i=t[n];if(void 0!==i)return i.exports;var o=t[n]={exports:{}};return e[n](o,o.exports,r),o.exports}r.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return r.d(t,{a:t}),t},r.d=(e,t)=>{for(var n in t)r.o(t,n)&&!r.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},r.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t);var n={};(()=>{r.d(n,{default:()=>Ee});const e=require("@babel/runtime/helpers/defineProperty");var t=r.n(e);const i=require("@babel/runtime/helpers/objectWithoutProperties");var o=r.n(i);const s=()=>"undefined"!=typeof window;var a=!1,u=e=>{a=e};const c=function(){if(a){for(var e=s()?["%cnext-firebase-auth","background: #ffa000; color: #fff; border-radius: 2px; padding: 2px 6px"]:["next-firebase-auth:"],t=arguments.length,r=new Array(t),n=0;n<t;n++)r[n]=arguments[n];console.log(...e,...r)}};var l,h=["cookies"];function p(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function d(e){for(var r=1;r<arguments.length;r++){var n=null!=arguments[r]?arguments[r]:{};r%2?p(Object(n),!0).forEach((function(r){t()(e,r,n[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):p(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}var f=12096e5,g={debug:!1,loginAPIEndpoint:void 0,logoutAPIEndpoint:void 0,onLoginRequestError:void 0,onLogoutRequestError:void 0,tokenChangedHandler:void 0,onVerifyTokenError:()=>{},onTokenRefreshError:()=>{},authPageURL:void 0,appPageURL:void 0,firebaseAdminInitConfig:void 0,firebaseClientInitConfig:void 0,firebaseAuthEmulatorHost:void 0,cookies:{name:void 0,keys:void 0,domain:void 0,httpOnly:!0,maxAge:6048e5,overwrite:!0,path:"/",sameSite:"strict",secure:!0,signed:!0}},y=e=>{var t=[];e.tokenChangedHandler?(e.loginAPIEndpoint&&t.push('The "loginAPIEndpoint" setting should not be set if you are using a "tokenChangedHandler".'),e.logoutAPIEndpoint&&t.push('The "logoutAPIEndpoint" setting should not be set if you are using a "tokenChangedHandler".'),e.onLoginRequestError&&t.push('The "onLoginRequestError" setting should not be set if you are using a "tokenChangedHandler".'),e.onLogoutRequestError&&t.push('The "onLogoutRequestError" setting should not be set if you are using a "tokenChangedHandler".')):(e.loginAPIEndpoint||t.push('The "loginAPIEndpoint" setting is required.'),e.logoutAPIEndpoint||t.push('The "logoutAPIEndpoint" setting is required.')),e.firebaseClientInitConfig&&e.firebaseClientInitConfig.apiKey||t.push('The "firebaseClientInitConfig.apiKey" value is required.'),e.firebaseAuthEmulatorHost&&e.firebaseAuthEmulatorHost.startsWith("http")&&t.push("The firebaseAuthEmulatorHost should be set without a prefix (e.g., localhost:9099)");var r=["function","undefined"];r.indexOf(typeof e.onVerifyTokenError)<0&&t.push('Invalid next-firebase-auth options: The "onVerifyTokenError" setting must be a function.'),r.indexOf(typeof e.onTokenRefreshError)<0&&t.push('Invalid next-firebase-auth options: The "onTokenRefreshError" setting must be a function.'),r.indexOf(typeof e.onLoginRequestError)<0&&t.push('Invalid next-firebase-auth options: The "onLoginRequestError" setting must be a function.'),r.indexOf(typeof e.onLogoutRequestError)<0&&t.push('Invalid next-firebase-auth options: The "onLogoutRequestError" setting must be a function.');var{keys:n}=e.cookies,i=n&&n.length&&(!n.filter||n.filter((e=>void 0!==e)).length);return s()?(e.firebaseAdminInitConfig&&e.firebaseAdminInitConfig.credential&&e.firebaseAdminInitConfig.credential.privateKey&&t.push('The "firebaseAdminInitConfig" private key setting should not be available on the client side.'),i&&t.push('The "cookies.keys" setting should not be available on the client side.')):(e.cookies.name||t.push('The "cookies.name" setting is required on the server side.'),e.cookies.signed&&!i&&t.push('The "cookies.keys" setting must be set if "cookies.signed" is true.'),e.firebaseAuthEmulatorHost&&(process.env.FIREBASE_AUTH_EMULATOR_HOST?process.env.FIREBASE_AUTH_EMULATOR_HOST!==e.firebaseAuthEmulatorHost&&t.push('The "FIREBASE_AUTH_EMULATOR_HOST" environment variable should be the same as the host set in the config'):t.push('The "FIREBASE_AUTH_EMULATOR_HOST" environment variable should be set if you are using the "firebaseAuthEmulatorHost" option')),e.cookies.maxAge>f&&t.push('The "cookies.maxAge" setting must be less than two weeks ('.concat(f," ms)."))),{isValid:0===t.length,errors:t}},v=e=>d(d({},e),{},{cookies:d(d({},e.cookies),{},{keys:["hidden"]})},e.firebaseAdminInitConfig&&{firebaseAdminInitConfig:d(d({},e.firebaseAdminInitConfig),e.firebaseAdminInitConfig.credential&&{credential:d(d({},e.firebaseAdminInitConfig.credential),{},{privateKey:"hidden",clientEmail:"hidden"})})}),b=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};c("Setting config with provided value:",v(e));var{cookies:t={}}=e,r=o()(e,h),n=d(d(d({},g),r),{},{cookies:d(d({},g.cookies),t)}),{isValid:i,errors:s}=y(n);if(!i)throw new Error("Invalid next-firebase-auth options: ".concat(s.join(" ")));l=n},m=()=>{if(!l)throw new Error("next-firebase-auth must be initialized before rendering.");return l};const O=require("react");var k=r.n(O);const w=require("next/router");var A=r(679),E=r.n(A),T=(0,O.createContext)();const P=require("@babel/runtime/helpers/asyncToGenerator");var R=r.n(P),S=["aud","auth_time","email","email_verified","exp","firebase","iat","iss","name","phone_number","picture","sub","uid","user_id"],U=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t={};return Object.keys(e).forEach((r=>{S.includes(r)||(t[r]=e[r])})),t};function j(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function C(e){for(var r=1;r<arguments.length;r++){var n=null!=arguments[r]?arguments[r]:{};r%2?j(Object(n),!0).forEach((function(r){t()(e,r,n[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):j(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}const x=function(){var{firebaseUserClientSDK:e,firebaseUserAdminSDK:t,serializedAuthUser:n,clientInitialized:i=!1,token:o=null,claims:a}=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},u=[e,t,n].reduce(((e,t)=>t?e+1:e),0);if(u>1)throw new Error('createAuthUser cannot receive more than one of the following properties: "firebaseUserClientSDK", "firebaseUserAdminSDK", "serializedAuthUser"');if(i&&(t||n))throw new Error('The "clientInitialized" value can only be true when called with the "firebaseUserClientSDK" property or no user.');if(a&&(t||n))throw new Error('The "claims" value can only be set in conjunction with the "firebaseUserClientSDK" property.');if(o&&!t)throw new Error('The "token" value can only be set if the "firebaseUserAdminSDK" property is defined.');var c={},l=null,h=null,p=!1,d=null,f=null,g=null,y=function(){var e=R()((function*(){return null}));return function(){return e.apply(this,arguments)}}(),v=function(){var e=R()((function*(){}));return function(){return e.apply(this,arguments)}}(),b=null;if(e){if(s()){var{getApp:m}=r(324),{getAuth:O,signOut:k}=r(610);v=function(){var e=R()((function*(){return k(O(m()))}));return function(){return e.apply(this,arguments)}}()}c=U(a),l=e.uid,h=e.email,p=e.emailVerified,d=e.phoneNumber,f=e.displayName,g=e.photoURL,y=function(){var t=R()((function*(t){return e.getIdToken(t)}));return function(e){return t.apply(this,arguments)}}(),b=null}else if(t)c=U(t),l=t.uid,h=t.email,p=t.email_verified,d=t.phone_number,f=t.name,g=t.picture,y=function(){var e=R()((function*(){return o}));return function(){return e.apply(this,arguments)}}(),b=o;else if(n){var w=JSON.parse(n);c=w.claims,l=w.id,h=w.email,p=w.emailVerified,d=w.phoneNumber,f=w.displayName,g=w.photoURL,y=function(){var e=R()((function*(){return w._token||null}));return function(){return e.apply(this,arguments)}}(),b=w._token}return{id:l,email:h,emailVerified:p,phoneNumber:d,displayName:f,photoURL:g,claims:c,getIdToken:y,clientInitialized:i,firebaseUser:e||null,signOut:v,serialize:function(){var{includeToken:e=!0}=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};return JSON.stringify(C({id:l,claims:c,email:h,emailVerified:p,phoneNumber:d,displayName:f,photoURL:g,clientInitialized:i},e&&{_token:b}))}}};var I=r(324),D=r(610);function L(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function _(e){for(var r=1;r<arguments.length;r++){var n=null!=arguments[r]?arguments[r]:{};r%2?L(Object(n),!0).forEach((function(r){t()(e,r,n[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):L(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}var q=function(){var e=R()((function*(e){var t,{loginAPIEndpoint:r,logoutAPIEndpoint:n,onLoginRequestError:i,onLogoutRequestError:o}=m();if(e.id){var s=yield e.getIdToken();if(!(t=yield fetch(r,{method:"POST",headers:{Authorization:s},credentials:"include"})).ok){var a=yield t.json(),u=new Error("Received ".concat(t.status," response from login API endpoint: ").concat(JSON.stringify(a)));if(!i)throw u;yield i(u)}}else if(!(t=yield fetch(n,{method:"POST",credentials:"include"})).ok){var c=yield t.json(),l=new Error("Received ".concat(t.status," response from logout API endpoint: ").concat(JSON.stringify(c)));if(!o)throw l;yield o(l)}return t}));return function(t){return e.apply(this,arguments)}}(),N=function(){var e=R()((function*(e){var{tokenChangedHandler:t}=m(),r=x({firebaseUserClientSDK:e,clientInitialized:!0});return t?t(r):q(r)}));return function(t){return e.apply(this,arguments)}}();const H=()=>{var[e,t]=(0,O.useState)({user:void 0,claims:{},initialized:!1}),[r,n]=(0,O.useState)(!1);return(0,O.useEffect)((()=>{var e=!1,r=function(){var r=R()((function*(r){c("Firebase ID token changed. Firebase user:",r),n(!1);var i={};if(r){var o=yield(0,D.getIdTokenResult)(r);i=U(o.claims)}t({user:r,claims:i,initialized:!0}),c("Starting auth API request via tokenChangedHandler."),yield N(r),e?c("Component unmounted before completing auth API request via tokenChangedHandler."):(n(!0),c("Completed auth API request via tokenChangedHandler."))}));return function(e){return r.apply(this,arguments)}}(),i=(0,D.onIdTokenChanged)((0,D.getAuth)((0,I.getApp)()),r);return()=>{i(),e=!0}}),[]),_(_({},e),{},{authRequestCompleted:r})},z={RENDER:"render",SHOW_LOADER:"showLoader",RETURN_NULL:"returnNull",REDIRECT_TO_LOGIN:"redirectToLogin",REDIRECT_TO_APP:"redirectToApp"};function F(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function K(e){for(var r=1;r<arguments.length;r++){var n=null!=arguments[r]?arguments[r]:{};r%2?F(Object(n),!0).forEach((function(r){t()(e,r,n[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):F(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}var M={basePath:!0,permanent:!1},J=e=>{var{ctx:t,AuthUser:r,redirectDestination:n}=e;if("function"==typeof n){var i=n({ctx:t,AuthUser:r});return J({ctx:t,AuthUser:r,redirectDestination:i})}return"string"==typeof n?K(K({},M),{},{destination:n}):"object"==typeof n?K(K({},M),n):null},V=e=>{var{redirectConfigName:t,redirectURL:r,ctx:n,AuthUser:i}=e;return((e,t)=>{if(!t||"string"!=typeof t&&!("destination"in t))throw new Error('The "'.concat(e,'" must be set to a non-empty string, an object literal containing "destination", or a function that returns either.'));return t})(t,J({ctx:n,AuthUser:i,redirectDestination:r||m()[t]}))},B=e=>{var{redirectURL:t,AuthUser:r,ctx:n}=e;return V({redirectConfigName:"authPageURL",redirectURL:t,AuthUser:r,ctx:n})},$=e=>{var{redirectURL:t,AuthUser:r,ctx:n}=e;return V({redirectConfigName:"appPageURL",redirectURL:t,AuthUser:r,ctx:n})},W=["AuthUserSerialized"];function G(){var{firebaseClientInitConfig:e,firebaseAuthEmulatorHost:t}=m();if(!(0,I.getApps)().length){if(!e)throw new Error('If not initializing the Firebase JS SDK elsewhere, you must provide "firebaseClientInitConfig" to next-firebase-auth.');(0,I.initializeApp)(e)}t&&(0,D.connectAuthEmulator)((0,D.getAuth)((0,I.getApp)()),"http://".concat(t))}const Q={init:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};u(!0===e.debug),b(e),s()&&G()},withAuthUser:function(){var{whenAuthed:e=z.RENDER,whenUnauthedBeforeInit:t=z.RENDER,whenUnauthedAfterInit:r=z.RENDER,whenAuthedBeforeRedirect:n=z.RETURN_NULL,appPageURL:i=null,authPageURL:a=null,LoaderComponent:u=null}=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};return l=>{var h=h=>{var{AuthUserSerialized:p}=h,d=o()(h,W),f=(0,O.useMemo)((()=>x({serializedAuthUser:p})),[p]),{user:g,claims:y,initialized:v,authRequestCompleted:b}=H(),m=(0,O.useMemo)((()=>x({firebaseUserClientSDK:g,clientInitialized:v,claims:y})),[g,v,y]),A=v?m:f,E=!!A.id,P=A.clientInitialized,R=E&&e===z.REDIRECT_TO_APP,S=R&&s&&b,U=!E&&(!P&&t===z.REDIRECT_TO_LOGIN||P&&r===z.REDIRECT_TO_LOGIN),j=U&&s&&(t===z.REDIRECT_TO_LOGIN||b),C=(0,w.useRouter)(),I=(0,O.useCallback)((e=>{var{basePath:t,destination:r}=e;!1===t?window.location.replace(r):C.replace(r)}),[C]),D=(0,O.useCallback)((()=>{c("Redirecting to app.");var e=$({AuthUser:A,redirectURL:i});I(e)}),[A,I]),L=(0,O.useCallback)((()=>{c("Redirecting to login.");var e=B({AuthUser:A,redirectURL:a});I(e)}),[A,I]);(0,O.useEffect)((()=>{s()&&(S?D():j&&L())}),[S,j,D,L]);var _,q=u?k().createElement(u,null):null,N=k().createElement(T.Provider,{value:A},k().createElement(l,d));return _=R?n===z.RENDER?N:n===z.SHOW_LOADER?q:null:U?t===z.RETURN_NULL?null:t===z.SHOW_LOADER?q:N:E||b?N:t===z.SHOW_LOADER?q:t===z.RETURN_NULL?null:N,c("AuthUser set to:",A),_};return h.displayName="WithAuthUserHOC",E()(h,l),h}},useAuthUser:()=>{var e=(0,O.useContext)(T);if(!e)throw new Error("When using `useAuthUser`, the page must be wrapped in `withAuthUser`.");return e},withAuthUserSSR:()=>{throw new Error('"withAuthUserSSR" can only be called server-side.')},withAuthUserTokenSSR:()=>{throw new Error('"withAuthUserTokenSSR" can only be called server-side.')},setAuthCookies:()=>{throw new Error('"setAuthCookies" can only be called server-side.')},unsetAuthCookies:()=>{throw new Error('"unsetAuthCookies" can only be called server-side.')},verifyIdToken:()=>{throw new Error('"verifyIdToken" can only be called server-side.')},AuthAction:z,getFirebaseAdmin:()=>{throw new Error('"getFirebaseAdmin" can only be called server-side.')}},X=require("firebase-admin");function Y(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function Z(e){for(var r=1;r<arguments.length;r++){var n=null!=arguments[r]?arguments[r]:{};r%2?Y(Object(n),!0).forEach((function(r){t()(e,r,n[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):Y(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}const ee=()=>{if(!X.apps.length){var{firebaseAdminInitConfig:e,useFirebaseAdminDefaultCredential:t}=m();if(!e&&!t)throw new Error('Missing firebase-admin credentials in next-firebase-auth. Set "firebaseAdminInitConfig", "useFirebaseAdminDefaultCredential", or initialize firebase-admin yourself.');X.initializeApp(Z(Z({},e),{},{credential:t?X.credential.applicationDefault():X.credential.cert(Z({},e.credential))}))}return X};var te=()=>process.env.FIREBASE_AUTH_EMULATOR_HOST?"http://".concat(process.env.FIREBASE_AUTH_EMULATOR_HOST,"/"):"https://",re=()=>m().firebaseClientInitConfig.apiKey,ne=function(){var e=R()((function*(e){if(!e)throw new Error('The "refreshToken" argument is required.');var t=re(),r="".concat(te(),"securetoken.googleapis.com/v1/token?key=").concat(t),n=yield fetch(r,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:"grant_type=refresh_token&refresh_token=".concat(e)}),i=yield n.json();if(!n.ok)throw new Error("Problem refreshing token: ".concat(JSON.stringify(i)));return i.id_token}));return function(t){return e.apply(this,arguments)}}(),ie=function(){var e=R()((function*(e){var t,r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,n=e,i=ee(),{onTokenRefreshError:o,onVerifyTokenError:s}=m();try{t=yield i.auth().verifyIdToken(e)}catch(e){switch(e.code){case"auth/invalid-user-token":case"auth/user-token-expired":case"auth/user-disabled":n=null,t=null;break;case"auth/id-token-expired":case"auth/argument-error":if(r){var a=!1;try{n=yield ne(r)}catch(e){a=!0,yield o(e)}if(!a)try{t=yield i.auth().verifyIdToken(n)}catch(e){yield s(e)}a&&(n=null,t=null)}else n=null,t=null;break;default:n=null,t=null,yield s(e)}}var u=x({firebaseUserAdminSDK:t,token:n});return u}));return function(t){return e.apply(this,arguments)}}(),oe=function(){var e=R()((function*(e){var t=yield ie(e),r=ee(),n=yield r.auth().createCustomToken(t.id),i=re(),o="".concat(te(),"identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=").concat(i),s=yield fetch(o,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token:n,returnSecureToken:!0})}),a=yield s.json();if(!s.ok)throw new Error("Problem getting a refresh token: ".concat(JSON.stringify(a)));var{idToken:u,refreshToken:c}=a;return{idToken:u,refreshToken:c,AuthUser:t}}));return function(t){return e.apply(this,arguments)}}(),se=r(933),ae=r.n(se),ue=e=>{var t=Buffer.from(e,"base64").toString("utf8");return JSON.parse(t)},ce=e=>{var t=JSON.stringify(e);return Buffer.from(t).toString("base64")},le=function(e){var{req:t,res:r}=e,{keys:n,secure:i}=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},o=ae()(t,r,{keys:n,secure:i});return o},he=function(e,t){var{req:r,res:n}=t,{keys:i,secure:o,signed:s}=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};if(s&&!i)throw new Error('The "keys" value must be provided when using signed cookies.');var a=le({req:r,res:n},{keys:i,secure:o}),u=a.get(e,{signed:s});return u?ue(u):void 0},pe=function(e,t,r){var{req:n,res:i}=r,{keys:o,domain:s,httpOnly:a,maxAge:u,overwrite:l,path:h,sameSite:p,secure:d,signed:f}=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{};if(f&&!o)throw new Error('The "keys" value must be provided when using signed cookies.');var g=le({req:n,res:i},{keys:o,secure:d}),y=null==t?void 0:ce(t);g.set(e,y,{domain:s,httpOnly:a,maxAge:u,overwrite:l,path:h,sameSite:p,secure:d,signed:f}),c("setCookie: name",e),c("setCookie: cookieVal",t),c("currentCookies",g.get(e))},de=(e,t,r)=>{pe(e,void 0,t,r)},fe=()=>m().cookies.name,ge=()=>{var e=fe();return"".concat(e,".AuthUser")},ye=()=>{var e=fe();return"".concat(e,".AuthUserTokens")};const ve=function(){var e=R()((function*(e,t){if(!e.headers||!e.headers.authorization)throw new Error("The request is missing an Authorization header value");var r=e.headers.authorization;c("setAuthCookies: token",r);var{idToken:n,refreshToken:i,AuthUser:o}=yield oe(r);c("setAuthCookies: idToken",n),c("setAuthCookies: refreshToken",i),c("setAuthCookies: AuthUser",o);var s=(e=>{var{domain:t,httpOnly:r,keys:n,maxAge:i,overwrite:o,path:s,sameSite:a,secure:u,signed:c}=e;return{domain:t,httpOnly:r,keys:n,maxAge:i,overwrite:o,path:s,sameSite:a,secure:u,signed:c}})(m().cookies);return c("setAuthCookies: cookieOptions",s),pe(ye(),JSON.stringify({idToken:n,refreshToken:i}),{req:e,res:t},s),c("setAuthCookies: getAuthUserTokensCookieName",ye()),pe(ge(),o.serialize({includeToken:!1}),{req:e,res:t},s),c("setAuthCookies: getAuthUserCookieName",ge()),{idToken:n,refreshToken:i,AuthUser:o}}));return function(t,r){return e.apply(this,arguments)}}(),be=function(){var e=R()((function*(e,t){var r=(e=>{var{domain:t,httpOnly:r,keys:n,maxAge:i,overwrite:o,path:s,sameSite:a,secure:u,signed:c}=e;return{domain:t,httpOnly:r,keys:n,maxAge:i,overwrite:o,path:s,sameSite:a,secure:u,signed:c}})(m().cookies);de(ye(),{req:e,res:t},r),de(ge(),{req:e,res:t},r)}));return function(t,r){return e.apply(this,arguments)}}();function me(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function Oe(e){for(var r=1;r<arguments.length;r++){var n=null!=arguments[r]?arguments[r]:{};r%2?me(Object(n),!0).forEach((function(r){t()(e,r,n[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):me(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}const ke=function(){var{whenAuthed:e=z.RENDER,whenUnauthed:t=z.RENDER,appPageURL:r=null,authPageURL:n=null}=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},{useToken:i=!0}=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return o=>function(){var s=R()((function*(s){var a,{req:u,res:c}=s,{keys:l,secure:h,signed:p}=m().cookies;if(i){var d=he(ye(),{req:u,res:c},{keys:l,secure:h,signed:p}),{idToken:f,refreshToken:g}=d?JSON.parse(d):{};a=f?yield ie(f,g):x()}else{if(!p)throw new Error("Cookies must be signed when using withAuthUserSSR.");var y=he(ge(),{req:u,res:c},{keys:l,secure:h,signed:p});a=x({serializedAuthUser:y})}var v=a.serialize();if(!a.id&&t===z.REDIRECT_TO_LOGIN)return{redirect:B({ctx:s,AuthUser:a,redirectURL:n})};if(a.id&&e===z.REDIRECT_TO_APP)return{redirect:$({ctx:s,AuthUser:a,redirectURL:r})};var b={props:{AuthUserSerialized:v}};if(o){s.AuthUser=a;var O=(yield o(s))||{};O&&(O.props?(b=Oe({},O)).props.AuthUserSerialized=v:(O.notFound||O.redirect)&&(b=Oe({},O)))}return b}));return function(e){return s.apply(this,arguments)}}()};function we(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function Ae(e){for(var r=1;r<arguments.length;r++){var n=null!=arguments[r]?arguments[r]:{};r%2?we(Object(n),!0).forEach((function(r){t()(e,r,n[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):we(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}const Ee=Ae(Ae({},Q),{},{init:e=>Q.init(e),withAuthUserSSR:e=>ke(e,{useToken:!1}),withAuthUserTokenSSR:e=>ke(e,{useToken:!0}),setAuthCookies:ve,unsetAuthCookies:be,verifyIdToken:ie,getFirebaseAdmin:()=>ee()})})(),module.exports=n.default})();