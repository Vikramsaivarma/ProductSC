'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Upload, Camera, Loader2, Image as ImageIcon } from 'lucide-react';

import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ImagePreviewGrid } from './ImagePreviewGrid';
import { UploadProgressBar } from './UploadProgressBar';

const MAX_FILES = 5;
const ACCEPTED_TYPES = { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] };

const uploadSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  brand: z.string().optional(),
  category: z.enum([
    'food',
    'cosmetic',
    'personal_care',
    'electronics',
    'household',
    'other',
  ]),
  package_weight_bucket: z.enum(['<=200', '200-500', '>500']),
});

type UploadFormData = z.infer<typeof uploadSchema>;

const CATEGORY_LABELS: Record<string, string> = {
  food: 'Food & Beverages',
  cosmetic: 'Cosmetic',
  personal_care: 'Personal Care',
  electronics: 'Electronics',
  household: 'Household',
  other: 'Other',
};

const WEIGHT_LABELS: Record<string, string> = {
  '<=200': '≤ 200 g',
  '200-500': '200 – 500 g',
  '>500': '> 500 g',
};

export default function ProductUploader() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUserId(data.id);
        }
      } catch {
        // Ignore
      }
    }
    fetchUser();
  }, []);

  const form = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      name: '',
      brand: '',
      category: 'food',
      package_weight_bucket: '200-500',
    },
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setFiles((prev) => {
        const combined = [...prev, ...acceptedFiles];
        return combined.slice(0, MAX_FILES);
      });
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: MAX_FILES,
    multiple: true,
  });

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCaptureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length > 0) {
      onDrop(selected);
    }
    e.target.value = '';
  };

  async function onSubmit(data: UploadFormData) {
    if (files.length === 0) {
      toast.error('Please select at least one image');
      return;
    }

    if (!userId) {
      toast.error('You must be logged in');
      return;
    }

    setUploading(true);
    setProgress(0);

    const loadingToast = toast.loading('Uploading images...');

    try {
      const supabase = createClient();
      // Upload images to Supabase Storage
      const imageUrls: string[] = [];
      const totalSteps = files.length + 2; // uploads + insert + analyze
      let completedSteps = 0;

      for (const file of files) {
        const filePath = `${userId}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file, { contentType: file.type });

        if (uploadError) {
          throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from('product-images').getPublicUrl(filePath);

        imageUrls.push(publicUrl);
        completedSteps++;
        setProgress(Math.round((completedSteps / totalSteps) * 100));
      }

      toast.loading('Saving product...', { id: loadingToast });

      // Insert product record
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          name: data.name,
          brand: data.brand || null,
          category: data.category,
          package_weight_bucket: data.package_weight_bucket,
          image_urls: imageUrls,
          uploaded_by: userId,
          source: 'manual_upload',
        })
        .select('id')
        .single();

      if (productError || !product) {
        throw new Error(productError?.message || 'Failed to create product record');
      }

      completedSteps++;
      setProgress(Math.round((completedSteps / totalSteps) * 100));

      toast.loading('Running AI analysis...', { id: loadingToast });

      // Call analysis API
      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, imageUrls }),
      });

      if (!analyzeRes.ok) {
        const body = await analyzeRes.json().catch(() => ({}));
        throw new Error(body.error || 'Analysis request failed');
      }

      const { reportId } = await analyzeRes.json();

      completedSteps++;
      setProgress(100);

      toast.success('Analysis complete!', { id: loadingToast });
      router.push(`/reports/${reportId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      toast.error(message, { id: loadingToast });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Details</CardTitle>
        <CardDescription>
          Upload clear images of the product label and fill in the details below.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Drop Zone */}
        <div
          {...getRootProps()}
          className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors cursor-pointer ${
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
          }`}
        >
          <input {...getInputProps()} />
          <ImageIcon className="mb-3 h-10 w-10 text-muted-foreground" />
          {isDragActive ? (
            <p className="text-sm font-medium text-primary">
              Drop images here...
            </p>
          ) : (
            <>
              <p className="text-sm font-medium text-foreground">
                Drag & drop label images here, or click to browse
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                PNG, JPG, JPEG, or WebP — up to {MAX_FILES} files
              </p>
            </>
          )}
        </div>

        {/* Capture Button */}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCaptureClick}
          >
            <Camera className="mr-2 h-4 w-4" />
            Capture Photo
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            multiple
            onChange={handleFileInputChange}
          />
          {files.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {files.length} file{files.length !== 1 ? 's' : ''} selected
            </span>
          )}
        </div>

        {/* Image Previews */}
        <ImagePreviewGrid files={files} onRemove={handleRemoveFile} />

        {/* Upload Progress */}
        {uploading && (
          <UploadProgressBar value={progress} label="Uploading..." />
        )}

        {/* Metadata Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="product-name">Product Name *</Label>
              <Input
                id="product-name"
                placeholder="e.g. Organic Honey 500g"
                disabled={uploading}
                {...form.register('name')}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-brand">Brand</Label>
              <Input
                id="product-brand"
                placeholder="e.g. Nature's Best"
                disabled={uploading}
                {...form.register('brand')}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                defaultValue="food"
                disabled={uploading}
                onValueChange={(value) =>
                  form.setValue('category', value as UploadFormData['category'])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Package Weight *</Label>
              <Select
                defaultValue="200-500"
                disabled={uploading}
                onValueChange={(value) =>
                  form.setValue(
                    'package_weight_bucket',
                    value as UploadFormData['package_weight_bucket']
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select weight range" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(WEIGHT_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={uploading || files.length === 0}
          >
            {uploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Upload & Analyze
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
