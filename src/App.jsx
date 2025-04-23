import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Portrait } from './components/Portrait';
import { Bio } from './components/Bio';
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
    <div className="relative w-full min-h-screen bg-black overflow-x-hidden">
      {/* Canvas container with full width and height, anchored to bottom right */}
      <div className="absolute inset-0 canvas-container">
        <Canvas className="absolute inset-0">
          <Scene />
        </Canvas>
      </div>

      {/* Content container positioned to top left with higher z-index */}
      <div className="relative z-10 p-4 sm:p-8 max-w-2xl mx-auto sm:mx-0 content-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8 pt-16"
        >
          <Bio />

          <div className="flex flex-col sm:flex-row gap-4 links-container justify-center sm:justify-start">
            <motion.a
              href="https://linkedin.com/in/sven-elfgren"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white border border-white/20 transition-all duration-300 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>LinkedIn</span>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </motion.a>

            <motion.a
              href="#"
              className="px-6 py-3 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-full text-white/50 border border-white/10 transition-all duration-300 flex items-center justify-center gap-2 cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Coaching Profile</span>
              <span className="text-xs text-white/30">(Coming Soon)</span>
            </motion.a>
          </div>
        </motion.div>
      </div>

      {/* GitHub link in bottom right */}
      <motion.a
        href="https://github.com/svenelfgren/profile"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 z-20 text-white/40 hover:text-white/60 text-sm backdrop-blur-sm bg-black/20 px-3 py-1.5 rounded-full border border-white/10 transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        How this effect was made
      </motion.a>
    </div>
  );
}

export default App;
