---
name: Bharat-Tech Artisan Nexus
colors:
  surface: '#f7f9fc'
  surface-dim: '#d8dadd'
  surface-bright: '#f7f9fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f7'
  surface-container: '#eceef1'
  surface-container-high: '#e6e8eb'
  surface-container-highest: '#e0e3e6'
  on-surface: '#191c1e'
  on-surface-variant: '#444651'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f4'
  outline: '#747682'
  outline-variant: '#c4c6d2'
  surface-tint: '#3f5ba3'
  primary: '#001645'
  on-primary: '#ffffff'
  primary-container: '#002970'
  on-primary-container: '#7893df'
  inverse-primary: '#b3c5ff'
  secondary: '#006686'
  on-secondary: '#ffffff'
  secondary-container: '#2bc6ff'
  on-secondary-container: '#004f69'
  tertiary: '#3e0002'
  on-tertiary: '#ffffff'
  tertiary-container: '#650006'
  on-tertiary-container: '#ff6157'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae1ff'
  primary-fixed-dim: '#b3c5ff'
  on-primary-fixed: '#001849'
  on-primary-fixed-variant: '#25438a'
  secondary-fixed: '#c0e8ff'
  secondary-fixed-dim: '#71d2ff'
  on-secondary-fixed: '#001e2b'
  on-secondary-fixed-variant: '#004d66'
  tertiary-fixed: '#ffdad6'
  tertiary-fixed-dim: '#ffb4ab'
  on-tertiary-fixed: '#410002'
  on-tertiary-fixed-variant: '#93000d'
  background: '#f7f9fc'
  on-background: '#191c1e'
  surface-variant: '#e0e3e6'
  trust-blue: '#002970'
  action-cyan: '#00BAF2'
  heritage-red: '#E31E24'
  surface-gray: '#F4F4F4'
  deep-ink: '#000000'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-md:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  container-max: 1280px
---

## Brand & Style

The design system embodies a fusion of **High-Tech Modernism** and **Cultural Empowerment**. It bridges the gap between traditional Indian craftsmanship and global AI-driven commerce. The aesthetic is "Techno-Heritage"—clean, white-space heavy layouts (inspired by get.ru) punctuated by high-trust financial accents (inspired by Paytm).

The interface should evoke a sense of professional reliability and technological sophistication. We use a **Minimalist Modern** style characterized by:
- **Expansive Whitespace:** To allow intricate product photography of hand-crafted goods to breathe.
- **Precision Engineering:** Sharp execution of functional elements to signal AI-powered accuracy.
- **Cultural Texture:** Subtle use of traditional Indian patterns (like Mandalas or Warli line art) as low-opacity decorative watermarks behind high-tech data visualizations.
- **Global Professionalism:** A layout that feels at home in both a rural artisan's hand and a luxury buyer's corporate office.

## Colors

The palette is anchored in **Deep Trust Blue (#002970)**, ensuring a secure financial atmosphere for cross-border trade. **Action Cyan (#00BAF2)** is utilized for primary interactions and "AI-active" states, providing a vibrant, modern energy.

**Heritage Red (#E31E24)** serves as a high-contrast accent for authenticity markers and critical alerts, subtly nodding to traditional Indian pigments. The neutral foundation relies on **#F7F9FC**, creating a cool, professional canvas that feels cleaner and more modern than standard grays. Surfaces use **#FFFFFF** with light gray borders to maintain the structured look of a high-end marketplace.

## Typography

This design system utilizes **Hanken Grotesk** for headlines to provide a sharp, contemporary "tech" feel that remains highly readable. **Inter** is the workhorse for body text and functional UI, chosen for its exceptional clarity in data-heavy environments and financial widgets.

- **Display & Headlines:** Use Hanken Grotesk with tighter letter spacing for a premium, editorial look.
- **Body & Captions:** Use Inter with standard tracking to ensure accessibility across all device types.
- **Data Points:** Currency values and AI confidence scores should use medium weights of Inter to emphasize "Trustworthy & Secure" data.

## Layout & Spacing

The layout follows a **Fixed-Fluid Hybrid Grid**. On desktop, content is contained within a 1280px max-width container to maintain the "Get.ru" minimalist control. On smaller devices, it transitions to a fluid 4-column grid.

- **The 8px Rule:** All dimensions, padding, and margins must be multiples of 8px.
- **Vertical Rhythm:** Use generous vertical padding (64px+) between major homepage sections to reinforce the premium, "gallery" feel of the marketplace.
- **Card Spacing:** Product grids utilize a 24px gutter to ensure individual artisan works are distinct and not cluttered.

## Elevation & Depth

To maintain a modern, flat aesthetic with depth, the design system uses **Tonal Layering** and **Subtle Glassmorphism**:

- **Tier 1 (Surface):** The main background (#F7F9FC).
- **Tier 2 (Raised):** White cards (#FFFFFF) with a thin 1px border (#E5E7EB) and no shadow for a clean, "tech" look.
- **Tier 3 (Overlay):** Used for AI-modals or multi-currency widgets. These use a background blur (12px) and a soft, low-opacity shadow (Color: #002970, Alpha: 4%) to create a sense of focused floating without appearing heavy.
- **Authenticity Layer:** Elements like the "Authenticity Passport" should have a subtle inner glow or a very soft tint of Action Cyan to differentiate them from standard product info.

## Shapes

The shape language is **Rounded (0.5rem base)**. This balance avoids the aggressive "sharpness" of pure brutalism while maintaining a more professional stance than "bubbly" consumer apps.

- **Buttons & Inputs:** 8px (0.5rem) corner radius.
- **Product Cards:** 16px (1rem) corner radius to create a soft frame for the photography.
- **Verification Tags:** Fully pill-shaped (rounded-full) to represent "Certified" status, drawing on the familiarity of trusted financial badges.

## Components

### Buttons
- **Primary:** Deep Trust Blue background with white text. High-contrast, rectangular but with 8px rounded corners.
- **Secondary (AI Actions):** Action Cyan border with a subtle 5% tint background. Used for "Generate AI Description" or "Calculate Shipping."

### Authenticity Passport
A signature component. A card featuring a 1px Heritage Red border, a subtle patterned background watermark, and a "Verified by Saras AI" badge. It includes a QR code area and a digital signature field.

### Product Listings
Minimalist layout. Large image top-aligned, title in Hanken Grotesk, and a "Craft Origin" label (e.g., "Kanchipuram, TN") in a small, capitalized label-sm format.

### Multi-Currency Widget
A clean, compact toggle or dropdown. Uses Inter font for numerical clarity. Shows the base INR price alongside the converted global currency (USD, EUR, JPY) using a soft-gray secondary text style.

### Input Fields
Strictly "Get.ru" style—clean, 1px border, high-contrast focus state using Action Cyan. Label is positioned above the field, never inside as a placeholder.

### Chips & Tags
Used for material types (e.g., "Silk," "Terracotta"). These use Surface-gray backgrounds with Deep-ink text. When an AI filter is active, the chip glows with a soft Cyan outline.