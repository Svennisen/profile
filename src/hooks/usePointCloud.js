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
        // Random position in image space [0,1]
        const img_x = Math.random();
        const img_y = Math.random();

        // Convert to pixel coordinates
        const px_imgX = Math.floor(img_x * img.width);
        const px_imgY = Math.floor(img_y * img.height);

        // Get pixel data index
        const px_idx = (px_imgY * canvas.width + px_imgX) * 4;
        const img_gray = data[px_idx] / 255;  // Normalized [0,1]
        const img_alpha = data[px_idx + 3] / 255;  // Normalized [0,1]

        if (img_alpha > 0.1) {
          newPoints.push({
            position: [img_x, img_y, 0],        // Image space [0,1]
            color: [img_gray, img_gray, img_gray], // Image space [0,1]
            originalPosition: [img_x, img_y, 0], // Image space [0,1]
            velocity: [0, 0, 0],
            size: Math.random() * 3 + 1,        // Arbitrary units
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
