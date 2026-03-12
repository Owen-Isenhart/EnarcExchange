'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Helper to get HSL color from CSS variable
 */
function getCssVarColor(varName: string, defaultHex: number): THREE.Color {
  if (typeof window === 'undefined') return new THREE.Color(defaultHex);
  const val = getComputedStyle(document.body).getPropertyValue(varName).trim() || 
              getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
              
  if (!val) {
    console.warn(`NetworkSphere: CSS variable ${varName} not found, falling back to`, defaultHex);
    return new THREE.Color(defaultHex);
  }
  
  const parts = val.split(' ').map(p => parseFloat(p.replace('%', '')));
  console.log(`NetworkSphere: Parsed ${varName} as`, parts);
  
  if (parts.length >= 3) {
    return new THREE.Color().setHSL(parts[0] / 360, parts[1] / 100, parts[2] / 100);
  }
  console.warn(`NetworkSphere: CSS variable ${varName} had invalid format: ${val}, falling back`);
  return new THREE.Color(defaultHex);
}

/**
 * NetworkSphere - 3D visualization component
 * Creates a sphere network with nodes, connecting lines, and ripple animations
 */
class NetworkSphere {
  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  renderer!: THREE.WebGLRenderer;
  networkGroup!: THREE.Group;
  nodes!: THREE.InstancedMesh;
  lines!: THREE.LineSegments;
  nodeCount: number;
  sphereRadius: number;
  ripples: Array<any>;
  rippleSpeed: number;
  rippleDuration: number;
  baseColor: THREE.Color;
  pulseColor: THREE.Color;
  private observer: MutationObserver | null = null;

