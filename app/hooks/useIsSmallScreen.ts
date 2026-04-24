'use client';

import { useState, useEffect } from 'react';

/** Devuelve true si el viewport no cabe la pantalla fija 960×720 del dispositivo. */
export function useIsSmallScreen(): boolean {
  const [isSmall, setIsSmall] = useState(false);

  useEffect(() => {
    const check = (): void => {
      setIsSmall(window.innerWidth < 960 || window.innerHeight < 720);
    };
    check();
    window.addEventListener('resize', check);
    return (): void => window.removeEventListener('resize', check);
  }, []);

  return isSmall;
}
