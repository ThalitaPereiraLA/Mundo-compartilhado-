import * as THREE from "three";

function smoothstep(edge0, edge1, x) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function clipFromSamples(name, samples) {
  const times = samples.map((sample) => sample.t);
  const position = new THREE.VectorKeyframeTrack(
    ".position",
    times,
    samples.flatMap((sample) => [sample.px, sample.py, sample.pz]),
  );
  const scale = new THREE.VectorKeyframeTrack(
    ".scale",
    times,
    samples.flatMap((sample) => [sample.sx, sample.sy, sample.sz]),
  );

  const quaternion = [];
  let previous = null;
  for (const sample of samples) {
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(sample.rx, sample.ry, sample.rz, "XYZ"));
    if (previous && previous.dot(q) < 0) {
      q.x *= -1;
      q.y *= -1;
      q.z *= -1;
      q.w *= -1;
    }
    previous = q;
    quaternion.push(q.x, q.y, q.z, q.w);
  }
  const rotation = new THREE.QuaternionKeyframeTrack(".quaternion", times, quaternion);

  return new THREE.AnimationClip(name, samples[samples.length - 1].t, [position, rotation, scale]);
}

function pose(t, values) {
  return {
    t,
    px: 0,
    py: 0,
    pz: 0,
    rx: 0,
    ry: 0,
    rz: 0,
    sx: 1,
    sy: 1,
    sz: 1,
    ...values,
  };
}

function sampleKeys(keys, steps) {
  const duration = keys[keys.length - 1].t;
  const samples = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = (duration * i) / steps;
    let from = keys[0];
    let to = keys[keys.length - 1];
    for (let k = 0; k < keys.length - 1; k += 1) {
      if (t >= keys[k].t && t <= keys[k + 1].t) {
        from = keys[k];
        to = keys[k + 1];
        break;
      }
    }
    const span = to.t - from.t || 1;
    const eased = smoothstep(0, 1, (t - from.t) / span);
    samples.push(
      pose(t, {
        px: lerp(from.px, to.px, eased),
        py: lerp(from.py, to.py, eased),
        pz: lerp(from.pz, to.pz, eased),
        rx: lerp(from.rx, to.rx, eased),
        ry: lerp(from.ry, to.ry, eased),
        rz: lerp(from.rz, to.rz, eased),
      }),
    );
  }
  return samples;
}

function idle() {
  const duration = 3.4;
  const steps = 40;
  const samples = [];
  for (let i = 0; i <= steps; i += 1) {
    const u = i / steps;
    const wave = Math.sin(u * Math.PI * 2);
    samples.push(
      pose(duration * u, {
        rz: 0.07 * wave,
        rx: 0.035 * Math.sin(u * Math.PI * 2 + 0.6),
        py: 0.02 * (0.5 - 0.5 * Math.cos(u * Math.PI * 2)),
      }),
    );
  }
  samples[samples.length - 1] = pose(duration, {});
  return clipFromSamples("Idle", samples);
}

function backflip() {
  const duration = 1.9;
  const steps = 56;
  const half = 0.5;
  const hop = 0.9;
  const samples = [];

  for (let i = 0; i <= steps; i += 1) {
    const u = i / steps;
    const spin = Math.min(1, Math.max(0, (u - 0.16) / 0.62));
    const alpha = spin * Math.PI * 2;
    const theta = -alpha;
    const flight = Math.sin(spin * Math.PI);
    const crouch = smoothstep(0, 0.12, u) * (1 - smoothstep(0.12, 0.24, u));
    const land = smoothstep(0.8, 0.88, u) * (1 - smoothstep(0.88, 1, u));

    const centerY = half * Math.cos(theta);
    const centerZ = half * Math.sin(theta);
    samples.push(
      pose(duration * u, {
        py: half + hop * flight - centerY,
        pz: -0.2 * flight - centerZ,
        rx: theta,
        sx: 1 + 0.14 * crouch + 0.1 * land,
        sy: 1 - 0.24 * crouch - 0.16 * land,
        sz: 1 + 0.14 * crouch + 0.1 * land,
      }),
    );
  }

  samples[samples.length - 1] = pose(duration, {});
  return clipFromSamples("Backflip", samples);
}

function morto() {
  const lying = { rx: -Math.PI / 2, rz: 0.18, py: 0.28 };
  const twitch = { rx: -Math.PI / 2 + 0.22, rz: 0.28, py: 0.32 };
  return clipFromSamples(
    "Morto",
    sampleKeys(
      [
        pose(0, {}),
        pose(0.28, { rx: -0.45, py: 0.08, rz: 0.06 }),
        pose(0.55, lying),
        pose(1.7, lying),
        pose(1.86, twitch),
        pose(2.1, lying),
        pose(2.6, lying),
      ],
      64,
    ),
  );
}

function andar() {
  const duration = 3.2;
  const steps = 48;
  const samples = [];
  for (let i = 0; i <= steps; i += 1) {
    const u = i / steps;
    const across = Math.sin(u * Math.PI * 2);
    const step = Math.sin(u * Math.PI * 8);
    samples.push(
      pose(duration * u, {
        px: 0.9 * across,
        pz: 0.15 * Math.sin(u * Math.PI * 4),
        py: 0.035 * Math.abs(step),
        rz: 0.32 * step,
        rx: 0.14 * Math.cos(u * Math.PI * 8),
      }),
    );
  }
  samples[samples.length - 1] = pose(duration, {});
  return clipFromSamples("Andar", samples);
}

export function createCatClips() {
  return [idle(), backflip(), morto(), andar()];
}
