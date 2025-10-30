import React from 'react';
import LoadingIcon from '@/components/icons/svg/LoadingIcon';
import { useTranslations } from 'next-intl';

interface LoadingButtonProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  loadingText?: string;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  className = '',
  size = 'md',
  loadingText,
}) => {
  const t = useTranslations('common');
  const finalLoadingText = loadingText || t('loading');

  // Size classes based on the size prop
  const sizeClasses = {
    sm: 'py-1.5 px-4 text-sm',
    md: 'py-2.5 px-5 text-sm',
    lg: 'py-3 px-6 text-base',
  };

  return (
    <button
      disabled
      type="button"
      className={`font-medium rounded-full border bg-gradient-to-r from-[color:var(--ai-primary)] via-[color:var(--ai-secondary)] to-[color:var(--ai-primary)] text-white flex items-center justify-center transition-all ${sizeClasses[size]} ${className}`}
    >
      <LoadingIcon className="w-5 h-5 mr-3 text-white" />
      {finalLoadingText}
    </button>
  );
};

export default LoadingButton;
