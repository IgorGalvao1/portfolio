import type { MouseEvent } from 'react'
import { gsap } from 'gsap'
import { ScrollSmoother } from 'gsap/ScrollSmoother'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function enablePortfolioScroll(
  wrapper: HTMLDivElement,
  content: HTMLElement,
) {
  const hero = content.querySelector<HTMLElement>('.hero-stage')
  const stage = content.querySelector<HTMLElement>('.projects-stage')
  const viewport = stage?.querySelector<HTMLElement>('.project-viewport')
  const track = viewport?.querySelector<HTMLElement>('.project-track')
  if (!hero || !stage || !viewport || !track) return

  const cards = Array.from(track.querySelectorAll<HTMLElement>('.project-card'))
  const lastIndex = cards.length - 1
  if (lastIndex < 1) return

  gsap.registerPlugin(ScrollTrigger, ScrollSmoother)
  const motion = gsap.matchMedia()

  motion.add('(prefers-reduced-motion: no-preference)', () => {
    const anchor = document.getElementById(window.location.hash.slice(1))
    const shouldAlignAnchor = anchor && (
      window.scrollY === 0 || Math.abs(anchor.getBoundingClientRect().top) < 2
    )
    wrapper.dataset.scrollMotion = ''
    let carousel: ScrollTrigger | undefined
    let horizontalDistance = 0
    let scrollDistance = 1

    const smoother = ScrollSmoother.create({
      wrapper,
      content,
      smooth: 0.8,
      smoothTouch: 0.12,
      onFocusIn(smoother, event) {
        if (!(event.target instanceof HTMLElement)) return
        if (event.target === content || event.target.id === 'inicio') return false

        const card = event.target.closest<HTMLElement>('.project-card')
        if (!carousel || !card) return

        const index = cards.indexOf(card)
        if (index !== -1 && event.target.matches(':focus-visible')) {
          const target = carousel.start + (scrollDistance * index) / lastIndex
          smoother.scrollTo(target, false)
        }
        return false
      },
    })

    ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      pin: true,
      pinSpacing: false,
    })

    gsap.set(track, { x: 0 })
    const moveTrack = gsap.quickSetter(track, 'x', 'px')
    const focusValues = cards.map(() => -1)

    const render = ({ progress, start, end }: ScrollTrigger) => {
      const travel = Math.min(1, (progress * (end - start)) / scrollDistance)
      const position = travel * lastIndex
      moveTrack(-horizontalDistance * travel)

      cards.forEach((card, index) => {
        const focus = Math.max(0, 1 - Math.abs(position - index))
        if (focus === focusValues[index]) return

        focusValues[index] = focus
        card.style.setProperty('--project-focus', String(focus))
      })
    }

    carousel = ScrollTrigger.create({
      trigger: stage,
      start: () =>
        stage.offsetHeight > window.innerHeight ? 'bottom bottom' : 'top top',
      end: () => {
        horizontalDistance = Math.max(0, track.offsetWidth - viewport.clientWidth)
        scrollDistance = Math.max(1, horizontalDistance * 0.84)
        // Hold the final project as the About section slides over it.
        return `+=${scrollDistance + window.innerHeight}`
      },
      pin: true,
      onUpdate: render,
      onRefresh: render,
    })

    ScrollTrigger.refresh()
    if (shouldAlignAnchor && anchor.id === 'projetos') {
      smoother.scrollTo(carousel.start, false)
    } else if (shouldAlignAnchor && anchor.id === 'sobre') {
      smoother.scrollTo(anchor, false, 'top top')
    }

    return () => {
      delete wrapper.dataset.scrollMotion
      cards.forEach((card) => card.style.removeProperty('--project-focus'))
    }
  })

  return () => motion.revert()
}

export function scrollToTop(event: MouseEvent<HTMLAnchorElement>) {
  const smoother = ScrollSmoother.get()
  if (!smoother || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return

  event.preventDefault()
  const hash = event.currentTarget.hash
  if (window.location.hash !== hash) window.history.pushState(null, '', hash)

  document.getElementById(hash.slice(1))?.focus({ preventScroll: true })
  smoother.scrollTo(0, event.detail > 0)
}
