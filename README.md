# prasadamConnect

## React + Firebase PWA (Phone OTP Login)

### Features
- Phone number + OTP auth using Firebase
- PWA: manifest + service worker for basic offline cache
- Shows "Hello World" after login

### Prerequisites
- Node 18+
- A Firebase project with Phone Authentication enabled
  - In Firebase Console: Build → Authentication → Sign-in method → enable Phone
  - For localhost, add your domain (http://localhost:5173) to Authorized domains
  - **To send OTP to real phone numbers (not just test numbers):**
    - Enable billing in your Firebase/Google Cloud project
    - Go to Firebase Console → Project Settings → Usage and billing
    - Link a billing account (required for SMS delivery)
    - SMS costs apply per verification (varies by country)

### Setup
1. Install deps:
   ```bash
   npm install
   ```
2. Create `.env` in project root (Vite loads variables starting with `VITE_`):
   ```bash
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```
3. Run dev server:
   ```bash
   npm run dev
   ```

### Notes
- Enter phone numbers in E.164 format, e.g. `+12345678901`.
- reCAPTCHA is set to invisible; ensure you've configured your domain in Firebase Console.
- For production hosting over HTTPS is required for service workers.

### Sending OTP to Real Phone Numbers

**For Development/Testing (Free):**
- Use Firebase Console → Authentication → Sign-in method → Phone → "Phone numbers for testing"
- Add test numbers (up to 10) with custom verification codes
- No SMS is sent, no billing required

**For Production (Real Phone Numbers):**
1. **Enable Billing:**
   - Go to [Firebase Console](https://console.firebase.google.com) → Your Project
   - Click ⚙️ → Usage and billing
   - Click "Modify plan" → Select "Blaze" (pay-as-you-go) plan
   - Link a credit card/billing account

2. **Enable Identity Toolkit API:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Select your Firebase project
   - Navigate to APIs & Services → Library
   - Search for "Identity Toolkit API" and enable it

3. **Configure API Key (if restricted):**
   - Go to APIs & Services → Credentials
   - If your API key is restricted, ensure "Identity Toolkit API" is allowed
   - Or set to "Don't restrict key" for testing

4. **Verify Domain Authorization:**
   - Firebase Console → Authentication → Settings → Authorized domains
   - Add your production domain (e.g., `yourdomain.com`)
   - localhost is enabled by default for development

**Costs:**
- SMS verification costs vary by country (typically $0.01-$0.05 per SMS)
- Firebase provides a free tier, but Phone Auth requires billing to be enabled
- Set up billing alerts in Google Cloud Console to monitor costs

Once billing is enabled, your app will automatically send real SMS OTPs to any phone number entered (in E.164 format).
