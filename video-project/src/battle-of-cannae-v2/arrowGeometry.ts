import * as THREE from 'three';

/**
 * Pure geometry for the flat "war arrow" compositor.
 *
 * Every layer is built from one shared set of curve samples, so outline, fill,
 * sheen and head can never drift apart. Elevation is injected as a sampler so
 * this module stays testable without React, Remotion or a terrain mesh.
 */

/** Arrow ribbons ride this far above the height field. */
export const HOVER = 0.3;

/** Samples per ribbon. 64 keeps tight flank arcs smooth without costing much. */
export const SAMPLES = 64;

/** Shadow offset, thrown away from the key light at [72, 118, 48]. */
export const SHADOW_DX = -0.45;
export const SHADOW_DZ = -0.3;

export interface CurveSample {
  pos: THREE.Vector3;
  tan: THREE.Vector3;
  /** unit normal in the XZ plane, perpendicular to the tangent */
  nx: number;
  nz: number;
  /** 0 at the tail, 1 at the head */
  t: number;
}

export type ElevationSampler = (x: number, z: number) => number;

/**
 * Sample the curve once, so every layer shares identical geometry.
 * `progress` is clamped below 1 so the tangent never degenerates.
 */
export const sampleCurve = (
  curve: THREE.CatmullRomCurve3,
  progress: number,
): CurveSample[] => {
  const out: CurveSample[] = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const t = (progress * i) / SAMPLES;
    const tt = Math.min(t, 0.999);
    const pos = curve.getPointAt(tt);
    const tan = curve.getTangentAt(tt).normalize();
    const nx = -tan.z;
    const nz = tan.x;
    const len = Math.hypot(nx, nz) || 1;
    out.push({
      pos,
      tan,
      nx: nx / len,
      nz: nz / len,
      t: i / SAMPLES,
    });
  }
  return out;
};

/** Launched brush-stroke taper: narrow tail, full width before the head. */
export const taperAt = (t: number): number =>
  0.45 + 0.55 * Math.min(1, t * 2.2);

export const buildRibbon = (
  samples: CurveSample[],
  width: number,
  yLift: number,
  elevation: ElevationSampler,
  offsetX = 0,
  offsetZ = 0,
): THREE.BufferGeometry => {
  const left: THREE.Vector3[] = [];
  const right: THREE.Vector3[] = [];
  const n = samples.length;

  samples.forEach((s, i) => {
    const half = (width / 2) * taperAt(i / Math.max(1, n - 1));
    const lx = s.pos.x + s.nx * half + offsetX;
    const lz = s.pos.z + s.nz * half + offsetZ;
    const rx = s.pos.x - s.nx * half + offsetX;
    const rz = s.pos.z - s.nz * half + offsetZ;
    left.push(new THREE.Vector3(lx, elevation(lx, lz) + HOVER + yLift, lz));
    right.push(new THREE.Vector3(rx, elevation(rx, rz) + HOVER + yLift, rz));
  });

  const pos: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    const l0 = left[i];
    const l1 = left[i + 1];
    const r0 = right[i];
    const r1 = right[i + 1];
    pos.push(l0.x, l0.y, l0.z, r0.x, r0.y, r0.z, l1.x, l1.y, l1.z);
    pos.push(r0.x, r0.y, r0.z, r1.x, r1.y, r1.z, l1.x, l1.y, l1.z);
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
};

/** Dims of the chevron, derived from the ribbon width. */
export const headMetrics = (width: number) => ({
  headWidth: width * 2.4,
  headLength: width * 2.2,
});

/**
 * Four-point chevron: tip, left barb, rear notch, right barb.
 * The notch sits on the curve so the head welds to the ribbon instead of
 * reading as a loose triangle, and the tip extends past the curve end.
 */
export const buildHead = (
  samples: CurveSample[],
  width: number,
  yLift: number,
  elevation: ElevationSampler,
): THREE.BufferGeometry => {
  const s = samples[samples.length - 1];
  const {headWidth, headLength} = headMetrics(width);

  const backX = s.pos.x - s.tan.x * headLength;
  const backZ = s.pos.z - s.tan.z * headLength;
  const notchX = backX + s.tan.x * headLength * 0.34;
  const notchZ = backZ + s.tan.z * headLength * 0.34;
  const tipX = s.pos.x + s.tan.x * headLength * 0.24;
  const tipZ = s.pos.z + s.tan.z * headLength * 0.24;
  const lx = backX + s.nx * (headWidth / 2);
  const lz = backZ + s.nz * (headWidth / 2);
  const rx = backX - s.nx * (headWidth / 2);
  const rz = backZ - s.nz * (headWidth / 2);

  const y = (x: number, z: number) => elevation(x, z) + HOVER + yLift;

  const g = new THREE.BufferGeometry();
  g.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(
      [
        tipX, y(tipX, tipZ), tipZ,
        lx, y(lx, lz), lz,
        notchX, y(notchX, notchZ), notchZ,
        tipX, y(tipX, tipZ), tipZ,
        notchX, y(notchX, notchZ), notchZ,
        rx, y(rx, rz), rz,
      ],
      3,
    ),
  );
  g.computeVertexNormals();
  return g;
};
