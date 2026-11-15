import * as THREE from "three";

const joints = {
  spine: "c_spine_02_skn_",
  chest: "c_chest_00_skn_",
  head: "c_head_00_skn_",
  jaw: "c_jaw_skn_",
  leftArm: "l_upArm_00_skn_",
  rightArm: "r_upArm_00_skn_",
  leftElbow: "l_lowArm_00_skn_",
  rightElbow: "r_lowArm_00_skn_",
  leftWrist: "l_wrist_00_skn_",
  rightWrist: "r_wrist_00_skn_",
  leftSmile: "l_mouthCorner_skn_",
  rightSmile: "r_mouthCorner_skn_",
  tail: "c_tail_00_skn_",
};

function smoothstep(start, end, t) {
  const value = THREE.MathUtils.clamp((t - start) / (end - start), 0, 1);
  return value * value * (3 - 2 * value);
}

function gesture(t, start, peak, release, end) {
  return smoothstep(start, peak, t) * (1 - smoothstep(release, end, t));
}

function relaxedPose() {
  return {
    spine: [0, 0, 0], chest: [0, 0, 0], head: [0, 0, 0], jaw: [0, 0, 0],
    leftArm: [0, 0, -1.05], rightArm: [0, 0, -1.05],
    leftElbow: [0, -0.12, 0], rightElbow: [0, -0.12, 0],
    leftWrist: [0, 0, 0], rightWrist: [0, 0, 0],
    leftSmile: [0, 0, 0], rightSmile: [0, 0, 0], tail: [0, 0, 0],
  };
}

function idle(t) {
  const pose = relaxedPose();
  const breath = Math.sin(t * Math.PI * 2);
  pose.chest = [breath * 0.012, 0, 0];
  pose.head = [0, 0.025 * breath, 0];
  pose.tail = [0, breath * 0.055, 0];
  return pose;
}

function dance(t) {
  const pose = relaxedPose();
  const weight = gesture(t, 0, 0.12, 0.86, 1);
  const beat = t * Math.PI * 12;
  const sway = Math.sin(beat) * weight;
  pose.spine = [0, Math.sin(beat / 2) * 0.13 * weight, sway * 0.09];
  pose.chest = [Math.sin(beat * 2) * 0.035 * weight, -sway * 0.1, -sway * 0.07];
  pose.head = [Math.sin(beat * 2) * 0.07 * weight, sway * 0.12, -sway * 0.12];
  pose.leftArm = [0, -0.25 * weight, -1.05 + (0.6 + sway * 0.25) * weight];
  pose.rightArm = [0, -0.25 * weight, -1.05 + (0.6 - sway * 0.25) * weight];
  pose.leftElbow = [0, -0.12 - (0.65 + sway * 0.25) * weight, 0];
  pose.rightElbow = [0, -0.12 - (0.65 - sway * 0.25) * weight, 0];
  pose.leftWrist = [sway * 0.2, 0, 0];
  pose.rightWrist = [-sway * 0.2, 0, 0];
  pose.tail = [0, sway * 0.24, 0];
  return pose;
}

function wave(t) {
  const pose = relaxedPose();
  const lift = gesture(t, 0, 0.22, 0.75, 1);
  const swing = Math.sin(t * Math.PI * 10) * lift;
  pose.leftArm = [0, -0.12 * lift, -1.05 + 2.1 * lift + 0.08 * swing];
  pose.leftElbow = [0, -0.12, -0.18 * lift + 0.16 * swing];
  // Gira a palma para a frente durante o aceno e desfaz a rotação ao baixar a pata.
  pose.leftWrist = [-Math.PI / 2 * lift, 0.35 * swing, 0];
  pose.head = [0, -0.08 * lift, -0.1 * lift];
  pose.chest = [0, 0.06 * lift, 0];
  pose.leftSmile = [0, 0, 0.06 * lift];
  pose.rightSmile = [0, 0, 0.06 * lift];
  return pose;
}

function laugh(t) {
  const pose = relaxedPose();
  const weight = gesture(t, 0, 0.18, 0.78, 1);
  const chuckle = (0.5 + 0.5 * Math.sin(t * Math.PI * 24)) * weight;
  pose.spine = [0.08 * weight + 0.035 * chuckle, 0, 0];
  pose.chest = [-0.04 * weight - chuckle * 0.05, 0, 0];
  pose.head = [-0.14 * weight - chuckle * 0.045, 0, Math.sin(t * Math.PI * 8) * 0.045 * weight];
  pose.jaw = [0.13 * weight + 0.12 * chuckle, 0, 0];
  pose.leftArm = [0, -0.55 * weight, -1.05 + 0.2 * weight];
  pose.rightArm = [0, -0.55 * weight, -1.05 + 0.2 * weight];
  pose.leftElbow = [0, -0.12 - 1.3 * weight, 0];
  pose.rightElbow = [0, -0.12 - 1.3 * weight, 0];
  pose.leftSmile = [0, 0, 0.18 * weight];
  pose.rightSmile = [0, 0, 0.18 * weight];
  return pose;
}

export function createTomClips(model) {
  const bones = {};
  model.traverse((node) => {
    if (!node.isBone) return;
    for (const [key, prefix] of Object.entries(joints)) {
      if (node.name.startsWith(prefix)) bones[key] = node;
    }
  });

  for (const key of Object.keys(joints)) {
    if (!bones[key]) throw new Error(`O esqueleto do Tom não contém o osso ${joints[key]}`);
  }

  function createClip(name, duration, animate) {
    const steps = Math.ceil(duration * 30);
    const times = Array.from({ length: steps + 1 }, (_, index) => duration * index / steps);
    const poses = times.map((time) => animate(time / duration));
    const tracks = Object.entries(bones).map(([key, bone]) => {
      const values = poses.flatMap((pose) => {
        const delta = new THREE.Quaternion().setFromEuler(new THREE.Euler(...pose[key], "XYZ"));
        return bone.quaternion.clone().multiply(delta).toArray();
      });
      return new THREE.QuaternionKeyframeTrack(`${bone.uuid}.quaternion`, times, values);
    });
    return new THREE.AnimationClip(name, duration, tracks);
  }

  return [
    createClip("TomIdle", 3.6, idle),
    createClip("TomDance", 4.2, dance),
    createClip("TomWave", 3.2, wave),
    createClip("TomLaugh", 3.4, laugh),
  ];
}
