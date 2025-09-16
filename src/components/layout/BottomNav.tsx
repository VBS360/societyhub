import { Link, useLocation } from 'react-router-dom'
import {
  Home,
  Users,
  CreditCard,
  Wrench,
  MessageSquare,
  ListChecks,
} from 'lucide-react'

const items = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Members', href: '/members', icon: Users },
  { name: 'Finances', href: '/finances', icon: CreditCard },
  { name: 'Maintenance', href: '/maintenance', icon: Wrench },
  { name: 'Announcements', href: '/announcements', icon: MessageSquare },
]

export function BottomNav() {
  const location = useLocation()

  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 inset-x-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden"
    >
      <ul className="grid grid-cols-6">
        {items.map((item) => {
          const Icon = item.icon
          const active = location.pathname === item.href
          return (
            <li key={item.name}>
              <Link
                to={item.href}
                className={`flex flex-col items-center justify-center gap-1 py-2 text-xs transition-colors ${
                  active
                    ? 'text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? 'text-primary' : ''}`} />
                <span className="leading-none">{item.name}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default BottomNav
