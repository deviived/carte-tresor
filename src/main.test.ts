import { describe, expect, test } from "@jest/globals";
import { CARRIAGE_RETURN_REGEX, Case, Position, convertToExportMap, generateMapTable, populateMap, processAdventurersSequence } from "./main.utils";

describe("tests on main.ts", () => {
    const map =
        "C - 3 - 4\r\nM - 1 - 0\r\nM - 2 - 1\r\nT - 0 - 3 - 2\r\nT - 1 - 3 - 3\r\nA - Lara - 1 - 1 - S - AADADAGGA"
            .replace(/ /gm, "")
            .split(CARRIAGE_RETURN_REGEX) ?? [];

    const adventurer_base = (sequence: boolean, orientation: string, number_of_treasure: number) => {
        return {    
            name: "Lara",
            orientation,
            position: { x: 1, y: 1 },
            sequence: sequence ? ["A", "G", "A", "G", "A", "G", "A"] : [],
            sprite: 1,
            treasure: number_of_treasure ? number_of_treasure : 0,
        };};
    
    test("generate empty table", () => {
        expect(generateMapTable(map).length).toBe(4);       // y
        expect(generateMapTable(map)[0].length).toBe(3);    // x
    });

    test("populate table - moutains", () => {
        const map_moutains = ["M-0-0", "M-2-0", "M-1-1", "M-0-2"];
        const table_empty: Case[][] = [
            [{ objects: {} }, { objects: {} }, { objects: {} }],
            [{ objects: {} }, { objects: {} }, { objects: {} }],
            [{ objects: {} }, { objects: {} }, { objects: {} }],
        ];
        const {new_table, adventurers_indexes} = populateMap(map_moutains, table_empty);
        //expected table :
        const table_x_mountains: Case[][] = [
            [{ objects: { mountain: true } }, { objects: {} }, { objects: {mountain: true} }],
            [{ objects: {} }, { objects: { mountain: true } }, { objects: {} }],
            [{ objects: {mountain: true} }, { objects: {} }, { objects: {} }],
        ];
        expect(adventurers_indexes?.length).toBe(0);
        const table_to_log = new_table.map((e: Case[]) => e.map(j => (j.objects?.mountain ? 'M' : ' ')));
        /* X _ X  <-- expected
           _ X _
           X _ _ */
        console.table(table_to_log);
        expect(new_table).toEqual(table_x_mountains);
    });

    test("populate table - treasures", () => {
        const map_treasures = ["T-0-0-1", "T-2-0-2", "T-1-1-5", "T-0-2-3"];
        const table_empty: Case[][] = [
            [{ objects: {} }, { objects: {} }, { objects: {} }],
            [{ objects: {} }, { objects: {} }, { objects: {} }],
            [{ objects: {} }, { objects: {} }, { objects: {} }],
        ];
        const { new_table, adventurers_indexes } = populateMap(map_treasures, table_empty);
        //expected table :
        const table_x_treasures: Case[][] = [
            [{ objects: { treasure: 1 } }, { objects: {} }, { objects: { treasure: 2 } }],
            [{ objects: {} }, { objects: { treasure: 5 } }, { objects: {} }],
            [{ objects: { treasure: 3 } }, { objects: {} }, { objects: {} }],
        ];
        expect(adventurers_indexes?.length).toBe(0);
         const table_to_log = new_table.map((e: Case[]) => e.map((j) => (j.objects?.treasure ? j.objects?.treasure : " ")));
         /* 1 _ 2   <-- expected
            _ 5 _
            3 _ _ */
        console.table(table_to_log);
        expect(new_table).toEqual(table_x_treasures);
       
    });

    test("populate table - adventurers", () => {
        const map_adv = ["A-Ben-1-1-N-GGDAGGADA"];
        const table_empty: Case[][] = [
            [{ objects: {} }, { objects: {} }, { objects: {} }],
            [{ objects: {} }, { objects: {} }, { objects: {} }],
            [{ objects: {} }, { objects: {} }, { objects: {} }],
        ];
        const { new_table, adventurers_indexes } = populateMap(map_adv, table_empty);
        //expected object :
        const expected = {
            objects: {
                adventurer: {
                    name: "Ben",
                    position: { x: 1, y: 1 },
                    orientation: "up",
                    sequence: ['G','G','D','A','G','G','A','D','A'],
                    sprite: expect.any(Number), 
                },
            },
        };
        expect(adventurers_indexes?.length).toBe(1);
        expect(adventurers_indexes[0]).toEqual({x:1,y:1});
        const table_to_log = new_table.map((e: Case[]) => e.map((j) => (j.objects?.adventurer?.name?.slice(0,1) ? j.objects?.adventurer?.name?.slice(0,1) : " ")));
        /*  _ _ _   <-- expected
            _ _ _
            _ A _ */
        console.table(table_to_log);
        expect(new_table[1][1]).toMatchObject(expected);
        
    });

    test("populate table - everything", () => {
        const table_empty: Case[][] = [
            [{ objects: {} }, { objects: {} }, { objects: {} }],
            [{ objects: {} }, { objects: {} }, { objects: {} }],
            [{ objects: {} }, { objects: {} }, { objects: {} }],
            [{ objects: {} }, { objects: {} }, { objects: {} }],
        ];
        const { new_table, adventurers_indexes } = populateMap(map, table_empty);
        ("C - 3 - 4\r\nM - 1 - 0\r\nM - 2 - 1\r\nT - 0 - 3 - 2\r\nT - 1 - 3 - 3\r\nA - Lara - 1 - 1 - S - AADADAGGA");
        //expected table :
        const expected_table = [
            [{ objects: {} }, { objects: { mountain: true } }, { objects: {} }],
            [{ objects: {} }, { objects: {adventurer: {name: 'Lara', orientation: 'down', position: {x:1, y:1}, sequence: ['A','A','D','A','D','A','G','G','A'],
                    sprite: expect.any(Number), treasure: 0 }} }, { objects: { mountain: true } }],
            [{ objects: {} }, { objects: {} }, { objects: {} }],
            [{ objects: {treasure: 2} }, { objects: {treasure: 3} }, { objects: {} }],
        ];
        expect(adventurers_indexes?.length).toBe(1);
        expect(adventurers_indexes[0]).toEqual({ x: 1, y: 1 });
        const table_to_log = new_table.map((e: Case[]) => e.map((j: Case) => {
            if(j.objects?.mountain) return 'M';
            if(j.objects?.treasure) return 'T';
            if(j.objects?.adventurer) return 'A';
        }));
        /*  __  M_  __   <-- expected
            __  A_  M_
            __  __  __
            T2  T3  __ */
        console.table(table_to_log);
        expect(new_table).toEqual(expected_table);
    });

    // cases to cover : -> adventure cannot do move 'A' because off limits or moutains or other adventurers
    test("process adventurers moves - no obstacle", async () => {
        document.body.innerHTML = `<div id="map-display"></div>`;
        
        const populated_table = [
            [{ objects: {} }, { objects: { mountain: true } }, { objects: {} }],
            [{ objects: {} }, { objects: {adventurer: {name: 'Lara', orientation: 'down', position: {x:1, y:1}, sequence: ['A','A','D','A','D','A','G','G','A'],
                    sprite: 1, treasure: 0 }} }, { objects: { mountain: true } }],
            [{ objects: {} }, { objects: {} }, { objects: {} }],
            [{ objects: {treasure: 2} }, { objects: {treasure: 3} }, { objects: {} }],
        ];
        const expected_processed_table = [
            [{ objects: {} }, { objects: { mountain: true } }, { objects: {} }],
            [{ objects: {} }, { objects: {} }, { objects: { mountain: true } }],
            [{ objects: {} }, { objects: {} }, { objects: {} }],
            [{ objects: {treasure: 0, adventurer: {name: 'Lara', orientation: 'down', position: {x:0, y:3}, sequence: [],
                    sprite: 1, treasure: 3 }} }, { objects: {treasure: 2} }, { objects: {} }],
        ];
        const adventurers_indexes: Position[] = [{x:1,y:1}];

        const processed_sequence = new Promise((resolve) => {
           processAdventurersSequence(populated_table, adventurers_indexes, 0, resolve);
        });
        const res = await processed_sequence;
        expect(res).toEqual(expected_processed_table);
    });

    test("process adventurers moves - out_of_bounds", async () => {
        document.body.innerHTML = `<div id="map-display"></div>`;
        
        const populated_table = [
            [{ objects: { adventurer: adventurer_base(true, "down", 0) } }],
        ];
        const expected_processed_table = [
            [{ objects: { adventurer: adventurer_base(false, "left", 0) } }],
        ];
        const adventurers_indexes: Position[] = [{x:0,y:0}];

        const processed_sequence = new Promise((resolve) => {
           processAdventurersSequence(populated_table, adventurers_indexes, 0, resolve);
        });
        const res = await processed_sequence;
        expect(res).toEqual(expected_processed_table);
    });

    // test("should throw an error if bad orientation", () => {
    //     document.body.innerHTML = `<div id="map-display"></div>`;
        
    //     const populated_table = [
    //         [{ objects: { adventurer: adventurer_base(false, "test", 0) } }],
    //     ];
    //     const adventurers_indexes: Position[] = [{x:0,y:0}];

    //     const processed_sequence = new Promise((resolve, reject) => {
    //        processAdventurersSequence(populated_table, adventurers_indexes, 0, resolve, reject);
    //     });

    //     expect(async () => {
    //         await processed_sequence;
    //     }).rejects.toThrow();
    // });

    test("process adventurers moves - moutains", async () => {
        document.body.innerHTML = `<div id="map-display"></div>`;
        // as adventurer is surrounded by moutains he cannot move anywhere
        const populated_table = [
            [{ objects: {} }, { objects: {mountain: true} }, { objects: {} }],
            [{ objects: {mountain: true} }, { objects: {adventurer: adventurer_base(true, "down", 0)} }, { objects: {mountain: true} }],
            [{ objects: {} }, { objects: {mountain: true} }, { objects: {} }],
        ];
        const expected_processed_table = [
            [{ objects: {} }, { objects: {mountain: true} }, { objects: {} }],
            [{ objects: {mountain: true} }, { objects: {adventurer: adventurer_base(false, "left", 0)} }, { objects: {mountain: true} }],
            [{ objects: {} }, { objects: {mountain: true} }, { objects: {} }],
        ];
        const adventurers_indexes: Position[] = [{x:1,y:1}];

        const processed_sequence = new Promise((resolve) => {
           processAdventurersSequence(populated_table, adventurers_indexes, 0, resolve);
        });
        const res = await processed_sequence;
        expect(res).toEqual(expected_processed_table);
    });

    test("process adventurers moves - other adventurers - static", async () => {
        document.body.innerHTML = `<div id="map-display"></div>`;
        // as adventurer is surrounded by adventurers he cannot move anywhere
        const adventurer_no_move = (x: number, y: number) => {
            return {
            name: "Lara",
            orientation: "down",
            position: { x, y },
            sequence: [],
            sprite: 1,
            treasure: 0
        }};
        const populated_table = [
            [{ objects: {} }, { objects: {adventurer:adventurer_no_move(1, 0)} }, { objects: {} }],
            [{ objects: {adventurer:adventurer_no_move(0, 1)} }, { objects: {adventurer:adventurer_base(true, "down", 0)}}, { objects: {adventurer:adventurer_no_move(2, 1)} }],
            [{ objects: {} }, { objects: {adventurer:adventurer_no_move(1, 2)} }, { objects: {} }],
        ];
        const expected_processed_table = [
            [{ objects: {} }, { objects: {adventurer:adventurer_no_move(1, 0)} }, { objects: {} }],
            [{ objects: {adventurer:adventurer_no_move(0, 1)} }, { objects: {adventurer: adventurer_base(false, "left", 0)} }, { objects: {adventurer:adventurer_no_move(2, 1)} }],
            [{ objects: {} }, { objects: {adventurer:adventurer_no_move(1, 2)} }, { objects: {} }],
        ];
        const adventurers_indexes: Position[] = [{x:1,y:1}];

        const processed_sequence = new Promise((resolve) => {
           processAdventurersSequence(populated_table, adventurers_indexes, 0, resolve);
        });
        const res = await processed_sequence;
        expect(res).toEqual(expected_processed_table);
    });

    test("process adventurers moves - other adventurers - movements", async () => {
        document.body.innerHTML = `<div id="map-display"></div>`;
        // tests every case we can: previous case occupied but not anymore, case previously not occupied but now it is...etc, check test_adv_cases.png
        const adventurer_move = (name:string, x: number, y: number, orientation: string, sequence: string[], treasure: number) => {
            return {
                name,
                orientation,
                position: { x, y },
                sequence,
                sprite: 1,
                treasure: treasure,
            };};
        const populated_table = [
            [{ objects: {adventurer:adventurer_move("Ana", 0, 0, "right", ["A", "D", "A"], 0)} }, { objects: {} }, { objects: {adventurer:adventurer_move("Bob", 2, 0, "left", ["A", "A", "A", "A"], 0)} }],
            [{ objects: {} }, { objects: {adventurer:adventurer_move("Charles", 1, 1, "up", ["A", "G", "A", "A"], 0)}}, { objects: {} }],
            [{ objects: {adventurer:adventurer_move("Roger", 0, 2, "right", ["A", "A", "A"], 0)} }, { objects: {} }, { objects: {adventurer:adventurer_move("Mathilde", 2, 2, "left", ["A", "D", "A"], 0)} }],
        ];
        const expected_processed_table = [
            [{ objects: {adventurer:adventurer_move("Charles", 0, 0, "left", [], 0)} }, { objects: {adventurer:adventurer_move("Bob", 1, 0, "left", [], 0)} }, { objects: {} }],
            [{ objects: {adventurer:adventurer_move("Ana", 0, 1, "down", [], 0)} }, { objects: {adventurer:adventurer_move("Mathilde", 1, 1, "up", [], 0)} }, { objects: {} }],
            [{ objects: {} }, { objects: {adventurer:adventurer_move("Roger", 1, 2, "right", [], 0)} }, { objects: {} }],
        ];
        const adventurers_indexes: Position[] = [{x:1,y:1}, {x:0,y:0}, {x:2,y:0}, {x:2,y:2}, {x:0,y:2}];

        const processed_sequence = new Promise((resolve) => {
           processAdventurersSequence(populated_table, adventurers_indexes, 0, resolve);
        });
        const res = await processed_sequence;
        expect(res).toEqual(expected_processed_table);
    });

    // for server method to generate file, call method here and mock call and test return value from method
    // instead of calling api endpoint we simulate it by calling the same method as server.mjs is calling
    test("export - convert to final file", async () => {  
        const expected_processed_table = [
            [{ objects: {} }, { objects: { mountain: true } }, { objects: {} }],
            [{ objects: {} }, { objects: {} }, { objects: { mountain: true } }],
            [{ objects: {} }, { objects: {} }, { objects: {} }],
            [{ objects: {treasure: 0, adventurer: {name: 'Lara', orientation: 'down', position: {x:0, y:3}, sequence: [],
                    sprite: 1, treasure: 3 }} }, { objects: {treasure: 2} }, { objects: {} }],
        ];

        const expected_output = 'C - 3 - 4\r\nM - 0 - 1\r\nM - 1 - 2\r\nT - 3 - 1 - 2\r\nA - Lara - 3 - 0 - S - 3\r\n';

        const output = convertToExportMap(expected_processed_table);
        expect(output).toEqual(expected_output);
    });
});
