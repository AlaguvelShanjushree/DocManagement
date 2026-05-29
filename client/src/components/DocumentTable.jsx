import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function DocumentTable() {

  const [documents, setDocuments] = useState([]);

  const fetchDocuments = async () => {

    const res = await axios.get(
      "http://localhost:5000/documents"
    );

    setDocuments(res.data);
  };

  useEffect(() => {

    fetchDocuments();

    socket.on("processingComplete", () => {
      fetchDocuments();
    });

  }, []);

  return (
    <div
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "10px",
      }}
    >

      <h3>Uploaded Documents</h3>

      <table
        width="100%"
        cellPadding="10"
      >
        <thead>
          <tr>
            <th align="left">File Name</th>
            <th align="left">Status</th>
          </tr>
        </thead>

        <tbody>

          {documents.map((doc) => (
            <tr key={doc.id}>
              <td>{doc.filename}</td>
              <td>
                {doc.status}
              </td>
            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
}

export default DocumentTable;