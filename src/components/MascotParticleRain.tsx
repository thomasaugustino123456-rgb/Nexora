import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: "coin" | "star" | "leaf";
  size: number;
  rotation: number;
  rotationSpeed: number;
}

export function MascotParticleRain() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const handleTrigger = (e: Event) => {
      spawnParticles();
    };

    window.addEventListener("trigger-mascot-celebration", handleTrigger);
    return () => {
      window.removeEventListener("trigger-mascot-celebration", handleTrigger);
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, []);

  const spawnParticles = () => {
    const particles: Particle[] = [];
    const width = window.innerWidth;

    for (let i = 0; i < 40; i++) {
        const type = Math.random() > 0.6 ? "coin" : Math.random() > 0.5 ? "leaf" : "star";
        particles.push({
          x: Math.random() * width,
          y: -50 - Math.random() * 200,
          vx: (Math.random() - 0.5) * 4,
          vy: 3 + Math.random() * 5,
          type,
          size: 10 + Math.random() * 15,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.2,
        });
    }
    particlesRef.current = [...particlesRef.current, ...particles];
    if (!animationFrameIdRef.current) {
        animationFrameIdRef.current = requestAnimationFrame(renderLoop);
    }
  };

  const renderLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const p = particlesRef.current[i];
      p.y += p.vy;
      p.x += p.vx;
      p.rotation += p.rotationSpeed;
      p.vy += 0.15; // Gravity

      if (p.y > canvas.height + 50) {
        particlesRef.current.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      if (p.type === "coin") {
        ctx.fillStyle = "#EAB308";
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === "leaf") {
        ctx.fillStyle = "#22C55E";
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else {
        ctx.fillStyle = "#60A5FA";
        ctx.beginPath();
        ctx.moveTo(0, -p.size / 2);
        ctx.lineTo(p.size / 4, 0);
        ctx.lineTo(0, p.size / 2);
        ctx.lineTo(-p.size / 4, 0);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    if (particlesRef.current.length > 0) {
      animationFrameIdRef.current = requestAnimationFrame(renderLoop);
    } else {
      animationFrameIdRef.current = null;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[500]"
    />
  );
}
