import { useState } from "react";
import axios from "axios";

function UploadBox() {

  const [file, setFile] = useState(null);

  const [progress, setProgress] = useState(0);

  const uploadFile = async () => {

    if (!file) {
      alert("Select PDF");
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
    <div
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "10px",
        marginBottom: "20px",
      }}
    >

      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button
        onClick={uploadFile}
        style={{
          marginLeft: "10px",
          background: "#2563eb",
          color: "white",
          border: "none",
          padding: "10px 15px",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Upload
      </button>

      <div
        style={{
          marginTop: "15px",
          background: "#ddd",
          height: "10px",
          borderRadius: "10px",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            background: "#2563eb",
            height: "10px",
            borderRadius: "10px",
          }}
        ></div>
      </div>

    </div>
  );
}

export default UploadBox;