import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GAME_CONFIG, catCatalog } from "./cats.config.js";
import { createCatClips } from "./macdonald-clips.js";

const $ = (selector) => document.querySelector(selector);
const canvas = $("#scene");
const loading = $("#loading");
const startScreen = $("#startScreen");
const startButton = $("#startButton");
const catRoster = $("#catRoster");
const actionList = $("#actionList");
const actionTitle = $("#actionTitle");
const interactionPrompt = $("#interactionPrompt");
const toast = $("#toast");
const helpModal = $("#helpModal");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x171526, 0.055);

const camera = new THREE.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(5.2, 2.8, 7.2);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 4.7;
controls.maxDistance = 10;
controls.minPolarAngle = Math.PI * 0.25;
controls.maxPolarAngle = Math.PI * 0.58;
controls.target.set(0.4, 1.35, 0);
controls.autoRotate = !reduceMotion;
controls.autoRotateSpeed = 0.18;

const mat = (color, roughness = 0.7, metalness = 0) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness });

// Ambiente compartilhado: um café noturno montado com geometria do Three.js.
const room = new THREE.Group();
scene.add(room);

const floor = new THREE.Mesh(new THREE.CircleGeometry(8.2, 96), mat(0x201d32, 0.94));
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
room.add(floor);

const rug = new THREE.Mesh(new THREE.CircleGeometry(2.65, 80), mat(0x514378, 0.95));
rug.rotation.x = -Math.PI / 2;
rug.position.y = 0.012;
rug.receiveShadow = true;
room.add(rug);

for (let i = 0; i < 3; i++) {
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.95 + i * 0.52, 0.975 + i * 0.52, 72),
    new THREE.MeshBasicMaterial({
      color: i === 1 ? 0xffbd69 : 0x8c7dd4,
      transparent: true,
      opacity: 0.18,
    })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.018;
  room.add(ring);
}

const pedestal = new THREE.Mesh(
  new THREE.CylinderGeometry(1.1, 1.22, 0.32, 64),
  mat(0x342d4b, 0.72, 0.08)
);
pedestal.position.y = 0.16;
pedestal.castShadow = true;
pedestal.receiveShadow = true;
room.add(pedestal);

const trim = new THREE.Mesh(
  new THREE.TorusGeometry(1.16, 0.025, 10, 80),
  new THREE.MeshStandardMaterial({
    color: 0xffc66f,
    emissive: 0x9a541e,
    emissiveIntensity: 0.55,
    roughness: 0.45,
  })
);
trim.rotation.x = Math.PI / 2;
trim.position.y = 0.28;
room.add(trim);

// Janela, lua e estrelas.
const windowGroup = new THREE.Group();
windowGroup.position.set(0.4, 2.55, -3.25);
room.add(windowGroup);

const windowDark = new THREE.Mesh(
  new THREE.CircleGeometry(2.02, 96),
  new THREE.MeshBasicMaterial({ color: 0x0b1024 })
);
windowGroup.add(windowDark);
windowGroup.add(new THREE.Mesh(new THREE.TorusGeometry(2.12, 0.12, 18, 96), mat(0x403657, 0.5, 0.2)));

const moon = new THREE.Mesh(
  new THREE.SphereGeometry(0.72, 48, 48),
  new THREE.MeshStandardMaterial({
    color: 0xffe7b0,
    emissive: 0xffbf6b,
    emissiveIntensity: 1.7,
    roughness: 0.9,
  })
);
moon.position.set(0.78, 0.52, 0.18);
windowGroup.add(moon);

const moonGlow = new THREE.PointLight(0xffbf78, 12, 9, 2);
moonGlow.position.copy(windowGroup.position).add(new THREE.Vector3(0.8, 0.45, 1.1));
scene.add(moonGlow);

