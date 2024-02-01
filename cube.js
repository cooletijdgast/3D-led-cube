import * as THREE from 'three';
import {OrbitControls} from 'orbitControls';
import {mapToCube, mapToHexTable} from "./mapper.js";

const scene = new THREE.Scene();
THREE.Object3D.DefaultUp = new THREE.Vector3(0,0,1);

const renderer = new THREE.WebGLRenderer();

const camera = new THREE.PerspectiveCamera(45, 900 / 900, 1, 10000);
const controls = new OrbitControls(camera, renderer.domElement);


const arrowScene = new THREE.Scene();

const CANVAS_WIDTH = 200;
const CANVAS_HEIGHT = 200;
const arrowRenderer = new THREE.WebGLRenderer({alpha: true}); // clear
arrowRenderer.setClearColor(0x000000, 0);
arrowRenderer.setSize(CANVAS_WIDTH, CANVAS_HEIGHT);

const arrowCanvas = document.body.appendChild(arrowRenderer.domElement);
arrowCanvas.setAttribute('id', 'arrowCanvas');
arrowCanvas.style.width = CANVAS_WIDTH;
arrowCanvas.style.height = CANVAS_HEIGHT;

const arrowCamera = new THREE.PerspectiveCamera(50, CANVAS_WIDTH / CANVAS_HEIGHT, 1, 1000);
arrowCamera.up = camera.up; // important!

const arrowPos = new THREE.Vector3(0, 0, 0);
arrowScene.add(new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), arrowPos, 60, 0x7F2020, 20, 10));
arrowScene.add(new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), arrowPos, 60, 0x207F20, 20, 10));
arrowScene.add(new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), arrowPos, 60, 0x20207F, 20, 10));

// const axesHelper = new THREE.AxesHelper(10);

renderer.setSize(900, 900);
document.getElementById('cube').appendChild(renderer.domElement);

const cubeSize = 8;
const ledSize = 0.3;
const cubeLEDs = new Array(cubeSize)
    .fill(null)
    .map(() =>
        new Array(cubeSize)
            .fill(null)
            .map(() =>
                new Array(cubeSize)
                    .fill(null)
                    .map(() => {
                        return new THREE.Mesh(new THREE.BoxGeometry(ledSize, ledSize, ledSize));
                    })
            )
    );

document.getElementById('draw').addEventListener("click", drawCube);

// Position LEDs in the cube
export function drawCube() {
    let colors = mapToCube();
    // cubeLEDs[x][y][z];
    cubeLEDs.forEach((layer, y) => {
        layer.forEach((row, z) => {
            row.forEach((led, x) => {
                if (colors[y][z][x] != null) {
                    led.material.color = new THREE.Color(colors[y][z][x]);
                } else {
                    led.material.color = new THREE.Color('rgb(255, 255, 255)');
                }
                led.position.set((7-x) - cubeSize / 2, y - cubeSize / 2, z - cubeSize / 2);
                led.material.transparent = true;
                led.material.opacity = .8;

                scene.add(led);
            });
        });
    });
    camera.position.set(-15, 7, -15);
    mapToHexTable(cubeLEDs);
    animate();
}


drawCube();

function animate() {

    requestAnimationFrame(animate);

    // required if controls.enableDamping or controls.autoRotate are set to true
    controls.update();

    arrowCamera.position.copy(camera.position);
    arrowCamera.position.sub(controls.target);
    arrowCamera.position.setLength(300);

    arrowCamera.lookAt(arrowScene.position);

    arrowRenderer.render(arrowScene, arrowCamera);
    renderer.render(scene, camera);

}