'use client';

import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface EvidenceGalleryProps {
  images: string[];
  productName?: string;
}

export function EvidenceGallery({ images, productName = 'Product' }: EvidenceGalleryProps) {
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images.length) return null;

  function prev() {
    setCurrentIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }

  function next() {
    setCurrentIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {images.map((url, i) => (
          <button
            key={i}
            onClick={() => { setCurrentIndex(i); setOpen(true); }}
            className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
          >
            <img
              src={url}
              alt={`${productName} - Image ${i + 1}`}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
            <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
              {i + 1}
            </span>
          </button>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl gap-0 p-0">
          <div className="relative flex items-center justify-center bg-black">
            <img
              src={images[currentIndex]}
              alt={`${productName} - Image ${currentIndex + 1}`}
              className="max-h-[70vh] w-full object-contain"
            />

            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 text-white hover:bg-white/20"
                  onClick={prev}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 text-white hover:bg-white/20"
                  onClick={next}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 text-white hover:bg-white/20"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center justify-between bg-background p-3">
            <p className="text-sm text-muted-foreground">
              Image {currentIndex + 1} of {images.length}
            </p>
            <div className="flex gap-1">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    i === currentIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
