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
import { charactor_anim, charactor_init } from "@/Objects/Charactor";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { cameraControler } from "@/Modules/cameraControler";
import { orbitControler } from "@/Modules/orbitControler";

export default function Page() {
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  loader.setDRACOLoader(dracoLoader);
  //objs: returnHoverObj関数で使用。hoverしたMeshを返してくれる
  const [section, setSection] = useState(0);

  let orbitControl;
  //World共通のthreeオブジェクト
  let scene, renderer, camera, stats;
  let model, skeleton, mixer, clock;

  camera = new THREE.PerspectiveCamera(
    45,
    globalThis.innerWidth / globalThis.innerHeight,
    0.1,
    1000
  );

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
    let gui = new GUI();
    const stage0 = gui.addFolder("stage0 parameter");
    stage0.add(controls, "light1PosX", -50, 50, 0.1);
    stage0.add(controls, "light1PosY", -50, 50, 0.1);
    stage0.add(controls, "light1PosZ", -50, 50, 0.1);
    stage0.add(controls, "light2PosX", -50, 50, 0.1);
    stage0.add(controls, "light2PosY", -50, 50, 0.1);
    stage0.add(controls, "light2PosZ", -50, 50, 0.1);
    stage0.addColor(controls, "sceneBgColor", 0x111122);
    // cursor
    const cursor = document.getElementById("cursor");
    // stats
    stats = initStats();
    // THREE.Scene設定
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x111122, 50, 2000);
    scene.background = new THREE.Color(0x111122);
    // THREE.Camera設定
    camera.position.x = -0;
    camera.position.y = 9;
    camera.position.z = 65;
    scene.add(camera);
    // THREE.Renderer設定
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(new THREE.Color(0x000000));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 0.2;
    renderer.domElement.id = "main-canvas";
    clock = new THREE.Clock();
    //以上3つをpublicObjectとする
    let publicObject = {
      camera: camera,
      scene: scene,
      renderer: renderer,
      clock: clock,
    };
    //カメラ操作

    orbitControl = new OrbitControls(camera, renderer.domElement);

    // orbitControl.update();
    // THREE.Helper系
    function helperFunction() {
      let axes = new THREE.AxesHelper(10);
      // scene.add(axes);
    }

    helperFunction();
    let hdrObj = new RGBELoader().load(
      // `${mode === "PRODUCT" ? "/threePractice/hdr.hdr" : "/hdr.hdr"}`,
      "/hdr.hdr",
      function (texture) {
        let hdrImg = new THREE.MeshStandardMaterial({ map: texture });
        hdrImg.envMapIntensity = 0.1;
        hdrImg.envMap = texture;
        hdrImg.map.mapping = THREE.EquirectangularReflectionMapping;
        let aaaa = texture;
        aaaa.repeat.set(0.5, 0.5);
        scene.environment = aaaa; // 解像度の低いテクスチャを使用
      }
    );

    document.getElementById("WebGL-output").appendChild(renderer.domElement);

    /** =================================================
     *
     * charactor
     * 
    ===================================================*/
    charactor_init({ ...publicObject }, "/charactor_/tera_anim2addIdle.glb");

    /** =================================================
     *
     * section0 [テスト画面]
     * 
    ===================================================*/
    section0Process({ ...publicObject }, "/charactor_/tera_anim2addIdle.glb");
    // section0Process({ ...publicObject }, "/charactor_/Xbot.glb");

    /** =================================================
     *
     * render
     * 
    ===================================================*/
    function render() {
      stats.update();
      charactor_anim({ ...publicObject });
      section0RenderAnimation({ controls, publicObject });
      requestAnimationFrame(render);
      renderer.render(scene, camera);
    }
    render();

    /** =================================================
     *
     * event
     * 
    ===================================================*/
    window.addEventListener("resize", onResize, false);
    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    /** =================================================
     *
     * statsの初期化
     * 
    ===================================================*/
    function initStats() {
      let stats = new Stats();
      stats.setMode(0);

      stats.domElement.style.position = "absolute";
      stats.domElement.style.left = "0px";
      stats.domElement.style.ltop = "0px";
      document.getElementById("Stats-output").appendChild(stats.domElement);

      return stats;
    }

    /** =================================================
     *
     * マウスカーソルをトラッキングし好きなカーソルアイコンにする 
     * 
    ===================================================*/
    window.addEventListener("mousemove", mouseMoveFunc);
    function mouseMoveFunc(e) {
      // cursorControl(e);
    }
    function cursorControl(e) {
      // cursor.style.transform = `translate(calc(${e.clientX}px - 15px), calc(${e.clientY}px - 15px))`;
    }
  }, []);

  const [isClickStartButton, setIsClickStartButton] = useState(false);
  return (
    <>
      {/* <div id="section0" className="welcome-section">
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
      </div> */}
      {/* <div id="errorTransitionSection" className="error-transition-section">
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
      </div> */}

      <div id="Stats-output"></div>
      <div id="WebGL-output"></div>
      {/* <div id="cursor" className="cursor"></div> */}
    </>
  );
}
