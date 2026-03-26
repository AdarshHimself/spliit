'use client'

import { cn } from '@/lib/utils'
import { Activity, Home, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', icon: Home, labelKey: 'Home' },
  { href: '/groups', icon: Users, labelKey: 'Groups' },
  { href: '/activity', icon: Activity, labelKey: 'Activity' },
] as const

export function BottomNav() {
  const pathname = usePathname()
  const t = useTranslations('BottomNav')

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-stretch border-t bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
      {navItems.map(({ href, icon: Icon, labelKey }) => {
        const isActive =
          href === '/' ? pathname === '/' : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-0.5 text-xs transition-colors select-none',
              isActive
                ? 'text-primary font-semibold'
                : 'text-muted-foreground hover:text-foreground',
            )}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <Icon
              className={cn('h-5 w-5', isActive && 'stroke-[2.5px]')}
            />
            <span>{t(labelKey)}</span>
          </Link>
        )
      })}
    </nav>
  )
}
