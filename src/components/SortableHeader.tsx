import type { ReactNode } from 'react'

type Props = {
  label: string
  sortKey: string
  activeKey: string
  direction: 'asc' | 'desc'
  onSort: (key: string) => void
  className?: string
  children?: ReactNode
}

export default function SortableHeader({ label, sortKey, activeKey, direction, onSort, className = '', children }: Props) {
  const active = activeKey === sortKey
  return (
    <th aria-sort={active ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'} className={className}>
      <button type="button" onClick={() => onSort(sortKey)} className="inline-flex items-center gap-1.5 text-left transition-colors hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8eb86f]" title={`Trier par ${label}`}>
        {label}
        <span aria-hidden="true" className={`text-[10px] ${active ? 'text-[#8eb86f]' : 'opacity-50'}`}>{active ? (direction === 'asc' ? '▲' : '▼') : '↕'}</span>
        {children}
      </button>
    </th>
  )
}