  constructor(container: HTMLCanvasElement) {
    this.nodeCount = 1000;
    this.sphereRadius = 5;
    this.ripples = [];
    this.rippleSpeed = 7.0;
    this.rippleDuration = 2.0;

    this.baseColor = new THREE.Color(0x00ff41).multiplyScalar(0.15);
    this.pulseColor = new THREE.Color(0xff8c00);

    this.initScene(container);
    this.initNodesAndLines();
    this.updateColors();

    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class' || mutation.attributeName === 'style') {
          this.updateColors();
        }
      });
    });
    this.observer.observe(document.documentElement, { attributes: true });
    this.observer.observe(document.body, { attributes: true });

    this.addLights();
    this.animate();

    setInterval(() => this.triggerRandomPulse(), 400);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  private updateColors() {
    const primaryColor = getCssVarColor('--color-primary', 0x00ff41);
    this.baseColor = primaryColor.clone();
    this.pulseColor = getCssVarColor('--color-secondary', 0xff8c00);
    
    if (this.lines) {
      (this.lines.material as THREE.LineBasicMaterial).color.copy(primaryColor);
      (this.lines.material as THREE.LineBasicMaterial).opacity = 0.3;
    }
  }

  private initScene(container: HTMLCanvasElement) {
    this.scene = new THREE.Scene();
    
    // Updated to use container dimensions
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(
      60,
      width / height,
      0.1,
      1000
    );
    this.camera.position.z = 12;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      canvas: container,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x000000, 0);

    this.networkGroup = new THREE.Group();
    this.scene.add(this.networkGroup);
  }

  private initNodesAndLines() {
    const nodeGeometry = new THREE.SphereGeometry(0.065, 6, 6);
    const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

    this.nodes = new THREE.InstancedMesh(nodeGeometry, nodeMaterial, this.nodeCount);

    const dummy = new THREE.Object3D();
    const nodePositions: THREE.Vector3[] = [];

    for (let i = 0; i < this.nodeCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / this.nodeCount);
      const theta = Math.sqrt(this.nodeCount * Math.PI) * phi;

      const pos = new THREE.Vector3(
        this.sphereRadius * Math.cos(theta) * Math.sin(phi),
        this.sphereRadius * Math.sin(theta) * Math.sin(phi),
        this.sphereRadius * Math.cos(phi)
      );

      nodePositions.push(pos);
      dummy.position.copy(pos);
      dummy.lookAt(0, 0, 0);
      dummy.updateMatrix();

      this.nodes.setMatrixAt(i, dummy.matrix);
      this.nodes.setColorAt(i, this.baseColor);
    }

    const linePositions: number[] = [];
    const maxConnectDistance = 0.85;

    for (let i = 0; i < this.nodeCount; i++) {
      for (let j = i + 1; j < this.nodeCount; j++) {
        const dist = nodePositions[i].distanceTo(nodePositions[j]);
        if (dist < maxConnectDistance) {
          linePositions.push(nodePositions[i].x, nodePositions[i].y, nodePositions[i].z);
          linePositions.push(nodePositions[j].x, nodePositions[j].y, nodePositions[j].z);
        }
      }
    }

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x00ff41,
      transparent: true,
      opacity: 0.1,
      blending: THREE.AdditiveBlending,
    });

    this.lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    this.networkGroup.add(this.nodes);
    this.networkGroup.add(this.lines);
  }

  private addLights() {
    const ambient = new THREE.AmbientLight(0x203020, 1.5);
    this.scene.add(ambient);
    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    pointLight.position.set(10, 10, 10);
    this.scene.add(pointLight);
  }

  private triggerRandomPulse() {
    const idx = Math.floor(Math.random() * this.nodeCount);
    const matrix = new THREE.Matrix4();
    this.nodes.getMatrixAt(idx, matrix);
    const pos = new THREE.Vector3().setFromMatrixPosition(matrix);

    this.ripples.push({
      origin: pos,
      startTime: performance.now() / 1000,
      color: this.pulseColor.clone(),
    });
  }

  private updateRipples() {
    const now = performance.now() / 1000;
    const nodePos = new THREE.Vector3();
    const dummyMatrix = new THREE.Matrix4();

    this.ripples = this.ripples.filter((r) => now - r.startTime < this.rippleDuration);

    for (let i = 0; i < this.nodeCount; i++) {
      this.nodes.getMatrixAt(i, dummyMatrix);
      nodePos.setFromMatrixPosition(dummyMatrix);
      let activeColor = this.baseColor.clone();

      this.ripples.forEach((ripple) => {
        const elapsed = now - ripple.startTime;
        const currentRippleRadius = elapsed * this.rippleSpeed;
        const distFromOrigin = nodePos.distanceTo(ripple.origin);
        const waveThickness = 2.0;
        const diff = Math.abs(distFromOrigin - currentRippleRadius);

        if (diff < waveThickness) {
          const intensity = 1.0 - diff / waveThickness;
          const lifeProgress = 1.0 - elapsed / this.rippleDuration;
          const strength = intensity * Math.pow(lifeProgress, 1.5);
          activeColor.lerp(ripple.color, strength);
        }
      });
      this.nodes.setColorAt(i, activeColor);
    }

    if (this.nodes.instanceColor) this.nodes.instanceColor.needsUpdate = true;
  }

  private onWindowResize() {
    // Updated to use the actual client dimensions of the canvas
    const width = this.renderer.domElement.clientWidth;
    const height = this.renderer.domElement.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private animate = () => {
    requestAnimationFrame(this.animate);
    this.networkGroup.rotation.y += 0.002;
    this.networkGroup.rotation.x += 0.001;
    this.updateRipples();
    this.renderer.render(this.scene, this.camera);
  };

  public dispose() {
    this.renderer.dispose();
    if (this.observer) this.observer.disconnect();
  }
}

interface NetworkSphereComponentProps {
  className?: string;
}

export function NetworkSphereComponent({ className = '' }: NetworkSphereComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sphereRef = useRef<NetworkSphere | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    sphereRef.current = new NetworkSphere(canvasRef.current);
    return () => sphereRef.current?.dispose();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      // Changed 'fixed' to 'absolute' to contain it within the main content area
      className={`absolute inset-0 -z-10 ${className}`}
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  );
}