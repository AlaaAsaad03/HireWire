// src/components/ui/Logo.tsx
import CustomLogo from '@/assets/logo.svg?react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  /** When true, renders the icon + wordmark. Default: icon only. */
  withText?: boolean;
  /** Desaturates the logo (for coloured backgrounds). */
  mono?: boolean;
}

// Icon-only square heights
const iconHeights: Record<string, string> = {
  sm: 'h-8',   // 32 px
  md: 'h-10',  // 40 px
  lg: 'h-13',  // 52 px
  xl: 'h-16',  // 64 px
};

// Wordmark text sizes paired to icon heights
const wordmarkSizes: Record<string, string> = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-3xl',
};

export default function Logo({
  size = 'md',
  className = '',
  withText = false,
  mono = false,
}: LogoProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/*
        Icon mark only — crops the SVG viewBox to just the teal square.
        The square in the SVG sits at x=40 y=30, 160×160.
      */}
      <CustomLogo
        className={`${iconHeights[size]} w-auto block flex-shrink-0`}
        viewBox="40 30 160 160"
        style={{ filter: mono ? 'grayscale(1) brightness(1.6)' : undefined }}
      />

      {/*
        Wordmark rendered as HTML so it inherits CSS variables and works
        correctly in both light and dark mode — the SVG text is hardcoded
        white/teal and would be invisible on light backgrounds.
      */}
      {withText && (
        <span
          className={`font-bold tracking-tight leading-none select-none ${wordmarkSizes[size]}`}
        >
          {mono ? (
            // On coloured backgrounds, render the whole wordmark in white
            <span style={{ color: "rgba(255,255,255,0.92)" }}>HireWire</span>
          ) : (
            <>
              <span className="text-foreground">Hire</span>
              <span className="text-primary">Wire</span>
            </>
          )}
        </span>
      )}
    </div>
  );
}
