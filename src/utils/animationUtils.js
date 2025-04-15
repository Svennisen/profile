import { calculateFinalSize, calculateNextPosition } from './pointCloudMovement';
import {
  toNDC,
  fromNDC,
  generateRandomPosition,
  updatePointPosition,
  getPointPosition,
} from './pointUtils';

// Generate initial positions for all points
export const generateInitialPositions = count => {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const pos = generateRandomPosition();
    positions[i * 3] = pos.x;
    positions[i * 3 + 1] = pos.y;
    positions[i * 3 + 2] = pos.z;
  }
  return positions;
};

// Generate initial random colors for all points
export const generateInitialColors = count => {
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    colors[i * 3] = Math.random() * 0.5 + 0.5; // R
    colors[i * 3 + 1] = Math.random() * 0.5 + 0.5; // G
    colors[i * 3 + 2] = Math.random() * 0.5 + 0.5; // B
  }
  return colors;
};

// Calculate progress of animation (0 to 1)
export const calculateAnimationProgress = (elapsedTime, duration) => {
  return Math.min(elapsedTime / duration, 1);
};

// Interpolate between start and end positions/colors
export const interpolateAttributes = (start, end, progress) => {
  const interpolated = new Float32Array(start.length);
  for (let i = 0; i < start.length; i++) {
    interpolated[i] = start[i] + (end[i] - start[i]) * progress;
  }
  return interpolated;
};

// Easing function for smooth animation
export const easeOutCubic = t => {
  return 1 - Math.pow(1 - t, 3);
};

// Main animation function
export const animatePoints = (
  pointsRef,
  finalPositions,
  finalColors,
  finalSizes,
  elapsedTime,
  duration
) => {
  const progress = easeOutCubic(calculateAnimationProgress(elapsedTime, duration));

  if (progress >= 1) {
    // Animation complete, set final values
    pointsRef.current.geometry.attributes.position.array.set(finalPositions);
    pointsRef.current.geometry.attributes.color.array.set(finalColors);
    pointsRef.current.geometry.attributes.size.array.set(finalSizes);
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.geometry.attributes.color.needsUpdate = true;
    pointsRef.current.geometry.attributes.size.needsUpdate = true;
    return true; // Animation complete
  }

  // Interpolate colors
  const colors = pointsRef.current.geometry.attributes.color.array;
  const interpolatedColors = interpolateAttributes(colors, finalColors, progress);
  colors.set(interpolatedColors);

  // Calculate positions and sizes for each point
  const positions = pointsRef.current.geometry.attributes.position.array;

  for (let i = 0; i < finalPositions.length / 3; i++) {
    const idx = i * 3;
    const sizeIdx = i;

    // Get current position from buffer
    const currentPos = getPointPosition(positions, idx);

    // Convert final position from NDC to image space
    const finalImageSpace = fromNDC(finalPositions[idx], finalPositions[idx + 1]);

    // Calculate next position using shared function
    const nextPos = calculateNextPosition(
      i,
      [finalImageSpace.x, finalImageSpace.y, finalPositions[idx + 2]],
      { x: 0, y: 0 }, // No mouse interaction during animation
      [0, 0], // No random direction during animation
      currentPos,
      elapsedTime
    );

    // Update position
    updatePointPosition(positions, idx, nextPos);

    // Calculate size with animation progress
    const sizes = pointsRef.current.geometry.attributes.size.array;
    const targetSize = 0.1 + (finalSizes[i] - 0.1) * progress;
    sizes[sizeIdx] = calculateFinalSize(targetSize, elapsedTime, 0); // No mouse influence during animation
  }

  pointsRef.current.geometry.attributes.position.needsUpdate = true;
  pointsRef.current.geometry.attributes.color.needsUpdate = true;
  pointsRef.current.geometry.attributes.size.needsUpdate = true;

  return false; // Animation still in progress
};
