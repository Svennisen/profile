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
  animatePoints,
} from '../utils/animationUtils';
import { mouseToNDC } from '../utils/pointUtils';

export function Portrait({ imageUrl }) {
  const pointsRef = useRef();
  const isCompleted = useRef(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { points, isLoading } = usePointCloudFromImage(imageUrl);
  const [animationStartTime, setAnimationStartTime] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const { clock } = useThree();

  // Create typed arrays for Three.js buffer attributes
  const positions = useMemo(() => new Float32Array(POINT_COUNT * 3), [POINT_COUNT]);
  const colors = useMemo(() => new Float32Array(POINT_COUNT * 3), [POINT_COUNT]);
  const sizes = useMemo(() => new Float32Array(POINT_COUNT), [POINT_COUNT]);
  const finalPositions = useMemo(() => new Float32Array(POINT_COUNT * 3), [POINT_COUNT]);
  const finalColors = useMemo(() => new Float32Array(POINT_COUNT * 3), [POINT_COUNT]);
  const finalSizes = useMemo(() => new Float32Array(POINT_COUNT), [POINT_COUNT]);

  // Pre-calculate random directions for consistent scatter behavior
  const randomDirections = useMemo(() => {
    return Array(POINT_COUNT)
      .fill(0)
      .map(() => getRandomDirection());
  }, []);

  //On mount
  useEffect(() => {
    const initialPositions = generateInitialPositions(POINT_COUNT);
    const initialColors = generateInitialColors(POINT_COUNT);

    // Initialize with random positions and colors
    positions.set(initialPositions);
    colors.set(initialColors);

    // Track mouse position relative to canvas
    const handleMouseMove = event => {
      const rect = event.currentTarget.getBoundingClientRect();
      const mousePos = mouseToNDC(event.clientX, event.clientY, rect.width, rect.height);
      setMousePosition(mousePos);
    };

    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('mousemove', handleMouseMove);
      return () => canvas.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  // Update with sampled points when loaded
  useEffect(() => {
    if (points.length > 0 && !isCompleted.current && !isAnimating) {
      // Store the sampled positions and colors
      initializePointBuffers(points, finalPositions, finalColors, finalSizes);
      setAnimationStartTime(clock.elapsedTime); // Set to current clock time
      setIsAnimating(true);
    }
  }, [points, isAnimating, isCompleted, clock]);

  // Animation loop
  useFrame(state => {
    if (pointsRef.current) {
      if (isAnimating) {
        const elapsedTime = state.clock.elapsedTime - animationStartTime;
        isCompleted.current = animatePoints(
          pointsRef,
          finalPositions,
          finalColors,
          finalSizes,
          elapsedTime,
          5 // 5 second duration
        );

        if (isCompleted.current) {
          setIsAnimating(false);
        }
      } else if (isCompleted.current) {
        updatePoints(pointsRef, points, mousePosition, randomDirections, state.clock.elapsedTime);
      }
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={POINT_COUNT}
          array={positions}
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
