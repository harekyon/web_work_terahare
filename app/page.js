"use client";

//scss
import variable from "../styles/_var.module.scss";

// basis
import { useEffect, useRef, useState } from "react";

// extension lib
import * as Stats from "stats-js";
import GUI from "lil-gui";

// three lib
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";

// original functions
import { gsap } from "gsap";
import Errorpop from "@/components/Errorpop";
import { css } from "@emotion/react";
import {
  section0Process,
  section0RenderAnimation,
} from "@/stage/section0Preset";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export default function Page() {
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  loader.setDRACOLoader(dracoLoader);
  //objs: returnHoverObj関数で使用。hoverしたMeshを返してくれる
  const [section, setSection] = useState(0);
  let camera = new THREE.PerspectiveCamera(
    45,
    globalThis.innerWidth / globalThis.innerHeight,
    0.1,
    1000
  );

  //World共通のthreeオブジェクト
  let stats;
  let scene;
  let renderer;

  //gui
  let controls = {
    myText: "lilGUIだよん",
    myBoolean: true,
    myNumber: 1,
    myFunction: function () {
      console.log("button pushed!");
    },
    myDropDowns: "select1",
    myColor: 0xff0000,

    //stage0
    light1PosX: -41,
    light1PosY: 14,
    light1PosZ: -13,
    light2PosX: 41,
    light2PosY: 14,
    light2PosZ: -13,
    sceneBgColor: 0x111122,
  };

  useEffect(() => {
    let scene, renderer, camera, stats;
    let model, skeleton, mixer, clock;

    const crossFadeControls = [];

    let currentBaseAction = "idle";
    const allActions = [];
    const baseActions = {
      idle: { weight: 1 },
      walk: { weight: 0 },
      run: { weight: 0 },
    };
    const additiveActions = {
      harekyon: { weight: 0 },
      sneak_pose: { weight: 0 },
      sad_pose: { weight: 0 },
      agree: { weight: 0 },
      headShake: { weight: 0 },
    };
    let panelSettings, numAnimations;

    init();

    function init() {
      const container = document.getElementById("WebGL-output");
      clock = new THREE.Clock();

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0xa0a0a0);
      scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);

      const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 3);
      hemiLight.position.set(0, 20, 0);
      scene.add(hemiLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 3);
      dirLight.position.set(3, 10, 10);
      dirLight.castShadow = true;
      dirLight.shadow.camera.top = 2;
      dirLight.shadow.camera.bottom = -2;
      dirLight.shadow.camera.left = -2;
      dirLight.shadow.camera.right = 2;
      dirLight.shadow.camera.near = 0.1;
      dirLight.shadow.camera.far = 40;
      scene.add(dirLight);

      // ground

      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100),
        new THREE.MeshPhongMaterial({ color: 0xcbcbcb, depthWrite: false })
      );
      mesh.rotation.x = -Math.PI / 2;
      mesh.receiveShadow = true;
      scene.add(mesh);

      const loader = new GLTFLoader();
      // loader.load("/hito2.glb", function (gltf) {
      loader.load("/Xbot0.glb", function (gltf) {
        model = gltf.scene;
        scene.add(model);

        model.traverse(function (object) {
          if (object.isMesh) object.castShadow = true;
        });

        skeleton = new THREE.SkeletonHelper(model);
        skeleton.visible = false;
        scene.add(skeleton);

        const animations = gltf.animations;
        mixer = new THREE.AnimationMixer(model);

        numAnimations = animations.length;

        for (let i = 0; i !== numAnimations; ++i) {
          let clip = animations[i];
          const name = clip.name;
          console.log(mixer.clipAction(clip));
          console.log(baseActions[name]);
          if (baseActions[name]) {
            const action = mixer.clipAction(clip);
            activateAction(action);
            baseActions[name].action = action;
            allActions.push(action);
            // console.log(action);
          } else if (additiveActions[name]) {
            // Make the clip additive and remove the reference frame

            THREE.AnimationUtils.makeClipAdditive(clip);

            if (clip.name.endsWith("_pose")) {
              clip = THREE.AnimationUtils.subclip(clip, clip.name, 2, 3, 30);
              // console.log(clip);
            }

            const action = mixer.clipAction(clip);
            activateAction(action);

            additiveActions[name].action = action;
            allActions.push(action);
          }
        }

        createPanel();

        animate();
      });

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.shadowMap.enabled = true;
      container.appendChild(renderer.domElement);

      // camera
      camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        1,
        100
      );
      camera.position.set(-1, 2, 3);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enablePan = false;
      controls.enableZoom = false;
      controls.target.set(0, 1, 0);
      controls.update();

      stats = new Stats();
      container.appendChild(stats.dom);

      window.addEventListener("resize", onWindowResize);
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
    }

    function activateAction(action) {
      const clip = action.getClip();
      const settings = baseActions[clip.name] || additiveActions[clip.name];
      setWeight(action, settings.weight);
      action.play();
    }

    function modifyTimeScale(speed) {
      mixer.timeScale = speed;
    }

    function prepareCrossFade(startAction, endAction, duration) {
      // If the current action is 'idle', execute the crossfade immediately;
      // else wait until the current action has finished its current loop

      if (currentBaseAction === "idle" || !startAction || !endAction) {
        executeCrossFade(startAction, endAction, duration);
      } else {
        synchronizeCrossFade(startAction, endAction, duration);
      }

      // Update control colors

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

    function synchronizeCrossFade(startAction, endAction, duration) {
      mixer.addEventListener("loop", onLoopFinished);

      function onLoopFinished(event) {
        if (event.action === startAction) {
          mixer.removeEventListener("loop", onLoopFinished);

          executeCrossFade(startAction, endAction, duration);
        }
      }
    }

    function executeCrossFade(startAction, endAction, duration) {
      // Not only the start action, but also the end action must get a weight of 1 before fading
      // (concerning the start action this is already guaranteed in this place)

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

    // This function is needed, since animationAction.crossFadeTo() disables its start action and sets
    // the start action's timeScale to ((start animation's duration) / (end animation's duration))

    function setWeight(action, weight) {
      action.enabled = true;
      action.setEffectiveTimeScale(1);
      action.setEffectiveWeight(weight);
    }

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animate() {
      // Render loop

      requestAnimationFrame(animate);

      for (let i = 0; i !== numAnimations; ++i) {
        const action = allActions[i];
        // console.log(allActions);
        const clip = action.getClip();
        const settings = baseActions[clip.name] || additiveActions[clip.name];
        settings.weight = action.getEffectiveWeight();
      }

      // Get the time elapsed since the last frame, used for mixer update

      const mixerUpdateDelta = clock.getDelta();

      // Update the animation mixer, the stats panel, and render this frame

      mixer.update(mixerUpdateDelta);

      stats.update();

      renderer.render(scene, camera);
    }
  }, []);

  const [isClickStartButton, setIsClickStartButton] = useState(false);
  return (
    <>
      <div id="section0" className="welcome-section">
        <button
          onClick={() => {
            gsap.to(camera.position, { y: 100, duration: 5 });
            // camera.lookAt(chairWhite);
            const sectionDom = document.getElementById("section0");
            setSection(1);
            sectionDom.classList.add("fadeout");
            setTimeout(() => {
              sectionDom.style.display = "none";
            }, 1000);
            setIsClickStartButton(true);
          }}
          className="welcome-section__start"
        >
          START
        </button>
      </div>
      <div id="errorTransitionSection" className="error-transition-section">
        {isClickStartButton ? (
          <>
            <Errorpop
              posX={"20%"}
              posY={"20%"}
              width={"600px"}
              cssOverrides={css`
                animation-delay: 100ms;
              `}
            />
            <Errorpop
              posX={"25%"}
              posY={"80%"}
              width={"500px"}
              cssOverrides={css`
                animation-delay: 200ms;
              `}
            />
            <Errorpop
              posX={"70%"}
              posY={"10%"}
              width={"600px"}
              cssOverrides={css`
                animation-delay: 150ms;
              `}
            />
            <Errorpop
              posX={"80%"}
              posY={"70%"}
              width={"300px"}
              cssOverrides={css`
                animation-delay: 300ms;
              `}
            />
          </>
        ) : (
          <></>
        )}
      </div>

      <div id="Stats-output"></div>
      <div id="WebGL-output"></div>
      <div id="cursor" className="cursor"></div>
    </>
  );
}
