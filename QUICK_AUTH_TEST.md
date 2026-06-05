# AscendOS Authentication System — Quick Test Guide

## 30-Second Test

### ✅ Test 1: Sign Up
```
1. Open: file:///d:/AlphaXAce/GG/html/landing.html
2. Double-click AscendOS icon (top-left)
3. Redirects → signin.html
4. Click "Begin the Ascension" link
5. Fill form:
   - Email: hunter@test.com
   - Password: pass123
   - Confirm: pass123
6. Click "Initiate Profile →"
7. ✅ Success: Redirects to onboarding.html
```

### ✅ Test 2: Sign In
```
1. Click sign-in link or go to signin.html
2. Enter credentials:
   - Email: hunter@test.com
   - Password: pass123
3. Click "Ascend"
4. ✅ Success: Redirects to index.html (dashboard)
```

### ✅ Test 3: Dashboard Access
```
1. While signed in, click any menu link:
   - Daily Missions
   - Quests
   - Stats & Attributes
   - Profile
   - Settings
2. ✅ All pages load successfully
```

### ✅ Test 4: Logout
```
1. In sidebar, scroll down to bottom
2. Click red "⏻ Sign Out" button
3. ✅ Redirects to signin.html
4. Session cleared
```

### ✅ Test 5: Unauthorized Access
```
1. Don't sign in
2. Try to go directly to: file:///d:/AlphaXAce/GG/html/index.html
3. ✅ Browser redirects to signin.html
```

### ✅ Test 6: Session Validation
```
1. Sign in successfully
2. Open DevTools: F12 → Application → LocalStorage
3. Click on file:///.../GG/ 
4. Find entry: ascendos_user
5. Edit sessionExpiry to past date (e.g., "2020-01-01T00:00:00Z")
6. Reload page
7. ✅ Redirects to signin.html (session expired)
```

---

## Test Accounts (Pre-Created After First Signup)

After completing Test 1, these credentials work:
- Email: `hunter@test.com`
- Password: `pass123`

Try creating additional test accounts with different emails.

---

## Common Test Scenarios

### ❌ Invalid Password
```
Email: hunter@test.com
Password: wrongpass
Result: "Incorrect password." error
```

### ❌ Non-Existent Email
```
Email: notregistered@test.com
Password: anypass
Result: "Email not found. Please sign up first." error
```

### ❌ Mismatched Passwords (on signup)
```
Password: pass123
Confirm: pass456
Result: "Passwords do not match." error
```

### ❌ Short Password (on signup)
```
Password: abc
Confirm: abc
Result: "Password must be at least 6 characters." error
```

### ❌ Duplicate Email (on signup)
```
Email: hunter@test.com (already exists)
Result: "Email is already registered." error
```

---

## DevTools Verification

### Check Active Session
```
DevTools → Application → LocalStorage → file:///...
Key: ascendos_user
Value: { "email": "hunter@test.com", "displayName": "hunter", "token": "...", "loginTime": "...", "sessionExpiry": "..." }
```

### Check Account Records
```
DevTools → Application → LocalStorage
Keys matching pattern: ascendos_user_*
Example: ascendos_user_hunter@test.com
Value: { "password": "pass123", "user": { ... } }
```

### Clear All Data
```
DevTools → Application → LocalStorage
Right-click → Clear All
- All accounts deleted
- All sessions cleared
- Need to re-signup
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Blank page on signin/signup | Check that auth.js is loaded (check DevTools console) |
| Always redirected to signin | Clear localStorage and sign up again |
| Form not working | Check browser console for errors |
| Passwords storing incorrectly | This is normal - they're plaintext for demo |
| Can't access dashboard | Ensure you're signed in (check localStorage.ascendos_user) |

---

## What to Look For ✅

1. **Signup Flow**
   - Form validation works (error messages appear)
   - Account created in localStorage
   - Redirects to onboarding.html on success

2. **Signin Flow**
   - Password validation works
   - Correct credentials create session
   - Redirects to dashboard on success

3. **Protected Routes**
   - All dashboard pages load only when signed in
   - Unauthenticated users redirected to signin
   - Session validated on each page load

4. **Logout**
   - Sign Out button appears in sidebar
   - Clicking it clears session
   - Redirects to signin.html

5. **Session Management**
   - Session expires after 24 hours
   - Token is unique per login
   - Session persists across page refreshes

---

## Files to Review

- [auth.js](file:///d:/AlphaXAce/GG/html/js/auth.js) — Authentication engine
- [signin.html](file:///d:/AlphaXAce/GG/html/signin.html) — Login page
- [signup.html](file:///d:/AlphaXAce/GG/html/signup.html) — Registration page
- [index.html](file:///d:/AlphaXAce/GG/html/index.html) — Protected dashboard (example)
- [AUTH_SYSTEM_GUIDE.md](../AUTH_SYSTEM_GUIDE.md) — Full technical documentation

---

**Ready to Test!** 🚀
