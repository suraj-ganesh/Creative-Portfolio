# Fix for Temporal Dead Zone Error in Globe FX

## Problem
The production build was failing with "Uncaught ReferenceError: Cannot access 'v' before initialization" - a Temporal Dead Zone (TDZ) error. This occurred because:

1. The `fibSphere` function was defined at module level in `src/lib/fx/globe.ts`
2. This function referenced `THREE.Vector3` as a value (e.g., `new THREE.Vector3(...)`)
3. However, we only had a type-only import: `import type * as THREE from "three";`
4. At module evaluation time, THREE was not available as a value, causing a ReferenceError when the function was defined
5. Turbopack's production scope-hoisting exacerbated this by changing evaluation order

## Solution
Moved the `fibSphere` function from module level to inside `initGlobeReal`, right before its usage, after we've successfully awaited the three.js module:

### Changes Made
1. **Removed** module-level `fibSphere` function (lines 65-75 in original)
2. **Added** `fibSphere` function definition inside `initGlobeReal` at line 719, right before its usage:
   ```typescript
   if (items.length) {
     function fibSphere(count: number): THREE.Vector3[] {
       const pts: THREE.Vector3[] = [];
       const golden = Math.PI * (3 - Math.sqrt(5));
       for (let i = 0; i < count; i++) {
         const y = 1 - (i / (count - 1)) * 2;
         const r = Math.sqrt(Math.max(0, 1 - y * y));
         const a = golden * i;
         pts.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
       }
       return pts;
     }
     const dirs = fibSphere(Math.ceil(2.5 * items.length))
       .filter((v) => Math.abs(v.y) < 0.55)
       .slice(0, items.length);
   ```

## Why This Works
- The function is now only defined when `initGlobeReal` is called
- At that point, we've already awaited `loadThree()` and have the THREE object available (lines 87-88)
- The function definition has access to THREE in its lexical scope
- This follows the same proven pattern used in `src/lib/fx/theme-liquid.ts`

## Verification
- All other THREE usage in the file was already properly scoped within functions called after the async load
- Type information is preserved via `import type * as THREE from "three";`
- The fix maintains identical functionality while resolving the TDZ error