'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, useSpring, useMotionValue, AnimatePresence } from 'motion/react'

export default function Cursor() {
    const [hovering, setHovering] = useState(false)
    const [isClicking, setIsClicking] = useState(false)
    const [isVisible, setIsVisible] = useState(false)

    // Motion values for raw mouse position
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    // Spring config for fluid trailing effect
    const springConfig = { damping: 20, stiffness: 250, mass: 0.5 }
    const trailX = useSpring(mouseX, springConfig)
    const trailY = useSpring(mouseY, springConfig)

    const handleMouseMove = useCallback((e: MouseEvent) => {
        mouseX.set(e.clientX)
        mouseY.set(e.clientY)

        if (!isVisible) setIsVisible(true)

        // Detection for interactive elements
        const target = e.target as HTMLElement
        const interactive = target.closest('button, a, .card, [role="button"], input, textarea')
        setHovering(!!interactive)
    }, [isVisible, mouseX, mouseY])

    useEffect(() => {
        const handleMouseDown = () => setIsClicking(true)
        const handleMouseUp = () => setIsClicking(false)
        const handleMouseLeave = () => setIsVisible(false)
        const handleMouseEnter = () => setIsVisible(true)

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mousedown', handleMouseDown)
        window.addEventListener('mouseup', handleMouseUp)
        window.addEventListener('mouseleave', handleMouseLeave)
        window.addEventListener('mouseenter', handleMouseEnter)

        // Heavy-duty cursor hiding: Inject a style tag into the head
        const style = document.createElement('style')
        style.id = 'cursor-hide-style'
        style.innerHTML = `
            *, *::before, *::after, html, body, a, button, [role="button"], input, select, textarea, .card, .card * {
                cursor: none !important;
            }
        `
        document.head.appendChild(style)

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mousedown', handleMouseDown)
            window.removeEventListener('mouseup', handleMouseUp)
            window.removeEventListener('mouseleave', handleMouseLeave)
            window.removeEventListener('mouseenter', handleMouseEnter)

            // Clean up: Remove the style tag
            const styleElement = document.getElementById('cursor-hide-style')
            if (styleElement) {
                document.head.removeChild(styleElement)
            }
        }
    }, [handleMouseMove])

    if (typeof window === 'undefined') return null

    return (
        <div className="pointer-events-none fixed inset-0 z-[99999]">
            <AnimatePresence>
                {isVisible && (
                    <>
                        {/* Inner Dot - Precise pointing */}
                        <motion.div
                            className="bg-brand fixed z-20 h-2 w-2 rounded-full shadow-[0_0_10px_var(--color-brand)]"
                            style={{
                                left: mouseX,
                                top: mouseY,
                                translateX: '-50%',
                                translateY: '-50%',
                            }}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: isClicking ? 0.8 : 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                        />

                        {/* Outer Ring - Thematic feedback */}
                        <motion.div
                            className="fixed z-10 rounded-full border border-brand/40 bg-brand/5 shadow-[0_0_20px_rgba(var(--color-brand-rgb),0.1)] transition-colors duration-300"
                            style={{
                                left: trailX,
                                top: trailY,
                                translateX: '-50%',
                                translateY: '-50%',
                                width: 32,
                                height: 32,
                                backdropFilter: 'blur(2px)',
                            }}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{
                                scale: hovering ? 2 : 1,
                                opacity: 1,
                                backgroundColor: hovering ? 'rgba(var(--color-brand-rgb), 0.15)' : 'rgba(var(--color-brand-rgb), 0.05)',
                                borderColor: hovering ? 'rgba(var(--color-brand-rgb), 0.6)' : 'rgba(var(--color-brand-rgb), 0.3)',
                                borderRadius: hovering ? '35%' : '50%'
                            }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{
                                type: 'spring',
                                damping: 15,
                                stiffness: 150,
                            }}
                        />
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
