import { Laptop, Moon, Sun } from 'lucide-react'
import { useState } from 'react'
import { Button } from './components/ui/button'
import { DropdownMenu, DropdownMenuItem } from './components/ui/dropdown-menu'
import { Tooltip } from './components/ui/tooltip'

type Theme = 'light' | 'dark'
type Preference = Theme | undefined

type Option = {
  value: Preference
  label: string
  icon: typeof Sun
}

const STORAGE_KEY = 'theme'

const OPTIONS: Array<Option> = [
  { value: 'light', label: 'روشن', icon: Sun },
  { value: 'dark', label: 'تیره', icon: Moon },
  { value: undefined, label: 'سیستم', icon: Laptop },
]

function prefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function readPreference(): Preference {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'light' || stored === 'dark' ? stored : undefined
}

function apply(preference: Preference): void {
  if (preference === undefined) {
    localStorage.removeItem(STORAGE_KEY)
  } else {
    localStorage.setItem(STORAGE_KEY, preference)
  }
  document.documentElement.classList.toggle(
    'dark',
    preference === 'dark' || (preference === undefined && prefersDark()),
  )
}

export default function ThemePicker() {
  const [preference, setPreference] = useState<Preference>(readPreference)

  const CurrentIcon =
    preference === 'light' ? Sun : preference === 'dark' ? Moon : Laptop

  const select = (value: Preference) => {
    apply(value)
    setPreference(value)
  }

  return (
    <DropdownMenu
      align="end"
      trigger={({ triggerProps }) => (
        <Tooltip content="تغییر پوسته">
          <Button {...triggerProps} size="icon" aria-label="تغییر پوسته">
            <CurrentIcon
              key={preference}
              className="h-5 w-5 animate-icon-pop"
            />
          </Button>
        </Tooltip>
      )}
    >
      {OPTIONS.map((option) => (
        <DropdownMenuItem
          key={option.label}
          icon={option.icon}
          selected={option.value === preference}
          onSelect={() => select(option.value)}
        >
          {option.label}
        </DropdownMenuItem>
      ))}
    </DropdownMenu>
  )
}
