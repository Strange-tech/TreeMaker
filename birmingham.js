"use strict";

import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { PCDLoader } from "three/examples/jsm/loaders/PCDLoader.js";
import { ConvexGeometry } from "three/examples/jsm/geometries/ConvexGeometry.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { TreeBuilder } from "./TreeBuilder";
import { CustomizeTree } from "./CustomizeTree";
import { Point, QuadTree, Rectangle } from "./QuadTree";

function main() {
  const canvas = document.querySelector("#c");
  const renderer = new THREE.WebGLRenderer({ canvas: canvas });
  // renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;

  const scene = new THREE.Scene();

  const fov = 45;
  const aspect = 2;
  const near = 0.1;
  const far = 3000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.rotation.order = "YXZ";
  camera.position.set(0, 70, 0);
  camera.lookAt(1000, 0, 0);

  const startX = camera.position.x,
    startZ = camera.position.z,
    visionR = far,
    loadR = 4000;

  const visionArea = new Rectangle(startX, startZ, visionR, visionR);
  const loadArea = new Rectangle(startX, startZ, loadR, loadR);

  const color = 0xffffff;
  const intensity = 1;
  const amLight = new THREE.AmbientLight(color, intensity / 2);
  scene.add(amLight);
  const dirLight = new THREE.DirectionalLight(color, intensity);
  dirLight.position.set(loadArea.x - loadArea.w, loadArea.w, loadArea.y);
  dirLight.target.position.set(loadArea.x, 0, loadArea.y);
  dirLight.shadow.mapSize = new THREE.Vector2(2048, 2048);
  dirLight.shadow.camera.top = loadArea.w;
  dirLight.shadow.camera.right = loadArea.w;
  dirLight.shadow.camera.bottom = -loadArea.w;
  dirLight.shadow.camera.left = -loadArea.w;
  dirLight.shadow.camera.near = loadArea.w / 5;
  dirLight.shadow.camera.far = loadArea.w * 2.4;
  dirLight.castShadow = true;
  scene.add(dirLight);

  /////////////////////////////////////////////////////////////////////////////////
  // SKY BOX
  {
    const skyboxLoader = new THREE.CubeTextureLoader();
    const skyboxTexture = skyboxLoader.load([
      "resources/images/sky box/right.jpg",
      "resources/images/sky box/left.jpg",
      "resources/images/sky box/top.jpg",
      "resources/images/sky box/bottom.jpg",
      "resources/images/sky box/front.jpg",
      "resources/images/sky box/back.jpg",
    ]);
    scene.background = skyboxTexture;
  }

  // const controls = new OrbitControls(camera, canvas);
  // controls.target.set(0, 10, 0);
  // controls.update();

  const playerDirection = new THREE.Vector3();
  const keyStates = {};

  const planeSize = 16000;
  // const axesHelper = new THREE.AxesHelper(1000);
  // scene.add(axesHelper);
  const textureManager = function (loader, url) {
    const texture = loader.load(url);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(16, 16);
    return texture;
  };

  const plainGeometry = new THREE.PlaneGeometry(planeSize, planeSize, 10, 10);
  plainGeometry.rotateX(-Math.PI / 2);
  const textureLoader = new THREE.TextureLoader();
  const colorMap = textureManager(
    textureLoader,
    "resources/images/terrain/terrain_base_standard.png"
  );
  // const normalMap = textureManager(
  //   textureLoader,
  //   "resources/images/terrain/terrain_normal_standard.png"
  // );
  const displaceMap = textureManager(
    textureLoader,
    "resources/images/terrain/terrain_displace_standard.png"
  );
  const plain = new THREE.Mesh(
    plainGeometry,
    new THREE.MeshLambertMaterial({
      map: colorMap,
      // normalMap: normalMap,
      displacementMap: displaceMap,
    })
  );
  plain.receiveShadow = true;
  // const pointsGeometry = plainGeometry.clone();
  // const plainPosAttribute = plainGeometry.attributes.position,
  // pointsPosAttribute = pointsGeometry.attributes.position;
  // pointsGeometry.setIndex(null);
  // const points = new THREE.Points(pointsGeometry);
  // scene.add(points);
  scene.add(plain);

  // tree object 格式说明
  const names = ["法国梧桐", "桂花", "红枫", "国槐"];
  const customizeTree = new CustomizeTree();
  const builder = new TreeBuilder();

  // const raycaster = new THREE.Raycaster();
  // let pointer = new THREE.Vector2();
  // let c = 0;

  // function onPointerDown(event) {
  //   plainPosAttribute.needsUpdate = pointsPosAttribute.needsUpdate = true;
  //   pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  //   pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  //   raycaster.setFromCamera(pointer, camera);
  //   const intersects = raycaster.intersectObject(/*points*/ plain, false);
  //   console.log(intersects);
  //   if (intersects.length > 0) {
  //     // const idx = intersects[0].index;
  //     // console.log(idx);
  //     // console.log("Done!");
  //     // plainPosAttribute.setY(idx, 100);
  //     // pointsPosAttribute.setY(idx, 100);

  //     let p = intersects[0].point;
  //     c++;
  //     if (c < 50) {
  //       const tree = builder.build();
  //       tree.position.set(p.x, p.y, p.z);
  //       scene.add(tree);
  //       builder.clear();
  //     }
  //   }
  // }

  const buildInstancedMeshGroup = function (singleTree, number) {
    const trans = new THREE.Matrix4();
    const rot = new THREE.Matrix4();
    const scl = new THREE.Matrix4();
    const instancedMeshGroup = new THREE.Group();
    const instancedMeshes = [];
    // singleTree is a THREE.Group
    singleTree.children.forEach((child) => {
      instancedMeshes.push(
        new THREE.InstancedMesh(child.geometry, child.material, number)
      );
    });
    for (let i = 0; i < number; i++) {
      const matrix = new THREE.Matrix4();
      trans.makeTranslation(
        Math.random() * planeSize - planeSize / 2,
        0,
        Math.random() * planeSize - planeSize / 2
      );
      rot.makeRotationY(Math.random() * 2 * Math.PI);
      scl.makeScale(1, 1, 1);
      matrix.multiply(trans).multiply(rot).multiply(scl);
      instancedMeshes.forEach((instancedMesh) => {
        instancedMesh.setMatrixAt(i, matrix);
      });
    }
    instancedMeshGroup.add(...instancedMeshes);
    return instancedMeshGroup;
  };

  const trees = [],
    skeletons = [];
  let treeObj;
  const boundary = new Rectangle(0, 0, planeSize / 2, planeSize / 2);
  const quadTree = new QuadTree(boundary, 5);

  // 模拟从服务器发送来的数据
  console.time("testTime1");
  for (let i = 0; i < 12; i++) {
    treeObj = customizeTree.getTree(names[Math.floor(i / 3)]);
    builder.init(treeObj, false);
    skeletons.push(builder.buildSkeleton());
  }
  console.timeEnd("testTime1");

  // 客户端离线渲染
  console.time("testTime2");
  skeletons.forEach((skeleton) => {
    builder.init(skeleton.treeObj, true);
    const tree = builder.buildTree(skeleton);
    for (let i = 0; i < 300; i++) {
      const clone = tree.clone();
      const p = new THREE.Vector3(
        Math.random() * planeSize - planeSize / 2,
        0,
        Math.random() * planeSize - planeSize / 2
      );
      clone.position.set(p.x, p.y, p.z);
      quadTree.insert(new Point(p.x, p.z, 5, clone));
    }
    builder.clearMesh();
  });
  console.timeEnd("testTime2");

  // 场景管理与资源释放
  let found = [],
    shadowFound = [],
    prevFound = [],
    prevShadowFound = [];
  const move = function (rec) {
    rec.x = camera.position.x;
    rec.y = camera.position.z;
    quadTree.query(rec, shadowFound);
    shadowFound.forEach((p) => {
      if (!prevShadowFound.includes(p))
        p.obj.children.forEach((child) => {
          child.castShadow = true;
        });
    });
    prevShadowFound.forEach((p) => {
      if (!shadowFound.includes(p))
        p.obj.children.forEach((child) => {
          child.castShadow = false;
        });
    });
    prevShadowFound = shadowFound.slice();
    shadowFound = [];
  };
  const approximatelyEqual = function (a, b) {
    return Math.abs(a - b) < 20;
  };
  const reachSide = function (inside, outside) {
    if (
      approximatelyEqual(inside.x - inside.w, outside.x - outside.w) ||
      approximatelyEqual(inside.x + inside.w, outside.x + outside.w) ||
      approximatelyEqual(inside.y - inside.h, outside.y - outside.h) ||
      approximatelyEqual(inside.y + inside.h, outside.y + outside.h)
    )
      return true;
    else return false;
  };
  const manageScene = function (rec, light) {
    quadTree.query(rec, found);
    found.forEach((p) => {
      if (!prevFound.includes(p)) scene.add(p.obj);
    });
    prevFound.forEach((p) => {
      if (!found.includes(p)) scene.remove(p.obj);
    });
    prevFound = found.slice();
    console.log(found.length);
    found = [];
    light.position.set(rec.x - rec.w, rec.w, rec.y);
    light.target.position.set(rec.x, 0, rec.y);
  };

  manageScene(loadArea, dirLight);

  function getForwardVector() {
    camera.getWorldDirection(playerDirection);
    playerDirection.y = 0;
    playerDirection.normalize();
    return playerDirection;
  }

  function getSideVector() {
    camera.getWorldDirection(playerDirection);
    playerDirection.y = 0;
    playerDirection.normalize();
    playerDirection.cross(camera.up);
    return playerDirection;
  }

  let speedDelta = 5;
  function movement() {
    if (keyStates["KeyW"])
      camera.position.add(getForwardVector().multiplyScalar(speedDelta));
    if (keyStates["KeyS"])
      camera.position.add(getForwardVector().multiplyScalar(-speedDelta));
    if (keyStates["KeyA"])
      camera.position.add(getSideVector().multiplyScalar(-speedDelta));
    if (keyStates["KeyD"])
      camera.position.add(getSideVector().multiplyScalar(speedDelta));
    if (keyStates["ArrowUp"]) camera.position.y += 2;
    if (keyStates["ArrowDown"]) camera.position.y -= 2;
    move(visionArea);
    if (reachSide(visionArea, loadArea)) {
      console.log("reach side");
      loadArea.x = visionArea.x;
      loadArea.y = visionArea.y;
      manageScene(loadArea, dirLight);
    }
  }

  /////////////////////////////////////////////////////////////////////////////////
  // GUI
  const guiobj = {
    save: function () {
      trees.forEach((tree, index) => {
        const json = tree.toJSON();
        console.log(json);
        const jsonData = JSON.stringify(json);
        function download(content, fileName, contentType) {
          var a = document.createElement("a");
          var file = new Blob([content], { type: contentType });
          a.href = URL.createObjectURL(file);
          a.download = fileName;
          a.click();
        }
        download(jsonData, `tree_${index}.json`, "application/json");
      });
    },
  };
  const gui = new GUI();
  gui.add(guiobj, "save");

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width = (canvas.clientWidth * pixelRatio) | 0;
    const height = (canvas.clientHeight * pixelRatio) | 0;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function render() {
    // 图像不随屏幕拉伸改变
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }
    movement();
    renderer.render(scene, camera);
  }

  function animate() {
    requestAnimationFrame(animate);
    render();
  }
  animate();

  document.addEventListener("keydown", (event) => {
    keyStates[event.code] = true;
  });
  document.addEventListener("keyup", (event) => {
    keyStates[event.code] = false;
  });
  document.body.addEventListener("mousemove", (event) => {
    if (document.pointerLockElement === document.body) {
      camera.rotation.y -= event.movementX / 500;
      camera.rotation.x -= event.movementY / 500;
    }
  });
  canvas.addEventListener("mousedown", () => {
    document.body.requestPointerLock();
  });
}

main();
