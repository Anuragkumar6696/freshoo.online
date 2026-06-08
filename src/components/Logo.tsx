"use client";

import React from "react";
import Image from "next/image";

interface LogoProps {
  className?: string;
  variant?: "horizontal" | "vertical" | "iconOnly" | "light";
  size?: "sm" | "md" | "lg";
}

export const Logo: React.FC<LogoProps> = ({
  className = "",
  variant = "horizontal",
  size = "md",
}) => {
  const getDimensions = () => {
    switch (size) {
      case "sm":
        return { width: 25, height: 25 };
      case "lg":
        return { width: 45, height: 45 };
      case "md":
      default:
        return { width: 32, height: 30 };
    }
  };

  const { width, height } = getDimensions();

  const LogoImage = () => (
    <div className="relative flex items-center justify-center transition-transform duration-300 hover:scale-105">
      <Image
        src="/logo.jpeg"
        alt="Freshoo"
        width={variant === "iconOnly" ? width : width * 2.5}
        height={height}
        className="object-contain"
        priority
      />
    </div>
  );

  if (variant === "iconOnly") {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <LogoImage />
      </div>
    );
  }

  if (variant === "vertical") {
    return (
      <div className={`flex flex-col items-center gap-1 ${className}`}>
        <LogoImage />
      </div>
    );
  }

  if (variant === "light") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Image
          src="/logo.jpeg"
          alt="Freshoo"
          width={width * 3}
          height={height}
          className="object-contain brightness-0 invert transition-transform duration-300 hover:scale-105"
          priority
        />
      </div>
    );
  }

  // Default: horizontal
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <LogoImage />
    </div>
  );
};
