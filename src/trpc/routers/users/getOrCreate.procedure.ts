import { getOrCreateUser, getUserById } from '@/lib/api'
import { baseProcedure } from '@/trpc/init'
import { z } from 'zod'

export const getOrCreateUserProcedure = baseProcedure
  .input(
    z.object({
      name: z.string().min(2).max(50),
    }),
  )
  .mutation(async ({ input: { name } }) => {
    const user = await getOrCreateUser(name)
    return { user }
  })

export const getUserProcedure = baseProcedure
  .input(z.object({ userId: z.string().min(1) }))
  .query(async ({ input: { userId } }) => {
    const user = await getUserById(userId)
    return { user }
  })
