export function EduHubLogo({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="../../assets/images/logo.png"
    >
      <defs>
        <linearGradient id="edu-gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6c63ff" />
          <stop offset="1" stopColor="#4fc3f7" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#edu-gradient)" />
      <path
        d="M8 10C8 9.44772 8.44772 9 9 9H23C23.5523 9 24 9.44772 24 10V11H8V10Z"
        fill="white"
        fillOpacity="0.9"
      />
      <path
        d="M8 13H24V22C24 22.5523 23.5523 23 23 23H9C8.44772 23 8 22.5523 8 22V13Z"
        fill="white"
        fillOpacity="0.6"
      />
      <path
        d="M12 16H20V17H12V16Z"
        fill="white"
        fillOpacity="0.8"
      />
      <path
        d="M12 19H18V20H12V19Z"
        fill="white"
        fillOpacity="0.8"
      />
    </svg>
  );
}

export function EduHubLogoText({ className }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <EduHubLogo className="w-8 h-8 rounded-lg shadow-lg" />
      <span className="font-bold text-xl tracking-tight text-[var(--color-text)]">
        EduHub
      </span>
    </div>
  );
}

export default EduHubLogo;
