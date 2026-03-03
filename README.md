# DrawGlow

A neon-glow radial symmetry drawing app built with React, TypeScript, and HTML5 Canvas. Draw mesmerizing mandala patterns with real-time symmetry, glowing neon effects, and a dark canvas aesthetic.

## Features

### Drawing Engine
- **Radial Symmetry** — draw once, see it mirrored across 2–32 axes (adjustable in steps of 2)
- **Mirror Reflection** — doubles your symmetry lines for kaleidoscope-like patterns
- **Neon Glow** — toggle `shadowBlur`-based glow that makes every stroke radiate light
- **Dynamic Brush Cursor** — a glowing circle follows your mouse, sized to match your brush + glow radius

### Tools & Controls
- **8 Neon Colors** — curated palette: white, cyan, purple, pink, rose, amber, emerald, blue
- **Brush Size** — adjustable from 1px to 15px via slider
- **Symmetry Axes** — stepper control (2–32 axes, step of 2)
- **Toggle Group** — glow, mirror, and guide lines on/off
- **Undo** — snapshot-based undo (stores canvas state as data URLs)
- **Clear Canvas** — wipes the canvas (auto-saves state for undo)
- **Export PNG** — downloads the full-resolution canvas as a PNG file
- **Guide Lines** — faint radial lines with a center dot to help align your drawing (DOM-based, never exported)

### Gallery
- **Save to Gallery** — captures a 200×200 JPEG thumbnail with metadata
- **Gallery Drawer** — slide-out panel showing saved artworks in a 2-column grid
- **Delete Artworks** — hover to reveal a delete button on each thumbnail
- **Persistent Storage** — up to 20 artworks saved in `localStorage`
- **Auto-dismiss Toast** — confirmation notifications with configurable duration

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl+Z` | Undo |
| `Ctrl+S` | Export PNG |
| `G` | Toggle guide lines |
| `M` | Toggle mirror |
| `N` | Toggle neon glow |
| `[` | Decrease symmetry axes |
| `]` | Increase symmetry axes |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 19 |
| Language | TypeScript 5.9 |
| Bundler | Vite 7 |
| Styling | Tailwind CSS 4 |
| Icons | Lucide React |
| Canvas | HTML5 Canvas 2D API |
| Storage | localStorage |

## Project Structure

```
src/
├── App.tsx                    # App shell, state orchestration, gallery drawer
├── main.tsx                   # Entry point
├── index.css                  # Global styles + Tailwind
├── components/
│   ├── Canvas.tsx             # Drawing engine (forwardRef + useImperativeHandle)
│   ├── TopBar.tsx             # Logo, undo, clear, save, gallery, export buttons
│   ├── ToolPalette.tsx        # Floating toolbar container (composition component)
│   ├── ColorPicker.tsx        # 8 neon color swatches
│   ├── BrushSlider.tsx        # Brush size range input
│   ├── SymmetryControl.tsx    # Axes stepper (−/+)
│   ├── ToggleGroup.tsx        # Glow, mirror, guides toggle buttons
│   ├── GuidesOverlay.tsx      # Radial guide lines + center dot (DOM-based)
│   └── Toast.tsx              # Auto-dismiss notification component
└── lib/
    ├── constants.ts           # Colors, defaults, limits (as const)
    └── types.ts               # BrushSettings, DrawingState, CanvasPoint
```

### Architecture Decisions

- **Canvas component** uses `forwardRef` + `useImperativeHandle` to expose `getCanvas()`, `getContext()`, and `toDataURL()` — keeping the imperative canvas API encapsulated while letting App.tsx orchestrate undo/export/gallery
- **ToolPalette** is a pure composition component — it renders 4 sub-components and adds zero logic of its own
- **Guide lines are DOM elements**, not drawn on the canvas. This means they never appear in exported PNGs — users get clean artwork without construction lines
- **Gallery thumbnails** are 200×200 JPEG at 0.7 quality (~10-30KB each) to stay well within the ~5MB localStorage limit