const starGeo = new THREE.BufferGeometry();
const starPositions = [];
for (let i = 0; i < 115; i++) {
  const angle = Math.random() * Math.PI * 2;
  const radius = Math.sqrt(Math.random()) * 1.85;
  starPositions.push(Math.cos(angle) * radius, Math.sin(angle) * radius, 0.04);
}
starGeo.setAttribute("position", new THREE.Float32BufferAttribute(starPositions, 3));
const stars = new THREE.Points(
  starGeo,
  new THREE.PointsMaterial({ color: 0xffffff, size: 0.022, transparent: true, opacity: 0.8 })
);
windowGroup.add(stars);

function addPlant(x, z, scale = 1) {
  const plant = new THREE.Group();
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.19, 0.5, 24), mat(0x9a6049, 0.85));
  pot.position.y = 0.25;
  pot.castShadow = true;
  plant.add(pot);
  for (let i = 0; i < 7; i++) {
    const leaf = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 12, 12),
      mat(i % 2 ? 0x536c5a : 0x6f8b69, 0.85)
    );
    leaf.scale.set(0.62, 2.25, 0.36);
    leaf.position.set(Math.sin(i * 2.1) * 0.22, 0.68 + (i % 3) * 0.16, Math.cos(i * 2.1) * 0.15);
    leaf.rotation.z = (i - 3) * 0.16;
    leaf.castShadow = true;
    plant.add(leaf);
  }
  plant.position.set(x, 0, z);
  plant.scale.setScalar(scale);
  room.add(plant);
}

function addCafeTable(x, z, scale = 1) {
  const table = new THREE.Group();
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.1, 40), mat(0x513a48, 0.72));
  top.position.y = 0.82;
  top.castShadow = true;
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.09, 0.78, 18), mat(0x211c2d, 0.55, 0.2));
  stem.position.y = 0.4;
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.075, 0.15, 20), mat(0xe8cfa4, 0.7));
  cup.position.set(0.2, 0.95, 0.08);
  table.add(top, stem, cup);
  table.position.set(x, 0, z);
  table.scale.setScalar(scale);
  room.add(table);
}

addPlant(3.35, -1.5, 1.08);
addPlant(-3.8, 0.55, 0.78);
addCafeTable(-3.0, -1.25, 1);
addCafeTable(3.15, 0.6, 0.82);

scene.add(new THREE.HemisphereLight(0x8589ca, 0x171220, 2.0));
const key = new THREE.SpotLight(0xffc27a, 34, 13, Math.PI * 0.19, 0.65, 1.5);
key.position.set(-3.2, 6, 4.2);
key.target.position.set(0, 1, 0);
key.castShadow = true;
key.shadow.mapSize.set(1024, 1024);
scene.add(key, key.target);
const rim = new THREE.DirectionalLight(0x8888ff, 2.8);
rim.position.set(4, 3, -4);
scene.add(rim);

const boneNames = [
  "Butt_19", "Back_9", "Neck_2", "Head_1", "L_Shoulder_5", "L_Arm_4",
  "R_Shoulder_8", "R_Arm_7", "R_Thigh_12", "L_Thigh_15", "Tail_18", "Tail1_17", "Tail2_16",
];

function fitModelToHeight(model, height) {
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  model.scale.setScalar(height / Math.max(size.y, 0.001));
  model.updateMatrixWorld(true);
  const fitted = new THREE.Box3().setFromObject(model);
  const center = fitted.getCenter(new THREE.Vector3());
  model.position.sub(center);
  model.position.y += (fitted.max.y - fitted.min.y) / 2;
}

