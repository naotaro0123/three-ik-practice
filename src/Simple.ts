import * as THREE from 'three';
// import { IK, IKChain, IKJoint, IKBallConstraint, IKHelper } from 'three-ik';
import * as THREEIK from 'three-ik';

const MAX_JOINTS = 7;

class Simple {
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;

  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 100);
    this.camera.position.z = 5;
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    const [ik, pivot] = this.initIK();
    this.render(ik, pivot);
  }

  private initIK(): [THREEIK.IK, THREE.Object3D] {
    const movingTarget = new THREE.Mesh(
      new THREE.SphereBufferGeometry(0.1),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    movingTarget.position.z = 2;

    const pivot = new THREE.Object3D();
    pivot.add(movingTarget);
    this.scene.add(pivot);

    const ik = new THREEIK.IK();
    ik.isIK = true;
    ik.add(this.createBonesAndChain(movingTarget));
    this.scene.add(ik.getRootBone());
    this.createHelper(ik);

    return [ik, pivot];
  }

  private createBonesAndChain(movingTarget: THREE.Mesh): THREEIK.IKChain {
    const chain = new THREEIK.IKChain();
    const constraints = [new THREEIK.IKBallConstraint(90)];
    const bones: THREE.Bone[] = [];
    
    for (let i = 0; i < MAX_JOINTS; i++) {
      const bone = new THREE.Bone();
      bone.position.y = i === 0 ? 0 : 0.5;
      if (bones[i - 1]) {
        bones[i - 1].add(bone);
      }
      bones.push(bone);

      const target = i === MAX_JOINTS - 1 ? movingTarget : null;
      chain.add(new THREEIK.IKJoint(bone, { constraints }), { target });
    }
    return chain;
  }

  private createHelper(ik: THREEIK.IK) {
    const helper = new THREEIK.IKHelper(ik);
    this.scene.add(helper);
  }

  private render(ik:THREEIK.IK, pivot: THREE.Object3D) {
    pivot.rotation.x += 0.01;
    pivot.rotation.y += 0.01;
    pivot.rotation.z += 0.01;
    ik.solve();

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.render(ik, pivot));
  }
}

export default Simple;
