export function EduHubLogo({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="edu-gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6c63ff" />
          <stop offset="1" stopColor="#4fc3f7" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#edu-gradient)" />

      {/* Graduation Hat (Mortarboard) */}
      <path
        d="M16 5L6 10L16 15L26 10L16 5Z"
        fill="white"
        fillOpacity="0.95"
      />
      <path
        d="M8 11V15C8 15 11 18 16 18C21 18 24 15 24 15V11"
        stroke="white"
        strokeOpacity="0.9"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M23 12V16"
        stroke="white"
        strokeOpacity="0.9"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="23" cy="17.5" r="1.5" fill="white" fillOpacity="0.9" />
      <path
        d="M23 19V21"
        stroke="white"
        strokeOpacity="0.9"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Book */}
      <path
        d="M6 20C6 19.4477 6.44772 19 7 19H25C25.5523 19 26 19.4477 26 20V21H6V20Z"
        fill="white"
        fillOpacity="0.9"
      />
      <path
        d="M6 22H26V26C26 26.5523 25.5523 27 25 27H7C6.44772 27 6 26.5523 6 26V22Z"
        fill="white"
        fillOpacity="0.7"
      />
      <path
        d="M16 22V27"
        stroke="white"
        strokeOpacity="0.5"
        strokeWidth="0.5"
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
