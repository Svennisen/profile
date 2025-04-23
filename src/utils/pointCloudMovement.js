import { generateRandomPosition } from './pointUtils';

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
    x: Math.sin(time * 0.5 + index * 0.01) * 0.00008, // Slower X movement
    y: Math.cos(time * 0.3 + index * 0.02) * 0.00008, // Medium Y movement
    z: Math.sin(time * 0.2 + index * 0.03) * 0.005, // Subtle Z movement
  };
};

/**
 * Calculates mouse interaction effect for a point
 * @param {Array} point - Original point position [x,y,z]
 * @param {Object} mousePosition - Current mouse position {x,y}
 * @param {Array} randomDirection - Pre-calculated random direction [x,y]
 * @param {number} interactionRadius - Radius of mouse influence
 * @param {number} pointIndex - Index of the point
 * @param {function} handlePointFliesOff - Function to handle point flying off
 * @returns {Object} Offset and influence values for the point
 */
export const calculateMouseEffect = ({
  original_x,
  original_y,
  ndc_mousePosition,
  randomDirection,
}) => {
  // Calculate distance from point to mouse
  const dx = original_x - ndc_mousePosition.x;
  const dy = original_y - ndc_mousePosition.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  const baseInfluence = Math.max(0, 1 - distance / 0.1);
  const influence = Math.min(1, baseInfluence);

  const scatterStrength = 0.3 * influence; // Normal scatter behavior

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
export const interpolatePosition = (current, target, returnSpeed = 0.2) => {
  return current + (target - current) * Math.pow(returnSpeed, 3); // Quadratic ease
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
export const calculateNextPosition = ({
  i,
  original_x,
  original_y,
  original_z,
  ndc_currentPos, // NDC space [-1,1]
  elapsedTime,
  mouseEffect,
  progress = 1,
  pointFlyingHandler,
  flownOffPoints,
}) => {
  /**
   * If not affected by mouse, just organic movement.
   * If affected by mouse, add mouse effect.
   * If affected by mouse, small chance to fly off.
   * If flying off, interpolate between current position and random position.
   * If random position is reached, stop flying off.
   * If random position is reached, and orignial position affected by mouse, just add organic movement
   * If random position is reached, and orignial position not affected by mouse, use original position as target.
   */

  // Calculate organic movement (small NDC space offsets)
  const ndc_organicMove = calculateOrganicMovement(elapsedTime, i);

  const ndc_targetPos = calculateTargetPosition({
    original_x,
    original_y,
    original_z,
    ndc_currentPos,
    mouseEffect,
    pointFlyingHandler,
    flownOffPoints,
    pointIndex: i,
  });

  // Return interpolated position in NDC space
  return {
    x: interpolatePosition(ndc_currentPos.x, ndc_targetPos.x) + ndc_organicMove.x,
    y: interpolatePosition(ndc_currentPos.y, ndc_targetPos.y) + ndc_organicMove.y,
    z: interpolatePosition(ndc_currentPos.z, ndc_targetPos.z) + ndc_organicMove.z,
  };
};

const calculateTargetPosition = ({
  original_x,
  original_y,
  original_z,
  ndc_currentPos,
  mouseEffect,
  pointFlyingHandler,
  flownOffPoints,
  pointIndex,
}) => {
  if (pointFlyingHandler.isFlownOff(pointIndex)) {
    const flownOffPoint = flownOffPoints.current.get(pointIndex);
    if (mouseEffect.influence > 0) {
      return {
        x: flownOffPoint.x,
        y: flownOffPoint.y,
        z: original_z,
      };
    }

    if (pointFlyingHandler.shouldFlyBack(pointIndex)) {
      pointFlyingHandler.maybeMarkReturned(pointIndex, ndc_currentPos, {
        x: original_x,
        y: original_y,
      });

      return {
        x: original_x,
        y: original_y,
        z: original_z,
      };
    }

    return {
      x: flownOffPoint.x,
      y: flownOffPoint.y,
      z: original_z,
    };
  }

  if (mouseEffect.influence > 0) {
    if (Math.random() < 0.001) {
      // 0.1% chance to fly off
      const randomPos = generateRandomPosition(1);
      pointFlyingHandler.markPointAsFlying(pointIndex, randomPos);

      return {
        x: randomPos.x,
        y: randomPos.y,
        z: original_z,
      };
    }
  }

  return {
    x: original_x + mouseEffect.offset.x,
    y: original_y + mouseEffect.offset.y,
    z: original_z,
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

export const calculateflyOffPosition = ({
  original_x,
  original_y,
  ndc_currentPos,
  pointFlyingHandler,
  pointIndex,
  flownOffPoints,
}) => {
  // If point has flown off, check if it should return
  if (pointFlyingHandler.isFlownOff(pointIndex)) {
    const returned = pointFlyingHandler.maybeMarkReturned(pointIndex, ndc_currentPos, {
      x: original_x,
      y: original_y,
    });
    if (!returned) {
      false;
    }

    // 1% chance to fly off when influenced
    if (influence > 0 && Math.random() < 0.001) {
      const randomPos = generateRandomPosition();
      // Notify that this point has flown off
      pointFlyingHandler.markPointAsFlying(pointIndex, randomPos);
      return randomPos;
    }
  }

  const randomPos = generateRandomPosition();
  // Notify that this point has flown off
  pointFlyingHandler.markPointAsFlying(pointIndex);
};
