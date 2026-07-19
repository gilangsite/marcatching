'use client'

import { useEffect, useSyncExternalStore } from 'react'
import {
  EXPERIENCE_SECTIONS,
  type CapabilityTier,
  type ExperienceSectionId,
} from './experience-data'

type Pointer = { x: number; y: number }

type ExperienceSnapshot = {
  activeSection: ExperienceSectionId
  activeIndex: number
  sectionProgress: number
  pageProgress: number
  tier: CapabilityTier
  reducedMotion: boolean
}

const initialSnapshot: ExperienceSnapshot = {
  activeSection: 'hero',
  activeIndex: 0,
  sectionProgress: 0,
  pageProgress: 0,
  tier: 'C',
  reducedMotion: true,
}

class ExperienceStore {
  private snapshot = initialSnapshot
  private pointer: Pointer = { x: 0, y: 0 }
  private listeners = new Set<() => void>()

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  getSnapshot = () => this.snapshot
  getServerSnapshot = () => initialSnapshot
  getPointer = () => this.pointer

  setPointer(pointer: Pointer) {
    this.pointer = pointer
  }

  update(next: Partial<ExperienceSnapshot>) {
    const snapshot = { ...this.snapshot, ...next }
    const changed = Object.entries(snapshot).some(
      ([key, value]) => this.snapshot[key as keyof ExperienceSnapshot] !== value,
    )
    if (!changed) return
    this.snapshot = snapshot
    this.listeners.forEach((listener) => listener())
  }
}

export const experienceStore = new ExperienceStore()

export function useExperience() {
  return useSyncExternalStore(
    experienceStore.subscribe,
    experienceStore.getSnapshot,
    experienceStore.getServerSnapshot,
  )
}

function getCapabilityTier(reducedMotion: boolean): CapabilityTier {
  if (reducedMotion || window.innerWidth < 720) return 'C'

  const navigatorWithMemory = navigator as Navigator & { deviceMemory?: number }
  const memory = navigatorWithMemory.deviceMemory ?? 8
  const cores = navigator.hardwareConcurrency ?? 8

  if (memory <= 4 || cores <= 4 || window.innerWidth < 1100) return 'B'
  return 'A'
}

export function ExperienceRuntime() {
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0

    const syncCapabilities = () => {
      experienceStore.update({
        reducedMotion: media.matches,
        tier: getCapabilityTier(media.matches),
      })
    }

    const syncScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const pageMax = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)
        const pageProgress = Math.min(Math.max(window.scrollY / pageMax, 0), 1)
        const anchor = window.innerHeight * 0.48

        let activeIndex = 0
        let sectionProgress = 0

        EXPERIENCE_SECTIONS.forEach((section, index) => {
          const element = document.getElementById(section.id)
          if (!element) return
          const rect = element.getBoundingClientRect()
          if (rect.top <= anchor && rect.bottom >= anchor) {
            activeIndex = index
            sectionProgress = Math.min(
              Math.max((anchor - rect.top) / Math.max(rect.height, 1), 0),
              1,
            )
          } else if (rect.bottom < anchor) {
            activeIndex = index
            sectionProgress = 1
          }
        })

        experienceStore.update({
          activeIndex,
          activeSection: EXPERIENCE_SECTIONS[activeIndex]?.id ?? 'hero',
          sectionProgress,
          pageProgress,
        })
      })
    }

    const syncPointer = (event: PointerEvent) => {
      experienceStore.setPointer({
        x: (event.clientX / Math.max(window.innerWidth, 1)) * 2 - 1,
        y: -((event.clientY / Math.max(window.innerHeight, 1)) * 2 - 1),
      })
    }

    syncCapabilities()
    syncScroll()
    window.addEventListener('scroll', syncScroll, { passive: true })
    window.addEventListener('resize', syncCapabilities, { passive: true })
    window.addEventListener('resize', syncScroll, { passive: true })
    window.addEventListener('pointermove', syncPointer, { passive: true })
    media.addEventListener('change', syncCapabilities)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', syncScroll)
      window.removeEventListener('resize', syncCapabilities)
      window.removeEventListener('resize', syncScroll)
      window.removeEventListener('pointermove', syncPointer)
      media.removeEventListener('change', syncCapabilities)
    }
  }, [])

  return null
}
