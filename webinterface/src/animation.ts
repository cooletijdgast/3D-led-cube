import {getTables, loadFrameIntoTables, mapToHexTable, programToSerial} from './mapper.js';

interface frameInterface {
    frameId: number;
    framesInTables: HTMLTableElement[],
    framesInHex: string[][];
}

let frames: frameInterface[] = [];

let run = 0;
let buttonCounter = 0;

window.addEventListener("load", () => {
    frameList();
    addEventToButton();
    let button = document.getElementById('buttonFrameList0');
    if (button !== null)
        button.className = 'frameListButton-selected';
})

let slider = document.getElementById('delay');
let inputDelay = document.getElementById('delayInput');


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
        frames[currentFrame - 1].framesInTables = getTables();
    } else {
        frames[currentFrame - 1].framesInHex.push(...mapToHexTable());
        frames[currentFrame - 1].framesInTables.push(...getTables());
        frames[currentFrame - 1].frameId = currentFrame;
    }
    console.log('saving', frames[currentFrame - 1]);


    console.log('currentFrame + frameCount', currentFrame  - 1, frameCount);
}

async function programFrames() {
    if (frameCount === 0) {
        addFrame();
    }
    for (let i = 0; i < frameCount; i++) {
        if (frames[i] !== undefined) {
            await programToSerial(frames[i].framesInHex);
            await delay(slider!.innerHTML as unknown as number);
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
            console.log('currentFrame', currentFrame);
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
    console.log('all frames', frames);
    console.log('loading', frames[frameId]);
    loadFrameIntoTables(frames[frameId].framesInTables);
}

function saveEmptyFrame() {
    let emptyTables = getTables();
    for (let y = 0; y < 8; y++) {
        for (let z = 0; z < 8; z++) {
            for (let x = 0; x < 8; x++) {
                emptyTables[y]!.rows[z].cells[x].style.backgroundColor = '#FFFFFF'
            }
        }
    }
    frames.push(new class implements frameInterface {
        frameId: number = frameCount;
        framesInHex: string[][] = [[]];
        framesInTables: HTMLTableElement[] = emptyTables;
    });
    console.log(frames);
}

function delay(miliseconds: number) {
    return new Promise<void>((resolve) => {
        window.setTimeout(() => {
            resolve();
        }, miliseconds);
    });
}

function stop() {
    run = 0;
}