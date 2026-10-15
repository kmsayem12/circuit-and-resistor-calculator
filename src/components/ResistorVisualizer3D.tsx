import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ColorBand } from '../types';

interface ResistorVisualizer3DProps {
  bands: ColorBand[];
}

export const ResistorVisualizer3D: React.FC<ResistorVisualizer3DProps> = ({ bands }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bandMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);

  // Update band colors whenever bands prop updates
  useEffect(() => {
    if (bandMaterialsRef.current.length >= 4 && bands.length >= 4) {
      bands.forEach((b, idx) => {
        const mat = bandMaterialsRef.current[idx];
        if (mat) {
          mat.color.setStyle(b.color);
        }
      });
    }
  }, [bands]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 220;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 6.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.replaceChildren(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight1.position.set(5, 8, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x818cf8, 0.4);
    dirLight2.position.set(-5, -3, -5);
    scene.add(dirLight2);

    // Resistor assembly group
    const resistorGroup = new THREE.Group();

    // Lead wires
    const leadMat = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      metalness: 0.8,
      roughness: 0.2,
    });
    const leadGeo = new THREE.CylinderGeometry(0.08, 0.08, 6.0, 16);
    leadGeo.rotateZ(Math.PI / 2);
    const leadMesh = new THREE.Mesh(leadGeo, leadMat);
    resistorGroup.add(leadMesh);

    // Ceramic tan body
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xd2b48c,
      roughness: 0.6,
      metalness: 0.1,
    });
    const bodyGeo = new THREE.CylinderGeometry(0.55, 0.55, 2.6, 32);
    bodyGeo.rotateZ(Math.PI / 2);
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    resistorGroup.add(bodyMesh);

    // Bulbous end caps
    const capGeo = new THREE.CylinderGeometry(0.62, 0.62, 0.25, 32);
    capGeo.rotateZ(Math.PI / 2);
    const cap1 = new THREE.Mesh(capGeo, bodyMat);
    cap1.position.x = -1.25;
    resistorGroup.add(cap1);

    const cap2 = new THREE.Mesh(capGeo, bodyMat);
    cap2.position.x = 1.25;
    resistorGroup.add(cap2);

    // 4 Color bands
    const bandPositions = [-0.85, -0.45, -0.05, 0.75];
    const bandMaterials: THREE.MeshStandardMaterial[] = [];

    bandPositions.forEach((xPos, idx) => {
      const bandGeo = new THREE.CylinderGeometry(0.57, 0.57, 0.14, 32);
      bandGeo.rotateZ(Math.PI / 2);
      const bandMat = new THREE.MeshStandardMaterial({
        color: bands[idx]?.color || 0x1a1a1a,
        roughness: 0.4,
      });
      const bandMesh = new THREE.Mesh(bandGeo, bandMat);
      bandMesh.position.x = xPos;
      resistorGroup.add(bandMesh);
      bandMaterials.push(bandMat);
    });

    bandMaterialsRef.current = bandMaterials;
    scene.add(resistorGroup);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.maxPolarAngle = Math.PI / 2 + 0.2;
    controls.minPolarAngle = Math.PI / 4;

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      resistorGroup.rotation.y += 0.006;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const nw = container.clientWidth || 300;
      const nh = container.clientHeight || 220;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };

    window.addEventListener('resize', handleResize);
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      leadGeo.dispose();
      leadMat.dispose();
      bodyGeo.dispose();
      bodyMat.dispose();
      capGeo.dispose();
      bandMaterials.forEach((m) => m.dispose());
      container.replaceChildren();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-56 bg-slate-950/70 border border-slate-700/60 rounded-xl overflow-hidden relative cursor-grab active:cursor-grabbing"
    />
  );
};
