interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  inverted?: boolean;
}

export default function Logo({ size = 'md', inverted = false }: LogoProps) {
  const sizes = { sm: 28, md: 38, lg: 56 };
  const textSizes = { sm: 'text-lg', md: 'text-2xl', lg: 'text-4xl' };
  const svgSize = sizes[size];
  const color = inverted ? '#DAC1B1' : '#3D0A05';
  const accentColor = inverted ? '#DAC1B1' : '#7F1F0E';

  return (
    <div className="flex items-center gap-2">
      <svg
        width={svgSize}
        height={svgSize}
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M30 52 C30 52 18 44 14 32 C10 20 16 8 24 10 C28 11 30 16 30 16"
          stroke={accentColor}
          strokeWidth="2"
          fill={accentColor}
          fillOpacity="0.15"
        />
        <path
          d="M30 52 C30 52 42 44 46 32 C50 20 44 8 36 10 C32 11 30 16 30 16"
          stroke={accentColor}
          strokeWidth="2"
          fill={accentColor}
          fillOpacity="0.25"
        />
        <path
          d="M30 16 C28 24 26 36 28 44 C29 48 30 52 30 52"
          stroke={color}
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M30 16 C32 24 34 36 32 44 C31 48 30 52 30 52"
          stroke={color}
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M30 16 C20 10 8 14 8 22 C8 30 18 32 26 30 C28 29.5 30 28 30 28"
          stroke={accentColor}
          strokeWidth="1.5"
          fill={accentColor}
          fillOpacity="0.2"
        />
        <path
          d="M30 16 C40 10 52 14 52 22 C52 30 42 32 34 30 C32 29.5 30 28 30 28"
          stroke={accentColor}
          strokeWidth="1.5"
          fill={accentColor}
          fillOpacity="0.3"
        />
        <circle cx="30" cy="16" r="2" fill={color} />
      </svg>
      <div className="flex items-baseline gap-0.5">
        <span
          className={`font-serif font-bold tracking-wide ${textSizes[size]}`}
          style={{ color }}
        >
          Bodilicious
        </span>
        <sup className="text-xs font-sans font-medium" style={{ color: accentColor }}>
          ™
        </sup>
      </div>
    </div>
  );
}
