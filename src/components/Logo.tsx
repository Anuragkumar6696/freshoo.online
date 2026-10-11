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
        return { width: 36, height: 36 };
      case "lg":
        return { width: 64, height: 64 };
      case "md":
      default:
        return { width: 48, height: 48 };
    }
  };

  const { width, height } = getDimensions();
  const textSize = size === "sm" ? "text-sm" : size === "lg" ? "text-2xl" : "text-xl";
  const subSize = size === "sm" ? "text-[7px]" : size === "lg" ? "text-[11px]" : "text-[9px]";

  const LogoMark = ({ invert = false }: { invert?: boolean }) => (
    <div
      className="relative flex items-center justify-center rounded-xl overflow-hidden transition-transform duration-300 hover:scale-105 p-1"
      style={{
        width: width,
        height: height,
        background: invert ? "#ffffff" : "linear-gradient(135deg, hsl(354, 84%, 45%) 0%, hsl(354, 84%, 38%) 100%)",
        boxShadow: invert ? "none" : "0 4px 14px -2px rgba(211, 47, 47, 0.35)",
      }}
    >
      <Image
        src={invert ? "/freshoo-icon.png" : "/freshoo-icon-white.png"}
        alt="Freshoo"
        width={Math.round(width * 0.72)}
        height={Math.round(height * 0.72)}
        className="object-contain"
        priority
      />
    </div>
  );

  const WordMark = ({ invert = false }: { invert?: boolean }) => (
    <div className="flex flex-col leading-none">
      <span
        className={`font-display font-black tracking-tight ${textSize} ${
          invert ? "text-white" : "text-slate-900"
        }`}
      >
        Fresh<span className="text-brand-primary">oo</span>
      </span>
      <span
        className={`${subSize} font-bold tracking-[0.18em] uppercase ${
          invert ? "text-slate-400" : "text-slate-500"
        } mt-0.5 hidden sm:block`}
      >
        Fresh • Cut • Deliver
      </span>
    </div>
  );

  if (variant === "iconOnly") {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <LogoMark />
      </div>
    );
  }

  if (variant === "vertical") {
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        <LogoMark />
        <WordMark />
      </div>
    );
  }

  if (variant === "light") {
    return (
      <div className={`flex items-center gap-2 sm:gap-3 ${className}`}>
        <LogoMark invert />
        <WordMark invert />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 sm:gap-3 ${className}`}>
      <LogoMark />
      <WordMark />
    </div>
  );
};
