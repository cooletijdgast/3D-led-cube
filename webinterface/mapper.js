const cubeSize = 8;

export function mapToCube() {
    let tables = getTables();
    let cube = new Array(cubeSize)
        .fill(null)
        .map(() => new Array(cubeSize)
            .fill(null)
            .map(() => new Array(cubeSize)
                .fill(null)));
    if (tables[0] != null) {
        for (let y = 0; y < 8; y++) {
            for (let z = 0; z < 8; z++) {
                for (let x = 0; x < 8; x++) {
                    cube[y][z][x] = tables[y].rows[x].cells[z].style.backgroundColor;
                }
            }
        }
    }
    return cube;
}

function getTables() {
    let tables = [];
    for (let i = 0; i < 8; i++) {
        tables.push(document.getElementById(`table${i}`));
    }
    return tables;
}

export function mapToHexTable(cube) {
    const hexTable = [
        ['0x00', '0x00', '0x00', '0x00', '0x00', '0x00', '0x00', '0x00'],
        ['0x00', '0x00', '0x00', '0x00', '0x00', '0x00', '0x00', '0x00'],
        ['0x00', '0x00', '0x00', '0x00', '0x00', '0x00', '0x00', '0x00'],
        ['0x00', '0x00', '0x00', '0x00', '0x00', '0x00', '0x00', '0x00'],
        ['0x00', '0x00', '0x00', '0x00', '0x00', '0x00', '0x00', '0x00'],
        ['0x00', '0x00', '0x00', '0x00', '0x00', '0x00', '0x00', '0x00'],
        ['0x00', '0x00', '0x00', '0x00', '0x00', '0x00', '0x00', '0x00'],
        ['0x00', '0x00', '0x00', '0x00', '0x00', '0x00', '0x00', '0x00'],
        ['0x00', '0x00', '0x00', '0x00', '0x00', '0x00', '0x00', '0x00']
    ];

    let rowCounter = 0;
    let tables = getTables();

    if (tables[0] != null) {
        console.log(tables[0].rows[0].cells[0].style.backgroundColor);

        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                rowCounter = 0;
                for (let k = 0; k < 8; k++) {
                    if (tables[i].rows[j].cells[k].style.backgroundColor === 'rgb(52, 152, 219)') {
                        rowCounter++;
                    }
                }
                hexTable[i][j] = getHexValue(rowCounter);
            }

            if (i > 0) {
                hexTable[i][0] = hexTable[i - 1][0];
                hexTable[i - 1][0] = '0x00';
                console.log(hexTable);
            }
        }
        hexTable[0][0] = '0xF2';
    }
}

function getHexValue(rowCounter) {
    switch (rowCounter) {
        case 1:
            return '0x01';
        case 2:
            return '0x03';
        case 3:
            return '0x07';
        case 4:
            return '0x0F';
        case 5:
            return '0x1F';
        case 6:
            return '0x3F';
        case 7:
            return '0x7F';
        case 8:
            return '0xFF';
        default:
            return '0x00';
    }
}