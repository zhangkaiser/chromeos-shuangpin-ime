
/**
 * @fileoverview Datastructure: Heap.
 *
 * This file provides the implementation of a Heap datastructure. Smaller keys
 * rise to the top.
 *
 * The big-O notation for all operations are below:
 * <pre>
 *  Method          big-O
 * ----------------------------------------------------------------------------
 * - insert         O(logn)
 * - remove         O(logn)
 * - peek           O(1)
 * - contains       O(n)
 * </pre>
 */

/**
 * A generic immutable node. This can be used in various collections that
 *  require a node object for its item (such as a heap).
 */
export class Node<T, V> {
  constructor(
  /** The key */ private _key: T,
  /** The value */ private _value: V) { }

  /**
   * Gets the key.*/
  getKey() {
      return this._key;
  }

  /**
   * Gets the value.
   */
  getValue() {
      return this._value;
  }

  clone() {
      return new Node(this._key, this._value);
  }
}


/**
 * Class for a Heap datastructure.
 */
export class Heap {
  
  /** The nodes of the heap; */
  private _nodes:Node<any, any>[] = [];
  constructor(
    /** Heap od Object to initialize heap with. */ heap?:Heap | Object) {   
    if (heap) {
      this.insertAll(heap);
    }
  }

  /**
   * Insert the given value into the heap with the given key. 
   */
  insert(key: any, value: any) {
    let node = new Node(key, value);
    let nodes = this._nodes;
    nodes.push(node);
    this.#moveUp(nodes.length - 1);
  }

  /**
   * Increases the given value in the heap with the given key.
   */
  increase(key: any, value: any) {
    let index = this._nodes.findIndex(node => node.getValue() == value);

    if (index < 0) {
      this.insert(key, value)
    } else {
      let oldKey = this._nodes[index].getKey();
      if (key > oldKey) {
        this._nodes[index] = new Node(key, value);
        this.#moveDown(index);
      }
    }
  }

  /**
   * Decreases the given value in the heap with the given key.
   */
  decrease(key: any, value: any) {
    let index = this._nodes.findIndex(node => node.getValue() == value);

    if (index < 0) {
      this.insert(key, value);
    } else {
      let oldKey = this._nodes[index].getKey();
      if (key < oldKey) {
        this._nodes[index] = new Node(key, value);
        this.#moveUp(index);
      }
    }
  }

  /**
   * Sets the given value in the heap with the given key.
   */
  set(key: any, value: any) {
    let index = this._nodes.findIndex(node => node.getValue() == value);

    if (index < 0) {
      this.insert(key, value)
    } else {
      let oldKey =this._nodes[index].getKey();
      
      this._nodes[index] = new Node(key, value);
      if (key < oldKey) {
        this.#moveUp(index);
      } else {
        this.#moveDown(index);
      }
    }
  }

  /**
   * Adds multiple key-value pairs from another Heap or Object
   * @param {Heap|Object} heap Object containing the data to add.
   */
  insertAll(heap: Heap| Object) {
      let keys, values;

      if (heap instanceof Heap) {
          
          keys = heap.getKeys();
          values = heap.getValues();
          // If it is a heap and the current heap is empty, I can realy on the fact
          // that the keys/values are in the correct order to put in the underlying
          // structure.
          if (heap.size <= 0) {
              let nodes = this._nodes;
              for (let i = 0; i < keys.length; i++) {
                  nodes.push(new Node(keys[i], values[i]))
              }
              return ;
          }
      } else {
          keys = Object.keys(heap);
          values = Object.values(heap);
      }
      
      for (let i = 0; i < keys.length; i++) {
          this.insert(keys[i], values[i]);
      }
  }

  /**
   * Retrieves and removes the root value of this heap.
   * @return The value removed from the root of the heap. Returns undefined
   * if the heap is empty.
   */
  remove() {
      let nodes = this._nodes;
      let count = nodes.length;
      let rootNode = nodes[0];
      if (count <= 0) {
        return undefined;
      } else if (count == 1) {
        // TODO!error  
        nodes.splice(0, count);
      } else {
          nodes[0] = nodes.pop()!;
          this.#moveDown(0);
      }
      // console.log(rootNode);
      return rootNode.getValue();
  }

  /**
   * Retrieves but does not remove the root value of this heap.
   * @return The value at the root of the heap. Returns undefined if the
   *  heap is empty.
   */
  peek() {
      let nodes = this._nodes;
      if (nodes.length == 0) {
          return undefined;
      }
      return nodes[0].getValue();
  }

