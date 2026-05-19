import { useRef, useState } from 'react';

const PhotoUpload = ({ onPhotoChange }) => {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
      onPhotoChange(selectedFile);
    }
  };

  return (
    <div className="photo-upload-container">
      <div className="photo-preview" onClick={handleClick}>
        {preview ? (
          <img src={preview} alt="Profile preview" />
        ) : (
          <span className="photo-preview-icon">📷</span>
        )}
      </div>
      <span className="photo-upload-label">Click to upload profile photo</span>
      <input
        type="file"
        className="photo-input"
        ref={fileInputRef}
        onChange={handleChange}
        accept="image/*"
      />
    </div>
  );
};

export default PhotoUpload;
