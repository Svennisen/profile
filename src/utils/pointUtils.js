/**
 * Transforms a point from image coordinates to NDC
 */
export const toNDC = (img_x, img_y) => {
  return {
    x: img_x * 2 - 1, // Image [0,1] -> NDC [-1,1]
    y: -(img_y * 2 - 1), // Image [0,1] -> NDC [-1,1] with Y-flip
  };
};

/**
 * Transforms a point from NDC to image coordinates
 */
export const fromNDC = (ndc_x, ndc_y) => {
  return {
    x: (ndc_x + 1) / 2, // NDC [-1,1] -> Image [0,1]
    y: (-ndc_y + 1) / 2, // NDC [-1,1] -> Image [0,1] with Y-flip
  };
};

/**
 * Generates a random position in NDC space
 */
export const generateRandomPosition = (range = 2) => {
  return {
    x: Math.random() * 2 * range - range, // NDC space [-2,2] (extended range)
    y: Math.random() * 2 * range - range, // NDC space [-2,2] (extended range)
    z: 0,
  };
};

/**
 * Interpolates between two positions
 * @param {Object} start - Start position
 * @param {Object} end - End position
 * @param {number} progress - Interpolation progress (0-1)
 * @returns {Object} Interpolated position
 */
export const interpolatePosition = (start, end, progress) => {
  return {
    x: start.x + (end.x - start.x) * progress,
    y: start.y + (end.y - start.y) * progress,
    z: start.z + (end.z - start.z) * progress,
  };
};

/**
 * Updates a point's position in the buffer (NDC space)
 */
export const updatePointPosition = (ndc_positions, idx, ndc_position) => {
  ndc_positions[idx] = ndc_position.x;
  ndc_positions[idx + 1] = ndc_position.y;
  ndc_positions[idx + 2] = ndc_position.z;
};

/**
 * Gets a point's position from the buffer (NDC space)
 */
export const getPointPosition = (ndc_positions, idx) => {
  return {
    x: ndc_positions[idx],
    y: ndc_positions[idx + 1],
    z: ndc_positions[idx + 2],
  };
};

/**
 * Converts mouse coordinates to NDC space
 */
export const mouseToNDC = (px_clientX, px_clientY, px_width, px_height) => {
  const aspect = px_width / px_height;
  return {
    x: ((px_clientX / px_width) * 2 - 1) * aspect, // Scale x by aspect ratio
    y: 1 - (px_clientY / px_height) * 2, // Y remains the same
  };
};
