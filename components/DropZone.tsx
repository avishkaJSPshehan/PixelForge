'use client';

import { useRef, useState } from 'react';

interface DropZoneProps {
  accept: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  icon: string;
  title: string;
  subtitle: string;
  badge: string;
  disabled?: boolean;
}

export default function DropZone({
  accept,
  multiple = false,
  onFiles,
  icon,
  title,
  subtitle,
  badge,
  disabled = false,
}: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const arr = Array.from(files);
    onFiles(arr);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setDragging(true);
  };

  const onDragLeave = () => setDragging(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  };

  const onClick = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  return (
    <div
      className={`dropzone${dragging ? ' dragging' : ''}${disabled ? ' btn disabled' : ''}`}
      onClick={onClick}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      aria-label={`Upload ${accept} file${multiple ? 's' : ''}`}
      id="dropzone-upload"
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        style={{ display: 'none' }}
        onChange={(e) => handleFiles(e.target.files)}
        id="file-input"
      />
      <div className="dropzone-icon">{icon}</div>
      <div>
        <div className="dropzone-title">{title}</div>
        <div className="dropzone-subtitle" style={{ marginTop: 6 }}>
          {subtitle}
        </div>
      </div>
      <div className="dropzone-badge">📎 {badge}</div>
    </div>
  );
}
