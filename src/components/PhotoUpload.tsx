import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Image as ImageIcon } from "lucide-react";
import { cn } from "../lib/utils";

interface PhotoUploadProps {
  label: string;
  onUpload: (file: File) => void;
  previewUrl?: string;
  disabled?: boolean;
}

export function PhotoUpload({
  label,
  onUpload,
  previewUrl,
  disabled,
}: PhotoUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onUpload(acceptedFiles[0]);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxFiles: 1,
    disabled,
  });

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-slate-700">{label}</p>
      <div
        {...getRootProps()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors",
          isDragActive
            ? "border-brand-500 bg-brand-50"
            : "border-slate-300 hover:border-slate-400",
          disabled && "cursor-not-allowed opacity-50",
          previewUrl && "p-2"
        )}
      >
        <input {...getInputProps()} />
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={label}
            className="max-h-48 rounded-md object-contain"
          />
        ) : (
          <>
            {isDragActive ? (
              <ImageIcon className="mb-2 h-8 w-8 text-brand-500" />
            ) : (
              <Upload className="mb-2 h-8 w-8 text-slate-400" />
            )}
            <p className="text-sm text-slate-500">
              {isDragActive
                ? "Drop the photo here"
                : "Drag & drop or click to upload"}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              PNG, JPG, WebP up to 10MB
            </p>
          </>
        )}
      </div>
    </div>
  );
}
