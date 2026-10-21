type BrandLogoProps = {
  className?: string;
};

const wordmarkStyle = {
  fontFamily: "Didot, 'Bodoni 72', 'Bodoni MT', 'Times New Roman', serif",
  fontWeight: 700,
} as const;

export function BrandLogo({ className = 'h-8 w-auto' }: BrandLogoProps) {
  return (
    <svg className={className} viewBox="0 0 196 68" role="img" aria-label="Bym 笔姆">
      <defs>
        <clipPath id="bym-b-clip">
          <text x="2" y="55" fontSize="62" style={wordmarkStyle}>B</text>
        </clipPath>
      </defs>
      <text x="2" y="55" fill="#09098f" fontSize="62" letterSpacing="-4" style={wordmarkStyle}>Bym</text>
      <g clipPath="url(#bym-b-clip)" fill="none" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16c-6 1-9 5-8 10-4 3-4 9 0 12-1 5 3 9 8 9 3 4 10 4 13 0 5 1 10-3 10-8 4-3 4-9 0-12 1-6-4-11-10-10-3-4-10-4-13-1Z" />
        <path d="M24 17c3 3 3 7 0 10m10-10c-3 3-3 7 0 10m-20 2c4-1 7 1 8 5m22-5c-4-1-7 1-8 5M20 47c-1-5 2-9 7-10m10 10c1-5-2-9-7-10m-8-7c4 1 7-1 8-5m-8 12c4-1 7 1 8 5" />
      </g>
    </svg>
  );
}
