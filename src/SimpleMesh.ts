import * as THREE from 'three';
import { IK, IKChain, IKJoint, IKBallConstraint, IKHelper } from 'three-ik';
const TransformControls = require('three-transform-controls')(THREE);
import { OrbitControls } from 'three-orbitcontrols-ts';

const MAX_JOINTS = 3;
const CAMERA_POS_Z = 3.5;
const TARGET_POS_Z = 0;
const TARGET_POS_Y = 1.2;

class SimpleMesh {
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private controls: OrbitControls;
  private gizmos: any[] = [];

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xeeeeee);
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 400);
    this.camera.position.z = CAMERA_POS_Z;
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    const light = new THREE.AmbientLight(0xFFFFFF, 1.0);
    this.scene.add(light);

    const grid = new THREE.GridHelper(20, 20, 0x000000, 0x000000);
    this.scene.add(grid);

    const [ik, pivot] = this.initIK();

    this.render(ik, pivot);
  }

  private initIK(): [IK, THREE.Object3D] {
    const movingTarget = this.createTarget(new THREE.Vector3());
    movingTarget.position.z = TARGET_POS_Z;
    movingTarget.position.y = TARGET_POS_Y;

    const pivot = new THREE.Object3D();
    pivot.add(movingTarget);
    this.scene.add(pivot);

    const ik = new IK();
    ik.isIK = true;

    const [chain, bones] = this.createBonesAndChain(movingTarget);
    this.createMeshs(bones);
    
    ik.add(chain);
    this.scene.add(ik.getRootBone());
    this.createHelper(ik);

    return [ik, pivot];
  }

  private createBonesAndChain(movingTarget: THREE.Object3D): [ IKChain, THREE.Bone[]] {
    const chain = new IKChain();
    const constraints = [new IKBallConstraint(180)];
    const bones: THREE.Bone[] = [];
    
    for (let i = 0; i < MAX_JOINTS; i++) {
      const bone = new THREE.Bone();
      bone.position.z = i === 0 ? 0 : 0.5;
      if (bones[i - 1]) {
        bones[i - 1].add(bone);
      }
      bones.push(bone);

      const target = i === MAX_JOINTS - 1 ? movingTarget : null;
      chain.add(new IKJoint(bone, { constraints }), { target });
    }
    return [chain, bones];
  }

  private createMeshs(bones: THREE.Bone[]) {
    console.log(bones)
    const geometry = new THREE.CylinderGeometry(0.2, 0.2, 0.5, 10);
    const material = new THREE.MeshPhongMaterial({
      skinning: true,
      color: 0x156289,
      emissive: 0x072534,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5
    });
    const mesh = new THREE.SkinnedMesh(geometry, material);
    const skelton = new THREE.Skeleton(bones);
    mesh.add(bones[0]);
    mesh.bind(skelton);
    this.scene.add(mesh);
  }

  createTarget(position: THREE.Vector3): THREE.Object3D {
    const gizmo = new TransformControls(
      this.camera, 
      this.renderer.domElement
    );
    const target = new THREE.Object3D();
    gizmo.setSize(1.0);
    gizmo.attach(target);
    gizmo.target = target;
    target.position.copy(position);
    this.scene.add(gizmo);
    this.scene.add(target);
    this.gizmos.push(gizmo);

    return target;
  }

  private createHelper(ik: IK) {
    const helper = new IKHelper(ik);
    this.scene.add(helper);
  }

  private render(ik:IK, pivot: THREE.Object3D) {
    ik.solve();

    this.controls.update();

    for (let gizmo of this.gizmos) {
      gizmo.update();
    }

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.render(ik, pivot));
  }
}

export default SimpleMesh;
