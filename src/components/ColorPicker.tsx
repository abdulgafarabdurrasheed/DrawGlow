interface Props {
  colors: readonly string[];
  activeColor: string;
  glow: boolean;
  onChange: (color: string) => void;
}

export default function ColorPicker({ colors, activeColor, glow, onChange }: Props) {
  return (
    <div className="flex items-center gap-2 pr-4 border-r border-zinc-800">
      {colors.map((color) => (
        <button
          key={color}
          onClick={() => onChange(color)}
          className={`w-7 h-7 rounded-full transition-transform ${
            activeColor === color
              ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-zinc-900'
              : 'hover:scale-110'
          }`}
          style={{
            backgroundColor: color,
            boxShadow: activeColor === color && glow
              ? `0 0 10px ${color}`
              : 'none'
          }}
          title={`Color: ${color}`}
          aria-label={`Select brush color ${color}`}
        />
      ))}
    </div>
  );
}