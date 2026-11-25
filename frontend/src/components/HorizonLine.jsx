import React, { useRef, useEffect } from 'react';

export default function HorizonLine({ activeIncident }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    let width = (canvas.width = canvas.offsetWidth * window.devicePixelRatio || 1200);
    let height = (canvas.height = 48 * window.devicePixelRatio);
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    let tracerX = 0;

    const render = () => {
      const w = canvas.offsetWidth || 1200;
      const h = 48;
      ctx.clearRect(0, 0, w, h);

      const isAnomaly = Boolean(activeIncident);

      // 1. Draw Baseline Razor Horizon
      ctx.beginPath();
      ctx.lineWidth = 1;

      if (!isAnomaly) {
        // Normal straight precision line with harmonic micro-drift
        ctx.strokeStyle = 'rgba(184, 154, 99, 0.4)';
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();

        // Traveling tracer point (every few seconds)
        tracerX = (tracerX + 1.8) % w;
        ctx.beginPath();
        ctx.arc(tracerX, h / 2, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#B89A63';
        ctx.fill();
      } else {
        // Subtle structural drop deviation:
        // ───────────────╮
        //                ╰──────
        //                      │
        //                      ●
        //                   ANOMALY
        const dropX = w * 0.58;
        const dropY = h / 2 + 10;

        ctx.strokeStyle = '#242629';
        ctx.moveTo(0, h / 2 - 4);
        ctx.lineTo(dropX - 80, h / 2 - 4);

        // First curve down
        ctx.bezierCurveTo(dropX - 40, h / 2 - 4, dropX - 50, dropY, dropX, dropY);
        ctx.lineTo(dropX + 70, dropY);
        ctx.lineTo(dropX + 70, dropY + 8);
        ctx.stroke();

        // Accent deviation segment in Burgundy
        ctx.beginPath();
        ctx.strokeStyle = '#8F2525';
        ctx.lineWidth = 1.2;
        ctx.moveTo(dropX - 40, h / 2 - 4);
        ctx.bezierCurveTo(dropX - 10, h / 2 - 4, dropX, dropY, dropX + 70, dropY);
        ctx.lineTo(dropX + 70, dropY + 8);
        ctx.stroke();

        // Deviation Node
        ctx.beginPath();
        ctx.arc(dropX + 70, dropY + 8, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#8F2525';
        ctx.fill();

        // Technical Label
        ctx.font = '500 9px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#8F2525';
        ctx.fillText('DEVIATION DETECTED', dropX + 82, dropY + 11);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = 48 * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [activeIncident]);

  return (
    <div className="horizon-container">
      <canvas ref={canvasRef} className="horizon-svg" />
      <span className="horizon-label">
        {activeIncident ? 'PULSE DEVIATION // ANOMALY DETECTED' : 'SIGNAL HORIZON // 100% NOMINAL'}
      </span>
    </div>
  );
}
