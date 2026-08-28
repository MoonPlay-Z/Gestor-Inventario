---
name: Mechanical Precision
colors:
  surface: '#f7fafc'
  surface-dim: '#d7dadc'
  surface-bright: '#f7fafc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f4f6'
  surface-container: '#ebeef0'
  surface-container-high: '#e5e9eb'
  surface-container-highest: '#e0e3e5'
  on-surface: '#181c1e'
  on-surface-variant: '#43474e'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eef1f3'
  outline: '#74777f'
  outline-variant: '#c4c6cf'
  surface-tint: '#455f88'
  primary: '#002045'
  on-primary: '#ffffff'
  primary-container: '#1a365d'
  on-primary-container: '#86a0cd'
  inverse-primary: '#adc7f7'
  secondary: '#0a6c44'
  on-secondary: '#ffffff'
  secondary-container: '#9ff5c1'
  on-secondary-container: '#167249'
  tertiary: '#4b0005'
  on-tertiary: '#ffffff'
  tertiary-container: '#73000c'
  on-tertiary-container: '#ff736c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#adc7f7'
  on-primary-fixed: '#001b3c'
  on-primary-fixed-variant: '#2d476f'
  secondary-fixed: '#9ff5c1'
  secondary-fixed-dim: '#83d8a6'
  on-secondary-fixed: '#002111'
  on-secondary-fixed-variant: '#005231'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3ad'
  on-tertiary-fixed: '#410004'
  on-tertiary-fixed-variant: '#930013'
  background: '#f7fafc'
  on-background: '#181c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-mono:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style

This design system is built for high-utility professional environments where accuracy and efficiency are paramount. Rooted in the **Corporate / Modern** aesthetic with a lean toward functional minimalism, it bridges the gap between automotive ruggedness and data-driven engineering.

The UI communicates reliability through structured information density and clear hierarchies. It targets automotive professionals and administrative staff who require immediate clarity in inventory levels and billing statuses. The emotional response should be one of "controlled precision"—every element has a purpose, every interaction feels sturdy and intentional.

## Colors

The palette is anchored by a deep navy primary color to establish authority and trust, directly inspired by traditional industrial engineering and the automotive sector. 

- **Primary (#1a365d):** Used for global navigation, headers, and high-importance actions (e.g., "Create Invoice").
- **Success/Secondary (#2f855a):** A vibrant green specifically reserved for "Paid" statuses, positive inventory adjustments, and confirmation actions.
- **Surface/Neutral (#f7fafc):** A cool-toned gray background that minimizes eye strain during long working hours and provides contrast for white cards.
- **Alert/Tertiary (#e53e3e):** Used sparingly for "Overdue" invoices or "Low Stock" warnings.

## Typography

We utilize **Inter** across the entire system for its exceptional legibility and neutral, systematic character. The typography system prioritizes information hierarchy, ensuring that invoice numbers and totals are immediately scannable.

Use `label-caps` for table headers and section metadata to differentiate them from actionable or primary content. The `data-mono` style should be applied to alphanumeric codes like RIF, Part Numbers, and Transaction Hashes to ensure characters like '0' and 'O' are distinguishable.

## Layout & Spacing

This design system uses a **Fluid Grid** for dashboard views and a **Fixed Width (Centered)** layout for document-centric views like Invoice generation. 

- **Desktop:** 12-column grid with 24px gutters. Sidebars are fixed at 280px.
- **Tablet:** 8-column grid with 16px gutters.
- **Mobile:** 4-column grid with 16px gutters and 16px side margins.

Information density is "Moderate-to-High." Data tables should use condensed vertical padding (8px) to allow more rows to be visible above the fold, whereas administrative forms should use wider spacing (24px) to prevent input errors.

## Elevation & Depth

To maintain a clean and professional look, depth is communicated through **low-contrast outlines** and **subtle ambient shadows**. 

Surface layers are defined as:
1. **Level 0 (Background):** #f7fafc - The base canvas.
2. **Level 1 (Cards):** #ffffff - Used for the primary content blocks and data tables. These feature a 1px border (#e2e8f0) and a soft, diffused shadow (0 4px 6px -1px rgba(0,0,0,0.05)).
3. **Level 2 (Modals/Popovers):** #ffffff - These use a higher elevation shadow (0 10px 15px -3px rgba(0,0,0,0.1)) to draw focus.

Avoid heavy gradients or skeuomorphism. Depth should feel like stacked sheets of paper.

## Shapes

The shape language is **Soft (0.25rem)**. This slight rounding takes the "sharp edge" off the industrial data while maintaining a professional, boxy structure that fits the automotive theme.

- **Standard Buttons & Inputs:** 4px radius.
- **Data Cards:** 8px radius (`rounded-lg`).
- **Status Chips:** 100px (Pill) to differentiate them from actionable buttons.

## Components

### Buttons
- **Primary:** Solid #1a365d with white text. High emphasis.
- **Secondary:** Outline #1a365d with 1px border. Low emphasis.
- **Success:** Solid #2f855a, used exclusively for final "Payment Received" or "Complete" actions.

### Data Tables
Tables are the heart of this system. Use a solid Primary-colored header with white uppercase text for clarity. Rows should alternate with a very light tint (#f8fafc) on hover to help track data across wide screens.

### Inputs
Text fields use a 1px light gray border that thickens and changes to the Primary blue on focus. Always include clear labels above the field and placeholder text that provides an example of the expected data (e.g., "e.g. Dodge Ram 2500").

### Status Chips
Used for "Paid", "Pending", or "Stock Level."
- **Paid:** Background: #c6f6d5 (Success Light), Text: #22543d (Success Dark).
- **Draft:** Background: #edf2f7, Text: #2d3748.

### Cards
Cards are used to group related invoice details (e.g., Client Info, Control Details). They must feature a 1px border and a subtle shadow. Each card should have a clear, bold title at the top left.