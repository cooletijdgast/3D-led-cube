import {mapToHexTable, programToSerial} from "./mapper.js";

let slider = document.getElementById('delay');
let inputDelay = document.getElementById('delayInput');


let frames = [];
let frameCount = 0;

document.getElementById('frame').addEventListener("click", addFrame);
document.getElementById('program').addEventListener("click", programFrames);

inputDelay.oninput = function (){
    slider.value = this.value;
}

slider.oninput = function () {
    inputDelay.value = this.value;
}

function addFrame(){
    frames.push(mapToHexTable());
    frameCount++;
    console.log(frames);
}

async function programFrames(){
    for(let i = 0; i < frameCount; i++){
        console.log('programFrames', frames[i]);
        await programToSerial(frames[i]);
    }
}