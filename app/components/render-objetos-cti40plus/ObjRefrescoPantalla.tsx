'use client';

import { useEffect, type JSX } from 'react';

interface Props {
  segundos: number;
  onRefresh: () => void;
}

/** Objeto no visual que vuelve a pedir la pantalla actual tras un timeout. */
export default function ObjRefrescoPantalla({ segundos, onRefresh }: Props): JSX.Element | null {
  useEffect(() => {
    let timeoutId: number | null = null;

    if (segundos > 0) {
      timeoutId = window.setTimeout(() => {
        onRefresh();
      }, segundos * 1000);
    }

    return (): void => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [onRefresh, segundos]);

  return null;
}
