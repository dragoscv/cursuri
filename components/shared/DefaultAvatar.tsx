'use client';

import React from 'react';
import Image from 'next/image';

interface DefaultAvatarProps {
  name?: string;
  size?: number;
  className?: string;
}

/**
 * DefaultAvatar component that generates a consistent avatar
 * based on user's name initials with a colored background
 * 
 * This replaces mock pravatar.cc URLs with a proper default avatar
 */
export default function DefaultAvatar({ name, size = 40, className = '' }: DefaultAvatarProps) {
  // Generate initials from name
  const getInitials = (fullName?: string): string => {
    if (!fullName) return '?';
    
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  // Generate consistent color based on name
  const getColorFromName = (fullName?: string): string => {
    if (!fullName) return 'var(--ai-primary)';
    
    const colors = [
      'var(--ai-primary)',
      'var(--ai-secondary)',
      'var(--ai-accent)',
      '#10b981', // green
      '#f59e0b', // amber
      '#ef4444', // red
      '#8b5cf6', // purple
      '#ec4899', // pink
    ];
    
    // Simple hash function to get consistent color
    let hash = 0;
    for (let i = 0; i < fullName.length; i++) {
      hash = fullName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const initials = getInitials(name);
  const bgColor = getColorFromName(name);

  return (
    <div
      className={`flex items-center justify-center rounded-full font-semibold text-white ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: bgColor,
        fontSize: size * 0.4,
      }}
      role="img"
      aria-label={name ? `Avatar for ${name}` : 'Default avatar'}
    >
      {initials}
    </div>
  );
}