function smoothstep(a, b, value) {
  const t = THREE.MathUtils.clamp((value - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}

function pulse(t, start, peak, end) {
  if (t < start || t > end) return 0;
  return t < peak ? smoothstep(start, peak, t) : 1 - smoothstep(peak, end, t);
}

function lerpAngle(current, target, t) {
  const delta = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  return current + delta * t;
}

class CatActor {
  constructor(profile, gltf) {
    this.profile = profile;
    this.model = gltf.scene;
    this.pivot = new THREE.Group();
    this.basePosition = new THREE.Vector3(...profile.spawn);
    this.pivot.position.copy(this.basePosition);
    this.facing = profile.rotationY;
    this.facingTarget = profile.rotationY;
    this.placeTarget = null;
    this.placeFrom = this.basePosition.clone();
    this.placeFromFacing = this.facing;
    this.placeT = 1;
    this.travelLift = 0;
    this.bones = {};
    this.rest = {};
    this.currentAction = profile.actions[0]?.id ?? null;
    this.actionStartedAt = 0;
    this.mixer = gltf.animations.length ? new THREE.AnimationMixer(this.model) : null;
    this.clips = gltf.animations;
    this.activeClipAction = null;
    this.resumeIdleAfter = false;

    this.model.traverse((child) => {
      child.userData.catActorId = profile.id;
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.envMapIntensity = 0.65;
          child.material.needsUpdate = true;
        }
      }
      if (child.isBone && boneNames.includes(child.name)) this.bones[child.name] = child;
    });

    if (profile.driver === "root-clips") {
      this.mountRootClips();
      return;
    }

    const initialBox = new THREE.Box3().setFromObject(this.model);
    const initialSize = initialBox.getSize(new THREE.Vector3());
    const uniformScale = profile.targetHeight / Math.max(initialSize.y, 0.001);
    this.model.scale.setScalar(uniformScale);
    this.model.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(this.model);
    const center = box.getCenter(new THREE.Vector3());
    this.model.position.set(-center.x, -box.min.y, -center.z);
    this.model.rotation.y = profile.rotationY;
    this.model.userData.baseScale = this.model.scale.clone();
    this.pivot.add(this.model);
    scene.add(this.pivot);

    for (const name of boneNames) {
      if (!this.bones[name]) continue;
      this.rest[name] = {
        quaternion: this.bones[name].quaternion.clone(),
        position: this.bones[name].position.clone(),
        scale: this.bones[name].scale.clone(),
      };
    }
  }

  mountRootClips() {
    const previousMaterials = [];
    this.model.traverse((child) => {
      if (!child.isMesh || !child.material) return;
      previousMaterials.push(child.material);
      const map = child.material.map ?? null;
      if (map) map.colorSpace = THREE.SRGBColorSpace;
      child.material = new THREE.MeshStandardMaterial({ map, roughness: 0.78, metalness: 0 });
      child.material.envMapIntensity = 0.65;
    });
    previousMaterials.forEach((material) => material.dispose());

    fitModelToHeight(this.model, 1);
    this.motion = new THREE.Group();
    this.motion.add(this.model);
    this.holder = new THREE.Group();
    this.holder.scale.setScalar(this.profile.targetHeight);
    this.holder.rotation.y = this.profile.rotationY;
    this.holder.add(this.motion);
    this.pivot.add(this.holder);
    scene.add(this.pivot);

    this.clips = this.profile.clipSet === "macdonald" ? createCatClips() : [];
    this.mixer = this.clips.length ? new THREE.AnimationMixer(this.motion) : null;
    this.mixer?.addEventListener("finished", (event) => {
      if (event.action !== this.activeClipAction || !this.resumeIdleAfter || !this.profile.idleClip) return;
      this.resumeIdleAfter = false;
      event.action.stop();
      this.playClipByName(this.profile.idleClip, { loop: true, resumeIdle: false, fade: 0.25 });
    });
    if (this.profile.idleClip) {
      this.playClipByName(this.profile.idleClip, { loop: true, resumeIdle: false, fade: 0 });
    }
  }

  playClipByName(name, { loop = false, hold = true, resumeIdle = false, fade = 0.2 } = {}) {
    if (!this.mixer || !name) return;
    const clip = this.clips.find((item) => item.name === name);
    if (!clip) return;
    const next = this.mixer.clipAction(clip);
    const previous = this.activeClipAction;
    next.reset();
    next.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1);
    next.clampWhenFinished = !loop && hold;
    next.enabled = true;
    next.setEffectiveWeight(1);
    next.play();
    if (previous && previous !== next) {
      previous.paused = false;
      if (fade > 0) previous.crossFadeTo(next, fade, false);
      else previous.stop();
    }
    this.activeClipAction = next;
    this.resumeIdleAfter = resumeIdle;
  }

  rotateBone(name, x = 0, y = 0, z = 0, weight = 1) {
    const bone = this.bones[name];
    const base = this.rest[name];
    if (!bone || !base) return;
    const delta = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(x * weight, y * weight, z * weight, "XYZ")
    );
    bone.quaternion.copy(base.quaternion).multiply(delta);
  }

  resetPose() {
    for (const name of boneNames) {
      const bone = this.bones[name];
      const base = this.rest[name];
      if (!bone || !base) continue;
      bone.quaternion.copy(base.quaternion);
      bone.position.copy(base.position);
      bone.scale.copy(base.scale);
    }
    this.pivot.position.copy(this.basePosition);
    this.pivot.rotation.set(0, 0, 0);
    this.model.scale.copy(this.model.userData.baseScale);
  }

  play(action, elapsed) {
    this.currentAction = action.id;
    this.actionStartedAt = elapsed;
    if (this.profile.driver === "root-clips") {
      const actionIndex = this.profile.actions.findIndex((item) => item.id === action.id);
      const clipName = action.clip || this.clips[actionIndex]?.name;
      this.playClipByName(clipName, {
        loop: Boolean(action.loop),
        hold: action.hold === true,
        resumeIdle: Boolean(action.resumeIdle),
      });
      return;
    }
    if (this.profile.driver !== "clips" || !this.mixer) return;
    const actionIndex = this.profile.actions.findIndex((item) => item.id === action.id);
    const clip = this.clips.find((item) => item.name === action.clip) || this.clips[actionIndex];
    if (!clip) return;
    this.mixer.stopAllAction();
    const clipAction = this.mixer.clipAction(clip);
    clipAction.reset();
    clipAction.setLoop(THREE.LoopOnce, 1);
    clipAction.clampWhenFinished = true;
    clipAction.fadeIn(0.15).play();
  }

  applyFacing() {
    if (this.holder) this.holder.rotation.y = this.facing;
    else this.model.rotation.y = this.facing;
  }

  destination() {
    return {
      position: (this.placeTarget ?? this.basePosition).clone(),
      facing: this.facingTarget ?? this.facing,
    };
  }

  moveTo(position, rotationY) {
    if (reduceMotion) {
      this.basePosition.copy(position);
      this.facing = rotationY;
      this.facingTarget = rotationY;
      this.placeTarget = null;
      this.travelLift = 0;
      this.pivot.position.copy(this.basePosition);
      this.applyFacing();
      return;
    }
    this.placeFrom = this.basePosition.clone();
    this.placeFromFacing = this.facing;
    this.placeTarget = position.clone();
    this.facingTarget = rotationY;
    this.placeT = 0;
  }

  updatePlacement(delta) {
    this.travelLift = 0;
    if (!this.placeTarget) return;
    this.placeT = Math.min(1, this.placeT + delta / 0.72);
    const eased = this.placeT * this.placeT * (3 - 2 * this.placeT);
    this.basePosition.lerpVectors(this.placeFrom, this.placeTarget, eased);
    this.facing = lerpAngle(this.placeFromFacing, this.facingTarget, eased);
    this.travelLift = Math.sin(eased * Math.PI) * 0.55;
    if (this.placeT >= 1) {
      this.basePosition.copy(this.placeTarget);
      this.facing = this.facingTarget;
      this.placeTarget = null;
      this.travelLift = 0;
    }
    this.applyFacing();
  }

  update(elapsed, delta) {
    this.updatePlacement(delta);
    if (this.profile.driver === "clips" || this.profile.driver === "root-clips") {
      this.pivot.position.copy(this.basePosition);
      this.pivot.position.y += this.travelLift;
      if (!reduceMotion) this.mixer?.update(delta);
      return;
    }
    this.resetPose();
    const animator = proceduralAnimations[this.currentAction];
    if (animator) animator(this, reduceMotion ? 0 : elapsed - this.actionStartedAt);
    this.pivot.position.y += this.travelLift;
  }

  focusPoint() {
    const origin = this.placeTarget ?? this.basePosition;
    return origin.clone().add(new THREE.Vector3(0, 1.15, 0));
  }
}

