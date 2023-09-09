import { NextResponse } from "next/server"

export async function GET(request: Request) {
  console.log('GET /api/thing')
  return new Response(JSON.stringify({ foo: 'bar' }), {
      status: 200,
    })
}
