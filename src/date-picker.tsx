import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { Button } from './components/ui/button'
import { cn } from './components/ui/cn'
import { useAnchoredPosition } from './components/ui/use-anchored-position'
import {
  addJalaliDays,
  addJalaliMonths,
  formatJalali,
  formatJalaliLong,
  JALALI_MONTHS,
  JALALI_WEEKDAYS,
  jalaliMonthDays,
  jalaliWeekdayIndex,
  sameJalaliDate,
  toPersianDigits,
  todayJalali,
  type JalaliDate,
} from './jalali'

type ViewMonth = {
  jy: number
  jm: number
}

type Mode = 'days' | 'years' | 'months'

type DatePickerProps = {
  className?: string
}

const YEAR_RADIUS = 100
const YEARS_PER_PAGE = 12
const YEAR_COLUMNS = 4
const MONTH_COLUMNS = 3
const DAY_ROWS = 6
const DAY_COLUMNS = 7

const cellFocus =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:focus-visible:outline-zinc-500'

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum)
}

function dayKey(date: JalaliDate): string {
  return `day-${date.jy}-${date.jm}-${date.jd}`
}

function yearKey(year: number): string {
  return `year-${year}`
}

function monthKey(month: number): string {
  return `month-${month}`
}

function yearPageFor(year: number, rangeStart: number): number {
  return Math.floor((year - rangeStart) / YEARS_PER_PAGE)
}

function getFocusable(root: HTMLElement | null): Array<HTMLElement> {
  if (!root) return []
  return Array.from(
    root.querySelectorAll<HTMLElement>('button:not([disabled])'),
  ).filter((element) => element.tabIndex >= 0)
}