function animateCurious(actor, t) {
  const cycle = (t % 4.8) / 4.8;
  const look = Math.sin(cycle * Math.PI * 2);
  const tilt = Math.sin(cycle * Math.PI * 4) * 0.08;
  actor.rotateBone("Neck_2", 0, look * 0.12, tilt);
  actor.rotateBone("Head_1", 0, look * 0.28, tilt * 1.5);
  actor.rotateBone("L_Shoulder_5", 0, 0, -pulse(cycle, 0.22, 0.4, 0.7) * 0.34);
  actor.rotateBone("L_Arm_4", 0, 0, pulse(cycle, 0.22, 0.4, 0.7) * 0.22);
  actor.rotateBone("Tail_18", Math.sin(t * 2) * 0.16, 0, 0);
  actor.rotateBone("Tail1_17", Math.sin(t * 2 + 0.7) * 0.24, 0, 0);
  actor.rotateBone("Tail2_16", Math.sin(t * 2 + 1.3) * 0.32, 0, 0);
}

function animateJump(actor, t) {
  const cycle = (t % 3.15) / 3.15;
  const crouch = pulse(cycle, 0.03, 0.17, 0.29);
  const leap = pulse(cycle, 0.24, 0.43, 0.72);
  const land = pulse(cycle, 0.7, 0.8, 0.94);
  actor.pivot.position.y = actor.basePosition.y - crouch * 0.16 + Math.sin(leap * Math.PI) * 1.05 - land * 0.05;
  actor.pivot.rotation.z = Math.sin(leap * Math.PI) * -0.055;
  actor.rotateBone("Back_9", 0, 0, crouch * 0.13 - leap * 0.1);
  actor.rotateBone("L_Thigh_15", 0, 0, -crouch * 0.46 + leap * 0.23);
  actor.rotateBone("R_Thigh_12", 0, 0, crouch * 0.46 - leap * 0.23);
  actor.rotateBone("L_Shoulder_5", 0, 0, leap * 0.38);
  actor.rotateBone("R_Shoulder_8", 0, 0, -leap * 0.38);
  actor.rotateBone("Tail_18", -leap * 0.42 + land * 0.18, 0, 0);
}

