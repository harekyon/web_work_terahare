import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";
import GUI from "lil-gui";
import { radiusToDegree } from "./tools";
import gsap from "gsap";

let model, skeleton, mixer;
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

let actionStart = "";
let actionEnd = "";
let duration = 0.4;

let characterAnimState = "idle";
let characterMovement = { direction: 1, axis: "z", rotate: 0 };
let nowKeyCode = null;
let beforeKeyCode = null;
let characterSpeed = 10;
let characterRotateAnim = new THREE.Vector3(0, 0, 0);
let characterRotateIsMounted = false;

let clock = new THREE.Clock();

let aaa = { x: 0, y: 0 };

function charactor_init(publicObject, glb) {
  const loader = new GLTFLoader();

  loader.load(`${glb}`, function (gltf) {
    model = gltf.scene;
    publicObject.scene.add(model);
    //modelの子要素にアクセス
    model.traverse(function (object) {
      if (object.isMesh) object.castShadow = true;
    });
    skeleton = new THREE.SkeletonHelper(model);
    skeleton.visible = true;
    publicObject.scene.add(skeleton);
    const animations = gltf.animations;
    mixer = new THREE.AnimationMixer(model);
    numAnimations = animations.length;
    for (let i = 0; i !== numAnimations; ++i) {
      let clip = animations[i];
      const name = clip.name;
      if (baseActions[name]) {
        // console.log(baseActions[name]);
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
  function setWeight(action, weight) {
    action.enabled = true;
    action.setEffectiveTimeScale(1);
    action.setEffectiveWeight(weight);
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
          // wasdキーを押すとアニメーションを始める
          actionStart = currentAction;
          actionEnd = action;
          // prepareCrossFade(actionStart, actionEnd, duration);
          prepareCrossFade();
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
          setWeight(settings.action, weight);
          settings.weight = weight;
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
    console.log(crossFadeControls[0]);
  }
  function activateAction(action) {
    const clip = action.getClip();
    const settings = baseActions[clip.name] || additiveActions[clip.name];
    setWeight(action, settings.weight);
    console.log(action);
    action.play();
  }
  function modifyTimeScale(speed) {
    mixer.timeScale = speed;
  }

  function prepareCrossFade() {
    // If the current action is 'idle', execute the crossfade immediately;
    // else wait until the current action has finished its current loop
    // console.log(endAction);

    if (currentBaseAction === "idle" || !actionStart || !actionEnd) {
      actionStart !== "" &&
        actionEnd !== "" &&
        executeCrossFade(actionStart, actionEnd, duration);
    } else {
      actionStart !== "" && actionEnd !== "" && actionStart.fadeOut(duration);
    }

    // Update control colors
    if (actionEnd) {
      const clip = actionEnd.getClip();
      currentBaseAction = clip.name;
    } else {
      currentBaseAction = "None";
    }
  }

  //2023/10/02 synchroとexecuteの切り替え実装途中
  // function synchronizeCrossFade(startAction, endAction, duration) {
  //   console.log("synchronizeCrossFade");
  //   mixer.addEventListener("loop", onLoopFinished);
  //   function onLoopFinished(event) {
  //     if (event.action === startAction) {
  //       mixer.removeEventListener("loop", onLoopFinished);
  //       executeCrossFade(startAction, endAction, duration);
  //     }
  //   }
  // }

  function executeCrossFade(startAction, endAction, duration) {
    // Not only the start action, but also the end action must get a weight of 1 before fading
    // (concerning the start action this is already guaranteed in this place)
    console.log("executeCrossFade");
    if (endAction) {
      setWeight(endAction, 1);
      endAction.time = 0;

      if (startAction) {
        // Crossfade with warping

        startAction.crossFadeTo(endAction, duration, true);
      } else {
        // Fade in

        endAction.fadeIn(duration);
      }
    } else {
      // Fade out

      startAction.fadeOut(duration);
    }
  }
  window.addEventListener("keydown", keydownFunc);
  function keydownFunc(e) {
    crossFadeControls[crossFadeControls.length - 1].object.run();
    var key_code = e.keyCode;
    nowKeyCode = key_code;
    console.log(e);
    //forward
    if (key_code === 87) {
      characterAnimState = "run";
      characterMovement.direction = -1;
      characterMovement.axis = "z";
      characterMovement.rotate = -180;
      runRotation();
    }
    //back
    if (key_code === 83) {
      characterAnimState = "run";
      characterMovement.direction = 1;
      characterMovement.axis = "z";
      characterMovement.rotate = 0;
      runRotation();
    }
    //left
    if (key_code === 65) {
      characterAnimState = "run";
      characterMovement.direction = -1;
      characterMovement.axis = "x";
      characterMovement.rotate = -90;
      runRotation();
    }
    //right
    if (key_code === 68) {
      characterAnimState = "run";
      characterMovement.direction = 1;
      characterMovement.axis = "x";
      characterMovement.rotate = 90;
      runRotation();
    }
    if (key_code === 68) {
      characterAnimState = "run";
      characterMovement.direction = 1;
      characterMovement.axis = "x";
      characterMovement.rotate = 90;
      runRotation();
    }
    if (e.code === "ShiftLeft") {
      console.log("shift! add");
      characterSpeed = 20;
    }
  }
  window.addEventListener("keyup", keyupFunc);
  function keyupFunc(e) {
    if (e.code === "ShiftLeft") {
      console.log("shift! remove");
      characterSpeed = 10;
    }
    crossFadeControls[crossFadeControls.length - 1].object.idle();
    characterAnimState = "idle";
  }
}
function runRotation() {
  if (model !== undefined) {
    gsap.to(characterRotateAnim, {
      y: characterMovement.rotate,
      duration: 0.5,
      ease: "power1.inOut",
      onStart: () => {
        characterRotateIsMounted = true;
      },
      onComplete: () => {
        characterRotateIsMounted = false;
      },
    });
  }
}

function charactor_anim(publicObject) {
  let mixerUpdateDelta = clock.getDelta();
  if (allActions.length !== 0) {
    for (let i = 0; i !== numAnimations; ++i) {
      const action = allActions[i];
      const clip = action.getClip();
      const settings = baseActions[clip.name] || additiveActions[clip.name];
      settings.weight = action.getEffectiveWeight();
    }
    const mixerUpdateDelta = publicObject.clock.getDelta();
    mixer.update(mixerUpdateDelta);
  }
  if (model !== undefined) {
    if (characterAnimState === "run") {
      //
      const move =
        characterMovement.direction * characterSpeed * mixerUpdateDelta;
      if (characterMovement.axis === "z") {
        model.position.z += move;
      } else if (characterMovement.axis === "x") {
        model.position.x += move;
      }
      model.rotation.y = radiusToDegree(characterMovement.rotate);
    }
    if (beforeKeyCode !== nowKeyCode) {
      console.log(`beforeKeyCode:${beforeKeyCode}, nowKeyCode:${nowKeyCode} `);
      // if (beforeKeyCode === 87) {
      //   if (nowKeyCode === 68) {
      //     characterMovement.rotate += -90;
      //     console.log("runnnnn");
      //   }
      //   nowKeyCode === 65 && (characterMovement.rotate += 180);
      //   nowKeyCode === 83 && (characterMovement.rotate += -90);
      //   runRotation();
      // }
      // else if(beforeKeyCode===87&&nowKeyCode===68){

      // }
    }
    model.rotation.y = radiusToDegree(characterRotateAnim.y);
  }
  // console.log(characterRotateIsMounted);
  beforeKeyCode = nowKeyCode;
}
function selectAnim() {}

export { charactor_init, charactor_anim };
