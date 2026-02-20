const express = require("express");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const cors = require("cors");

const buildGraph = require("./services/graphBuilder");
const detectCycles = require("./services/cycleDetector");
const detectSmurfing = require("./services/smurfDetector");
const detectShell = require("./services/shellDetector");
const scoreAccounts = require("./services/scoringEngine");

const app = express();
app.use(cors());

const upload = multer({ dest: "uploads/" });

app.post("/analyze", upload.single("file"), async (req, res) => {
  const startTime = Date.now();
  const transactions = [];
  const uploadPath = req.file.path;

  fs.createReadStream(uploadPath)
    .pipe(csv())
    .on("data", (row) => transactions.push(row))
    .on("end", () => {
      try {
        const graph = buildGraph(transactions);
        const cycleResults = detectCycles(graph);
        const smurfResults = detectSmurfing(graph);
        const shellResults = detectShell(graph);

        const finalOutput = scoreAccounts(
          graph,
          cycleResults,
          smurfResults,
          shellResults,
          transactions,
          startTime
        );
        fs.unlink(uploadPath, () => {});
        res.json(finalOutput);
      } catch (err) {
        console.error(err);
        fs.unlink(uploadPath, () => {});
        res.status(500).json({ error: "Processing failed" });
      }
    });
});


app.listen(5000, () =>
  console.log("🚀 Mule Detection Backend running on port 5000")
);
