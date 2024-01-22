import './style.css'
import {
    CARRIAGE_RETURN_REGEX,
    generateMapTable,
    populateMap,
    processAdventurersSequence,
} from "./main.utils.ts";
import axios from 'axios';

// INIT SCREEN
document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <h1>Carte aux trésors</h1>
    <div class="card">
      <input type="file" name="file" id="file" class="inputfile" />
      <label for="file">Uploader une carte</label>
    </div>
     <div class="card">
      <div id="map-display"></div>
    </div>
  </div>
`;

var input = document.querySelector( '.inputfile' ) as HTMLInputElement;

// LISTEN TO UPLOADED MAPS
input?.addEventListener("change", function (e: any) {
  var reader = new FileReader();
  reader.onload = function () {   
    input!.disabled = true;
    const map =
        this.result
            ?.toString()
            .replace(/ /gm, "")
            .split(CARRIAGE_RETURN_REGEX) ?? [];

    // generate array of array of objects to populate after
    let table = generateMapTable(map);

    // populate the table objects from before by reading each line of map, get the new table and array of positions of adventurers
    let {new_table, adventurers_indexes} = populateMap(map, table);

    // process sequence movements from adventurers positions
    const new_promise = new Promise((resolve) => {
      processAdventurersSequence(new_table, adventurers_indexes, 50, resolve);
    })
    new_promise.then(res => {
      input!.disabled = false;
      console.log({res})
      axios.post('http://localhost:3000/export_map', {table: res}).then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "file.txt"); //or any other extension
        document.body.appendChild(link);
        link.click();
      })
    })
  };
  reader.readAsText(e.target.files[0], 'utf-8');

}); 