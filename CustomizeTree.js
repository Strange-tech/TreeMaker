import * as THREE from "three";
/*************************************************************************************
 * CLASS NAME:  CustomizeTree
 * DESCRIPTION: 整合各种treeObj
 * NOTE:
 *
 *************************************************************************************/
class CustomizeTree {
  constructor() {
    this.indices = new Map([
      ["法国梧桐", 0],
      ["桂花", 1],
      ["国槐", 2],
      ["果石榴", 3],
      ["海棠", 4],
      ["红枫", 5],
      ["红果冬青", 6],
      ["鸡蛋花", 7],
      ["柳树", 8],
    ]);
    this.content = [
      {
        name: "法国梧桐",
        treeBasecolor: "resources/images/Tree_Basecolor.png",
        leafBasecolor: "resources/images/Tree10_leaf_Basecolor.png",
        depth: 4,
        disturb: 0.1,
        gravity: 0,
        shrink: { single: 0.95, multi: 0.6, root: true },
        segment: 2,
        angle: Math.PI / 4,
        leaves: {
          geometry: { style: "folded", width: 1, height: 2, foldDegree: 0.3 },
          scale: 20,
          total: 324,
          each: 2,
        },
        branches: [
          // root node
          {
            start: new THREE.Vector3(0, 0, 0),
            end: new THREE.Vector3(0, 20, 0),
            radius: 4,
            fork: { min: 0.4, max: 0.9 },
          },
          // middle node
          {
            number: 6,
            length: { min: 50, max: 60 },
            fork: { min: 0.5, max: 1 },
          },
          {
            number: 3,
            length: { min: 45, max: 55 },
            fork: { min: 0.5, max: 1 },
          },
          {
            number: 3,
            length: { min: 20, max: 30 },
            fork: { min: 0.5, max: 1 },
          },
          // leaf node
          {
            number: 3,
            length: { min: 5, max: 10 },
          },
        ],
      },
      {
        name: "桂花",
        treeBasecolor: "resources/images/Guihua_tree.jpg",
        leafBasecolor: "resources/images/Guihua_leaves.png",
        depth: 4,
        disturb: 0.05,
        gravity: 0,
        shrink: { single: 0.8, multi: 0.5, root: true },
        segment: 2,
        angle: Math.PI / 4,
        leaves: {
          geometry: { style: "folded", width: 1, height: 1, foldDegree: 0.3 },
          scale: 10,
          total: 2250,
          each: 5,
        },
        branches: [
          // root node
          {
            start: new THREE.Vector3(0, 0, 0),
            end: new THREE.Vector3(0, 100, 0),
            radius: 3,
            fork: { min: 0.2, max: 0.9 },
          },
          // middle node
          {
            number: 10,
            length: { min: 50, max: 60 },
            fork: { min: 0.3, max: 0.9 },
          },
          {
            number: 5,
            length: { min: 45, max: 55 },
            fork: { min: 0.1, max: 0.9 },
          },
          {
            number: 3,
            length: { min: 20, max: 30 },
            fork: { min: 0.7, max: 0.9 },
          },
          // leaf node
          {
            number: 3,
            length: { min: 5, max: 10 },
          },
        ],
      },
      {
        name: "国槐",
        treeBasecolor: "resources/images/Guohuai_tree.jpg",
        leafBasecolor: "resources/images/Guohuai_leaves.png",
        depth: 5,
        disturb: 0.02,
        gravity: 2,
        shrink: { single: 0.9, multi: 0.5, root: true },
        segment: 2,
        angle: Math.PI / 3,
        leaves: {
          geometry: { style: "folded", width: 1, height: 1, foldDegree: 0.3 },
          scale: 4,
          total: 4860,
          each: 5,
        },
        branches: [
          // root node
          {
            start: new THREE.Vector3(0, 0, 0),
            end: new THREE.Vector3(0, 60, 0),
            radius: 3,
            fork: { min: 0.8, max: 1 },
          },
          // middle node
          {
            number: 6,
            length: { min: 25, max: 40 },
            fork: { min: 0.8, max: 1 },
          },
          {
            number: 3,
            length: { min: 20, max: 25 },
            fork: { min: 0.7, max: 0.9 },
          },
          {
            number: 3,
            length: { min: 20, max: 30 },
            fork: { min: 0.3, max: 0.9 },
          },
          {
            number: 3,
            length: { min: 10, max: 15 },
            fork: { min: 0.8, max: 0.9 },
          },
          // leaf node
          {
            number: 6,
            length: { min: 5, max: 10 },
          },
        ],
      },
      {
        name: "果石榴",
        depth: 4,
        disturb: 0.07,
        gravity: 0,
        shrink: { single: 0.7, multi: 0.45, root: true },
        segment: 5,
        angle: Math.PI / 3,
        leaves: {
          total: 3240,
          each: 20,
        },
        branches: [
          // root node
          {
            start: new THREE.Vector3(0, 0, 0),
            end: new THREE.Vector3(0, 100, 0),
            radius: 3,
            fork: { min: 0.2, max: 0.5 },
          },
          // middle node
          {
            number: 6,
            length: { min: 50, max: 60 },
            fork: { min: 0.1, max: 0.9 },
          },
          {
            number: 3,
            length: { min: 45, max: 55 },
            fork: { min: 0.1, max: 0.9 },
          },
          {
            number: 5,
            length: { min: 20, max: 30 },
            fork: { min: 0.1, max: 0.9 },
          },
          // leaf node
          {
            number: 3,
            length: { min: 5, max: 10 },
          },
        ],
      },
      {
        name: "海棠",
        depth: 4,
        disturb: 0.15,
        gravity: 0,
        shrink: { single: 0.85, multi: 0.45, root: true },
        segment: 10,
        angle: Math.PI / 2,
        leaves: {
          total: 3240,
          each: 20,
        },
        branches: [
          // root node
          {
            start: new THREE.Vector3(0, 0, 0),
            end: new THREE.Vector3(0, 100, 0),
            radius: 3,
            fork: { min: 0.2, max: 0.8 },
          },
          // middle node
          {
            number: 6,
            length: { min: 50, max: 60 },
            fork: { min: 0.1, max: 0.8 },
          },
          {
            number: 3,
            length: { min: 45, max: 55 },
            fork: { min: 0.1, max: 0.9 },
          },
          {
            number: 3,
            length: { min: 20, max: 30 },
            fork: { min: 0.1, max: 0.9 },
          },
          // leaf node
          {
            number: 3,
            length: { min: 5, max: 10 },
          },
        ],
      },
      {
        name: "红枫",
        treeBasecolor: "resources/images/Guihua_tree.jpg",
        leafBasecolor: "resources/images/Hongfeng_leaves.png",
        depth: 4,
        disturb: 0.05,
        gravity: -2,
        shrink: { single: 0.85, multi: 0.45, root: true },
        segment: 10,
        angle: Math.PI / 4,
        leaves: {
          geometry: { style: "classic", width: 1, height: 1, foldDegree: 0 },
          scale: 2,
          total: 3240,
          each: 10,
        },
        branches: [
          // root node
          {
            start: new THREE.Vector3(0, 0, 0),
            end: new THREE.Vector3(0, 40, 0),
            radius: 1.5,
            fork: { min: 0.4, max: 0.8 },
          },
          // middle node
          {
            number: 5,
            length: { min: 5, max: 10 },
            fork: { min: 0.8, max: 0.9 },
          },
          {
            number: 3,
            length: { min: 5, max: 10 },
            fork: { min: 0.7, max: 0.9 },
          },
          {
            number: 6,
            length: { min: 10, max: 15 },
            fork: { min: 0.4, max: 0.9 },
          },
          // leaf node
          {
            number: 3,
            length: { min: 5, max: 10 },
          },
        ],
      },
      {
        name: "红果冬青",
        depth: 4,
        disturb: 0.1,
        gravity: 3,
        shrink: { single: 0.9, multi: 0.45, root: true },
        segment: 10,
        angle: Math.PI / 4,
        leaves: {
          total: 3240,
          each: 20,
        },
        branches: [
          // root node
          {
            start: new THREE.Vector3(0, 0, 0),
            end: new THREE.Vector3(0, 20, 0),
            radius: 1.5,
            fork: { min: 0.8, max: 1 },
          },
          // middle node
          {
            number: 5,
            length: { min: 5, max: 10 },
            fork: { min: 0.8, max: 0.9 },
          },
          {
            number: 3,
            length: { min: 20, max: 25 },
            fork: { min: 0.1, max: 0.6 },
          },
          {
            number: 3,
            length: { min: 10, max: 15 },
            fork: { min: 0.1, max: 0.6 },
          },
          // leaf node
          {
            number: 3,
            length: { min: 5, max: 10 },
          },
        ],
      },
      {
        name: "鸡蛋花",
        depth: 6,
        disturb: 0.05,
        gravity: -4,
        shrink: { single: 0.9, multi: 0.4, root: true },
        segment: 10,
        angle: Math.PI / 3,
        geometry: "sphere",
        leaves: {
          total: 3240,
          each: 20,
        },
        branches: [
          // root node
          {
            start: new THREE.Vector3(0, 0, 0),
            end: new THREE.Vector3(0, 10, 0),
            radius: 1,
            fork: { min: 0.8, max: 1 },
          },
          // middle node
          {
            number: 6,
            length: { min: 5, max: 10 },
            fork: { min: 0.8, max: 1 },
          },
          {
            number: 2,
            length: { min: 5, max: 8 },
            fork: { min: 0.8, max: 1 },
          },
          {
            number: 2,
            length: { min: 5, max: 8 },
            fork: { min: 0.1, max: 0.6 },
          },
          {
            number: 2,
            length: { min: 5, max: 8 },
            fork: { min: 0.1, max: 0.6 },
          },
          {
            number: 2,
            length: { min: 5, max: 8 },
            fork: { min: 0.1, max: 0.6 },
          },
          // leaf node
          {
            number: 2,
            length: { min: 5, max: 7 },
          },
        ],
      },
      {
        name: "柳树",
        depth: 4,
        disturb: 0.1,
        gravity: 5,
        shrink: { single: 0.95, multi: 0.3, root: true },
        segment: 15,
        angle: Math.PI / 3,
        leaves: {
          total: 3240,
          each: 20,
        },
        branches: [
          // root node
          {
            start: new THREE.Vector3(0, 0, 0),
            end: new THREE.Vector3(0, 20, 0),
            radius: 2,
            fork: { min: 0.5, max: 0.8 },
          },
          // middle node
          {
            number: 6,
            length: { min: 10, max: 15 },
            fork: { min: 0.5, max: 0.8 },
          },
          {
            number: 4,
            length: { min: 5, max: 8 },
            fork: { min: 0.8, max: 1 },
          },
          {
            number: 4,
            length: { min: 10, max: 20 },
            fork: { min: 0.1, max: 0.8 },
          },
          // leaf node
          {
            number: 4,
            length: { min: 0.5, max: 1 },
          },
        ],
      },
    ];
  }

  getTree(name) {
    const { indices, content } = this;
    const id = indices.get(name);
    return content[id];
  }
}

export { CustomizeTree };
