import React from 'react';
import { motion } from 'framer-motion';

const LockMark = ({ size = 18, isUnlocked = false, className = '' }) => (
  <motion.svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    aria-hidden="true"
    whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
    transition={{ duration: 0.3 }}
  >
    <motion.rect
      x="5"
      y="11"
      width="14"
      height="10"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.6"
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.02, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
    <motion.path
      d={isUnlocked ? "M8 11V6a4 4 0 0 1 8 0" : "M8 11V8a4 4 0 0 1 8 0v3"}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      animate={{
        y: isUnlocked ? -2 : 0,
        rotate: isUnlocked ? -15 : 0
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    />
    <motion.circle
      cx="12"
      cy="16"
      r="1.2"
      fill="currentColor"
      animate={{ scale: [1, 1.4, 1] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    />
  </motion.svg>
);

export default LockMark;

