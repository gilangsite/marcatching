'use client'

import { ReactNode } from 'react'

interface ProductCardTrackerProps {
  linkId: string
  linkTitle: string
  children: ReactNode
}

export default function ProductCardTracker({ linkId, linkTitle, children }: ProductCardTrackerProps) {
  function handleClick() {
    if (typeof window !== 'undefined' && window.__trackClick) {
      window.__trackClick(linkId, linkTitle)
    }
  }

  return (
    <div onClick={handleClick}>
      {children}
    </div>
  )
}
