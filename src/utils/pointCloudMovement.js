import { toNDC } from './pointUtils';

/**
 * Generates a random 2D unit vector direction
 * Returns [x, y] coordinates on the unit circle
 */
export const getRandomDirection = () => {
  const angle = Math.random() * Math.PI * 2; // Random angle in radians (0 to 2π)
  return [Math.cos(angle), Math.sin(angle)]; // Convert angle to x,y coordinates
};

/**
 * Calculates the organic floating movement for a point
 * @param {number} time - Current animation time
 * @param {number} index - Point index for varied movement
 * @returns {Object} x,y,z offsets for organic movement
 */
export const calculateOrganicMovement = (time, index) => {
  // Use different frequencies and phases for natural-looking motion
  // Multiply by small values (0.003) to keep movement very subtle
  return {
    x: Math.sin(time * 0.5 + index * 0.01) * 0.0008, // Slower X movement
    y: Math.cos(time * 0.3 + index * 0.02) * 0.0008, // Medium Y movement
    z: Math.sin(time * 0.2 + index * 0.03) * 0.0007, // Subtle Z movement
  };
};

/**
 * Calculates mouse interaction effect for a point
 * @param {Array} point - Original point position [x,y,z]
 * @param {Object} mousePosition - Current mouse position {x,y}
 * @param {Array} randomDirection - Pre-calculated random direction [x,y]
 * @param {number} interactionRadius - Radius of mouse influence
 * @returns {Object} Offset and influence values for the point
 */
export const calculateMouseEffect = (
  point,
  mousePosition,
  randomDirection,
  interactionRadius = 0.1
) => {
  // Calculate distance from point to mouse
  const dx = point[0] - mousePosition.x;
  const dy = point[1] - mousePosition.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Calculate influence (1 at mouse position, 0 beyond interaction radius)
  const influence = Math.max(0, 1 - distance / interactionRadius);
  const scatterStrength = 0.3 * influence; // Reduced from 0.4 to 0.3

  // Return both the positional offset and the influence factor
  return {
    offset: {
      x: randomDirection[0] * scatterStrength,
      y: randomDirection[1] * scatterStrength,
    },
    influence,
  };
};

/**
 * Smoothly interpolates between current and target position
 * @param {number} current - Current position value
 * @param {number} target - Target position value
 * @param {number} returnSpeed - Speed of interpolation (0-1)
 * @returns {number} New interpolated position
 */
export const interpolatePosition = (current, target, returnSpeed = 0.03) => {
  return current + (target - current) * returnSpeed;
};

/**
 * Calculates the final position for a point including viewport scaling, mouse interaction, and organic movement
 * @param {number} i - Point index
 * @param {Array} img_originalPos - Original point position [x,y,z] in image space [0,1]
 * @param {Object} ndc_mousePosition - Current mouse position in NDC space [-1,1]
 * @param {Array} randomDirection - Pre-calculated random direction
 * @param {Object} ndc_currentPos - Current position from buffer in NDC space [-1,1]
 * @param {number} elapsedTime - Current animation time
 * @param {number} progress - Progress of the animation (0-1)
 * @returns {Object} Final position with all effects applied in NDC space
 */
export const calculateNextPosition = (
  i,
  originalPos_NDC,    // Image space [0,1]
  ndc_mousePosition,  // NDC space [-1,1]
  randomDirection,    // Unit vector
  ndc_currentPos,     // NDC space [-1,1]
  elapsedTime,
  progress = 1
) => {
  // CONVERSION: Image [0,1] -> NDC [-1,1]
  const x = originalPos_NDC[0];
  const y = originalPos_NDC[1];
  const z = originalPos_NDC[2];

  // Calculate organic movement (small NDC space offsets)
  const ndc_organicMove = calculateOrganicMovement(elapsedTime, i);

  // Calculate mouse effect using NDC coordinates
  const mouseEffect = calculateMouseEffect(
    [x, y, z],
    ndc_mousePosition,
    randomDirection
  );

  // Calculate target position in NDC space
  const ndc_targetPos = {
    x: x + (mouseEffect.influence > 0 ? mouseEffect.offset.x : 0),
    y: y + (mouseEffect.influence > 0 ? mouseEffect.offset.y : 0),
    z: z,
  };

  // Return interpolated position in NDC space
  return {
    x: interpolatePosition(ndc_currentPos.x, ndc_targetPos.x) + ndc_organicMove.x,
    y: interpolatePosition(ndc_currentPos.y, ndc_targetPos.y) + ndc_organicMove.y,
    z: interpolatePosition(ndc_currentPos.z, ndc_targetPos.z) + ndc_organicMove.z,
  };
};

/**
 * Calculates the final size for a point including base size, pulsing, and mouse interaction
 * @param {number} originalSize - Original point size
 * @param {number} elapsedTime - Current animation time
 * @param {number} mouseInfluence - Mouse interaction influence (0-1)
 * @returns {number} Final size with all effects applied
 */
export const calculateFinalSize = (originalSize, elapsedTime, mouseInfluence) => {
  const basePulse = Math.sin(elapsedTime * 2);
  const interactionScale = 1 + mouseInfluence * 0.5;
  return (originalSize + basePulse) * interactionScale;
};
