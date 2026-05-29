const express = require("express");
const cors = require("cors");
const multer = require("multer");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");

const db = require("./db");

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());

/* =========================
   CREATE UPLOADS FOLDER
========================= */

if (!fs.existsSync("./uploads")) {
  fs.mkdirSync("./uploads");
}

/* =========================
   MULTER STORAGE
========================= */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

/* =========================
   FILE FILTER
========================= */

const fileFilter = (req, file, cb) => {

  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files allowed"), false);
  }

};

const upload = multer({
  storage,
  fileFilter,
});

/* =========================
   HOME ROUTE
========================= */

app.get("/", (req, res) => {
  res.send("Backend Running");
});

/* =========================
   UPLOAD ROUTE
========================= */

app.post("/upload", upload.single("pdf"), (req, res) => {

  if (!req.file) {
    return res.status(400).json({
      message: "No file uploaded",
    });
  }

  const sql = `
    INSERT INTO documents
    (filename, filepath, filesize, status)
    VALUES (?, ?, ?, ?)
  `;

  const values = [
    req.file.originalname,
    req.file.path,
    req.file.size,
    "Processing",
  ];

  db.query(sql, values, (err, result) => {

    if (err) {
      console.log(err);

      return res.status(500).json({
        message: "Database Error",
      });
    }

    const insertedId = result.insertId;

    /* =========================
       SIMULATE PROCESSING
    ========================= */

    setTimeout(() => {

      db.query(
        "UPDATE documents SET status=? WHERE id=?",
        ["Completed", insertedId],
        (err) => {

          if (err) {
            console.log(err);
          }

        }
      );

      io.emit("processingComplete", {
        id: insertedId,
        filename: req.file.originalname,
      });

    }, 5000);

    res.json({
      message: "Upload Successful",
      file: req.file.originalname,
    });

  });

});

/* =========================
   GET DOCUMENTS
========================= */

app.get("/documents", (req, res) => {

  const sql = `
    SELECT * FROM documents
    ORDER BY uploaded_at DESC
  `;

  db.query(sql, (err, result) => {

    if (err) {

      console.log(err);

      return res.status(500).json({
        message: "Database Error",
      });

    }

    res.json(result);

  });

});

/* =========================
   SOCKET CONNECTION
========================= */

io.on("connection", (socket) => {
  console.log("Client Connected");
});

/* =========================
   START SERVER
========================= */

server.listen(5000, () => {
  console.log("Server Running on Port 5000");
});