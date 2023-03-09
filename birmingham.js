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
  renderer.setClearColor(0xffffff, 1.0);

  const scene = new THREE.Scene();

  const fov = 45;
  const aspect = 2;
  const near = 0.1;
  const far = 3000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.rotation.order = "YXZ";
  camera.position.set(0, 70, 0);
  camera.lookAt(1000, 0, 0);

  {
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.AmbientLight(color, intensity);
    scene.add(light);
  }

  // const controls = new OrbitControls(camera, canvas);
  // controls.target.set(0, 10, 0);
  // controls.update();

  const playerDirection = new THREE.Vector3();
  const keyStates = {};

  const planeSize = 16000;
  // const axesHelper = new THREE.AxesHelper(1000);
  // scene.add(axesHelper);

  const plainGeometry = new THREE.PlaneGeometry(planeSize, planeSize, 10, 10);
  plainGeometry.rotateX(-Math.PI / 2);
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load("resources/images/terrain.png");
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  const plain = new THREE.Mesh(
    plainGeometry,
    new THREE.MeshPhongMaterial({
      map: texture,
      // wireframe: true,
      // color: "black",
    })
  );
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
  for (let i = 0; i < 8; i++) {
    treeObj = customizeTree.getTree(names[Math.floor(i / 2)]);
    builder.init(treeObj, false);
    skeletons.push(builder.buildSkeleton());
  }
  console.timeEnd("testTime1");

  // 客户端离线渲染
  console.time("testTime2");
  skeletons.forEach((skeleton) => {
    builder.init(skeleton.treeObj, true);
    const tree = builder.buildTree(skeleton);
    for (let i = 0; i < 500; i++) {
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
  const draw = function (rec, color) {
    const field = new THREE.Mesh(
      new THREE.PlaneGeometry(rec.w * 2, rec.h * 2),
      new THREE.MeshBasicMaterial({ color: color, wireframe: true })
    );
    field.rotateX(-Math.PI / 2);
    field.position.set(rec.x, 0, rec.y);
    scene.add(field);
    return field;
  };
  const move = function (rec) {
    rec.x = camera.position.x;
    rec.y = camera.position.z;
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
  let found = [],
    prevFound = [];
  const manageScene = function () {
    quadTree.query(loadArea, found);
    found.forEach((p) => {
      if (!prevFound.includes(p)) scene.add(p.obj);
    });
    prevFound.forEach((p) => {
      if (!found.includes(p)) scene.remove(p.obj);
    });
    prevFound = found.slice();
    console.log(found.length);
    found = [];
  };

  const startX = camera.position.x,
    startZ = camera.position.z,
    visionR = far,
    loadR = 4000;
  const visionArea = new Rectangle(startX, startZ, visionR, visionR);
  const loadArea = new Rectangle(startX, startZ, loadR, loadR);
  manageScene();

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
    move(visionArea);
    if (reachSide(visionArea, loadArea)) {
      console.log("reach side");
      loadArea.x = visionArea.x;
      loadArea.y = visionArea.y;
      manageScene();
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

  function display(vectors) {
    const geometry = new THREE.SphereGeometry(10);
    const material = new THREE.MeshBasicMaterial({ color: "red" });
    vectors.forEach((vector) => {
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(vector.x, vector.y, vector.z);
      scene.add(sphere);
    });
  }

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
    // if (visionArea.x < 1000) {
    //   move(visionArea, visionMesh);
    //   if (reachSide(visionArea, loadArea)) {
    //     loadMesh.position.copy(visionMesh.position);
    //     loadArea.x = visionArea.x;
    //     loadArea.y = visionArea.y;
    //     printFound();
    //   }
    // }
    movement();
    renderer.render(scene, camera);
  }

  function animate() {
    requestAnimationFrame(animate);
    render();
  }
  animate();
  document.addEventListener(
    "keydown",
    (event) => (keyStates[event.code] = true)
  );
  document.addEventListener(
    "keyup",
    (event) => (keyStates[event.code] = false)
  );
  document.body.addEventListener("mousemove", (event) => {
    if (document.pointerLockElement === document.body) {
      camera.rotation.y -= event.movementX / 500;
      camera.rotation.x -= event.movementY / 500;
    }
  });
  canvas.addEventListener("mousedown", () =>
    document.body.requestPointerLock()
  );
}

main();