  /**
   * Retrieves but does not remove the key of the root node of this heap.
   * @return {*} The key at the root of the heap. Returns undefined if the heap
   *  is empty.
   */
  peekKey() {
      return this._nodes[0] && this._nodes[0].getKey();
  }

  /**
   * Moves the node at the given index down to its proper place in the heap.
   * @param {number} index The index of the node to move down.
   * @private
   */
  #moveDown(index: number) {
      let nodes = this._nodes;
      let count = nodes.length;

      // Save the node being moved down.
      let node = nodes[index];
      // While the current node has a child.
      while (index < (count >> 1)) {
          let leftChildIndex = this.#getLeftChildIndex(index);
          let rightChildIndex = this.#getRightChildIndex(index);

          // Determine the index of the smaller child.
          let smallerChildIndex = rightChildIndex < count && 
              nodes[rightChildIndex].getKey() < nodes[leftChildIndex].getKey() ?
              rightChildIndex : leftChildIndex;

          // If the node being moved down is smaller than its children, the node
          // has found the correct index it should be at.
          if (nodes[smallerChildIndex].getKey() > node.getKey()) {
              break;
          }

          // If not, then take the smaller child as the current node.
          nodes[index] = nodes[smallerChildIndex];
          index = smallerChildIndex;
      }

      nodes[index] = node;
  }
  

  /**
   * Moves the node at the given index up to its proper place in the heap.
   * @param {number} index The index of the node to move up.
   * @private 
   */
  #moveUp(index: number) {
      let nodes = this._nodes;
      let node = nodes[index];

      // While the node being moved up is not at the root.
      while (index > 0) {
          // If the parent is less than the node being moved up, move the parent down.
          let parentIndex = this.#getParentIndex(index);
          if (nodes[parentIndex].getKey() > node.getKey()) {
              nodes[index] = nodes[parentIndex];
              index = parentIndex;
          } else {
              break;
          }
      }
      nodes[index] = node;
  }

  /**
   * Gets the index of the left child of the node at the given index.
   * 
   * @param {number} index
   * @return {number} The index of the left child.
   * @private 
   */
  #getLeftChildIndex(index: number) {
      return index * 2 + 1;
  }

  /**
   * Gets the index of the right child of the node at the given index.
   * @param {number} index The index of the node to get the right child for.
   * @return {number} The index of the right child.
   * @private
   */
  #getRightChildIndex(index: number) {
      return index * 2 + 2;
  }

  /**
   * Gets the index of the parent of the node at the given index.
   * @param {number} index The index of the node to get the parent for.
   * @return {number} The index of the parent.
   * @private
   */
  #getParentIndex(index: number) {
      return (index - 1) >> 1;
  }

  /**
   * Gets the keys of the heap.
   * @return {Array} The keys in the heap.
   */
  getKeys() {
      let nodes = this._nodes;
      let rv = [];
      let l = nodes.length

      for (let i = 0; i < l; i++) {
          rv.push(nodes[i].getKey());
      }
      return rv;
  }

  /**
   * Gets the values of the heap.
   * @return {Array} The values in the heap.
   */
  getValues() {
      let nodes = this._nodes;
      let rv = [];
      let l = nodes.length;
      for (let i = 0; i < l; i++) {
          rv.push(nodes[i].getValue());
      }
      return rv;
  }

  /**
   * Whether the heap contains the given value.
   * @param {Object} val The value to check for.
   * @return {boolean} Whether the heap contains the value. 
   */
  containsValue(val: object) {
      return this._nodes.some(node => node.getValue() == val);
  }

  /**
   * Whether the heap contains the given key.
   * @return {boolean} Whether the heap contains the key.
   * 
   */
  containsKey(key: any) {
      return this._nodes.some(node => node.getKey() == key);
  }


  /**
   * Clones a heap and returns a new heap.
   * @return {Heap} A new Heap with the same key-value pairs.
   */
  clone() {
      return new Heap(this);
  }

  /**
   * The number of key-value pairs in the map.
   * @return {number} The number of pairs.
   */
  get size() {
      return this._nodes.length;
  }

  /**
   * Returns true if this heap contains no elements.
   * @return {boolean} Whether this heap contains no elements.
   */
  isEmpty() {
      return this._nodes.length == 0;
  }

  /**
   * Removes all elements from the heap.
   */
  clear() {
      this._nodes = [];
  }
}