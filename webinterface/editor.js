const cubeSize = 8;
let mouseDown = false;

makeTables();

function makeTables() {
    for (let t = 0; t < cubeSize; t++) {
        let table = document.createElement("table");
        table.id = `table${t}`;
        for (let i = 0; i < cubeSize; i++) {
            let newRow = table.insertRow(-1);
            for (let j = 0; j < cubeSize; j++) {
                let newCell = newRow.insertCell(-1);
                newCell.style.backgroundColor = '#ffffff';
                addEventListeners(newCell);
            }
        }
        let caption = document.createElement("caption");
        caption.innerText = `Layer ${t + 1}`;
        document.getElementById('table').appendChild(table);
        document.getElementById(`table${t}`).appendChild(caption);
    }
}

function addEventListeners(newCell) {
    newCell.addEventListener(
        "mousedown",
        (event) => {
            mouseDown = true;
            let c = event.target.style.backgroundColor;
            let rgb = c.replace(/^rgba?\(|\s+|\)$/g, '').split(',');

            if ((rgbToHex(Number(rgb[0]), Number(rgb[1]), Number(rgb[2])) === '#3498db')) {
                event.target.style.backgroundColor = '#ffffff';
            } else {
                event.target.style.backgroundColor = '#3498db';
            }
        },
        false,
    );
    newCell.addEventListener(
        "mouseover",
        (event) => {
            if (mouseDown) {
                event.target.style.backgroundColor = '#3498db';
            }
        },
        false,
    );
    onmouseup = () => {
        mouseDown = false;
    };
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function componentToHex(c) {
    if (c === undefined) {
        c = 0;
    }
    let hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}
