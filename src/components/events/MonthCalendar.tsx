import { useMemo } from 'react'
import { cn } from '@/lib/utils'

export type CalendarEvent = {
  id: string
  title: string
  eventDate: string // ISO date
}

type Props = {
  month?: number // 0-11
  year?: number
  events: CalendarEvent[]
  selected?: Date | null
  onSelect?: (date: Date | null) => void
}

export function MonthCalendar({ month, year, events, selected, onSelect }: Props) {
  const today = new Date()
  const base = new Date(year ?? today.getFullYear(), month ?? today.getMonth(), 1)
  const startDay = new Date(base)
  startDay.setDate(1 - ((base.getDay() + 6) % 7)) // start Monday
  const days = useMemo(() => {
    const arr: Date[] = []
    const d = new Date(startDay)
    for (let i = 0; i < 42; i++) {
      arr.push(new Date(d))
      d.setDate(d.getDate() + 1)
    }
    return arr
  }, [base.getMonth(), base.getFullYear()])

  const eventMap = useMemo(() => {
    const m = new Map<string, number>()
    for (const e of events) {
      const dt = new Date(e.eventDate)
      const key = dt.toDateString()
      m.set(key, (m.get(key) ?? 0) + 1)
    }
    return m
  }, [events])

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

  const inMonth = (d: Date) => d.getMonth() === base.getMonth()

  return (
    <div className="rounded-xl border bg-card p-3">
      <div className="grid grid-cols-7 text-xs text-muted-foreground px-1">
        {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d) => (
          <div key={d} className="py-1 text-center">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => {
          const key = d.toDateString()
          const count = eventMap.get(key) ?? 0
          const active = selected && isSameDay(selected, d)
          const isToday = isSameDay(today, d)
          return (
            <button
              key={key}
              onClick={() => onSelect?.(inMonth(d) ? d : null)}
              className={cn(
                'relative h-10 rounded-md text-xs flex flex-col items-center justify-center transition-colors',
                inMonth(d) ? 'text-foreground' : 'text-muted-foreground/50',
                active ? 'bg-primary/10 ring-1 ring-primary' : 'hover:bg-muted'
              )}
            >
              <span className={cn('leading-none', isToday && 'font-semibold text-primary')}>{d.getDate()}</span>
              {count > 0 && (
                <span className="mt-1 inline-flex items-center justify-center rounded-full bg-primary/15 text-primary text-[10px] px-1.5 min-w-[1.25rem]">
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default MonthCalendar
