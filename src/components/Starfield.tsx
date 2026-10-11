import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;
  r: number;
  tw: number;
  hue: number;
}
interface Mote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  r: number;
}
interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

/** 全屏星空背景：闪烁星辰 + 漂浮金尘 + 偶发流星 + 鼠标视差 */
export default function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let stars: Star[] = [];
    const motes: Mote[] = [];
    const meteors: Meteor[] = [];
    let mx = 0;
    let my = 0;
    let tx = 0;
    let ty = 0;
    let raf = 0;
    let last = performance.now();

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.floor((w * h) / 5200);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() * 0.9 + 0.1,
        r: Math.random() * 1.3 + 0.2,
        tw: Math.random() * Math.PI * 2,
        hue: Math.random() < 0.2 ? 40 : Math.random() < 0.3 ? 230 : 50,
      }));
    };

    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / w - 0.5) * 2;
      ty = (e.clientY / h - 0.5) * 2;
    };

    const frame = (now: number) => {
      const dt = Math.min(50, now - last) / 16.7;
      last = now;
      mx += (tx - mx) * 0.04;
      my += (ty - my) * 0.04;
      ctx.clearRect(0, 0, w, h);

      for (const s of stars) {
        s.tw += 0.02 * dt * (0.5 + s.z);
        const a = 0.35 + Math.sin(s.tw) * 0.35 * s.z + 0.25 * s.z;
        const px = s.x - mx * 14 * s.z;
        const py = s.y - my * 14 * s.z;
        ctx.beginPath();
        ctx.fillStyle = `hsla(${s.hue}, 70%, ${s.hue === 230 ? 82 : 88}%, ${Math.max(0, a)})`;
        ctx.arc(px, py, s.r * (0.6 + s.z * 0.6), 0, Math.PI * 2);
        ctx.fill();
        if (s.r > 1.25 && a > 0.75) {
          ctx.strokeStyle = `hsla(${s.hue}, 80%, 85%, ${(a - 0.75) * 1.4})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(px - 5, py);
          ctx.lineTo(px + 5, py);
          ctx.moveTo(px, py - 5);
          ctx.lineTo(px, py + 5);
          ctx.stroke();
        }
      }

      if (!reduce) {
        if (motes.length < 46 && Math.random() < 0.25) {
          motes.push({
            x: Math.random() * w,
            y: h + 10,
            vx: (Math.random() - 0.5) * 0.25,
            vy: -(Math.random() * 0.45 + 0.15),
            life: 1,
            r: Math.random() * 1.8 + 0.6,
          });
        }
        for (let i = motes.length - 1; i >= 0; i--) {
          const m = motes[i];
          m.x += (m.vx + Math.sin(now / 1400 + i) * 0.12) * dt;
          m.y += m.vy * dt;
          m.life -= 0.0018 * dt;
          if (m.life <= 0 || m.y < -10) {
            motes.splice(i, 1);
            continue;
          }
          const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 4);
          g.addColorStop(0, `rgba(255, 214, 140, ${0.55 * m.life})`);
          g.addColorStop(1, 'rgba(255, 214, 140, 0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(m.x, m.y, m.r * 4, 0, Math.PI * 2);
          ctx.fill();
        }

        if (Math.random() < 0.0035 * dt && meteors.length < 2) {
          meteors.push({ x: Math.random() * w * 0.8 + w * 0.2, y: Math.random() * h * 0.3, vx: -7 - Math.random() * 4, vy: 3 + Math.random() * 2, life: 1 });
        }
        for (let i = meteors.length - 1; i >= 0; i--) {
          const m = meteors[i];
          m.x += m.vx * dt;
          m.y += m.vy * dt;
          m.life -= 0.014 * dt;
          if (m.life <= 0) {
            meteors.splice(i, 1);
            continue;
          }
          const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 14, m.y - m.vy * 14);
          grad.addColorStop(0, `rgba(255, 240, 210, ${m.life})`);
          grad.addColorStop(1, 'rgba(255, 240, 210, 0)');
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(m.x - m.vx * 14, m.y - m.vy * 14);
          ctx.stroke();
        }
      }
      raf = requestAnimationFrame(frame);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onMove);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return <canvas ref={ref} className="starfield" aria-hidden />;
}
