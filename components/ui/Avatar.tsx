'use client';

import React, { forwardRef } from 'react';
import { Avatar as HeroAvatar, type AvatarProps as HeroAvatarProps } from '@heroui/react';

export interface AvatarProps {
  /**
   * The image source URL for the avatar
   */
  src?: string;

  /**
   * Icon shown when no image is available and no name is provided
   */
  icon?: React.ReactNode;

  /**
   * Alt text for the avatar image
   */
  alt?: string;

  /**
   * The name to use for generating initials
   */
  name?: string;

  /**
   * The size of the avatar
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';

  /**
   * The shape of the avatar
   */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';

  /**
   * Whether the user is online
   */
  isBordered?: boolean;

  /**
   * Color when the avatar is showing initials
   */
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

  /**
   * Whether to show an indicator that the user is online
   */
  isOnline?: boolean;

  /**
   * Additional CSS class names
   */
  className?: string;

  /**
   * Additional props
   */
  [key: string]: any;
}

/**
 * Avatar component for displaying user profile pictures or initials
 */
const Avatar = forwardRef<HTMLDivElement, AvatarProps>((props, ref) => {
  const {
    src,
    icon,
    alt,
    name,
    size = 'md',
    radius = 'full',
    isBordered = false,
    color = 'default',
    isOnline = false,
    className = '',
    ...rest
  } = props;

  // Custom class for integrating with the app's design system
  const customClassName = isBordered
    ? `border-2 border-[color:var(--ai-card-border)] ${className}`
    : className;

  // Handle online indicator styling
  const onlineIndicatorClass = isOnline
    ? 'after:content-[""] after:absolute after:bottom-0 after:right-0 after:w-2.5 after:h-2.5 after:rounded-full after:bg-[color:var(--ai-success)] after:border-2 after:border-[color:var(--ai-card-bg)]'
    : '';

  return (
    <HeroAvatar
      ref={ref}
      src={src}
      icon={icon}
      alt={alt}
      name={name}
      size={size as HeroAvatarProps['size']}
      radius={radius as HeroAvatarProps['radius']}
      isBordered={isBordered}
      color={color as HeroAvatarProps['color']}
      className={`${customClassName} ${onlineIndicatorClass} relative`}
      {...rest}
    />
  );
});

Avatar.displayName = 'Avatar';

export default Avatar;
