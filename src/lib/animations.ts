import type { Transition } from "framer-motion";

export const pressSpring: Transition = {
  type: "spring",
  stiffness: 600,
  damping: 30,
  mass: 0.6,
};

export const releaseSpring: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 20,
  mass: 0.8,
};

export const cardSpring: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 32,
  mass: 0.9,
};

export const screenSpring: Transition = {
  type: "spring",
  stiffness: 320,
  damping: 30,
  mass: 1,
};

export const digitSpring: Transition = {
  type: "spring",
  stiffness: 900,
  damping: 60,
  mass: 0.35,
};

export const carouselSpring: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 32,
  mass: 0.9,
};

export const stagger = {
  transition: { delayChildren: 0.05, staggerChildren: 0.04 },
};

export const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};