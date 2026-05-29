import { useState } from "react";
import axios from "axios";

function UploadBox() {

  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);

  const uploadFile = async () => {

    if (!file) {
      alert("Select PDF File");
      return;
    }

    const formData = new FormData();

    formData.append("pdf", file);

    try {

      await axios.post(
        "http://localhost:5000/upload",
        formData,
        {
          onUploadProgress: (progressEvent) => {

            const percent = Math.round(
              (progressEvent.loaded * 100) /
              progressEvent.total
            );

            setProgress(percent);
          },
        }
      );

      alert("Upload Successful");

      setProgress(0);

    } catch (error) {
      console.log(error);
    }

  };

  return (
    <div className="upload-card">

      <h2 className="upload-title">
        Upload Company Documents
      </h2>

      <input
        className="file-input"
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br />

      <button
        className="upload-btn"
        onClick={uploadFile}
      >
        Upload PDF
      </button>

      <div className="progress-container">
        <div
          className="progress-bar"
          style={{
            width: `${progress}%`,
          }}
        ></div>
      </div>

    </div>
  );
}

export default UploadBox;