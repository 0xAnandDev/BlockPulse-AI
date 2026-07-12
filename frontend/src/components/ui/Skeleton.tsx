import { cn } from '../../lib/utils'

export default function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-lg bg-[rgba(148,163,200,0.1)]', className)}
      aria-hidden="true"
    />
  )
}
