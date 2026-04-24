'use client';

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export type PageHeaderVariant = 'page' | 'hero';

export interface PageHeaderProps {
  icon: LucideIcon;
  eyebrow: string;
  description: ReactNode;
  variant?: PageHeaderVariant;
  className?: string;
  /** Applied to the inner content column (e.g. text-center). */
  contentClassName?: string;
  /** Full title node (e.g. multi-line hero). When set, titleBefore/titleGradient are ignored. */
  title?: ReactNode;
  titleBefore?: string;
  titleGradient?: string;
}

export function PageHeader({
  icon: Icon,
  eyebrow,
  description,
  variant = 'page',
  className = '',
  contentClassName = '',
  title,
  titleBefore,
  titleGradient,
}: PageHeaderProps) {
  const isHero = variant === 'hero';

  const surface = isHero
    ? 'rounded-2xl border border-white/25 bg-white/15 p-6 shadow-lg backdrop-blur-md sm:p-8'
    : 'rounded-2xl border border-primary/15 bg-white/70 p-6 shadow-sm backdrop-blur-sm sm:p-8';

  const eyebrowClass = isHero
    ? 'mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white'
    : 'mb-3 inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-sm font-medium text-primary';

  const titleClass = isHero
    ? 'text-4xl sm:text-5xl font-bold tracking-tight text-white mb-2 text-balance'
    : 'text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-2';

  const gradientClass = isHero
    ? 'bg-gradient-to-r from-white to-teal-200 bg-clip-text text-transparent'
    : 'bg-gradient-to-r from-primary to-[#5A9E9B] bg-clip-text text-transparent';

  const descClass = isHero ? 'max-w-2xl text-white/90 mx-auto text-lg' : 'max-w-xl text-gray-600';

  const showSplit =
    title == null && titleBefore != null && titleGradient != null;

  return (
    <div className={`mb-8 ${surface} ${className}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className={contentClassName}>
          <div className={eyebrowClass}>
            <Icon className="h-4 w-4" aria-hidden />
            {eyebrow}
          </div>
          {title != null ? (
            title
          ) : showSplit ? (
            <h1 className={titleClass}>
              {titleBefore ? `${titleBefore} ` : null}
              <span className={gradientClass}>{titleGradient}</span>
            </h1>
          ) : null}
          <div className={descClass}>{description}</div>
        </div>
      </div>
    </div>
  );
}
