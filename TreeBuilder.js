import * as THREE from "three";
import { randomRangeLinear, disturbedCurve } from "./utilities";
import { Leaf } from "./leaf/Leaf";
/*************************************************************************************
 * CLASS NAME:  TreeBuilder
 * DESCRIPTION: A novel tree editor & generator on the webpage.
 * NOTE:
 *
 *************************************************************************************/
class TreeBuilder {
  constructor(treeObj) {
    this.treeObj = treeObj;
    this.positions = [];
    this.indices = [];
    this.uvs = [];
    this.cnt = 0; // 叶子计数器
    this.ndx = 0; // indices下标
    this.z_axis = new THREE.Vector3(0, 0, 1); // 世界坐标下的z轴
    this.y_axis = new THREE.Vector3(0, 1, 0); // 世界坐标下的y轴
  }

  setTreeObj(treeObj) {
    this.treeObj = treeObj;
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

  makeSidePositions(prevPlanePoints, curPlanePoints, segmentId) {
    const l = curPlanePoints.length;
    let t = 1 / l,
      s = 1 / this.treeObj.segment,
      cur = s * segmentId,
      prev = s * (segmentId - 1);
    for (let i = 0; i < l; i++) {
      let j = (i + 1) % l;
      this.positions.push(
        ...this.toArray(curPlanePoints[i]),
        ...this.toArray(curPlanePoints[j]),
        ...this.toArray(prevPlanePoints[i]),
        ...this.toArray(prevPlanePoints[j])
      );
      // 每一小段长度是 1/segment
      this.uvs.push(
        t * i,
        cur,
        t * (i + 1),
        cur,
        t * i,
        prev,
        t * (i + 1),
        prev
      );
      // this.uvs.push(0, 1, 1, 1, 0, 0, 1, 0);
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

  randomizeMatrix(curve, points) {
    const l = points.length;
    const start = (l * 1) / 10,
      end = l;
    const base = Math.floor(randomRangeLinear(start, end));
    const basePosition = points[base];
    const tan_vector = new THREE.Vector3(),
      incre_vector = new THREE.Vector3().randomDirection();
    curve.getTangent(base / (l - 1), tan_vector);
    const dir_vector = new THREE.Vector3()
      .addVectors(tan_vector, incre_vector)
      .normalize();

    const rot_angle = this.y_axis.angleTo(dir_vector);
    const rot_axis = new THREE.Vector3()
      .crossVectors(this.y_axis, dir_vector)
      .normalize();

    const trans = new THREE.Matrix4().makeTranslation(
      basePosition.x,
      basePosition.y,
      basePosition.z
    );
    let s = this.treeObj.leaves.scale;
    const scl = new THREE.Matrix4().makeScale(s, s, s);

    const rot1 = new THREE.Matrix4().makeRotationY(Math.random() * 2 * Math.PI), // (0,2pi)
      rot2 = new THREE.Matrix4().makeRotationAxis(rot_axis, rot_angle);
    const rot = new THREE.Matrix4().multiply(rot2).multiply(rot1);
    const matrix = new THREE.Matrix4();
    matrix.multiply(trans).multiply(rot).multiply(scl);
    return matrix;
  }

  getCnt() {
    return this.cnt;
  }

  buildTreeRecursive(start, end, radius, depth, disturb) {
    if (depth > this.treeObj.depth) return;
    if (depth === this.treeObj.depth) disturb = 0;

    radius = radius <= 0.1 ? 0.1 : radius;

    const curve = disturbedCurve(start, end, disturb, this.treeObj.gravity);
    const points = curve.getPoints(50);
    // const branchGeometry = new THREE.BufferGeometry().setFromPoints(points);
    // const branchMaterial = new THREE.LineBasicMaterial({ color: "green" });
    // const branch = new THREE.Line(branchGeometry, branchMaterial);

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
          const matrix = this.randomizeMatrix(curve, points);
          this.leaf.setMatrixAt(this.cnt, matrix);
        }
      }
    }
    let segmentId = 0;
    // 获取一些枝干控制点
    for (let i = 0; i < pointsLength; i += offset) {
      const controlPoint = points[i];
      //   this.renderPoint(controlPoint.x, controlPoint.y, controlPoint.z);

      const tangent = new THREE.Vector3();
      curve.getTangent(i / (pointsLength - 1), tangent);
      const angle = tangent.angleTo(this.z_axis); // 弧度
      // 叉乘得到的向量，作为旋转轴
      const cross = new THREE.Vector3()
        .crossVectors(this.z_axis, tangent)
        .normalize();

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
      if (depth !== 0 || this.treeObj.shrink.root)
        r *= this.treeObj.shrink.single;

      curPlanePoints = this.extractPoints(plane, cross, angle);
      // console.log(plane);
      if (prevPlanePoints) {
        this.makeSidePositions(prevPlanePoints, curPlanePoints, segmentId);
      }
      segmentId++;
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
    let theta = this.treeObj.angle;

    let base = 0; /*Math.floor(pointsLength * randomRangeLinear(fork_min, fork_max))*/
    const tan_vector = new THREE.Vector3();
    curve.getTangent(0.5, tan_vector);
    let incre_vector, dir_vector;
    do {
      incre_vector = new THREE.Vector3()
        .randomDirection()
        .multiplyScalar(Math.sin(theta));
      dir_vector = new THREE.Vector3()
        .addVectors(tan_vector, incre_vector)
        .normalize();
    } while (tan_vector.angleTo(dir_vector) < theta / 2);
    for (let i = 0; i < branchNumber; i++) {
      base = Math.floor(pointsLength * randomRangeLinear(fork_min, fork_max));
      if (i > 0)
        dir_vector
          .applyAxisAngle(tan_vector, (2 * Math.PI) / branchNumber)
          .normalize();
      const s = points[base];
      let min_length = branchLength.min,
        max_length = branchLength.max;
      let end_point;
      if (this.convex && depth === this.treeObj.depth - 2) {
        const ray = new THREE.Raycaster(s, dir_vector);
        const target = ray.intersectObject(this.convex, false);
        console.log(target);
        // if (target.length === 0) return; // 直接剪枝剪掉算了
        if (target[0] /*&& target[0].distance <= max_length*/) {
          end_point = target[0].point;
        }
      }
      const e = end_point
        ? end_point
        : new THREE.Vector3().addVectors(
            s,
            dir_vector.multiplyScalar(randomRangeLinear(min_length, max_length))
          );
      this.buildTreeRecursive(
        s,
        e,
        radius * this.treeObj.shrink.multi,
        depth + 1,
        disturb
      );
    }
  }

  // only public method
  build() {
    const { treeObj, positions, uvs, indices } = this;

    const loader = new THREE.TextureLoader();
    const g = treeObj.leaves.geometry;
    const leafGeometry = new Leaf(
      g.style,
      g.width,
      g.height,
      g.foldDegree
    ).generate();
    // console.log(leafGeometry);
    const leafTexture = loader.load(treeObj.leafBasecolor);
    const leafMaterial = new THREE.MeshPhongMaterial({
      map: leafTexture,
      side: THREE.DoubleSide,
      alphaTest: 0.5,
      // color: "green",
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
      treeObj.disturb
    );
    // trunk and branch texture
    const treeTexture = loader.load(treeObj.treeBasecolor);
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
