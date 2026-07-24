'use client';

import { useState, useRef, useTransition, useActionState, useEffect } from 'react';

// Types
interface UploadFormState {
  error: string | null;
  success: boolean;
}

interface UploadFormProps {
  onUploaded?: () => void;
}

// Server Action
async function uploadFile(prevState: UploadFormState, formData: FormData): Promise<UploadFormState> {
  try {
    const file = formData.get('file') as File;
    if (!file) {
      return { error: 'Please select a file', success: false };
    }

    const response = await fetch('/api/uploads', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      return { error: error.message || 'Upload failed', success: false };
    }

    return { error: null, success: true };
  } catch (error) {
    return { error: 'An unexpected error occurred', success: false };
  }
}

export function UploadForm({ onUploaded }: UploadFormProps) {
  const [isPending, startTransition] = useTransition();
  const [state, formAction] = useActionState(uploadFile, {
    error: null,
    success: false,
  });

  // Local state
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    state.error = null;
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  // Submit handler
  const handleSubmit = (formData: FormData) => {
    // Append the isPublic value directly to FormData like the original
    formData.append('isPublic', String(isPublic));
    startTransition(() => {
      formAction(formData);
    });
  };

  // Handle success in useEffect instead of during render
  useEffect(() => {
    if (state.success) {
      setTitle('');
      setTags('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      // Call the onUploaded callback if provided
      onUploaded?.();
      // Reset success state after callback
      state.success = false;
    }
  }, [state.success, onUploaded]);

  return (
    <form
      action={handleSubmit}
      className="w-full space-y-6 rounded-xl border border-ink/10 bg-paper-light p-4 sm:p-6 md:p-8 shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h2 className="font-display text-xl sm:text-2xl font-medium text-ink">
          Upload Image
        </h2>
        <span className="font-mono text-xs bg-ink/5 text-ink/60 px-3 py-1 rounded-full self-start sm:self-auto">
          Beta
        </span>
      </div>

      {/* Error Message */}
      {state.error && (
        <div className="flex items-center gap-2 rounded-lg bg-accent/10 p-3 text-sm text-accent">
          <span className="flex-1 font-sans">{state.error}</span>
          <button
            type="button"
            onClick={() => (state.error = null)}
            className="rounded p-0.5 hover:bg-accent/20 transition-colors"
          >
            <span className="text-lg leading-none">×</span>
          </button>
        </div>
      )}

      {/* File Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative rounded-lg border-2 border-dashed transition-all ${
          dragActive
            ? 'border-accent bg-accent/5'
            : 'border-ink/20 bg-paper hover:border-ink/40'
        } min-h-35 sm:min-h-40 md:min-h-50 cursor-pointer`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          name="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
          required
        />

        {selectedFile ? (
          <div className="flex h-full flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 p-4">
            <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-lg bg-ink/5">
              <img
                src={URL.createObjectURL(selectedFile)}
                alt={selectedFile.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <p className="font-sans font-medium text-ink truncate">
                {selectedFile.name}
              </p>
              <p className="font-mono text-xs text-ink/60">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="rounded-full p-1 hover:bg-ink/10 transition-colors"
            >
              <span className="text-lg leading-none text-ink/60">×</span>
            </button>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-6 text-center">
            <svg
              className="h-10 w-10 sm:h-12 sm:w-12 text-ink/30"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="mt-2 font-sans text-sm font-medium text-ink/80">
              Drop your image here
            </p>
            <p className="font-mono text-xs text-ink/50 mt-1">
              or click to browse
            </p>
          </div>
        )}
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label
            htmlFor="title"
            className="block font-sans text-sm font-medium text-ink/80 mb-1.5"
          >
            Title <span className="font-mono text-ink/40">(optional)</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your image a name..."
            className="w-full rounded-lg border border-ink/20 bg-paper px-4 py-2.5 font-sans text-sm transition-colors placeholder:text-ink/30 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>

        <div>
          <label
            htmlFor="tags"
            className="block font-sans text-sm font-medium text-ink/80 mb-1.5"
          >
            Tags <span className="font-mono text-ink/40">(comma separated)</span>
          </label>
          <input
            id="tags"
            name="tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g., nature, landscape, sunset"
            className="w-full rounded-lg border border-ink/20 bg-paper px-4 py-2.5 font-sans text-sm transition-colors placeholder:text-ink/30 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>
      </div>

      {/* Visibility Checkbox - Matching Original Design */}
      <label className="flex items-center gap-2 font-sans text-sm text-ink/80 cursor-pointer">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="h-4 w-4 rounded border-ink/30 text-accent focus:ring-accent focus:ring-offset-0"
        />
        Show on public gallery
      </label>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending || !selectedFile}
        className={`w-full flex items-center justify-center gap-2 rounded-full px-6 py-3 font-sans text-sm font-medium transition-all ${
          isPending || !selectedFile
            ? 'cursor-not-allowed bg-ink/10 text-ink/30'
            : 'bg-accent text-paper-light hover:bg-accent/90 active:scale-[0.98]'
        } focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2`}
      >
        {isPending ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Uploading...
          </>
        ) : (
          <>
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            Upload Image
          </>
        )}
      </button>
    </form>
  );
}
