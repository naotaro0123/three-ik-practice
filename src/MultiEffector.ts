import * as THREE from 'three';
import { IK, IKChain, IKJoint, IKBallConstraint } from 'three-ik';
import IKApp from './IKApp';

const DISTANCE = 0.5;
const ROOT_COUNT = 16;
const ARM_COUNT = 8;

class MultiEffector extends IKApp {
  setupIK() {
    const ik = new IK();
    let rootChain = null;

    for (let i = 0; i < 9; i++) {
      const isRoot = i === 0;
      const chain = new IKChain();
      const constraint = new IKBallConstraint(this.config.constraintAngle);
      const target = isRoot ? null : this.createTarget(
        new THREE.Vector3(
          Math.cos(Math.PI * 0.5 * ((i - 1) % 4)),
          ROOT_COUNT * DISTANCE * (i > 4 ? 1 : 0.5),
          Math.sin(Math.PI * 0.5 * ((i - 1) % 4))
        )
      );

      if (isRoot) {
        rootChain = chain;
      }

      const bones = [];
      const boneCount = isRoot ? ROOT_COUNT : ARM_COUNT;

      for (let j = 0; j < boneCount; j++) {
        const isBase = j === 0;
        const isSubBase = !isRoot && isBase;

        if (isSubBase) {
          const joint = rootChain.joints[(ROOT_COUNT / (i > 4 ? 1 : 2)) - 1];
          bones.push(joint.bone);
          chain.add(joint);
          continue;
        }

        const bone = new THREE.Bone();
        bone.position.y = j === 0 ? 0 : DISTANCE;
        // Store the bone and connect it to previous bone
        // if it exists.
        bones[j] = bone;

        if (bones[j - 1]) {
          bones[j - 1].add(bones[j]);
        }

        const constraints = [constraint];

        if (j === boneCount - 1 && !isRoot) {
          chain.add(new IKJoint(bone, { constraints }), { target });
        } else {
          chain.add(new IKJoint(bone, { constraints } ));
        }
      }

      if (!isRoot) {
        rootChain.connect(chain);
      }
    }

    ik.add(rootChain);
    this.iks.push(ik);

    const pivot = new THREE.Object3D();
    pivot.rotation.x = -Math.PI / 2;
    pivot.add(ik.getRootBone());
    this.scene.add(pivot);
  }

  onChange() {
    console.log(this.constraintType)
    // Check if constraintType has changed
    if (this.config.constraintType !== this.constraintType) {
      this.constraintType = this.config.constraintType;
      let constraint;

      switch(this.constraintType) {
        case 'none':
          constraint = null;
          break;
        case 'ball':
          constraint = new IKBallConstraint(this.config.constraintAngle);
          break;
      }

      for (let ik of this.iks) {
        ik.chains[0].joints.forEach(j => j.constraints[0] = constraint);
        for (let [index, chains] of ik.chains[0].chains) {
          for (let chain of chains) {
            chain.joints.forEach(j => j.constraints[0].angle = this.config.constraintAngle);
          }
        }
      }
    }

    if (this.config.constraintAngle !== this.constraintAngle) {
      if (this.config.constraintType !== 'ball') {
        throw new Error('can only set angle on IKBallConstraint');
      }

      for (let ik of this.iks) {
        ik.chains[0].joints.forEach(j => j.constraints[0].angle = this.config.constraintAngle);
        for (let [index, chains] of ik.chains[0].chains) {
          for (let chain of chains) {
            chain.joints.forEach(j => j.constraints[0].angle = this.config.constraintAngle);
          }
        }
      }
      this.constraintAngle = this.config.constraintAngle;
    }
    super.onChange();
  }
}

export default MultiEffector;