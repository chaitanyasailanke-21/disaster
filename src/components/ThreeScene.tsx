import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { 
  simulationEngine, 
  LOCAL_COMPUTER_POSITION,
  RISK_ZONES,
  PLACEMENT_CANDIDATES
} from '../engine/simulationEngine';
import { NodeId, LoRaPacket, WeatherMode, CameraMode } from '../types/simulation';
import { 
  Radio, 
  Flame, 
  Droplets, 
  Camera, 
  Compass, 
  Laptop,
  Layers,
  Zap,
  CloudRain,
  Sun,
  Moon,
  Wind,
  Eye,
  Maximize2,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle2,
  X,
  MapPin,
  Sliders
} from 'lucide-react';

export interface ClickedObjectInfo {
  id: string;
  name: string;
  category: 'NODE' | 'RIVER' | 'VILLAGE' | 'FOREST' | 'HILLSIDE' | 'COMMAND_CENTER' | 'HAZARD';
  status: string;
  details: string;
  position: [number, number, number];
  nodeId?: NodeId;
}

interface ThreeSceneProps {
  onSelectNode: (nodeId: NodeId) => void;
  onSelectPacket: (packet: LoRaPacket) => void;
  selectedNodeId: NodeId | null;
  onInspectNodeModal?: (nodeId: NodeId) => void;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({
  onSelectNode,
  onSelectPacket,
  selectedNodeId,
  onInspectNodeModal
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeCameraView, setActiveCameraView] = useState<CameraMode>('FREE_CAMERA');
  const [showControlsHint, setShowControlsHint] = useState<boolean>(true);
  const [clickedObject, setClickedObject] = useState<ClickedObjectInfo | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // Dynamic meshes & systems
  const waterMeshRef = useRef<THREE.Mesh | null>(null);
  const terrainMeshRef = useRef<THREE.Mesh | null>(null);
  const terrainMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const roadMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const fireParticlesRef = useRef<THREE.Points | null>(null);
  const emberParticlesRef = useRef<THREE.Points | null>(null);
  const smokeParticlesRef = useRef<THREE.Points | null>(null);
  const rainParticlesRef = useRef<THREE.Points | null>(null);
  const industrialSmokeRef = useRef<THREE.Points | null>(null);
  const pollutionSmokeRef = useRef<THREE.Points | null>(null);
  const landslideDebrisRef = useRef<THREE.Group | null>(null);
  const packetMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const nodeMarkersRef = useRef<Map<string, THREE.Group>>(new Map());

  // Risk heatmap and dense grid comparison groups
  const riskHeatmapGroupRef = useRef<THREE.Group | null>(null);
  const denseGridGroupRef = useRef<THREE.Group | null>(null);
  const virtualNodesGroupRef = useRef<THREE.Group | null>(null);
  
  // Lighting references (Daylight / Overcast High Visibility Suite)
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const fireLightRef = useRef<THREE.PointLight | null>(null);
  const lightningLightRef = useRef<THREE.PointLight | null>(null);

  // Camera targets & interpolation
  const targetCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 24, 38));
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.5, 0));
  const keysDownRef = useRef<{ [key: string]: boolean }>({});
  const isCinematicRunningRef = useRef<boolean>(false);
  const cinematicAngleRef = useRef<number>(0);

  // Auto-dismiss keyboard hint after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowControlsHint(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  // Camera Mode Dispatcher
  const switchCameraMode = useCallback((mode: CameraMode) => {
    setActiveCameraView(mode);
    simulationEngine.setCameraMode(mode);
    if (!controlsRef.current) return;

    isCinematicRunningRef.current = (mode === 'CINEMATIC' || mode === 'DISASTER_CINEMATIC');

    switch (mode) {
      case 'COMMAND_CENTER':
        targetCamPosRef.current.set(0, 4.2, 5.8);
        targetLookAtRef.current.set(0, 1.8, 0);
        break;
      case 'FOREST_OVERVIEW':
        targetCamPosRef.current.set(-16, 9, -2);
        targetLookAtRef.current.set(-16, 1.2, -12);
        break;
      case 'FLOOD_OVERVIEW':
        targetCamPosRef.current.set(14, 8, 4);
        targetLookAtRef.current.set(14, 0.6, -6);
        break;
      case 'HILLSIDE_OVERVIEW':
        targetCamPosRef.current.set(-10, 12, 22);
        targetLookAtRef.current.set(-10, 4.2, 14);
        break;
      case 'NODE_INSPECTION':
        if (selectedNodeId === 'NODE-2') {
          targetCamPosRef.current.set(-14.2, 2.4, -10.2);
          targetLookAtRef.current.set(-16, 1.4, -12);
        } else {
          targetCamPosRef.current.set(15.2, 2.2, -4.2);
          targetLookAtRef.current.set(14, 1.0, -6);
        }
        break;
      case 'DEPLOYMENT_AERIAL':
        targetCamPosRef.current.set(0, 56, 0.05);
        targetLookAtRef.current.set(0, 0, 0);
        break;
      case 'DISASTER_CINEMATIC':
      case 'CINEMATIC':
        isCinematicRunningRef.current = true;
        break;
      case 'NETWORK_VIEW':
        targetCamPosRef.current.set(0, 48, 0.01);
        targetLookAtRef.current.set(0, 0, 0);
        break;
      case 'FREE_CAMERA':
      default:
        targetCamPosRef.current.set(0, 24, 38);
        targetLookAtRef.current.set(0, 1.5, 0);
        break;
    }
  }, [selectedNodeId]);

  // Sync external camera/weather requests from SimulationEngine
  useEffect(() => {
    return simulationEngine.subscribe(() => {
      if (simulationEngine.cameraMode && simulationEngine.cameraMode !== activeCameraView) {
        switchCameraMode(simulationEngine.cameraMode);
      }
    });
  }, [switchCameraMode, activeCameraView]);

  // Main Three.js Setup Effect
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. SCENE WITH NATURAL DAYLIGHT ATMOSPHERE (NO DARK THEME!)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa5cbf5); // Clean realistic daylight sky
    scene.fog = new THREE.FogExp2(0xd6e8fa, 0.0075);
    sceneRef.current = scene;

    // 2. CAMERA
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 24, 38);
    cameraRef.current = camera;

    // 3. RENDERER WITH SHADOWS & HDR TONEMAPPING
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. FULL 360-DEGREE ORBIT & GAME CAMERA CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2.05; // Prevent camera dipping below terrain
    controls.minDistance = 2.0;
    controls.maxDistance = 120;
    controls.target.set(0, 1.5, 0);
    controlsRef.current = controls;

    // 5. BRIGHT REALISTIC DAYLIGHT SUITE
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 1.25);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const hemiLight = new THREE.HemisphereLight(0xbfdbfe, 0x334155, 0.85);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const sunLight = new THREE.DirectionalLight(0xfff7ed, 2.3);
    sunLight.position.set(34, 52, 28);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 130;
    sunLight.shadow.camera.left = -38;
    sunLight.shadow.camera.right = 38;
    sunLight.shadow.camera.top = 38;
    sunLight.shadow.camera.bottom = -38;
    sunLight.shadow.bias = -0.0004;
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    // Dynamic fire point light
    const fireLight = new THREE.PointLight(0xff6a00, 0, 35);
    fireLight.position.set(-16, 3, -12);
    scene.add(fireLight);
    fireLightRef.current = fireLight;

    // Lightning flash light
    const lightning = new THREE.PointLight(0xe0f2fe, 0, 90);
    lightning.position.set(5, 36, 5);
    scene.add(lightning);
    lightningLightRef.current = lightning;

    // 6. PROCEDURAL DIGITAL TWIN ENVIRONMENT
    buildRealisticTerrain(scene);
    buildDenseForestZone(scene);
    buildRealisticRiverAndBridge(scene);
    buildDetailedVillage(scene);
    buildIndustrialPollutionZone(scene);
    buildHillsideLandslideZone(scene);
    buildLocalCommandCenterWorkstation(scene);
    buildPrototypeFieldNodes(scene);
    buildLoRaRFConnections(scene);
    buildDisasterParticles(scene);
    buildRiskHeatmapLayers(scene);
    buildTraditionalDenseGridMesh(scene);
    buildVirtualScaleNodesMesh(scene);

    // 7. KEYBOARD WASD & GAME CONTROLS
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      keysDownRef.current[e.code] = true;

      if (e.code === 'KeyR') {
        switchCameraMode('FREE_CAMERA');
      }
      if (e.code === 'Escape') {
        isCinematicRunningRef.current = false;
        setActiveCameraView('FREE_CAMERA');
        setClickedObject(null);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDownRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // 8. RAYCASTER FOR INTERACTIVE CLICKING & DOUBLE-CLICK FOCUS
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      for (const hit of intersects) {
        let cur: THREE.Object3D | null = hit.object;
        while (cur && cur !== scene) {
          if (cur.userData?.nodeId) {
            const nId = cur.userData.nodeId as NodeId;
            onSelectNode(nId);
            const foundNode = simulationEngine.nodes.find(n => n.id === nId);
            setClickedObject({
              id: nId,
              name: nId === 'NODE-1' 
                ? 'AEGIS-X Node 01 — Floodplain Station (Physical Prototype)' 
                : nId === 'NODE-2'
                ? 'AEGIS-X Node 02 — Forest Boundary Station (Physical Prototype)'
                : `${foundNode?.name || nId} (Virtual Scale Node)`,
              category: 'NODE',
              status: foundNode ? foundNode.state : 'ONLINE',
              details: nId === 'NODE-1' 
                ? 'ESP32-S3 + SX1262 LoRa · HC-SR04 Ultrasonic & Optical Rain Transducer' 
                : nId === 'NODE-2'
                ? 'ESP32-S3 + SX1262 LoRa · MQ-2 Smoke, BME688 & IR Flame Sensors'
                : 'Targeted Virtual Candidate Node positioned strictly in high-vulnerability corridor.',
              position: foundNode ? foundNode.position : [0, 0, 0],
              nodeId: nId
            });
            return;
          }
          if (cur.userData?.packet) {
            onSelectPacket(cur.userData.packet as LoRaPacket);
            return;
          }
          if (cur.name === 'riverWater' || cur.name === 'riverBridge') {
            setClickedObject({
              id: 'river-floodplain',
              name: 'River Corridor & Floodplain Basin',
              category: 'RIVER',
              status: simulationEngine.activeHazard?.type === 'FLOOD' ? 'FLOODING' : 'NORMAL LEVEL',
              details: 'Critical bottleneck: Waterway crossing bridge with low-lying residential village. Targeted Node 01 deployed here for maximum flood warning lead time.',
              position: [14, 0.6, -6]
            });
            return;
          }
          if (cur.name === 'forestZone') {
            setClickedObject({
              id: 'forest-sector',
              name: 'Sector Alpha — Forest Reserve Boundary',
              category: 'FOREST',
              status: simulationEngine.activeHazard?.type === 'FOREST_FIRE' ? 'ACTIVE FIRE' : 'CLEAR',
              details: 'Dense pine timberland subject to dry seasonal winds toward village. Targeted Node 02 deployed on perimeter ridge.',
              position: [-16, 1.2, -12]
            });
            return;
          }
          if (cur.name === 'villageZone') {
            setClickedObject({
              id: 'village-sector',
              name: 'Low-Lying Village Settlement',
              category: 'VILLAGE',
              status: simulationEngine.systemState,
              details: 'Downstream residential homes and road junction directly exposed to riverbank overflow during extreme catchment rain.',
              position: [17, 1.0, 14]
            });
            return;
          }
          if (cur.name === 'commandWorkstation') {
            setClickedObject({
              id: 'command-computer',
              name: 'Local Computer & LoRa Transceiver Station',
              category: 'COMMAND_CENTER',
              status: simulationEngine.isInternetOnline ? 'ONLINE' : 'LOCAL MESH ONLY',
              details: 'Rugged emergency operations computer running local SQLite event ledger, Bayesian evidence fusion, and direct SX1262 LoRa transceiver.',
              position: [0, 2.0, 0]
            });
            return;
          }
          cur = cur.parent;
        }
      }
    };

    const handleDoubleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        const point = intersects[0].point;
        targetLookAtRef.current.copy(point);
        const offset = new THREE.Vector3().subVectors(camera.position, controls.target).normalize().multiplyScalar(10);
        targetCamPosRef.current.copy(point).add(offset);
      }
    };

    renderer.domElement.addEventListener('click', handleClick);
    renderer.domElement.addEventListener('dblclick', handleDoubleClick);

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 9. ANIMATION LOOP WITH WASD MOVEMENT & SMOOTH INTERPOLATION
    let lastTime = performance.now();
    let animId: number;

    const animate = (time: number) => {
      animId = requestAnimationFrame(animate);
      const dt = Math.min(0.1, (time - lastTime) / 1000);
      lastTime = time;

      simulationEngine.tick(dt);

      // WASD Flight / Navigation
      const keys = keysDownRef.current;
      const hasWASD = keys['KeyW'] || keys['KeyS'] || keys['KeyA'] || keys['KeyD'] || keys['KeyQ'] || keys['KeyE'];
      if (hasWASD) {
        isCinematicRunningRef.current = false;
        setActiveCameraView('FREE_CAMERA');
        const moveSpeed = (keys['ShiftLeft'] || keys['ShiftRight'] ? 36.0 : 16.0) * dt;

        const forward = new THREE.Vector3().subVectors(controls.target, camera.position).setY(0).normalize();
        const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

        const moveDelta = new THREE.Vector3();
        if (keys['KeyW']) moveDelta.add(forward.clone().multiplyScalar(moveSpeed));
        if (keys['KeyS']) moveDelta.add(forward.clone().multiplyScalar(-moveSpeed));
        if (keys['KeyD']) moveDelta.add(right.clone().multiplyScalar(moveSpeed));
        if (keys['KeyA']) moveDelta.add(right.clone().multiplyScalar(-moveSpeed));
        if (keys['KeyE']) moveDelta.y += moveSpeed;
        if (keys['KeyQ']) moveDelta.y -= moveSpeed;

        camera.position.add(moveDelta);
        controls.target.add(moveDelta);
        targetCamPosRef.current.copy(camera.position);
        targetLookAtRef.current.copy(controls.target);
      } else if (isCinematicRunningRef.current) {
        cinematicAngleRef.current += dt * 0.12;
        const rad = 36.0;
        const cx = Math.sin(cinematicAngleRef.current) * rad;
        const cz = Math.cos(cinematicAngleRef.current) * rad;
        const cy = 18.0 + Math.sin(cinematicAngleRef.current * 0.6) * 6.0;
        targetCamPosRef.current.set(cx, cy, cz);
        targetLookAtRef.current.set(0, 1.8, 0);
      }

      // Smooth camera interpolation
      camera.position.lerp(targetCamPosRef.current, 0.05);
      controls.target.lerp(targetLookAtRef.current, 0.05);
      controls.update();

      // Update dynamic layers (Water, particles, daylight lighting, packets, risk heatmap)
      updateSceneDynamicLayers(scene, time * 0.001);

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      renderer.domElement.removeEventListener('click', handleClick);
      renderer.domElement.removeEventListener('dblclick', handleDoubleClick);
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [onSelectNode, onSelectPacket, switchCameraMode]);

  // ==========================================
  // PROCEDURAL BUILDERS
  // ==========================================

  function buildRealisticTerrain(scene: THREE.Scene) {
    const geo = new THREE.PlaneGeometry(76, 76, 110, 110);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      let y = 0;
      // Hillside escarpment
      if (x < -2 && z > 2) {
        const d = Math.sqrt((x + 18) * (x + 18) + (z - 18) * (z - 18));
        y = Math.max(0, 9.5 - d * 0.52) + Math.sin(x * 0.45) * 0.5;
      }
      // Center vantage for Local Command Center
      const distCenter = Math.sqrt(x * x + z * z);
      if (distCenter < 7) {
        y += Math.max(0, 2.0 - distCenter * 0.28);
      }
      // River basin carved in positive x
      if (x > 7 && x < 19) {
        const riverCenter = 13 + Math.sin(z * 0.12) * 2.2;
        const distToRiver = Math.abs(x - riverCenter);
        if (distToRiver < 5.5) {
          y -= (2.0 - distToRiver * 0.32);
        }
      }
      // Forest undulating knolls
      if (x < 0 && z < 0) {
        y += Math.sin(x * 0.32) * 0.5 + Math.cos(z * 0.32) * 0.5;
      }

      pos.setY(i, y);
    }
    geo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x2d4a22, // Rich realistic daylight grass
      roughness: 0.82,
      metalness: 0.05,
      flatShading: true
    });
    terrainMaterialRef.current = terrainMat;

    const terrain = new THREE.Mesh(geo, terrainMat);
    terrain.receiveShadow = true;
    scene.add(terrain);
    terrainMeshRef.current = terrain;

    // Scattered natural boulders & rocks across terrain
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.88, flatShading: true });
    for (let r = 0; r < 24; r++) {
      const rx = (Math.random() - 0.5) * 60;
      const rz = (Math.random() - 0.5) * 60;
      if (Math.abs(rx - 13) < 4 || Math.abs(rx) < 5) continue;
      const rockGeo = new THREE.DodecahedronGeometry(0.35 + Math.random() * 0.5);
      const rockMesh = new THREE.Mesh(rockGeo, rockMat);
      rockMesh.position.set(rx, 0.4 + Math.random() * 0.4, rz);
      rockMesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      rockMesh.castShadow = true;
      rockMesh.receiveShadow = true;
      scene.add(rockMesh);
    }
  }

  function buildDenseForestZone(scene: THREE.Scene) {
    const forest = new THREE.Group();
    forest.name = 'forestZone';

    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x452b1b, roughness: 0.9 });
    const pineMat1 = new THREE.MeshStandardMaterial({ color: 0x164e28, roughness: 0.82, flatShading: true });
    const pineMat2 = new THREE.MeshStandardMaterial({ color: 0x226738, roughness: 0.78, flatShading: true });
    const birchFoliageMat = new THREE.MeshStandardMaterial({ color: 0x367c4d, roughness: 0.8, flatShading: true });

    for (let i = 0; i < 65; i++) {
      const tx = -28 + Math.random() * 24;
      const tz = -26 + Math.random() * 24;
      if (Math.abs(tx + 16) < 2.8 && Math.abs(tz + 12) < 2.8) continue; // Clear around Node 2

      const tree = new THREE.Group();
      const scale = 0.75 + Math.random() * 0.65;
      const isBirch = (i % 3 === 0);

      if (isBirch) {
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14 * scale, 0.22 * scale, 2.0 * scale, 6), trunkMat);
        trunk.position.y = 1.0 * scale;
        trunk.castShadow = true;
        tree.add(trunk);

        const leafClusterGeo = new THREE.DodecahedronGeometry(1.3 * scale, 1);
        const leaves = new THREE.Mesh(leafClusterGeo, birchFoliageMat);
        leaves.position.y = 2.4 * scale;
        leaves.castShadow = true;
        tree.add(leaves);
      } else {
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * scale, 0.18 * scale, 1.4 * scale, 6), trunkMat);
        trunk.position.y = 0.7 * scale;
        trunk.castShadow = true;
        tree.add(trunk);

        const tier1 = new THREE.Mesh(new THREE.ConeGeometry(1.1 * scale, 2.2 * scale, 6), pineMat1);
        tier1.position.y = 1.9 * scale;
        tier1.castShadow = true;
        tree.add(tier1);

        const tier2 = new THREE.Mesh(new THREE.ConeGeometry(0.85 * scale, 1.8 * scale, 6), pineMat2);
        tier2.position.y = 2.9 * scale;
        tier2.castShadow = true;
        tree.add(tier2);

        const tier3 = new THREE.Mesh(new THREE.ConeGeometry(0.55 * scale, 1.3 * scale, 6), pineMat1);
        tier3.position.y = 3.8 * scale;
        tier3.castShadow = true;
        tree.add(tier3);
      }

      tree.position.set(tx, 0.35, tz);
      forest.add(tree);
    }
    scene.add(forest);
  }

  function buildRealisticRiverAndBridge(scene: THREE.Scene) {
    const waterGeo = new THREE.PlaneGeometry(13, 56, 32, 32);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Vibrant river blue under daylight
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.9
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.set(13, -0.65, -2);
    water.name = 'riverWater';
    scene.add(water);
    waterMeshRef.current = water;

    // Concrete River Bridge
    const bridgeMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.65 });
    const deck = new THREE.Mesh(new THREE.BoxGeometry(12.5, 0.45, 3.8), bridgeMat);
    deck.position.set(13, 1.45, -6);
    deck.name = 'riverBridge';
    deck.castShadow = true;
    deck.receiveShadow = true;
    scene.add(deck);

    // Bridge safety rails
    const railMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.7, roughness: 0.3 });
    const rail1 = new THREE.Mesh(new THREE.BoxGeometry(12.5, 0.5, 0.1), railMat);
    rail1.position.set(13, 1.9, -4.2);
    scene.add(rail1);
    const rail2 = new THREE.Mesh(new THREE.BoxGeometry(12.5, 0.5, 0.1), railMat);
    rail2.position.set(13, 1.9, -7.8);
    scene.add(rail2);

    // Bridge pillars
    [-4.0, 4.0].forEach(offsetX => {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 2.8, 8), bridgeMat);
      pillar.position.set(13 + offsetX, 0.1, -6);
      pillar.castShadow = true;
      scene.add(pillar);
    });
  }

  function buildDetailedVillage(scene: THREE.Scene) {
    const village = new THREE.Group();
    village.name = 'villageZone';

    const wallMat1 = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.6 });
    const wallMat2 = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.65 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.8 }); // Red tile roofs
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85 });
    roadMaterialRef.current = roadMat;

    const road = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 32), roadMat);
    road.rotateX(-Math.PI / 2);
    road.position.set(17, 0.05, 14);
    road.receiveShadow = true;
    village.add(road);

    const houses = [
      { x: 13.5, z: 9, w: 3.2, d: 2.8, h: 2.6, mat: wallMat1 },
      { x: 20.5, z: 8.5, w: 3.6, d: 3.2, h: 3.0, mat: wallMat2 },
      { x: 13.5, z: 15.5, w: 3.4, d: 3.0, h: 2.8, mat: wallMat1 },
      { x: 20.8, z: 15, w: 3.2, d: 3.4, h: 2.8, mat: wallMat2 },
      { x: 14.0, z: 21, w: 3.0, d: 2.8, h: 2.5, mat: wallMat1 }
    ];

    houses.forEach(h => {
      const houseGroup = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(h.w, h.h, h.d), h.mat);
      body.position.y = h.h / 2;
      body.castShadow = true;
      body.receiveShadow = true;
      houseGroup.add(body);

      const roofGeo = new THREE.ConeGeometry(Math.max(h.w, h.d) * 0.75, 1.4, 4);
      roofGeo.rotateY(Math.PI / 4);
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.y = h.h + 0.7;
      roof.castShadow = true;
      houseGroup.add(roof);

      houseGroup.position.set(h.x, 0.05, h.z);
      village.add(houseGroup);
    });

    scene.add(village);
  }

  function buildIndustrialPollutionZone(scene: THREE.Scene) {
    const industrial = new THREE.Group();
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5, metalness: 0.6 });
    const stackMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.4, metalness: 0.8 });

    const warehouse = new THREE.Mesh(new THREE.BoxGeometry(5.0, 3.8, 4.2), steelMat);
    warehouse.position.set(18, 1.9, 24);
    warehouse.castShadow = true;
    industrial.add(warehouse);

    [16.8, 19.2].forEach(sx => {
      const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 6.0, 12), stackMat);
      stack.position.set(sx, 4.0, 24);
      stack.castShadow = true;
      industrial.add(stack);
    });

    scene.add(industrial);
  }

  function buildHillsideLandslideZone(scene: THREE.Scene) {
    const debrisGroup = new THREE.Group();
    debrisGroup.position.set(-10, 4.2, 14);

    const rockMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.9, flatShading: true });
    for (let i = 0; i < 9; i++) {
      const rockGeo = new THREE.DodecahedronGeometry(0.4 + Math.random() * 0.35);
      const rock = new THREE.Mesh(rockGeo, rockMat);
      rock.position.set((Math.random() - 0.5) * 3.5, 0.2 + Math.random() * 0.8, (Math.random() - 0.5) * 3.5);
      rock.castShadow = true;
      debrisGroup.add(rock);
    }

    scene.add(debrisGroup);
    landslideDebrisRef.current = debrisGroup;
  }

  // ==========================================
  // PHYSICAL PROTOTYPE: LOCAL COMMAND WORKSTATION + LORA TRANSCEIVER
  // ==========================================
  function buildLocalCommandCenterWorkstation(scene: THREE.Scene) {
    const station = new THREE.Group();
    station.name = 'commandWorkstation';
    station.position.set(LOCAL_COMPUTER_POSITION[0], LOCAL_COMPUTER_POSITION[1], LOCAL_COMPUTER_POSITION[2]);

    const tableMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
    const table = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.8, 1.6), tableMat);
    table.position.y = 0.4;
    table.castShadow = true;
    station.add(table);

    const pcMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.85 });
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.08, 0.8), pcMat);
    base.position.set(0, 0.84, 0.1);
    station.add(base);

    const screenFrame = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.7, 0.06), pcMat);
    screenFrame.position.set(0, 1.22, -0.28);
    screenFrame.rotation.x = -Math.PI / 16;
    station.add(screenFrame);

    const screenGlowMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
    const screenGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.96, 0.62), screenGlowMat);
    screenGlow.position.set(0, 1.22, -0.24);
    screenGlow.rotation.x = -Math.PI / 16;
    station.add(screenGlow);

    // Integrated USB LoRa Transceiver Dongle
    const dongleMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.9 });
    const dongle = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.28), dongleMat);
    dongle.position.set(0.68, 0.85, 0.1);
    station.add(dongle);

    const antMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 });
    const loraAnt = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.55, 6), antMat);
    loraAnt.position.set(0.68, 1.15, 0.1);
    station.add(loraAnt);

    const poleMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
    const towerPole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 4.2, 8), poleMat);
    towerPole.position.set(0.9, 2.1, 0.1);
    station.add(towerPole);

    const rfLed = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    rfLed.position.set(0.9, 4.1, 0.1);
    station.add(rfLed);

    scene.add(station);
  }

  // ==========================================
  // PHYSICAL PROTOTYPE NODES (ESP32-S3 + SX1262 LoRa)
  // Matching Reference Image 2: Rugged enclosure, pole mount, whip antenna, solar canopy
  // ==========================================
  function buildPrototypeFieldNodes(scene: THREE.Scene) {
    simulationEngine.prototypeNodes.forEach(node => {
      const nodeGroup = new THREE.Group();
      nodeGroup.position.set(node.position[0], node.position[1], node.position[2]);
      nodeGroup.userData = { nodeId: node.id };

      const mastMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.7, roughness: 0.3 });
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 2.2, 8), mastMat);
      mast.position.y = 1.1;
      mast.castShadow = true;
      nodeGroup.add(mast);

      // Rugged Weatherproof IP67 Field Enclosure
      const boxMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.35 });
      const enclosure = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.68, 0.36), boxMat);
      enclosure.position.set(0, 1.48, 0);
      enclosure.castShadow = true;
      nodeGroup.add(enclosure);

      // SX1262 LoRa Whip Antenna
      const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.75, 6), mastMat);
      ant.position.set(0.2, 2.15, -0.1);
      nodeGroup.add(ant);

      // Top Angled Solar Panel Canopy (Field Deployment Concept)
      const solarMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.15, metalness: 0.85 });
      const solar = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.03, 0.48), solarMat);
      solar.position.set(0, 1.9, 0.15);
      solar.rotation.x = Math.PI / 7;
      nodeGroup.add(solar);

      // Sensor-specific attachments
      if (node.id === 'NODE-1') {
        const sensorHorn = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.04, 0.25, 8), mastMat);
        sensorHorn.position.set(0, 0.9, 0.25);
        nodeGroup.add(sensorHorn);
      } else {
        const smokeSnorkel = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.3, 8), mastMat);
        smokeSnorkel.position.set(0, 1.8, -0.2);
        smokeSnorkel.name = 'smokeSnorkel';
        nodeGroup.add(smokeSnorkel);

        const intakeAuraGeo = new THREE.RingGeometry(0.12, 0.35, 16);
        intakeAuraGeo.rotateX(-Math.PI / 2);
        const intakeAuraMat = new THREE.MeshBasicMaterial({
          color: 0xf59e0b,
          transparent: true,
          opacity: 0,
          side: THREE.DoubleSide
        });
        const intakeAura = new THREE.Mesh(intakeAuraGeo, intakeAuraMat);
        intakeAura.position.set(0, 1.95, -0.2);
        intakeAura.name = 'intakeAura';
        nodeGroup.add(intakeAura);
      }

      // LED Beacon
      const ledMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
      const led = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 8), ledMat);
      led.position.set(0, 1.55, 0.20);
      led.name = 'statusLed';
      nodeGroup.add(led);

      // Selection Halo
      const haloGeo = new THREE.RingGeometry(0.85, 1.15, 24);
      haloGeo.rotateX(-Math.PI / 2);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0x0284c7,
        transparent: true,
        opacity: 0.75,
        side: THREE.DoubleSide
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.y = 0.05;
      halo.name = 'selectionHalo';
      halo.visible = false;
      nodeGroup.add(halo);

      scene.add(nodeGroup);
      nodeMarkersRef.current.set(node.id, nodeGroup);
    });
  }

  // ==========================================
  // RISK-ADAPTIVE DEPLOYMENT LAYERS
  // ==========================================
  function buildRiskHeatmapLayers(scene: THREE.Scene) {
    const group = new THREE.Group();
    group.name = 'riskHeatmapLayers';
    group.visible = false;

    RISK_ZONES.forEach(z => {
      const zoneGroup = new THREE.Group();
      zoneGroup.position.set(z.center[0], 0.12, z.center[2]);

      // Glowing outer hazard perimeter ring
      const ringGeo = new THREE.RingGeometry(z.radius - 0.4, z.radius, 48);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(z.colorHex),
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      zoneGroup.add(ring);

      // Translucent inner danger zone surface
      const discGeo = new THREE.CircleGeometry(z.radius - 0.4, 48);
      discGeo.rotateX(-Math.PI / 2);
      const discMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(z.colorHex),
        transparent: true,
        opacity: 0.18,
        side: THREE.DoubleSide
      });
      const disc = new THREE.Mesh(discGeo, discMat);
      disc.position.y = -0.02;
      zoneGroup.add(disc);

      group.add(zoneGroup);
    });

    scene.add(group);
    riskHeatmapGroupRef.current = group;
  }

  // Visual Comparison: Traditional Uniform Dense Grid (64 dots everywhere)
  function buildTraditionalDenseGridMesh(scene: THREE.Scene) {
    const group = new THREE.Group();
    group.name = 'traditionalDenseGrid';
    group.visible = false;

    const dotGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.8, 6);
    const dotMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.8,
      metalness: 0.3
    });

    // 8 x 8 dense grid
    for (let gx = -28; gx <= 28; gx += 8) {
      for (let gz = -28; gz <= 28; gz += 8) {
        const pole = new THREE.Mesh(dotGeo, dotMat);
        pole.position.set(gx, 0.4, gz);
        group.add(pole);

        // Wasteful grid footprint ring
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(0.6, 0.75, 12).rotateX(-Math.PI / 2),
          new THREE.MeshBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.35, side: THREE.DoubleSide })
        );
        ring.position.set(gx, 0.06, gz);
        group.add(ring);
      }
    }

    scene.add(group);
    denseGridGroupRef.current = group;
  }

  // Virtual Scale Nodes Mesh (Rendered when Virtual Scale > 2)
  function buildVirtualScaleNodesMesh(scene: THREE.Scene) {
    const group = new THREE.Group();
    group.name = 'virtualScaleNodes';
    group.visible = false;

    const vBoxMat = new THREE.MeshStandardMaterial({ color: 0xc084fc, roughness: 0.4 });
    const vPoleMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 });

    PLACEMENT_CANDIDATES.filter(c => !c.isPhysicalPrototype).forEach((c, idx) => {
      const vNodeGroup = new THREE.Group();
      vNodeGroup.position.set(c.position[0], c.position[1], c.position[2]);
      vNodeGroup.name = `vNode_${idx}`;
      vNodeGroup.userData = { nodeId: `V-NODE-${(idx + 3).toString().padStart(2, '0')}` };

      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.8, 6), vPoleMat);
      pole.position.y = 0.9;
      vNodeGroup.add(pole);

      const box = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.52, 0.28), vBoxMat);
      box.position.y = 1.35;
      vNodeGroup.add(box);

      const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.6, 6), vPoleMat);
      ant.position.set(0.15, 1.85, -0.05);
      vNodeGroup.add(ant);

      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.8, 1.05, 16).rotateX(-Math.PI / 2),
        new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.65, side: THREE.DoubleSide })
      );
      ring.position.y = 0.06;
      vNodeGroup.add(ring);

      group.add(vNodeGroup);
    });

    scene.add(group);
    virtualNodesGroupRef.current = group;
  }

  // Draw LoRa links: Peer-to-peer and direct uplinks
  function buildLoRaRFConnections(scene: THREE.Scene) {
    const linksGroup = new THREE.Group();
    linksGroup.name = 'loraLinks';

    const pcPos = new THREE.Vector3(LOCAL_COMPUTER_POSITION[0], LOCAL_COMPUTER_POSITION[1], LOCAL_COMPUTER_POSITION[2]).add(new THREE.Vector3(0.9, 4.0, 0.1));
    const n1Pos = new THREE.Vector3(14, 2.1, -6);
    const n2Pos = new THREE.Vector3(-16, 2.3, -12);

    const uplinkMat = new THREE.LineDashedMaterial({
      color: 0x0284c7,
      dashSize: 0.8,
      gapSize: 0.5,
      transparent: true,
      opacity: 0.4
    });

    const peerMat = new THREE.LineDashedMaterial({
      color: 0x9333ea,
      dashSize: 0.7,
      gapSize: 0.4,
      transparent: true,
      opacity: 0.5
    });

    const g1 = new THREE.BufferGeometry().setFromPoints([n1Pos, pcPos]);
    const l1 = new THREE.Line(g1, uplinkMat);
    l1.computeLineDistances();
    linksGroup.add(l1);

    const g2 = new THREE.BufferGeometry().setFromPoints([n2Pos, pcPos]);
    const l2 = new THREE.Line(g2, uplinkMat);
    l2.computeLineDistances();
    linksGroup.add(l2);

    const g3 = new THREE.BufferGeometry().setFromPoints([n1Pos, n2Pos]);
    const l3 = new THREE.Line(g3, peerMat);
    l3.computeLineDistances();
    linksGroup.add(l3);

    scene.add(linksGroup);
  }

  function buildDisasterParticles(scene: THREE.Scene) {
    // 1. Fire Particle System
    const fireCount = 450;
    const fireGeo = new THREE.BufferGeometry();
    const firePos = new Float32Array(fireCount * 3);
    for (let i = 0; i < fireCount * 3; i += 3) {
      firePos[i] = -16 + (Math.random() - 0.5) * 4.5;
      firePos[i + 1] = 0.5 + Math.random() * 3.5;
      firePos[i + 2] = -12 + (Math.random() - 0.5) * 4.5;
    }
    fireGeo.setAttribute('position', new THREE.BufferAttribute(firePos, 3));
    const fireMat = new THREE.PointsMaterial({
      color: 0xff4500,
      size: 0.6,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const firePoints = new THREE.Points(fireGeo, fireMat);
    scene.add(firePoints);
    fireParticlesRef.current = firePoints;

    // 2. Embers System
    const emberCount = 200;
    const emberGeo = new THREE.BufferGeometry();
    const emberPos = new Float32Array(emberCount * 3);
    for (let i = 0; i < emberCount * 3; i += 3) {
      emberPos[i] = -16 + (Math.random() - 0.5) * 6;
      emberPos[i + 1] = 2.0 + Math.random() * 8.0;
      emberPos[i + 2] = -12 + (Math.random() - 0.5) * 6;
    }
    emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPos, 3));
    const emberMat = new THREE.PointsMaterial({
      color: 0xfbbf24,
      size: 0.25,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const emberPoints = new THREE.Points(emberGeo, emberMat);
    scene.add(emberPoints);
    emberParticlesRef.current = emberPoints;

    // 3. Smoke Plumes
    const smokeCount = 350;
    const smokeGeo = new THREE.BufferGeometry();
    const smokePos = new Float32Array(smokeCount * 3);
    for (let i = 0; i < smokeCount * 3; i += 3) {
      smokePos[i] = -16 + (Math.random() - 0.5) * 7.5;
      smokePos[i + 1] = 1.8 + Math.random() * 11;
      smokePos[i + 2] = -12 + (Math.random() - 0.5) * 7.5;
    }
    smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePos, 3));
    const smokeMat = new THREE.PointsMaterial({
      color: 0x475569,
      size: 1.6,
      transparent: true,
      opacity: 0,
      depthWrite: false
    });
    const smokePoints = new THREE.Points(smokeGeo, smokeMat);
    scene.add(smokePoints);
    smokeParticlesRef.current = smokePoints;

    // 4. Rain Particles
    const rainCount = 1800;
    const rainGeo = new THREE.BufferGeometry();
    const rainPos = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount * 3; i += 3) {
      rainPos[i] = (Math.random() - 0.5) * 74;
      rainPos[i + 1] = Math.random() * 32;
      rainPos[i + 2] = (Math.random() - 0.5) * 74;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.18,
      transparent: true,
      opacity: 0
    });
    const rainPoints = new THREE.Points(rainGeo, rainMat);
    scene.add(rainPoints);
    rainParticlesRef.current = rainPoints;

    // 5. Industrial Stack Emissions
    const indCount = 160;
    const indGeo = new THREE.BufferGeometry();
    const indPos = new Float32Array(indCount * 3);
    for (let i = 0; i < indCount * 3; i += 3) {
      indPos[i] = 18 + (Math.random() - 0.5) * 2;
      indPos[i + 1] = 7.0 + Math.random() * 6.5;
      indPos[i + 2] = 24 + (Math.random() - 0.5) * 2;
    }
    indGeo.setAttribute('position', new THREE.BufferAttribute(indPos, 3));
    const indMat = new THREE.PointsMaterial({
      color: 0x78716c,
      size: 1.1,
      transparent: true,
      opacity: 0.35,
      depthWrite: false
    });
    const indPoints = new THREE.Points(indGeo, indMat);
    scene.add(indPoints);
    industrialSmokeRef.current = indPoints;

    // 6. Air Pollution & Toxic Smoke Plume System (drifting directly into Node 2 sensor station)
    const pollutionCount = 650;
    const pollutionGeo = new THREE.BufferGeometry();
    const pollutionPos = new Float32Array(pollutionCount * 3);
    for (let i = 0; i < pollutionCount * 3; i += 3) {
      pollutionPos[i] = -16 + (Math.random() - 0.5) * 8.5;
      pollutionPos[i + 1] = 0.8 + Math.random() * 6.0;
      pollutionPos[i + 2] = -12 + (Math.random() - 0.5) * 8.5;
    }
    pollutionGeo.setAttribute('position', new THREE.BufferAttribute(pollutionPos, 3));
    const pollutionMat = new THREE.PointsMaterial({
      color: 0x5a534a,
      size: 2.2,
      transparent: true,
      opacity: 0,
      depthWrite: false
    });
    const pollutionPoints = new THREE.Points(pollutionGeo, pollutionMat);
    scene.add(pollutionPoints);
    pollutionSmokeRef.current = pollutionPoints;
  }

  // ==========================================
  // DYNAMIC RUNTIME UPDATES (Daylight Preservation)
  // ==========================================
  function updateSceneDynamicLayers(scene: THREE.Scene, time: number) {
    const hazard = simulationEngine.activeHazard;
    const weather = simulationEngine.weatherMode;

    // 1. DYNAMIC DAYLIGHT / OVERCAST LIGHTING SUITE (NO DARK MODE / NO BLACK SCENE!)
    if (sunLightRef.current && ambientLightRef.current && sceneRef.current) {
      let targetSunIntensity = 2.3;
      let targetAmbientIntensity = 1.25;
      let targetFogDensity = 0.0075;
      let targetSkyColor = 0xa5cbf5; // Crisp daylight blue
      let targetFogColor = 0xd6e8fa;
      let isWet = false;

      if (weather === 'RAIN') {
        targetSunIntensity = 1.6;
        targetAmbientIntensity = 1.25;
        targetFogDensity = 0.012;
        targetSkyColor = 0x94a3b8; // Slate-400 clean daylight overcast grey/white!
        targetFogColor = 0xcbd5e1; // Bright light mist
        isWet = true;
      } else if (weather === 'HEAVY_RAIN' || weather === 'STORM') {
        targetSunIntensity = 1.35; // Diffused daylight, never black!
        targetAmbientIntensity = 1.15;
        targetFogDensity = 0.016;
        targetSkyColor = 0x8293a7; // Overcast daylight, high clarity
        targetFogColor = 0xb4c2d2;
        isWet = true;

        if (lightningLightRef.current) {
          if (Math.random() < 0.008) {
            lightningLightRef.current.intensity = 85;
          } else {
            lightningLightRef.current.intensity *= 0.85;
          }
        }
      } else if (hazard?.type === 'FOREST_FIRE') {
        targetSunIntensity = 1.9;
        targetAmbientIntensity = 1.2;
        targetFogDensity = 0.010;
        targetSkyColor = 0xbab0a4; // Warm sunlit amber smoke haze
        targetFogColor = 0xcdc5bb;
      } else if (hazard?.type === 'AIR_QUALITY_EVENT') {
        targetSunIntensity = 1.7;
        targetAmbientIntensity = 1.25;
        targetFogDensity = 0.015;
        targetSkyColor = 0xbab2a3; // Heavy particulate air pollution smog sky
        targetFogColor = 0xc9c2b5; // Brownish-grey smoke haze
      }

      sunLightRef.current.intensity = THREE.MathUtils.lerp(sunLightRef.current.intensity, targetSunIntensity, 0.05);
      ambientLightRef.current.intensity = THREE.MathUtils.lerp(ambientLightRef.current.intensity, targetAmbientIntensity, 0.05);
      
      const fog = sceneRef.current.fog as THREE.FogExp2;
      if (fog) {
        fog.density = THREE.MathUtils.lerp(fog.density, targetFogDensity, 0.05);
        fog.color.lerp(new THREE.Color(targetFogColor), 0.05);
      }
      (sceneRef.current.background as THREE.Color).lerp(new THREE.Color(targetSkyColor), 0.05);

      // Dynamic terrain wetness & reflections
      if (terrainMaterialRef.current) {
        terrainMaterialRef.current.roughness = THREE.MathUtils.lerp(
          terrainMaterialRef.current.roughness,
          isWet ? 0.25 : 0.82,
          0.05
        );
        terrainMaterialRef.current.metalness = THREE.MathUtils.lerp(
          terrainMaterialRef.current.metalness,
          isWet ? 0.35 : 0.05,
          0.05
        );
      }
      if (roadMaterialRef.current) {
        roadMaterialRef.current.roughness = THREE.MathUtils.lerp(
          roadMaterialRef.current.roughness,
          isWet ? 0.16 : 0.85,
          0.05
        );
      }
    }

    // 2. DYNAMIC WATER ELEVATION (FLOOD PROGRESSION)
    if (waterMeshRef.current) {
      let targetWaterY = -0.65; // Normal river level
      if (hazard?.type === 'FLOOD' || weather === 'STORM' || weather === 'HEAVY_RAIN') {
        const conf = simulationEngine.aggregatedHazardConfidence;
        targetWaterY = -0.65 + conf * 1.55; // Rises into low-lying village floodplain!
      }
      waterMeshRef.current.position.y = THREE.MathUtils.lerp(waterMeshRef.current.position.y, targetWaterY, 0.04);
      waterMeshRef.current.position.x = 13 + Math.sin(time * 1.8) * 0.08;
    }

    // 3. FOREST FIRE & EMBER INTENSITY
    const isFire = hazard?.type === 'FOREST_FIRE';
    if (fireParticlesRef.current && smokeParticlesRef.current && fireLightRef.current && emberParticlesRef.current) {
      const fireMat = fireParticlesRef.current.material as THREE.PointsMaterial;
      const emberMat = emberParticlesRef.current.material as THREE.PointsMaterial;
      const smokeMat = smokeParticlesRef.current.material as THREE.PointsMaterial;

      let targetFireOpacity = isFire ? 0.92 : 0;
      let targetSmokeOpacity = isFire ? 0.75 : 0;
      let targetEmberOpacity = isFire ? 0.85 : 0;

      fireMat.opacity = THREE.MathUtils.lerp(fireMat.opacity, targetFireOpacity, 0.06);
      emberMat.opacity = THREE.MathUtils.lerp(emberMat.opacity, targetEmberOpacity, 0.06);
      smokeMat.opacity = THREE.MathUtils.lerp(smokeMat.opacity, targetSmokeOpacity, 0.06);

      if (isFire) {
        fireLightRef.current.intensity = 18 + Math.sin(time * 15) * 8 + Math.sin(time * 23) * 6;
        
        const pos = fireParticlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
        for (let i = 1; i < pos.count * 3; i += 3) {
          pos.array[i] += 0.05;
          if (pos.array[i] > 4.5) pos.array[i] = 0.5 + Math.random() * 0.4;
        }
        pos.needsUpdate = true;

        const ePos = emberParticlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
        for (let i = 1; i < ePos.count * 3; i += 3) {
          ePos.array[i] += 0.08;
          ePos.array[i - 1] += Math.sin(time + i) * 0.02;
          if (ePos.array[i] > 10.0) ePos.array[i] = 2.0;
        }
        ePos.needsUpdate = true;

        const sPos = smokeParticlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
        for (let i = 1; i < sPos.count * 3; i += 3) {
          sPos.array[i] += 0.04;
          sPos.array[i - 1] += 0.015;
          if (sPos.array[i] > 12.0) sPos.array[i] = 1.8;
        }
        sPos.needsUpdate = true;
      } else {
        fireLightRef.current.intensity = THREE.MathUtils.lerp(fireLightRef.current.intensity, 0, 0.08);
      }
    }

    // 4. RAIN PARTICLES
    if (rainParticlesRef.current) {
      const rainMat = rainParticlesRef.current.material as THREE.PointsMaterial;
      const isRaining = weather === 'RAIN' || weather === 'HEAVY_RAIN' || weather === 'STORM';
      const targetRainOpacity = isRaining ? 0.75 : 0;
      rainMat.opacity = THREE.MathUtils.lerp(rainMat.opacity, targetRainOpacity, 0.08);

      if (isRaining) {
        const rPos = rainParticlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
        const fallSpeed = weather === 'STORM' ? 1.4 : 0.85;
        for (let i = 1; i < rPos.count * 3; i += 3) {
          rPos.array[i] -= fallSpeed;
          rPos.array[i - 1] -= 0.12;
          if (rPos.array[i] < 0) rPos.array[i] = 32;
        }
        rPos.needsUpdate = true;
      }
    }

    // 4b. AIR POLLUTION & DENSE SMOKE PLUME DYNAMICS (Detected by Node 2)
    const isAirPollution = hazard?.type === 'AIR_QUALITY_EVENT';
    if (pollutionSmokeRef.current) {
      const pMat = pollutionSmokeRef.current.material as THREE.PointsMaterial;
      const targetPollutionOpacity = isAirPollution ? 0.85 : 0;
      pMat.opacity = THREE.MathUtils.lerp(pMat.opacity, targetPollutionOpacity, 0.06);

      if (isAirPollution) {
        const pPos = pollutionSmokeRef.current.geometry.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < pPos.count * 3; i += 3) {
          // Billow upward and drift horizontally across Node-2's intake snorkel
          pPos.array[i + 1] += 0.038; // rise Y
          pPos.array[i] += Math.sin(time * 2.5 + i) * 0.02 + 0.012; // drift X
          pPos.array[i + 2] += Math.cos(time * 2.0 + i) * 0.02 - 0.015; // drift Z

          // Reset when reached upper boundary
          if (pPos.array[i + 1] > 8.0) {
            pPos.array[i + 1] = 0.6 + Math.random() * 0.6;
            pPos.array[i] = -16 + (Math.random() - 0.5) * 8.0;
            pPos.array[i + 2] = -12 + (Math.random() - 0.5) * 8.0;
          }
        }
        pPos.needsUpdate = true;
      }
    }

    // 5. UPDATE NODE PHYSICAL LEDS & HALOS
    simulationEngine.prototypeNodes.forEach(node => {
      const marker = nodeMarkersRef.current.get(node.id);
      if (!marker) return;

      const halo = marker.getObjectByName('selectionHalo') as THREE.Mesh;
      if (halo) {
        halo.visible = (selectedNodeId === node.id);
        if (halo.visible) halo.rotation.z = time * 2;
      }

      const led = marker.getObjectByName('statusLed') as THREE.Mesh;
      if (led) {
        const mat = led.material as THREE.MeshBasicMaterial;
        if (node.loraStatus === 'DISCONNECTED') {
          mat.color.setHex(0xef4444);
        } else if (node.isReSensing || node.state === 'WATCH') {
          mat.color.setHex(0xf59e0b);
        } else if (node.state === 'WARNING' || node.state === 'CRITICAL') {
          mat.color.setHex(0xef4444);
        } else {
          mat.color.setHex(0x10b981);
        }
      }

      // Animate intake snorkel aura on Node-2 when detecting smoke
      const intakeAura = marker.getObjectByName('intakeAura') as THREE.Mesh;
      if (intakeAura) {
        const auraMat = intakeAura.material as THREE.MeshBasicMaterial;
        if (isAirPollution && node.id === 'NODE-2') {
          auraMat.opacity = 0.55 + Math.sin(time * 7) * 0.35;
          const s = 1.0 + Math.sin(time * 5) * 0.3;
          intakeAura.scale.set(s, s, s);
          auraMat.color.setHex(Math.sin(time * 6) > 0 ? 0xf59e0b : 0xef4444);
        } else {
          auraMat.opacity = 0;
        }
      }
    });

    // 6. UPDATE RISK HEATMAP & DENSE GRID VISIBILITY
    if (riskHeatmapGroupRef.current) {
      riskHeatmapGroupRef.current.visible = simulationEngine.isRiskHeatmapActive;
    }
    if (denseGridGroupRef.current) {
      denseGridGroupRef.current.visible = simulationEngine.isDenseGridComparisonActive;
    }
    if (virtualNodesGroupRef.current) {
      virtualNodesGroupRef.current.visible = (simulationEngine.virtualScaleCount > 2);
      // Toggle individual virtual nodes according to scale count
      const activeVirtualCount = simulationEngine.virtualScaleCount - 2;
      virtualNodesGroupRef.current.children.forEach((child, idx) => {
        child.visible = (idx < activeVirtualCount);
      });
    }

    // 7. ANIMATE IN-FLIGHT LORA PACKETS
    const activePackets: LoRaPacket[] = simulationEngine.activePackets;
    const currentPktIds = new Set(activePackets.map((p: LoRaPacket) => p.id));

    packetMeshesRef.current.forEach((mesh, id) => {
      if (!currentPktIds.has(id)) {
        scene.remove(mesh);
        packetMeshesRef.current.delete(id);
      }
    });

    activePackets.forEach((p: LoRaPacket) => {
      let pGroup = packetMeshesRef.current.get(p.id);
      if (!pGroup) {
        pGroup = new THREE.Group();
        pGroup.userData = { packet: p };

        const sphereMat = new THREE.MeshBasicMaterial({
          color: p.messageType === 'VERIFY_REQUEST' ? 0xa855f7 : p.messageType === 'VERIFY_RESPONSE' ? 0x10b981 : 0x0284c7
        });
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), sphereMat);
        pGroup.add(sphere);

        const waveGeo = new THREE.RingGeometry(0.38, 0.58, 16);
        const waveMat = new THREE.MeshBasicMaterial({
          color: sphereMat.color,
          transparent: true,
          opacity: 0.75,
          side: THREE.DoubleSide
        });
        const wave = new THREE.Mesh(waveGeo, waveMat);
        pGroup.add(wave);

        scene.add(pGroup);
        packetMeshesRef.current.set(p.id, pGroup);
      }

      const start = p.startPos ? new THREE.Vector3(p.startPos[0], p.startPos[1], p.startPos[2]) : new THREE.Vector3(0, 0, 0);
      const end = p.endPos ? new THREE.Vector3(p.endPos[0], p.endPos[1], p.endPos[2]) : new THREE.Vector3(LOCAL_COMPUTER_POSITION[0], LOCAL_COMPUTER_POSITION[1], LOCAL_COMPUTER_POSITION[2]).add(new THREE.Vector3(0.9, 4.0, 0.1));
      const t = Math.min(1.0, Math.max(0.0, p.progress || 0));

      const x = THREE.MathUtils.lerp(start.x, end.x, t);
      const z = THREE.MathUtils.lerp(start.z, end.z, t);
      const y = Math.sin(t * Math.PI) * 4.6 + THREE.MathUtils.lerp(start.y + 1.8, end.y + 2.0, t);

      pGroup.position.set(x, y, z);
      pGroup.rotation.y = time * 4;
      pGroup.rotation.x = time * 2;
    });
  }

  const focusOnPosition = (pos: [number, number, number]) => {
    targetLookAtRef.current.set(pos[0], pos[1] + 1.0, pos[2]);
    targetCamPosRef.current.set(pos[0] + 8, pos[1] + 6, pos[2] + 10);
    setActiveCameraView('FREE_CAMERA');
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden font-mono">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Minimal Camera Toolbar */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg p-1 text-[11px] shadow-lg">
        <div className="px-2 py-1 text-slate-400 font-semibold flex items-center gap-1 border-r border-slate-800">
          <Camera className="w-3.5 h-3.5 text-sky-400" />
          <span>VIEW</span>
        </div>
        <button
          onClick={() => switchCameraMode('FREE_CAMERA')}
          className={`px-2.5 py-1 rounded transition-colors ${
            activeCameraView === 'FREE_CAMERA' && !isCinematicRunningRef.current
              ? 'bg-sky-600 text-white font-bold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="Full 360° Free Camera (WASD keys + Mouse drag)"
        >
          Free Explore
        </button>
        <button
          onClick={() => switchCameraMode('CINEMATIC')}
          className={`px-2.5 py-1 rounded transition-colors ${
            activeCameraView === 'CINEMATIC' || isCinematicRunningRef.current
              ? 'bg-amber-600 text-white font-bold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="Smooth automatic aerial orbit"
        >
          Cinematic
        </button>
        <button
          onClick={() => switchCameraMode('NODE_INSPECTION')}
          className={`px-2.5 py-1 rounded transition-colors ${
            activeCameraView === 'NODE_INSPECTION'
              ? 'bg-emerald-600 text-white font-bold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="Focus camera closely onto AEGIS-X physical node"
        >
          Node Focus
        </button>
        <button
          onClick={() => switchCameraMode('DEPLOYMENT_AERIAL')}
          className={`px-2.5 py-1 rounded transition-colors ${
            activeCameraView === 'DEPLOYMENT_AERIAL'
              ? 'bg-purple-600 text-white font-bold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="High-altitude aerial view of targeted deployment zones"
        >
          Aerial Grid
        </button>
        <button
          onClick={() => {
            if (simulationEngine.activeHazard?.type === 'FOREST_FIRE') {
              switchCameraMode('FOREST_OVERVIEW');
            } else if (simulationEngine.activeHazard?.type === 'AIR_QUALITY_EVENT') {
              onSelectNode('NODE-2');
              switchCameraMode('NODE_INSPECTION');
            } else {
              switchCameraMode('FLOOD_OVERVIEW');
            }
          }}
          className="px-2.5 py-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Focus camera on active disaster zone"
        >
          Disaster Focus
        </button>
      </div>

      {/* Air Pollution Smoke Detection Live HUD */}
      {simulationEngine.activeHazard?.type === 'AIR_QUALITY_EVENT' && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-slate-950/95 backdrop-blur-md border border-amber-500/70 px-4 py-2 rounded-xl shadow-[0_0_30px_rgba(245,158,11,0.25)] flex items-center gap-3 font-mono text-xs text-amber-200">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span className="font-bold text-amber-300">
              AIR POLLUTION DETECTED · SENSOR SAMPLING SMOKE
            </span>
            <span className="text-slate-400 text-[11px]">
              Node-2 MQ-2: <strong className="text-amber-300">245 ppm</strong> · MQ-135: <strong className="text-amber-300">275 AQI</strong> (5 Hz Burst)
            </span>
          </div>
          <button
            onClick={() => {
              onSelectNode('NODE-2');
              switchCameraMode('NODE_INSPECTION');
            }}
            className="ml-2 px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] transition-colors shrink-0 shadow-sm"
          >
            Focus Sensor
          </button>
        </div>
      )}

      {/* Floating Controls Hint Tooltip */}
      {showControlsHint && (
        <div className="absolute top-14 left-4 z-20 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-lg p-2.5 text-[10px] text-slate-300 max-w-xs shadow-xl animate-fade-in flex flex-col gap-1.5">
          <div className="flex items-center justify-between font-bold text-sky-400">
            <span className="flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" /> 360° Game Controls
            </span>
            <button 
              onClick={() => setShowControlsHint(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-slate-300">
            <div><span className="text-amber-400 font-bold">Left Drag:</span> Orbit/Look</div>
            <div><span className="text-amber-400 font-bold">Right Drag:</span> Pan</div>
            <div><span className="text-amber-400 font-bold">Wheel:</span> Zoom</div>
            <div><span className="text-amber-400 font-bold">WASD:</span> Move</div>
            <div><span className="text-amber-400 font-bold">Q / E:</span> Down / Up</div>
            <div><span className="text-amber-400 font-bold">Shift:</span> Boost</div>
            <div><span className="text-amber-400 font-bold">Double Click:</span> Focus</div>
            <div><span className="text-amber-400 font-bold">R Key:</span> Reset</div>
          </div>
        </div>
      )}

      {/* Contextual Object Inspection Mini-Card */}
      {clickedObject && (
        <div className="absolute bottom-12 left-4 z-30 max-w-sm w-88 bg-slate-900/95 backdrop-blur-md border border-sky-500/40 rounded-xl p-3.5 text-xs text-slate-200 shadow-2xl animate-fade-in">
          <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-slate-800">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                {clickedObject.category}
              </div>
              <h4 className="font-display font-bold text-slate-100 text-sm">
                {clickedObject.name}
              </h4>
            </div>
            <button
              onClick={() => setClickedObject(null)}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-[11px] text-slate-300 mb-3 leading-relaxed">
            {clickedObject.details}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => focusOnPosition(clickedObject.position)}
              className="flex-1 py-1.5 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-sky-400" />
              <span>Focus Camera</span>
            </button>

            {clickedObject.nodeId && onInspectNodeModal && (
              <button
                onClick={() => {
                  onInspectNodeModal(clickedObject.nodeId!);
                }}
                className="flex-1 py-1.5 px-2 rounded bg-sky-600 hover:bg-sky-500 text-white font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors shadow-sm"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Inspect Node</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Small Unobtrusive Digital Twin Watermark */}
      <div className="absolute top-4 right-4 z-10 pointer-events-none text-[10px] font-mono text-slate-600 bg-white/70 backdrop-blur-sm px-2.5 py-1 rounded border border-slate-300 shadow-sm">
        SIMULATED DIGITAL TWIN — NOT TO SCALE
      </div>
    </div>
  );
};
