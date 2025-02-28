export const EtherlensLogo = ({
  className = "h-8 w-8",
}: {
  className?: string;
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient
          id="logoGradient"
          x1="12"
          y1="2"
          x2="12"
          y2="21"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFCB9A" />
          <stop offset="1" stopColor="#FFCB9A" stopOpacity="0.7" />
        </linearGradient>
      </defs>

      {/* Magnifying Glass Lens - Just the circle part */}
      <circle
        cx="10"
        cy="10"
        r="7"
        stroke="url(#logoGradient)"
        strokeWidth="1.5"
        fill="none"
      />

      {/* Magnifying Glass Handle */}
      <path
        d="M15.5 15.5L20 20"
        stroke="url(#logoGradient)"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Ethereum Diamond - Centered in the lens */}
      <path
        d="M10 5L6.5 9.5L10 11.5L13.5 9.5L10 5Z"
        fill="url(#logoGradient)"
        fillOpacity="0.8"
      />
      <path
        d="M10 11.5L6.5 9.5L10 14L13.5 9.5L10 11.5Z"
        fill="url(#logoGradient)"
        fillOpacity="0.6"
      />
    </svg>
  );
};
