
import { Layers } from 'lucide-react';
import type React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 48, className }) => {
  return (
    <div className={`flex items-center space-x-2 text-primary ${className}`}>
      <Layers size={size} strokeWidth={2} />
      <span className="text-2xl font-bold" style={{ fontFamily: 'var(--font-geist-sans)' }}>
        TridimLab
      </span>
    </div>
  );
};

export default Logo;
