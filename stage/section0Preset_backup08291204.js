import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import * as THREE from "three";

let s1_pointLight1 = new THREE.PointLight(0x887788);
let s1_pointLight1Helpers = new THREE.PointLightHelper(s1_pointLight1);
let s1_pointLight2 = new THREE.PointLight(0x887788);
let s1_pointLight2Helpers = new THREE.PointLightHelper(s1_pointLight2);
const ambientLight = new THREE.AmbientLight(0x101010);
let model;
let mixer;
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

  const gltfLoader = new GLTFLoader();
  gltfLoader.load("./ground2.glb", function (data) {
    model = data.scene;
    const material = new THREE.MeshStandardMaterial({
      color: 0x112244,
      roughness: 1,
      metalness: 0,
    });
    model.traverse((node) => {
      if (node.isMesh) {
        node.material = material;
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    if (model !== undefined) {
      model.position.set(0, 0, 10);
      model.scale.set(0.5, 0.5, 0.5);
    }
    publicObject.scene.add(model);
  });

  // const fbxLoader = new FBXLoader();
  // fbxLoader.load("hito.fbx", function (object) {
  //   charactor = object;
  //   charactor.scale.set(0.2, 0.2, 0.2);
  //   charactor.position.set(10, -2, 10);
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
}
