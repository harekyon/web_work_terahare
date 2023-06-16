import * as THREE from "three";
import * as Tools from "../Modules/tools";

console.log(Tools);
let aaa = "nyo~n";
function ffff() {
  console.log("nyoooooooooon");
}
let planeGeometry = new THREE.PlaneGeometry(50, 50, 1, 1);
let textureLoader = new THREE.TextureLoader();
let floorTex = {
  texDiff: textureLoader.load(
    "/laminate_floor_03_2k/textures/laminate_floor_03_diff_2k.jpg",
    THREE.RepeatWrappin,
    THREE.RepeatWrappin
  ),
  texAo: textureLoader.load(
    "/laminate_floor_03_2k/textures/laminate_floor_03_ao_2k.jpg"
  ),
  texNormal: textureLoader.load(
    "/laminate_floor_03_2k/textures/laminate_floor_03_nor_dx_2k.jpg"
  ),
  texDisp: textureLoader.load(
    "/laminate_floor_03_2k/textures/laminate_floor_03_disp_2k.jpg"
  ),
  texRough: textureLoader.load(
    "/laminate_floor_03_2k/textures/laminate_floor_03_rough_2k.jpg"
  ),
};
floorTex.texDiff.wrapS = THREE.RepeatWrapping;
floorTex.texDiff.wrapT = THREE.RepeatWrapping;
floorTex.texDiff.repeat = new THREE.Vector2(2, 2);
floorTex.texDiff.rotation = -0.5 * Math.PI;
Tools.autoInitTexture(floorTex.texDiff);
Tools.autoInitTexture(floorTex.texAo);
Tools.autoInitTexture(floorTex.texNormal);
Tools.autoInitTexture(floorTex.texDisp);
Tools.autoInitTexture(floorTex.texRough);

let wallTex = {
  texDiff: textureLoader.load(
    "/leather_white_2k/textures/leather_white_diff_2k.jpg"
  ),
  texAo: textureLoader.load(
    "/leather_white_2k/textures/leather_white_ao_2k.jpg"
  ),
  texNormal: textureLoader.load(
    "/leather_white_2k/textures/leather_white_nor_gl_2k.jpg"
  ),
  texRough: textureLoader.load(
    "/leather_white_2k/textures/leather_white_rough_2k.jpg"
  ),
};
let floorMaterials = new THREE.MeshStandardMaterial({
  map: floorTex.texDiff,
  normalMap: floorTex.texNormal,
  normalScale: new THREE.Vector2(1, -1),
  aoMap: floorTex.texAo,
  displacementMap: floorTex.texDisp,
  roughnessMap: floorTex.texRough,
});
let wallMaterials = new THREE.MeshStandardMaterial({
  map: wallTex.texDiff,
  normalMap: wallTex.texNormal,
  normalScale: new THREE.Vector2(1, -1),
  aoMap: wallTex.texAo,
  roughnessMap: wallTex.texRough,
});

let floor = new THREE.Mesh(planeGeometry, floorMaterials);
floor.receiveShadow = true;
floor.rotation.x = -0.5 * Math.PI;
floor.position.x = 0;
floor.position.y = 0;
floor.position.z = 0;
floor.name = "floor";
let leftWall = new THREE.Mesh(planeGeometry, wallMaterials);
leftWall.receiveShadow = true;
leftWall.rotation.y = -0.5 * Math.PI;
leftWall.position.x = 25;
leftWall.position.y = 25;
leftWall.position.z = 0;
leftWall.name = "leftWall";
let rightWall = new THREE.Mesh(planeGeometry, wallMaterials);
rightWall.receiveShadow = true;
rightWall.rotation.z = 0.5 * Math.PI;
rightWall.position.x = 0;
rightWall.position.y = 25;
rightWall.position.z = -25;
rightWall.name = "rightWall";

export { floor, leftWall, rightWall };