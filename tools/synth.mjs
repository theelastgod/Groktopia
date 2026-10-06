import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RATE = 22050;
const OUT = join(dirname(fileURLToPath(import.meta.url)), "../public/audio");

function wav(samples) {
  const n = samples.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + n * 2, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(RATE, 24);
  buf.writeUInt32LE(RATE * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE((s * 32767) | 0, 44 + i * 2);
  }
  return buf;
}

function silence(seconds) {
  return new Float32Array(Math.floor(seconds * RATE));
}

function fade(samples, ms = 24) {
  const n = Math.min(samples.length >> 1, Math.floor((RATE * ms) / 1000));
  for (let i = 0; i < n; i++) {
    const g = i / n;
    samples[i] *= g;
    samples[samples.length - 1 - i] *= g;
  }
}

function normalize(samples, peak = 0.89) {
  let m = 0;
  for (let i = 0; i < samples.length; i++) m = Math.max(m, Math.abs(samples[i]));
  if (m > peak) {
    const g = peak / m;
    for (let i = 0; i < samples.length; i++) samples[i] *= g;
  }
}

function midi(note) {
  return 440 * 2 ** ((note - 69) / 12);
}

function addVoice(samples, start, dur, note, vol, shape) {
  const f = midi(note);
  const n = Math.floor(dur * RATE);
  const s0 = Math.floor(start * RATE);
  for (let i = 0; i < n && s0 + i < samples.length; i++) {
    const t = i / RATE;
    const a = 0.015;
    const d = 0.09;
    const sus = 0.62;
    const rel = Math.min(0.14, dur * 0.35);
    let e = 0;
    if (t < a) e = t / a;
    else if (t < a + d) e = 1 - ((t - a) / d) * (1 - sus);
    else if (t < dur - rel) e = sus;
    else if (t < dur) e = sus * (1 - (t - (dur - rel)) / rel);
    const phase = 2 * Math.PI * f * t;
    let s = Math.sin(phase);
    if (shape === "tri") s = (2 / Math.PI) * Math.asin(Math.sin(phase));
    if (shape === "soft") s = Math.sin(phase) * 0.7 + Math.sin(phase * 2) * 0.2 + Math.sin(phase * 3) * 0.08;
    if (shape === "sq") s = Math.sin(phase) >= 0 ? 0.65 : -0.65;
    samples[s0 + i] += s * e * vol;
  }
}

function addNoise(samples, start, dur, vol, color) {
  const n = Math.floor(dur * RATE);
  const s0 = Math.floor(start * RATE);
  let held = 0;
  for (let i = 0; i < n && s0 + i < samples.length; i++) {
    const t = i / RATE;
    const e = Math.sin(Math.PI * Math.min(1, t / dur)) * (1 - t / dur);
    if (color === "tick" || i % 4 === 0) held = Math.random() * 2 - 1;
    samples[s0 + i] += held * e * vol;
  }
}

function save(name, samples) {
  fade(samples);
  normalize(samples);
  writeFileSync(join(OUT, name), wav(samples));
}

function throne() {
  const bar = 2;
  const bars = 8;
  const song = silence(bar * bars);
  const roots = [38, 41, 36, 43];
  const highs = [
    [62, 65, 69, 67],
    [65, 69, 72, 69],
    [60, 64, 67, 65],
    [62, 67, 69, 65],
  ];
  for (let b = 0; b < bars; b++) {
    const t0 = b * bar;
    const root = roots[b % roots.length];
    addVoice(song, t0, bar * 0.98, root, 0.22, "sine");
    addVoice(song, t0, bar * 0.98, root + 12, 0.07, "tri");
    addVoice(song, t0, bar * 0.92, root + 24 + (b % 4 === 2 ? 7 : 3), 0.05, "soft");
    addVoice(song, t0, bar * 0.92, root + 31, 0.04, "soft");
    const line = highs[b % highs.length];
    line.forEach((note, i) => addVoice(song, t0 + i * (bar / 4), bar / 4 * 0.92, note, 0.16, "soft"));
    addNoise(song, t0, 0.05, 0.04, "tick");
    addNoise(song, t0 + bar / 2, 0.04, 0.025, "tick");
  }
  save("throne.wav", song);
}

function battle() {
  const bar = 1.15;
  const bars = 12;
  const song = silence(bar * bars);
  const kickNotes = [36, 36, 36, 38];
  for (let b = 0; b < bars; b++) {
    const t0 = b * bar;
    addVoice(song, t0, 0.18, kickNotes[b % 4], 0.34, "sine");
    addVoice(song, t0 + bar / 2, 0.12, 43, 0.16, "sq");
    addNoise(song, t0 + bar / 2, 0.08, 0.12, "tick");
    addVoice(song, t0, bar * 0.95, b % 2 === 0 ? 50 : 53, 0.08, "tri");
    if (b % 3 === 0) addVoice(song, t0 + bar * 0.25, 0.4, 70, 0.07, "soft");
  }
  save("battle.wav", song);
}

function click() {
  const s = silence(0.12);
  addNoise(s, 0, 0.04, 0.25, "tick");
  addVoice(s, 0, 0.08, 90, 0.12, "sq");
  save("click.wav", s);
}

function build() {
  const s = silence(0.45);
  addVoice(s, 0.02, 0.12, 48, 0.3, "sine");
  addNoise(s, 0.02, 0.08, 0.18, "tick");
  addVoice(s, 0.18, 0.14, 43, 0.28, "sine");
  addNoise(s, 0.18, 0.09, 0.16, "tick");
  save("build.wav", s);
}

function march() {
  const s = silence(0.7);
  for (let i = 0; i < 6; i++) {
    addNoise(s, i * 0.1, 0.06, 0.16, "tick");
    addVoice(s, i * 0.1, 0.07, 55 + (i % 2) * 2, 0.08, "sq");
  }
  save("march.wav", s);
}

function spell() {
  const s = silence(0.8);
  for (let i = 0; i < 8; i++) addVoice(s, i * 0.06, 0.28, 72 + i * 2, 0.1, "sine");
  addVoice(s, 0.15, 0.55, 84, 0.08, "tri");
  save("spell.wav", s);
}

function coin() {
  const s = silence(0.42);
  addVoice(s, 0, 0.18, 88, 0.2, "sine");
  addVoice(s, 0.09, 0.22, 96, 0.18, "sine");
  save("coin.wav", s);
}

function win() {
  const s = silence(0.9);
  [62, 67, 74].forEach((n, i) => addVoice(s, i * 0.14, 0.4, n, 0.18, "soft"));
  save("win.wav", s);
}

function lose() {
  const s = silence(0.8);
  [67, 62, 57].forEach((n, i) => addVoice(s, i * 0.16, 0.36, n, 0.16, "tri"));
  save("lose.wav", s);
}

function hour() {
  const s = silence(1.1);
  addVoice(s, 0, 0.9, 74, 0.16, "sine");
  addVoice(s, 0.02, 0.7, 86, 0.06, "sine");
  save("hour.wav", s);
}

throne();
battle();
click();
build();
march();
spell();
coin();
win();
lose();
hour();
console.log("wrote audio to", OUT);
