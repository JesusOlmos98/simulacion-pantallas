import type { JSX } from 'react';

export default function OmegaButton(): JSX.Element {
  return (
    <button
      className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
      type="button"
    >
      OMEGA
    </button>
  );
}
