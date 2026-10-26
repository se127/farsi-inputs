import { Check } from 'lucide-react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentType,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react'
import { createPortal } from 'react-dom'
import { Button, type ButtonProps } from './button'
import { cn } from './cn'
import { useAnchoredPosition } from './use-anchored-position'

type DropdownMenuTriggerProps = {
  ref: RefObject<HTMLButtonElement | null>
  onClick: () => void
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void
  'aria-haspopup': 'menu'
  'aria-expanded': boolean
  'aria-controls': string
}

type DropdownMenuTriggerState = {
  open: boolean
  triggerProps: DropdownMenuTriggerProps
}

type DropdownMenuProps = {
  trigger: (state: DropdownMenuTriggerState) => ReactNode
  children: ReactNode
  align?: 'start' | 'end'
  className?: string
}

type MenuContextValue = {
  close: () => void
  menuRef: RefObject<HTMLDivElement | null>
  menuId: string
}

const MenuContext = createContext<MenuContextValue | null>(null)

export function DropdownMenu({
  trigger,
  children,
  align = 'end',
  className,
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const position = useAnchoredPosition({
    open,
    anchorRef: triggerRef,
    layerRef: menuRef,
    side: 'bottom',
    align,
    offset: 8,
  })

  const close = useCallback(() => {
    setOpen(false)
    if (menuRef.current?.contains(document.activeElement)) {
      triggerRef.current?.focus()
    }
  }, [])

  const toggle = useCallback(() => setOpen((value) => !value), [])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return
      }
      setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  useEffect(() => {
    if (!open) return
    const frame = requestAnimationFrame(() => {
      const selected = menuRef.current?.querySelector<HTMLElement>(
        '[aria-current="true"]',
      )
      const first = menuRef.current?.querySelector<HTMLElement>(
        '[role="menuitem"]:not(:disabled)',
      )
      ;(selected ?? first)?.focus()
    })
    return () => cancelAnimationFrame(frame)
  }, [open])

  const menuItems = () =>
    Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>(
        '[role="menuitem"]:not(:disabled)',
      ) ?? [],
    )

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      setOpen(true)
    } else if (open && event.key === 'Escape') {
      event.preventDefault()
      close()
    } else if (open && event.key === 'Tab') {
      event.preventDefault()
      const items = menuItems()
      ;(event.shiftKey ? items[items.length - 1] : items[0])?.focus()
    }
  }

  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const items = menuItems()
    const active = document.activeElement as HTMLElement | null
    const index = active ? items.indexOf(active) : -1

    if (event.key === 'Escape') {
      event.preventDefault()
      close()
    } else if (event.key === 'Tab') {
      event.preventDefault()
      if (index === -1) {
        items[event.shiftKey ? items.length - 1 : 0]?.focus()
      } else if (event.shiftKey) {
        items[(index - 1 + items.length) % items.length]?.focus()
      } else {
        items[(index + 1) % items.length]?.focus()
      }
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      items[(index + 1) % items.length]?.focus()
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      items[(index - 1 + items.length) % items.length]?.focus()
    } else if (event.key === 'Home') {
      event.preventDefault()
      items[0]?.focus()
    } else if (event.key === 'End') {
      event.preventDefault()
      items[items.length - 1]?.focus()
    }
  }

  return (
    <>
      {trigger({
        open,
        triggerProps: {
          ref: triggerRef,
          onClick: toggle,
          onKeyDown: onTriggerKeyDown,
          'aria-haspopup': 'menu',
          'aria-expanded': open,
          'aria-controls': menuId,
        },
      })}
      {createPortal(
        <MenuContext.Provider value={{ close, menuId, menuRef }}>
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            data-side={position?.side ?? 'bottom'}
            style={{
              position: 'fixed',
              top: position?.top ?? 0,
              left: position?.left ?? 0,
            }}
            onKeyDown={onMenuKeyDown}
            className={cn(
              'z-50 flex w-max max-w-[calc(100vw-1rem)] min-w-36 origin-top flex-col rounded-lg border border-zinc-200 bg-white py-1 shadow-lg transition-[opacity,scale,translate,visibility] duration-150 ease-out dark:border-zinc-700 dark:bg-zinc-800',
              open && position
                ? 'visible translate-y-0 scale-100 opacity-100'
                : 'invisible translate-y-1 scale-95 opacity-0',
              className,
            )}
          >
            {children}
          </div>
        </MenuContext.Provider>,
        document.body,
      )}
    </>
  )
}

export type DropdownMenuItemProps = ButtonProps & {
  icon?: ComponentType<{ className?: string }>
  selected?: boolean
  onSelect?: () => void
}

export function DropdownMenuItem({
  icon: Icon,
  selected,
  onSelect,
  className,
  children,
  onClick,
  ...props
}: DropdownMenuItemProps) {
  const menu = useContext(MenuContext)

  if (!menu) {
    throw new Error('DropdownMenuItem must be used inside DropdownMenu')
  }

  return (
    <Button
      role="menuitem"
      tabIndex={-1}
      variant="ghost"
      size="md"
      aria-current={selected ? 'true' : undefined}
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        event.currentTarget.focus()
        onSelect?.()
        menu.close()
      }}
      className={cn(
        'w-full justify-start rounded-none px-3 font-normal focus:bg-zinc-100 dark:focus:bg-zinc-700',
        className,
      )}
      {...props}
    >
      {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
      <span>{children}</span>
      {selected === undefined ? null : (
        <Check
          aria-hidden={!selected}
          className={cn('ms-auto h-4 w-4 shrink-0', !selected && 'opacity-0')}
        />
      )}
    </Button>
  )
}
