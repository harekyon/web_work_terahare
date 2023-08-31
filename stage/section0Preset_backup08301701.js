import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import * as THREE from "three";
import GUI from "lil-gui";

let s1_pointLight1 = new THREE.PointLight(0x887788);
let s1_pointLight1Helpers = new THREE.PointLightHelper(s1_pointLight1);
let s1_pointLight2 = new THREE.PointLight(0x887788);
let s1_pointLight2Helpers = new THREE.PointLightHelper(s1_pointLight2);
const ambientLight = new THREE.AmbientLight(0x101010);
let groundModel;
let hitoModel, skeleton, mixer;
let panelSettings, numAnimations;
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
let charactor;
let clock = new THREE.Clock();
export function section0Process(publicObject) {
  publicObject.scene.add(ambientLight);
  s1_pointLight1.position.set(-30, 5, -10);
  s1_pointLight1.intensity = 20;
  publicObject.scene.add(s1_pointLight1);
  publicObject.scene.add(s1_pointLight1Helpers);
  s1_pointLight2.position.set(30, 5, 20);
  s1_pointLight2.intensity = 20;
  publicObject.scene.add(s1_pointLight2);
  publicObject.scene.add(s1_pointLight2Helpers);
  ambientLight.intensity = 10;
  ambientLight.position.set(10, 10, 10);

  const gltfLoaderGround = new GLTFLoader();
  gltfLoaderGround.load("./ground2.glb", function (data) {
    groundModel = data.scene;
    const material = new THREE.MeshStandardMaterial({
      color: 0x112244,
      roughness: 1,
      metalness: 0,
    });
    groundModel.traverse((node) => {
      if (node.isMesh) {
        node.material = material;
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    if (groundModel !== undefined) {
      groundModel.position.set(0, 0, 10);
      groundModel.scale.set(0.5, 0.5, 0.5);
    }
    publicObject.scene.add(groundModel);
  });

  const hitoLoader = new GLTFLoader();
  hitoLoader.load("./Xbot.glb", function (gltf) {
    hitoModel = gltf.scene;
    publicObject.scene.add(hitoModel);

    hitoModel.traverse(function (object) {
      if (object.isMesh) object.castShadow = true;
    });

    //スケルトンを読み込み表示する
    skeleton = new THREE.SkeletonHelper(hitoModel);
    skeleton.visible = true;
    publicObject.scene.add(skeleton);
    if (hitoModel !== undefined) {
      hitoModel.position.set(0, 0, 10);
      hitoModel.scale.set(8, 8, 8);
    }
    const animations = gltf.animations;
    mixer = new THREE.AnimationMixer(hitoModel);
    numAnimations = animations.length;
    console.log(animations);

    for (let i = 0; i !== numAnimations; ++i) {
      let clip = animations[i];
      console.log(clip);
      const name = clip.name;
      if (baseActions[name]) {
        const action = mixer.clipAction(clip);
        activateAction(action);
        baseActions[name].action = action;
        allActions.push(action);
      } else if (additiveActions[name]) {
        // Make the clip additive and remove the reference frame

        THREE.AnimationUtils.makeClipAdditive(clip);

        if (clip.name.endsWith("_pose")) {
          clip = THREE.AnimationUtils.subclip(clip, clip.name, 2, 3, 30);
        }

        const action = mixer.clipAction(clip);
        activateAction(action);
        additiveActions[name].action = action;
        allActions.push(action);
      }
    }
    createPanel();
  });

  // const gltfLoader = new GLTFLoader();
  // gltfLoader.load("hito2.glb", function (object) {
  //   charactor = object;

  //   //シーン内の特定のオブジェクトのアニメーション用のプレーヤー(アニメーションの調整)
  //   mixer = new THREE.AnimationMixer(charactor);

  //   //Animation Actionを生成
  //   const action = mixer.clipAction(charactor.animations[0]);
  //   //ループ設定（1回のみ）
  //   //action.setLoop(THREE.LoopOnce);

  //   //アニメーションを再生する
  //   action.play();

  //   //オブジェクトとすべての子孫に対してコールバックを実行
  //   charactor.traverse((child) => {
  //     //影を落とすメッシュに対して、Shadowプロパティーを有効
  //     if (child.isMesh) {
  //       child.castShadow = true;
  //       child.receiveShadow = true;
  //     }
  //   });
  //   // mixer.scale.set(0.4, 0.2, 0.2);
  //   publicObject.scene.add(charactor);
  //   console.log(charactor);
  // });

  // window.addEventListener("keypress", keyDownFunc);
  // function keyDownFunc(e) {
  //   console.log(e);
  //   if (e.code === "KeyA") {
  //     console.log(charactor.position.x);
  //     charactor.position.x -= 1;
  //     charactor.rotation.y = (270 * Math.PI) / 180;
  //   }
  //   if (e.code === "KeyD") {
  //     console.log(charactor.position.x);
  //     charactor.position.x += 1;
  //     charactor.rotation.y = (270 * Math.PI) / 180;
  //   }
  //   if (e.code === "KeyW") {
  //     console.log(charactor.position.x);
  //     charactor.position.z -= 1;
  //   }
  //   if (e.code === "KeyS") {
  //     console.log(charactor.position.x);
  //     charactor.position.z += 1;
  //   }
  // }
}

function createPanel() {
  const panel = new GUI({ width: 310 });
  const folder1 = panel.addFolder("Base Actions");
  const folder2 = panel.addFolder("Additive Action Weights");
  const folder3 = panel.addFolder("General Speed");

  panelSettings = {
    "modify time scale": 1.0,
  };
  const baseNames = ["None", ...Object.keys(baseActions)];
  for (let i = 0, l = baseNames.length; i !== l; ++i) {
    const name = baseNames[i];
    const settings = baseActions[name];
    panelSettings[name] = function () {
      const currentSettings = baseActions[currentBaseAction];
      const currentAction = currentSettings ? currentSettings.action : null;
      const action = settings ? settings.action : null;
      if (currentAction !== action) {
        console.log(crossFadeControls);
        prepareCrossFade(currentAction, action, 0.35);
      }
    };
    crossFadeControls.push(folder1.add(panelSettings, name));
  }
  for (const name of Object.keys(additiveActions)) {
    const settings = additiveActions[name];
    panelSettings[name] = settings.weight;
    folder2
      .add(panelSettings, name, 0.0, 1.0, 0.01)
      .listen()
      .onChange(function (weight) {
        setWdight(settings.action, weight);
        settings.weight;
      });
  }
  folder3
    .add(panelSettings, "modify time scale", 0.0, 1.5, 0.01)
    .onChange(modifyTimeScale);
  folder1.open();
  folder2.open();
  folder3.open();
  crossFadeControls.forEach(function (control) {
    control.setInactive = function () {
      control.domElement.classList.add("control-inactive");
    };

    control.setActive = function () {
      control.domElement.classList.remove("control-inactive");
    };

    const settings = baseActions[control.property];

    if (!settings || !settings.weight) {
      control.setInactive();
    }
  });
}

function prepareCrossFade(startAction, endAction, duration) {
  //現在のアクションがアイドル状態の場合、すぐにクロスフェードを実行する
  //そうでなければ、今のアクションがループを終了するまで待つ

  if (currentBaseAction === "idle" || !startAction || !endAction) {
    executeCrossFade(startAction, endAction, duration);
  } else {
    synchronizeCrossFade(startAction.endAction, duration);
  }
  if (endAction) {
    const clip = endAction.getClip();
    currentBaseAction = clip.name;
  } else {
    currentBaseAction = "None";
  }
  crossFadeControls.forEach(function (control) {
    const name = control.property;
    if (name === currentBaseAction) {
      control.setActive();
    } else {
      control.setInactive();
    }
  });
}
function modifyTimeScale(speed) {
  mixer.timeScale = speed;
}

export function section0RenderAnimation({ controls, publicObject }) {
  publicObject.scene.background = new THREE.Color(controls.sceneBgColor);
  s1_pointLight1.position.set(
    controls.light1PosX,
    controls.light1PosY,
    controls.light1PosZ
  );
  s1_pointLight2.position.set(
    controls.light2PosX,
    controls.light2PosY,
    controls.light2PosZ
  );
  if (mixer) {
    mixer.update(clock.getDelta());
  }
  for (let i = 0; i !== numAnimations; ++i) {
    const action = allActions[i];
    console.log(numAnimations);
    const clip = action.getClip();
    const settings = baseActions[clip.name] || additiveActions[clip.name];
    settings.weight = action.getEffectiveWeight();
  }
}
