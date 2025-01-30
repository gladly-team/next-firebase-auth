
## Using Service Worker for Auth

This is a proof of concept for using a service worker to send ID tokens to server-rendered pages. See [this issue](https://github.com/gladly-team/next-firebase-auth/issues/287) and [Firebase docs](https://firebase.google.com/docs/auth/web/service-worker-sessions).

### General flow:
1. On the auth page, register the service worker, which initializes Firebase, sets up request interception, and will save the authed user.
2. On future requests, the service worker gets the ID token (refreshing if needed) and adds it as a request header.
3. Middleware on the server receives the ID token, verifies it, and gets the user. We add the user to auth context.

### WIP Notes
To develop at the moment:
1. Run this app to register the service worker on localhost 
2. Auth in another app on localhost, since auth is not yet set up here
3. Return to this app
4. Inspect requests to see SW-added headers


### To Do
1. Add middlware to get the user from the ID token server-side
2. Pass user to auth provider (server component)
3. Clean up service worker: remove unneeded logic, maybe use Workbox, make sure types aren't erroring
4. Add auth to this example
5. Move code into NFA under unstable APIs
6. Clean up this example: get parent ESLint config working
7. Later: see if the middleware can also support existing cookies (see [issue](https://github.com/gladly-team/next-firebase-auth/issues/418#issuecomment-1203655282)). This way, developers with apps on the edge could use either cookies (no ID token) or integrate a service worker.
