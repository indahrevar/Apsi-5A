type BrandLockupProps = {
  className?: string;
  subtitle?: string;
};

export function BrandLockup({ className = "", subtitle }: BrandLockupProps) {
  return (
    <span className={`brand-lockup${className ? ` ${className}` : ""}`}>
      <span aria-hidden="true" className="brand-mark__cake">
        <span />
      </span>
      <span className="brand-lockup__copy">
        <span className="brand-lockup__name">Dapur Abita</span>
        {subtitle ? (
          <span className="brand-lockup__subtitle">{subtitle}</span>
        ) : null}
      </span>
    </span>
  );
}
