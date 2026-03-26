import { createTRPCRouter } from '@/trpc/init'
import { getFriendBalanceProcedure, getFriendsProcedure } from './friends.procedure'
import { getFriendExpensesProcedure } from './friendExpenses.procedure'
import { getGlobalBalanceProcedure } from './globalBalance.procedure'
import { getOrCreateUserProcedure, getUserProcedure } from './getOrCreate.procedure'

export const usersRouter = createTRPCRouter({
  getOrCreate: getOrCreateUserProcedure,
  get: getUserProcedure,
  globalBalance: getGlobalBalanceProcedure,
  friends: getFriendsProcedure,
  friendBalance: getFriendBalanceProcedure,
  friendExpenses: getFriendExpensesProcedure,
})
