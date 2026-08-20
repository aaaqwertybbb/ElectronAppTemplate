Messing around with typescript and webpack

---

from "repo root"

> npm install

> npm start

---

`I did not have to the do this:`

Google AI is saying the following, I don't have this issue but I figure I'll put it here incase until I understand the details.

Scenario 3: Running an Electron Framework App

If you are building an Electron desktop application, Electron runs on its own internal version of Node.js. Normal npm install compiles better-sqlite3 for your system's Node.js, causing Electron to throw a "Cannot find module" or "Could not locate bindings" error

You must force the package to compile targeting Electron's specific runtime version using electron-rebuild:

```bash
# 1. Install the rebuilder tool
npm install --save-dev electron-rebuild

# 2. Run the rebuilder
npx electron-rebuild
```

---

I saw this console message when doing npm start

› Attempting to build a module with a space in the path
› See https://github.com/nodejs/node-gyp/issues/65#issuecomment-368820565 for reasons why this may not work

I have 'New folder (6)' as part of my path I gotta watch for this incase it is problematic.
