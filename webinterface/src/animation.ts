import {
    getEmpty3dArray,
    getTableColors,
    loadFrameIntoTables,
    mapToHexTable,
    programToSerial
} from './mapper.js';

interface frameInterface {
    frameId: number;
    framesInTables: string[][][],
    framesInHex: string[][];
}

let frames: frameInterface[] = [];


window.addEventListener("load", () => {
    frameList();
    addEventToButton();
    let button = document.getElementById('buttonFrameList0');
    if (button !== null)
        button.className = 'frameListButton-selected';
})

let slider = document.getElementById('delay');
let inputDelay = document.getElementById('delayInput');


let buttonCounter = 0;
let frameCount = 0;
let currentFrame = 1;

document.getElementById('addFrame')?.addEventListener("click", addFrame);
document.getElementById('saveFrame')?.addEventListener("click", saveFrame);
document.getElementById('program')?.addEventListener("click", programFrames);
document.getElementById('stop')?.addEventListener("click", stop);

function addEventToButton() {
    if (inputDelay !== null && slider !== null) {
        inputDelay.oninput = async function () {
            slider!.innerHTML = inputDelay!.innerHTML;
            await programFrames();
        }

        slider.oninput = async function () {
            inputDelay!.innerHTML = slider!.innerHTML;
            await programFrames();
        }
    }
}

function addFrame() {
    frameCount++;
    addButtonToFrameList();
    saveEmptyFrame();
}

function saveFrame() {
    if (frames[currentFrame - 1] !== undefined && frames[currentFrame - 1].frameId === currentFrame) {
        frames[currentFrame - 1].framesInHex = mapToHexTable();
        frames[currentFrame - 1].framesInTables = getTableColors();
    }
}

async function programFrames() {
    if (frameCount === 0) {
        addFrame();
    }
    for (let i = 0; i < frameCount; i++) {
        if (frames[i] !== undefined) {
            await programToSerial(frames[i].framesInHex);
        }
    }
}

function frameList() {
    let tableElement = document.getElementById('table');
    let section = document.createElement('section');
    section.id = 'frameList'
    section.style.paddingTop = '20px'
    section.style.maxHeight = '806px';
    section.style.overflowY = 'scroll';
    tableElement!.appendChild(section);
    addFrame();
}

function addButtonToFrameList() {
    let button = document.createElement('button');
    let section = document.getElementById('frameList');
    button.id = `buttonFrameList${buttonCounter}`;
    buttonCounter++;
    button.innerText = `${buttonCounter}`;
    button.className = 'frameListButton';
    addEventListenerToButton(button);
    section!.appendChild(button);

}

function addEventListenerToButton(button: HTMLButtonElement) {
    button.addEventListener(
        "click",
        (event) => {
            resetClassOnButton();
            let button = <HTMLButtonElement>(event!.target);
            button.className = 'frameListButton-selected';
            currentFrame = Number(button.id.slice(15, 16)) + 1;
            loadFrame(currentFrame - 1);
        },
        false,
    );
}

function resetClassOnButton() {
    let button: HTMLCollection = document.getElementsByClassName('frameListButton-selected');
    for (let i = 0; i < button.length; i++) {
        button[i].className = 'frameListButton';
    }
}

function loadFrame(frameId: number) {
    loadFrameIntoTables(frames[frameId].framesInTables);
}

function saveEmptyFrame() {
    frames.push(new class implements frameInterface {
        frameId: number = frameCount;
        framesInHex: string[][] = [[]];
        framesInTables: string[][][] = getEmpty3dArray<string>('#FFFFFF');
    });
}