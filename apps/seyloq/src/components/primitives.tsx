import type { ButtonHTMLAttributes, CSSProperties, InputHTMLAttributes, ReactNode } from "react";

export function Button({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`button ${className}`} {...props} />;
}

export function IconButton({
  label,
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; children: ReactNode }) {
  return (
    <button className={`icon-button ${className}`} aria-label={label} title={label} {...props}>
      {children}
    </button>
  );
}

export function SearchField(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="search-field">
      <span aria-hidden="true">⌕</span>
      <input type="search" {...props} />
    </label>
  );
}

export function Avatar({
  name,
  initials,
  color,
  size = "md",
}: {
  name: string;
  initials: string;
  color: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <span className={`avatar avatar-${size}`} style={{ "--avatar-color": color } as CSSProperties}>
      <span className="sr-only">{name}</span>
      {initials}
    </span>
  );
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "accent" }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function Divider() {
  return <div className="divider" role="separator" />;
}
