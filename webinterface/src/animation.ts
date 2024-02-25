import {getTables, mapToHexTable, programToSerial} from './mapper.js';

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
}

function saveFrame() {
    for (let i = 0; i < frameCount; i++) {
        if(frames[i] === undefined){
            frames[i] = new class implements frameInterface {
                frameId: number = 0;
                framesInHex: string[][] = [[]];
                framesInTables: HTMLTableElement[] = [];
            }
        }
        if (frames[i].framesInTables[i] !== undefined && frames[i].frameId === currentFrame) {
            frames[i].framesInHex = mapToHexTable();
            frames[i].framesInTables = getTables();
        } else {
            frames[i].framesInHex.push(...mapToHexTable());
            frames[i].framesInTables.push(...getTables());
            frames[i].frameId = currentFrame;
        }
        console.log(frames[i]);
    }


    console.log(currentFrame, frameCount);
}

async function programFrames() {
    run = 1;
    if (frameCount === 0) {
        addFrame();
    }
    while (run) {
        for (let i = 0; i < frameCount; i++) {
            if(frames[i] !== undefined) {
                await programToSerial(frames[i].framesInHex);
                await delay(slider!.innerHTML as unknown as number);
            }
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
            console.log(event!.target!);
        },
        false,
    );
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