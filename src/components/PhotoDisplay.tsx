import { Image as ImageIcon } from "lucide-react";

interface PhotoDisplayProps {
  url?: string | null;
  alt: string;
  className?: string;
}

export function PhotoDisplay({ url, alt, className }: PhotoDisplayProps) {
  if (!url) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg bg-slate-100">
        <ImageIcon className="h-8 w-8 text-slate-300" />
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      className={className || "h-48 w-full rounded-lg object-cover"}
    />
  );
}
