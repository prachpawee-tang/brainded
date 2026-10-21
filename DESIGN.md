---
name: Brain (codename)
description: A pocket companion for everything you want to remember.
colors:
  violet-pop: "#6d4aff"
  violet-pop-night: "#9d85ff"
  lavender-wash: "#ece7ff"
  lavender-wash-night: "#2a2440"
  oat-paper: "#faf7f2"
  night-paper: "#141311"
  card-white: "#ffffff"
  card-night: "#1d1b18"
  oat-shade: "#f2eee7"
  oat-shade-night: "#26231f"
  hairline: "#e7e1d8"
  hairline-night: "#2f2c28"
  ink: "#1c1a17"
  ink-night: "#f4f1ec"
  pencil: "#66615a"
  pencil-night: "#a8a29a"
  leaf: "#1f8a5b"
  honey: "#b7791f"
  berry: "#d93b3b"
  apricot: "#e8833a"
  apricot-night: "#f5a05a"
typography:
  display:
    fontFamily: "IBMPlexSansThai_700Bold, system-ui, sans-serif"
    fontSize: "36px"
    fontWeight: 700
    lineHeight: "46px"
  title:
    fontFamily: "IBMPlexSansThai_700Bold, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: "38px"
  heading:
    fontFamily: "IBMPlexSansThai_500Medium, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 500
    lineHeight: "27px"
  body:
    fontFamily: "IBMPlexSansThai_400Regular, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
  caption:
    fontFamily: "IBMPlexSansThai_400Regular, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "21px"
  label:
    fontFamily: "IBMPlexSansThai_500Medium, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: "21px"
rounded:
  sm: "8px"
  md: "12px"
  lg: "20px"
  xl: "28px"
  full: "9999px"
spacing:
  unit: "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.violet-pop}"
    textColor: "{colors.card-white}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    height: "48px"
    padding: "0 20px"
  button-secondary:
    backgroundColor: "{colors.lavender-wash}"
    textColor: "{colors.violet-pop}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    height: "48px"
    padding: "0 20px"
  button-ghost:
    textColor: "{colors.violet-pop}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    height: "48px"
    padding: "0 20px"
  button-danger:
    backgroundColor: "{colors.berry}"
    textColor: "{colors.card-white}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    height: "48px"
    padding: "0 20px"
  text-field:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    height: "48px"
    padding: "0 16px"
  tile:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "16px"
  segmented-control:
    backgroundColor: "{colors.oat-shade}"
    rounded: "{rounded.lg}"
    padding: "4px"
  segmented-option-selected:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    height: "36px"
  switch-on:
    backgroundColor: "{colors.violet-pop}"
    rounded: "{rounded.full}"
    width: "48px"
    height: "28px"
  switch-off:
    backgroundColor: "{colors.hairline}"
    rounded: "{rounded.full}"
    width: "48px"
    height: "28px"
---

# Design System: Brain (codename)

