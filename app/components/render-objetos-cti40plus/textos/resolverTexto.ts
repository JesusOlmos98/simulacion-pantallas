import { EnTextos } from '@/src/utils/common-lib-commac-generador/enumTextos';
import {
  textMapEN,
  textMapES,
  textMapAR,
  textMapCA,
  textMapDE,
  textMapEL,
  textMapFR,
  textMapHI,
  textMapHU,
  textMapID,
  textMapJP,
  textMapKO,
  textMapPL,
  textMapPT,
  textMapRO,
  textMapRU,
  textMapSK,
  textMapTR,
  textMapVI,
  textMapZH
} from './map/index';

export function resolveText(numText: number | EnTextos, lang?: string): string {
  if (lang === undefined) return textMapES.get(numText) || '';

  switch (lang) {
    case 'es':
      return textMapES.get(numText) || '';
    case 'en':
      return textMapEN.get(numText) || '';
    case 'ar':
      return textMapAR.get(numText) || '';
    case 'ca':
      return textMapCA.get(numText) || '';
    case 'de':
      return textMapDE.get(numText) || '';
    case 'el':
      return textMapEL.get(numText) || '';
    case 'fr':
      return textMapFR.get(numText) || '';
    case 'hi':
      return textMapHI.get(numText) || '';
    case 'hu':
      return textMapHU.get(numText) || '';
    case 'id':
      return textMapID.get(numText) || '';
    case 'jp':
      return textMapJP.get(numText) || '';
    case 'ko':
      return textMapKO.get(numText) || '';
    case 'pl':
      return textMapPL.get(numText) || '';
    case 'pt':
      return textMapPT.get(numText) || '';
    case 'ro':
      return textMapRO.get(numText) || '';
    case 'ru':
      return textMapRU.get(numText) || '';
    case 'sk':
      return textMapSK.get(numText) || '';
    case 'tr':
      return textMapTR.get(numText) || '';
    case 'vi':
      return textMapVI.get(numText) || '';
    case 'zh':
      return textMapZH.get(numText) || '';
    default: // es
      return textMapES.get(numText) || '';
  }
}
