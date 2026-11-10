import { useEffect, useMemo, useRef, useState } from "react";
import { pickIndexOf } from "../layout";
import { sounds } from "../sound";
import "./fishing.css";

const COLORS = ["#ff6b6b", "#feca57", "#ff9ff3", "#1dd1a1", "#ff9f43", "#c56cf0", "#7bed9f", "#ffffff"];
const WATER = 0.32; // waterline, as a fraction of the height

const rand = (a, b) => a + Math.random() * (b - a);
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

export default function Fishing({ members, draw, onSettled }) {
  const n = members.length;
  const stageRef = useRef(null);
  const fishEls = useRef([]);
  const lineRef = useRef(null);
  const hookRef = useRef(null);
  const boatRef = useRef(null);
  const world = useRef(null);
  const [result, setResult] = useState(null);
  const caught = draw && result?.id === draw.id ? result.index : null;

  const fontSize = useMemo(
    () => Math.max(13, Math.min(30, (window.innerHeight * 0.62) / (n * 0.95 + 4))),
    [n]
  );

  // the pond simulation runs for the whole lifetime of the stage
  useEffect(() => {
    const W = stageRef.current.clientWidth;
    const H = stageRef.current.clientHeight;
    const waterY = H * WATER;
    const boatW = Math.min(W, H) * 0.24;
    const minY = waterY + fontSize * 2.5;
    const maxY = H - fontSize * 2;
    const fish = members.map((_, i) => {
      const speed = rand(25, 70) * (Math.random() < 0.5 ? -1 : 1);
      const y = minY + ((i + rand(0.1, 0.9)) / n) * (maxY - minY);
      return { x: rand(0.08, 0.92) * W, y, baseY: y, vx: speed, speed: Math.abs(speed), dir: Math.sign(speed), phase: rand(0, 6), mode: "swim" };
    });
    const state = {
      W, H, waterY, boatW, minY, maxY, fish,
      boatX: W * 0.4,
      hook: { x: 0, y: 0 },
      script: null,
    };
    state.rodTip = () => ({ x: state.boatX + boatW * 0.62, y: waterY - boatW * 0.78 });
    state.hook = { ...state.rodTip(), y: waterY - boatW * 0.25 };
    world.current = state;

    let frame;
    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      const t = now / 1000;
      last = now;
      state.script?.(dt, now);

      fish.forEach((f, i) => {
        const el = fishEls.current[i];
        if (!el) return;
        f.half ??= el.offsetWidth / 2;
        const margin = f.half + 10;
        if (f.mode === "swim") {
          f.x += f.vx * dt;
          if (f.x < margin) f.vx = f.speed;
          if (f.x > W - margin) f.vx = -f.speed;
          f.dir = Math.sign(f.vx);
          f.y += (f.baseY + Math.sin(t * 0.9 + f.phase) * 10 - f.y) * Math.min(1, dt * 3);
        } else if (f.mode === "approach" || f.mode === "nibble") {
          const tx = state.hook.x - f.dir * f.half * 0.85 + (f.mode === "nibble" ? Math.sin(t * 40) * 4 : 0);
          const ty = state.hook.y + 4;
          const dx = tx - f.x;
          const dy = ty - f.y;
          const dist = Math.hypot(dx, dy);
          const stepLen = f.approachSpeed * dt;
          if (dist <= stepLen || f.mode === "nibble") {
            f.x = tx;
            f.y = ty;
            f.arrived = true;
          } else {
            f.x += (dx / dist) * stepLen;
            f.y += (dy / dist) * stepLen;
          }
        } else if (f.mode === "flee") {
          f.x += -f.dir * 320 * dt;
          f.fleeLeft -= dt;
          if (f.fleeLeft <= 0 || f.x < margin || f.x > W - margin) {
            f.x = Math.min(W - margin, Math.max(margin, f.x));
            f.vx = -f.dir * f.speed;
            f.dir = Math.sign(f.vx);
            f.baseY = f.y;
            f.mode = "swim";
          }
        } else if (f.mode === "hooked") {
          f.x = state.hook.x + Math.sin(t * 9) * 3;
          f.y = state.hook.y + f.half * 1.45;
        } else if (f.mode === "sink") {
          f.y += 420 * dt;
          if (f.y >= f.baseY) {
            f.y = f.baseY;
            f.mode = "swim";
          }
        }
        const hooked = f.mode === "hooked";
        const rotate = hooked ? -90 * f.dir + Math.sin(t * 9) * 12 : 0;
        el.style.transform = `translate(${f.x}px, ${f.y}px) translate(-50%, -50%) rotate(${rotate}deg) scale(${hooked ? 1.5 : 1})`;
        el.classList.toggle("hooked", hooked);
        el.classList.toggle("left", f.dir < 0);
      });

      const tip = state.rodTip();
      boatRef.current.style.transform = `translateX(${state.boatX}px)`;
      lineRef.current.setAttribute("x1", tip.x);
      lineRef.current.setAttribute("y1", tip.y);
      lineRef.current.setAttribute("x2", state.hook.x);
      lineRef.current.setAttribute("y2", state.hook.y);
      hookRef.current.setAttribute("transform", `translate(${state.hook.x} ${state.hook.y})`);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!draw) return;
    const state = world.current;
    const { fish, W, waterY } = state;
    const target = pickIndexOf(members, draw.name);
    const depth = rand(state.minY + 20, state.minY + (state.maxY - state.minY) * 0.7);
    const destBoat = Math.min(W - state.boatW * 1.1, Math.max(state.boatW * 0.1, rand(0.15, 0.6) * W));
    // decoys: the fish nearest to where the hook will be, they nibble and swim off
    const hookX = destBoat + state.boatW * 0.62;
    const decoys = fish
      .map((f, i) => ({ i, d: Math.hypot(f.x - hookX, f.baseY - depth) }))
      .filter(({ i }) => i !== target)
      .sort((a, b) => a.d - b.d)
      .slice(0, Math.min(2, n - 1))
      .map(({ i }) => i);

    // release the previously caught fish
    fish.forEach((f) => {
      if (f.mode === "hooked") {
        f.mode = "sink";
        f.baseY = rand(state.minY, state.maxY);
      }
    });

    const timeline = [];
    const tween = (ms, fn) => timeline.push({ ms, fn });
    const once = (fn) => timeline.push({ ms: 0, fn });
    const until = (check) => timeline.push({ until: check });

    const startBoat = state.boatX;
    const startHookY = state.hook.y;
    tween(900, (u) => {
      state.boatX = startBoat + (destBoat - startBoat) * ease(u);
      state.hook.x = state.rodTip().x;
      state.hook.y = startHookY + (waterY - state.boatW * 0.25 - startHookY) * ease(u);
    });
    let splashed = false;
    tween(1100, (u) => {
      state.hook.y = waterY - state.boatW * 0.25 + (depth - waterY + state.boatW * 0.25) * ease(u);
      if (!splashed && state.hook.y > waterY) {
        splashed = true;
        sounds.splash();
      }
    });
    const approach = (i) => {
      once(() => {
        const f = fish[i];
        f.dir = f.x < state.hook.x ? 1 : -1;
        f.approachSpeed = Math.max(170, Math.hypot(f.x - state.hook.x, f.y - state.hook.y) / 1.1);
        f.arrived = false;
        f.mode = "approach";
      });
      until(() => fish[i].arrived);
      once(() => {
        fish[i].mode = "nibble";
        sounds.blip();
      });
    };
    decoys.forEach((i) => {
      approach(i);
      tween(650, (u) => (state.hook.x = state.rodTip().x + Math.sin(u * 30) * 3));
      once(() => {
        fish[i].mode = "flee";
        fish[i].fleeLeft = 0.8;
      });
      tween(250, () => {});
    });
    approach(target);
    tween(450, (u) => (state.hook.x = state.rodTip().x + Math.sin(u * 40) * 5));
    once(() => {
      fish[target].mode = "hooked";
      sounds.clunk();
    });
    let splashedOut = false;
    tween(1100, (u) => {
      state.hook.x = state.rodTip().x;
      state.hook.y = depth + (state.H * 0.04 - depth) * ease(u);
      if (!splashedOut && state.hook.y + fish[target].half * 2 < waterY) {
        splashedOut = true;
        sounds.splash();
      }
    });
    once(() => {
      setResult({ id: draw.id, index: target });
      sounds.fanfare();
      onSettled(draw.id);
    });

    let stepIndex = 0;
    let stepStart = null;
    state.script = (dt, now) => {
      while (stepIndex < timeline.length) {
        const step = timeline[stepIndex];
        stepStart ??= now;
        if (step.until) {
          if (!step.until()) return;
        } else if (step.ms === 0) {
          step.fn();
        } else {
          const u = Math.min(1, (now - stepStart) / step.ms);
          step.fn(u);
          if (u < 1) return;
        }
        stepIndex++;
        stepStart = null;
      }
      state.script = null;
    };
    return () => {
      state.script = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draw?.id]);

  return (
    <div className="fish-stage" ref={stageRef} style={{ "--water": WATER * 100 + "%" }}>
      <div className="fish-sun" />
      <div className="fish-cloud c1" />
      <div className="fish-cloud c2" />
      <div className="fish-water" />
      <div className="fish-weeds">
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} style={{ left: `${4 + i * 11.5}%`, animationDelay: `${-i * 0.7}s`, height: `${10 + (i % 3) * 5}vh` }} />
        ))}
      </div>
      {members.map((name, i) => (
        <div
          key={i}
          ref={(el) => (fishEls.current[i] = el)}
          className={`fish ${caught === i ? "caught" : ""}`}
          style={{ "--color": COLORS[i % COLORS.length], fontSize }}
        >
          <div className="fish-shape" />
          <span className="fish-name">{name}</span>
        </div>
      ))}
      <div className="fish-surface" />
      <div ref={boatRef} className="fish-boat">
        <svg viewBox="0 0 100 80" className="fish-boat-svg">
          <line x1="58" y1="38" x2="62" y2="2" className="fish-rod" />
          <circle cx="44" cy="22" r="8" fill="#ffd6a5" />
          <path d="M33 20 Q44 4 55 20 Z" fill="#e63946" />
          <rect x="37" y="29" width="15" height="20" rx="4" fill="#ffb703" />
          <path d="M0 48 L100 48 L86 72 L12 72 Z" fill="#8d5524" />
          <path d="M0 48 L100 48 L97 54 L3 54 Z" fill="#c68642" />
        </svg>
      </div>
      <svg className="fish-line-layer">
        <line ref={lineRef} className="fish-line" />
        <g ref={hookRef}>
          <path d="M0 -6 L0 10 Q0 18 -7 16 Q-12 13 -9 7" className="fish-hook" />
        </g>
      </svg>
      {caught !== null && draw && (
        <div className="fish-banner" style={{ fontSize: `min(12vmin, ${140 / draw.name.length}vw)` }}>
          {draw.name}
        </div>
      )}
    </div>
  );
}
