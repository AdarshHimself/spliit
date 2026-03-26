'use client'

import { useGlobalUser } from '@/app/global-user-context'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { trpc } from '@/trpc/client'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

export function UserSetupModal() {
  const { currentUser, isLoading, setCurrentUser } = useGlobalUser()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const { mutateAsync, isPending } = trpc.users.getOrCreate.useMutation()

  useEffect(() => {
    if (!isLoading && !currentUser) {
      setOpen(true)
    }
  }, [isLoading, currentUser])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (trimmed.length < 2) {
      setError('Name must be at least 2 characters')
      return
    }
    try {
      const { user } = await mutateAsync({ name: trimmed })
      setCurrentUser({ id: user.id, name: user.name })
      setOpen(false)
    } catch {
      setError('Something went wrong. Please try again.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[400px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome to Spliit</DialogTitle>
          <DialogDescription>
            Enter your name to get started. Your expenses and balances will be
            tracked globally across all groups.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          <Input
            placeholder="Your name"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError('')
            }}
            autoFocus
            minLength={2}
            maxLength={50}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={isPending || name.trim().length < 2}>
            {isPending ? 'Setting up…' : 'Get Started'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
