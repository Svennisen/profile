import { useState, useEffect } from 'react';

// Constants
export const POINT_COUNT = 50000;

export function usePointCloudFromImage(imageUrl) {
  const [points, setPoints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Create a temporary canvas to read image data
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Set canvas size to match image for sampling
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image to canvas
      ctx.drawImage(img, 0, 0);

      // Get image data
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

      // Create points array
      const newPoints = [];

      // Sample image data to create points
      for (let i = 0; i < POINT_COUNT; i++) {
        // Random position within image bounds
        const x = Math.random(); // 0 to 1 (right half)
        const y = Math.random(); // 0 to 1 (top to bottom)

        // Map to image coordinates for sampling
        const imgX = Math.floor(x * img.width);
        const imgY = Math.floor(y * img.height);

        // Get grayscale value from image (for B&W images, R=G=B)
        const idx = (imgY * canvas.width + imgX) * 4;
        const gray = data[idx] / 255; // Use red channel as grayscale value
        const a = data[idx + 3] / 255;

        // Only add points with sufficient opacity
        if (a > 0.1) {
          newPoints.push({
            position: [x, y, 0],
            color: [gray, gray, gray],
            originalPosition: [x, y, 0],
            velocity: [0, 0, 0],
            size: Math.random() * 3 + 1,
          });
        }
      }

      setPoints(newPoints);
      setIsLoading(false);
    };

    // Load the image
    img.src = imageUrl;
  }, [imageUrl, POINT_COUNT]);

  return { points, isLoading };
}
