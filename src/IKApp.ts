import * as dat from 'dat.gui';
import * as THREE from 'three';
import { IK, IKHelper } from 'three-ik';
const TransformControls = require('three-transform-controls')(THREE);
import { OrbitControls } from 'three-orbitcontrols-ts';

interface Config {
  showAxes: boolean;
  showBones: boolean;
  wireframe: boolean;
  color: string;
  constraintType: string;
  constraintAngle: number;
}

class IKApp {
  protected gui: dat.GUI;
  protected config: Config;
  protected scene: THREE.Scene;
  protected camera: THREE.PerspectiveCamera;
  protected light: THREE.DirectionalLight;
  protected mesh: THREE.Mesh;
  protected grid: THREE.GridHelper;
  protected renderer: THREE.WebGLRenderer;
  protected gizmos: any[];
  protected iks: IK[];
  protected helpers: IKHelper[];
  protected controls: OrbitControls;
  protected constraintType: string;
  protected constraintAngle: number;

  constructor() {
    this.animate = this.animate.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);

    this.gui = new dat.GUI();
    this.config = {
      showAxes: true,
      showBones: true,
      wireframe: true,
      color: '#ff0077',
      constraintType: 'ball',
      constraintAngle: 360
    }

    if (this.setupGUI) {
      this.setupGUI();
    }

    const helperGUI = this.gui.addFolder('helper');
    helperGUI.add(this.config, 'showAxes').onChange(this.onChange);
    helperGUI.add(this.config, 'showBones').onChange(this.onChange);
    helperGUI.add(this.config, 'wireframe').onChange(this.onChange);
    helperGUI.addColor(this.config, 'color').onChange(this.onChange);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xeeeeee);
    this.camera = new THREE.PerspectiveCamera(
      45, window.innerWidth / window.innerHeight, 0.01, 100);
    this.camera.position.set(10, 5, 6);
    this.camera.lookAt(this.scene.position);
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    this.light = new THREE.DirectionalLight( 0xffffff );
    this.light.position.set(10, 10, 0);
    this.scene.add(this.light);

    this.mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshPhongMaterial({ color: 0x555555 })
    );
    this.mesh.rotation.x = - Math.PI / 2;
    this.scene.add(this.mesh);

    this.grid = new THREE.GridHelper(20, 20, 0x000000, 0x000000);
    this.grid.position.y = 0.001;
    // this.grid.material.opacity = 1;
    this.scene.add(this.grid);

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.update();

    this.gizmos = [];
    this.iks = [];
    this.helpers = [];
    this.setupIK();

    for (let ik of this.iks) {
      const helper = new IKHelper(ik);
      this.helpers.push(helper);
      this.scene.add(helper);
    }
    window.addEventListener('resize', this.onWindowResize, false);

    this.onChange();
    this.animate();
  }

  setupIK() {}

  createTarget(position: THREE.Vector3) {
    const gizmo = new TransformControls(
      this.camera, 
      this.renderer.domElement
    );
    const target = new THREE.Object3D();
    gizmo.setSize(0.5);
    gizmo.attach(target);
    gizmo.target = target;
    target.position.copy(position);
    this.scene.add(gizmo);
    this.scene.add(target);
    this.gizmos.push(gizmo);

    return target;
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    for (let ik of this.iks) {
      ik.solve();
    }

    for (let gizmo of this.gizmos) {
      gizmo.update();
    }

    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  onChange() {
    for (let helper of this.helpers) {
      helper.showAxes = this.config.showAxes;
      helper.showBones = this.config.showBones;
      helper.wireframe = this.config.wireframe;
      helper.color = this.config.color;
    }
  }

  setupGUI() {
    this.gui.add(
      this.config,
      'constraintType',
      ['none', 'ball']
    ).onChange(this.onChange);

    this.gui.add(
      this.config,
      'constraintAngle'
    )
    .min(0)
    .max(360)
    .step(1)
    .onChange(this.onChange);
  }
}

export default IKApp;
