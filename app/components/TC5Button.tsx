'use client';

import type { JSX } from 'react';
import { useRouter } from 'next/navigation';

export default function TC5Button(): JSX.Element {
  const router = useRouter();

  return (
    <button
      className="px-8 py-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold text-lg"
      onClick={() => router.push('/tc5')}
    >
      TC5
    </button>
  );
}
