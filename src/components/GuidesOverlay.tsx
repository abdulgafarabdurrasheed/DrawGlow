interface Props {
    symmetryCount: number;
    mirror: boolean;
    visible: boolean;
}

export default function GuidesOverlay({ symmetryCount, mirror, visible }: Props) {
    if (!visible) return null;

    const totalLines = symmetryCount * (mirror ? 2 : 1);
    const angleStep = 360 / totalLines;

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: totalLines }, (_, i) => (
                <div
                    key={i}
                    className="absolute top-1/2 left-1/2 w-[1px] h-[100vmax] bg-white/[0.04] origin-top pointer-events-none"
                    style={{ transform: `translate(-50%, 0) rotate(${i * angleStep}deg)` }}
                />
            ))}
            <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10" />
        </div>
    )
}