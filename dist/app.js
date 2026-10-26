import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const canvas = document.querySelector("#scene");
const loading = document.querySelector("#loading");
const animationButtons = [...document.querySelectorAll(".animation-button")];
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
controls.maxDistance = 9;
controls.minPolarAngle = Math.PI * 0.26;
controls.maxPolarAngle = Math.PI * 0.56;
controls.target.set(0.65, 1.45, 0);
controls.autoRotate = !reduceMotion;
controls.autoRotateSpeed = 0.22;

const mat = (color, roughness = 0.7, metalness = 0) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness });

// Ambiente: um pequeno observatório felino montado somente com geometria.
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
    new THREE.MeshBasicMaterial({ color: i === 1 ? 0xffbd69 : 0x8c7dd4, transparent: true, opacity: 0.18 })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.018;
  room.add(ring);
}

const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.22, 0.32, 64), mat(0x342d4b, 0.72, 0.08));
pedestal.position.y = 0.16;
pedestal.castShadow = true;
pedestal.receiveShadow = true;
room.add(pedestal);

const trim = new THREE.Mesh(
  new THREE.TorusGeometry(1.16, 0.025, 10, 80),
  new THREE.MeshStandardMaterial({ color: 0xffc66f, emissive: 0x9a541e, emissiveIntensity: 0.55, roughness: 0.45 })
);
trim.rotation.x = Math.PI / 2;
trim.position.y = 0.28;
room.add(trim);

// Janela circular e lua.
const windowGroup = new THREE.Group();
windowGroup.position.set(0.4, 2.55, -3.25);
room.add(windowGroup);

const windowDark = new THREE.Mesh(new THREE.CircleGeometry(2.02, 96), new THREE.MeshBasicMaterial({ color: 0x0b1024 }));
windowGroup.add(windowDark);
const windowFrame = new THREE.Mesh(new THREE.TorusGeometry(2.12, 0.12, 18, 96), mat(0x403657, 0.5, 0.2));
windowGroup.add(windowFrame);

const moon = new THREE.Mesh(
  new THREE.SphereGeometry(0.72, 48, 48),
  new THREE.MeshStandardMaterial({ color: 0xffe7b0, emissive: 0xffbf6b, emissiveIntensity: 1.7, roughness: 0.9 })
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
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.022, transparent: true, opacity: 0.8 }));
windowGroup.add(stars);

// Bancos e vasos dão escala ao espaço sem disputar atenção com o gato.
const bench = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.16, 0.55), mat(0x493854, 0.82));
bench.position.set(-3.15, 0.64, -1.4);
bench.castShadow = true;
room.add(bench);
for (const x of [-3.92, -2.38]) {
  const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.58, 16), mat(0x231e32, 0.6, 0.15));
  leg.position.set(x, 0.3, -1.4);
  room.add(leg);
}

function addPlant(x, z, scale = 1) {
  const plant = new THREE.Group();
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.19, 0.5, 24), mat(0x9a6049, 0.85));
  pot.position.y = 0.25;
  pot.castShadow = true;
  plant.add(pot);
  for (let i = 0; i < 7; i++) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), mat(i % 2 ? 0x536c5a : 0x6f8b69, 0.85));
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
addPlant(3.35, -1.5, 1.08);
addPlant(-3.8, 0.55, 0.78);

// Iluminação cinematográfica quente/fria.
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

const clock = new THREE.Clock();
const catPivot = new THREE.Group();
catPivot.position.y = 0.34;
scene.add(catPivot);

let cat = null;
let currentAnimation = "curious";
let animationStartedAt = 0;
const bones = {};
const rest = {};

const boneNames = [
  "Butt_19", "Back_9", "Neck_2", "Head_1", "L_Shoulder_5", "L_Arm_4",
  "R_Shoulder_8", "R_Arm_7", "R_Thigh_12", "L_Thigh_15", "Tail_18", "Tail1_17", "Tail2_16"
];

