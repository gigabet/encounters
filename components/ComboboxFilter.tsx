'use client'

// components/ComboboxFilter.tsx
//
// A type-to-filter multi-select: focusing the input reveals the option
// list, picking one drops it in as a badge *inside* the field (with its
// own × to remove), and the input keeps working for narrowing/adding more.
//
// The dropdown is rendered through a portal to document.body with fixed
// positioning computed from the field's own bounding rect. It used to be
// a plain `position: absolute` child of the field — which sat inside the
// sidebar's `overflow-y-auto` region, so opening even a short list made
// that whole ancestor register as overflowing and grow its own scrollbar
// on top of the dropdown's. Portaling it out sidesteps that entirely: the
// dropdown floats above the page and can't affect anyone's layout.

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export function ComboboxFilter({
  label,
  placeholder,
  options,
  selected,
  onChange,
}: {
  label: string
  placeholder: string
  options: string[]
  selected: Set<string>
  onChange: (next: Set<string>) => void
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const fieldRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => setMounted(true), [])

  const updateCoords = useCallback(() => {
    const rect = fieldRef.current?.getBoundingClientRect()
    if (!rect) return
    setCoords({ top: rect.bottom + 4, left: rect.left, width: rect.width })
  }, [])

  useLayoutEffect(() => {
    if (!open) return
    updateCoords()
    window.addEventListener('scroll', updateCoords, true)
    window.addEventListener('resize', updateCoords)
    return () => {
      window.removeEventListener('scroll', updateCoords, true)
      window.removeEventListener('resize', updateCoords)
    }
  }, [open, updateCoords])

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node
      if (containerRef.current?.contains(target)) return
      if (dropdownRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return options.filter(o => !selected.has(o) && (q === '' || o.toLowerCase().includes(q)))
  }, [options, selected, query])

  const selectedList = useMemo(() => Array.from(selected).sort(), [selected])

  function select(opt: string) {
    const next = new Set(selected)
    next.add(opt)
    onChange(next)
    setQuery('')
    inputRef.current?.focus()
  }

  function remove(opt: string) {
    const next = new Set(selected)
    next.delete(opt)
    onChange(next)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered.length > 0) select(filtered[0])
    } else if (e.key === 'Backspace' && query === '' && selectedList.length > 0) {
      remove(selectedList[selectedList.length - 1])
    }
  }

  return (
    <div ref={containerRef}>
      <p className='text-ink-muted mb-1.5 text-xs'>{label}</p>

      {/* biome-ignore lint/a11y/useKeyWithClickEvents: focuses a real input below */}
      <div
        ref={fieldRef}
        onClick={() => {
          setOpen(true)
          inputRef.current?.focus()
        }}
        className='border-border bg-surface focus-within:border-accent flex flex-wrap items-center gap-1.5 border px-2 py-1.5'
      >
        {selectedList.map(opt => (
          <span
            key={opt}
            className='border-accent bg-accent/10 text-accent inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-xs'
          >
            {opt}
            <button
              type='button'
              onClick={e => {
                e.stopPropagation()
                remove(opt)
              }}
              aria-label={`Remove ${opt}`}
              className='hover:text-ink -mr-0.5 leading-none'
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type='text'
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={selectedList.length === 0 ? placeholder : ''}
          className='text-ink placeholder:text-ink-muted/60 min-w-[4rem] flex-1 bg-transparent text-sm focus:outline-none'
          role='combobox'
          aria-expanded={open}
          aria-autocomplete='list'
          aria-label={label}
        />
      </div>

      {mounted &&
        open &&
        coords &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{ position: 'fixed', top: coords.top, left: coords.left, width: coords.width }}
            className='z-50'
          >
            {filtered.length > 0 && (
              <ul
                role='listbox'
                className='border-border bg-surface max-h-48 w-full scrollbar-thin overflow-y-auto border py-1 text-sm shadow-md'
              >
                {filtered.map(opt => (
                  <li key={opt} role='option' aria-selected={false}>
                    <button
                      type='button'
                      onClick={() => select(opt)}
                      className='text-ink hover:bg-accent/10 hover:text-accent block w-full px-3 py-1.5 text-left'
                    >
                      {opt}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {filtered.length === 0 && query.trim() !== '' && (
              <div className='border-border bg-surface text-ink-muted w-full border px-3 py-2 text-sm shadow-md'>
                No matches
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  )
}
