import React, { useRef } from 'react';
import { FileInfo } from '@/types/type';

interface FileUploadProps {
  onFileUpload: (fileInfo: FileInfo) => void;
}


function FileUpload({ onFileUpload }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload({
        name: file.name,
        type: file.type,
        size: file.size
      });
    }
  };

  return (
    <div className="file-upload">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="upload-button"
      >
        📁 上传文件
      </button>
    </div>
  );
};

export default FileUpload;