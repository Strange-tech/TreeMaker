import * as THREE from "three";
import { randomRangeLinear } from "./utilities";
/*************************************************************************************
 * CLASS NAME:  TreeBuilder
 * DESCRIPTION: A novel tree editor & generator on the webpage.
 * NOTE:
 *
 *************************************************************************************/
class TreeBuilder {
  constructor(scene, treeObj, treeBasecolor, leafBasecolor) {
    this.scene = scene;
    this.treeObj = treeObj;
    this.treeBasecolor = treeBasecolor;
    this.leafBasecolor = leafBasecolor;

    this.positions = [];
    this.indices = [];
    this.uvs = [];
    this.cnt = 0; // 叶子计数器
    this.ndx = 0; // indices下标
    this.z_axis = new THREE.Vector3(0, 0, 1); // 世界坐标下的z轴
  }

  addConvex(convex) {
    this.convex = convex;
  }

  clear() {
    this.positions = [];
    this.indices = [];
    this.uvs = [];
    this.cnt = 0; // 叶子计数器
    this.ndx = 0; // indices下标
  }

  renderPoint(x, y, z) {
    const { scene } = this;
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 3, 3),
      new THREE.MeshBasicMaterial({ color: "red" })
    );
    sphere.position.set(x, y, z);
    scene.add(sphere);
  }

  extractPoints(plane, axis, angle) {
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
  }

  toArray(vector) {
    return [vector.x, vector.y, vector.z];
  }

  makeSidePositions(prevPlanePoints, curPlanePoints) {
    const l = curPlanePoints.length;
    for (let i = 0; i < l; i++) {
      let j = (i + 1) % l;
      this.positions.push(
        ...this.toArray(curPlanePoints[i]),
        ...this.toArray(curPlanePoints[j]),
        ...this.toArray(prevPlanePoints[i]),
        ...this.toArray(prevPlanePoints[j])
      );
      this.uvs.push(0, 1, 1, 1, 0, 0, 1, 0);
      this.indices.push(
        this.ndx,
        this.ndx + 2,
        this.ndx + 1,
        this.ndx + 2,
        this.ndx + 3,
        this.ndx + 1
      );
      this.ndx += 4;
    }
  }

  makeTopPositions(curPlanePoints) {
    const l = curPlanePoints.length;
    for (let i = 0; i < l; i++) {
      this.positions.push(...this.toArray(curPlanePoints[i]));
    }
    this.uvs.push(1, 1, 0, 1, 0, 0, 1, 0);
    this.indices.push(
      this.ndx,
      this.ndx + 1,
      this.ndx + 2,
      this.ndx + 2,
      this.ndx + 3,
      this.ndx
    );
    this.ndx += 4;
  }

  getLeafPosition(points) {
    const l = points.length;
    const start = (l * 1) / 3,
      end = l;
    const basePosition = points[Math.floor(randomRangeLinear(start, end))];
    return new THREE.Vector3(
      basePosition.x + Math.random() * 5 - 2.5,
      basePosition.y + Math.random() * 5 - 1.5,
      basePosition.z + Math.random() * 5 - 2.5
    );
  }

  randomizeMatrix(points) {
    const position = this.getLeafPosition(points);
    const rotation = new THREE.Euler();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();

    const matrix = new THREE.Matrix4();

    rotation.x = Math.random() * 2 * Math.PI;
    rotation.y = Math.random() * 2 * Math.PI;
    rotation.z = Math.random() * 2 * Math.PI;

    quaternion.setFromEuler(rotation);

    scale.x = scale.y = scale.z = Math.random() + 5;

    matrix.compose(position, quaternion, scale);
    return matrix;
  }

  getCnt() {
    return this.cnt;
  }

  buildTreeRecursive(start, end, radius, depth, disturbRange) {
    if (depth > this.treeObj.depth) return;
    if (depth === this.treeObj.depth) disturbRange = 0;

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
    // this.scene.add(branch);

    const pointsLength = points.length;
    const segment = this.treeObj.segment; // 树干控制点的个数
    const offset = Math.floor(pointsLength / segment);
    let prevPlanePoints, curPlanePoints;
    let r = radius;

    if (depth === this.treeObj.depth) {
      const each = this.treeObj.leaves.each,
        total = this.treeObj.leaves.total;
      for (let i = 0; i < each; i++, this.cnt++) {
        if (this.cnt < total) {
          const matrix = this.randomizeMatrix(points);
          this.leaf.setMatrixAt(this.cnt, matrix);
        }
      }
    }
    // 获取一些枝干控制点
    for (let i = 0; i < pointsLength; i += offset) {
      const controlPoint = points[i];
      //   this.renderPoint(controlPoint.x, controlPoint.y, controlPoint.z);

      const tangent = new THREE.Vector3();
      curve.getTangent(i / (pointsLength - 1), tangent);
      const angle = tangent.angleTo(this.z_axis); // 弧度
      const cross = new THREE.Vector3(); // 叉乘得到的向量，作为旋转轴
      cross.crossVectors(this.z_axis, tangent).normalize();

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

      curPlanePoints = this.extractPoints(plane, cross, angle);
      // console.log(plane);
      if (prevPlanePoints) {
        this.makeSidePositions(prevPlanePoints, curPlanePoints);
      }
      prevPlanePoints = curPlanePoints;
    }
    this.makeTopPositions(curPlanePoints);

    const cur_node = this.treeObj.branches[depth],
      next_node = this.treeObj.branches[depth + 1];
    if (!next_node) return; // 剪了

    const fork_min = cur_node.fork.min,
      fork_max = cur_node.fork.max,
      // 考虑下一级
      branchLength = next_node.length;
    const branchNumber = next_node.number;
    for (let i = 0; i < branchNumber; i++) {
      const base = Math.floor(
        pointsLength * randomRangeLinear(fork_min, fork_max)
      );
      const tan_vector = new THREE.Vector3(),
        incre_vector = new THREE.Vector3().randomDirection();
      curve.getTangent(base / (pointsLength - 1), tan_vector);
      const dir_vector = new THREE.Vector3()
        .addVectors(tan_vector, incre_vector)
        .normalize();

      const s = points[base];
      let min_vector_length = branchLength.min,
        max_vector_length = branchLength.max;
      let end_point;
      if (this.convex) {
        const ray = new THREE.Raycaster(s, dir_vector);
        const target = ray.intersectObject(this.convex, false);
        console.log(target);
        // if (target.length === 0) return; // 直接剪枝剪掉算了
        end_point = target[0]?.point;
      }
      const e = end_point
        ? end_point
        : new THREE.Vector3().addVectors(
            s,
            dir_vector.multiplyScalar(
              randomRangeLinear(min_vector_length, max_vector_length)
            )
          );
      this.buildTreeRecursive(s, e, radius / 2, depth + 1, disturbRange);
    }
  }

  // only public method
  build() {
    const { treeObj, treeBasecolor, leafBasecolor, positions, uvs, indices } =
      this;

    const loader = new THREE.TextureLoader();
    // leaf texture
    const leafGeometry = new THREE.PlaneGeometry(1, 1, 1, 1);
    const leafTexture = loader.load(leafBasecolor);
    const leafMaterial = new THREE.MeshPhongMaterial({
      map: leafTexture,
      side: THREE.DoubleSide,
      alphaTest: 0.6,
    });
    // leaf是instancedMesh，递归函数要用
    this.leaf = new THREE.InstancedMesh(
      leafGeometry,
      leafMaterial,
      treeObj.leaves.total
    );
    const trunk = treeObj.branches[0];
    this.buildTreeRecursive(
      trunk.start,
      trunk.end,
      trunk.radius,
      0,
      treeObj.disturbRange
    );
    // trunk and branch texture
    const treeTexture = loader.load(treeBasecolor);
    const treeGeometry = new THREE.BufferGeometry();
    const treeMaterial = new THREE.MeshStandardMaterial({
      //   wireframe: true,
      //   color: "black",
      map: treeTexture,
      side: THREE.FrontSide,
    });

    const positionNumComponents = 3;
    const uvNumComponents = 2;
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

    const tree = new THREE.Mesh(treeGeometry, treeMaterial);
    const leaf = this.leaf;
    const group = new THREE.Group();
    group.add(tree, leaf);
    return group;
  }
}

export { TreeBuilder };
