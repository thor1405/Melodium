import React, { useEffect, useRef } from 'react';

export const AudioWaveform = ({ barCount = 48, className = '' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = canvas.offsetWidth * window.devicePixelRatio);
    let height = (canvas.height = canvas.offsetHeight * window.devicePixelRatio);

    const bars = Array.from({ length: barCount }, (_, i) => ({
      height: Math.random() * 0.8 + 0.1,
      speed: 0.02 + Math.random() * 0.04,
      offset: Math.random() * Math.PI * 2,
    }));

    let time = 0;

    const render = () => {
      time += 0.03;
      ctx.clearRect(0, 0, width, height);

      const barWidth = (width / barCount) * 0.55;
      const gap = (width - barWidth * barCount) / (barCount - 1);

      bars.forEach((bar, index) => {
        // Harmonic wave calculation
        const dynamicHeight =
          Math.sin(time * bar.speed * 20 + bar.offset) * 0.35 +
          Math.sin(time * 0.8 + (index / barCount) * Math.PI * 4) * 0.25 +
          0.4;

        const actualHeight = Math.max(4, dynamicHeight * height * 0.85);
        const x = index * (barWidth + gap);
        const y = (height - actualHeight) / 2;

        // Luminous Canary Yellow #ece75f, Warm Gold, and Acoustic Slate Grey Gradients
        const gradient = ctx.createLinearGradient(0, y, 0, y + actualHeight);
        if (index % 4 === 0) {
          gradient.addColorStop(0, '#fdfde8'); // Brightest cream-yellow highlight
          gradient.addColorStop(1, '#ece75f'); // Target user canary yellow (#ece75f)
        } else if (index % 4 === 1) {
          gradient.addColorStop(0, '#ece75f'); // Target user yellow (#ece75f)
          gradient.addColorStop(1, '#ded946'); // Warm companion gold
        } else if (index % 4 === 2) {
          gradient.addColorStop(0, '#f1ed7a'); // Luminous canary
          gradient.addColorStop(1, '#bfb932'); // Muted brass yellow
        } else {
          gradient.addColorStop(0, '#94A3B8'); // Acoustic slate grey
          gradient.addColorStop(1, '#1E2430'); // Dark acoustic charcoal
        }

        ctx.fillStyle = gradient;
        ctx.shadowBlur = index % 4 !== 3 ? 14 : 3;
        ctx.shadowColor = index % 4 === 3 ? 'rgba(148, 163, 184, 0.25)' : 'rgba(236, 231, 95, 0.6)';

        // Rounded pill bars
        const radius = barWidth / 2;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, actualHeight, radius);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      height = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [barCount]);

  return (
    <div className={`relative w-full h-16 overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
