import React from 'react';

export type UniversityLogoSize = 'xs' | 'small' | 'medium' | 'large' | 'xl';

interface UniversityLogoProps {
  size?: UniversityLogoSize;
  className?: string;
  alt?: string;
  priority?: boolean;
}

const sizeMap: Record<UniversityLogoSize, { width: number; height: number; classNames: string }> = {
  xs: {
    width: 24,
    height: 24,
    classNames: 'w-6 h-6'
  },
  small: {
    width: 36,
    height: 36,
    classNames: 'w-9 h-9'
  },
  medium: {
    width: 52,
    height: 52,
    classNames: 'w-12 h-12 sm:w-[52px] sm:h-[52px]'
  },
  large: {
    width: 80,
    height: 80,
    classNames: 'w-20 h-20'
  },
  xl: {
    width: 96,
    height: 96,
    classNames: 'w-24 h-24'
  }
};

export const UniversityLogo: React.FC<UniversityLogoProps> = ({
  size = 'medium',
  className = '',
  alt = 'Ghazi University Logo',
  priority = false
}) => {
  const config = sizeMap[size] || sizeMap.medium;

  return (
    <img
      src="/ghazi-university-logo.png"
      alt={alt}
      width={config.width}
      height={config.height}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      referrerPolicy="no-referrer"
      className={`inline-block object-contain flex-shrink-0 select-none ${config.classNames} ${className}`}
    />
  );
};
