import Image from "next/image";

interface BrandLogoProps {
  size?: number;
  showName?: boolean;
  className?: string;
  imageClassName?: string;
  labelClassName?: string;
  priority?: boolean;
}

export function BrandLogo({
  size = 32,
  showName = true,
  className = "",
  imageClassName = "",
  labelClassName = "",
  priority = false,
}: BrandLogoProps) {
  return (
    <span className={`brand-logo-lockup ${className}`.trim()}>
      <Image
        src="/adadviser_logo.svg"
        alt=""
        aria-hidden="true"
        width={size}
        height={size}
        priority={priority}
        className={`brand-logo-image ${imageClassName}`.trim()}
        style={{ width: size, height: size }}
        unoptimized
      />
      {showName && (
        <span className={`brand-logo-label ${labelClassName}`.trim()}>
          AdAdviser
        </span>
      )}
    </span>
  );
}
