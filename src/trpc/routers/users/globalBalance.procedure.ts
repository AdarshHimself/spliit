import { getUserFriends, getUserGlobalBalance } from '@/lib/api'
import { baseProcedure } from '@/trpc/init'
import { z } from 'zod'

export const getGlobalBalanceProcedure = baseProcedure
  .input(z.object({ userId: z.string().min(1) }))
  .query(async ({ input: { userId } }) => {
    const [balance, friends] = await Promise.all([
      getUserGlobalBalance(userId),
      getUserFriends(userId),
    ])
    return { balance, friendCount: friends.length }
  })
