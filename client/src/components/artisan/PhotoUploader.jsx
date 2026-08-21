import { useRef, useState, useCallback } from 'react';

export default function PhotoUploader({ onFilesSelected, maxFiles = 3 }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [previews, setPreviews] = useState([]);

  const handleFiles = useCallback((files) => {
    const validFiles = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .slice(0, maxFiles);

    const newPreviews = validFiles.map((f) => ({
      file: f,
      url: URL.createObjectURL(f),
      name: f.name,
    }));

    setPreviews(newPreviews);
    onFilesSelected(validFiles);
  }, [maxFiles, onFilesSelected]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const removePreview = (index) => {
    const updated = previews.filter((_, i) => i !== index);
    setPreviews(updated);
    onFilesSelected(updated.map((p) => p.file));
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          dragOver
            ? 'border-paytm-cyan bg-paytm-cyan/10'
            : 'border-gray-200 hover:border-paytm-cyan hover:bg-paytm-bg'
        }`}
      >
        <div className="flex flex-col items-center gap-3">
          <svg className="w-12 h-12 text-paytm-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <div>
            <p className="font-semibold text-paytm-navy">Drop photos here or click to browse</p>
            <p className="text-sm text-gray-400 mt-1">Up to {maxFiles} photos · JPG, PNG, WEBP</p>
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {previews.map((preview, i) => (
            <div key={i} className="relative group aspect-square">
              <img
                src={preview.url}
                alt={preview.name}
                className="w-full h-full object-cover rounded-xl"
              />
              <button
                onClick={(e) => { e.stopPropagation(); removePreview(i); }}
                className="absolute top-1 right-1 w-6 h-6 bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="absolute bottom-1 left-1 bg-paytm-navy/70 text-white text-xs px-1.5 py-0.5 rounded">
                Photo {i + 1}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
