const Orientation = {
    down: "S",
    up: "N",
    left: "W",
    right: "E",
};

export const convertToExportMap = (table) => {
    let file = `C - ${table[0].length} - ${table.length}\r\n`;
    let mountain_lines = [], treasure_lines = [], adventurer_lines = [];
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
                adventurer_lines.push(`A - ${adv?.name} - ${xIndex} - ${yIndex} - ${Orientation[adv.orientation]} - ${adv.treasure}`);
            }
        });
    });

    mountain_lines.forEach((m) => file = file.concat(m + '\r\n'));
    treasure_lines.forEach((m) => file = file.concat(m + "\r\n"));
    adventurer_lines.forEach((m) => file = file.concat(m + "\r\n"));
    return file;
};