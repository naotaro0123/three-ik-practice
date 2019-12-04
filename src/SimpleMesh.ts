import * as THREE from 'three';
import { IK, IKChain, IKJoint, IKBallConstraint, IKHelper } from 'three-ik';

const MAX_JOINTS = 7;

class SimpleMesh {
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private ik: IK;
  private pivot: THREE.Object3D;

  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 100);
    this.camera.position.z = 5;
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.initIK();
    this.render();
  }

  initIK() {
    this.ik = new IK();
    this.ik.isIK = true;
    const movingTarget = new THREE.Mesh(
      new THREE.SphereBufferGeometry(0.1),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    const chain = new IKChain();
    movingTarget.position.z = 2;
    this.pivot = new THREE.Object3D();
    this.pivot.add(movingTarget);
    this.scene.add(this.pivot);

    this.createBones(chain, movingTarget);
    this.ik.add(chain);
    this.scene.add(this.ik.getRootBone());
    this.createHelper();
  }

  createBones(chain: IKChain, movingTarget: THREE.Mesh) {
    const constraints = [new IKBallConstraint(90)];
    const bones: THREE.Bone[] = [];
    
    for (let i = 0; i < MAX_JOINTS; i++) {
      const bone = new THREE.Bone();
      bone.position.y = i === 0 ? 0 : 0.5;
      if (bones[i - 1]) {
        bones[i - 1].add(bone);
      }
      bones.push(bone);

      const target = i === MAX_JOINTS - 1 ? movingTarget : null;
      chain.add(new IKJoint(bone, { constraints }), { target });
    }
  }

  createHelper() {
    const helper = new IKHelper(this.ik);
    this.scene.add(helper);
  }

  render() {
    this.pivot.rotation.x += 0.01;
    this.pivot.rotation.y += 0.01;
    this.pivot.rotation.z += 0.01;
    this.ik.solve();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.render());
  }
}

export default SimpleMesh;
