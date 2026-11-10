import { useEffect, useMemo, useRef, useState } from "react";
import { sounds } from "../sound";
import "./galton.css";

const W = 1000;
const SHUFFLE_MS = 900;

const shuffled = (items) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const useGeometry = (n) =>
  useMemo(() => {
    const H = Math.round(W / Math.max(0.6, window.innerWidth / window.innerHeight));
    const rows = n - 1;
    const s = Math.min((W * 0.92) / n, 90);
    const bucketH = Math.min(H * 0.34, 260);
    const bucketTop = H - bucketH - 8;
    const topY = H * 0.1;
    const firstRow = topY + H * 0.06;
    const v = rows > 1 ? (bucketTop - 30 - firstRow) / (rows - 1) : 0;
    const unit = Math.min(s, v || s);
    return {
      H, rows, s, v, bucketH, bucketTop, topY, firstRow,
      cx: W / 2,
      pegR: Math.max(2, unit * 0.12),
      ballR: Math.max(7, Math.min(Math.max(unit, s * 0.5) * 0.32, 18)),
      rowY: (r) => firstRow + r * v,
      bucketX: (b) => W / 2 + (b - (n - 1) / 2) * s,
    };
  }, [n]);

export default function Galton({ members, draw, onSettled }) {
  const n = members.length;
  const g = useGeometry(n);
  // order[b] = index into members of the name in bucket b
  const [order, setOrder] = useState(() => members.map((_, i) => i));
  const [trail, setTrail] = useState({ id: null, pegs: [] });
  const [landed, setLanded] = useState(null);
  const ballRef = useRef(null);

  const visited = draw && trail.id === draw.id ? trail.pegs : [];
  const winnerBucket = draw && landed?.id === draw.id ? landed.bucket : null;

  useEffect(() => {
    if (!draw) return;
    // a genuinely random path decides the bucket; the drawn name is moved there
    const rights = Array.from({ length: g.rows }, () => Math.random() < 0.5);
    const bucket = rights.filter(Boolean).length;
    const targets = members.flatMap((m, i) => (m === draw.name ? [i] : []));
    const target = targets[Math.floor(Math.random() * targets.length)];
    const others = shuffled(members.map((_, i) => i).filter((i) => i !== target));
    const newOrder = [...others.slice(0, bucket), target, ...others.slice(bucket)];

    // waypoints: where the ball touches each peg, then the bottom of the bucket
    const points = [{ x: g.cx, y: 0 }];
    let offset = 0;
    for (let r = 0; r < g.rows; r++) {
      points.push({ x: g.cx + offset * g.s, y: g.rowY(r) - g.pegR - g.ballR, peg: [r, Math.round(offset + r / 2)] });
      offset += rights[r] ? 0.5 : -0.5;
    }
    points.push({ x: g.bucketX(bucket), y: g.H - 10 - g.ballR, last: true });

    const segMs = Math.min(320, Math.max(130, 4200 / Math.max(g.rows, 1)));
    let frame;
    let segment = 0;
    let segStart = 0;
    const timers = [];
    const ball = ballRef.current;
    const place = (x, y) => {
      ball.setAttribute("cx", x);
      ball.setAttribute("cy", y);
    };

    timers.push(setTimeout(() => {
      setOrder(newOrder);
      place(g.cx, -50);
    }, 0));

    const step = (now) => {
      if (!segStart) segStart = now;
      const from = points[segment];
      const to = points[segment + 1];
      const duration = segment === 0 ? 450 : to.last ? 500 : segMs;
      const u = Math.min(1, (now - segStart) / duration);
      const hop = segment === 0 ? 0 : g.v * 0.35;
      const x = from.x + (to.x - from.x) * (to.last ? Math.min(1, u * 3) : u);
      const y = from.y + (to.y - from.y) * u * u - hop * 4 * u * (1 - u);
      place(x, y);
      if (u < 1) {
        frame = requestAnimationFrame(step);
        return;
      }
      segment++;
      segStart = now;
      if (to.peg) {
        sounds.plink(0.8 + Math.random() * 0.5);
        setTrail((t) => ({ id: draw.id, pegs: [...(t.id === draw.id ? t.pegs : []), to.peg.join("-")] }));
      }
      if (to.last) {
        sounds.clunk();
        setLanded({ id: draw.id, bucket });
        timers.push(setTimeout(() => {
          sounds.fanfare();
          onSettled(draw.id);
        }, 400));
        return;
      }
      frame = requestAnimationFrame(step);
    };
    timers.push(setTimeout(() => (frame = requestAnimationFrame(step)), SHUFFLE_MS));
    return () => {
      cancelAnimationFrame(frame);
      timers.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draw?.id]);

  const pegs = [];
  for (let r = 0; r < g.rows; r++) {
    for (let k = 0; k <= r; k++) {
      const key = `${r}-${k}`;
      pegs.push(
        <circle
          key={key}
          className={visited.includes(key) ? "galton-peg hit" : "galton-peg"}
          cx={g.cx + (k - r / 2) * g.s}
          cy={g.rowY(r)}
          r={g.pegR}
        />
      );
    }
  }

  const labelSize = (name) => Math.min(g.s * 0.62, (g.bucketH * 0.85) / (name.length * 0.42));
  const winnerName = winnerBucket !== null ? members[order[winnerBucket]] : null;

  return (
    <div className="galton-stage">
      <svg viewBox={`0 0 ${W} ${g.H}`} className="galton-svg" preserveAspectRatio="xMidYMid meet">
        <text x="70" y="44" className="galton-title">
          P(k) = C(n, k) / 2<tspan dy="-12" fontSize="20">n</tspan>
        </text>
        <path
          className="galton-funnel"
          d={`M ${g.cx - 60} 0 L ${g.cx - 14} ${g.topY} M ${g.cx + 60} 0 L ${g.cx + 14} ${g.topY}`}
        />
        {pegs}
        {Array.from({ length: n + 1 }, (_, b) => {
          const x = g.cx + (b - n / 2) * g.s;
          return <line key={b} className="galton-wall" x1={x} x2={x} y1={g.bucketTop} y2={g.H - 6} />;
        })}
        <line className="galton-wall" x1={g.cx - (n / 2) * g.s} x2={g.cx + (n / 2) * g.s} y1={g.H - 6} y2={g.H - 6} />
        {winnerBucket !== null && (
          <rect
            className="galton-glow"
            x={g.bucketX(winnerBucket) - g.s / 2}
            y={g.bucketTop}
            width={g.s}
            height={g.H - 6 - g.bucketTop}
          />
        )}
        {order.map((memberIndex, b) => {
          const name = members[memberIndex];
          return (
            <g
              key={memberIndex}
              className={b === winnerBucket ? "galton-label winner" : "galton-label"}
              style={{ transform: `translate(${g.bucketX(b)}px, ${g.H - 14}px)` }}
            >
              <text transform="rotate(-90)" fontSize={labelSize(name)} dominantBaseline="central">
                {name}
              </text>
            </g>
          );
        })}
        <circle ref={ballRef} className="galton-ball" cx={g.cx} cy={-50} r={g.ballR} />
      </svg>
      {winnerName && (
        <div className="galton-banner" style={{ fontSize: `min(13vmin, ${150 / winnerName.length}vw)` }}>
          {winnerName}
        </div>
      )}
    </div>
  );
}