function animatePurr(actor, t) {
  const breath = (Math.sin(t * 2.25) + 1) * 0.5;
  const vibration = Math.sin(t * 19) * 0.0025;
  actor.model.scale.copy(actor.model.userData.baseScale).multiplyScalar(1 + breath * 0.012 + vibration);
  actor.rotateBone("Back_9", 0, 0, breath * 0.035);
  actor.rotateBone("Neck_2", 0, 0, -0.045 + breath * 0.025);
  actor.rotateBone("Head_1", 0, Math.sin(t * 0.8) * 0.035, -0.08 + breath * 0.02);
  actor.rotateBone("Tail_18", Math.sin(t * 0.72) * 0.1, 0, 0);
  actor.rotateBone("Tail1_17", Math.sin(t * 0.72 + 0.5) * 0.16, 0, 0);
  actor.rotateBone("Tail2_16", Math.sin(t * 0.72 + 1) * 0.18, 0, 0);
}

// Drivers extras preservados para futuros perfis com o mesmo esqueleto.
function animateStretch(actor, t) {
  const wave = Math.sin(t * 1.8) * 0.12;
  actor.rotateBone("Back_9", 0, 0, -wave * 0.4);
  actor.rotateBone("Neck_2", 0, 0, 0.18 + wave * 0.2);
  actor.rotateBone("Head_1", 0, 0, 0.26 + wave * 0.5);
  actor.rotateBone("L_Shoulder_5", 0, 0, -0.3 + wave * 0.7);
  actor.rotateBone("R_Shoulder_8", 0, 0, 0.3 - wave * 0.7);
}

function animateChase(actor, t) {
  const wave = Math.sin(t * 3.8) * 0.14;
  actor.rotateBone("Back_9", 0, 0, wave);
  actor.rotateBone("Head_1", 0, wave * 1.5, wave * 0.8);
  actor.rotateBone("L_Thigh_15", 0, 0, -0.24 + wave * 0.18);
  actor.rotateBone("R_Thigh_12", 0, 0, 0.24 - wave * 0.18);
}

