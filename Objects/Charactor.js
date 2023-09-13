import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";
import GUI from "lil-gui";

let model, skeleton, mixer;
let mx = 0;
let my = 0;
let mz = 0;
const crossFadeControls = [];
let currentBaseAction = "idle";
const allActions = [];
const baseActions = {
  idle: { weight: 1 },
  walk: { weight: 0 },
  run: { weight: 0 },
};
const additiveActions = {
  sneak_pose: { weight: 0 },
  sad_pose: { weight: 0 },
  agree: { weight: 0 },
  headShake: { weight: 0 },
};
let panelSettings, numAnimations;

function charactor_init(publicObject, glb) {
  const loader = new GLTFLoader();
  loader.load(`${glb}`, function (gltf) {
    model = gltf.scene;
    publicObject.scene.add(model);
    //modelの子要素にアクセス
    model.traverse(function (obj) {
      if (Object.isMesh) Object.castShadow = true;
    });
    //ボーンを読み込む
    skeleton = new THREE.SkeletonHelper(model);
    skeleton.visible = true;
    publicObject.scene.add(skeleton);
    //アニメーション情報の格納
    const animations = gltf.animations;
    //AnimationMixerオブジェクトをmixerに格納
    mixer = new THREE.AnimationMixer(model);
    numAnimations = animations.length;
    for (let i = 0; i !== numAnimations; ++i) {
      let clip = animations[i];
      const name = clip.name;
      if (baseActions[name]) {
        const action = mixer.clipAction(clip);
        activateAction(action);
      }
    }
  });
  function activateAction(action) {
    console.log(action);
    // const clip = action.getClip();
    // const setting = baseActions[clip.name] ||
  }
}

export { charactor_init };
