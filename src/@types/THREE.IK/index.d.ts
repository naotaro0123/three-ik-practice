import { IK, IKChain, IKJoint, IKBallConstraint, IKHelper, IKConstraint } from 'three-ik';
import { Bone, Object3D, Color } from 'three';

declare namespace THREEIK {
  interface IK {
    chains: [];
    isIK: boolean;
    add(chain: IKChain): void;
    solve(): void;
    getRootBone(): Bone;
  }
  class IKBallConstraint {
    angle: number;
  }
  class IKChain {
    isIKChain: boolean;
    totalLengths: number;
    base: any | null;
    effector: any | null;
    effectorIndex: any | null;
    chains: Map<number, number>;
    origin: any | null;
    add(joint: IKJoint, config: Object): Object3D;
    connect(chain: IKChain);
  }
  interface BoneHelper {
    height: number;
    boneSize: number;
    axesSize: number;
  }

  interface IKHelper {
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

  interface IKJoint {
    bone: Bone;
    config: {
      constraints: Array<IKConstraint>
    };
  }
}

export = THREEIK;