function animateNap(actor, t) {
  const settle = Math.sin(t * 0.9) * 0.08;
  actor.model.scale.copy(actor.model.userData.baseScale).multiplyScalar(1 + settle * 0.02);
  actor.rotateBone("Back_9", 0, 0, -0.08 + settle * 0.4);
  actor.rotateBone("Neck_2", 0, 0, -0.18 + settle * 0.4);
  actor.rotateBone("Head_1", 0, 0, -0.22 + settle * 0.5);
}

const proceduralAnimations = {
  curious: animateCurious,
  jump: animateJump,
  purr: animatePurr,
  stretch: animateStretch,
  chase: animateChase,
  nap: animateNap,
};

const actors = new Map();
const completedInteractions = new Set();
const loader = new GLTFLoader();
const clock = new THREE.Clock();
const desiredTarget = controls.target.clone();
let selectedActor = null;
let toastTimer = null;
let gameStarted = false;

function loadCat(profile) {
  return new Promise((resolve, reject) => {
    loader.load(
      profile.asset,
      (gltf) => {
        const actor = new CatActor(profile, gltf);
        actors.set(profile.id, actor);
        resolve(actor);
      },
      undefined,
      reject
    );
  });
}

function renderRoster() {
  catRoster.innerHTML = "";
  for (const profile of catCatalog) {
    const actor = actors.get(profile.id);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "roster-item";
    button.disabled = !actor;
    button.dataset.catId = profile.id;
    button.style.setProperty("--accent", profile.accent);
    button.innerHTML = `
      <span class="cat-avatar" aria-hidden="true">${actor ? "◉" : "＋"}</span>
      <span class="roster-copy"><strong>${profile.name}</strong><small>${profile.guardian}</small></span>
      <span class="roster-status">${actor ? "ONLINE" : "EM BREVE"}</span>
    `;
    if (actor) button.addEventListener("click", () => selectActor(actor));
    catRoster.append(button);
  }
  updateSelectedUI();
}

function renderActions() {
  actionList.innerHTML = "";
  if (!selectedActor) return;
  selectedActor.profile.actions.forEach((action, index) => {
    const key = `${selectedActor.profile.id}:${action.id}`;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "action-button";
    button.dataset.actionId = action.id;
    button.classList.toggle("is-complete", completedInteractions.has(key));
    button.innerHTML = `
      <span class="action-icon" aria-hidden="true">${action.icon}</span>
      <span class="action-copy"><strong>${action.label}</strong><small>${action.description}</small></span>
      <span class="action-key">0${index + 1}</span>
    `;
    button.addEventListener("click", () => performAction(index));
    actionList.append(button);
  });
}

function updateSelectedUI() {
  document.querySelectorAll(".roster-item").forEach((item) => {
    item.classList.toggle("is-selected", item.dataset.catId === selectedActor?.profile.id);
  });
}

function selectActor(actor) {
  if (selectedActor && selectedActor !== actor) {
    const stage = selectedActor.destination();
    const side = actor.destination();
    actor.moveTo(stage.position, stage.facing);
    selectedActor.moveTo(side.position, side.facing);
  }
  selectedActor = actor;
  desiredTarget.copy(actor.focusPoint());
  actionTitle.textContent = actor.profile.name;
  interactionPrompt.innerHTML = `<span class="prompt-key">1–3</span><span>${actor.profile.name} • escolha uma ação</span>`;
  renderActions();
  updateSelectedUI();
}

function performAction(index) {
  if (!selectedActor || !gameStarted) return;
  const action = selectedActor.profile.actions[index];
  if (!action) return;
  selectedActor.play(action, clock.elapsedTime);
  const key = `${selectedActor.profile.id}:${action.id}`;
  const isNew = !completedInteractions.has(key);
  completedInteractions.add(key);
  renderActions();
  updateProgress();
  showToast(
    isNew
      ? `${selectedActor.profile.name}: ${action.label} concluída • +1 amizade`
      : `${selectedActor.profile.name} repetiu: ${action.label}`
  );
}

