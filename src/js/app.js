import * as THREE from 'three';
const OrbitControls = require('three-orbitcontrols');

const buildingsURL = require('../models/buildings.obj');

import { TweenMax } from 'gsap';

import * as dat from 'dat.gui';

import vertex from '../glsl/vertex.glsl';
import fragment from '../glsl/fragment.glsl';

var OBJLoader = require('three-obj-loader');
OBJLoader(THREE);

class app {
  constructor() {
    this.RENDERER;
    this.SCENE;
    this.CAMERA;
    this.CONTROL;

    this.buildings = [];
    this.fieldSize = 30;
    this.buildingsGroup = new THREE.Group();

    this.mouse = {
      x: 0,
      y: 0,
    }

    this.gyro = {
      x: 0,
      y: 0
    }

    this.colorScheme = {
      background: "#085f63",
      fog: "#085f63",
      plane: "#000000",
      light: "#49beb7",
      building: "#fff"
    }

    this.init();
    this.render();
  }

  init() {
    this.initRenderer();
    this.intScene();
    this.initCamera();
    this.initLights();
    this.initObjects();
    this.initEventListners();

    this.loadModels(buildingsURL, this.onModelLoaded.bind(this));
  }

  initEventListners() {
    document.addEventListener('mousemove', this.onMouseMove.bind(this), false);
    window.addEventListener('resize', this.onWindowResize.bind(this), false);
    if (window.DeviceMotionEvent) {
      window.addEventListener("devicemotion", this.onDeviceMotion.bind(this), false);
    } else {
      console.log("DeviceMotionEvent is not supported");
    }
  }

  initRenderer() {
    this.RENDERER = new THREE.WebGLRenderer({ antialias: true });
    this.RENDERER.setSize(window.innerWidth, window.innerHeight);

    this.RENDERER.shadowMap.enabled = true;
    this.RENDERER.shadowMap.type = THREE.PCFSoftShadowMap;

    document.querySelector('.container').appendChild(this.RENDERER.domElement);
  }

  intScene() {
    this.SCENE = new THREE.Scene();
    this.SCENE.background = new THREE.Color(this.colorScheme.background);
    this.SCENE.fog = new THREE.Fog(this.colorScheme.fog, 0, 0);
  }

  initCamera() {
    this.CAMERA = new THREE.PerspectiveCamera(
      40,
      window.innerWidth / window.innerHeight,
      0.1,
      5000
    );
    this.CAMERA.rotation.x = -0.25;
    this.CAMERA.position.z = 2500;
    this.CAMERA.position.y = 1500;
    // this.CONTROL = new OrbitControls(this.CAMERA, this.RENDERER.domElement);
  }

  initLights() {
    this.light = new THREE.PointLight(this.colorScheme.light, 1);
    this.light.position.set(0, 2000, -1000);
    this.SCENE.add(this.light);
  }

  initObjects() {
    const geometry = new THREE.PlaneGeometry(20000, 20000);
    const material = new THREE.MeshBasicMaterial({ color: this.colorScheme.plane, side: THREE.DoubleSide });
    const plane = new THREE.Mesh(geometry, material);

    plane.rotation.x = Math.PI / 2;

    this.SCENE.add(plane);
  }

  loadModels(path, onComplete) {
    const loader = new THREE.OBJLoader();

    loader.load(path, onComplete);
  }

  onModelLoaded(model) {
    this.buildings = [...model.children];
    // this.SCENE.add(model);
    this.addBuildings();
  }

  addBuildings() {

    let blockSize = 140;

    for (let i = 0; i < this.fieldSize; i++) {
      for (let j = 0; j < this.fieldSize; j++) {
        let building = this.buildings[Math.floor(Math.random() * 12)].clone();

        let scale = Math.random() * (0.9 - 0.1 + .01);

        let material = new THREE.MeshPhongMaterial({ color: this.colorScheme.building })

        building.material = material;
        building.scale.x = scale;
        building.scale.y = scale;
        building.scale.z = scale;

        building.receiveShadow = true;
        building.castShadow = true;

        building.position.x = i * blockSize;
        building.position.z = j * blockSize;
        building.position.y = 0;
        this.buildingsGroup.add(building);
      }
    }
    this.buildingsGroup.rotation.y = Math.PI;
    this.buildingsGroup.position.x = blockSize * this.fieldSize / 2;
    this.buildingsGroup.position.z = blockSize * this.fieldSize / 2;
    this.SCENE.add(this.buildingsGroup);

    this.buildingsGroup.children.sort((a, b) => {
      if (a.position.z > b.position.z) {
        return -1;
      }

      if (a.position.z < b.position.z) {
        return 1;
      }

      return 0;
    }).reverse();

    this.buildingsGroup.children.forEach(el => {
      el.position.y = -600;
      el.scale.y += el.position.z / 3500;
    });

    this.buildingsGroup.children.forEach((el, index) => {
      TweenMax.to(el.position, 1.2, { y: 1, ease: Power3.easeOut, delay: index / 800 });
    });

    TweenMax.to(this.SCENE.fog, 1.5, { far: 4500, ease: Power3.easeInOut });
  }


  rotateScene(){
    if (window.DeviceMotionEvent && this.gyro.x) {
      TweenMax.to(this.SCENE.rotation, 1, { y: this.gyro.x / 40 });
      TweenMax.to(this.SCENE.rotation, 1, { x: this.gyro.y / 40 });
    }
    else {
      TweenMax.to(this.SCENE.rotation, 1, { y: this.mouse.x / 10000 });
      TweenMax.to(this.SCENE.rotation, 1, { x: this.mouse.y / 10000 });
    }
  }

  onWindowResize() {
    this.CAMERA.aspect = window.innerWidth / window.innerHeight;
    this.CAMERA.updateProjectionMatrix();
    this.RENDERER.setSize(window.innerWidth, window.innerHeight);
  }

  onMouseMove(e) {
    this.mouse.x = (e.clientX - window.innerWidth / 2);
    this.mouse.y = (e.clientY - window.innerHeight / 2);
  }

  onDeviceMotion(e) {
    this.gyro.x = e.accelerationIncludingGravity.x;
    this.gyro.y = e.accelerationIncludingGravity.y;
  }

  render() {
    requestAnimationFrame(this.render.bind(this));

    this.rotateScene();

    this.CAMERA.updateProjectionMatrix();
    this.RENDERER.render(this.SCENE, this.CAMERA);
  }
}

let application = new app();

