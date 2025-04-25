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
    <div className="app-container">
      {/* Canvas container with full width and height */}
      <div className="fixed inset-0 canvas-container">
        <Canvas className="absolute inset-0">
          <Scene />
        </Canvas>
      </div>

      {/* Content container with scrollable bio */}
      <div className="content-container">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="main-content"
        >
          <Bio />
        </motion.div>

        {/* Fixed position links */}
        <motion.div
          className="links-wrapper"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="links-grid">
            <motion.a
              href="https://linkedin.com/in/sven-elfgren"
              target="_blank"
              rel="noopener noreferrer"
              className="link-button link-button-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>LinkedIn</span>
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </motion.a>

            <motion.a
              onClick={e => {
                e.preventDefault();
                const email = atob('aGlAc3Zlbi5lbmdpbmVlcmluZw==');
                window.open(`mailto:${email}`, '_blank');
              }}
              href="#"
              className="link-button link-button-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Let's Collaborate</span>
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
              </svg>
            </motion.a>

            <motion.a
              href="#"
              className="link-button link-button-disabled"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Coaching</span>
              <span className="text-xs text-white/30">(Coming Soon)</span>
            </motion.a>
          </div>
        </motion.div>
      </div>

      {/* GitHub link in bottom right */}
      <motion.a
        href="https://github.com/Svennisen/profile"
        target="_blank"
        rel="noopener noreferrer"
        className="github-link"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        How this effect was made
      </motion.a>
    </div>
  );
}

export default App;
