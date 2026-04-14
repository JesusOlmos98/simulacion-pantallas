import { EnTextos } from '@/src/utils/common-lib-commac-generador/enumTextos';
import { textMapEN } from './textMapEN';
import { textMapES } from './textMapES';

export function resolveText(numText: number | EnTextos, lang?: string): string {
  switch (lang) {
    case 'en':
      return textMapEN.get(numText) || '';
    default: // es
      return textMapES.get(numText) || '';
  }
}
