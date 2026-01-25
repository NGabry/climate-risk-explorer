import { useState, useEffect } from 'react';

export const useIsMobile = (breakpoint = 480) => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth < breakpoint
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
};
