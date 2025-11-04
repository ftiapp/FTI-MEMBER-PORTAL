# Navbar Component Structure

## Overview
Simple and modular navbar component with all essential features: **larger logo**, better spacing, menu items, icons, and blue-white color scheme.

## File Structure
```
Navbar/
├── index.js          # Main navbar component
├── Logo.js           # FTI logo component (240x50px)
├── MenuIcons.js      # Icon definitions for menu items
├── MenuItem.js       # Individual menu item component
├── ActionButton.js   # Styled button component
├── UserMenu.js       # User dropdown menu
├── LogoutModal.js    # Logout confirmation modal
├── MobileMenu.js     # Mobile responsive menu
└── README.md         # This documentation
```

## Components

### Logo.js
- Displays **larger FTI logo** (240x50px) with proper alt text
- Simple Next.js Image component
- Links to home page

### MenuIcons.js
- Centralized icon definitions
- SVG icons for all menu items
- Easy to maintain and update

### MenuItem.js
- Reusable menu item component
- Includes icon and text
- Active state styling with blue gradient
- Hover effects

### ActionButton.js
- Styled button with multiple variants:
  - `primary`: Blue gradient for main actions
  - `secondary`: Gray for secondary actions  
  - `search`: Green for search functionality
- Supports external links

### UserMenu.js
- User profile dropdown
- Shows user name and email
- Links to user info, email change, contact
- Logout button

### LogoutModal.js
- Confirmation modal for logout
- Motion animations
- Confirm/Cancel buttons

### MobileMenu.js
- Responsive mobile menu
- Organized sections with headers
- All desktop functionality available
- Touch-friendly interface

### index.js
- Main navbar component
- **Improved layout with better spacing**
- **80px height** to accommodate larger logo
- **Flexible layout** prevents menu squeezing
- Handles state management
- Responsive design logic

## Features
- ✅ **Larger logo** (240x50px vs 160x35px)
- ✅ **Better spacing** - menu items no longer squeezed
- ✅ **"ชำระเงินออนไลน์"** instead of "ชำระเงิน"
- ✅ **Proper icon-text alignment** - icons and text on same line
- ✅ Responsive design (desktop/mobile)
- ✅ Blue and white color scheme
- ✅ Logo with proper branding
- ✅ Menu icons for all items
- ✅ User authentication states
- ✅ External links (payment, search)
- ✅ Smooth animations
- ✅ Accessibility features
- ✅ TypeScript compatible

## Usage
```javascript
import Navbar from './components/Navbar';

// Use in layout or page
<Navbar />
```

## Styling
- Uses Tailwind CSS
- Blue gradient theme (`from-blue-600 to-blue-700`)
- Smooth transitions and hover effects
- Mobile-first responsive design
- **80px navbar height** for better proportions
