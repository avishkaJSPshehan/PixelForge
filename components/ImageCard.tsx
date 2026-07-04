'use client';

interface ImageCardProps {
  src: string;
  pageNumber: number;
  onDownload: () => void;
}

export default function ImageCard({ src, pageNumber, onDownload }: ImageCardProps) {
  return (
    <div className="image-card animate-in">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={`Page ${pageNumber}`} className="image-card-thumb" />
      <div className="image-card-footer">
        <span className="image-card-label">Page {pageNumber}</span>
        <button
          className="btn btn-primary btn-sm"
          onClick={onDownload}
          id={`download-page-${pageNumber}`}
          title={`Download page ${pageNumber} as PNG`}
        >
          ⬇ PNG
        </button>
      </div>
    </div>
  );
}
