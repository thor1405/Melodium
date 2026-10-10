import React, { useEffect, useRef, useState } from 'react';
import { useInView, animate } from 'framer-motion';

export const AnimatedCounter = ({
  from = 0,
  to,
  duration = 1.6,
  prefix = '',
  suffix = '',
  className = '',
}) => {
  const nodeRef = useRef(null);
  const isInView = useInView(nodeRef, { once: true, margin: '-40px' });
  const [displayValue, setDisplayValue] = useState(from);

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(from, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (val) => {
        setDisplayValue(Math.floor(val));
      },
    });
    return () => controls.stop();
  }, [isInView, from, to, duration]);

  return (
    <span ref={nodeRef} className={className}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
};
