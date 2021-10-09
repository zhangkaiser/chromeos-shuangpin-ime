
/**
 * The binary search
 * O(log n)
 */
export function binarySearch(arr: any[], compareFn: (a: any, b: any) => number, target: any) {
  let left = 0; // inclusive;
  let right = arr.length; // exclusive;
  let found;
  while(left < right) {
    let middle = left + ((right - left) >>> 1);
    // NOTE(dimvar): To avoid this cast, we'd have to use function overloading
    // for the type of binarySearch_, which the type system can't express yet.
    let compareResult = compareFn(target, arr[middle]);
    
    if (compareResult > 0) {
      left = middle + 1;
    } else {
      right = middle;
      // We are looking for the lowest index so we can't return immediately.
      found = !compareResult;
    }
  }
  // left is the index if found, or the insertion point otherwise.
  // Avoiding bitwise not operator, as that causes a loss in precision for array
  // indexes outside the bounds of a 32-bit signed integer.  Array indexes have
  // a maximum value of 2^32-2 https://tc39.es/ecma262/#array-index
  return found ? left : -left - 1;
}

export function defaultCompare(a: number, b: number) {
  return a > b ? 1 : a < b ? -1 : 0
}


export function compare3(arr1: any[], arr2: any[]) {
    let l = arr1.length;
    for (let i = 0; i < l; i++) {
        let result = defaultCompare(arr1[i], arr2[i]);   
        if (result != 0) {
            return result;
        }
    }
    return defaultCompare(arr1.length, arr2.length);
}