export default function DatePicker({ className }: DatePickerProps) {
  const today = todayJalali()
  const rangeStart = today.jy - YEAR_RADIUS
  const rangeEnd = today.jy + YEAR_RADIUS
  const yearPageCount = Math.ceil((rangeEnd - rangeStart + 1) / YEARS_PER_PAGE)

  const [selected, setSelected] = useState<JalaliDate | null>(null)
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<Mode>('days')
  const [modeStack, setModeStack] = useState<Array<Mode>>([])
  const [view, setView] = useState<ViewMonth>({ jy: today.jy, jm: today.jm })
  const [focusedDay, setFocusedDay] = useState<JalaliDate>(today)
  const [focusedYear, setFocusedYear] = useState(today.jy)
  const [focusedMonth, setFocusedMonth] = useState(today.jm)
  const [yearPage, setYearPage] = useState(0)
  const [focusKey, setFocusKey] = useState<string | null>(null)
  const [fieldWidth, setFieldWidth] = useState(0)

  const fieldRef = useRef<HTMLInputElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const popoverId = useId()

  const position = useAnchoredPosition({
    open,
    anchorRef: fieldRef,
    layerRef: popoverRef,
    side: 'bottom',
    align: 'start',
    offset: 8,
  })

  useLayoutEffect(() => {
    const field = fieldRef.current
    if (!field) return
    const update = () => setFieldWidth(field.getBoundingClientRect().width)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(field)
    return () => observer.disconnect()
  }, [])

  useLayoutEffect(() => {
    if (!open || !position || !focusKey) return
    const target = popoverRef.current?.querySelector<HTMLElement>(
      `[data-focus="${focusKey}"]`,
    )
    if (!target) return
    target.focus()
    setFocusKey(null)
  }, [open, position, focusKey, mode, view.jy, view.jm, yearPage])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (
        fieldRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      ) {
        return
      }
      setOpen(false)
      setMode('days')
      setModeStack([])
      setFocusKey(null)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const openPicker = () => {
    const initial = selected ?? today
    setView({ jy: initial.jy, jm: initial.jm })
    setFocusedDay(initial)
    setFocusedYear(initial.jy)
    setFocusedMonth(initial.jm)
    setMode('days')
    setModeStack([])
    setOpen(true)
    setFocusKey(dayKey(initial))
  }

  const closePicker = (returnFocus: boolean) => {
    setOpen(false)
    setMode('days')
    setModeStack([])
    setFocusKey(null)
    if (returnFocus) fieldRef.current?.focus()
  }

  const onFieldClick = () => {
    if (open) closePicker(true)
    else openPicker()
  }

  const onFieldKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (open) closePicker(true)
      else openPicker()
    } else if (event.key === 'Escape' && open) {
      event.preventDefault()
      closePicker(true)
    } else if (event.key === 'Tab' && open) {
      const focusable = getFocusable(popoverRef.current)
      if (focusable.length === 0) return
      event.preventDefault()
      const target = event.shiftKey
        ? focusable[focusable.length - 1]
        : focusable[0]
      target?.focus()
    }
  }

  const selectDay = (date: JalaliDate) => {
    setSelected(date)
    closePicker(true)
  }

  const canGoPreviousMonth = view.jy > rangeStart || view.jm > 1
  const canGoNextMonth = view.jy < rangeEnd || view.jm < 12

  const goToMonth = (delta: number) => {
    const next = addJalaliMonths(view.jy, view.jm, delta)
    if (next.jy < rangeStart || next.jy > rangeEnd) return
    setView(next)
    setFocusedDay((current) => ({
      ...next,
      jd: Math.min(current.jd, jalaliMonthDays(next.jy, next.jm)),
    }))
  }

  const onMonthArrowKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      goToMonth(-1)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      goToMonth(1)
    }
  }

  const pageStart = rangeStart + yearPage * YEARS_PER_PAGE
  const pageLastYear = Math.min(pageStart + YEARS_PER_PAGE - 1, rangeEnd)
  const pageYears = Array.from({ length: YEARS_PER_PAGE }, (_, index) => {
    const year = pageStart + index
    return year <= rangeEnd ? year : null
  })
  const pageYearValues = pageYears.filter(
    (year): year is number => year !== null,
  )

  const popPanel = (): Mode => {
    const previous = modeStack[modeStack.length - 1] ?? 'days'
    setMode(previous)
    setModeStack((stack) => stack.slice(0, -1))
    setFocusKey(null)
    return previous
  }

  const closeSubPanel = () => {
    const previous = popPanel()
    setFocusKey(
      previous === 'days'
        ? dayKey(focusedDay)
        : previous === 'years'
          ? yearKey(focusedYear)
          : monthKey(focusedMonth),
    )
  }

  const togglePanel = (target: 'years' | 'months') => {
    if (mode === target) {
      popPanel()
      return
    }
    setModeStack((stack) => [...stack, mode])
    setMode(target)
    setFocusKey(null)
    if (target === 'years') {
      setYearPage(yearPageFor(view.jy, rangeStart))
      setFocusedYear(view.jy)
    } else {
      setFocusedMonth(view.jm)
    }
  }

  const openYearPanel = () => togglePanel('years')

  const openMonthPanel = () => togglePanel('months')

  const goToYearPage = (delta: number, moveFocus = true) => {
    const nextPage = clamp(yearPage + delta, 0, yearPageCount - 1)
    if (nextPage === yearPage) return
    setYearPage(nextPage)
    const nextStart = rangeStart + nextPage * YEARS_PER_PAGE
    const nextEnd = Math.min(nextStart + YEARS_PER_PAGE - 1, rangeEnd)
    const nextFocus = delta > 0 ? nextStart : nextEnd
    setFocusedYear(nextFocus)
    if (moveFocus) setFocusKey(yearKey(nextFocus))
    else setFocusKey(null)
  }

  const onYearPageKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      goToYearPage(-1, false)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      goToYearPage(1, false)
    }
  }

  const selectYear = (year: number) => {
    if (year < rangeStart || year > rangeEnd) return
    const next = { jy: year, jm: view.jm }
    const jd = Math.min(focusedDay.jd, jalaliMonthDays(next.jy, next.jm))
    setView(next)
    setFocusedDay({ ...next, jd })
    setMode('days')
    setModeStack([])
    setFocusKey(dayKey({ ...next, jd }))
  }

  const selectMonth = (month: number) => {
    const next = { jy: view.jy, jm: month }
    const jd = Math.min(focusedDay.jd, jalaliMonthDays(next.jy, next.jm))
    setView(next)
    setFocusedDay({ ...next, jd })
    setMode('days')
    setModeStack([])
    setFocusKey(dayKey({ ...next, jd }))
  }

  const onPopoverKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      if (mode === 'days') {
        closePicker(true)
      } else {
        closeSubPanel()
      }
      return
    }
    if (event.key !== 'Tab') return
    const focusable = getFocusable(popoverRef.current)
    if (focusable.length === 0) {
      event.preventDefault()
      return
    }
    event.preventDefault()
    const active = document.activeElement as HTMLElement | null
    const index = active ? focusable.indexOf(active) : -1
    const nextIndex = event.shiftKey
      ? index <= 0
        ? focusable.length - 1
        : index - 1
      : index === -1 || index === focusable.length - 1
        ? 0
        : index + 1
    focusable[nextIndex]?.focus()
  }

  const onDayGridKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    let delta = 0
    switch (event.key) {
      case 'ArrowLeft':
        delta = 1
        break
      case 'ArrowRight':
        delta = -1
        break
      case 'ArrowUp':
        delta = -DAY_COLUMNS
        break
      case 'ArrowDown':
        delta = DAY_COLUMNS
        break
      default:
        return
    }
    event.preventDefault()
    const target = addJalaliDays(focusedDay, delta)
    if (target.jy < rangeStart || target.jy > rangeEnd) return
    if (target.jy !== view.jy || target.jm !== view.jm) {
      setView({ jy: target.jy, jm: target.jm })
    }
    setFocusedDay(target)
    setFocusKey(dayKey(target))
  }

  const onMonthGridKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    let delta = 0
    switch (event.key) {
      case 'ArrowLeft':
        delta = 1
        break
      case 'ArrowRight':
        delta = -1
        break
      case 'ArrowUp':
        delta = -MONTH_COLUMNS
        break
      case 'ArrowDown':
        delta = MONTH_COLUMNS
        break
      default:
        return
    }
    event.preventDefault()
    const next = clamp(focusedMonth + delta, 1, 12)
    if (next === focusedMonth) return
    setFocusedMonth(next)
    setFocusKey(monthKey(next))
  }

  const onYearGridKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    let delta = 0
    switch (event.key) {
      case 'ArrowLeft':
        delta = 1
        break
      case 'ArrowRight':
        delta = -1
        break
      case 'ArrowUp':
        delta = -YEAR_COLUMNS
        break
      case 'ArrowDown':
        delta = YEAR_COLUMNS
        break
      default:
        return
    }
    event.preventDefault()
    const current = Math.max(0, pageYearValues.indexOf(focusedYear))
    const next = current + delta
    if (next < 0 || next >= pageYearValues.length) {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        goToYearPage(next < 0 ? -1 : 1)
        return
      }
      const clamped = pageYearValues[clamp(next, 0, pageYearValues.length - 1)]
      if (clamped === undefined) return
      setFocusedYear(clamped)
      setFocusKey(yearKey(clamped))
      return
    }
    const nextYear = pageYearValues[next]
    if (nextYear === undefined) return
    setFocusedYear(nextYear)
    setFocusKey(yearKey(nextYear))
  }

  const monthLength = jalaliMonthDays(view.jy, view.jm)
  const leadingBlanks = jalaliWeekdayIndex({ jy: view.jy, jm: view.jm, jd: 1 })
  const dayCells = Array.from(
    { length: DAY_ROWS * DAY_COLUMNS },
    (_, index) => {
      const day = index - leadingBlanks + 1
      return day >= 1 && day <= monthLength ? day : null
    },
  )

  const header = (
    <div className="grid grid-cols-[2rem_1fr_2rem] items-center gap-1">
      {mode === 'days' ? (
        <Button
          variant="ghost"
          size="icon"
          aria-label="ماه قبل"
          disabled={!canGoPreviousMonth}
          onClick={() => goToMonth(-1)}
          onKeyDown={onMonthArrowKeyDown}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      ) : mode === 'years' ? (
        <Button
          variant="ghost"
          size="icon"
          aria-label="سال‌های قبل"
          aria-disabled={yearPage === 0}
          onClick={() => goToYearPage(-1)}
          onKeyDown={onYearPageKeyDown}
          className={cn(yearPage === 0 && 'opacity-50')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      ) : (
        <span className="h-8 w-8" />
      )}
      <div className="flex items-center justify-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          tabIndex={0}
          aria-expanded={mode === 'years'}
          aria-label={`انتخاب سال ${toPersianDigits(view.jy)}`}
          onClick={openYearPanel}
          className={cn(
            'tabular-nums',
            mode === 'years' && 'bg-zinc-100 dark:bg-zinc-700',
          )}
        >
          {toPersianDigits(view.jy)}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          tabIndex={0}
          aria-expanded={mode === 'months'}
          aria-label={`انتخاب ماه ${JALALI_MONTHS[view.jm - 1]}`}
          onClick={openMonthPanel}
          className={cn(mode === 'months' && 'bg-zinc-100 dark:bg-zinc-700')}
        >
          {JALALI_MONTHS[view.jm - 1]}
        </Button>
      </div>
      {mode === 'days' ? (
        <Button
          variant="ghost"
          size="icon"
          aria-label="ماه بعد"
          disabled={!canGoNextMonth}
          onClick={() => goToMonth(1)}
          onKeyDown={onMonthArrowKeyDown}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      ) : mode === 'years' ? (
        <Button
          variant="ghost"
          size="icon"
          aria-label="سال‌های بعد"
          aria-disabled={yearPage === yearPageCount - 1}
          onClick={() => goToYearPage(1)}
          onKeyDown={onYearPageKeyDown}
          className={cn(yearPage === yearPageCount - 1 && 'opacity-50')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      ) : (
        <span className="h-8 w-8" />
      )}
    </div>
  )

  const dayView = (
    <div
      role="group"
      aria-label={`روزهای ${JALALI_MONTHS[view.jm - 1]} ${toPersianDigits(view.jy)}`}
      className="grid grid-cols-7 gap-1"
      onKeyDown={onDayGridKeyDown}
    >
      {JALALI_WEEKDAYS.map((weekday) => (
        <span
          key={weekday}
          className="flex h-8 items-center justify-center text-xs text-zinc-500 dark:text-zinc-400"
        >
          {weekday}
        </span>
      ))}
      {dayCells.map((day, index) => {
        if (day === null) {
          return (
            <span key={`blank-${index}`} aria-hidden="true" className="h-9" />
          )
        }
        const date = { jy: view.jy, jm: view.jm, jd: day }
        const isToday = sameJalaliDate(today, date)
        const isSelected = selected !== null && sameJalaliDate(selected, date)
        return (
          <button
            key={day}
            type="button"
            data-focus={dayKey(date)}
            aria-label={formatJalaliLong(date)}
            aria-current={isToday ? 'date' : undefined}
            aria-pressed={isSelected ? true : undefined}
            onClick={() => selectDay(date)}
            onFocus={() =>
              setFocusedDay((current) =>
                sameJalaliDate(current, date) ? current : date,
              )
            }
            className={cn(
              'flex h-9 w-full items-center justify-center rounded-lg text-sm tabular-nums transition-colors',
              cellFocus,
              isToday &&
                !isSelected &&
                'bg-zinc-100 font-semibold text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100',
              isSelected &&
                'bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200',
              !isToday &&
                !isSelected &&
                'text-zinc-900 hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-700',
            )}
          >
            {toPersianDigits(day)}
          </button>
        )
      })}
    </div>
  )

  const monthView = (
    <div
      role="group"
      aria-label="ماه‌های سال"
      className="grid grid-cols-3 gap-1"
      onKeyDown={onMonthGridKeyDown}
    >
      {JALALI_MONTHS.map((month, index) => {
        const value = index + 1
        const isActive = value === view.jm
        return (
          <button
            key={month}
            type="button"
            data-focus={monthKey(value)}
            aria-label={`انتخاب ${month}`}
            aria-current={isActive ? 'true' : undefined}
            onClick={() => selectMonth(value)}
            onFocus={() => setFocusedMonth(value)}
            className={cn(
              'flex h-10 items-center justify-center rounded-lg text-sm transition-colors',
              cellFocus,
              isActive
                ? 'bg-zinc-100 font-semibold text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100'
                : 'text-zinc-900 hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-700',
            )}
          >
            {month}
          </button>
        )
      })}
    </div>
  )

  const yearView = (
    <div>
      <div className="mb-2 text-center text-xs text-zinc-500 tabular-nums dark:text-zinc-400">
        {toPersianDigits(pageStart)} تا {toPersianDigits(pageLastYear)}
      </div>
      <div
        role="group"
        aria-label="سال‌ها"
        className="grid grid-cols-4 gap-1"
        onKeyDown={onYearGridKeyDown}
      >
        {pageYears.map((year, index) => {
          if (year === null) {
            return (
              <span
                key={`blank-${index}`}
                aria-hidden="true"
                className="h-10"
              />
            )
          }
          const isActive = year === view.jy
          return (
            <button
              key={year}
              type="button"
              data-focus={yearKey(year)}
              aria-label={`انتخاب سال ${toPersianDigits(year)}`}
              aria-current={isActive ? 'true' : undefined}
              onClick={() => selectYear(year)}
              onFocus={() => setFocusedYear(year)}
              className={cn(
                'flex h-10 items-center justify-center rounded-lg text-sm tabular-nums transition-colors',
                cellFocus,
                isActive
                  ? 'bg-zinc-100 font-semibold text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100'
                  : 'text-zinc-900 hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-700',
              )}
            >
              {toPersianDigits(year)}
            </button>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className={cn('w-full', className)}>
      <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        انتخاب تاریخ
      </h2>
      <input
        ref={fieldRef}
        type="text"
        readOnly
        value={selected ? formatJalali(selected) : ''}
        placeholder="تاریخ را انتخاب کنید"
        aria-label="تاریخ"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={popoverId}
        inputMode="none"
        autoComplete="off"
        spellCheck={false}
        onClick={onFieldClick}
        onKeyDown={onFieldKeyDown}
        className="h-11 w-full cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm transition-colors placeholder:text-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus-visible:ring-zinc-500 dark:focus-visible:ring-offset-zinc-900"
      />
      {createPortal(
        <div
          ref={popoverRef}
          id={popoverId}
          role="dialog"
          aria-label="انتخاب تاریخ"
          data-side={position?.side ?? 'bottom'}
          style={{
            position: 'fixed',
            top: position?.top ?? 0,
            left: position?.left ?? 0,
            width: fieldWidth > 0 ? fieldWidth : undefined,
          }}
          onKeyDown={onPopoverKeyDown}
          className={cn(
            'z-50 w-[min(28rem,calc(100vw-2rem))] max-w-[calc(100vw-1rem)] rounded-xl border border-zinc-200 bg-white p-3 shadow-xl transition-[opacity,translate,visibility] duration-150 ease-out dark:border-zinc-700 dark:bg-zinc-800',
            open && position
              ? 'visible translate-y-0 opacity-100'
              : 'invisible translate-y-1 opacity-0',
          )}
        >
          {header}
          {mode === 'days' ? dayView : null}
          {mode === 'months' ? monthView : null}
          {mode === 'years' ? yearView : null}
        </div>,
        document.body,
      )}
    </div>
  )
}
