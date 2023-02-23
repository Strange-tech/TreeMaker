import * as THREE from "three";
/*************************************************************************************
 * CLASS NAME:  Leaf
 * DESCRIPTION: Generate leaf mesh: folded or classic.
 * NOTE:
 *
 *************************************************************************************/
class Leaf {
  constructor(style, width, height, foldDegree = 0) {
    this.style = style;
    this.width = width;
    this.height = height;
    this.foldDegree = foldDegree;
  }

  generate() {
    const { style } = this;
    if (style === "folded") return this.generateFolded();
    else if (style === "classic") return this.generateClassic();
  }

  generateFolded() {
    const { width, height, foldDegree } = this;
    // to be changed...
    const geometry = new THREE.BufferGeometry();
    let x = width / 2,
      y = height,
      z = width * foldDegree;
    const vertices = [-x, 0, z, 0, 0, 0, x, 0, z, x, y, z, 0, y, 0, -x, y, z];
    const uvs = [0, 0, 0.5, 0, 1, 0, 1, 1, 0.5, 1, 0, 1];
    const normals = [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0];
    const indices = [0, 1, 4, 4, 5, 0, 1, 2, 3, 3, 4, 1];
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

  generateClassic() {
    const { width, height } = this;
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
export { Leaf };
