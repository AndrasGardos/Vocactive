// Tiny synthesized sound effects (Web Audio), so no audio files are needed.
const STORAGE_KEY = "soundEnabled";

let ctx = null;
let enabled = localStorage.getItem(STORAGE_KEY) !== "false";

export const isSoundEnabled = () => enabled;

export const setSoundEnabled = (value) => {
  enabled = value;
  localStorage.setItem(STORAGE_KEY, String(value));
};

const audio = () => {
  if (!enabled) return null;
  try {
    ctx ??= new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  } catch {
    return null;
  }
};

const tone = ({ freq, endFreq = freq, duration, type = "sine", gain = 0.2, delay = 0 }) => {
  const ac = audio();
  if (!ac) return;
  const start = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  osc.frequency.exponentialRampToValueAtTime(endFreq, start + duration);
  amp.gain.setValueAtTime(gain, start);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(amp).connect(ac.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
};

const noise = ({ duration, gain = 0.2, filterFreq = 2000, delay = 0 }) => {
  const ac = audio();
  if (!ac) return;
  const start = ac.currentTime + delay;
  const buffer = ac.createBuffer(1, Math.ceil(ac.sampleRate * duration), ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 2;
  }
  const src = ac.createBufferSource();
  src.buffer = buffer;
  const filter = ac.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = filterFreq;
  const amp = ac.createGain();
  amp.gain.value = gain;
  src.connect(filter).connect(amp).connect(ac.destination);
  src.start(start);
};

export const sounds = {
  tick: () => tone({ freq: 1800, endFreq: 900, duration: 0.03, type: "square", gain: 0.05 }),
  blip: () => tone({ freq: 660, endFreq: 880, duration: 0.08, type: "triangle", gain: 0.12 }),
  flap: () => noise({ duration: 0.025, gain: 0.25, filterFreq: 3500 }),
  pop: () => {
    noise({ duration: 0.08, gain: 0.5, filterFreq: 1200 });
    tone({ freq: 500, endFreq: 120, duration: 0.08, gain: 0.15 });
  },
  clunk: () => tone({ freq: 160, endFreq: 60, duration: 0.15, type: "triangle", gain: 0.3 }),
  plink: (pitch = 1) =>
    tone({ freq: 1200 * pitch, endFreq: 700 * pitch, duration: 0.07, type: "triangle", gain: 0.1 }),
  splash: () => {
    noise({ duration: 0.35, gain: 0.5, filterFreq: 900 });
    noise({ duration: 0.2, gain: 0.25, filterFreq: 3000, delay: 0.05 });
  },
  fanfare: () =>
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) =>
      tone({ freq, duration: i === 3 ? 0.6 : 0.16, type: "triangle", gain: 0.15, delay: i * 0.11 })
    ),
};
