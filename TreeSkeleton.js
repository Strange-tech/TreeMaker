class TreeSkeleton {
  constructor(array) {
    this.content = /*array?.map((el) => el.ceil())*/ array;
    this.children = [];
  }
  add(child) {
    this.children.push(child);
  }
  setTreeObj(treeObj) {
    this.treeObj = treeObj;
  }
}
export { TreeSkeleton };
