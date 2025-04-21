import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Portrait } from './components/Portrait';
import { POINT_COUNT } from './hooks/usePointCloud';

function Scene() {
  const { size } = useThree();
  const aspect = size.width / size.height;

  return (
    <>
      <OrthographicCamera
        makeDefault
        position={[0, 0, 2.5]}
        left={-aspect}
        right={aspect}
        top={1}
        bottom={-1}
        near={0.1}
        far={1000}
      />
      <ambientLight intensity={0.5} />
      <Portrait imageUrl="/portrait.png" pointCount={POINT_COUNT} />
    </>
  );
}

function App() {
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Canvas container with full width and height, anchored to bottom right */}
      <div className="absolute bottom-0 right-0 canvas-container">
        <Canvas className="absolute inset-0">
          <Scene />
        </Canvas>
      </div>

      {/* Content container positioned to top left with higher z-index */}
      <div className="relative z-10 p-8 max-w-xl content-container">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl font-bold mb-4 text-white">Sven Elfgren</h1>
          <p className="text-xl mb-8 text-gray-300">
            Engineering leader with extensive experience scaling teams and delivering enterprise
            SaaS solutions. Based in San Francisco, California.
          </p>

          <div className="flex flex-col gap-4 links-container">
            <motion.a
              href="https://linkedin.com/in/sven-elfgren"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2 bg-primary rounded-full hover:bg-primary/90 transition-colors w-fit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              LinkedIn
            </motion.a>

            <motion.a
              href="#"
              className="px-6 py-2 bg-secondary rounded-full hover:bg-secondary/90 transition-colors opacity-50 cursor-not-allowed w-fit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Coaching Profile (Coming Soon)
            </motion.a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default App;
