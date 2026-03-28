interface Props {
    value: number;
    onChange: (value: number) => void;
}

export default function OpacitySlider({ value, onChange }: Props) {
    return (
        <div className="flex items-center gap-3 px-4 border-r border-zinc-800" title="Brush Opacity">
            <div className="w-4 h-4 rounded-full bg-zinc-400 opacity-50"></div>
            <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-24 accent-zinc-500 cursor-pointer"
                aria-label="Brush Opacity"
            />
            <div className="w-4 h-4 rounded-full bg-zinc-200"></div>
        </div>
    );
}