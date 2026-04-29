import type { JSX } from 'react';
import PantallaCti40Plus from './PantallaCti40Plus';
import { getBrowserLang } from '../../server/getBrowserLang';

export default async function Cti40PlusPage(): Promise<JSX.Element> {
  const lang = await getBrowserLang();

  return <PantallaCti40Plus lang={lang} />;
}
