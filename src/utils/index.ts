export type NodeInterface<K, V> = {
    key: K
    val: V
    size: number
    left: NodeInterface<K, V> | null
    right: NodeInterface<K, V> | null
}

class BSTNode<K, V> implements NodeInterface<K, V> {
    public key: K
    public val: V
    public size: number = 1
    public left: BSTNode<K, V> | null = null
    public right: BSTNode<K, V> | null = null
    public constructor(key: K, val: V) {
        this.key = key
        this.val = val
    }
}

type Node<K, V> = BSTNode<K, V> | null

export class BST<K, V> {
    public root: BSTNode<K, V> | null = null

    public put(key: K, val: V): void {
        this.root = this._put(this.root, key, val)
    }

    private _put(node: Node<K, V>, key: K, val: V): BSTNode<K, V> {
        if (node === null) return new BSTNode<K, V>(key, val)
        if (node.key > key) node.left = this._put(node.left, key, val)
        else if (node.key < key) node.right = this._put(node.right, key, val)
        else node.val = val
        node.size = this.size(node.left) + this.size(node.right) + 1
        return node
    }

    public get(key: K): V | null {
        return this._get(this.root, key)
    }

    private _get(node: Node<K, V>, key: K): V | null {
        if (node === null) return null
        if (node.key > key) return this._get(node.left, key)
        if (node.key < key) return this._get(node.right, key)
        return node.val
    }

    public min(): K | null {
        return this._getMinOrMaxKey('left')
    }

    public max(): K | null {
        return this._getMinOrMaxKey('right')
    }

    private _getMinOrMaxKey(leftTreeOrRightTree: 'left'| 'right'): K | null {
        if (this.root === null) return null
        return this._getMinOrMaxNode(this.root, leftTreeOrRightTree).key
    }

    private _getMinOrMaxNode<T extends Node<K, V>>(node: T, leftTreeOrRightTree: 'left'| 'right'): T {
        if (node![leftTreeOrRightTree] === null) return node
        return this._getMinOrMaxNode(node![leftTreeOrRightTree], leftTreeOrRightTree) as T
    }

    public floor(key: K): K | null {
        return this._getFloorOrCeil(key, (k, key) => k > key, 'left', 'right')
    }

    public ceil(key: K): K | null {
        return this._getFloorOrCeil(key, (k, key) => k < key, 'right', 'left')
    }

    private _getFloorOrCeil<T extends 'left' | 'right'>(key: K, isLessOrGreater: (k: K, key: K) => boolean, leftTree: T, rightTree: T): K | null {
        const node = this._getFloorOrCeilNode(this.root, key, isLessOrGreater, leftTree, rightTree)
        if (node === null) return null
        return node.key
    }

    private _getFloorOrCeilNode<T extends 'left' | 'right'>(
        node: Node<K, V>, key: K, isLessOrGreater: (k: K, key: K) => boolean, leftTree: T, rightTree: T
    ): Node<K, V> {
        if (node === null) return null
        if (node.key === key) return node
        if (isLessOrGreater(node.key, key)) return this._getFloorOrCeilNode(node[leftTree], key, isLessOrGreater, leftTree, rightTree)
        const t = this._getFloorOrCeilNode(node[rightTree], key, isLessOrGreater, leftTree, rightTree)
        if (t !== null) return t
        return node
    }

    public select(rank: number): K | null {
        return this._select(this.root, rank)
    }

    private _select(node: Node<K, V>, rank: number): K | null {
        if (node === null) return null
        const leftTreeSize = this.size(node.left)
        if (leftTreeSize > rank) return this._select(node.left, rank)
        if (leftTreeSize < rank) return this._select(node.right, rank - leftTreeSize - 1)
        return node.key
    }

    public rank(key: K): number {
        return this._rank(this.root, key)
    }

    private _rank(node: Node<K, V>, key: K): number {
        if (node === null) return 0
        if (node.key > key) return this._rank(node.left, key)
        if (node.key < key) return 1 + this.size(node.left) + this._rank(node.right, key)
        return this.size(node.left)
    }

    public deleteMin(): void {
        this.root = this._deleteMinOrMaxNode(this.root, 'left', 'right')
    }

    public deleteMax(): void {
        this.root = this._deleteMinOrMaxNode(this.root, 'right', 'left')
    }

    private _deleteMinOrMaxNode<T extends 'left' | 'right'>(node: Node<K, V>, leftTree: T, rightTree: T): Node<K, V> {
        if (node![leftTree] === null) return node![rightTree]
        node![leftTree] = this._deleteMinOrMaxNode(node![leftTree], leftTree, rightTree)
        node!.size = this.size(node!.left) + this.size(node!.right) + 1
        return node
    }

    public delete(key: K): void {
        this.root = this._delete(this.root, key)
    }

    private _delete(node: Node<K, V>, key: K): Node<K, V> {
        if (node === null) return null
        if (node!.key > key) node!.left = this._delete(node!.left, key)
        else if (node!.key < key) node!.right = this._delete(node!.right, key)
        else {
            if (node!.right === null) return node!.left
            if (node!.left === null) return node!.right
            const t = node
            node = this._getMinOrMaxNode(node.right, 'left')
            node!.right = this._deleteMinOrMaxNode(t!.right, 'left', 'right')
            node!.left = t!.left
        }
        node!.size = this.size(node!.left) + this.size(node!.right) + 1
        return node
    }

    public keys(): Array<K> {
        return this.range(this.min()!, this.max()!)
    }

    public rangeKeys(low: K, high: K): Array<K> {
        return this.range(low, high)
    }

    private range(low: K, high: K): Array<K> {
        if (this.root === null) return []
        return this._keys(low, high)
    }

    private _keys(low: K, high: K): Array<K> {
        const solve = [] as Array<K>
        this._collect(this.root, low, high, solve)
        return solve
    }

    private _collect(node: Node<K, V>, low: K, high: K, solve: Array<K>): void {
        if (node === null) return
        if (low < node!.key) this._collect(node.left, low, high, solve)
        if (low <= node!.key && high >= node!.key) solve.push(node!.key)
        if (high > node!.key) this._collect(node.right, low, high, solve)
    }

    private size(node: Node<K, V>) {
        if (node === null) return 0
        return node.size
    }
}
