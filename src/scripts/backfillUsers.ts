// Run once with: npx ts-node --require dotenv/config src/scripts/backfillUsers.ts
import { getSupabaseAdminClient } from '../lib/supabase/admin'
import { seedUser } from '../lib/seedUser'

async function main() {
  const supabase = getSupabaseAdminClient()

  const { data, error } = await supabase.auth.admin.listUsers()
  if (error) {
    console.error('Failed to list users:', error.message)
    process.exit(1)
  }

  const users = data?.users ?? []
  console.log(`Found ${users.length} users`)

  for (const user of users) {
    try {
      await seedUser(user.id)
      console.log(`✓ ${user.email}`)
    } catch (err: any) {
      console.error(`✗ ${user.email}: ${err.message}`)
    }
  }

  console.log('Done.')
}

main()
