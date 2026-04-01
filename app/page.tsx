"use server";

import OmegaButton from './components/OmegaButton'

export default async function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-black">
      <div className="flex flex-col gap-6">
        <OmegaButton />
        <button className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg">
          SILOWS
        </button>
        <button className="px-8 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold text-lg">
          CTI40 PLUS
        </button>
      </div>
    </div>
  );
}
