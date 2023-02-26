# TreeMaker

## Abstract

### Key Words

- ThreeJs, webGL
- BufferGeometry, recursion, highly customized trees
- Computer Graphics

### How I Made It

1. Build tree skeleton by using CatmullRomCurve3
2. Add vertices to position attribute along the curve
3. Add uvs and normals to attributes
4. Attach leaves to branches by using simple PlaneGeometry and transformation matrix
5. Beautify, add more details and so on

## Introduciton

As in the title, this project has produced a tree generator, which is used to generate tree models in your broswer like Chrome and supports outputting to persistent storage of .json files 💿

users only need to specify the tree type, and the front end will automatically generate the corresponding tree model. At the same time, more fine-tuning parameters will be opened in the future for a higher degree of customization.

Within the specified parameter range, the program will add some random variation (such as branch disturbance), so that each constructed tree is "allomorphic".

This demo shows 100 trees that are randomly generated on the plane, and the types are "Sycamore, Osmanthus, Chinese Sophora, and Red Maple". I refer to the characteristics of trees in the real world, trying to simulate more realistic trees 🥸

The core of the program is a recursive function called buildTreeRecursive about building branches. This is a typical depth-first construction, but a breadth-first construction should also work. This function is encapsulated in the TreeBuilder class as one of its methods. TreeBuilder only needs to accept the characteristic information of a certain tree and build it.

How to express the characteristics of a single tree species in code? 🧐

Taking Sycamore as an example, its features are stored in objects in JS, expressed as follows:

```js
{
    name: "法国梧桐", // Sycamore
    treeBasecolor: "resources/images/Tree_Basecolor.png",
    leafBasecolor: "resources/images/Tree10_leaf_Basecolor.png",
    depth: 4,
    disturb: 0.1,
    gravity: 0,
    shrink: { single: 0.95, multi: 0.6, root: true },
    segment: 10,
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
```

## 简介

如题，本项目制作了一款树木生成器，用来在线生成树木模型，并支持输出到 json 文件持久化存储 💿

用户只需指定树木种类，前端就会自动生成对应的树木模型。同时，未来将开放更多的微调参数，以便更高度的定制化。

在指定的参数范围内，程序会添加某些随机变化量（如枝干扰动），这样构造出的每棵树木都是“同种异态”的。

demo 展现了平面上随机生成的 100 颗树木，种类分别为「法国梧桐, 桂花, 国槐, 红枫」。我参考了现实世界中的树木特征，力求模拟出更真实的树木 🥸

程序的核心是一个关于构建枝干的递归函数 buildTreeRecursive。这是典型的深度优先构建，但广度优先构建应当同样可以实现相同的功能。函数被封装在 TreeBuilder 类中，作为其中一个方法。TreeBuilder 只需接受某种树木的特征信息即可构建之。

如何用代码表达单种树木的特征？🧐

以法国梧桐为例，它的特征在 JS 中用对象存储，表示如下：

```js
{
    name: "法国梧桐", // 名称
    treeBasecolor: "resources/images/Tree_Basecolor.png", // 枝干贴图路径
    leafBasecolor: "resources/images/Tree10_leaf_Basecolor.png", // 叶子贴图路径
    depth: 4, // 递归深度，即分支层数
    disturb: 0.1, // 单颗枝干扰动因子，0.1表示偏移量占当前枝干长度的1/10
    gravity: 0, // 重力影响因子，正值表示枝干倾向于超下，负值反之
    shrink: { single: 0.95, multi: 0.6, root: true }, // 单枝、多枝的缩减因子，root表示主干是否受此参数影响
    segment: 10, // 段数
    angle: Math.PI / 4, // 下级枝干与上级枝干的夹角最大值
    leaves: {
        geometry: { style: "folded", width: 1, height: 2, foldDegree: 0.3 }, // 叶片几何体的风格、长、宽、折叠程度
        scale: 20, // 大小
        total: 324, // 总数
        each: 2, // 每根末梢枝干上的叶子数量
    },
    branches: [
        // root node
        {
        start: new THREE.Vector3(0, 0, 0), // 主干起始坐标
        end: new THREE.Vector3(0, 20, 0), // 主干末端坐标
        radius: 4, // 半径
        fork: { min: 0.4, max: 0.9 }, // 分叉位置（即下一级的生长位置），最低在当前的4/10处，最高在9/10处
        },
        // middle node
        {
        number: 6, // 中间枝干的数量
        length: { min: 50, max: 60 }, // 中间枝干的长度
        fork: { min: 0.5, max: 1 }, // 分叉位置
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
        number: 3, // 末梢枝干的数量
        length: { min: 5, max: 10 }, // 末梢枝干的长度
        },
    ],
},
```

Netlify link: [https://tree-editor.netlify.app/](https://tree-editor.netlify.app/)

## 走马观花

![总览](resources/images/md/2023-02-26%2019.47.00.png)
![局部1](resources/images/md/2023-02-26%2019.47.18.png)
![局部2](resources/images/md/2023-02-26%2019.48.02.png)
![局部3](resources/images/md/2023-02-26%2019.48.14.png)
