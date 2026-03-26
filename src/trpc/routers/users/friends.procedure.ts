import { getFriendNetBalance, getUserFriends } from '@/lib/api'
import { baseProcedure } from '@/trpc/init'
import { z } from 'zod'

export const getFriendsProcedure = baseProcedure
  .input(z.object({ userId: z.string().min(1) }))
  .query(async ({ input: { userId } }) => {
    const friends = await getUserFriends(userId)
    // Compute net balance with each friend
    const friendsWithBalance = await Promise.all(
      friends.map(async (friend) => {
        const netBalance = await getFriendNetBalance(userId, friend.id)
        return { ...friend, netBalance }
      }),
    )
    return { friends: friendsWithBalance }
  })

export const getFriendBalanceProcedure = baseProcedure
  .input(
    z.object({
      userId: z.string().min(1),
      friendId: z.string().min(1),
    }),
  )
  .query(async ({ input: { userId, friendId } }) => {
    const netBalance = await getFriendNetBalance(userId, friendId)
    return { netBalance }
  })