<!-- Source of truth for values: packages/ui/src/tokens/*.ts (generates packages/ui/theme.css). This file describes how to use them. If they disagree, the code wins and this file is stale. -->

## Overview

**Creative North Star: "The Pocket Companion"**

Brain is a small, warm companion that lives in your pocket. It is always ready and never loud. The surface is calm: warm oat paper, ink-dark text, thin hairlines, and lots of room around every element. The personality appears when you touch it. Buttons squish softly, toggles slide, and finished actions give a small reward. Copy talks like a friend. The interface stays quiet so the user's own life (pets, notes, plans) is what fills the screen.

The system is mobile-first and one-handed. Everything important sits within thumb reach. The design is identical on iOS, Android, and web, with no per-OS styling. Each life module gets one accent color. The accent appears on the module's tile and in its own screens, so the user always knows where they are. Violet is the app's own voice, used for actions, never for decoration.

Fun is a reaction, not decoration. A screen at rest should look almost plain. Delight comes from motion, emoji, empty-state wording, and small success moments.

**Key Characteristics:**
- Warm paper background, white cards, hairline borders, no drop shadows at rest.
- One violet action color plus one accent per module.
- Generous rounding: rounded corners on controls and cards, full pills on toggles.
- IBM Plex Sans Thai throughout, with tall line heights so Thai script never clips.
- Two icon voices. **Line icons (lucide, 2px stroke)** are used for interface controls: back, settings, edit, add, close, delete. **Emoji** are reserved for content identity (module tiles, pet avatars, timeline kinds), where they add warmth.
- Soft, springy feedback on press. Every interaction must stay usable with reduce-motion on.

## Colors

A warm, low-saturation paper base with one saturated violet for actions. Each module gets its own fruit-like accent.

### Primary
- **Violet Pop** (light / night): the only color for primary actions, selected states, links, and the "on" state of toggles. It must meet AA contrast as text on paper and under white text.
- **Lavender Wash** (light / night): the soft violet background behind secondary buttons and selected chips. Put violet text on it, never ink text.

### Secondary
- **Apricot** (light / night): the Pets module accent. It is used for the module's tile icon bubble and as the accent inside Pets screens. Future modules get their own accent through `moduleColors` (one per module id).

### Neutral
- **Oat Paper / Night Paper**: the screen background.
- **Card White / Card Night**: the background for cards, tiles, inputs, and the selected segment, one step above the paper.
- **Oat Shade**: recessed surfaces, such as the segmented-control track.
- **Hairline**: 1px borders on cards, inputs, dividers, and the "off" track of a switch.
- **Ink**: primary text.
- **Pencil**: secondary text, field labels, and captions. It meets AA on both paper and card surfaces.

### Status
- **Leaf**: success. **Honey**: warning, or the "checking" status. **Berry**: errors, destructive buttons, and field error text.

**The One Voice Rule.** Violet means "you can act here". Never use it for decoration, illustration, or headings.

**The Semantic-Only Rule.** Components use only semantic tokens (`bg-surface`, `text-text-muted`, `bg-module-pets`). Raw palette classes (`bg-blue-500`) and hex values inside components are forbidden. The one exception is a module accent passed as data, such as the Tile `accentColor` prop.

**The Contrast-Is-Tested Rule.** Text/surface pairs are checked against WCAG AA by unit tests in both themes. A new color pair either joins that test or isn't shipped.

## Typography

**Display Font:** IBM Plex Sans Thai Bold
**Body Font:** IBM Plex Sans Thai Regular and Medium

**Character:** One humanist family that handles Thai and Latin equally well. It reads friendly without being childish.

### Hierarchy
- **Display** (700, 36px / 46px): the single greeting or screen hero. At most one per screen. It is announced as a header.
- **Title** (700, 28px / 38px): screen titles such as "Settings". It is announced as a header.
- **Heading** (500, 18px / 27px): section and tile titles.
- **Body** (400, 16px / 24px): default text, inputs, and buttons.
- **Caption** (400, 14px / 21px): secondary info, helper text, and errors.
- **Label** (500, 14px / 21px): field labels and segment labels. Section labels in Settings use uppercase with wide tracking.

**The Thai Line-Height Rule.** Never reduce line height below the token. Thai vowel and tone marks stack above and below the line and clip easily.

**The One Hero Rule.** Use only one display line per screen. Everything else steps down.

## Layout

The layout uses a 4px base grid. The common rhythm is 8 / 12 / 16 / 24 / 32px. Screens use `ScreenLayout`: a single scrolling column with 24px side padding and 32px gaps between sections. Safe-area insets are added to the top and bottom padding, and the column is keyboard-aware. On web and tablets, the column is capped at a readable width (max-w-xl) and centered. It never stretches into wide desktop layouts.

Auth and placeholder screens center their content vertically. Signed-in screens start at the top, with the hero line first and the actions below it.

**The Thumb Rule.** Primary actions sit low and wide: full-width buttons, 48px tall. Small header actions use the 36px `sm` button with an 8px hit slop.

## Elevation & Depth

The system is flat. Depth comes from tone, not shadow. Paper is the bottom layer, white cards and inputs sit one step up, and recessed tracks (Oat Shade) sit one step down. Hairline borders separate surfaces. A small shadow appears only on elements that physically move inside a track: the switch knob and the selected segment.

**The Flat-At-Rest Rule.** Cards, tiles, and inputs never have drop shadows. If something needs to stand out, give it a tone step or the accent color.

## Shapes

The corners are soft and generous: 8px (small elements), 12px (inputs and segments), 20px (buttons and module icon bubbles), and 28px (cards, tiles, and large empty-state containers). Toggles and status chips are full pills. Borders are always 1px hairlines. Empty states use a dashed hairline border to signal "fill me".

## Components

### Buttons
Buttons are tactile and confident, and they react to every touch.
- **Shape:** rounded corners (20px), heights 36 / 48 / 56px for sizes sm / md / lg.
- **Primary:** Violet Pop background with white label. Use one per screen area for the main action.
- **Secondary:** Lavender Wash background with violet label. Use it for alternative actions, such as "Continue with Google" or "Connect Google".
- **Ghost:** transparent with violet label. Use it for navigation and low-stakes actions ("Back", "Settings", "Sign out").
- **Danger:** Berry background with white label. Use it for destructive actions.
- **Press:** scales to 95% and dims slightly. **Disabled:** 50% opacity. **Loading:** a spinner appears next to the label, and the button is busy and blocks presses.

### Icon Buttons
Use these to keep chrome quiet.
- A 44×44px round, icon-only button. Its label is required and becomes the accessible name.
- **Ghost** (default) is for header navigation and secondary actions. **Soft** (Lavender Wash behind a violet icon) is for "add" in section headers. **Primary** is for a lone main action.
- **The Words-Earn-Their-Place Rule.** Chrome actions with universally understood meaning (back, settings, edit, add, close, delete, see all) are icon-only. Primary task buttons keep a short label next to an icon (e.g. "Weight"). Destructive or unusual actions keep full words (e.g. "Archive this pet", "Sign out").

### Text Fields
- **Style:** card-colored background, 1px hairline border, 12px corners, 48px tall. A medium-weight label sits above the input and is also its accessible name.
- **Focus:** the border turns violet.
- **Error:** the border turns Berry, and an error caption below is announced as an alert. Error text is always translated from a code, never raw server text.

### Tiles
Tiles are the module doorway.
- **Corner style:** 28px. **Background:** Card White with a hairline border. **Padding:** 16px.
- **Anatomy:** a 48px rounded-square icon bubble in the module accent, holding the module emoji. Next to it are a heading title and a two-line caption, with a "›" chevron at the end.
- **Press:** scales to 98%. The whole tile is one button whose accessible name is the module name.

### Segmented Control
- **Track:** Oat Shade, 20px corners, 4px inset.
- **Options:** radio semantics. The selected option is a Card White pill with a small shadow and ink label. Unselected options show a pencil label on the track.
- Use it for 2–3 mutually exclusive settings (language, theme). Show language names in their own language.

### Switch
- A 48×28px pill. **On:** violet track, knob slid right. **Off:** hairline track. The knob is a card-colored circle with a small shadow.
- It uses switch semantics with a checked state. A press toggles it, with an 8px hit slop.

### Empty States
- A dashed-hairline container with 28px corners, one large emoji, a pencil caption written in a friendly voice, and one secondary action that fixes the emptiness.

## Do's and Don'ts

### Do:
- **Do** build screens only from `@brain/ui` components and semantic classes. If a component is missing, add it to `packages/ui` with a test.
- **Do** keep one display line per screen and one primary button per action area.
- **Do** give every module an accent in `moduleColors` and use it only for that module's identity.
- **Do** write every string through i18n in both Thai and English, in a friendly voice. Short and warm beats formal.
- **Do** design the empty state, the loading state, and the error state together with the happy path.
- **Do** keep touch targets at least 44px and keep primary actions in thumb reach.

### Don't:
- **Don't** add drop shadows to cards, tiles, or inputs (The Flat-At-Rest Rule).
- **Don't** use violet for decoration or headings (The One Voice Rule).
- **Don't** use raw Tailwind palette colors or hex values in components (The Semantic-Only Rule).
- **Don't** reduce Thai line heights or use all-caps on Thai text.
- **Don't** add per-OS styling. The same design ships on iOS, Android, and web.
- **Don't** invent a logo, mascot, or brand name. They are undecided.
