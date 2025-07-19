import React from 'react';
import { LucideIcon } from 'lucide-react';

export type BadgeVariant = 
  | 'info'      // Blue - informational
  | 'success'   // Green - confirmed/positive
  | 'warning'   // Yellow/Orange - pending/attention needed  
  | 'danger'    // Red - rejected/error
  | 'neutral'   // Gray - cancelled/completed
  | 'cta';      // Call-to-action styling

export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  variant: BadgeVariant;
  size?: BadgeSize;
  icon?: LucideIcon;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  variant,
  size = 'md',
  icon: Icon,
  children,
  onClick,
  className = ''
}) => {
  const baseClasses = 'inline-flex items-center gap-1 font-medium rounded-full border transition-all duration-200';
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const variantClasses = {
    info: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    success: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
    warning: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
    danger: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
    neutral: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100',
    cta: 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 cursor-pointer'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4', 
    lg: 'w-5 h-5'
  };

  const combinedClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${onClick ? 'cursor-pointer' : ''} ${className}`;

  const badgeContent = (
    <>
      {Icon && <Icon className={iconSizes[size]} />}
      <span>{children}</span>
    </>
  );

  if (onClick) {
    return (
      <button 
        onClick={onClick}
        className={combinedClasses}
      >
        {badgeContent}
      </button>
    );
  }

  return (
    <div className={combinedClasses}>
      {badgeContent}
    </div>
  );
};

export default Badge;
