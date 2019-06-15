/*eslint-disable */
import * as dat from 'dat.gui';
import * as THREE from 'three-full';
import { TweenMax } from 'gsap';
import Planet from './Planet';

import vertexAtmo from '../glsl/vertexAtmo.glsl'
import fragmentAtmo from '../glsl/fragmentAtmo.glsl'
import vertexSun from '../glsl/vertexSun.glsl';
import fragmentSun from '../glsl/fragmentSun.glsl';
import fragmentStars from '../glsl/fragmentStars.glsl';

export default class Solar {
  constructor() {

    this.RENDERER;
    this.SCENE;
    this.CAMERA;
    this.COMPOSER;
    this.CONTROL;

    this.textureLoader = new THREE.TextureLoader();

    this.Planets = [];
    this.sun;

    this.params = {
      exposure: 1.15,
      bloomStrength: 1,
      bloomThreshold: 0,
      bloomRadius: 1,
      atmoP: 2,
      atmoC: 0.7
    };

    this.time = 0;
    this.state = "paly";

    this.raycaster = new THREE.Raycaster();
    this.mouseVector = new THREE.Vector3();
    this.selectedObject;

    this.event = new CustomEvent('changePlanet', { 'detail': this.selectedObject });

    this.look = {
      x: 0,
      y: 0,
      z: 0
    }
  }

  init(PlanetsData) {
    this.initRenderer();
    this.initScene();
    this.initCamera();
    this.initControls();
    this.initComposer();
    this.initLighs();
    this.initPlanets(PlanetsData);
    this.initStars();
    this.initEventListners();

    this.selectedObject;
    this.Planets.forEach(p=>{
      if(p.object.name == "Sun"){
        this.selectedObject = p.object
        console.log(this.selectedObject)
      }
    })

    this.setCameraView("Sun");

    this.render();
  }

