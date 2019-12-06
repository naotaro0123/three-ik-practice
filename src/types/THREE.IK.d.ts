import { IK, IKChain, IKJoint, IKBallConstraint, IKHelper, IKConstraint } from 'three-ik';
import { Bone, Object3D, Color } from 'three';

declare module 'THREE' {
  export class IK {
    constructor();
    chains: [];
    isIK: boolean;
    add(chain: IKChain): void;
    solve(): void;
    getRootBone(): Bone;
  }

  export class IKBallConstraint {
    constructor(angle: number);
    angle: number;
  }

  export class IKChain {
    constructor();
    isIKChain: boolean;
    totalLengths: number;
    base: any | null;
    effector: any | null;
    effectorIndex: any | null;
    chains: Map<number, number>;
    origin: any | null;
    iterations: number;
    tolerance: number;
    add(joint: IKJoint, config: Object): Object3D;
    connect(chain: IKChain);
  }

  export class BoneHelper extends Object3D {
    constructor(height: number, boneSize: number, axesSize: number);
    height: number;
    boneSize: number;
    axesSize: number;
  }

  interface config {
    color: Color;
    showBones: boolean;
    boneSize: number;
    showAxes: boolean;
    axesSize: number;
    wireframe: boolean;
  }

  export class IKHelper extends Object3D {
    constructor(ik: IK, {}?: config);
    ik: IK;
    config: {
      color: Color,
      showBones: boolean,
      showAxes: boolean,
      wireframe: boolean,
      axesSize: number,
      boneSize: number
    };
    showBones(): boolean;
    showAxes(): boolean;
    wireframe(): boolean;
    color(): Color;
    updateMatrixWorld(force: any): void;
  }

  export class IKJoint {
    constructor(bone: Bone, { constraints: IKConstraint });
    constraints: any;
    bone: Bone;
    distance: number;
    config: {
      constraints: Array<IKConstraint>
    };
  }
}
