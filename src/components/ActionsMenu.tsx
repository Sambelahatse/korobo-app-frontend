import { Children, Fragment, cloneElement, isValidElement, useEffect, useRef, useState, type ReactElement, type ReactNode } from 'react'

type ActionElement = ReactElement<{ className?: string; title?: string; 'aria-label'?: string; children?: ReactNode }>

function flattenActions(children: ReactNode): ReactNode[] {
  return Children.toArray(children).flatMap(child => {
    if (isValidElement(child) && child.type === Fragment) {
      return flattenActions((child.props as { children?: ReactNode }).children)
    }
    return child
  })
}

function actionLabel(action: ActionElement): string {
  const childText = Children.toArray(action.props.children)
    .filter((child): child is string | number => typeof child === 'string' || typeof child === 'number')
    .join(' ')
    .trim()
  return childText || action.props.title || action.props['aria-label'] || 'Action'
}

export default function ActionsMenu({ children }: { children: ReactNode }) {
  const actions = flattenActions(children).filter(isValidElement) as ActionElement[]
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  if (actions.length <= 1) return <div className="flex items-center gap-1">{actions}</div>

  return <div ref={menuRef} className="relative flex items-center justify-end">
    <button type="button" aria-label="Afficher les actions" aria-haspopup="menu" aria-expanded={open}
      onClick={() => setOpen(value => !value)}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4A7A3B]/30">
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="5" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="12" cy="19" r="1.8" />
      </svg>
    </button>
    {open && <div role="menu" className="absolute right-0 top-full z-50 mt-1 min-w-44 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg">
      {actions.map((action, index) => {
        const label = actionLabel(action)
        const hasText = Children.toArray(action.props.children).some(child => typeof child === 'string' || typeof child === 'number')
        return <div key={action.key ?? index} role="none">
          {cloneElement(action, {
            className: `${action.props.className ?? ''} !flex !h-auto !w-full !items-center !justify-start !gap-2 !rounded-lg !px-3 !py-2 !text-left hover:!bg-gray-50`,
            title: undefined,
            'aria-label': label,
          }, <>
            {action.props.children}
            {!hasText && <span>{label}</span>}
          </>)}
        </div>
      })}
    </div>}
  </div>
}
