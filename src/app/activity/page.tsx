import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Activity',
}

export default function ActivityPage() {
  return (
    <main className="container max-w-screen-sm mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Activity</h1>
      <p className="text-muted-foreground text-sm">
        Global activity feed coming soon. For now, view activity within each{' '}
        <Link href="/groups" className="text-primary underline">
          group
        </Link>
        .
      </p>
    </main>
  )
}
