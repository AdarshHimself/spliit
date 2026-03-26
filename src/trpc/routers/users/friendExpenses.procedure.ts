import { getLastSettlement, getSharedExpenses, getUserById } from '@/lib/api'
import { getBalances } from '@/lib/balances'
import { baseProcedure } from '@/trpc/init'
import { z } from 'zod'

export const getFriendExpensesProcedure = baseProcedure
  .input(
    z.object({
      userId: z.string().min(1),
      friendId: z.string().min(1),
      allTime: z.boolean().default(false),
    }),
  )
  .query(async ({ input: { userId, friendId, allTime } }) => {
    const [friend, lastSettlement] = await Promise.all([
      getUserById(friendId),
      getLastSettlement(userId, friendId),
    ])

    const afterDate =
      !allTime && lastSettlement ? lastSettlement.expenseDate : undefined

    const expenses = await getSharedExpenses(userId, friendId, { afterDate })

    const balances = getBalances(expenses)
    const userNetBalance = balances[userId]?.total ?? 0

    return {
      friend,
      expenses: expenses.map((e) => ({
        ...e,
        expenseDate: new Date(e.expenseDate),
        createdAt: new Date(e.createdAt),
      })),
      netBalance: userNetBalance,
      lastSettlement: lastSettlement
        ? {
            date: new Date(lastSettlement.expenseDate),
            title: lastSettlement.title,
          }
        : null,
      isFilteredFromSettlement: !allTime && lastSettlement !== null,
    }
  })
