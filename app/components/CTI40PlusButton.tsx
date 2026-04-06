'use client'

import { useRouter } from 'next/navigation'

export default function CTI40PlusButton() {
  const router = useRouter()

  return (
    <button
      className="px-8 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold text-lg"
      onClick={() => router.push('/cti40plus')}
    >
      CTI40 PLUS
    </button>
  )
}
