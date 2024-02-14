import {drawCube} from "./cube.js";

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

    let tables = getTables();
    let binary = '';
    let hex = '';

    if (tables[0] != null) {
        for (let y = 0; y < 8; y++) {
            for (let z = 0; z < 8; z++) {
                for (let x = 0; x < 8; x++) {
                    if (tables[y].rows[z].cells[x].style.backgroundColor === 'rgb(52, 152, 219)') {
                        binary = `${binary}1`
                    } else {
                        binary = `${binary}0`
                    }
                }
                hex = parseInt(binary, 2).toString(16);
                hexTable[y][z === 0 ? 0 : 8 - z] = hex.length < 2 ? `0x0${hex}` : `0x${hex}`;
                hex = 0;
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
    // return [
    //     ['0xF2', '0x01', '0x02', '0x04', '0x08', '0x10', '0x20', '0x40'],
    //     ['0x80', '0x00', '0x00', '0x00', '0x00', '0x00', '0x00', '0x00'],
    //     ['0x00', '0x00', '0x00', '0x00', '0x00', '0x00', '0x00', '0x00'],
    //     ['0x00', '0x00', '0x00', '0x00', '0x00', '0x00', '0x00', '0x00'],
    //     ['0x00', '0x00', '0x00', '0x00', '0x00', '0x00', '0x00', '0x00'],
    //     ['0x00', '0x00', '0x00', '0x00', '0x00', '0x00', '0x00', '0x00'],
    //     ['0x00', '0x00', '0x00', '0x00', '0x00', '0x00', '0x00', '0x00'],
    //     ['0x00', '0x00', '0x00', '0x00', '0x00', '0x00', '0x00', '0x00'],
    //     ['0x00', '0x00', '0x00', '0x00', '0x00', '0x00', '0x00', '0x00']
    // ];
    return hexTable;
}

export async function programToSerial(hexTable) {
    console.log(await axios.post('http://localhost:3490', {
        b: hexTable,
    }));
    drawCube();
}