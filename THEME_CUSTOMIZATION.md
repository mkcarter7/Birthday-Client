# Theme Customization Guide

This template is designed to be easily customizable for each birthday party. Here's how to customize the theme:

## Quick Customization

### 1. Basic Party Info
Update these in your `.env.local` file:

```bash
# Party Details
NEXT_PUBLIC_PARTY_NAME=Your Party Name
NEXT_PUBLIC_PARTY_DATE=Your Date
NEXT_PUBLIC_PARTY_TIME=Your Time
NEXT_PUBLIC_PARTY_LOCATION=Your Location
NEXT_PUBLIC_PARTY_THEME=Your Theme

# Social Links
NEXT_PUBLIC_FACEBOOK_LIVE_URL=your-facebook-live-url
NEXT_PUBLIC_VENMO_USERNAME=your-venmo-username

# Required: Party ID from Django backend
NEXT_PUBLIC_PARTY_ID=your-party-uuid-here
```

### 2. Color Customization
Customize the main colors in your `.env.local`:

```bash
# Theme Colors
NEXT_PUBLIC_PRIMARY_COLOR=#your-main-color
NEXT_PUBLIC_SECONDARY_COLOR=#your-secondary-color
NEXT_PUBLIC_ACCENT_COLOR=#your-accent-color
```

## Color Examples

### Princess Theme
```bash
NEXT_PUBLIC_PRIMARY_COLOR=#EC4899    # Pink
NEXT_PUBLIC_SECONDARY_COLOR=#8B5CF6  # Purple
NEXT_PUBLIC_ACCENT_COLOR=#F59E0B     # Gold
```

### Ocean Theme
```bash
NEXT_PUBLIC_PRIMARY_COLOR=#0EA5E9    # Sky Blue
NEXT_PUBLIC_SECONDARY_COLOR=#06B6D4  # Cyan
NEXT_PUBLIC_ACCENT_COLOR=#F59E0B     # Orange
```

### Forest Theme
```bash
NEXT_PUBLIC_PRIMARY_COLOR=#059669    # Green
NEXT_PUBLIC_SECONDARY_COLOR=#10B981  # Emerald
NEXT_PUBLIC_ACCENT_COLOR=#F59E0B     # Orange
```

### Space Theme
```bash
NEXT_PUBLIC_PRIMARY_COLOR=#6366F1    # Indigo
NEXT_PUBLIC_SECONDARY_COLOR=#8B5CF6  # Purple
NEXT_PUBLIC_ACCENT_COLOR=#F59E0B     # Gold
```

## Advanced Customization

### Custom CSS
For more advanced styling, you can override CSS custom properties in `src/styles/theme.css`:

```css
:root {
  --party-primary: #your-color;
  --party-secondary: #your-color;
  --party-accent: #your-color;
  --party-gradient-primary: linear-gradient(135deg, var(--party-primary), var(--party-secondary));
}
```

### Custom Messages
Customize messages in your `.env.local`:

```bash
NEXT_PUBLIC_WELCOME_MESSAGE=Your custom welcome message
NEXT_PUBLIC_RSVP_MESSAGE=Your custom RSVP message
NEXT_PUBLIC_GIFT_MESSAGE=Your custom gift message
```

## How Colors Are Used

- **Primary Color**: Main buttons, links, headers
- **Secondary Color**: Secondary buttons, accents
- **Accent Color**: Highlights, special elements

## Getting Started

1. Copy `env.example` to `.env.local`
2. Update the party details
3. Customize the colors
4. Restart your development server: `npm run dev`

That's it! Your birthday website is now customized for your party.