  initRenderer() {
    this.RENDERER = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true
    });
    this.RENDERER.setPixelRatio(window.devicePixelRatio);
    this.RENDERER.setSize(window.innerWidth, window.innerHeight);
    this.RENDERER.toneMapping = THREE.ReinhardToneMapping;
    this.RENDERER.shadowMap.enabled = true;

    document.querySelector('.container').appendChild(this.RENDERER.domElement);
  }

  initScene() {
    this.SCENE = new THREE.Scene();
    this.SCENE.background = new THREE.Color('#020103');
  }

  initCamera() {
    this.CAMERA = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      100000
    );
    this.CAMERA.aspect = window.innerWidth / window.innerHeight;
    this.CAMERA.updateProjectionMatrix();
  }

  initControls() {
    this.CONTROL = new THREE.OrbitControls(this.CAMERA, this.RENDERER.domElement);
  }

  initComposer() {
    const renderScene = new THREE.RenderPass(this.SCENE, this.CAMERA);
    const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);

    bloomPass.threshold = this.params.bloomThreshold;
    bloomPass.strength = this.params.bloomStrength;
    bloomPass.radius = this.params.bloomRadius;
    bloomPass.renderToScreen = true;

    this.COMPOSER = new THREE.EffectComposer(this.RENDERER);
    this.COMPOSER.setSize(window.innerWidth, window.innerHeight);
    this.COMPOSER.addPass(renderScene);
    this.COMPOSER.addPass(bloomPass);

    // let gui = new dat.GUI();
    // gui.add(this.params, 'exposure', 0.1, 2).step(0.01).onChange( (value) => {
    //   this.RENDERER.toneMappingExposure = Math.pow(value, 4.0);
    // });
    // gui.add(this.params, 'bloomThreshold', 0.0, 1.0).onChange(function (value) {
    //   bloomPass.threshold = Number(value);
    // });
    // gui.add(this.params, 'bloomStrength', 0.0, 3.0).onChange(function (value) {
    //   bloomPass.strength = Number(value);
    // });
    // gui.add(this.params, 'bloomRadius', 0.0, 1.0).step(0.01).onChange(function (value) {
    //   bloomPass.radius = Number(value);
    // });
  }

  initLighs() {
    const light = new THREE.PointLight(0xFFFFFF, 1);
    light.position.set(0, 0, 0);
    light.castShadow = true;
    light.shadow.camera.far = 10500;
    this.SCENE.add(light);
  }

  initPlanets(PlanetsData) {
    let PlanetData;
    for (PlanetData in PlanetsData) {
      let planet = PlanetsData[PlanetData];

      let map, bumpMap, specularMap, cloudMap, lightMap, ringsMap;

      if (planet.map) {
        map = `../img/${planet.name}__map.jpg`;
      }
      if (planet.bumpMap) {
        bumpMap = `../img/${planet.name}__bump.jpg`;
      }
      if (planet.specularMap) {
        specularMap = `../img/${planet.name}__specularMap.png`;
      }
      else {
        specularMap = `../img/nospec.png`;
      }
      if (planet.cloudMap) {
        cloudMap = `../img/${planet.name}__clouds.png`;
      }
      if (planet.lightMap) {
        lightMap = `../img/${planet.name}__light.png`;
      }
      if (planet.ringsMap) {
        ringsMap = `../img/${planet.name}__rings.png`;
      }

      let newPlanet = new Planet({
        isSun: planet.isSun,
        map: map,
        bumpMap: bumpMap,
        specularMap: specularMap,
        specular: planet.specular,
        cloudMap: cloudMap,
        lightMap: lightMap,
        atmoColor: parseInt(planet.atmoColor, 16),
        vertexAtmo: vertexAtmo,
        fragmentAtmo: fragmentAtmo,
        name: planet.name,
        cameraPosition: this.CAMERA,
        radius: planet.radius / 1000,
        ringsMap: ringsMap,
        s: planet.s,
        distanceFromSun: planet.distanceFromSun * 10 + 150
      });

      this.Planets.push(newPlanet);
      let planetPosition = {
        x: planet.position[0],
        y: planet.position[1],
        z: planet.position[2],
      }
      newPlanet.add2Scene(this.SCENE, planetPosition);
      console.log(newPlanet)
      if(newPlanet.object.name == "Sun"){
        this.selectedObject = newPlanet.object;
        this.sun = newPlanet.object;
        console.log(this.sun)
      }
    }
  }

  initStars() {
    let starsGeo = new THREE.SphereGeometry(8000, 100, 100);
    let starsMat = new THREE.ShaderMaterial({
      extensions: {
        derivatives: '#extension GL_OES_standard_derivatives : enable',
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { type: 'f', value: 0 }
      },
      vertexShader: vertexSun,
      fragmentShader: fragmentStars,
      transparent: true
    });

    let startsMesh = new THREE.Mesh(starsGeo, starsMat);
    this.SCENE.add(startsMesh);
  }

  setCameraView(name) {
    this.Planets.forEach(p => {
      if (p.object.name == name) {

        let radius;

        if(name == "Sun"){
          radius = 100;
        }
        else{
          radius = p.object.children[0].geometry.boundingSphere.radius;
        }

        this.selectedObject = p.object

        TweenMax.to(this.CAMERA.position, 1, {
          x: p.object.position.x + radius * 2,
          z: p.object.position.z + radius * 2,
          y: p.object.position.y
        })

        TweenMax.to(this.CONTROL.target, 1, {
          x: p.object.position.x,
          z: p.object.position.z,
          y: p.object.position.y
        })

        TweenLite.to(this.look, 0.7, {
          x: p.object.position.x,
          y: p.object.position.y,
          z: p.object.position.z,
          onUpdate: () => {
            
          }
        })

        this.CONTROL.target.x = p.object.position.x;
        this.CONTROL.target.y = p.object.position.y;
        this.CONTROL.target.z = p.object.position.z;

      }
    });
    this.event = new CustomEvent('changePlanet', { 'detail': this.selectedObject });

    window.dispatchEvent(this.event);
  }

  animate() {

    if (this.state != "pause") {
      this.time++;
      this.Planets.forEach((planet, i) => {

        if(planet.object.name == "Sun"){
          return
        }

        if (planet.clouds) {
          planet.clouds.rotation.y += 0.001;
        }
        if (planet.lights) {
          planet.lights.rotation.y += 0.002;
        }
        planet.mesh.rotation.y += 0.002;

        planet.object.position.x = Math.cos(this.time * 0 + planet.s) * planet.distanceFromSun * (this.Planets.length - i);
        planet.object.position.z = Math.sin(this.time * 0 + planet.s) * planet.distanceFromSun * (this.Planets.length - i);

        if (planet.atmo) {
          planet.atmo.material.uniforms.viewVector.value =
            new THREE.Vector3().subVectors(this.CAMERA.position, planet.object.position);
        }
      })
    }

    this.sun.children[0].material.uniforms.time.value = this.time / 1000 * 8;

    this.Planets.forEach((planet, i) => {
      if (planet.atmo) {
        planet.atmo.material.uniforms.viewVector.value =
          new THREE.Vector3().subVectors(this.CAMERA.position, planet.object.position);
      }
    })

    if (this.selectedObject) {
      this.CAMERA.lookAt(this.look.x, this.look.y, this.look.z)
    }
  }

  render() {
    requestAnimationFrame(this.render.bind(this));
    this.animate();
    this.CAMERA.updateProjectionMatrix();
    this.COMPOSER.render(this.SCENE, this.CAMERA);
  }


  // ======================== Events ========================


  getIntersects(x, y) {
    x = (x / window.innerWidth) * 2 - 1;
    y = - (y / window.innerHeight) * 2 + 1;
    this.mouseVector.set(x, y, 0.5);
    this.raycaster.setFromCamera(this.mouseVector, this.CAMERA);
    return this.raycaster.intersectObject(this.SCENE, true);
  }


  onDocumentMouseDown(event) {
    event.preventDefault();

    let intersects = this.getIntersects(event.layerX, event.layerY);

    if (intersects.length > 0) {
      let res = intersects.filter(function (res) {
        return res && res.object;
      })[0];
      if (res && res.object) {
        if (this.selectedObject === res.object.parent) {
          return false
        }
        if (res.object.parent instanceof THREE.Group) {
          this.selectedObject = res.object.parent;

          this.selectedPlanetName = this.selectedObject.name;
          if(this.selectedPlanetName == "Sun"){
            return false
          }
          this.event = new CustomEvent('changePlanet', { 'detail': this.selectedObject });

          // window.dispatchEvent(this.event);

          this.setCameraView(this.selectedObject.name);
        }
      }
    }
  }


  onWindowResize() {
    this.RENDERER.setSize(window.innerWidth, window.innerHeight);
    this.CAMERA.aspect = window.innerWidth / window.innerHeight;
    this.COMPOSER.setSize(window.innerWidth, window.innerHeight);
  }

  initEventListners() {
    window.addEventListener('resize', this.onWindowResize.bind(this), false);
    window.addEventListener('mousedown', this.onDocumentMouseDown.bind(this), false);
  }

}
