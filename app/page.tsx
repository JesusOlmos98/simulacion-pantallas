'use server';

import type { JSX } from 'react';
import OmegaButton from './components/OmegaButton';
import CTI40PlusButton from './components/CTI40PlusButton';

export default async function Home(): Promise<JSX.Element> {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-black">
      <div className="flex flex-col gap-6">
        <OmegaButton />
        <button className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg">SILOWS</button>
        <CTI40PlusButton />
      </div>
    </div>
  );
}
