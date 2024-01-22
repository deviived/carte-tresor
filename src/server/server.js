import express from "express";
import cors from 'cors'
import { writeFile, readFileSync } from "fs";
import { convertToExportMap } from "./utils.js";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.get("/", (_, res) => {
    res.send("Welcome to my server!");
});

app.post("/export_map", async (req, res) => {
    const output = convertToExportMap(req.body?.table);
    await writeFile("output_map.txt", output, (err) => {
        if (err) console.error(err);
        else {
            console.log("File written successfully\n");
            console.log("The written has the following contents:");
            console.log(readFileSync("output_map.txt", "utf8"));
            res.download("output_map.txt");
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
