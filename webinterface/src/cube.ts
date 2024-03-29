import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {mapToCube} from "./mapper.js";

const scene = new THREE.Scene();
THREE.Object3D.DEFAULT_UP = new THREE.Vector3(0,0,1);

const renderer = new THREE.WebGLRenderer();

const camera = new THREE.PerspectiveCamera(45, 900 / 900, 1, 10000);
const controls = new OrbitControls(camera, renderer.domElement);



renderer.setSize(400, 400);
document.getElementById('cube')!.appendChild(renderer.domElement);
const arrowScene = new THREE.Scene();

const CANVAS_WIDTH = 200;
const CANVAS_HEIGHT = 200;

const arrowCamera = new THREE.PerspectiveCamera(50, CANVAS_WIDTH / CANVAS_HEIGHT, 1, 1000);
arrowCamera.up = camera.up; // important!

const arrowPos = new THREE.Vector3(0, 0, 0);
arrowScene.add(new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), arrowPos, 60, 0x7F2020, 20, 10));
arrowScene.add(new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), arrowPos, 60, 0x207F20, 20, 10));
arrowScene.add(new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), arrowPos, 60, 0x20207F, 20, 10));

const arrowRenderer = new THREE.WebGLRenderer({alpha: true}); // clear
arrowRenderer.setClearColor(0x000000, 0);
arrowRenderer.setSize(CANVAS_WIDTH, CANVAS_HEIGHT);

const arrowCanvas = document.getElementById('cube')!.appendChild(arrowRenderer.domElement);

arrowCanvas.setAttribute('id', 'arrowCanvas');
arrowCanvas.style.width = `${CANVAS_WIDTH}`;
arrowCanvas.style.height = `${CANVAS_HEIGHT}`;

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

document.getElementById('draw')!.addEventListener("click", drawCube);

export function drawCube() {
    let colors = mapToCube();
    cubeLEDs.forEach((layer, y) => {
        layer.forEach((row, z) => {
            row.forEach((led, x) => {
                if (colors[z][x][y] != null) {
                    (<any>led.material).color = new THREE.Color(colors[z][x][y]);
                } else {
                    (<any>led.material).color = new THREE.Color('rgb(255, 255, 255)');
                }
                led.position.set((7-x) - cubeSize / 2, y - cubeSize / 2, z - cubeSize / 2);
                (<any>led.material).transparent = true;
                (<any>led.material).opacity = .8;

                scene.add(led);
            });
        });
    });
    camera.position.set(-15, -15, 10);
    animate();
}

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
drawCube();
