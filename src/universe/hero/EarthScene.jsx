import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { advanceOrbit, EARTH_RADIUS, fitOrbitCamera, orbitPoint, orbitScale, SERVICE_ORBITS } from './orbitMath.js'

const EARTH_INITIAL_ROTATION = 3.35
const TEXTURES = ['/visuals/earth/earth-day.webp', '/visuals/earth/earth-clouds.webp']
const ATMOSPHERE_VERTEX = `
  varying vec3 vSurfaceNormal;
  varying vec3 vViewDirection;
  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vSurfaceNormal = normalize(normalMatrix * normal);
    vViewDirection = -viewPosition.xyz;
    gl_Position = projectionMatrix * viewPosition;
  }
`
const ATMOSPHERE_FRAGMENT = `
  uniform vec3 warmColor;
  uniform vec3 coolColor;
  varying vec3 vSurfaceNormal;
  varying vec3 vViewDirection;
  void main() {
    vec3 normal = normalize(vSurfaceNormal);
    float facing = max(dot(normal, normalize(vViewDirection)), 0.0);
    float rim = pow(1.0 - facing, 3.5);
    vec3 color = mix(coolColor, warmColor, smoothstep(-0.5, 0.7, -normal.x));
    gl_FragColor = vec4(color, rim * 0.32);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

function OrbitTrack({ orbit }) {
  const positions = useMemo(() => {
    const samples = 160
    const points = new Float32Array(samples * 3)
    const point = new THREE.Vector3()
    for (let index = 0; index < samples; index += 1) {
      orbitPoint(orbit, index / samples * Math.PI * 2, point)
      point.toArray(points, index * 3)
    }
    return points
  }, [orbit])

  return (
    <lineLoop>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={positions.length / 3} itemSize={3} />
      </bufferGeometry>
      <lineBasicMaterial color="#a6a68b" transparent opacity={0.55} depthWrite={false} />
    </lineLoop>
  )
}

export default function EarthScene({ animate, reduced, quality, labelRefs, onReady }) {
  const { camera, gl, size, invalidate } = useThree()
  const [day, clouds] = useLoader(THREE.TextureLoader, TEXTURES)
  const earth = useRef(null)
  const cloudLayer = useRef(null)
  const markers = useRef([])
  const elapsed = useRef(0)
  const ready = useRef(false)
  const alive = useRef(true)
  const scratch = useMemo(() => ({ world: new THREE.Vector3(), projected: new THREE.Vector3() }), [])
  const atmosphereUniforms = useMemo(() => ({
    warmColor: { value: new THREE.Color('#fff1ce') },
    coolColor: { value: new THREE.Color('#a4b8ac') },
  }), [])
  const segments = quality === 'low' ? 48 : 80
  const orbitSeconds = quality === 'low' ? 55 : 45

  useLayoutEffect(() => {
    day.colorSpace = THREE.SRGBColorSpace
    clouds.colorSpace = THREE.NoColorSpace
    day.anisotropy = Math.min(4, gl.capabilities.getMaxAnisotropy())
    day.needsUpdate = true
    clouds.needsUpdate = true
  }, [day, clouds, gl])

  useEffect(() => {
    alive.current = true
    return () => { alive.current = false }
  }, [])

  const showReady = useCallback(() => {
    if (ready.current) return
    ready.current = true
    // Report readiness after a textured frame, not while Suspense is loading.
    queueMicrotask(() => { if (alive.current) onReady?.() })
  }, [onReady])

  const positionServices = useCallback(() => {
    const orbitPhase = advanceOrbit(elapsed.current, orbitSeconds)
    for (let index = 0; index < SERVICE_ORBITS.length; index += 1) {
      const orbit = SERVICE_ORBITS[index]
      const phase = reduced ? orbit.staticPhase : orbit.phase + orbitPhase
      orbitPoint(orbit, phase, scratch.world)
      const label = labelRefs?.current[index]
      if (label) {
        scratch.projected.copy(scratch.world).project(camera)
        const x = scratch.projected.x * size.width / 2
        const y = -scratch.projected.y * size.height / 2
        const scale = orbitScale(camera.position.z, scratch.world.z, orbit.radius * Math.sin(orbit.tilt))
        label.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) translate(-50%, -50%) scale(${scale.toFixed(4)})`
        label.style.zIndex = scratch.world.z < 0 ? '1' : '3'
        label.dataset.depth = scratch.world.z.toFixed(3)
        label.dataset.scale = scale.toFixed(4)
      }
      if (markers.current[index]) {
        orbitPoint(orbit, phase - 0.65, markers.current[index].position)
      }
    }
    gl.domElement.dataset.orbitPhase = orbitPhase.toFixed(4)
    gl.domElement.dataset.earthAngle = (EARTH_INITIAL_ROTATION + elapsed.current * Math.PI * 2 / 100).toFixed(4)
  }, [camera, gl, labelRefs, orbitSeconds, reduced, scratch, size.width, size.height])

  useLayoutEffect(() => {
    const fit = () => {
      const distance = fitOrbitCamera({
        width: size.width,
        height: size.height,
        labelWidths: SERVICE_ORBITS.map((_, index) => labelRefs?.current[index]?.offsetWidth || 0),
        fov: camera.fov,
      })
      camera.position.set(0, 0, distance)
      camera.far = Math.max(40, distance + 8)
      camera.lookAt(0, 0, 0)
      camera.updateProjectionMatrix()
      camera.updateMatrixWorld()
      positionServices()
      invalidate()
    }
    // Framing includes the actual DOM badge width at its depth, not only its
    // center. Font/layout changes therefore cannot crop labels mid-orbit.
    fit()
    const observer = new ResizeObserver(fit)
    labelRefs?.current.forEach((label) => { if (label) observer.observe(label) })
    return () => observer.disconnect()
  }, [camera, size.width, size.height, positionServices, invalidate, labelRefs])

  useLayoutEffect(() => {
    if (!reduced) return
    // A preference change returns every service to the readable authored pose.
    elapsed.current = 0
    if (earth.current) earth.current.rotation.y = EARTH_INITIAL_ROTATION
    if (cloudLayer.current) cloudLayer.current.rotation.y = EARTH_INITIAL_ROTATION
    positionServices()
    invalidate()
  }, [reduced, positionServices, invalidate])

  useFrame((_, delta) => {
    if (animate) elapsed.current += Math.min(delta, 0.05)
    if (earth.current) earth.current.rotation.y = EARTH_INITIAL_ROTATION + elapsed.current * Math.PI * 2 / 100
    if (cloudLayer.current) cloudLayer.current.rotation.y = EARTH_INITIAL_ROTATION + elapsed.current * Math.PI * 2 / 93
    positionServices()
  })

  return (
    <>
      <ambientLight color="#e9e5d8" intensity={0.75} />
      <directionalLight position={[-6, 4, 6]} color="#fff0cd" intensity={2.8} />
      <directionalLight position={[4, -1, 2]} color="#b8c6bf" intensity={0.35} />
      <group rotation-z={0.1}>
        <mesh ref={earth} rotation-y={EARTH_INITIAL_ROTATION} onAfterRender={showReady}>
          <sphereGeometry args={[EARTH_RADIUS, segments, segments]} />
          <meshPhongMaterial map={day} color="#dfdcc3" specular="#343b2f" shininess={7} />
        </mesh>
        <mesh ref={cloudLayer} rotation-y={EARTH_INITIAL_ROTATION}>
          <sphereGeometry args={[EARTH_RADIUS + 0.015, segments, segments]} />
          <meshPhongMaterial color="#faf4df" alphaMap={clouds} transparent opacity={0.68} depthWrite={false} shininess={0} />
        </mesh>
      </group>
      <mesh>
        <sphereGeometry args={[EARTH_RADIUS + 0.055, segments, segments]} />
        <shaderMaterial
          uniforms={atmosphereUniforms}
          vertexShader={ATMOSPHERE_VERTEX}
          fragmentShader={ATMOSPHERE_FRAGMENT}
          transparent
          depthWrite={false}
        />
      </mesh>
      {SERVICE_ORBITS.slice(0, 3).map((orbit, index) => (
        <group key={index}>
          <OrbitTrack orbit={orbit} />
          <mesh ref={(node) => { markers.current[index] = node }}>
            <sphereGeometry args={[0.026, 10, 8]} />
            <meshBasicMaterial color={index === 1 ? '#f5efdb' : '#757e55'} />
          </mesh>
        </group>
      ))}
    </>
  )
}
