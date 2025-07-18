'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  return (
    <nav className={`flex items-center space-x-2 text-sm text-gray-600 mb-6 ${className}`} aria-label="Breadcrumb">
      <div className="flex items-center space-x-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <div key={index} className="flex items-center space-x-2">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
              
              {item.href && !isLast ? (
                <Link 
                  href={item.href}
                  className="flex items-center space-x-1 hover:text-transparent hover:bg-gradient-to-r hover:from-green-600 hover:to-emerald-600 hover:bg-clip-text transition-all duration-200 group"
                >
                  {item.icon && (
                    <span className="group-hover:text-green-600 transition-colors duration-200">
                      {item.icon}
                    </span>
                  )}
                  <span className="hover:underline">{item.label}</span>
                </Link>
              ) : (
                <span className={`flex items-center space-x-1 ${isLast ? 'bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-medium' : 'text-gray-600'}`}>
                  {item.icon && (
                    <span className={isLast ? 'text-green-600' : 'text-gray-500'}>
                      {item.icon}
                    </span>
                  )}
                  <span>{item.label}</span>
                </span>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
};

export default Breadcrumb;
