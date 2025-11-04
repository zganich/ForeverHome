# Phase 1: Technical Beta - Manual Testing Checklist

**Date Started:** ___________  
**Tester:** ___________  
**Environment:** Local Development / Production

---

## ✅ Pre-Testing Setup

- [ ] Dev server is running (`pnpm dev`)
- [ ] Database is accessible
- [ ] Supabase is configured
- [ ] Stripe test mode is enabled
- [ ] Test accounts created (if needed)
- [ ] Test images prepared

---

## 🔐 Authentication & User Management

### Signup Flow
- [ ] Navigate to `/login`
- [ ] Click "Sign Up" or toggle to signup mode
- [ ] Enter valid email (e.g., `test@example.com`)
- [ ] Enter password (min 6 characters)
- [ ] Submit form
- [ ] **Expected:** Success message "Check your email to confirm your account!"
- [ ] **Expected:** Form resets or stays on login page
- [ ] **Notes:** _________________

### Signup Validation
- [ ] Try invalid email format (e.g., `notanemail`)
- [ ] **Expected:** HTML5 validation error or custom error message
- [ ] Try password less than 6 characters
- [ ] **Expected:** Validation error shown
- [ ] **Notes:** _________________

### Login Flow
- [ ] Navigate to `/login`
- [ ] Enter correct email and password
- [ ] Submit form
- [ ] **Expected:** Success message "Welcome back!"
- [ ] **Expected:** Redirect to `/dashboard`
- [ ] **Notes:** _________________

### Login Validation
- [ ] Try wrong password
- [ ] **Expected:** Error message displayed (e.g., "Invalid login credentials")
- [ ] Try non-existent email
- [ ] **Expected:** Error message displayed
- [ ] **Notes:** _________________

### Session Persistence
- [ ] Login successfully
- [ ] Refresh page (F5)
- [ ] **Expected:** Still logged in, still on dashboard
- [ ] Close browser tab
- [ ] Reopen and navigate to `/dashboard`
- [ ] **Expected:** Still logged in (if session persists)
- [ ] **Notes:** _________________

### Logout
- [ ] Click logout button
- [ ] **Expected:** Redirected to login or home page
- [ ] **Expected:** Cannot access protected routes
- [ ] **Notes:** _________________

---

## 🐾 Pet Profile Management

### Create Pet Profile
- [ ] Navigate to `/dashboard` (while logged in)
- [ ] Click "Add Pet" or "Create Pet" button
- [ ] Fill in pet name (required)
- [ ] Select species (dog/cat)
- [ ] Optionally fill other fields (breed, age, etc.)
- [ ] Click "Save" or "Create"
- [ ] **Expected:** Pet created successfully
- [ ] **Expected:** Redirect to pet detail page or dashboard
- [ ] **Expected:** Pet appears in dashboard pet list
- [ ] **Notes:** _________________

### Pet Profile Validation
- [ ] Try to create pet without name
- [ ] **Expected:** Validation error, cannot submit
- [ ] Try to create pet without species
- [ ] **Expected:** Validation error (if required)
- [ ] **Notes:** _________________

### Edit Pet Profile
- [ ] Navigate to existing pet detail page
- [ ] Click "Edit" button
- [ ] Change pet name
- [ ] Save changes
- [ ] **Expected:** Changes saved successfully
- [ ] **Expected:** Updated info displayed
- [ ] **Notes:** _________________

### Delete Pet
- [ ] Navigate to pet detail page
- [ ] Click "Delete" button
- [ ] **Expected:** Confirmation dialog appears
- [ ] Confirm deletion
- [ ] **Expected:** Pet deleted
- [ ] **Expected:** Redirect to dashboard
- [ ] **Expected:** Pet no longer appears in list
- [ ] **Notes:** _________________

### Multiple Pets
- [ ] Create second pet
- [ ] **Expected:** Both pets appear in dashboard
- [ ] **Expected:** Can switch between pets
- [ ] **Notes:** _________________

---

## 📸 Photo Upload & Analysis

### Photo Upload - Valid File
- [ ] Navigate to pet detail page
- [ ] Click "Upload Photo" or drag-and-drop area
- [ ] Select valid JPG image (< 10MB)
- [ ] **Expected:** File selected/accepted
- [ ] **Expected:** Preview shown (if implemented)
- [ ] **Notes:** _________________

### Photo Upload - Invalid File Type
- [ ] Try to upload .txt file
- [ ] **Expected:** Error message or file rejected
- [ ] Try to upload .pdf file
- [ ] **Expected:** Error message or file rejected
- [ ] **Notes:** _________________

### Photo Upload - Large File
- [ ] Try to upload file > 10MB
- [ ] **Expected:** Error message "File size exceeds 10MB limit"
- [ ] **Expected:** File rejected, credits not deducted
- [ ] **Notes:** _________________

### Photo Upload - Invalid Formats
- [ ] Try to upload .gif (if not supported)
- [ ] **Expected:** Error or rejection
- [ ] **Notes:** _________________

