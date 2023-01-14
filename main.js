"use strict";

import * as THREE from "three";
import { Mesh } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

function main() {
  const canvas = document.querySelector("#c");
  const renderer = new THREE.WebGLRenderer({ canvas: canvas });
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.setClearColor(0xffffff, 1.0);

  const scene = new THREE.Scene();

  const fov = 45;
  const aspect = 2;
  const near = 0.1;
  const far = 1000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 10, 20);
  camera.lookAt(0, 10, 0);

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 10, 0);
  controls.update();

  const positions = [],
    indices = [],
    uvs = [];
  const positionNumComponents = 3;
  const uvNumComponents = 2;

  let ndx = 0;
  const z_axis = new THREE.Vector3(0, 0, 1);

  const renderPoint = function (x, y, z) {
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 3, 3),
      new THREE.MeshBasicMaterial({ color: "red" })
    );
    sphere.position.set(x, y, z);
    scene.add(sphere);
  };

  const extractPoints = function (plane, axis, angle) {
    const array = [];
    const localPositions = plane.array; // array of vector3
    const worldPositon = plane.position; // vector3
    const l = localPositions.length;
    for (let i = 0; i < l; i++) {
      array.push(
        localPositions[i].applyAxisAngle(axis, angle).add(worldPositon)
      );
    }
    return array;
  };

  const toArray = function (vector) {
    return [vector.x, vector.y, vector.z];
  };

  const makePositions = function (prevPlanePoints, curPlanePoints) {
    const l = curPlanePoints.length;
    for (let i = 0; i < l; i++) {
      let j = (i + 1) % l;
      positions.push(
        ...toArray(curPlanePoints[i]),
        ...toArray(curPlanePoints[j]),
        ...toArray(prevPlanePoints[i]),
        ...toArray(prevPlanePoints[j])
      );
      uvs.push(1, 1, 0, 1, 1, 0, 0, 0);
      indices.push(ndx, ndx + 1, ndx + 2, ndx + 2, ndx + 1, ndx + 3);
      ndx += 4;
    }
  };

  const buildTree = function (start, end, radius, depth, disturbRange = 3) {
    if (depth === 3) {
      return;
    }
    radius = radius <= 0.125 ? 0.125 : radius;
    const mid = new THREE.Vector3(
      (start.x + end.x) / 2 + Math.random() * 2 * disturbRange - disturbRange,
      (start.y + end.y) / 2 + Math.random() * 2 * disturbRange - disturbRange,
      (start.z + end.z) / 2 + Math.random() * 2 * disturbRange - disturbRange
    );
    const curve = new THREE.CatmullRomCurve3([start, mid, end]);
    const points = curve.getPoints(50);
    // const branchGeometry = new THREE.BufferGeometry().setFromPoints(points);
    // const branchMaterial = new THREE.LineBasicMaterial({ color: "green" });
    // const branch = new THREE.Line(branchGeometry, branchMaterial);
    // scene.add(branch);

    const pointsLength = points.length;
    const segment = 10; // 树干控制点的个数
    const offset = Math.floor(pointsLength / segment);
    let prevPlanePoints, curPlanePoints;
    let r = radius;

    // 获取一些枝干控制点
    for (let i = 0; i < pointsLength; i += offset) {
      const controlPoint = points[i];
      // renderPoint(controlPoint.x, controlPoint.y, controlPoint.z);

      const tangent = new THREE.Vector3();
      curve.getTangent(i / (pointsLength - 1), tangent);
      const angle = tangent.angleTo(z_axis); // 弧度
      const cross = new THREE.Vector3(); // 叉乘得到的向量，作为旋转轴
      cross.crossVectors(z_axis, tangent).normalize();

      const plane = {
        position: new THREE.Vector3(
          controlPoint.x,
          controlPoint.y,
          controlPoint.z
        ),
        array: [
          new THREE.Vector3(r, r, 0),
          new THREE.Vector3(-r, r, 0),
          new THREE.Vector3(-r, -r, 0),
          new THREE.Vector3(r, -r, 0),
        ],
      };
      r *= 0.9;

      curPlanePoints = extractPoints(plane, cross, angle);
      // console.log(plane);
      if (prevPlanePoints) {
        makePositions(prevPlanePoints, curPlanePoints);
      }
      prevPlanePoints = curPlanePoints;
    }

    const branchNumber = 5;
    for (let i = 0; i < branchNumber; i++) {
      const s = points[Math.floor(Math.random() * pointsLength)];
      const e = new THREE.Vector3(
        s.x + Math.random() * 40 - 20,
        s.y + 10,
        s.z + Math.random() * 40 - 20
      );
      buildTree(s, e, radius / 2, depth + 1);
    }
  };

  const start = new THREE.Vector3(0, 0, 0);
  const end = new THREE.Vector3(0, 50, 0);
  buildTree(start, end, 1, 0);

  // console.log(positions);
  console.log(uvs);
  // console.log(indices);
  const loader = new THREE.TextureLoader();
  const texture = loader.load("resources/images/Tree_Basecolor.png");
  const treeGeometry = new THREE.BufferGeometry();
  const treeMaterial = new THREE.MeshPhongMaterial({
    // wireframe: true,
    // color: "black",
    map: texture,
    side: THREE.DoubleSide,
  });

  const positionAttribute = new THREE.BufferAttribute(
    new Float32Array(positions),
    positionNumComponents
  );
  const uvAttribute = new THREE.BufferAttribute(
    new Float32Array(uvs),
    uvNumComponents
  );
  treeGeometry.setAttribute("position", positionAttribute);
  treeGeometry.computeVertexNormals();
  treeGeometry.setAttribute("uv", uvAttribute);

  treeGeometry.setIndex(indices);

  const tree = new Mesh(treeGeometry, treeMaterial);
  scene.add(tree);

  // compute the box that contains all the stuff from root and below
  const box = new THREE.Box3().setFromObject(tree);
  const boxSize = box.getSize(new THREE.Vector3()).length();
  const boxCenter = box.getCenter(new THREE.Vector3());
  // set the camera to frame the box
  frameArea(boxSize * 0.5, boxSize, boxCenter, camera);
  // update the Trackball controls to handle the new size
  controls.maxDistance = boxSize * 10;
  controls.target.copy(boxCenter);
  controls.update();

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
    const planeSize = 40;
    const loader = new THREE.TextureLoader();
    const texture = loader.load("resources/images/checker.png");
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    const repeats = planeSize / 2;
    texture.repeat.set(repeats, repeats);
    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshPhongMaterial({
      map: texture,
      side: THREE.DoubleSide, // 双面材质
    });
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.rotation.x = Math.PI * -0.5;
    scene.add(mesh);
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