function updateProgress() {
  const total = GAME_CONFIG.totalCats * GAME_CONFIG.actionsPerCat;
  $("#catCount").textContent = actors.size;
  $("#interactionCount").textContent = completedInteractions.size;
  $("#progressFill").style.width = `${(completedInteractions.size / total) * 100}%`;
}

function showToast(message) {
  clearTimeout(toastTimer);
  toast.querySelector("p").textContent = message;
  toast.classList.add("is-visible");
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let pointerStart = null;

function actorAtPointer(event) {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects([...actors.values()].map((actor) => actor.model), true);
  const actorId = hits[0]?.object?.userData?.catActorId;
  return actorId ? actors.get(actorId) : null;
}

canvas.addEventListener("pointerdown", (event) => {
  pointerStart = { x: event.clientX, y: event.clientY };
});

canvas.addEventListener("pointerup", (event) => {
  if (!gameStarted || !pointerStart) return;
  const moved = Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y);
  pointerStart = null;
  if (moved > 6) return;
  const actor = actorAtPointer(event);
  if (actor) selectActor(actor);
});

canvas.addEventListener("pointermove", (event) => {
  if (!gameStarted) return;
  canvas.classList.toggle("can-interact", Boolean(actorAtPointer(event)));
});

window.addEventListener("keydown", (event) => {
  if (event.key >= "1" && event.key <= "3") performAction(Number(event.key) - 1);
  if (event.key.toLowerCase() === "h" || event.key === "?") openHelp();
  if (event.key === "Escape") closeHelp();
});

function openHelp() {
  helpModal.hidden = false;
  $("#closeHelp").focus();
}

function closeHelp() {
  helpModal.hidden = true;
  $("#helpButton").focus();
}

$("#helpButton").addEventListener("click", openHelp);
$("#closeHelp").addEventListener("click", closeHelp);
$("#understoodButton").addEventListener("click", closeHelp);
helpModal.addEventListener("click", (event) => {
  if (event.target === helpModal) closeHelp();
});

function beginGame() {
  gameStarted = true;
  startScreen.classList.add("is-hidden");
  showToast("Turno iniciado • conheça os moradores do café");
}

startButton.addEventListener("click", beginGame);

async function initializeGame() {
  const enabledProfiles = catCatalog.filter((profile) => profile.enabled);
  const results = await Promise.allSettled(enabledProfiles.map(loadCat));
  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(`Não foi possível carregar ${enabledProfiles[index].name}:`, result.reason);
    }
  });
  renderRoster();
  updateProgress();
  const firstActor = actors.values().next().value;
  if (firstActor) {
    selectActor(firstActor);
    startButton.disabled = false;
    startButton.querySelector("span").textContent = "Entrar no café";
    loading.classList.add("is-hidden");
    const params = new URLSearchParams(window.location.search);
    if (params.get("play") === "1") {
      beginGame();
      const requestedAction = firstActor.profile.actions.findIndex(
        (action) => action.id === params.get("action")
      );
      if (requestedAction >= 0) performAction(requestedAction);
    }
  } else {
    loading.querySelector("p").textContent = "Não foi possível carregar os gatos.";
    startButton.querySelector("span").textContent = "Modelos indisponíveis";
  }
}

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  if (width < 900) {
    camera.position.set(5.4, 2.8, 8.8);
    desiredTarget.set(0, 1.25, 0);
  }
}
window.addEventListener("resize", resize);

function render() {
  requestAnimationFrame(render);
  const delta = Math.min(clock.getDelta(), 0.05);
  const elapsed = clock.elapsedTime;
  stars.rotation.z = elapsed * 0.018;
  moon.position.y = 0.52 + Math.sin(elapsed * 0.35) * 0.025;
  actors.forEach((actor) => actor.update(elapsed, delta));
  controls.target.lerp(desiredTarget, 0.06);
  controls.update();
  renderer.render(scene, camera);
}

resize();
initializeGame();
render();
