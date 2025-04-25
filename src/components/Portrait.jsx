import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { usePointCloudFromImage } from '../hooks/usePointCloud';
import { circleTexture } from '../utils/pointTexture';
import { POINT_COUNT } from '../hooks/usePointCloud';
import { getRandomDirection } from '../utils/pointCloudMovement';
import { initializePointBuffers, updatePoints } from '../utils/pointBufferUtils';
import {
  generateInitialPositions,
  generateInitialColors,
  generateInitialSizes,
} from '../utils/pointCloudMovement';
import { mouseToNDC } from '../utils/pointUtils';

import { easeOutCubic, calculateAnimationProgress } from '../utils/pointCloudMovement';

export function Portrait({ imageUrl }) {
  const pointsRef = useRef();
  const isAnimating = useRef(false);
  const hasLoadedImagePoints = useRef(false);
  const flownOffPoints = useRef(new Map());

  const animationStartTime = useRef(null);
  const [mousePosition_NDC, setMousePosition_NDC] = useState({ x: 0, y: 0 });
  const { points, isLoading } = usePointCloudFromImage(imageUrl);
  const { clock, size, camera } = useThree();

  // Create typed arrays for Three.js buffer attributes
  const positions_NDC = useMemo(() => new Float32Array(POINT_COUNT * 3), [POINT_COUNT]);
  const colors = useMemo(() => new Float32Array(POINT_COUNT * 3), [POINT_COUNT]);
  const sizes = useMemo(() => new Float32Array(POINT_COUNT), [POINT_COUNT]);
  const originalPositions_NDC = useMemo(() => new Float32Array(POINT_COUNT * 3), [POINT_COUNT]);
  const originalColors = useMemo(() => new Float32Array(POINT_COUNT * 3), [POINT_COUNT]);
  const originalSizes = useMemo(() => new Float32Array(POINT_COUNT), [POINT_COUNT]);

  // TODO Clean up the code in general
  // TODO Add separate blog post section
  // TODO Add a projects section

  // Pre-calculate random directions for consistent scatter behavior
  const randomDirections = useMemo(() => {
    return Array(POINT_COUNT)
      .fill(0)
      .map(() => getRandomDirection());
  }, []);

  // Create handler object for point flying
  const pointFlyingHandler = useMemo(
    () => ({
      isFlownOff: index => flownOffPoints.current.has(index),
      shouldFlyBack: index => {
        const point = flownOffPoints.current.get(index);

        if (point.time + 3 < clock.elapsedTime) {
          return true;
        }
        return false;
      },
      markPointAsFlying: (index, targetPos) => {
        flownOffPoints.current.set(index, {
          x: targetPos.x,
          y: targetPos.y,
          z: targetPos.z,
          time: clock.elapsedTime,
        });
      },
      maybeMarkReturned: (index, currentPos, originalPos) => {
        const dx = currentPos.x - originalPos.x;
        const dy = currentPos.y - originalPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 0.01) {
          flownOffPoints.current.delete(index);
          return true;
        }
        return false;
      },
    }),
    [flownOffPoints]
  );

  //On mount
  useEffect(() => {
    const initialPositions_NDC = generateInitialPositions(POINT_COUNT);
    const initialColors = generateInitialColors(POINT_COUNT);
    const initialSizes = generateInitialSizes(POINT_COUNT);

    positions_NDC.set(initialPositions_NDC);
    colors.set(initialColors);
    sizes.set(initialSizes);

    // Separate handlers for mouse and touch
    const handleMouseMove = event => {
      const rect = event.currentTarget.getBoundingClientRect();
      const mousePos_NDC = mouseToNDC(event.clientX, event.clientY, rect.width, rect.height);
      setMousePosition_NDC(mousePos_NDC);
    };

    const handleTouch = event => {
      // Only handle touch events if they're within the canvas bounds
      const rect = event.currentTarget.getBoundingClientRect();
      const touch = event.touches[0];

      // Check if touch is within canvas bounds
      if (
        touch.clientX < rect.left ||
        touch.clientX > rect.right ||
        touch.clientY < rect.top ||
        touch.clientY > rect.bottom
      ) {
        return;
      }

      const mousePos_NDC = mouseToNDC(touch.clientX, touch.clientY, rect.width, rect.height);
      setMousePosition_NDC(mousePos_NDC);
    };

    // Only prevent default if the touch started within the canvas
    const preventDefaultTouch = e => {
      const rect = e.currentTarget.getBoundingClientRect();
      const touch = e.touches[0];

      if (
        touch.clientX >= rect.left &&
        touch.clientX <= rect.right &&
        touch.clientY >= rect.top &&
        touch.clientY <= rect.bottom
      ) {
        e.preventDefault();
      }
    };

    const canvas = document.querySelector('canvas');
    if (canvas) {
      // Mouse events
      canvas.addEventListener('mousemove', handleMouseMove);

      // Touch events with passive option for better scroll performance
      canvas.addEventListener('touchmove', handleTouch, { passive: true });
      canvas.addEventListener('touchstart', handleTouch, { passive: true });

      // Only prevent default when touch starts within canvas
      canvas.addEventListener('touchstart', preventDefaultTouch, { passive: false });

      return () => {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('touchmove', handleTouch);
        canvas.removeEventListener('touchstart', handleTouch);
        canvas.removeEventListener('touchstart', preventDefaultTouch);
      };
    }
  }, [size]);

  // Update with sampled points when loaded
  useEffect(() => {
    if (points.length > 0 && !isAnimating.current && !hasLoadedImagePoints.current) {
      initializePointBuffers(points, originalPositions_NDC, originalColors, originalSizes);
      hasLoadedImagePoints.current = true;
      isAnimating.current = true;
      animationStartTime.current = clock.elapsedTime;
    }
  }, [points, isAnimating, clock]);

  // Update camera on resize
  useEffect(() => {
    if (camera) {
      // Update orthographic camera bounds
      camera.left = -size.width / size.height;
      camera.right = size.width / size.height;
      camera.top = 1;
      camera.bottom = -1;
      camera.updateProjectionMatrix();
    }
  }, [size, camera]);

  // Animation loop
  useFrame(state => {
    if (pointsRef.current) {
      if (isAnimating.current) {
        const duration = 2.5;
        const elapsedTime = state.clock.elapsedTime - animationStartTime.current;
        const progress = easeOutCubic(calculateAnimationProgress(elapsedTime, duration));

        updatePoints(
          pointsRef,
          mousePosition_NDC,
          randomDirections,
          state.clock.elapsedTime,
          originalPositions_NDC,
          originalColors,
          originalSizes,
          progress,
          pointFlyingHandler,
          flownOffPoints
        );

        if (progress >= 1) {
          isAnimating.current = false;
        }
      } else if (hasLoadedImagePoints.current) {
        updatePoints(
          pointsRef,
          mousePosition_NDC,
          randomDirections,
          state.clock.elapsedTime,
          originalPositions_NDC,
          originalColors,
          originalSizes,
          1,
          pointFlyingHandler,
          flownOffPoints
        );
      }
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={POINT_COUNT}
          array={positions_NDC}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={POINT_COUNT}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute attach="attributes-size" count={POINT_COUNT} array={sizes} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial
        size={2}
        vertexColors
        sizeAttenuation
        transparent
        opacity={1}
        alphaMap={circleTexture}
        alphaTest={0.001}
        depthWrite={false}
      />
    </points>
  );
}
