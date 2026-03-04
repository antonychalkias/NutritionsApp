# Auth Options to Consider for NutritionsApp

## ✅ Already Implemented (Stubs)
| Feature | Status |
|---|---|
| Email + Password Login | ✅ UI done, logic is a stub |
| Email + Password Register | ✅ UI done, logic is a stub |
| Google OAuth | ✅ UI done, `expo-auth-session` wired, logic is a stub |
| Apple Sign-In (iOS only) | ✅ UI done, `expo-apple-authentication` installed, logic is a stub |

---

## 🔲 Missing / Must-Have

### 1. Backend / Auth Provider
You need to pick **one** service to power all auth:
- **Firebase Auth** — most common for React Native, free tier, supports email, Google, Apple, phone
- **Supabase** — open-source Firebase alternative, great free tier
- **Auth0** — enterprise-grade, more setup
- **Custom API** — full control, but more work

> **Recommendation:** Firebase Auth — it pairs with `expo-auth-session` and `expo-apple-authentication` which you already have installed.

---

### 2. Forgot Password / Reset Password
- A "Forgot Password?" link on the Login screen
- Triggers an email with a reset link (handled by your auth provider)
- Needs a **ForgotPassword page** in `src/pages/ForgotPassword/`

### 3. Form Validation
Currently just `alert()` calls. Should add:
- Real-time field validation (email format, password strength)
- Inline error messages per field (not alerts)
- Consider **Zod** or **Yup** schemas

### 4. Persistent Session / Token Storage
- After login, store the auth token securely
- Use **`expo-secure-store`** (not AsyncStorage — that's unencrypted)
- On app launch, check if a valid session exists → skip Auth screen

### 5. Email Verification
- After registration, prompt user to verify their email before proceeding
- Show a "Check your email" screen / state

---

## 🔲 Nice-to-Have

### 6. Phone Number (OTP) Auth
- Login with SMS code
- Supported natively by Firebase Auth
- Useful for users who don't want email/password

### 7. Biometric Login (Face ID / Touch ID)
- After first login, offer biometric unlock for returning users
- Use **`expo-local-authentication`**
- Very common in fitness/health apps

### 8. Onboarding Flow (Post-Registration)
- After account creation, gather fitness profile data:
    - Height, weight, age, gender
    - Goal: Cut / Bulk / Maintain
    - Activity level
- This feeds into macro calculations
- Needs an **Onboarding page** in `src/pages/Onboarding/`

### 9. Terms of Service / Privacy Policy Checkbox
- Required for App Store / Google Play submissions
- Checkbox on the Registration form

### 10. Delete Account
- Required by Apple App Store guidelines (mandatory since 2023)
- Under profile/settings

---

## 🔲 Security Considerations
| Item | Notes |
|---|---|
| Password strength meter | Show strength on registration |
| Rate limiting | Handled by auth provider (Firebase etc.) |
| Secure token storage | Use `expo-secure-store`, never AsyncStorage |
| HTTPS only | Enforce on any custom API calls |
| Deep link handling | For password reset/email verification links back into the app — `scheme: "nutritionsapp"` is already set in app.json ✅ |

---

## Suggested Implementation Order
1. Pick auth provider (Firebase recommended)
2. Wire up Email/Password login & register with real logic
3. Add `expo-secure-store` for session persistence
4. Add Forgot Password page
5. Add Email Verification state
6. Add Onboarding flow
7. Add Biometric login
