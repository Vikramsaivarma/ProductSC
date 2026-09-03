'use client';

import Image from 'next/image';
import { X, Image as ImageIcon } from 'lucide-react';

interface ImagePreviewGridProps {
  files: File[];
  onRemove: (index: number) => void;
}

export function ImagePreviewGrid({ files, onRemove }: ImagePreviewGridProps) {
  if (files.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {files.map((file, index) => {
        const previewUrl = URL.createObjectURL(file);
        return (
          <div
            key={`${file.name}-${index}`}
            className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
          >
            <Image
              src={previewUrl}
              alt={`Preview ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, 33vw"
              onLoad={() => URL.revokeObjectURL(previewUrl)}
            />
            <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="absolute right-1.5 top-1.5 rounded-full bg-background/80 p-1 text-muted-foreground opacity-0 shadow-sm transition-opacity hover:bg-destructive hover:text-destructive-foreground group-hover:opacity-100"
              aria-label={`Remove image ${index + 1}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-background/80 px-2 py-1 text-xs text-muted-foreground backdrop-blur-sm">
              <p className="truncate">{file.name}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { ImageIcon };
