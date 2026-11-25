import React, { useRef, useEffect } from 'react';

export default function NeuralCoreCanvas({ activeIncident }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    const width = 300;
    const height = 300;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const radius = 95;
    const count = 220; // optimal for smooth 60fps with synaptic neighbor links
    const particles = [];

    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const rAtY = Math.sqrt(1 - y * y);
      const phi = i * 0.61803398875 * Math.PI * 2;
      const x = Math.cos(phi) * rAtY;
      const z = Math.sin(phi) * rAtY;
      const dist = radius * (0.7 + Math.random() * 0.3);

      particles.push({
        x: x * dist,
        y: y * dist,
        z: z * dist,
        baseSize: 1.2 + Math.random() * 1.5,
        isDisturbed: i >= 35 && i <= 70
      });
    }

    let angleX = 0;
    let angleY = 0;
    let rippleRadius = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const isAnomaly = Boolean(activeIncident);
      const rotSpeed = isAnomaly ? -0.012 : 0.007; // Reverse direction on anomaly
      angleY += rotSpeed;
      angleX += isAnomaly ? 0.005 : 0.003;

      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);

      // Project particles to 2D
      const projected = particles.map((p) => {
        let x1 = p.x * cosY - p.z * sinY;
        let z1 = p.z * cosY + p.x * sinY;
        let y1 = p.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + p.y * sinX;

        const focal = 300;
        const scale = focal / (focal + z2);
        const px = width / 2 + x1 * scale;
        const py = height / 2 + y1 * scale;
        const alpha = Math.max(0.1, Math.min(0.95, (z2 + radius) / (2 * radius)));

        return { px, py, scale, z: z2, alpha, isDisturbed: p.isDisturbed, size: p.baseSize };
      });

      // Expand anomaly shockwave ripple if active
      if (isAnomaly) {
        rippleRadius += 1.8;
        if (rippleRadius > radius + 30) rippleRadius = 0;
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, rippleRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 66, 100, ${Math.max(0, 0.7 - rippleRadius / (radius + 30))})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw faint synaptic interconnected lines between close particles in front
      ctx.lineWidth = 0.6;
      for (let i = 0; i < projected.length; i += 3) {
        for (let j = i + 1; j < Math.min(i + 12, projected.length); j++) {
          const p1 = projected[i];
          const p2 = projected[j];
          if (p1.z > -20 && p2.z > -20) {
            const dx = p1.px - p2.px;
            const dy = p1.py - p2.py;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 42) {
              ctx.beginPath();
              ctx.moveTo(p1.px, p1.py);
              ctx.lineTo(p2.px, p2.py);
              ctx.strokeStyle = isAnomaly && (p1.isDisturbed || p2.isDisturbed)
                ? 'rgba(255, 66, 100, 0.25)'
                : 'rgba(56, 232, 255, 0.12)';
              ctx.stroke();
            }
          }
        }
      }

      // Render glowing central nucleus
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, isAnomaly ? 8 : 6, 0, Math.PI * 2);
      ctx.fillStyle = isAnomaly ? '#FF4264' : '#C7FF3D';
      ctx.shadowColor = isAnomaly ? '#FF4264' : '#C7FF3D';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Render neural nodes
      projected.sort((a, b) => a.z - b.z);
      projected.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.px, p.py, Math.max(0.7, p.size * p.scale), 0, Math.PI * 2);

        if (isAnomaly && p.isDisturbed) {
          ctx.fillStyle = `rgba(255, 66, 100, ${Math.min(1, p.alpha * 1.5)})`;
          ctx.shadowColor = '#FF4264';
          ctx.shadowBlur = 6;
        } else if (isAnomaly && !p.isDisturbed) {
          ctx.fillStyle = `rgba(139, 92, 255, ${p.alpha * 0.5})`;
          ctx.shadowBlur = 0;
        } else {
          // Electric Lime & Neural Cyan
          const color = p.px > width / 2 ? '199, 255, 61' : '56, 232, 255';
          ctx.fillStyle = `rgba(${color}, ${p.alpha * 0.9})`;
          ctx.shadowColor = p.px > width / 2 ? '#C7FF3D' : '#38E8FF';
          ctx.shadowBlur = 3;
        }

        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [activeIncident]);

  return (
    <div className="core-canvas-container">
      <canvas ref={canvasRef} className="core-canvas" />
    </div>
  );
}
