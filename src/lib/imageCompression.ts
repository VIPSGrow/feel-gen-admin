export async function compressImage(
  file: File,
  options: {
    minSizeKB?: number;
    maxSizeKB?: number;
    maxWidthOrHeight?: number;
    fileType?: string;
  } = {}
): Promise<File> {
  const {
    minSizeKB = 100,
    maxSizeKB = 500,
    maxWidthOrHeight = 1920,
    fileType = 'image/jpeg',
  } = options;

  const minSizeBytes = minSizeKB * 1024;
  const maxSizeBytes = maxSizeKB * 1024;

  // If already in target range, return directly
  if (file.size >= minSizeBytes && file.size <= maxSizeBytes) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(err);
    };

    img.onload = async () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Scale down to initial bounding box
      if (width > maxWidthOrHeight || height > maxWidthOrHeight) {
        if (width > height) {
          height = Math.round((height * maxWidthOrHeight) / width);
          width = maxWidthOrHeight;
        } else {
          width = Math.round((width * maxWidthOrHeight) / height);
          height = maxWidthOrHeight;
        }
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      const getBlob = (w: number, h: number, q: number): Promise<Blob | null> => {
        canvas.width = w;
        canvas.height = h;
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        return new Promise((res) => canvas.toBlob(res, fileType, q));
      };

      try {
        let lowQuality = 0.05;
        let highQuality = 0.95;
        let bestBlob: Blob | null = null;
        let currentWidth = width;
        let currentHeight = height;

        // Up to 6 binary search iterations on quality
        for (let i = 0; i < 6; i++) {
          const currentQuality = (lowQuality + highQuality) / 2;
          const blob = await getBlob(currentWidth, currentHeight, currentQuality);

          if (!blob) break;
          bestBlob = blob;

          // Found valid range
          if (blob.size >= minSizeBytes && blob.size <= maxSizeBytes) {
            break;
          }

          if (blob.size > maxSizeBytes) {
            highQuality = currentQuality;
          } else {
            lowQuality = currentQuality;
          }
        }

        // If still > 500KB after dropping quality, scale canvas down iteratively
        while (bestBlob && bestBlob.size > maxSizeBytes && currentWidth > 300) {
          currentWidth = Math.round(currentWidth * 0.75);
          currentHeight = Math.round(currentHeight * 0.75);
          const blob = await getBlob(currentWidth, currentHeight, 0.6);
          if (!blob) break;
          bestBlob = blob;
        }

        if (!bestBlob) {
          reject(new Error('Failed to compress image into a valid blob'));
          return;
        }

        const extension = fileType === 'image/webp' ? '.webp' : '.jpg';
        const finalName = file.name.replace(/\.[^/.]+$/, extension);

        const compressedFile = new File([bestBlob], finalName, {
          type: fileType,
          lastModified: Date.now(),
        });

        resolve(compressedFile);
      } catch (err) {
        reject(err);
      }
    };

    img.src = objectUrl;
  });
}