'use client'

import { useGlobalUser } from '@/app/global-user-context'
import { Money } from '@/components/money'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { cn, formatCurrency } from '@/lib/utils'
import { trpc } from '@/trpc/client'
import { ArrowLeft, Calendar, Receipt } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'

export default function FriendLedgerPage() {
  const { currentUser, isLoading: userLoading } = useGlobalUser()
  const params = useParams<{ friendId: string }>()
  const friendId = params.friendId

  if (userLoading || !currentUser) {
    return <FriendLedgerSkeleton />
  }

  return (
    <FriendLedgerContent userId={currentUser.id} friendId={friendId} />
  )
}

function FriendLedgerContent({
  userId,
  friendId,
}: {
  userId: string
  friendId: string
}) {
  const t = useTranslations('FriendLedger')
  const locale = useLocale()
  const [allTime, setAllTime] = useState(false)

  const { data, isLoading } = trpc.users.friendExpenses.useQuery({
    userId,
    friendId,
    allTime,
  })

  const friend = data?.friend
  const expenses = data?.expenses ?? []
  const netBalance = data?.netBalance ?? 0
  const lastSettlement = data?.lastSettlement
  const isFilteredFromSettlement = data?.isFilteredFromSettlement

  return (
    <main className="container max-w-screen-sm mx-auto px-4 py-4 flex flex-col gap-4">
      {/* Header with back button */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild className="-ml-2">
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold">
          {isLoading ? (
            <Skeleton className="h-6 w-32" />
          ) : (
            friend?.name ?? 'Loading…'
          )}
        </h1>
      </div>

      {/* Net Balance */}
      {isLoading ? (
        <Skeleton className="h-20 w-full rounded-2xl" />
      ) : (
        <section className="rounded-2xl border bg-card shadow-sm p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              {t('netBalance')}
            </p>
            <p
              className={cn(
                'text-2xl font-bold tabular-nums',
                netBalance === 0
                  ? 'text-muted-foreground'
                  : netBalance > 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400',
              )}
            >
              {netBalance === 0
                ? 'Settled up'
                : `${netBalance > 0 ? '+' : ''}${(netBalance / 100).toFixed(2)}`}
            </p>
          </div>
          {netBalance !== 0 && friend && (
            <div className="text-right text-sm text-muted-foreground">
              {netBalance > 0
                ? `${friend.name} owes you`
                : `You owe ${friend.name}`}
            </div>
          )}
        </section>
      )}

      {/* Settlement Filter Toggle */}
      <div className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">
            {allTime ? t('allTime') : t('sinceSettlement')}
          </span>
          {!allTime && lastSettlement && (
            <span className="text-xs text-muted-foreground">
              {t('lastSettlement', {
                date: new Date(lastSettlement.date).toLocaleDateString(locale, {
                  dateStyle: 'medium',
                }),
              })}
            </span>
          )}
        </div>
        <Switch
          checked={allTime}
          onCheckedChange={setAllTime}
          aria-label="Show all time"
        />
      </div>

      {/* Expense List */}
      {isLoading ? (
        <ExpenseListSkeleton />
      ) : expenses.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          {t('noExpenses')}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {expenses.map((expense) => (
            <ExpenseItem
              key={expense.id}
              expense={expense}
              currentUserId={userId}
              locale={locale}
            />
          ))}
        </ul>
      )}
    </main>
  )
}

type Expense = {
  id: string
  title: string
  amount: number
  expenseDate: Date
  isReimbursement: boolean
  paidBy: { id: string; name: string }
  group?: { id: string; name: string; currency: string; currencyCode?: string | null }
  paidFor: Array<{
    participant: { id: string; name: string }
    shares: number
  }>
}

function ExpenseItem({
  expense,
  currentUserId,
  locale,
}: {
  expense: Expense
  currentUserId: string
  locale: string
}) {
  const amountDisplay = (expense.amount / 100).toFixed(2)
  const paidByCurrentUser = expense.paidBy.id === currentUserId

  return (
    <li className="rounded-xl border bg-card px-4 py-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{expense.title}</span>
            {expense.isReimbursement && (
              <Badge variant="secondary" className="text-xs shrink-0">
                Settlement
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 shrink-0" />
            <span>
              {new Date(expense.expenseDate).toLocaleDateString(locale, {
                dateStyle: 'medium',
              })}
            </span>
            <span>·</span>
            <span>
              {paidByCurrentUser
                ? 'You paid'
                : `${expense.paidBy.name} paid`}
            </span>
          </div>
          {expense.group && (
            <Badge
              variant="outline"
              className="text-xs w-fit mt-0.5"
            >
              <Receipt className="h-2.5 w-2.5 mr-1" />
              {expense.group.name}
            </Badge>
          )}
        </div>
        <div className="flex flex-col items-end shrink-0">
          <span
            className={cn(
              'font-semibold tabular-nums text-sm',
              paidByCurrentUser
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400',
            )}
          >
            {paidByCurrentUser ? '+' : '-'}
            {amountDisplay}
          </span>
        </div>
      </div>
    </li>
  )
}

function FriendLedgerSkeleton() {
  return (
    <main className="container max-w-screen-sm mx-auto px-4 py-4 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-7 w-32" />
      </div>
      <Skeleton className="h-20 w-full rounded-2xl" />
      <Skeleton className="h-14 w-full rounded-xl" />
      <ExpenseListSkeleton />
    </main>
  )
}

function ExpenseListSkeleton() {
  return (
    <ul className="flex flex-col gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <li key={i} className="rounded-xl border bg-card px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        </li>
      ))}
    </ul>
  )
}
