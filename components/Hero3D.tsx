'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sphere, MeshDistortMaterial, Float } from '@react-three/drei'
import { motion } from 'framer-motion'

function AnimatedSphere() {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      {/* 48x48 segments, not 100x200. MeshDistortMaterial displaces vertices
          every frame, so ~20k segments was pure cost on a phone GPU for no
          visible gain once the distortion noise is applied. */}
      <Sphere args={[1, 48, 48]} scale={2.5}>
        <MeshDistortMaterial
          color="#f0ad4e"
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  )
}

interface Hero3DProps {
  headline: string
  subheadline?: string
  ctaText?: string
  ctaUrl?: string
}

export default function Hero3D({ headline, subheadline, ctaText = 'View My Work', ctaUrl = '#portfolio' }: Hero3DProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* 3D Background — decorative only, so it never intercepts touch or
          clicks. Belt and braces with enableRotate={false} below. */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        {/* pointerEvents on the Canvas itself, not just the wrapper: R3F sets
            pointer-events:auto on its own inner divs, which overrides an
            inherited `none` from the parent. */}
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }} style={{ pointerEvents: 'none' }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -5]} intensity={0.5} color="#f0ad4e" />
          <AnimatedSphere />
          {/* enableRotate={false} matters on touch: the canvas fills the whole
              min-h-screen hero, and OrbitControls calls preventDefault on
              touch-drag — so a swipe to scroll the page would rotate the sphere
              instead. autoRotate still drives the animation. */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableRotate={false}
            autoRotate
            autoRotateSpeed={0.5}
          />
        </Canvas>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-primary bg-clip-text text-transparent">
            {headline}
          </h1>
        </motion.div>

        {subheadline && (
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-2xl md:text-3xl text-gray-300 mb-12"
          >
            {subheadline}
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <a
            href={ctaUrl}
            className="inline-block px-8 py-4 bg-primary hover:bg-yellow-500 text-gray-900 font-bold text-lg rounded-full transition-all duration-300 transform hover:scale-110 hover:shadow-2xl animate-glow"
          >
            {ctaText}
          </a>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-primary rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-3 bg-primary rounded-full mt-2"
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
