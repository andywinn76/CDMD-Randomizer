import React from "react";

type SectionTitleVariant = "default" | "dark" | "light" | "accent";

type SectionTitleProps = {
  children: React.ReactNode;
  variant?: SectionTitleVariant;
};

const variantClasses: Record<SectionTitleVariant, string> = {
  default: "text-slate-500",
  dark: "text-slate-700",
  light: "text-slate-300",
  accent: "text-blue-400",
};

export default function SectionTitle({
  children,
  variant = "default",
}: SectionTitleProps) {
  return (
    <h2 className={`text-lg font-semibold ${variantClasses[variant]}`}>
      {children}
    </h2>
  );
}