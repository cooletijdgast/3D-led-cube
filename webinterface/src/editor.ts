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
        table.style.float = 'left';
        table.style.display = 'inline';
        table.style.height = '380px';
        let checkmark = document.createElement('input');
        checkmark.type = 'checkbox';
        checkmark.id = `check${t}`;
        checkmark.addEventListener('mousedown', (event) => {
            if (event.target instanceof Element) {
                let table: HTMLTableElement = document.getElementById(`table${event.target!.id.slice(5)}`) as HTMLTableElement;
                for (let i = 0; i < cubeSize; i++) {
                    for (let j = 0; j < cubeSize; j++) {
                        if (table.dataset.full === 'full') {
                            table.rows[i].cells[j].style.backgroundColor = '#FFFFFF';
                        } else {
                            table.rows[i].cells[j].style.backgroundColor = '#3498DB';
                        }
                    }
                }
                if (table.dataset.full === 'full') {
                    table.dataset.full = '';
                } else {
                    table.dataset.full = 'full';
                }
            }
        })
        let caption = document.createElement("caption");
        caption.innerText = `Layer ${t + 1}`;
        caption.style.display = 'inline-block';
        caption.style.paddingRight = '10px';
        caption.style.paddingLeft = '5px';
        document.getElementById('table')!.appendChild(table);
        document.getElementById(`table${t}`)!.appendChild(caption);
        document.getElementById(`table${t}`)!.appendChild(checkmark);
    }
}

function addEventListeners(newCell: HTMLTableCellElement) {
    newCell.addEventListener(
        "mousedown",
        (event) => {
            mouseDown = true;
            if (event.target instanceof HTMLElement) {
                let c = event.target.style.backgroundColor;
                let rgb = c.replace(/^rgba?\(|\s+|\)$/g, '').split(',');

                if ((rgbToHex(Number(rgb[0]), Number(rgb[1]), Number(rgb[2])) === '#3498db')) {
                    event.target.style.backgroundColor = '#ffffff';
                } else {
                    event.target.style.backgroundColor = '#3498db';
                }
            }
        },
        false,
    );
    newCell.addEventListener(
        "mouseover",
        (event) => {
            if (mouseDown && event.target instanceof HTMLElement) {
                event.target.style.backgroundColor = '#3498db';
            }
        },
        false,
    );
    onmouseup = () => {
        mouseDown = false;
    };
}

function rgbToHex(r: number, g: number, b: number) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function componentToHex(c: number) {
    if (c === undefined) {
        c = 0;
    }
    let hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}
