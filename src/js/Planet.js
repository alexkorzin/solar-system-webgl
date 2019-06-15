/*eslint-disable */

import vertexSun from '../glsl/vertexSun.glsl';
import fragmentSun from '../glsl/fragmentSun.glsl';

import * as THREE from 'three-full';

export default class Planet {
    constructor(obj) {

        Object.assign(this, obj)

        this.map;
        this.specularMap;
        this.specular;
        this.bumpMap;
        this.cloudMap;
        this.lightMap;
        this.ringsMap;
        this.atmoColor;
        this.vertexAtmo;
        this.fragmentAtmo;
        this.cameraPosition;
        this.radius;

        this.isSun;

        this.rings;
        this.material;
        this.geometry;
        this.mesh;
        this.clouds;
        this.lights;
        this.atmo;

        this.object;

        this.textureLoader = new THREE.TextureLoader();

        this.init();

    }

    init() {

        if (this.isSun) {
            let cloudTexture = this.textureLoader.load('../img/cloud.png');
            let lavatileTexture = this.textureLoader.load('../img/sun__map.jpg');

            cloudTexture.wrapS = cloudTexture.wrapT = THREE.RepeatWrapping;
            lavatileTexture.wrapS = lavatileTexture.wrapT = THREE.RepeatWrapping;

            const sunGeometry = new THREE.SphereGeometry(100, 80, 80);
            const sunMaterial = new THREE.ShaderMaterial({
                vertexShader: vertexSun,
                fragmentShader: fragmentSun,
                uniforms: {
                    "fogDensity": { value: 0.45 },
                    "fogColor": { value: new THREE.Vector3(0, 0, 0) },
                    "time": { value: 1.0 },
                    "uvScale": { value: new THREE.Vector2(1.0, 1.0) },
                    "texture1": { value: cloudTexture },
                    "texture2": { value: lavatileTexture }
                }
            });
            this.mesh = new THREE.Mesh(sunGeometry, sunMaterial);
        }
        else {
            this.initGeomerty();
            this.initMaterial();
            this.initMesh();

            if (this.atmoColor && this.vertexAtmo && this.fragmentAtmo) {
                this.initAtmo();
            }

            if (this.cloudMap) {
                this.initClouds();
            }

            if (this.lightMap) {
                this.initLights();
            }

            if (this.ringsMap) {
                this.initRings();
            }
        }

        this.initObject();

    }

    initMaterial() {

        this.material = new THREE.MeshPhongMaterial({
            map: this.textureLoader.load(this.map),
        });

        if (this.specularMap) {
            this.material.specularMap = this.textureLoader.load(this.specularMap);
        }
        if (this.bumpMap) {
            this.material.bumpMap = this.textureLoader.load(this.bumpMap);
        }

        if (this.specular) {
            this.material.specular = new THREE.Color(this.specular);
        }
        else {
            this.material.specular = new THREE.Color(0x000000);
            this.material.shininess = 0;
        }

        if (this.lightMap) {
            this.material.lightMap = this.textureLoader.load(this.lightMap);
        }

    }

    initGeomerty() {
        this.geometry = new THREE.SphereGeometry(this.radius, 40, 40);
    }

    initMesh() {
        this.mesh = new THREE.Mesh(this.geometry, this.material);
    }

    initClouds() {

        this.clouds = this.mesh.clone();
        this.clouds.material = new THREE.MeshPhongMaterial({
            map: this.textureLoader.load(this.cloudMap),
            transparent: true,
            opacity: 0.7
        })
        this.clouds.scale.set(1.015, 1.015, 1.015);

    }

    initAtmo() {

        this.atmo = this.mesh.clone();
        let atmosMaterial = new THREE.ShaderMaterial(
            {
                uniforms:
                {
                    "c": { type: "f", value: 1.2 },
                    "p": { type: "f", value: 3 },
                    glowColor: { type: "c", value: new THREE.Color(this.atmoColor) },
                    viewVector: { type: "v3", value: this.cameraPosition.position }
                },
                vertexShader: this.vertexAtmo,
                fragmentShader: this.fragmentAtmo,
                side: THREE.FrontSide,
                blending: THREE.AdditiveBlending,
                transparent: true,
            });
        this.atmo.material = atmosMaterial;
        this.atmo.scale.set(1.005, 1.005, 1.005);

    }

    initLights() {

        this.lights = this.mesh.clone();
        this.lights.material = new THREE.MeshBasicMaterial({
            color: 0xFFFFFF,
            alphaMap: this.textureLoader.load(this.lightMap),
            transparent: true,
            opacity: 0.7
        })
        this.lights.scale.set(1.018, 1.018, 1.018);

    }

    initRings() {

        let texture = this.textureLoader.load(this.ringsMap);

        texture.rotation = Math.PI / 2;

        let material = new THREE.MeshPhongMaterial({
            alphaMap: texture,
            transparent: true,
            side: THREE.DoubleSide,
            color: 'white'
        });

        var segs = 96;
        var ii = this.radius * 1.35;
        var oo = this.radius * 1.950;

        var geometry = new THREE.RingBufferGeometry(ii, oo, segs);

        var uvs = geometry.attributes.uv.array;
        // loop and initialization taken from RingBufferGeometry
        var phiSegments = geometry.parameters.phiSegments || 0;
        var thetaSegments = geometry.parameters.thetaSegments || 0;
        phiSegments = phiSegments !== undefined ? Math.max(1, phiSegments) : 1;
        thetaSegments = thetaSegments !== undefined ? Math.max(3, thetaSegments) : 8;
        for (var c = 0, j = 0; j <= phiSegments; j++) {
            for (var i = 0; i <= thetaSegments; i++) {
                geometry.attributes.uv.array[c++] = i / thetaSegments,
                    geometry.attributes.uv.array[c++] = j / phiSegments;
            }
        }

        console.log(geometry)
        this.rings = new THREE.Mesh(geometry, material);


        this.rings.receiveShadow = true;

        this.rings.rotation.x = Math.PI / 2
        this.rings.rotation.y = Math.PI / 20

    }

    initObject() {

        this.object = new THREE.Group();
        this.object.add(this.mesh);

        if (this.name) {
            this.object.name = this.name;
        }

        if (this.clouds) {
            this.object.add(this.clouds);
        }

        if (this.lights) {
            this.object.add(this.lights);
        }

        if (this.atmo) {
            this.object.add(this.atmo);
        }

        if (this.rings) {
            this.object.add(this.rings);
            this.mesh.castShadow = true;
            this.mesh.receiveShadow = true;
        }

    }

    add2Scene(SCENE, position) {

        this.object.position.x = position.x;
        this.object.position.y = position.y;
        this.object.position.z = position.z;
        SCENE.add(this.object);

    }

}