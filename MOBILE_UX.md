# Mobile UX @ ≤768px

## Overview

TuneIn has been fully optimized for mobile devices with viewports ≤768px, providing an intuitive touch-first experience while maintaining all desktop functionality.

## Key Features

### Mobile Breakpoint Contract
- **Breakpoint**: `window.innerWidth <= 768px`
- **Hook**: `useIsMobile()` detects mobile and updates on resize/orientation change
- **Tailwind**: Uses `md:hidden` for mobile-only, `md:` for ≥768px styles

### Bottom Navigation
- **Fixed bottom tab bar** with 4 primary actions: Home, Moods, Timer, More
- **Floating Action Button (FAB)** for Start/Stop session (centered above tab bar)
- **Safe area aware** with `pb-safe` utility for devices with home indicators
- **44×44px minimum tap targets** for accessibility

### Gesture Support
- **Swipe left/right** in PlayerSheet for track navigation
- **Swipe up** from mini-player to open PlayerSheet
- **Swipe down** to close sheets
- **Long-press FAB** for quick mood switcher
- **Optional gestures** - can be disabled in settings for accessibility

### Mobile Sheets
- **Bottom sheet architecture** replaces desktop sidebars
- **PlayerSheet**: Full music controls, queue, artwork
- **MoodSheet**: Focus mode selection with descriptions
- **MoreSheet**: Settings, help, volume, app info
- **Focus trap** and keyboard navigation support

### Responsive Layout
- **Single-column** layout on mobile (no sidebars)
- **Larger timer display** (48×48 timer circle vs 40×40 desktop)
- **Enhanced tap targets** (14×14 buttons vs 12×12 desktop)
- **Content padding** adjusted for mobile viewing
- **Bottom spacing** to account for navigation bar

### Keyboard Shortcuts
- **Hidden on mobile** - no visual hints or tooltips
- **Handlers disabled** on mobile to prevent conflicts
- **Touch equivalents** for all keyboard actions

## Implementation Details

### Core Components
```
src/hooks/use-mobile.js          - Mobile detection hook
src/components/MobileNav.jsx     - Bottom navigation bar
src/components/PlayerSheet.jsx   - Music player bottom sheet
src/components/MoodSheet.jsx     - Mood selection sheet
src/components/MoreSheet.jsx     - Settings and options sheet
src/components/Sheet.jsx         - Reusable bottom sheet primitive
src/state/ui.js                  - Mobile UI state persistence
```

### CSS Utilities
```css
.pb-safe { padding-bottom: max(env(safe-area-inset-bottom), 16px); }
.tap-target { min-width: 44px; min-height: 44px; }
```

### State Persistence
Mobile preferences are automatically saved to localStorage:
- Last selected mood
- Timer duration preferences
- Volume level
- Gesture settings (on/off)
- Sheet open states

### Performance Optimizations
- **Lazy loading** of non-critical mobile components
- **Touch event optimization** with passive listeners where appropriate
- **Layout measurement caching** to avoid thrash
- **Prefers-reduced-motion** support for accessibility

## User Experience

### One-Hand Operation
- All primary actions reachable with thumb on standard phone sizes
- FAB positioned for easy thumb access
- Swipe gestures reduce need for precise tapping

### Session Flow
1. **Start**: Tap FAB or select mood from sheet
2. **Control**: Use mini-player or expand PlayerSheet
3. **Monitor**: Timer visible in all views
4. **Adjust**: Long-press FAB for quick mood changes

### Accessibility
- **ARIA labels** and roles for all interactive elements
- **Focus management** in sheets and modals
- **High contrast** maintained (4.5:1 minimum)
- **Screen reader** compatible
- **Gesture alternatives** always available

## Testing Matrix

### Device Coverage
- iPhone 13/14/15 (390×844)
- iPhone 15 Pro Max (430×932)
- Pixel 6/7 (393×851)
- Galaxy S22/S24 (360×800)
- iPad Mini portrait (768×1024)

### Scenarios Tested
- Portrait and landscape orientations
- Dynamic island and notch handling
- Safe area insets on various devices
- Text scaling 100-150%
- Reduced motion preference
- Touch/gesture interactions

### Performance Targets
- **TTI < 2.5s** on mid-range Android
- **Lighthouse Mobile ≥ 90** (Performance, Accessibility, Best Practices)
- **No horizontal scroll** at any mobile width
- **Smooth 60fps animations** on gesture interactions

## Configuration

### Gesture Settings
Users can disable gestures in More > Gestures toggle for accessibility or preference.

### Debug Mode
Add `?debug=mobile` to URL for mobile simulation on desktop (dev only).

### Feature Flags
- `gesturesEnabled`: Toggle swipe gestures (default: true)
- `playerSheetEnabled`: Toggle player sheet functionality (default: true)

## Browser Support

### Minimum Requirements
- iOS Safari 14+
- Chrome Android 90+
- Samsung Internet 15+
- Firefox Mobile 92+

### PWA Features
- Haptic feedback on supported devices
- Safe area handling for fullscreen mode
- Home screen installation support

## Known Limitations

1. **Haptic feedback** requires PWA installation on iOS
2. **Pull-to-refresh** disabled in sheets to prevent conflicts
3. **Volume control** in PlayerSheet affects media volume only
4. **Landscape optimization** primarily designed for portrait

## Future Enhancements

- Split-screen multitasking support
- Picture-in-picture timer widget
- Voice control integration
- Advanced gesture customization
- Tablet-specific layouts for larger screens