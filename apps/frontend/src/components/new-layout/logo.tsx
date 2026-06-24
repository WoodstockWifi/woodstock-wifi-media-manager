'use client';

// Woodstock & Wifi sidebar mark — compact coral monogram tile for the 64px rail.
export const Logo = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 60 60"
      fill="none"
      role="img"
      aria-label="Woodstock & Wifi Media Manager"
      className="mt-[8px] min-w-[48px] min-h-[48px]"
    >
      <rect width="60" height="60" rx="16" fill="#FF2364" />
      <text
        x="30"
        y="39"
        textAnchor="middle"
        fontFamily="'Avenir Next', system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
        fontSize="19"
        fontWeight={800}
        letterSpacing="-1"
        fill="#ffffff"
      >
        {'W&W'}
      </text>
    </svg>
  );
};