### Photo Quality Validation
- [ ] Upload blurry/low-quality photo
- [ ] **Expected:** Quality check runs
- [ ] **Expected:** Warning or rejection if quality too low
- [ ] **Expected:** Credits not deducted if rejected
- [ ] **Notes:** _________________

### Analysis - Full Mode
- [ ] Upload valid photo
- [ ] Click "Analyze" or "Start Analysis"
- [ ] **Expected:** Analysis starts immediately
- [ ] **Expected:** Progress indicators visible
- [ ] **Expected:** Status messages update (Vision → Context → Synthesis → Recommendations → Voice)
- [ ] **Expected:** Analysis completes in 15-25 seconds
- [ ] **Expected:** Results display correctly
- [ ] **Notes:** _________________

### Analysis - Quick Mode
- [ ] Toggle "Quick Mode" ON (if available)
- [ ] Upload photo and start analysis
- [ ] **Expected:** Analysis completes in 5-8 seconds
- [ ] **Expected:** Basic insights displayed (no detailed recommendations)
- [ ] **Expected:** Quick mode indicator visible
- [ ] **Notes:** _________________

### Analysis Progress Indicators
- [ ] Start analysis
- [ ] **Expected:** Progress bar visible
- [ ] **Expected:** Progress percentage updates
- [ ] **Expected:** Stage messages update (e.g., "Analyzing pet's expression...")
- [ ] **Expected:** No "stuck" feeling (continuous updates)
- [ ] **Notes:** _________________

### Analysis Results Display
- [ ] Wait for analysis to complete
- [ ] **Expected:** Results page loads
- [ ] **Expected:** Behavioral insights displayed
- [ ] **Expected:** Voice selection available (7 personalities)
- [ ] **Expected:** Can listen to voice interpretation
- [ ] **Expected:** Can share results (if implemented)
- [ ] **Notes:** _________________

### Analysis History
- [ ] Complete multiple analyses for same pet
- [ ] Navigate to pet detail page
- [ ] **Expected:** Analysis history visible
- [ ] **Expected:** Can view previous analyses
- [ ] **Notes:** _________________

---

## 💳 Payment & Subscription

### View Pricing Page
- [ ] Navigate to `/subscribe`
- [ ] **Expected:** Pricing page loads
- [ ] **Expected:** All plans visible (Essential, Premium)
- [ ] **Expected:** Features listed for each plan
- [ ] **Expected:** Pricing clear and visible
- [ ] **Notes:** _________________

### Select Subscription Plan
- [ ] Click on a plan (Essential or Premium)
- [ ] **Expected:** Plan selection works
- [ ] **Expected:** Payment form loads (if logged in)
- [ ] **Expected:** Redirects to login (if not logged in)
- [ ] **Notes:** _________________

### Payment Form Display
- [ ] Navigate to checkout (after plan selection)
- [ ] **Expected:** Stripe payment form visible
- [ ] **Expected:** Card number field present
- [ ] **Expected:** Expiry date field present
- [ ] **Expected:** CVC field present
- [ ] **Expected:** Security badges visible (if implemented)
- [ ] **Notes:** _________________

### Test Payment - Success
- [ ] Enter Stripe test card: `4242 4242 4242 4242`
- [ ] Enter future expiry date (e.g., 12/25)
- [ ] Enter any 3-digit CVC (e.g., 123)
- [ ] Enter any ZIP code (e.g., 12345)
- [ ] Click "Subscribe" or "Pay"
- [ ] **Expected:** Payment processes successfully
- [ ] **Expected:** Subscription activates
- [ ] **Expected:** Premium features unlock
- [ ] **Expected:** Confirmation message displayed
- [ ] **Expected:** Redirect to dashboard or success page
- [ ] **Notes:** _________________

### Test Payment - Declined Card
- [ ] Enter Stripe test declined card: `4000 0000 0000 0002`
- [ ] Complete payment form
- [ ] Submit
- [ ] **Expected:** Error message displayed
- [ ] **Expected:** Error message is clear and helpful
- [ ] **Expected:** Can retry payment
- [ ] **Notes:** _________________

### Test Payment - Insufficient Funds
- [ ] Enter Stripe test card: `4000 0000 0000 9995`
- [ ] Complete payment form
- [ ] Submit
- [ ] **Expected:** Error message displayed
- [ ] **Expected:** Error message mentions insufficient funds
- [ ] **Notes:** _________________

### Subscription Status
- [ ] After successful payment, check subscription status
- [ ] Navigate to account/settings page
- [ ] **Expected:** Subscription status visible
- [ ] **Expected:** Plan name displayed (Essential/Premium)
- [ ] **Expected:** Billing date visible (if applicable)
- [ ] **Notes:** _________________

### Premium Features Unlock
- [ ] After subscription, check premium features
- [ ] **Expected:** Breed identification available
- [ ] **Expected:** All premium features accessible
- [ ] **Expected:** No "upgrade" prompts on premium features
- [ ] **Notes:** _________________

