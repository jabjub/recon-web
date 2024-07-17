const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const app = express();

const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

let clientSocket;
app.use(cors());
app.use(express.json());

io.on("connection", (socket) => {
  console.log("Socket connected with id:", socket.id);
  clientSocket = socket;

  socket.on("disconnect", () => {
    console.log("Socket disconnected with id:", socket.id);
    if (clientSocket === socket) {
      clientSocket = null;
    }
  });

  socket.on("userInput", (input) => {
    console.log("User input received:", input);
    if (clientSocket) {
      clientSocket.emit("executeCommand", input);
    }
  });
});

const baseFolder = path.resolve(process.env.HOME + "/Downloads");
const resultsFolder = path.join(baseFolder, "/results");
const nestedResultsFolder = path.join(resultsFolder, "/results");

const pty = require("node-pty");

app.post("/api/startScan", (req, res) => {
  const { ipAddress } = req.body;
  if (!ipAddress) {
    return res.status(400).json({ error: "IP address is required" });
  }

  const command =
    "/home/kali/.local/share/pipx/venvs/semiautorecon/bin/semiautorecon";
  const args = [ipAddress];
  const options = { cwd: resultsFolder };

  try {
    console.log("Command:", command);
    console.log("Arguments:", args);

    const shell = pty.spawn(command, args, {
      name: "xterm-color",
      cols: 80,
      rows: 30,
      cwd: resultsFolder,
      env: process.env,
    });

    clientSocket.on("userInput", (input) => {
      console.log("input", input);
      shell.write(input + "\n");
    });

    shell.on("data", (data) => {
      console.log("Semiautorecon stdout:", data.toString());

      if (
        data
          .toString()
          .includes("SemiAutoRecon wants to execute the following command")
      ) {
        clientSocket.emit("confirmationNeeded", data);
      }
    });

    shell.on("exit", (code) => {
      console.log(`Semiautorecon exited with code ${code}`);
      clientSocket.emit("scanComplete"); // Emit scan complete event

      if (code !== 0) {
        return res
          .status(500)
          .json({ error: "Semiautorecon process exited with non-zero status" });
      }

      return res.sendStatus(200);
    });
  } catch (e) {
    console.error("Error occurred:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/executeCommand", (req, res) => {
  const { command } = req.body;

  if (!command) {
    return res.status(400).json({ error: "Command is required" });
  }

  const childProcess = spawn(command, { shell: true });

  let stdoutData = "";
  let stderrData = "";

  childProcess.stdout.on("data", (data) => {
    stdoutData += data.toString();
  });

  childProcess.stderr.on("data", (data) => {
    stderrData += data.toString();
  });

  childProcess.on("close", (code) => {
    if (code !== 0) {
      console.error(`Error executing command: ${stderrData}`);

      return res.status(500).json({ error: "Command execution failed" });
    }

    console.log(`Command output: ${stdoutData}`);
    res
      .status(200)
      .json({ message: "Command executed successfully", output: stdoutData });
  });
});

app.get("/api/allData", (req, res) => {
  function readFilesAndDirectoriesRecursively(directory) {
    const items = fs.readdirSync(directory);
    const data = [];

    items.forEach((item) => {
      const itemPath = path.join(directory, item);
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        const subdirectoryData = readFilesAndDirectoriesRecursively(itemPath);
        data.push({ [item]: subdirectoryData });
      } else {
        const fileContent = fs.readFileSync(itemPath, "utf8");
        data.push({ filename: item, content: fileContent });
      }
    });

    return data;
  }

  const allData = readFilesAndDirectoriesRecursively(nestedResultsFolder);
  res.json(allData);
});

const PORT = process.env.PORT || 3002;
http.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
