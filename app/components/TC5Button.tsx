import type { JSX } from 'react';

export default function TC5Button(): JSX.Element {
  return (
    <button
      className="px-8 py-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold text-lg"
      type="button"
    >
      TC5
    </button>
  );
}
