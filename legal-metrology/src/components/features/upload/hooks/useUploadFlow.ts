'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';

interface UploadFlowOptions {
  files: File[];
  formData: {
    name: string;
    brand?: string;
    category: string;
    package_weight_bucket: string;
  };
  userId: string;
}

export function useUploadFlow() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const execute = useCallback(async ({ files, formData, userId }: UploadFlowOptions) => {
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
    const supabase = createClient();

    try {
      const imageUrls: string[] = [];
      const totalSteps = files.length + 2;
      let completedSteps = 0;

      for (const file of files) {
        const filePath = `${userId}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file, { contentType: file.type });

        if (uploadError) {
          throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(filePath);
        imageUrls.push(publicUrl);
        completedSteps++;
        setProgress(Math.round((completedSteps / totalSteps) * 100));
      }

      toast.loading('Saving product...', { id: loadingToast });

      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          name: formData.name,
          brand: formData.brand || null,
          category: formData.category,
          package_weight_bucket: formData.package_weight_bucket,
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
  }, [router]);

  return { uploading, progress, execute };
}
