lets # Dark Mode Theme Guide

## Color Scheme
- **Light Mode Background**: `#F5F1E6` (tan/cream)
- **Dark Mode Background**: `#003366` (dark blue)
- **White elements in light mode** → `bg-[#F5F1E6]` in dark mode
- **Gray-50 backgrounds** → `bg-[#F5F1E6] dark:bg-[#003366]`

## Pattern to Follow

### Page Backgrounds
```jsx
// Before
className="min-h-screen bg-gray-50"

// After  
className="min-h-screen bg-[#F5F1E6] dark:bg-[#003366] transition-colors duration-300"
```

### Card/Container Backgrounds
```jsx
// Before
className="bg-white shadow rounded-lg"

// After
className="bg-white dark:bg-[#002244] shadow rounded-lg transition-colors duration-300"
```

### Text Colors
```jsx
// Auto-handled by body in index.css
// But for specific elements:
className="text-gray-900 dark:text-white"
```

## Files to Update
- [x] index.css - Already configured
- [ ] LoginPage.jsx
- [ ] RegisterPage.jsx  
- [ ] OnboardingPage.jsx
- [ ] PhoneLoginPage.jsx
- [ ] VendorLogin.jsx
- [ ] BecomeVendorPage.jsx
- [ ] PricingPage.jsx
- [ ] VendorPricingPage.jsx
- [ ] VendorDashboard.jsx
- [ ] AdminDashboard.jsx
- [ ] Profile.jsx
- [ ] SubscriptionSuccess.jsx
- [ ] SubscriptionCancel.jsx
