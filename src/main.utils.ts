export const TIME_BETWEEN_MOVES = 100;

export interface Position {
    x: number;
    y: number;
}

export interface Adventurer {
    orientation?: string;
    position?: Position;
    sequence?: string[];
    name?: string;
    sprite?: number;
    treasure: number;
}

export interface CaseType {
    treasure?: number;
    mountain?: boolean;
    adventurer?: Adventurer;
}

export interface Case {
    objects?: CaseType;
}

export const Orientation = {
    S: "down",
    N: "up",
    W: "left",
    E: "right",
    down: "S",
    up: "N",
    left: "W",
    right: "E",
};

export const ChangeOrientation = (orientation: string | undefined, direction: string) => {
    if(direction === 'G') {
        switch(orientation) {
            case "up":
                return "left";
            case "down":
                return "right";
            case "left":
                return "down";
            case "right":
                return "up";
            default:
                throw (new Error("bad orientation !"));
        }
    }
    else {
        switch(orientation) {
            case "up":
                return "right";
            case "down":
                return "left";
            case "left":
                return "up";
            case "right":
                return "down";
            default:
                throw (new Error("bad orientation !"));
        }
    }
}

export const CARRIAGE_RETURN_REGEX = /\r\n|\r|\n/gm;

export const generateMapTable = (map: string[]) => {
    // filter comments
    const _map = map.filter((e) => e.trim()[0] !== "#");
    let mapSize = ["0", "0"];
    // check line and first letter to see it's really map data
    _map.forEach((line) => {
        if (line.trim()[0] === "C") {
            mapSize = line.trim().split("-").slice(1, 3);
        }
    });

    // init table map from mapSize
    const table: Case[][] = Array.from({ length: Number(mapSize[1]) }, () =>
        Array.from({ length: Number(mapSize[0]) }, () => ({
            objects: {},
        }))
    );
    return table;
}

// populate table-map with data (mountains, treasures, adventurer)
export const populateMap = (map: string[], table: Case[][]) => {
    let adventurers_indexes: Position[] = [];
    // deep copy
    let new_table: Case[][] = JSON.parse(JSON.stringify(table));
    map.forEach(value => {
        const data = value.split('-');
        const y = Number(data[2]);
        const x = Number(data[1]);

        if (data[0] === "M") {
            new_table[y][x].objects!.mountain! = true;
        }
        if (data[0] === "A") {
            const y = Number(data[3]);
            const x = Number(data[2]);
            adventurers_indexes.push({x, y});
            
            new_table[y][x].objects!.adventurer = {
                name: data[1],
                orientation: Orientation[data[4] as keyof typeof Orientation],
                position: { x, y },
                sequence: data[5].split(''),
                sprite: Math.floor(Math.random() * 5 + 1),
                treasure: 0,
            };
        }
        if (data[0] === "T") {
            let i = 0;
            while(i++ < Number(data[3])) {
                if (new_table[y][x].objects?.treasure == null) new_table[y][x].objects = { treasure: 0 };
                new_table[y][x].objects!.treasure!++;
            }
        }
    });
    
    return {new_table, adventurers_indexes};
};

export const generateTableHTML = (table: Case[][]) => {
    let html: string = `<table class="map-table">`;
    table.forEach((value) => {
        html = html.concat('<tr>');
        value.forEach((elem) => {
            const obj: CaseType = elem?.objects ?? {};
            html = html.concat(`<td class="map-cell">`);
            if(obj.mountain) {
                html = html.concat('<img src="/src/assets/mountain.png" class="img" />');
            }
            if (obj.adventurer) {
                const orientation = obj.adventurer.orientation;
                const sprite_number = obj.adventurer.sprite;
                html = html.concat(
                    `<img src="/src/assets/adventurers/adventurer${sprite_number}_${orientation}.png" class="img-adv" />
                    <span class="adv-name">${obj.adventurer.name}(${obj.adventurer.treasure})</span>`
                );
            }
            if (obj.treasure && obj.treasure > 0) { 
                html = html.concat(
                    `<img src="/src/assets/tresor.png" class="img" /><span class="treasure-number">${obj.treasure}</span>`
                );
            }
                
            html = html.concat(`</td>`);            
        });
        html = html.concat("</tr>");
    });
    return html.concat('</table>');
}

const move = (
    obj: CaseType,
    _old_obj: CaseType,
    newPosition: Position,
    adv_ind: Position,
    out_of_bonds: Position
) => {
    // if mountain, adventurer or out of bound, don't move
    if (obj?.mountain || obj?.adventurer || newPosition.x < 0 || newPosition.y < 0 || 
        newPosition.x > out_of_bonds.x || newPosition.y > out_of_bonds.y) return;
    else {
        if(obj?.treasure) {
            obj.treasure--;
            const number_of_treasure = Number(_old_obj.adventurer?.treasure);
            obj!.adventurer = { ..._old_obj.adventurer, position: newPosition, treasure: Number(number_of_treasure) };
            obj.adventurer!.treasure++;
        }
        else {
            obj!.adventurer = { ..._old_obj.adventurer, position: newPosition, treasure: _old_obj.adventurer?.treasure ?? 0};
        }
        adv_ind.x = newPosition.x;
        adv_ind.y = newPosition.y;
        delete _old_obj!.adventurer;
    }
};

