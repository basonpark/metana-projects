"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface GlobeProps {
  className?: string;
}

export function Globe({ className }: GlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const globeRef = useRef<THREE.Mesh | null>(null)
  const pointsRef = useRef<THREE.Points | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000,
    )
    camera.position.z = 5
    cameraRef.current = camera

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.rotateSpeed = 0.5
    controls.enableZoom = false
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.5
    controlsRef.current = controls

    // Globe
    const globeGeometry = new THREE.SphereGeometry(2, 64, 64)

    // Create a shader material for the globe
    const globeMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec2 vUv;
        varying vec3 vNormal;
        
        void main() {
          // Base color with gradient
          vec3 baseColor = mix(
            vec3(0.1, 0.4, 0.8), // Deep blue
            vec3(0.2, 0.6, 1.0), // Light blue
            vUv.y
          );
          
          // Add some noise/pattern
          float pattern = sin(vUv.x * 20.0 + time) * sin(vUv.y * 20.0 + time) * 0.1;
          
          // Edge glow effect
          float edgeGlow = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
          vec3 glowColor = vec3(0.3, 0.6, 1.0);
          
          // Combine effects
          vec3 finalColor = baseColor + pattern + edgeGlow * glowColor;
          
          // Apply transparency based on edge
          float alpha = 0.7 + edgeGlow * 0.3;
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      uniforms: {
        time: { value: 0 },
      },
      transparent: true,
      side: THREE.FrontSide,
    })

    const globe = new THREE.Mesh(globeGeometry, globeMaterial)
    scene.add(globe)
    globeRef.current = globe

    // Add points/connections
    const pointsGeometry = new THREE.BufferGeometry()
    const pointsCount = 200
    const positions = new Float32Array(pointsCount * 3)
    const sizes = new Float32Array(pointsCount)

    for (let i = 0; i < pointsCount; i++) {
      // Create points on the sphere surface
      const phi = Math.random() * Math.PI * 2
      const theta = Math.random() * Math.PI

      const x = 2 * Math.sin(theta) * Math.cos(phi)
      const y = 2 * Math.sin(theta) * Math.sin(phi)
      const z = 2 * Math.cos(theta)

      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z

      sizes[i] = Math.random() * 0.1 + 0.05
    }

    pointsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    pointsGeometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1))

    const pointsMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        
        void main() {
          vColor = mix(
            vec3(0.3, 0.8, 1.0),
            vec3(0.1, 0.5, 1.0),
            position.y * 0.5 + 0.5
          );
          
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          // Create a circular point
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          
          // Soften the edge
          float alpha = 1.0 - smoothstep(0.4, 0.5, dist);
          
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
    })

    const points = new THREE.Points(pointsGeometry, pointsMaterial)
    scene.add(points)
    pointsRef.current = points

    // Add connections between points
    const connectionsMaterial = new THREE.LineBasicMaterial({
      color: 0x4a88ff,
      transparent: true,
      opacity: 0.2,
    })

    // Create connections between nearby points
    const connectionsGeometry = new THREE.BufferGeometry()
    const connectionsPositions: number[] = []

    // Connect points that are close to each other
    for (let i = 0; i < pointsCount; i++) {
      const x1 = positions[i * 3]
      const y1 = positions[i * 3 + 1]
      const z1 = positions[i * 3 + 2]

      for (let j = i + 1; j < pointsCount; j++) {
        const x2 = positions[j * 3]
        const y2 = positions[j * 3 + 1]
        const z2 = positions[j * 3 + 2]

        // Calculate distance between points
        const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2))

        // Connect if they're close enough
        if (distance < 1.0) {
          connectionsPositions.push(x1, y1, z1)
          connectionsPositions.push(x2, y2, z2)
        }
      }
    }

    connectionsGeometry.setAttribute("position", new THREE.Float32BufferAttribute(connectionsPositions, 3))

    const connections = new THREE.LineSegments(connectionsGeometry, connectionsMaterial)
    scene.add(connections)

    // Animation loop
    let time = 0
    const animate = () => {
      requestAnimationFrame(animate)

      time += 0.005
      if (globeRef.current?.material instanceof THREE.ShaderMaterial) {
        globeRef.current.material.uniforms.time.value = time
      }

      if (controlsRef.current) {
        controlsRef.current.update()
      }

      renderer.render(scene, camera)
    }

    animate()
    setIsLoaded(true)

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return

      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight

      cameraRef.current.aspect = width / height
      cameraRef.current.updateProjectionMatrix()

      rendererRef.current.setSize(width, height)
    }

    window.addEventListener("resize", handleResize)

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)

      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement)
      }

      if (globeRef.current) {
        globeRef.current.geometry.dispose()
        if (globeRef.current.material instanceof THREE.Material) {
          globeRef.current.material.dispose()
        }
      }

      if (pointsRef.current) {
        pointsRef.current.geometry.dispose()
        if (pointsRef.current.material instanceof THREE.Material) {
          pointsRef.current.material.dispose()
        }
      }

      if (rendererRef.current) {
        rendererRef.current.dispose()
      }
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoaded ? 1 : 0 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
      ref={containerRef}
      className={cn("w-full h-full", className)}
    />
  )
}
