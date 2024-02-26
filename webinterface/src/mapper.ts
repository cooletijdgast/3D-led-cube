import {drawCube} from "./cube.js";



export function mapToCube() {
    const cubeSize = 8;
    let tables: (HTMLTableElement | null)[] = getTables();
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
                    cube[y][x][z] = tables[y]!.rows[x].cells[z].style.backgroundColor;
                }
            }
        }
    }
    return cube;
}

export function getTables(): HTMLTableElement[] {
    let tables: HTMLTableElement[] = [];
    for (let i = 0; i < 8; i++) {
        tables.push(document.getElementById(`table${i}`) as HTMLTableElement);
    }
    return tables;
}

export function mapToHexTable() {
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

    let tables: (HTMLTableElement | null)[] = getTables();
    let binary = '';
    let hex = '';

    if (tables[0] != null) {
        for (let y = 0; y < 8; y++) {
            for (let z = 0; z < 8; z++) {
                for (let x = 0; x < 8; x++) {
                    if (tables[y]!.rows[z].cells[x].style.backgroundColor === 'rgb(52, 152, 219)') {
                        binary = `${binary}1`
                    } else {
                        binary = `${binary}0`
                    }
                }
                hex = parseInt(binary, 2).toString(16);
                hexTable[y][z === 0 ? 0 : 8 - z] = hex.length < 2 ? `0x0${hex}` : `0x${hex}`;
                hex = '';
                binary = '';
            }
        }
        for (let i = 8; i > -1; i--) {
            if (hexTable[i][0] !== '0x00' && hexTable[i + 1][0] === '0x00') {
                hexTable[i + 1][0] = hexTable[i][0];
                hexTable[i][0] = '0x00';
            }
        }
        hexTable[0][0] = '0xF2';
    }
    console.log(hexTable);
    return hexTable;
}

export async function programToSerial(hexTable: string[][]) {
    // @ts-ignore
    await axios.post('http://192.168.2.26:3490', {
        b: hexTable,
    });
    drawCube();
}

export function loadFrameIntoTables(tablesFromFrame: HTMLTableElement[]){
    let tables = getTables();
    for (let y = 0; y < 8; y++) {
        for (let z = 0; z < 8; z++) {
            for (let x = 0; x < 8; x++) {
                tables[y].rows[x].cells[z].style.backgroundColor = tablesFromFrame[y].rows[x].cells[z].style.backgroundColor;
                console.log('loading with;', tables[y].rows[x].cells[z].style.backgroundColor, tablesFromFrame[y].rows[x].cells[z].style.backgroundColor)
            }
        }
    }
}