import * as THREE from 'three';

export const createCircleTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;

  const context = canvas.getContext('2d');
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = canvas.width / 2;

  // Create gradient for smooth circle
  const gradient = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
  gradient.addColorStop(0, 'rgb(255, 255, 255)');
  gradient.addColorStop(0.9, 'rgb(179, 179, 179)');
  gradient.addColorStop(1, 'rgb(0, 0, 0)');

  // Draw circle
  context.fillStyle = gradient;
  context.beginPath();
  context.arc(centerX, centerY, radius, 0, Math.PI * 2);
  context.fill();

  return canvas;
};

// Create and export the texture
export const circleTexture = new THREE.CanvasTexture(createCircleTexture());
