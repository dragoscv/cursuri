'use client';

import React from 'react';

interface Props {
  className?: string;
  size?: number;
}

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export const IconChevronLeft: React.FC<Props> = ({ className = '', size = 16 }) => (
  <svg {...base(size)} className={className}>
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

export const IconMenu: React.FC<Props> = ({ className = '', size = 20 }) => (
  <svg {...base(size)} className={className}>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

export const IconPlus: React.FC<Props> = ({ className = '', size = 16 }) => (
  <svg {...base(size)} className={className}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const IconSparkles: React.FC<Props> = ({ className = '', size = 16 }) => (
  <svg {...base(size)} className={className}>
    <path d="M12 3l1.9 4.6L18.5 9l-4.6 1.9L12 15.5l-1.9-4.6L5.5 9l4.6-1.4L12 3z" />
    <path d="M19 14l.7 1.7L21.5 16l-1.8.7L19 18l-.7-1.3L16.5 16l1.8-.6L19 14z" />
  </svg>
);

export const IconCommand: React.FC<Props> = ({ className = '', size = 14 }) => (
  <svg {...base(size)} className={className}>
    <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
  </svg>
);

export const IconExternal: React.FC<Props> = ({ className = '', size = 14 }) => (
  <svg {...base(size)} className={className}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

export const IconActivity: React.FC<Props> = ({ className = '', size = 16 }) => (
  <svg {...base(size)} className={className}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

export const IconShield: React.FC<Props> = ({ className = '', size = 16 }) => (
  <svg {...base(size)} className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export const IconBolt: React.FC<Props> = ({ className = '', size = 16 }) => (
  <svg {...base(size)} className={className}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
