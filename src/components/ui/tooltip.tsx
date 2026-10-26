import {
  cloneElement,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { cn } from './cn'
import { useAnchoredPosition } from './use-anchored-position'

type TooltipTriggerProps = {
  'aria-describedby'?: string
}

type TooltipProps = {
  content: ReactNode
  children: ReactElement
  side?: 'top' | 'bottom'
  className?: string
}

export function Tooltip({
  content,
  children,
  side = 'top',
  className,
}: TooltipProps) {
  const id = useId()
  const anchorRef = useRef<HTMLSpanElement | null>(null)
  const layerRef = useRef<HTMLDivElement | null>(null)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const open = hovered || focused
  const position = useAnchoredPosition({
    open,
    anchorRef,
    layerRef,
    side,
    align: 'center',
  })

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setHovered(false)
        setFocused(false)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  const trigger = children as ReactElement<TooltipTriggerProps>
  const describedBy = [trigger.props['aria-describedby'], open ? id : null]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      <span
        ref={anchorRef}
        className="inline-flex"
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onFocus={(event) => {
          if ((event.target as HTMLElement).matches(':focus-visible')) {
            setFocused(true)
          }
        }}
        onBlur={() => setFocused(false)}
      >
        {cloneElement(trigger, {
          'aria-describedby': describedBy || undefined,
        })}
      </span>
      {createPortal(
        <div
          ref={layerRef}
          role="tooltip"
          id={id}
          data-side={position?.side ?? side}
          style={{
            position: 'fixed',
            top: position?.top ?? 0,
            left: position?.left ?? 0,
          }}
          className={cn(
            'pointer-events-none z-50 w-max max-w-[calc(100vw-1rem)] rounded-md bg-zinc-900 px-2 py-1 text-xs text-zinc-50 transition-[opacity,visibility] duration-150 dark:bg-white dark:text-zinc-900',
            open && position ? 'visible opacity-100' : 'invisible opacity-0',
            className,
          )}
        >
          {content}
        </div>,
        document.body,
      )}
    </>
  )
}
