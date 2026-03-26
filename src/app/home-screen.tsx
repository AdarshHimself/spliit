'use client'

import { useGlobalUser } from '@/app/global-user-context'
import { Money } from '@/components/money'
import { Skeleton } from '@/components/ui/skeleton'
import { cn, getCurrencyFromGroup } from '@/lib/utils'
import { trpc } from '@/trpc/client'
import { ArrowRight, TrendingDown, TrendingUp } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export default function HomeScreen() {
  const { currentUser, isLoading: userLoading } = useGlobalUser()
  const t = useTranslations('GlobalLedger')

  if (userLoading) {
    return <HomeScreenSkeleton />
  }

  if (!currentUser) {
    return null // UserSetupModal handles this
  }

  return <HomeScreenContent userId={currentUser.id} />
}

function HomeScreenContent({ userId }: { userId: string }) {
  const t = useTranslations('GlobalLedger')

  const { data: balanceData, isLoading: balanceLoading } =
    trpc.users.globalBalance.useQuery({ userId })

  const { data: friendsData, isLoading: friendsLoading } =
    trpc.users.friends.useQuery({ userId })

  const balance = balanceData?.balance
  const friends = friendsData?.friends ?? []

  return (
    <main className="container max-w-screen-sm mx-auto px-4 py-6 flex flex-col gap-6">
      {/* Master Balance Card */}
      <section className="rounded-2xl border bg-card shadow-sm p-6 flex flex-col items-center gap-2">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {t('title')}
        </h2>
        {balanceLoading ? (
          <Skeleton className="h-12 w-40" />
        ) : (
          <div
            className={cn(
              'text-4xl font-bold tabular-nums',
              !balance || balance.total === 0
                ? 'text-foreground'
                : balance.total > 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400',
            )}
          >
            {!balance || balance.total === 0 ? (
              <span className="text-muted-foreground text-2xl">
                {t('settled')}
              </span>
            ) : (
              <div className="flex items-center gap-2">
                {balance.total > 0 ? (
                  <TrendingUp className="h-8 w-8" />
                ) : (
                  <TrendingDown className="h-8 w-8" />
                )}
                <span>
                  {balance.total > 0 ? '+' : ''}
                  {(balance.total / 100).toFixed(2)}
                </span>
              </div>
            )}
          </div>
        )}
        {balance && balance.total !== 0 && (
          <p className="text-sm text-muted-foreground">
            {balance.total > 0 ? t('totalOwed') : t('totalOwe')}
          </p>
        )}
      </section>

      {/* Friends List */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">{t('friends')}</h2>
        {friendsLoading ? (
          <FriendsListSkeleton />
        ) : friends.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('noFriends')}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {friends.map((friend) => (
              <FriendCard key={friend.id} friend={friend} />
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}

function FriendCard({
  friend,
}: {
  friend: { id: string; name: string; netBalance: number }
}) {
  const t = useTranslations('GlobalLedger')
  const isOwed = friend.netBalance > 0
  const isSettled = friend.netBalance === 0

  return (
    <li>
      <Link
        href={`/friends/${friend.id}`}
        className="flex items-center justify-between rounded-xl border bg-card px-4 py-3 shadow-sm hover:bg-accent transition-colors"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <div className="flex flex-col">
          <span className="font-medium">{friend.name}</span>
          <span
            className={cn(
              'text-xs',
              isSettled
                ? 'text-muted-foreground'
                : isOwed
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400',
            )}
          >
            {isSettled
              ? t('settled_with', { name: friend.name })
              : isOwed
                ? `${friend.name} owes you`
                : `You owe ${friend.name}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!isSettled && (
            <span
              className={cn(
                'font-semibold text-sm tabular-nums',
                isOwed
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400',
              )}
            >
              {isOwed ? '+' : ''}
              {(friend.netBalance / 100).toFixed(2)}
            </span>
          )}
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </Link>
    </li>
  )
}

function HomeScreenSkeleton() {
  return (
    <main className="container max-w-screen-sm mx-auto px-4 py-6 flex flex-col gap-6">
      <section className="rounded-2xl border bg-card shadow-sm p-6 flex flex-col items-center gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-12 w-40" />
        <Skeleton className="h-4 w-32" />
      </section>
      <section className="flex flex-col gap-3">
        <Skeleton className="h-6 w-20" />
        <FriendsListSkeleton />
      </section>
    </main>
  )
}

function FriendsListSkeleton() {
  return (
    <ul className="flex flex-col gap-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <li key={i}>
          <div className="rounded-xl border bg-card px-4 py-3 shadow-sm flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        </li>
      ))}
    </ul>
  )
}
