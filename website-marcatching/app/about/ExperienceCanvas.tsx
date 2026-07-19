'use client'

import { useEffect, useRef, useState } from 'react'
import { experienceStore, useExperience } from './ExperienceStore'
import styles from './ExperienceCanvas.module.css'

const VERTEX_SHADER = `
  precision highp float;
  attribute vec3 aPosition;
  attribute float aSeed;
  uniform float uTime;
  uniform float uScene;
  uniform float uProgress;
  uniform float uAspect;
  uniform vec2 uPointer;
  varying float vAlpha;
  varying float vBlue;

  vec3 rotateY(vec3 p, float a) {
    float c = cos(a);
    float s = sin(a);
    return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
  }

  vec3 rotateX(vec3 p, float a) {
    float c = cos(a);
    float s = sin(a);
    return vec3(p.x, c * p.y - s * p.z, s * p.y + c * p.z);
  }

  void main() {
    vec3 source = aPosition;
    float t = uTime * 0.16;
    vec3 sphere = normalize(source + vec3(0.001)) * (0.36 + aSeed * 0.28);
    sphere = rotateY(sphere, t + uPointer.x * 0.22);
    sphere = rotateX(sphere, uPointer.y * 0.16);

    vec3 chaos = source * vec3(1.15, 0.88, 0.5);
    chaos.xy += vec2(sin(t * 1.7 + aSeed * 19.0), cos(t + aSeed * 23.0)) * 0.035;

    float column = floor(aSeed * 13.0);
    vec3 bars = vec3((column / 12.0 - 0.5) * 1.8, -0.66 + mod(aSeed * 37.0, 1.0) * (0.2 + column / 13.0), source.z * 0.15);

    vec3 bridge = vec3(source.x * 1.24, sin(source.x * 5.8 + t) * 0.045, source.z * 0.2);
    bridge.y += (step(0.5, fract(aSeed * 7.0)) - 0.5) * 0.16;

    float orbitAngle = aSeed * 25.1327 + t;
    float orbitRadius = 0.25 + fract(aSeed * 9.0) * 0.62;
    vec3 orbit = vec3(cos(orbitAngle) * orbitRadius, sin(orbitAngle) * orbitRadius * 0.55, source.z * 0.2);

    vec3 grid = vec3(
      (floor(aSeed * 18.0) / 17.0 - 0.5) * 1.7,
      (floor(fract(aSeed * 18.0) * 10.0) / 9.0 - 0.5) * 1.05,
      source.z * 0.08
    );

    float logoAngle = aSeed * 18.8495;
    float logoBand = mix(0.24, 0.62, step(0.52, fract(aSeed * 5.0)));
    vec3 logo = vec3(cos(logoAngle) * logoBand, sin(logoAngle) * logoBand, source.z * 0.08);
    logo.x += (step(0.5, fract(aSeed * 11.0)) - 0.5) * 0.11;

    vec3 target = sphere;
    if (uScene > 0.5 && uScene < 1.5) target = mix(chaos, grid, uProgress);
    else if (uScene < 2.5 && uScene > 1.5) target = bridge;
    else if (uScene < 3.5 && uScene > 2.5) target = bars;
    else if (uScene < 4.5 && uScene > 3.5) target = grid;
    else if (uScene < 5.5 && uScene > 4.5) target = orbit;
    else if (uScene < 6.5 && uScene > 5.5) target = grid;
    else if (uScene < 7.5 && uScene > 6.5) target = mix(sphere, bridge, uProgress);
    else if (uScene < 8.5 && uScene > 7.5) target = orbit * 0.78;
    else if (uScene < 9.5 && uScene > 8.5) target = mix(chaos, bridge, 0.45);
    else if (uScene > 9.5) target = mix(orbit, logo, uProgress);

    target.x /= max(uAspect, 1.0);
    float depth = 1.0 + target.z * 0.35;
    gl_Position = vec4(target.xy / depth, 0.0, 1.0);
    gl_PointSize = (1.4 + fract(aSeed * 31.0) * 2.7) / depth;
    vAlpha = 0.22 + fract(aSeed * 17.0) * 0.68;
    vBlue = fract(aSeed * 13.0);
  }
`

