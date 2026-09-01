import { useRef, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"

export function CountUp({
  target,
  duration = 1400,
  prefix = "",
  suffix = "",
  decimals = 0,
  className,
}: {
  target: number
  duration?: number
  prefix?: string
  suffix?: string
  decimals?: number
  className?: string
}) {
  const [value, setValue] = useState(0)
  const started = useRef(false)
  const reduceMotion = useReducedMotion()

  const start = () => {
    if (started.current) return
    started.current = true
    if (reduceMotion) {
      setValue(target)
      return
    }
    const startTime = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(target * eased)
      if (progress < 1) requestAnimationFrame(tick)
      else setValue(target)
    }
    requestAnimationFrame(tick)
  }

  return (
    <motion.span
      className={className}
      onViewportEnter={start}
      viewport={{ once: true, margin: "-40px" }}
    >
      {prefix}
      {value.toFixed(decimals)}
      {suffix}
    </motion.span>
  )
}
