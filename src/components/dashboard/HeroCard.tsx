import { cn } from '@/lib/utils'

type Props = {
  firstName: string
  role: string
  statLabel: string
  statValue: string
  className?: string
}

export function HeroCard({ firstName, role, statLabel, statValue, className }: Props) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-5 md:p-6 text-white shadow-sm',
        'bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#4FD1C5]'
      , className)}
    >
      <div className="absolute inset-0 opacity-20 [background:radial-gradient(600px_circle_at_0%_0%,#ffffff40,transparent_60%),radial-gradient(800px_circle_at_100%_0%,#ffffff20,transparent_60%)]" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-xs/5 md:text-sm/5 opacity-90">Welcome back</p>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{firstName}</h2>
          <p className="mt-1 text-xs md:text-sm opacity-90 capitalize">{role}</p>
        </div>
        <div className="text-right">
          <p className="text-xs opacity-90">{statLabel}</p>
          <p className="text-2xl md:text-3xl font-semibold">{statValue}</p>
        </div>
      </div>
    </div>
  )
}

export default HeroCard
