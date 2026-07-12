export default function Divider({ label = 'OR' }: { label?: string }) {
  return (
    <div className="my-6 flex items-center gap-3" role="separator" aria-label={label}>
      <span className="h-px flex-1 bg-[var(--line)]" />
      <span className="text-xs font-semibold tracking-wider text-[var(--ink-faint)]">{label}</span>
      <span className="h-px flex-1 bg-[var(--line)]" />
    </div>
  )
}
