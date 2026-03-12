'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * NetworkSphere - 3D visualization component
 * Creates a sphere network with nodes, connecting lines, and ripple animations
 * Uses project's color variables adapted to Three.js
 */
class NetworkSphere {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  networkGroup: THREE.Group;
  nodes: THREE.InstancedMesh;
  lines: THREE.LineSegments;
  nodeCount: number;
  sphereRadius: number;
  ripples: Array<any>;
  rippleSpeed: number;
  rippleDuration: number;
  baseColor: THREE.Color;
  pulseColor: THREE.Color;

  constructor(container: HTMLCanvasElement) {
    this.nodeCount = 1000;
    this.sphereRadius = 5;
    this.ripples = [];
    this.rippleSpeed = 7.0;
    this.rippleDuration = 2.0;

    // Use project's theme colors adapted to HSL
    // Primary neon green (129 100% 50% -> #00ff41)
    this.baseColor = new THREE.Color(0x00ff41).multiplyScalar(0.15); // Dimmed for base
    // Secondary neon orange (33 100% 50% -> #ff8c00)
    this.pulseColor = new THREE.Color(0xff8c00);

    this.initScene(container);
    this.initNodesAndLines();
    this.addLights();
    this.animate();

    // High frequency pulses (every 400ms)
    setInterval(() => this.triggerRandomPulse(), 400);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  private initScene(container: HTMLCanvasElement) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 12;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      canvas: container,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x000000, 0); // Transparent background

    // Group to hold both nodes and lines so they rotate together
    this.networkGroup = new THREE.Group();
    this.scene.add(this.networkGroup);
  }

  private initNodesAndLines() {
    const nodeGeometry = new THREE.SphereGeometry(0.065, 6, 6);
    const nodeMaterial = new THREE.MeshPhongMaterial({
      shininess: 80,
      specular: 0x222222,
    });

    this.nodes = new THREE.InstancedMesh(nodeGeometry, nodeMaterial, this.nodeCount);

    const dummy = new THREE.Object3D();
    const nodePositions: THREE.Vector3[] = [];

    // 1. Generate Fibonacci Sphere Positions
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

    // 2. Generate Connecting Lines (Proximity based)
    const linePositions: number[] = [];
    const maxConnectDistance = 0.85; // Distance threshold for connections

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
    lineGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(linePositions, 3)
    );

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

    const pos = new THREE.Vector3();
    pos.setFromMatrixPosition(matrix);

    this.ripples.push({
      origin: pos,
      startTime: performance.now() / 1000,
      color: new THREE.Color().setHSL(0.08 + Math.random() * 0.05, 1, 0.5),
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

    if (this.nodes.instanceColor) {
      this.nodes.instanceColor.needsUpdate = true;
    }
  }

  private onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private animate = () => {
    requestAnimationFrame(this.animate);

    // Rotate the entire group (nodes and lines together)
    this.networkGroup.rotation.y += 0.002;
    this.networkGroup.rotation.x += 0.001;

    this.updateRipples();
    this.renderer.render(this.scene, this.camera);
  };

  public dispose() {
    this.renderer.dispose();
  }
}

interface NetworkSphereComponentProps {
  className?: string;
}

/**
 * React wrapper for NetworkSphere Three.js component
 */
export function NetworkSphereComponent({ className = '' }: NetworkSphereComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sphereRef = useRef<NetworkSphere | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Three.js sphere
    sphereRef.current = new NetworkSphere(canvasRef.current);

    return () => {
      // Cleanup
      if (sphereRef.current) {
        sphereRef.current.dispose();
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 -z-10 ${className}`}
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  );
}
