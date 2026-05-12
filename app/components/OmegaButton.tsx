'use client';

import type { JSX } from 'react';
import { useRouter } from 'next/navigation';

export default function OmegaButton(): JSX.Element {
  const router = useRouter();

  return (
    <button
      className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
      onClick={() => router.push('/omega')}
    >
      OMEGA
    </button>
  );
}
