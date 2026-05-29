import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function UploadBox() {

  const [file, setFile] = useState(null);

  const [progress, setProgress] = useState(0);

  const [loading, setLoading] = useState(false);

  const uploadFile = async () => {

    if (!file) {

      toast.error("Please Select PDF");

      return;
    }

    const formData = new FormData();

    formData.append("pdf", file);

    try {

      setLoading(true);

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

      toast.success("Upload Successful");

      setProgress(0);

      setLoading(false);

    } catch (error) {

      console.log(error);

      toast.error("Upload Failed");

      setLoading(false);

    }

  };

  return (
    <div className="card">

      <h2 className="upload-title">
        Upload Documents
      </h2>

      <p className="upload-subtitle">
        Upload company PDF files and track
        processing status in real time.
      </p>

      <div className="file-box">

        <p>Select PDF File</p>

        <input
          className="file-input"
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files[0])}
        />

      </div>

      <button
        className="upload-btn"
        onClick={uploadFile}
        disabled={loading}
      >
        {loading ? "Uploading..." : "Upload PDF"}
      </button>

      <div className="progress-wrapper">

        <div className="progress-top">

          <span>Upload Progress</span>

          <span>{progress}%</span>

        </div>

        <div className="progress-bar-bg">

          <div
            className="progress-bar-fill"
            style={{
              width: `${progress}%`,
            }}
          ></div>

        </div>

      </div>

    </div>
  );
}

export default UploadBox;