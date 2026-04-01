import { type NextRequest } from 'next/server'

const COMMAC_BASE_URL = process.env.COMMAC_BASE_URL ?? 'http://localhost:3000'

export async function POST(request: NextRequest) {
  const incoming = request.nextUrl.searchParams

  const url = new URL(`${COMMAC_BASE_URL}/pruebas/peticionPantallaConEspera`)
  incoming.forEach((value, key) => url.searchParams.set(key, value))

  let commacRes: Response
  try {
    commacRes = await fetch(url.toString(), {
      method: 'POST',
      signal: AbortSignal.timeout(35_000),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error de red'
    return Response.json({ error: message }, { status: 504 })
  }

  if (!commacRes.ok) {
    return Response.json(
      { error: `COMMAC respondió con ${commacRes.status}` },
      { status: commacRes.status },
    )
  }

  const data = await commacRes.json()
  return Response.json(data)
}
