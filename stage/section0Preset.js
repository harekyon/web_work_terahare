import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import * as THREE from "three";
import GUI from "lil-gui";
import { charactor_anim, charactor_init } from "@/Objects/Charactor";

let s1_pointLight1 = new THREE.PointLight(0x887788);
let s1_pointLight1Helpers = new THREE.PointLightHelper(s1_pointLight1);
let s1_pointLight2 = new THREE.PointLight(0x887788);
let s1_pointLight2Helpers = new THREE.PointLightHelper(s1_pointLight2);
const ambientLight = new THREE.AmbientLight(0x101010);

export function section0Process(publicObject, glb) {
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

  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshPhongMaterial({ color: 0xcbcbcb, depthWrite: false })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  publicObject.scene.add(mesh);
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
}
