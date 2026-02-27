export const COLORS = [
    '#ffffff',
    '#06b6d4',
    '#a855f7',
    '#ec4899',
    '#f43f5e',
    '#f59e0b',
    '#10b981',
    '#3b82f6',
] as const;

export const BG_COLOR = '#09090b';

export const DEFAULTS = {
    symmetryCount: 8,
    brushColor: COLORS[1],
    brushSize: 3,
    glow: true,
    mirror: true,
    showGuides: true,
} as const;

export const LIMITS = {
    minAxes: 2,
    maxAxes: 32,
    axesStep: 2,
    minBrush: 1,
    maxBrush: 15,
} as const