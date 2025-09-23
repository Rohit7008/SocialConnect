"use client";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className = "", size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <span className="font-bold">
        <span className="text-[var(--foreground)]">Social</span>
        <span className="text-[var(--color-primary-end)]">Connect</span>
      </span>
    </div>
  );
}
