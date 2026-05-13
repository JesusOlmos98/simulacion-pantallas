import type { JSX } from 'react';
import MacInputForm from './components/MacInputForm';
import PantallaCti40Plus from './cti40plus/PantallaCti40Plus';
import PantallaTc5 from './tc5/PantallaTc5';
import { resolveText } from './components/render-objetos-cti40plus/textos/resolverTexto';
import { getBrowserLang } from '../server/getBrowserLang';
import { EnTipoEquipo } from '@/src/utils/common-lib-commac-generador/enumGlobales';
import { EnTextos } from '@/src/utils/common-lib-commac-generador/enumTextos';
import { getMacPrefix3 } from '@/src/utils/common-lib-commac-generador/helpers';

interface HomeProps {
  searchParams: Promise<{ mac?: string | string[] | undefined }>;
}

function getMacParam(searchParams: { mac?: string | string[] | undefined }): string {
  const value = searchParams.mac;
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? '';
}

function renderSelector(defaultMac: string): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-black">
      <div className="flex w-full max-w-sm flex-col gap-6 px-6">
        <MacInputForm defaultMac={defaultMac} />
      </div>
    </div>
  );
}

export default async function Home({ searchParams }: HomeProps): Promise<JSX.Element> {
  const [params, lang] = await Promise.all([searchParams, getBrowserLang()]);
  const mac = getMacParam(params);

  if (mac.length < 6) {
    return renderSelector(mac);
  }

  const prefix = getMacPrefix3(mac);
  if (prefix === EnTipoEquipo.cti40V2Wifi) {
    return (
      <PantallaCti40Plus
        lang={lang}
        mac={mac}
      />
    );
  }

  if (prefix === EnTipoEquipo.tc5) {
    return <PantallaTc5 mac={mac} />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-6 dark:bg-black">
      <p className="text-center text-2xl font-semibold text-zinc-900 dark:text-white">{resolveText(EnTextos.textNoDisponible, lang)}</p>
    </div>
  );
}
