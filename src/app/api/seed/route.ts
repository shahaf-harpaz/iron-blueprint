export async function POST(request: Request) {
  const { userId } = await request.json()
  const { seedUser } = await import('@/lib/seedUser')
  try {
    await seedUser(userId)
    return Response.json({ success: true })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
