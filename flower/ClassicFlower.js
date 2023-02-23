import * as THREE from "three";
/*************************************************************************************
 * CLASS NAME:  ClassicFlower
 * DESCRIPTION: Generate classic flower mesh.
 * NOTE:
 *
 *************************************************************************************/
class ClassicFlower {
  constructor(side, foldDegree) {
    this.side = side;
    this.foldDegree = foldDegree;
  }
  generate() {
    const { side, foldDegree } = this;
    // to be changed...
    const geometry = new THREE.BufferGeometry();
    const vertices = [
      -width / 2,
      0,
      0,
      width / 2,
      0,
      0,
      width / 2,
      height,
      0,
      -width / 2,
      height,
      0,
    ];
    const uvs = [0, 0, 1, 0, 1, 1, 0, 1];
    const normals = [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0];
    const indices = [0, 1, 2, 2, 3, 0];
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(vertices), 3)
    );
    geometry.setAttribute(
      "normal",
      new THREE.BufferAttribute(new Float32Array(normals), 3)
    );
    geometry.setAttribute(
      "uv",
      new THREE.BufferAttribute(new Float32Array(uvs), 2)
    );
    geometry.setIndex(indices);

    return geometry;
  }
}

export { ClassicLeaf };