const FRAGMENT_SHADER = `
  precision mediump float;
  varying float vAlpha;
  varying float vBlue;

  void main() {
    float d = distance(gl_PointCoord, vec2(0.5));
    if (d > 0.5) discard;
    float glow = smoothstep(0.5, 0.04, d);
    vec3 silver = vec3(0.72, 0.85, 0.96);
    vec3 blue = vec3(0.20, 0.52, 0.92);
    gl_FragColor = vec4(mix(silver, blue, vBlue * 0.72), glow * vAlpha);
  }
`

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

export default function ExperienceCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { tier, reducedMotion } = useExperience()
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || tier === 'C' || reducedMotion) return

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: tier === 'A',
      depth: false,
      powerPreference: tier === 'A' ? 'high-performance' : 'low-power',
      premultipliedAlpha: true,
    })
    if (!gl) {
      setFailed(true)
      return
    }

    const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
    const fragment = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
    if (!vertex || !fragment) {
      setFailed(true)
      return
    }

    const program = gl.createProgram()
    if (!program) return
    gl.attachShader(program, vertex)
    gl.attachShader(program, fragment)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setFailed(true)
      return
    }

    const count = tier === 'A' ? 920 : 480
    const positions = new Float32Array(count * 3)
    const seeds = new Float32Array(count)
    let random = 2841
    const nextRandom = () => {
      random = (random * 16807) % 2147483647
      return (random - 1) / 2147483646
    }

    for (let index = 0; index < count; index += 1) {
      positions[index * 3] = nextRandom() * 2 - 1
      positions[index * 3 + 1] = nextRandom() * 2 - 1
      positions[index * 3 + 2] = nextRandom() * 2 - 1
      seeds[index] = nextRandom()
    }

    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)
    const positionLocation = gl.getAttribLocation(program, 'aPosition')
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0)

    const seedBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, seedBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, seeds, gl.STATIC_DRAW)
    const seedLocation = gl.getAttribLocation(program, 'aSeed')
    gl.enableVertexAttribArray(seedLocation)
    gl.vertexAttribPointer(seedLocation, 1, gl.FLOAT, false, 0, 0)

    const timeLocation = gl.getUniformLocation(program, 'uTime')
    const sceneLocation = gl.getUniformLocation(program, 'uScene')
    const progressLocation = gl.getUniformLocation(program, 'uProgress')
    const aspectLocation = gl.getUniformLocation(program, 'uAspect')
    const pointerLocation = gl.getUniformLocation(program, 'uPointer')

    gl.useProgram(program)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE)
    gl.clearColor(0, 0, 0, 0)

    let frame = 0
    let visible = !document.hidden
    const started = performance.now()

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, tier === 'A' ? 1.5 : 1.15)
      const width = Math.max(Math.floor(canvas.clientWidth * dpr), 1)
      const height = Math.max(Math.floor(canvas.clientHeight * dpr), 1)
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }
      gl.viewport(0, 0, width, height)
    }

    const draw = (now: number) => {
      if (!visible) return
      resize()
      const snapshot = experienceStore.getSnapshot()
      const pointer = experienceStore.getPointer()
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform1f(timeLocation, (now - started) / 1000)
      gl.uniform1f(sceneLocation, snapshot.activeIndex)
      gl.uniform1f(progressLocation, snapshot.sectionProgress)
      gl.uniform1f(aspectLocation, canvas.width / Math.max(canvas.height, 1))
      gl.uniform2f(pointerLocation, pointer.x, pointer.y)
      gl.drawArrays(gl.POINTS, 0, count)
      frame = requestAnimationFrame(draw)
    }

    const onVisibilityChange = () => {
      visible = !document.hidden
      cancelAnimationFrame(frame)
      if (visible) frame = requestAnimationFrame(draw)
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    frame = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      gl.deleteBuffer(positionBuffer)
      gl.deleteBuffer(seedBuffer)
      gl.deleteProgram(program)
      gl.deleteShader(vertex)
      gl.deleteShader(fragment)
    }
  }, [tier, reducedMotion])

  if (tier === 'C' || reducedMotion || failed) {
    return <div className={styles.fallback} aria-hidden="true" />
  }

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
}
