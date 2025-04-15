/**
 * Transforms a point from image coordinates to NDC (Normalized Device Coordinates)
 * @param {number} x - X coordinate in image space (0-1)
 * @param {number} y - Y coordinate in image space (0-1)
 * @returns {Object} Transformed coordinates in NDC space
 */
export const toNDC = (x, y) => {
  return {
    x: x * 2 - 1,
    y: -(y * 2 - 1), // Flip Y
  };
};

/**
 * Transforms a point from NDC to image coordinates
 * @param {number} x - X coordinate in NDC space (-1 to 1)
 * @param {number} y - Y coordinate in NDC space (-1 to 1)
 * @returns {Object} Transformed coordinates in image space
 */
export const fromNDC = (x, y) => {
  return {
    x: (x + 1) / 2,
    y: (-y + 1) / 2, // Flip Y
  };
};

/**
 * Generates a random position within viewport bounds
 * @returns {Object} Random position in NDC space
 */
export const generateRandomPosition = () => {
  return {
    x: Math.random() * 2 - 1, // -1 to 1
    y: Math.random() * 2 - 1, // -1 to 1
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
 * Updates a point's position in the buffer
 * @param {Float32Array} positions - Position buffer array
 * @param {number} idx - Index of the point in the buffer
 * @param {Object} position - New position
 */
export const updatePointPosition = (positions, idx, position) => {
  positions[idx] = position.x;
  positions[idx + 1] = position.y;
  positions[idx + 2] = position.z;
};

/**
 * Gets a point's position from the buffer
 * @param {Float32Array} positions - Position buffer array
 * @param {number} idx - Index of the point in the buffer
 * @returns {Object} Point position
 */
export const getPointPosition = (positions, idx) => {
  return {
    x: positions[idx],
    y: positions[idx + 1],
    z: positions[idx + 2],
  };
};

/**
 * Converts mouse coordinates to NDC space
 * @param {number} clientX - Mouse X coordinate
 * @param {number} clientY - Mouse Y coordinate
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @returns {Object} Mouse position in NDC space
 */
export const mouseToNDC = (clientX, clientY, width, height) => {
  return {
    x: (clientX / width) * 2 - 1,
    y: 1 - (clientY / height) * 2,
  };
};
