const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const http = require("http");
const { Server } = require("socket.io");

const db = require("./db");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

/* =========================
   MIDDLEWARE
========================= */
app.use(cors({
  origin: "http://localhost:5173"
}));

app.use(express.json());

/* =========================
   CREATE UPLOAD FOLDER
========================= */
const uploadPath = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

/* =========================
   MULTER CONFIG
========================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

/* =========================
   TEST ROUTE
========================= */
app.get("/", (req, res) => {
  res.send("Backend Running");
});

/* =========================
   UPLOAD ROUTE (STABLE FIX)
========================= */
app.post("/upload", (req, res) => {
  upload.single("pdf")(req, res, (err) => {
    try {
      console.log("UPLOAD HIT");
      console.log("CONTENT-TYPE:", req.headers["content-type"]);
      console.log("FILE RECEIVED:", req.file);

      /* HANDLE MULTER ERROR */
      if (err) {
        console.log("MULTER ERROR:", err);
        return res.status(500).json({
          message: err.message,
        });
      }

      /* HANDLE NO FILE */
      if (!req.file) {
        return res.status(400).json({
          message: "No file uploaded (check key = pdf)",
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

      db.query(sql, values, (dbErr, result) => {
        if (dbErr) {
          console.log("MYSQL ERROR:", dbErr);
          return res.status(500).json({
            message: "Database insert failed",
            error: dbErr,
          });
        }

        const insertedId = result.insertId;

        /* simulate processing */
        setTimeout(() => {
          db.query(
            "UPDATE documents SET status=? WHERE id=?",
            ["Completed", insertedId]
          );

          io.emit("processingComplete", {
            id: insertedId,
            filename: req.file.originalname,
          });
        }, 3000);

        return res.json({
          message: "Upload Successful",
          file: req.file.originalname,
        });
      });

    } catch (error) {
      console.log("SERVER ERROR:", error);
      return res.status(500).json({
        message: error.message,
      });
    }
  });
});

/* =========================
   GET DOCUMENTS
========================= */
app.get("/documents", (req, res) => {
  db.query(
    "SELECT * FROM documents ORDER BY uploaded_at DESC",
    (err, result) => {
      if (err) {
        console.log("MYSQL ERROR:", err);
        return res.status(500).json(err);
      }

      res.json(result);
    }
  );
});

/* =========================
   SOCKET
========================= */
io.on("connection", () => {
  console.log("Client Connected");
});

/* =========================
   START SERVER
========================= */
server.listen(5000, () => {
  console.log("Server Running on Port 5000");
});