---

## 💰 Credit System

### Credit Deduction
- [ ] Note current credit balance
- [ ] Start analysis (upload photo and analyze)
- [ ] **Expected:** Credits deducted BEFORE analysis starts
- [ ] **Expected:** Credit balance updates immediately
- [ ] **Expected:** Analysis proceeds after deduction
- [ ] **Notes:** _________________

### Insufficient Credits
- [ ] Ensure credit balance is 0 or insufficient
- [ ] Try to start analysis
- [ ] **Expected:** Error message displayed
- [ ] **Expected:** Error message is clear (e.g., "Insufficient credits")
- [ ] **Expected:** Link to purchase credits (if available)
- [ ] **Expected:** Analysis does not start
- [ ] **Notes:** _________________

### Credit Balance Display
- [ ] Navigate to dashboard
- [ ] **Expected:** Credit balance visible
- [ ] **Expected:** Balance updates after analysis
- [ ] **Expected:** Balance updates after purchase
- [ ] **Notes:** _________________

---

## 🌐 Cross-Browser Testing

### Chrome (Desktop)
- [ ] Test all core features above in Chrome
- [ ] **Issues Found:** _________________
- [ ] **Notes:** _________________

### Safari (Desktop)
- [ ] Test all core features above in Safari
- [ ] **Issues Found:** _________________
- [ ] **Notes:** _________________

### Firefox (Desktop)
- [ ] Test all core features above in Firefox
- [ ] **Issues Found:** _________________
- [ ] **Notes:** _________________

### Edge (Desktop)
- [ ] Test all core features above in Edge
- [ ] **Issues Found:** _________________
- [ ] **Notes:** _________________

---

## 📱 Mobile Testing

### iPhone (iOS)
- [ ] Test signup/login on iPhone
- [ ] Test pet creation on iPhone
- [ ] Test photo upload (camera + gallery) on iPhone
- [ ] Test analysis flow on iPhone
- [ ] Test payment flow on iPhone
- [ ] **Expected:** Touch targets are at least 44x44px
- [ ] **Expected:** No horizontal scrolling required
- [ ] **Expected:** Text is readable without zooming
- [ ] **Issues Found:** _________________
- [ ] **Notes:** _________________

### Android Phone
- [ ] Test signup/login on Android
- [ ] Test pet creation on Android
- [ ] Test photo upload (camera + gallery) on Android
- [ ] Test analysis flow on Android
- [ ] Test payment flow on Android
- [ ] **Expected:** Touch targets are at least 44x44px
- [ ] **Expected:** No horizontal scrolling required
- [ ] **Expected:** Text is readable without zooming
- [ ] **Issues Found:** _________________
- [ ] **Notes:** _________________

### iPad/Tablet
- [ ] Test core features on iPad
- [ ] **Expected:** Layout adapts to tablet size
- [ ] **Expected:** Features remain usable
- [ ] **Issues Found:** _________________
- [ ] **Notes:** _________________

---

## 🐛 Error Handling

### Network Errors
- [ ] Disconnect internet during analysis
- [ ] **Expected:** Error message displayed
- [ ] **Expected:** Error message is helpful
- [ ] **Expected:** Can retry operation
- [ ] **Notes:** _________________

### API Errors
- [ ] Trigger API error (if possible)
- [ ] **Expected:** User-friendly error message
- [ ] **Expected:** No technical jargon exposed
- [ ] **Expected:** Suggests how to fix or retry
- [ ] **Notes:** _________________

### 404 Pages
- [ ] Navigate to non-existent page (e.g., `/not-found`)
- [ ] **Expected:** 404 page displayed or redirect to home
- [ ] **Expected:** Can navigate back to valid pages
- [ ] **Notes:** _________________

### Form Validation Errors
- [ ] Submit forms with invalid data
- [ ] **Expected:** Errors appear near relevant fields
- [ ] **Expected:** Error messages are clear
- [ ] **Expected:** Can correct errors easily
- [ ] **Notes:** _________________

---

## 📊 Summary

### Critical Bugs Found
1. _________________
2. _________________
3. _________________

### High Priority Issues
1. _________________
2. _________________
3. _________________

### Browser-Specific Issues
- **Chrome:** _________________
- **Safari:** _________________
- **Firefox:** _________________
- **Edge:** _________________

### Mobile-Specific Issues
- **iOS:** _________________
- **Android:** _________________

### Overall Assessment
- **Core Features Functional:** ✅ / ❌
- **Payment Processing Works:** ✅ / ❌
- **Mobile Experience Acceptable:** ✅ / ❌
- **Cross-Browser Compatible:** ✅ / ❌

**Phase 1 Readiness:** ✅ Ready for Phase 2 / ❌ Needs fixes

---

**Completed By:** ___________  
**Date Completed:** ___________  
**Next Steps:** _________________

