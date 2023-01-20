"use strict";

import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TreeBuilder } from "./treeBuilder";

function main() {
  const canvas = document.querySelector("#c");
  const renderer = new THREE.WebGLRenderer({ canvas: canvas });
  // renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.setClearColor(0xffffff, 1.0);

  const scene = new THREE.Scene();

  const fov = 45;
  const aspect = 2;
  const near = 0.1;
  const far = 5000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 10, 20);
  camera.lookAt(0, 10, 0);

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 10, 0);
  controls.update();

  // tree object 格式说明
  const treeObj = {
    name: "Platanus orientalis L.",
    depth: 5,
    disturbRange: 3,
    segment: 5,
    leaves: {
      total: 15000, // 只多不少
      each: 20,
    },
    branches: [
      // root node
      {
        start: new THREE.Vector3(0, 0, 0),
        end: new THREE.Vector3(0, 40, 0),
        radius: 5,
        fork: { min: 0.8, max: 0.9 },
      },
      // middle node
      {
        number: 3,
        length: { min: 50, max: 60 },
        fork: { min: 0.8, max: 0.9 },
      },
      {
        number: 3,
        length: { min: 45, max: 55 },
        fork: { min: 0.25, max: 0.9 },
      },
      {
        number: 4,
        length: { min: 30, max: 40 },
        fork: { min: 0.5, max: 1 },
      },
      {
        number: 4,
        length: { min: 20, max: 30 },
        fork: { min: 0.25, max: 1 },
      },
      // leaf node
      {
        number: 5,
        length: { min: 5, max: 10 },
      },
    ],
  };

  const builder = new TreeBuilder(
    scene,
    treeObj,
    "resources/images/Tree_Basecolor.png",
    "resources/images/Leaf_Basecolor.png"
  );
  // console.log(builder.getCnt());
  for (let i = 0; i < 10; i++) {
    const tree = builder.build();
    tree.position.set(i * 300 - 1300, 0, 0);
    scene.add(tree);
    builder.clear();
  }

  // gltf exporter
  // setTimeout(() => {
  //   const fileName = "output.gltf";
  //   new GLTFExporter().parse(group, function (result) {
  //     const myBlob = new Blob([JSON.stringify(result)], {
  //       type: "text/plain",
  //     });
  //     let link = document.createElement("a");
  //     link.href = URL.createObjectURL(myBlob);
  //     link.download = fileName;
  //     link.click();
  //   });
  // }, 2000);

  // compute the box that contains all the stuff from root and below
  // const box = new THREE.Box3().setFromObject(tree);
  // const boxSize = box.getSize(new THREE.Vector3()).length();
  // const boxCenter = box.getCenter(new THREE.Vector3());
  // // set the camera to frame the box
  // frameArea(boxSize * 0.5, boxSize, boxCenter, camera);
  // // update the Trackball controls to handle the new size
  // controls.maxDistance = boxSize * 10;
  // controls.target.copy(boxCenter);
  // controls.update();

  function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
    const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
    const halfFovY = THREE.MathUtils.degToRad(camera.fov * 0.5);
    const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
    const direction = new THREE.Vector3()
      .subVectors(camera.position, boxCenter)
      .multiply(new THREE.Vector3(1, 0, 1))
      .normalize();
    // move the camera
    camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));
    // pick some near and far values for the frustum that will contain the box.
    camera.near = boxSize / 100;
    camera.far = boxSize * 100;
    camera.updateProjectionMatrix();
    // point the camera to look at the center of the box
    camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
  }

  {
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.AmbientLight(color, intensity);
    scene.add(light);
  }

  {
    // 参考平面
    // const planeSize = 40;
    // const loader = new THREE.TextureLoader();
    // const texture = loader.load("resources/images/checker.png");
    // texture.wrapS = THREE.RepeatWrapping;
    // texture.wrapT = THREE.RepeatWrapping;
    // texture.magFilter = THREE.NearestFilter;
    // const repeats = planeSize / 2;
    // texture.repeat.set(repeats, repeats);
    // const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    // const planeMat = new THREE.MeshPhongMaterial({
    //   map: texture,
    //   side: THREE.DoubleSide, // 双面材质
    // });
    // const mesh = new THREE.Mesh(planeGeo, planeMat);
    // mesh.rotation.x = Math.PI * -0.5;
    // scene.add(mesh);
  }

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  let renderRequested = false;
  function render() {
    renderRequested = false;
    // 图像不随屏幕拉伸改变
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }
    renderer.render(scene, camera);
  }

  function requestRenderIfNotRequested() {
    if (!renderRequested) {
      renderRequested = true;
      requestAnimationFrame(render);
    }
  }

  function animate() {
    requestAnimationFrame(animate);
    render();
  }
  animate();
}

main();
