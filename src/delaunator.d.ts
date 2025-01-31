declare module 'delaunator' {
  export default class Delaunator<T extends ArrayLike<number>> {
    static from<T extends ArrayLike<number>>(points: T, getX?: (p: T) => number, getY?: (p: T) => number): Delaunator<T>;
    triangles: Uint32Array;
    halfedges: Int32Array;
    hull: Uint32Array;
  }
}
