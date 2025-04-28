import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';

type AnimatedNumberProps = {
  value: number;
  className?: string;
  duration?: number;
  formatOptions?: {
    decimals?: number;
    suffix?: string;
    prefix?: string;
  };
};

export function AnimatedNumber({
  value,
  className,
  duration = 1000,
  formatOptions = {},
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const startValueRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Store the starting value for the animation
    startValueRef.current = displayValue;
    
    // Reset start time
    startTimeRef.current = null;
    
    // Cancel any existing animation
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }
    
    // Animation function
    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }
      
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out cubic)
      const eased = 1 - Math.pow(1 - progress, 3);
      
      // Calculate current value
      const currentValue = startValueRef.current + (value - startValueRef.current) * eased;
      
      // Update state with the interpolated value
      setDisplayValue(currentValue);
      
      // Continue animation if not complete
      if (progress < 1) {
        rafIdRef.current = requestAnimationFrame(animate);
      }
    };
    
    // Start animation
    rafIdRef.current = requestAnimationFrame(animate);
    
    // Clean up on unmount or if value changes
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [value, duration]);
  
  // Format the display value
  const formattedValue = (() => {
    let formattedNumber: string;
    
    if (formatOptions.decimals !== undefined) {
      formattedNumber = displayValue.toFixed(formatOptions.decimals);
    } else {
      formattedNumber = Math.round(displayValue).toLocaleString();
    }
    
    const prefix = formatOptions.prefix || '';
    const suffix = formatOptions.suffix || '';
    
    return `${prefix}${formattedNumber}${suffix}`;
  })();

  return (
    <span className={cn('tabular-nums', className)}>
      {formattedValue}
    </span>
  );
}