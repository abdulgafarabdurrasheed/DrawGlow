interface Props {
  colors: readonly string[];
  activeColor: string;
  glow: boolean;
  onChange: (color: string) => void;
}

export default function ColorPicker({ colors, activeColor, glow, onChange }: Props) {
  const isCustomColor = !colors.includes(activeColor);

  return (
    <div className="flex items-center gap-2 pr-4 border-r border-zinc-800">
      
      {colors.map((color) => (
        <button
          key={color}
          onClick={() => onChange(color)}
          className={`w-7 h-7 rounded-full transition-transform ${
            activeColor === color && !isCustomColor
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

      <div 
        className={`relative w-7 h-7 rounded-full overflow-hidden transition-transform flex-shrink-0 ${
          isCustomColor
            ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-zinc-900'
            : 'hover:scale-110'
        }`}
        style={{
          background: isCustomColor 
             ? activeColor 
             : 'conic-gradient(from 90deg, red, yellow, lime, aqua, blue, magenta, red)',
          boxShadow: isCustomColor && glow ? `0 0 10px ${activeColor}` : 'none'
        }}
        title="Pick Custom Color"
      >
        <input 
          type="color" 
          value={isCustomColor ? activeColor : '#ffffff'} 
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-[150%] h-[150%] -translate-x-1 -translate-y-1 opacity-0 cursor-pointer"
        />
      </div>

    </div>
  );
}
