import {
  calculateMouseEffect,
  calculateNextPosition,
  calculateFinalSize,
} from './pointCloudMovement';
import { toNDC, fromNDC, updatePointPosition, getPointPosition } from './pointUtils';

/**
 * Initializes the buffer attributes with point data
 * @param {Array} points - Array of point data
 * @param {Float32Array} positions - Position buffer array
 * @param {Float32Array} colors - Color buffer array
 * @param {Float32Array} sizes - Size buffer array
 */
export const initializePointBuffers = (points, positions, colors, sizes) => {
  points.forEach((point, i) => {
    const idx = i * 3;
    const colorIdx = i * 3;

    // Transform to NDC coordinates
    const ndc = toNDC(point.position[0], point.position[1]);

    // Set positions in NDC space
    updatePointPosition(positions, idx, {
      x: ndc.x,
      y: ndc.y,
      z: point.position[2],
    });

    // Set point color (grayscale for B&W image)
    colors[colorIdx] = point.color[0];
    colors[colorIdx + 1] = point.color[1];
    colors[colorIdx + 2] = point.color[2];

    // Set initial size
    sizes[i] = point.size;
  });
};

/**
 * Updates the positions and sizes of all points in the point cloud
 * @param {Object} pointsRef - Reference to the points object
 * @param {Array} points - Array of point data
 * @param {Object} viewport - Viewport dimensions
 * @param {Object} mousePosition - Current mouse position
 * @param {Array} randomDirections - Array of random directions for each point
 * @param {number} elapsedTime - Current animation time
 */
export const updatePoints = (
  pointsRef,
  mousePosition,
  randomDirections,
  elapsedTime,
  originalPositions,
  originalColors,
  originalSizes,
  progress = 1
) => {
  const positions = pointsRef.current.geometry.attributes.position.array;
  const sizes = pointsRef.current.geometry.attributes.size.array;
  const colors = pointsRef.current.geometry.attributes.color.array;

  for (let i = 0; i < originalPositions.length / 3; i++) {
    const idx = i * 3;
    const sizeIdx = i;

    // Get current position from buffer
    const currentPos = getPointPosition(positions, idx);

    const finalImageSpace = fromNDC(originalPositions[idx], originalPositions[idx + 1]);

    // Calculate final position with progress
    const nextPos = calculateNextPosition(
      i,
      [finalImageSpace.x, finalImageSpace.y, originalPositions[idx + 2]],
      mousePosition,
      randomDirections[i],
      currentPos,
      elapsedTime,
      progress // Pass progress to position calculation
    );

    // Update position
    updatePointPosition(positions, idx, nextPos);

    // Calculate mouse effect for size
    const mouseEffect = calculateMouseEffect(
      [nextPos.x, nextPos.y, originalPositions[idx + 2]],
      mousePosition,
      randomDirections[i]
    );

    // Update size with progress
    sizes[sizeIdx] = calculateFinalSize(originalSizes[i], elapsedTime, mouseEffect.influence * progress);

    // Update color with progress
    const initialColor = colors[idx];
    colors[idx] = initialColor + (originalColors[idx] - initialColor) * progress;
    colors[idx + 1] = colors[idx + 1] + (originalColors[idx + 1] - colors[idx + 1]) * progress;
    colors[idx + 2] = colors[idx + 2] + (originalColors[idx + 2] - colors[idx + 2]) * progress;
  }

  // Tell Three.js to update the buffers
  pointsRef.current.geometry.attributes.position.needsUpdate = true;
  pointsRef.current.geometry.attributes.color.needsUpdate = true;
  pointsRef.current.geometry.attributes.size.needsUpdate = true;
};
