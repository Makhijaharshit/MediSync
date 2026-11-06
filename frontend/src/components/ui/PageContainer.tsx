"use client";

import React from "react";

export interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "default" | "narrow" | "wide" | "full";
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = "",
  maxWidth = "default",
}) => {
  const maxClasses = {
    narrow: "max-w-4xl",
    default: "max-w-7xl",
    wide: "max-w-8xl",
    full: "max-w-full",
  }[maxWidth];

  return (
    <div
      className={`w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 animate-in fade-in duration-300 ${maxClasses} ${className}`}
    >
      {children}
    </div>
  );
};
