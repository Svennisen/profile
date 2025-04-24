# Interactive Point Cloud Portrait

A technical exploration of interactive 3D graphics using React and Three.js, featuring a dynamic point cloud portrait that responds to user interaction.

## Technical Overview

This project implements a point cloud visualization system with real-time interaction that:

- Pre-processes a 2D image into thousands of 3D points (initial load)
- Renders and animates points in real-time using Three.js
- Implements custom physics-based animations with frame-by-frame updates
- Handles real-time user interaction with efficient point manipulation

## Core Technologies

- [React](https://reactjs.org/) - UI framework
- [Three.js](https://threejs.org/) - 3D graphics engine
- [React Three Fiber](https://github.com/pmndrs/react-three-fiber) - React renderer for Three.js
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Framer Motion](https://www.framer.com/motion/) - UI animations

## Technical Implementation Details

### Point Cloud Generation (Pre-processed)

- One-time image processing to extract color and position data
- Point sampling algorithm for optimal distribution
- Efficient point buffer initialization using TypedArrays
- GPU-accelerated rendering with Three.js PointsMaterial

### Real-time Interactive Physics System

- Frame-by-frame mouse interaction handling with NDC space conversion
- Real-time point tracking using Map data structure
- Per-frame distance calculations for point direction and movement mechanics
- Optimized point state management to minimize memory allocation
- Custom easing functions for smooth transitions

### Real-time Animation System

- Frame-rate independent animation timing using requestAnimationFrame
- Per-frame point position updates using buffer attributes
- Real-time viewport scaling and responsive adjustments

### Performance Optimizations

- Efficient point data structures using TypedArrays
- Optimized render loop with minimal object creation
- Manual chunk splitting react, three.js and app code for better initial loading and caching

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

### Building for Production

```bash
pnpm build
```

## Project Structure

- `src/components/Portrait.jsx` - Core point cloud implementation and real-time updates, event listeners
- `src/hooks/usePointCloud.js` - Initial point cloud generation
- `src/utils/` - Utility functions for point manipulation
- `public/` - Static assets including the source image

## Customization

The system can be customized by adjusting:

- `POINT_COUNT` in `usePointCloud.js` - Controls point density
- Animation parameters in `Portrait.jsx`
- Physics and point momvement in `PointCloudMovement.js`
- Mouse interaction sensitivity
- Color and size variations
