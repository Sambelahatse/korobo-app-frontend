import { Children, Fragment, cloneElement, isValidElement, useEffect, useRef, useState, type ReactElement, type ReactNode } from 'react'

type ActionElement = ReactElement<{ className?: string; title?: string; role?: string; 'aria-label'?: string; children?: ReactNode }>

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

function isDestructive(label: string): boolean {
  return /supprimer|archiver|suspendre|retirer|révoquer/i.test(label)
}

const triggerClassName = 'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-gray-400 transition-colors hover:border-[#dce8d5] hover:bg-[#f0f7eb] hover:text-[#4A7A3B] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A7A3B]/30'
const menuItemClassName = ' !flex !min-h-9 !h-auto !w-full !items-center !justify-start !gap-2.5 !rounded-lg !border-0 !bg-transparent !px-3 !py-2 !text-left !text-xs !font-medium !text-gray-600 !shadow-none !transition-colors hover:!bg-[#f0f7eb] hover:!text-[#4A7A3B] focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-[#4A7A3B]/30'

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

  if (actions.length === 0) return null

  if (actions.length === 1) {
    const action = actions[0]
    const label = actionLabel(action)
    return <div className="flex items-center justify-end">
      {cloneElement(action, {
        className: `${action.props.className ?? ''} !inline-flex !min-h-8 !items-center !justify-center !gap-2 !rounded-lg !border !border-gray-200 !px-2.5 !py-1.5 !text-xs !font-medium !text-gray-600 !shadow-none !transition-colors hover:!border-[#dce8d5] hover:!bg-[#f0f7eb] hover:!text-[#4A7A3B] focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-[#4A7A3B]/30`,
        title: action.props.title ?? label,
        'aria-label': action.props['aria-label'] ?? label,
      }, action.props.children ?? label)}
    </div>
  }

  return <div ref={menuRef} className="relative flex items-center justify-end">
    <button type="button" aria-label="Afficher les actions" aria-haspopup="menu" aria-expanded={open}
      onClick={() => setOpen(value => !value)}
      className={triggerClassName}>
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="5" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="12" cy="19" r="1.8" />
      </svg>
    </button>
    {open && <div role="menu" className="absolute right-0 top-full z-50 mt-1 min-w-48 rounded-xl border border-gray-100 bg-white p-1.5 shadow-lg shadow-gray-900/10 ring-1 ring-black/[0.02]">
      {actions.map((action, index) => {
        const label = actionLabel(action)
        const hasText = Children.toArray(action.props.children).some(child => typeof child === 'string' || typeof child === 'number')
        const destructiveClass = isDestructive(label) ? ' hover:!bg-red-50 hover:!text-red-600' : ''
        return <div key={action.key ?? index} role="none">
          {cloneElement(action, {
            className: `${action.props.className ?? ''}${menuItemClassName}${destructiveClass}`,
            title: undefined,
            'aria-label': label,
            role: 'menuitem',
          }, <>
            {action.props.children}
            {!hasText && <span>{label}</span>}
          </>)}
        </div>
      })}
    </div>}
  </div>
}
