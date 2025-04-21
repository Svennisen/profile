import {
  calculateMouseEffect,
  calculateNextPosition,
  calculateFinalSize,
} from './pointCloudMovement';
import { toNDC, fromNDC, updatePointPosition, getPointPosition } from './pointUtils';

/**
 * Initializes the buffer attributes with point data
 * @param {Array} points - Array of point data
 * @param {Float32Array} ndc_positions - Position buffer array in NDC space
 * @param {Float32Array} img_colors - Color buffer array in image space
 * @param {Float32Array} sizes - Size buffer array
 */
export const initializePointBuffers = (points, ndc_positions, img_colors, sizes) => {
  points.forEach((point, i) => {
    const idx = i * 3;
    const colorIdx = i * 3;

    // Convert image space to NDC
    const ndc = toNDC(point.position[0], point.position[1]);

    // Set positions in NDC space
    updatePointPosition(ndc_positions, idx, {
      x: ndc.x,
      y: ndc.y,
      z: point.position[2],
    });

    // Set point color (normalized [0,1])
    img_colors[colorIdx] = point.color[0];
    img_colors[colorIdx + 1] = point.color[1];
    img_colors[colorIdx + 2] = point.color[2];

    // Set size (arbitrary units)
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
  ndc_mousePosition,  // NDC space [-1,1]
  randomDirections,   // Unit vectors
  elapsedTime,
  originalPositions_NDC,  // NDC space
  img_originalColors,     // Image space [0,1]
  img_originalSizes,      // Arbitrary units
  progress = 1
) => {
  const ndc_positions = pointsRef.current.geometry.attributes.position.array;  // NDC space [-1,1]
  const sizes = pointsRef.current.geometry.attributes.size.array;
  const colors = pointsRef.current.geometry.attributes.color.array;

  for (let i = 0; i < originalPositions_NDC.length / 3; i++) {
    const idx = i * 3;
    const sizeIdx = i;

    // Get current position from buffer (in NDC space)
    const ndc_currentPos = getPointPosition(ndc_positions, idx);

    // Calculate next position
    const ndc_nextPos = calculateNextPosition(
      i,
      [originalPositions_NDC[idx], originalPositions_NDC[idx + 1], originalPositions_NDC[idx + 2]],
      ndc_mousePosition,
      randomDirections[i],
      ndc_currentPos,
      elapsedTime,
      progress
    );

    // Update position (in NDC space)
    updatePointPosition(ndc_positions, idx, ndc_nextPos);

    // Calculate mouse effect using NDC positions
    const mouseEffect = calculateMouseEffect(
      [ndc_nextPos.x, ndc_nextPos.y, originalPositions_NDC[idx + 2]],
      ndc_mousePosition,
      randomDirections[i]
    );

    // Update size with progress
    sizes[sizeIdx] = calculateFinalSize(img_originalSizes[i], elapsedTime, mouseEffect.influence * progress);

    // Update color with progress
    const initialColor = colors[idx];
    colors[idx] = initialColor + (img_originalColors[idx] - initialColor) * progress;
    colors[idx + 1] = colors[idx + 1] + (img_originalColors[idx + 1] - colors[idx + 1]) * progress;
    colors[idx + 2] = colors[idx + 2] + (img_originalColors[idx + 2] - colors[idx + 2]) * progress;
  }

  // Tell Three.js to update the buffers
  pointsRef.current.geometry.attributes.position.needsUpdate = true;
  pointsRef.current.geometry.attributes.color.needsUpdate = true;
  pointsRef.current.geometry.attributes.size.needsUpdate = true;
};