function smoothstep(a, b, value) {
  const t = THREE.MathUtils.clamp((value - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}

function pulse(t, start, peak, end) {
  if (t < start || t > end) return 0;
  return t < peak ? smoothstep(start, peak, t) : 1 - smoothstep(peak, end, t);
}

function rotateBone(name, x = 0, y = 0, z = 0, weight = 1) {
  const bone = bones[name];
  if (!bone) return;
  const delta = new THREE.Quaternion().setFromEuler(new THREE.Euler(x * weight, y * weight, z * weight, "XYZ"));
  bone.quaternion.copy(rest[name].quaternion).multiply(delta);
}

function resetPose() {
  for (const name of boneNames) {
    if (!bones[name]) continue;
    bones[name].quaternion.copy(rest[name].quaternion);
    bones[name].position.copy(rest[name].position);
    bones[name].scale.copy(rest[name].scale);
  }
  catPivot.position.y = 0.34;
  catPivot.rotation.set(0, 0, 0);
  if (cat) cat.scale.copy(cat.userData.baseScale);
}

function animateCurious(t) {
  const cycle = (t % 4.8) / 4.8;
  const look = Math.sin(cycle * Math.PI * 2);
  const tilt = Math.sin(cycle * Math.PI * 4) * 0.08;
  rotateBone("Neck_2", 0, look * 0.12, tilt);
  rotateBone("Head_1", 0, look * 0.28, tilt * 1.5);
  rotateBone("L_Shoulder_5", 0, 0, -pulse(cycle, 0.22, 0.4, 0.7) * 0.34);
  rotateBone("L_Arm_4", 0, 0, pulse(cycle, 0.22, 0.4, 0.7) * 0.22);
  rotateBone("Tail_18", Math.sin(t * 2.0) * 0.16, 0, 0);
  rotateBone("Tail1_17", Math.sin(t * 2.0 + 0.7) * 0.24, 0, 0);
  rotateBone("Tail2_16", Math.sin(t * 2.0 + 1.3) * 0.32, 0, 0);
}

function animateJump(t) {
  const cycle = (t % 3.15) / 3.15;
  const crouch = pulse(cycle, 0.03, 0.17, 0.29);
  const leap = pulse(cycle, 0.24, 0.43, 0.72);
  const land = pulse(cycle, 0.7, 0.8, 0.94);
  catPivot.position.y = 0.34 - crouch * 0.16 + Math.sin(leap * Math.PI) * 1.05 - land * 0.05;
  catPivot.rotation.z = Math.sin(leap * Math.PI) * -0.055;
  rotateBone("Back_9", 0, 0, crouch * 0.13 - leap * 0.1);
  rotateBone("L_Thigh_15", 0, 0, -crouch * 0.46 + leap * 0.23);
  rotateBone("R_Thigh_12", 0, 0, crouch * 0.46 - leap * 0.23);
  rotateBone("L_Shoulder_5", 0, 0, leap * 0.38);
  rotateBone("R_Shoulder_8", 0, 0, -leap * 0.38);
  rotateBone("Tail_18", -leap * 0.42 + land * 0.18, 0, 0);
  rotateBone("Tail1_17", -leap * 0.24, 0, 0);
}

function animatePurr(t) {
  const breath = (Math.sin(t * 2.25) + 1) * 0.5;
  const vibration = Math.sin(t * 19) * 0.0025;
  cat.scale.copy(cat.userData.baseScale).multiplyScalar(1 + breath * 0.012 + vibration);
  rotateBone("Back_9", 0, 0, breath * 0.035);
  rotateBone("Neck_2", 0, 0, -0.045 + breath * 0.025);
  rotateBone("Head_1", 0, Math.sin(t * 0.8) * 0.035, -0.08 + breath * 0.02);
  rotateBone("Tail_18", Math.sin(t * 0.72) * 0.1, 0, 0);
  rotateBone("Tail1_17", Math.sin(t * 0.72 + 0.5) * 0.16, 0, 0);
  rotateBone("Tail2_16", Math.sin(t * 0.72 + 1) * 0.18, 0, 0);
}

function chooseAnimation(name) {
  currentAnimation = name;
  animationStartedAt = clock.getElapsedTime();
  controls.autoRotate = name === "purr" && !reduceMotion;
  animationButtons.forEach((button) => {
    const active = button.dataset.animation === name;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

animationButtons.forEach((button) => button.addEventListener("click", () => chooseAnimation(button.dataset.animation)));
window.addEventListener("keydown", (event) => {
  const map = { "1": "curious", "2": "jump", "3": "purr" };
  if (map[event.key]) chooseAnimation(map[event.key]);
});

// Também facilita direção de arte e testes: ?animation=jump ou ?animation=purr.
const requestedAnimation = new URLSearchParams(window.location.search).get("animation");
if (["curious", "jump", "purr"].includes(requestedAnimation)) chooseAnimation(requestedAnimation);

const loader = new GLTFLoader();
loader.load(
  "./assets/cat.glb",
  (gltf) => {
    cat = gltf.scene;
    cat.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.envMapIntensity = 0.6;
          child.material.needsUpdate = true;
        }
      }
      if (child.isBone && boneNames.includes(child.name)) bones[child.name] = child;
    });

    // Normaliza qualquer escala/origem do arquivo para caber exatamente no pedestal.
    const initialBox = new THREE.Box3().setFromObject(cat);
    const initialSize = initialBox.getSize(new THREE.Vector3());
    const targetHeight = 2.15;
    const uniformScale = targetHeight / initialSize.y;
    cat.scale.setScalar(uniformScale);
    cat.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(cat);
    const center = box.getCenter(new THREE.Vector3());
    cat.position.x -= center.x;
    cat.position.z -= center.z;
    cat.position.y -= box.min.y;
    cat.rotation.y = -0.2;
    cat.userData.baseScale = cat.scale.clone();
    catPivot.add(cat);

    for (const name of boneNames) {
      if (!bones[name]) continue;
      rest[name] = {
        quaternion: bones[name].quaternion.clone(),
        position: bones[name].position.clone(),
        scale: bones[name].scale.clone()
      };
    }

    loading.classList.add("is-hidden");
  },
  undefined,
  (error) => {
    console.error("Não foi possível carregar o gato 3D:", error);
    loading.querySelector("p").textContent = "Não foi possível carregar o modelo 3D.";
  }
);

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  if (width < 900) {
    camera.position.set(4.6, 2.6, 7.4);
    controls.target.set(0, 1.25, 0);
  }
}
window.addEventListener("resize", resize);

function render() {
  requestAnimationFrame(render);
  const elapsed = clock.getElapsedTime();
  stars.rotation.z = elapsed * 0.018;
  moon.position.y = 0.52 + Math.sin(elapsed * 0.35) * 0.025;

  if (cat) {
    resetPose();
    const t = reduceMotion ? 0 : elapsed - animationStartedAt;
    if (currentAnimation === "curious") animateCurious(t);
    if (currentAnimation === "jump") animateJump(t);
    if (currentAnimation === "purr") animatePurr(t);
  }

  controls.update();
  renderer.render(scene, camera);
}

resize();
render();
