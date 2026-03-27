import React, { useEffect } from "react";
import { LIMITS } from "../lib/constants";

interface ShortcutOptions {
    undo: () => void;
    handleExport: () => void
    setShowGuides: React.Dispatch<React.SetStateAction<boolean>>
    setMirror: React.Dispatch<React.SetStateAction<boolean>>
    setGlow: React.Dispatch<React.SetStateAction<boolean>>
    setSymmetryCount: React.Dispatch<React.SetStateAction<number>>;
}

export function useShortcuts({
    undo,
    handleExport,
    setShowGuides,
    setMirror,
    setGlow,
    setSymmetryCount,
}: ShortcutOptions) {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const ctrl = e.ctrlKey || e.metaKey;
            if (ctrl && e.key === 'z') {
                e.preventDefault();
                undo();
            }
            if (ctrl && e.key === 's') {
                e.preventDefault();
                handleExport();
            }

            if (document.activeElement?.tagName === 'INPUT') return;

            if (e.key === "g") setShowGuides(prev => !prev);
            if (e.key === 'm') setMirror(prev => !prev);
            if (e.key === 'n') setGlow(prev => !prev);
            if (e.key === '[') setSymmetryCount(prev => Math.max(LIMITS.minAxes, prev - LIMITS.axesStep));
            if (e.key === ']') setSymmetryCount(prev => Math.min(LIMITS.maxAxes, prev + LIMITS.axesStep));
        };

        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [undo , handleExport, setSymmetryCount, setGlow, setMirror, setShowGuides])
}