export interface BrushSettings {
    color: string
    size: number;
    glow: boolean;
}

export interface DrawingState {
    symmetryCount: number;
    mirror: boolean;
    showGuides: boolean;
    brush: BrushSettings
}

export interface CanvasPoint {
    x: number;
    y: number;
}