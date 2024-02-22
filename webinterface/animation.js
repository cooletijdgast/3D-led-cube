import {mapToHexTable, programToSerial} from "./mapper.js";
let run = 0;
let buttonCounter = 0;

window.addEventListener("load", () => {
    frameList()
})

let slider = document.getElementById('delay');
let inputDelay = document.getElementById('delayInput');


let frames = [];
let frameCount = 0;

document.getElementById('frame').addEventListener("click", addFrame);
document.getElementById('program').addEventListener("click", programFrames);
document.getElementById('stop').addEventListener("click", stop);

inputDelay.oninput = async function () {
    slider.value = this.value;
    await programFrames();
}

slider.oninput = async function () {
    inputDelay.value = this.value;
    await programFrames();
}

function addFrame() {
    frames.push(mapToHexTable());
    frameCount++;
    addButtonToFrameList();
}

async function programFrames() {
    run = 1;
    if (frameCount === 0)
        addFrame();
    while (1 && run) {
        for (let i = 0; i < frameCount; i++) {
            await programToSerial(frames[i]);
            await delay(slider.value);
        }
    }
}

function frameList() {
    let tableElement = document.getElementById('table');
    let section = document.createElement('section');
    section.id = 'test1234'
    section.style.paddingTop = '20px'
    section.style.maxHeight = '806px';
    section.style.overflowY = 'scroll';
    tableElement.appendChild(section);
    addButtonToFrameList();
}

function addButtonToFrameList(){
    let button = document.createElement('button');
    button.id = `buttonFrameList${buttonCounter}`;
    buttonCounter++;
    button.innerText = buttonCounter;
    button.className = 'frameListButton';
    let section = document.getElementById('test1234');
    section.appendChild(button);
}

function delay (miliseconds) {
    return new Promise((resolve) => {
        window.setTimeout(() => {
            resolve();
        }, miliseconds);
    });
}

function stop(){
    run = 0;
}