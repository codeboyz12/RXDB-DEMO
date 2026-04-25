'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface GlitchTextProps {
  text: string;
  className?: string;
}

/**
 * Renders text with a CSS glitch animation triggered on mount + hover.
 * Two pseudo-layers (data-text attribute clones via CSS) shift on hover.
 */
export function GlitchText({ text, className = '' }: GlitchTextProps) {
  const [glitching, setGlitching] = useState(false);

  return (
    <motion.span
      className={`glitch-text relative inline-block ${className}`}
      data-text={text}
      onHoverStart={() => setGlitching(true)}
      onHoverEnd={() => setGlitching(false)}
      animate={glitching ? { x: [0, -2, 2, -1, 0] } : {}}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {text}
      {glitching && (
        <>
          <span
            className="absolute inset-0 text-pink-500 opacity-80"
            style={{ clipPath: 'inset(30% 0 40% 0)', transform: 'translate(-3px, 0)' }}
            aria-hidden
          >
            {text}
          </span>
          <span
            className="absolute inset-0 text-cyan-400 opacity-80"
            style={{ clipPath: 'inset(60% 0 10% 0)', transform: 'translate(3px, 0)' }}
            aria-hidden
          >
            {text}
          </span>
        </>
      )}
    </motion.span>
  );
}
