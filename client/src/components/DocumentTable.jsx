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
    <div className="card">

      <div className="table-header">
        <h2>Uploaded Files</h2>
        <span>{documents.length} Documents</span>
      </div>

      <div className="table-container">

        <table className="doc-table">

          <thead>
            <tr>
              <th>File Name</th>
              <th>Status</th>
              <th>Size</th>
            </tr>
          </thead>

          <tbody>

            {documents.length > 0 ? (

              documents.map((doc) => (

                <tr key={doc.id}>

                  <td>{doc.filename}</td>

                  <td>
                    <span
                      className={
                        doc.status === "Completed"
                        ? "status completed"
                        : "status processing"
                      }
                    >
                      {doc.status}
                    </span>
                  </td>

                  <td>
                    {(doc.filesize / 1024).toFixed(2)} KB
                  </td>

                </tr>

              ))

            ) : (

              <tr>
                <td
                  colSpan="3"
                  className="empty-state"
                >
                  No documents uploaded yet
                </td>
              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default DocumentTable;