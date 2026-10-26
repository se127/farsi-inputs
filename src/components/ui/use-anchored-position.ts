import { useCallback, useLayoutEffect, useState, type RefObject } from 'react'

export type LayerSide = 'top' | 'bottom'
export type LayerAlign = 'start' | 'center' | 'end'

type AnchoredPositionOptions = {
  open: boolean
  anchorRef: RefObject<HTMLElement | null>
  layerRef: RefObject<HTMLElement | null>
  side?: LayerSide
  align?: LayerAlign
  offset?: number
  padding?: number
}

type AnchoredPosition = {
  top: number
  left: number
  side: LayerSide
}

export function useAnchoredPosition({
  open,
  anchorRef,
  layerRef,
  side = 'top',
  align = 'center',
  offset = 8,
  padding = 8,
}: AnchoredPositionOptions): AnchoredPosition | null {
  const [position, setPosition] = useState<AnchoredPosition | null>(null)

  const update = useCallback(() => {
    const anchor = anchorRef.current
    const layer = layerRef.current
    if (!anchor || !layer) return

    const anchorRect = anchor.getBoundingClientRect()
    const layerRect = layer.getBoundingClientRect()
    const viewportWidth = document.documentElement.clientWidth
    const viewportHeight = document.documentElement.clientHeight
    const direction = getComputedStyle(anchor).direction

    const roomAbove = anchorRect.top - offset - padding
    const roomBelow = viewportHeight - anchorRect.bottom - offset - padding
    const fitsAbove = roomAbove >= layerRect.height
    const fitsBelow = roomBelow >= layerRect.height

    let resolvedSide: LayerSide
    if (side === 'top') {
      resolvedSide = fitsAbove || !fitsBelow ? 'top' : 'bottom'
    } else {
      resolvedSide = fitsBelow || !fitsAbove ? 'bottom' : 'top'
    }

    const idealTop =
      resolvedSide === 'top'
        ? anchorRect.top - offset - layerRect.height
        : anchorRect.bottom + offset
    const maxTop = Math.max(
      padding,
      viewportHeight - layerRect.height - padding,
    )
    const top = Math.min(Math.max(idealTop, padding), maxTop)

    const idealLeft =
      align === 'center'
        ? anchorRect.left + anchorRect.width / 2 - layerRect.width / 2
        : align === 'start'
          ? direction === 'rtl'
            ? anchorRect.right - layerRect.width
            : anchorRect.left
          : direction === 'rtl'
            ? anchorRect.left
            : anchorRect.right - layerRect.width
    const maxLeft = Math.max(padding, viewportWidth - layerRect.width - padding)
    const left = Math.min(Math.max(idealLeft, padding), maxLeft)

    setPosition((current) => {
      if (
        current &&
        Math.abs(current.top - top) < 0.5 &&
        Math.abs(current.left - left) < 0.5 &&
        current.side === resolvedSide
      ) {
        return current
      }
      return { top, left, side: resolvedSide }
    })
  }, [align, anchorRef, layerRef, offset, padding, side])

  useLayoutEffect(() => {
    if (!open) return

    update()

    const handleViewportChange = () => update()
    window.addEventListener('resize', handleViewportChange)
    window.addEventListener('scroll', handleViewportChange, true)
    const observer = new ResizeObserver(handleViewportChange)
    if (anchorRef.current) observer.observe(anchorRef.current)
    if (layerRef.current) observer.observe(layerRef.current)

    return () => {
      window.removeEventListener('resize', handleViewportChange)
      window.removeEventListener('scroll', handleViewportChange, true)
      observer.disconnect()
    }
  }, [open, update, anchorRef, layerRef])

  return position
}
