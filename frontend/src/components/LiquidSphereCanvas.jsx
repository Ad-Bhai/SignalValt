import React, { useRef, useEffect } from 'react';

export default function LiquidSphereCanvas({ activeIncident }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const width = 320;
    const height = 320;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Generate 550 spherical surface and internal floating particles
    const particleCount = 550;
    const particles = [];
    const sphereRadius = 105;

    for (let i = 0; i < particleCount; i++) {
      // Golden spiral distribution on sphere
      const y = 1 - (i / (particleCount - 1)) * 2; // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y);
      const phi = i * 0.61803398875 * Math.PI * 2; // golden ratio angle

      const x = Math.cos(phi) * radiusAtY;
      const z = Math.sin(phi) * radiusAtY;

      // slight depth randomness
      const r = sphereRadius * (0.65 + Math.random() * 0.35);

      particles.push({
        x: x * r,
        y: y * r,
        z: z * r,
        baseRadius: 1.2 + Math.random() * 1.5,
        isAnomalyCluster: i >= 40 && i <= 85 // dedicated cluster for anomaly visualization
      });
    }

    let angleX = 0;
    let angleY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = (e.clientX - rect.left - width / 2) * 0.0003;
      mouseY = (e.clientY - rect.top - height / 2) * 0.0003;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Sphere rotation velocity
      angleY += 0.005 + mouseX;
      angleX += 0.002 + mouseY;

      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);

      // Sort particles by Z depth for realistic transparency
      const projected = particles.map((p) => {
        // Rotate around Y
        let x1 = p.x * cosY - p.z * sinY;
        let z1 = p.z * cosY + p.x * sinY;

        // Rotate around X
        let y1 = p.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + p.y * sinX;

        // Perspective projection
        const focalLength = 320;
        const scale = focalLength / (focalLength + z2);
        const projX = width / 2 + x1 * scale;
        const projY = height / 2 + y1 * scale;
        const alpha = Math.max(0.12, Math.min(0.95, (z2 + sphereRadius) / (2 * sphereRadius)));

        return {
          projX,
          projY,
          scale,
          z: z2,
          alpha,
          isAnomalyCluster: p.isAnomalyCluster,
          baseRadius: p.baseRadius
        };
      });

      projected.sort((a, b) => a.z - b.z);

      // Render outer transparent glass sphere rim
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, sphereRadius + 4, 0, Math.PI * 2);
      ctx.strokeStyle = activeIncident ? 'rgba(228, 88, 88, 0.2)' : 'rgba(139, 124, 255, 0.15)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Render each particle
      projected.forEach((p) => {
        const isIncident = Boolean(activeIncident);

        ctx.beginPath();
        const r = p.baseRadius * p.scale;
        ctx.arc(p.projX, p.projY, Math.max(0.6, r), 0, Math.PI * 2);

        if (isIncident && p.isAnomalyCluster) {
          // Anomaly cluster disrupts into amber / critical red
          ctx.fillStyle = `rgba(228, 88, 88, ${Math.min(1, p.alpha * 1.5)})`;
          ctx.shadowColor = '#E45858';
          ctx.shadowBlur = 6;
        } else if (isIncident && !p.isAnomalyCluster) {
          // Other particles calm to softer lilac
          ctx.fillStyle = `rgba(139, 124, 255, ${p.alpha * 0.6})`;
          ctx.shadowBlur = 0;
        } else {
          // Normal nominal: Iridescent Cyan to Electric Violet
          const gradientRatio = (p.projX / width);
          const color = gradientRatio > 0.5 ? '139, 124, 255' : '101, 217, 232';
          ctx.fillStyle = `rgba(${color}, ${p.alpha * 0.85})`;
          ctx.shadowBlur = 0;
        }

        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [activeIncident]);

  return (
    <div className="sphere-canvas-wrap">
      <canvas ref={canvasRef} className="sphere-canvas" />
    </div>
  );
}