const processMoveOrOrientation = (
    letter: string,
    table: Case[][],
    adv_ind: Position
) => {
    let _old_obj = table[adv_ind.y][adv_ind.x]?.objects ?? {};
    let adventurer = _old_obj?.adventurer;
    const out_of_bonds = {y: table.length-1, x: table[0].length-1}
    switch (letter) {
        case "A":
            //check if mountain or other player in front then do not move
            switch (adventurer?.orientation) {
                case "up": {
                    let _obj = table[adv_ind.y - 1]?.[adv_ind.x]?.objects ?? {};
                    move(
                        _obj,
                        _old_obj,
                        { ...adv_ind, y: adv_ind.y - 1 },
                        adv_ind,
                        out_of_bonds
                    );
                    break;
                }
                case "down": {
                    let _obj = table[adv_ind.y + 1]?.[adv_ind.x]?.objects ?? {};
                    move(
                        _obj,
                        _old_obj,
                        { ...adv_ind, y: adv_ind.y + 1 },
                        adv_ind,
                        out_of_bonds
                    );
                    break;
                }
                case "left": {
                    let _obj = table[adv_ind.y]?.[adv_ind.x - 1]?.objects ?? {};
                    move(
                        _obj,
                        _old_obj,
                        { ...adv_ind, x: adv_ind.x - 1 },
                        adv_ind,
                        out_of_bonds
                    );
                    break;
                }
                case "right": {
                    let _obj = table[adv_ind.y]?.[adv_ind.x + 1]?.objects ?? {};
                    move(
                        _obj,
                        _old_obj,
                        { ...adv_ind, x: adv_ind.x + 1 },
                        adv_ind,
                        out_of_bonds
                    );
                    break;
                }
                default:
                    break;
            }
            break;
        case "G":
            adventurer!.orientation = ChangeOrientation(adventurer?.orientation, "G");
            break;
        case "D":
            adventurer!.orientation = ChangeOrientation(adventurer?.orientation, "D");
            break;
        default:
            break;
    }
}; 

export const processAdventurersSequence = (table: Case[][], adventurers_indexes: Position[], timeBetweenMoves = 200, resolve: any) => {
    let new_adv_indexes = adventurers_indexes;
    adventurers_indexes.forEach((adv_ind, index) => {
        setTimeout(() => {
            // we remove first movement of sequence
            const sequence = table[adv_ind.y][adv_ind.x]?.objects?.adventurer?.sequence?.shift();
            // if undefined, it means no more movements left, so we remove the adventurer position (splice), else process move / orientation
            if (sequence) {
                processMoveOrOrientation(sequence, table, adv_ind);
                // once move / orientation done, we update the display
                document.querySelector<HTMLDivElement>(
                    "#map-display"
                )!.innerHTML = generateTableHTML(table);
            } else new_adv_indexes.splice(index, 1);
        }, index * timeBetweenMoves);
    });
    // recursivity, we call it again and again until there's no adventurers movements left
    if(new_adv_indexes.length !== 0) {
        setTimeout(() => {
            return processAdventurersSequence(table, new_adv_indexes, timeBetweenMoves, resolve);
        }, timeBetweenMoves * new_adv_indexes.length);
    }
    if(new_adv_indexes.length === 0) {
        resolve(table);
    }
};

export const convertToExportMap = (table: Case[][]) => {
    let file = `C - ${table[0].length} - ${table.length}\r\n`;
    let mountain_lines: string[] = [], treasure_lines: string[] = [], adventurer_lines: string[] = [];
    table?.forEach((x, xIndex) => {
        x?.forEach((cell, yIndex) => {
            if(cell?.objects?.mountain) {
                mountain_lines.push(`M - ${xIndex} - ${yIndex}`);
            }
            if(cell?.objects?.treasure && cell?.objects?.treasure > 0) {
                treasure_lines.push(`T - ${xIndex} - ${yIndex} - ${cell.objects?.treasure}`);
            }
            if(cell?.objects?.adventurer) {
                const adv = cell.objects?.adventurer;
                adventurer_lines.push(`A - ${adv?.name} - ${xIndex} - ${yIndex} - ${Orientation[adv.orientation as keyof typeof Orientation]} - ${adv.treasure}`);
            }
        });
    });

    mountain_lines.forEach((m) => file = file.concat(m + '\r\n'));
    treasure_lines.forEach((m) => file = file.concat(m + "\r\n"));
    adventurer_lines.forEach((m) => file = file.concat(m + "\r\n"));
    return file;
};