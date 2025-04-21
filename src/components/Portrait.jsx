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
} from '../utils/animationUtils';
import { mouseToNDC } from '../utils/pointUtils';

export function Portrait({ imageUrl }) {
  const pointsRef = useRef();
  const isAnimating = useRef(false);
  const hasLoadedImagePoints = useRef(false);
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

  // TODO: Implement color image sampling and display
  // TODO: Implement random point flyoff
  // TODO: Implement Indicidual point meta data array, or reuse original points object
  // TODO: Only to mouse effect calculation once
  // TODO Add return exclusion timer for points flying off
  // TODO Add Larger description area
  // TODO Add background or better background for text
  // TODO Add separate blog post section
  // TODO Maybe animate my name or logo or text as points as well


  // Pre-calculate random directions for consistent scatter behavior
  const randomDirections = useMemo(() => {
    return Array(POINT_COUNT)
      .fill(0)
      .map(() => getRandomDirection());
  }, []);

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
      const rect = event.currentTarget.getBoundingClientRect();
      const touch = event.touches[0];
      const mousePos_NDC = mouseToNDC(touch.clientX, touch.clientY, rect.width, rect.height);
      setMousePosition_NDC(mousePos_NDC);
    };

    // Prevent default only on touchstart
    const preventDefaultTouch = (e) => {
      e.preventDefault();
    };

    const canvas = document.querySelector('canvas');
    if (canvas) {
      // Mouse events
      canvas.addEventListener('mousemove', handleMouseMove);

      // Touch events - note the passive option
      canvas.addEventListener('touchmove', handleTouch, { passive: true });
      canvas.addEventListener('touchstart', handleTouch, { passive: true });

      // Only prevent default on the canvas element itself
      canvas.addEventListener('touchstart', preventDefaultTouch, { passive: false });

      return () => {
        // Clean up
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

  const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
  const calculateAnimationProgress = (elapsedTime, duration) => Math.min(elapsedTime / duration, 1);

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
          progress
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
          1
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
