export const springPresets = {
  snappy: { type: "spring", stiffness: 400, damping: 30 },
  gentle: { type: "spring", stiffness: 300, damping: 35 },
  bouncy: { type: "spring", stiffness: 500, damping: 25, mass: 0.8 },
  smooth: { type: "spring", stiffness: 200, damping: 40, mass: 1.2 },
  inertia: { type: "spring", stiffness: 150, damping: 20, mass: 0.5 },
}

export const appleEase = {
  standard: [0.25, 0.1, 0.25, 1.0],
  out: [0.22, 1, 0.36, 1],
  decelerate: [0, 0, 0.2, 1],
}

export const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 400, damping: 25 } },
}

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
}

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 30 } },
}

export const hoverLift = {
  rest: { scale: 1, y: 0, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" },
  hover: { scale: 1.02, y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.15)", transition: { type: "spring", stiffness: 400, damping: 25 } },
}

export const tapScale = {
  rest: { scale: 1 },
  pressed: { scale: 0.96, transition: { type: "spring", stiffness: 500, damping: 30 } },
}

export const modalOverlay = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

export const modalContent = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 35 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
}

export const pageTransition = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 260, damping: 40 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
}
