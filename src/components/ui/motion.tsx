"use client"

import type React from "react"
import { motion, useReducedMotion, type Variants } from "framer-motion"

/**
 * Small, shared motion layer for the admin.
 *
 * Motion here is deliberate and restrained (per the frontend-design skill):
 * a single orchestrated entrance for a list/section on load, and feedback that
 * answers user actions. Everything respects `prefers-reduced-motion` — when
 * reduced motion is requested these components render with no transform/opacity
 * animation at all.
 */

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * A container that staggers its direct {@link FadeItem} children on mount.
 * Use for a list or a group of sections that should resolve in sequence once.
 */
export function Stagger({
    children,
    className,
    gap = 0.04,
}: {
    children: React.ReactNode
    className?: string
    gap?: number
}) {
    const reduce = useReducedMotion()
    const variants: Variants = {
        hidden: {},
        show: {
            transition: { staggerChildren: reduce ? 0 : gap },
        },
    }
    return (
        <motion.div
            className={className}
            variants={variants}
            initial="hidden"
            animate="show"
        >
            {children}
        </motion.div>
    )
}

/**
 * A single item that fades and lifts in. Pair with {@link Stagger}, or use
 * standalone for a one-off reveal. No motion under reduced-motion preference.
 */
export function FadeItem({
    children,
    className,
    as = "div",
}: {
    children: React.ReactNode
    className?: string
    as?: "div" | "li" | "section"
}) {
    const reduce = useReducedMotion()
    const MotionTag = motion[as]
    const variants: Variants = {
        hidden: reduce ? { opacity: 1 } : { opacity: 0, y: 8 },
        show: {
            opacity: 1,
            y: 0,
            transition: { duration: reduce ? 0 : 0.28, ease: EASE },
        },
    }
    return (
        <MotionTag className={className} variants={variants}>
            {children}
        </MotionTag>
    )
}

/**
 * A subtle entrance for a whole page's content region, used once on route load.
 */
export function PageTransition({
    children,
    className,
}: {
    children: React.ReactNode
    className?: string
}) {
    const reduce = useReducedMotion()
    return (
        <motion.div
            className={className}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0 : 0.24, ease: EASE }}
        >
            {children}
        </motion.div>
    )
}
