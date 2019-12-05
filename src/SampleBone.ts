import * as THREE from 'three';
import * as dat from 'dat.gui';
import { OrbitControls } from 'three-orbitcontrols-ts';

// add sample under page
// https://github.com/mrdoob/three.js/blob/master/docs/scenes/bones-browser.html

const segmentHeight = 8;
const segmentCount = 4;
const height = segmentHeight * segmentCount;
const halfHeight = height * 0.5;
const sizing = {
  segmentHeight: segmentHeight,
  segmentCount: segmentCount,
  height: height,
  halfHeight: halfHeight
};
const state = {
  animateBones: false
};

class SampleBone {
  private gui: dat.GUI;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private orbit: OrbitControls;
  private mesh: THREE.SkinnedMesh;

  constructor() {
    this.initScene();
    this.initBones();
    this.setupDatGui();
    this.render();
  }

  initScene() {
    this.gui = new dat.GUI();
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x444444);
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
    this.camera.position.z = 30;
    this.camera.position.y = 30;
    this.renderer = new THREE.WebGLRenderer({antialias: true});
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.orbit = new OrbitControls(this.camera, this.renderer.domElement);
    this.orbit.enableZoom = false;

    const lights = [];
    lights[0] = new THREE.PointLight(0xffffff, 1, 0);
    lights[1] = new THREE.PointLight(0xffffff, 1, 0);
    lights[2] = new THREE.PointLight(0xffffff, 1, 0);
    lights[0].position.set(0, 200, 0);
    lights[1].position.set(100, 200, 100);
    lights[2].position.set(-100, -200, -100);

    this.scene.add(lights[0]);
    this.scene.add(lights[1]);
    this.scene.add(lights[2]);

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }, false);
  }

  createGeometry(sizing): THREE.CylinderBufferGeometry {
    let geometry = new THREE.CylinderBufferGeometry(
      5, // radiusTop
      5, // radiusBottom
      sizing.height, // height
      8, // radiusSegments
      sizing.segmentCount * 3, // heightSegments
      true // openEnded
    );
    let position = geometry.attributes.position as THREE.BufferAttribute;
    let vertex = new THREE.Vector3();
    const skinIndices = [];
    const skinWeights = [];

    for (let i = 0; i < position.count; i++) {
      vertex.fromBufferAttribute(position, i);
      const y = (vertex.y + sizing.halfHeight);
      const skinIndex = Math.floor(y / sizing.segmentHeight);
      const skinWeight = (y % sizing.segmentHeight) / sizing.segmentHeight;
      skinIndices.push(skinIndex, skinIndex + 1, 0, 0);
      skinWeights.push(1 - skinWeight, skinWeight, 0, 0);
    }
    geometry.setAttribute(
      'skinIndex', 
      new THREE.Uint16BufferAttribute(skinIndices, 4)
    );
    geometry.setAttribute(
      'skinWeight',
      new THREE.Float32BufferAttribute(skinWeights, 4)
    );
    return geometry;
  }

  createBones(sizing): THREE.Bone[] {
    const bones: THREE.Bone[] = [];
    let prevBone = new THREE.Bone();
    bones.push(prevBone);

    prevBone.position.y =- sizing.halfHeight;

    for (let i = 0; i < sizing.segmentCount; i ++) {
      let bone = new THREE.Bone();
      bone.position.y = sizing.segmentHeight;
      bones.push(bone);
      prevBone.add(bone);
      prevBone = bone;
    }
    return bones;
  }

  createMesh(
    geometry: THREE.CylinderBufferGeometry, 
    bones: THREE.Bone[]
  ): THREE.SkinnedMesh {
    const material = new THREE.MeshPhongMaterial({
      skinning: true,
      color: 0x156289,
      emissive: 0x072534,
      side: THREE.DoubleSide,
      flatShading: true
    });

    const skinnedMesh = new THREE.SkinnedMesh(geometry, material);
    const skeleton = new THREE.Skeleton(bones);
    skinnedMesh.add(bones[0]);
    skinnedMesh.bind(skeleton);

    const skeletonHelper = new THREE.SkeletonHelper(skinnedMesh);
    // skeletonHelper.material.linewidth = 2;
    this.scene.add(skeletonHelper);
    return skinnedMesh;
  }

  setupDatGui() {
    let folder = this.gui.addFolder('General Options');
    folder.add( state, 'animateBones');
    folder.__controllers[0].name('Animate Bones');
    folder.add(this.mesh, 'pose');
    folder.__controllers[1].name('.pose()');

    const bones = this.mesh.skeleton.bones;
    for (let i = 0; i < bones.length; i ++) {
      let bone = bones[i];
      folder = this.gui.addFolder('Bone ' + i);
      folder.add(bone.position, 'x', - 10 + bone.position.x, 10 + bone.position.x);
      folder.add(bone.position, 'y', - 10 + bone.position.y, 10 + bone.position.y);
      folder.add(bone.position, 'z', - 10 + bone.position.z, 10 + bone.position.z);
      folder.add(bone.rotation, 'x', - Math.PI * 0.5, Math.PI * 0.5);
      folder.add(bone.rotation, 'y', - Math.PI * 0.5, Math.PI * 0.5);
      folder.add(bone.rotation, 'z', - Math.PI * 0.5, Math.PI * 0.5);
      folder.add(bone.scale, 'x', 0, 2);
      folder.add(bone.scale, 'y', 0, 2);
      folder.add(bone.scale, 'z', 0, 2);
      folder.__controllers[0].name('position.x');
      folder.__controllers[1].name('position.y');
      folder.__controllers[2].name('position.z');
      folder.__controllers[3].name('rotation.x');
      folder.__controllers[4].name('rotation.y');
      folder.__controllers[5].name('rotation.z');
      folder.__controllers[6].name('scale.x');
      folder.__controllers[7].name('scale.y');
      folder.__controllers[8].name('scale.z');
    }
  }

  initBones() {
    const geometry = this.createGeometry(sizing);
    const bones = this.createBones(sizing);
    this.mesh = this.createMesh(geometry, bones);
    this.mesh.scale.multiplyScalar(1);
    this.scene.add(this.mesh);
  }

  render() {
    const time = Date.now() * 0.001;
    //Wiggle the bones
    if (state.animateBones) {
      for (let i = 0; i < this.mesh.skeleton.bones.length; i++) {
        this.mesh.skeleton.bones[i].rotation.z = 
          Math.sin(time) * 2 / this.mesh.skeleton.bones.length;
      }
    }

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.render());
  }
}

export default SampleBone;