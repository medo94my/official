'use client'

import { motion } from 'motion/react'
import type { ComponentType, ElementType } from 'react'

/**
 * `motion.create(tag)` memoised by tag.
 *
 * Calling it in a render body — which is the obvious way to write a primitive
 * that takes an `as` prop — returns a *new component type* on every render.
 * React compares types by identity, so a new type means the old subtree is
 * unmounted and a fresh one mounted: children lose their state, and any
 * `whileInView` element re-runs its entrance because it is genuinely a new
 * node. It looks fine on a page of static server-rendered markup and breaks
 * the moment something inside holds state, which is the worst kind of latent
 * bug.
 *
 * The cache is module-scoped and keyed on the tag, so `<Reveal as="li">`
 * anywhere in the tree resolves to one stable component.
 */

/**
 * Motion's own return type is generic over the specific tag. Resolving it for
 * a value of type `ElementType` collapses the props to `unknown`, which then
 * rejects `className`. The primitives here pass motion props that are checked
 * at their own call sites, so the wrapper is deliberately loose and the
 * narrowing lives in `RevealProps` / `StaggeredListProps` instead.
 */
type AnyMotionComponent = ComponentType<Record<string, unknown>>

const cache = new Map<ElementType, AnyMotionComponent>()

export function motionComponent(as: ElementType): AnyMotionComponent {
  const hit = cache.get(as)
  if (hit) return hit

  const created = motion.create(
    as as Parameters<typeof motion.create>[0]
  ) as unknown as AnyMotionComponent

  cache.set(as, created)
  return created
}
