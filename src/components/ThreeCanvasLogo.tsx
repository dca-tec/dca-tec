import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RotateCw, Sparkles, ZoomIn, ZoomOut, Layers, Eye } from "lucide-react";

interface ThreeCanvasLogoProps {
  className?: string;
  height?: number | string;
  autoRotate?: boolean;
}

export default function ThreeCanvasLogo({
  className = "",
  height = 420,
  autoRotate: initialAutoRotate = true,
}: ThreeCanvasLogoProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState(initialAutoRotate);
  const [wireframe, setWireframe] = useState(false);
  const [colorTheme, setColorTheme] = useState<"cyan" | "gold" | "purple">("cyan");

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const logoGroupRef = useRef<THREE.Group | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const materialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const lightsRef = useRef<{ main: THREE.PointLight; rim: THREE.PointLight; ambient: THREE.AmbientLight } | null>(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = currentMount.clientWidth || 600;
    const h = typeof height === "number" ? height : currentMount.clientHeight || 420;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / h, 0.1, 1000);
    camera.position.set(0, 0, 11);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    currentMount.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const mainLight = new THREE.PointLight(0x00ffe0, 80, 50);
    mainLight.position.set(5, 6, 8);
    scene.add(mainLight);

    const rimLight = new THREE.PointLight(0x0070f3, 60, 50);
    rimLight.position.set(-6, -4, 6);
    scene.add(rimLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 1.5);
    backLight.position.set(0, 5, -8);
    scene.add(backLight);

    lightsRef.current = { main: mainLight, rim: rimLight, ambient: ambientLight };

    // Group for DCA 3D Logo Emblem
    const logoGroup = new THREE.Group();
    scene.add(logoGroup);
    logoGroupRef.current = logoGroup;

    materialsRef.current = [];

    // Colors
    const primaryHex = 0x00ffe0;
    const metallicHex = 0x223344;

    // Material 1: Chrome / Metallic Beveled
    const chromeMat = new THREE.MeshStandardMaterial({
      color: metallicHex,
      metalness: 0.9,
      roughness: 0.15,
      wireframe: wireframe,
    });
    materialsRef.current.push(chromeMat);

    // Material 2: Emissive Cyan Neon Edge
    const neonMat = new THREE.MeshStandardMaterial({
      color: primaryHex,
      emissive: primaryHex,
      emissiveIntensity: 0.8,
      metalness: 0.3,
      roughness: 0.2,
      wireframe: wireframe,
    });
    materialsRef.current.push(neonMat);

    // 1. Outer Hexagonal Shield / Tech Ring
    const ringGeo = new THREE.TorusGeometry(3.6, 0.12, 16, 6);
    const ringMesh = new THREE.Mesh(ringGeo, neonMat);
    ringMesh.rotation.z = Math.PI / 6;
    logoGroup.add(ringMesh);

    // Secondary inner orbit ring
    const orbitGeo = new THREE.TorusGeometry(3.9, 0.04, 16, 64);
    const orbitMesh = new THREE.Mesh(orbitGeo, neonMat);
    orbitMesh.rotation.x = Math.PI / 3;
    logoGroup.add(orbitMesh);

    // 2. 3D "D" Monogram Element (Curved Beveled Arc)
    const dShape = new THREE.Shape();
    dShape.moveTo(-2.2, -1.5);
    dShape.lineTo(-1.0, -1.5);
    dShape.bezierCurveTo(0.2, -1.5, 0.4, 1.5, -1.0, 1.5);
    dShape.lineTo(-2.2, 1.5);
    dShape.closePath();

    const dHole = new THREE.Path();
    dHole.moveTo(-1.6, -0.9);
    dHole.lineTo(-1.0, -0.9);
    dHole.bezierCurveTo(-0.1, -0.9, -0.1, 0.9, -1.0, 0.9);
    dHole.lineTo(-1.6, 0.9);
    dHole.closePath();
    dShape.holes.push(dHole);

    const extrudeSettings = {
      depth: 0.6,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 2,
      bevelSize: 0.12,
      bevelThickness: 0.15,
    };

    const dGeo = new THREE.ExtrudeGeometry(dShape, extrudeSettings);
    dGeo.center();
    const dMesh = new THREE.Mesh(dGeo, chromeMat);
    dMesh.position.set(-1.4, 0.1, 0);
    logoGroup.add(dMesh);

    // D Neon Edge accent
    const dEdgeMesh = new THREE.Mesh(dGeo, neonMat);
    dEdgeMesh.scale.set(1.02, 1.02, 0.9);
    dEdgeMesh.position.set(-1.4, 0.1, -0.05);
    logoGroup.add(dEdgeMesh);

    // 3. 3D "C" & "A" Central Intersecting Futuristic Chevron
    const cShape = new THREE.Shape();
    cShape.moveTo(0.5, 1.5);
    cShape.lineTo(-0.2, 1.5);
    cShape.bezierCurveTo(-1.2, 1.5, -1.2, -1.5, -0.2, -1.5);
    cShape.lineTo(0.5, -1.5);
    cShape.lineTo(0.5, -0.9);
    cShape.lineTo(0.0, -0.9);
    cShape.bezierCurveTo(-0.5, -0.9, -0.5, 0.9, 0.0, 0.9);
    cShape.lineTo(0.5, 0.9);
    cShape.closePath();

    const cGeo = new THREE.ExtrudeGeometry(cShape, extrudeSettings);
    cGeo.center();
    const cMesh = new THREE.Mesh(cGeo, chromeMat);
    cMesh.position.set(0.1, 0.1, 0.3);
    logoGroup.add(cMesh);

    // 4. "A" Dynamic Apex Prism
    const aShape = new THREE.Shape();
    aShape.moveTo(1.2, -1.5);
    aShape.lineTo(1.8, 1.5);
    aShape.lineTo(2.4, 1.5);
    aShape.lineTo(3.0, -1.5);
    aShape.lineTo(2.4, -1.5);
    aShape.lineTo(2.25, -0.3);
    aShape.lineTo(1.95, -0.3);
    aShape.lineTo(1.8, -1.5);
    aShape.closePath();

    const aHole = new THREE.Path();
    aHole.moveTo(2.0, 0.1);
    aHole.lineTo(2.2, 0.1);
    aHole.lineTo(2.1, 0.9);
    aHole.closePath();
    aShape.holes.push(aHole);

    const aGeo = new THREE.ExtrudeGeometry(aShape, extrudeSettings);
    aGeo.center();
    const aMesh = new THREE.Mesh(aGeo, chromeMat);
    aMesh.position.set(1.5, 0.1, 0.6);
    logoGroup.add(aMesh);

    // 5. Ambient 3D Particle Cloud
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 14;
      particlePositions[i + 1] = (Math.random() - 0.5) * 14;
      particlePositions[i + 2] = (Math.random() - 0.5) * 10;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: primaryHex,
      size: 0.08,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Mouse Interaction
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotY = 0;
    let targetRotX = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) {
        // subtle hover parallax
        const rect = currentMount.getBoundingClientRect();
        const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        targetRotY = normX * 0.4;
        targetRotX = -normY * 0.4;
        return;
      }
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      if (logoGroupRef.current) {
        logoGroupRef.current.rotation.y += deltaX * 0.01;
        logoGroupRef.current.rotation.x += deltaY * 0.01;
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    currentMount.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (logoGroupRef.current) {
        if (autoRotate && !isDragging) {
          logoGroupRef.current.rotation.y += 0.012;
          logoGroupRef.current.rotation.x = Math.sin(elapsedTime * 0.8) * 0.15;
          logoGroupRef.current.position.y = Math.sin(elapsedTime * 1.5) * 0.15;
        } else if (!isDragging) {
          logoGroupRef.current.rotation.y += (targetRotY - logoGroupRef.current.rotation.y) * 0.05;
          logoGroupRef.current.rotation.x += (targetRotX - logoGroupRef.current.rotation.x) * 0.05;
        }
      }

      // Rotate orbit ring independently
      orbitMesh.rotation.z += 0.008;
      particles.rotation.y += 0.002;

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!currentMount || !cameraRef.current || !rendererRef.current) return;
      const newW = currentMount.clientWidth;
      const newH = typeof height === "number" ? height : currentMount.clientHeight;
      cameraRef.current.aspect = newW / newH;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      currentMount.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      cancelAnimationFrame(animationFrameId);
      if (currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [height]);

  // Handle wireframe toggle
  useEffect(() => {
    materialsRef.current.forEach((m) => {
      m.wireframe = wireframe;
    });
  }, [wireframe]);

  // Handle theme colors
  useEffect(() => {
    if (!lightsRef.current) return;
    let mainColor = 0x00ffe0;
    let rimColor = 0x0070f3;

    if (colorTheme === "gold") {
      mainColor = 0xffd700;
      rimColor = 0xff8c00;
    } else if (colorTheme === "purple") {
      mainColor = 0xc084fc;
      rimColor = 0x3b82f6;
    }

    lightsRef.current.main.color.setHex(mainColor);
    lightsRef.current.rim.color.setHex(rimColor);

    if (materialsRef.current[1]) {
      materialsRef.current[1].color.setHex(mainColor);
      materialsRef.current[1].emissive.setHex(mainColor);
    }
  }, [colorTheme]);

  const handleZoom = (delta: number) => {
    if (!cameraRef.current) return;
    cameraRef.current.position.z = Math.min(Math.max(cameraRef.current.position.z + delta, 6), 18);
  };

  const handleReset = () => {
    if (!logoGroupRef.current || !cameraRef.current) return;
    logoGroupRef.current.rotation.set(0, 0, 0);
    cameraRef.current.position.set(0, 0, 11);
  };

  return (
    <div className={`relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#0a1120]/80 via-black to-[#050810]/90 border border-white/10 shadow-[0_0_40px_rgba(0,255,224,0.15)] group ${className}`}>
      {/* 3D WebGL Canvas Container */}
      <div 
        ref={mountRef} 
        className="w-full cursor-grab active:cursor-grabbing flex items-center justify-center"
        style={{ height }}
      />

      {/* Futuristic Corner HUD Markers */}
      <div className="absolute top-4 left-4 flex items-center gap-2 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-[#00ffe0] animate-ping" />
        <span className="text-[10px] uppercase font-mono tracking-widest text-[#00ffe0] bg-[#00ffe0]/10 px-2 py-0.5 rounded border border-[#00ffe0]/20">
          3D ENGINE // WEBGL ACTIVE
        </span>
      </div>

      <div className="absolute top-4 right-4 text-[10px] font-mono text-white/40 pointer-events-none hidden sm:block">
        DRAG TO ROTATE 360°
      </div>

      {/* Control Toolbar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/70 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-xl">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          title={autoRotate ? "Pausar Rotação" : "Girar Automaticamente"}
          className={`p-2 rounded-full transition-colors text-xs flex items-center gap-1.5 ${
            autoRotate ? "bg-[#00ffe0]/20 text-[#00ffe0] border border-[#00ffe0]/30" : "text-white/60 hover:text-white hover:bg-white/10"
          }`}
        >
          <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? "animate-spin" : ""}`} />
          <span className="text-[10px] font-bold tracking-wider hidden sm:inline">
            {autoRotate ? "ROTACIONANDO" : "PAUSADO"}
          </span>
        </button>

        <div className="w-[1px] h-4 bg-white/20 mx-1" />

        <button
          onClick={() => setWireframe(!wireframe)}
          title="Alternar Modo Wireframe"
          className={`p-2 rounded-full transition-colors text-xs ${
            wireframe ? "bg-[#00ffe0]/20 text-[#00ffe0]" : "text-white/60 hover:text-white hover:bg-white/10"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => handleZoom(-1.5)}
          title="Zoom +"
          className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => handleZoom(1.5)}
          title="Zoom -"
          className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={handleReset}
          title="Redefinir Posição"
          className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-white/20 mx-1" />

        {/* Theme presets */}
        <div className="flex items-center gap-1.5 pl-1">
          <button
            onClick={() => setColorTheme("cyan")}
            className={`w-4 h-4 rounded-full bg-[#00ffe0] transition-transform ${colorTheme === "cyan" ? "scale-125 ring-2 ring-white" : "opacity-50"}`}
            title="Neon Cyan"
          />
          <button
            onClick={() => setColorTheme("gold")}
            className={`w-4 h-4 rounded-full bg-[#ffd700] transition-transform ${colorTheme === "gold" ? "scale-125 ring-2 ring-white" : "opacity-50"}`}
            title="Cyber Gold"
          />
          <button
            onClick={() => setColorTheme("purple")}
            className={`w-4 h-4 rounded-full bg-[#c084fc] transition-transform ${colorTheme === "purple" ? "scale-125 ring-2 ring-white" : "opacity-50"}`}
            title="Deep Plasma"
          />
        </div>
      </div>
    </div>
  );
}
