import React, { useRef, useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import { GALLERY_DATA } from './galleryData';

// ─── Ambient Floating Dust / Light Sparks ──────────────────────────────────
export function DustParticles({ count = 120, spread = 16, height = 7 }: { count?: number; spread?: number; height?: number }) {
  const mesh = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * spread;
      pos[i * 3 + 1] = Math.random() * height - 1;
      pos[i * 3 + 2] = (Math.random() - 0.5) * spread;
    }
    return pos;
  }, [count, spread, height]);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const t = clock.getElapsedTime();
    mesh.current.rotation.y = t * 0.012;
    const pos = mesh.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      pos.array[i * 3 + 1] += 0.003;
      if (pos.array[i * 3 + 1] > height) pos.array[i * 3 + 1] = -1;
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        color="#FFE082"
        transparent
        opacity={0.45}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ─── Animated Candle Flame ─────────────────────────────────────────────────
export function CandleFlame({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position}>
      {/* Outer warm halo */}
      <mesh scale={[scale * 1.25, scale * 1.4, scale * 1.25]}>
        <coneGeometry args={[0.038, 0.15, 6]} />
        <meshBasicMaterial color="#FF9224" transparent opacity={0.65} />
      </mesh>
      {/* Bright inner golden flame core */}
      <mesh scale={[scale * 0.85, scale, scale * 0.85]} position={[0, -0.01, 0]}>
        <coneGeometry args={[0.024, 0.13, 6]} />
        <meshBasicMaterial color="#FFF0A0" />
      </mesh>
    </group>
  );
}

// ─── Crystal Chandelier Component ──────────────────────────────────────────
function CrystalChandelier({
  position,
  scale = 1,
  hasLight = true,
}: {
  position: [number, number, number];
  scale?: number;
  hasLight?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Gentle subtle pendulum breathing
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.02;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
      {/* Ceiling Medallion Rose */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.7, 0.75, 0.08, 24]} />
        <meshStandardMaterial color="#FAF4E6" roughness={0.6} />
      </mesh>
      {/* Brass Chain */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.8, 8]} />
        <meshStandardMaterial color="#C9A84C" metalness={0.85} roughness={0.2} />
      </mesh>

      {/* Tier 1: Top Gold Ring */}
      <mesh position={[0, -0.65, 0]}>
        <torusGeometry args={[0.45, 0.025, 8, 24]} />
        <meshStandardMaterial color="#C9A84C" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Tier 2: Middle Crystal Ring */}
      <mesh position={[0, -0.95, 0]}>
        <torusGeometry args={[0.75, 0.035, 8, 32]} />
        <meshStandardMaterial color="#C9A84C" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Tier 3: Bottom Crystal Ring */}
      <mesh position={[0, -1.25, 0]}>
        <torusGeometry args={[0.35, 0.025, 8, 24]} />
        <meshStandardMaterial color="#C9A84C" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Chandelier Candle Lamps on Middle Ring */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const x = Math.cos(rad) * 0.75;
        const z = Math.sin(rad) * 0.75;
        return (
          <group key={`c-lamp-${i}`} position={[x, -0.9, z]}>
            <mesh position={[0, 0.06, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.12, 8]} />
              <meshStandardMaterial color="#F5EEDB" roughness={0.7} />
            </mesh>
            <CandleFlame position={[0, 0.17, 0]} scale={0.9} />
          </group>
        );
      })}

      {/* Central Sparkling Warm Crystal Chandelier Light (selectively placed for high FPS) */}
      {hasLight && (
        <pointLight position={[0, -0.95, 0]} intensity={4.5} color="#FFAA52" distance={8.0} decay={1.8} />
      )}
    </group>
  );
}

// ─── Classical French Gilded Double Candle Wall Sconce ─────────────────────
function PalaceWallSconce({
  position,
  rotationY = 0,
}: {
  position: [number, number, number];
  rotationY?: number;
}) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Gilded Wall Backplate Medallion */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.08, 0.025, 12]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.25} />
      </mesh>
      {/* Curved Brass Arms */}
      <mesh position={[-0.08, 0.04, 0.07]} rotation={[0.25, 0, -0.35]}>
        <cylinderGeometry args={[0.012, 0.012, 0.15, 6]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.25} />
      </mesh>
      <mesh position={[0.08, 0.04, 0.07]} rotation={[0.25, 0, 0.35]}>
        <cylinderGeometry args={[0.012, 0.012, 0.15, 6]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.25} />
      </mesh>
      {/* Candle 1 (Left) */}
      <group position={[-0.12, 0.12, 0.12]}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.15, 6]} />
          <meshStandardMaterial color="#FAF5E8" roughness={0.7} />
        </mesh>
        <CandleFlame position={[0, 0.11, 0]} scale={0.75} />
      </group>
      {/* Candle 2 (Right) */}
      <group position={[0.12, 0.12, 0.12]}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.15, 6]} />
          <meshStandardMaterial color="#FAF5E8" roughness={0.7} />
        </mesh>
        <CandleFlame position={[0, 0.11, 0]} scale={0.75} />
      </group>
    </group>
  );
}

// ─── Classical Marble Urn with Red Roses ───────────────────────────────────
function RoseUrn({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Marble Pedestal */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[0.42, 0.9, 0.42]} />
        <meshStandardMaterial color="#FAF4E6" roughness={0.5} />
      </mesh>
      {/* Classical Urn Vase */}
      <mesh position={[0, 1.05, 0]}>
        <cylinderGeometry args={[0.26, 0.16, 0.35, 16]} />
        <meshStandardMaterial color="#C9A84C" metalness={0.75} roughness={0.3} />
      </mesh>
      {/* Rose Bush Foliage Sphere */}
      <mesh position={[0, 1.35, 0]}>
        <sphereGeometry args={[0.32, 16, 16]} />
        <meshStandardMaterial color="#1E381A" roughness={0.9} />
      </mesh>
      {/* Red Rose Blooms on Urn */}
      {[
        [-0.15, 1.45, 0.15],
        [0.18, 1.4, -0.1],
        [-0.05, 1.55, -0.12],
        [0.12, 1.48, 0.18],
        [-0.2, 1.35, -0.15],
      ].map(([rx, ry, rz], idx) => (
        <mesh key={`rose-${idx}`} position={[rx, ry, rz]}>
          <sphereGeometry args={[0.065, 8, 8]} />
          <meshStandardMaterial color="#B71C1C" roughness={0.7} emissive="#8B0000" emissiveIntensity={0.2} />
        </mesh>
      ))}
    </group>
  );
}

// ============================================================
// CHAPTER 01: The Arrival & Grand Palace Facade
// ============================================================
export function EntranceScene({ doorsOpen = false }: { doorsOpen?: boolean }) {
  const leftDoorRef = useRef<THREE.Group>(null!);
  const rightDoorRef = useRef<THREE.Group>(null!);
  const { camera } = useThree();

  useFrame((_, delta) => {
    if (doorsOpen) {
      if (leftDoorRef.current && leftDoorRef.current.rotation.y > -Math.PI / 2.2) {
        leftDoorRef.current.rotation.y -= delta * 1.3;
      }
      if (rightDoorRef.current && rightDoorRef.current.rotation.y < Math.PI / 2.2) {
        rightDoorRef.current.rotation.y += delta * 1.3;
      }
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, -8.2, delta * 0.9);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.8, delta * 0.9);
    } else {
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, 2.8, delta * 1.2);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.7, delta * 1.2);
    }
  });

  return (
    <>
      {/* Romantic Sunset-Dusk Sky */}
      <color attach="background" args={["#1A1016"]} />
      <fog attach="fog" args={["#1A1016", 8, 32]} />
      <ambientLight intensity={0.35} color="#E2A76F" />
      <directionalLight position={[0, 12, 10]} intensity={0.65} color="#FFA26B" />

      {/* Courtyard Flagstone Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
        <planeGeometry args={[44, 44]} />
        <meshStandardMaterial color="#161214" roughness={0.92} />
      </mesh>

      {/* Grand Paved Promenade Walkway */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.98, -2]}>
        <planeGeometry args={[3.2, 18]} />
        <meshStandardMaterial color="#2B2125" roughness={0.85} />
      </mesh>
      {/* Gold Stone Borders */}
      {[-1.6, 1.6].map((bx, i) => (
        <mesh key={`p-border-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[bx, -0.97, -2]}>
          <planeGeometry args={[0.08, 18]} />
          <meshStandardMaterial color="#C9A84C" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}

      {/* Clipped Topiary Shrubs & Lanterns along Promenade */}
      {[-2.2, 2.2].map((tx, ti) =>
        [-5, -2, 1, 4].map((tz, zi) => (
          <group key={`topiary-${ti}-${zi}`} position={[tx, -1, tz]}>
            {/* Stone Planter Base */}
            <mesh position={[0, 0.18, 0]}>
              <boxGeometry args={[0.45, 0.36, 0.45]} />
              <meshStandardMaterial color="#2E2428" roughness={0.8} />
            </mesh>
            {/* Spherical Clipped Bush */}
            <mesh position={[0, 0.65, 0]}>
              <sphereGeometry args={[0.34, 12, 12]} />
              <meshStandardMaterial color="#1B2818" roughness={0.95} />
            </mesh>
            {/* Small Lantern atop alternate shrubs */}
            {zi % 2 === 0 && (
              <group position={[0, 1.1, 0]}>
                <mesh>
                  <boxGeometry args={[0.16, 0.22, 0.16]} />
                  <meshStandardMaterial color="#221A1D" emissive="#FFA94D" emissiveIntensity={0.3} />
                </mesh>
                <CandleFlame position={[0, 0.05, 0]} scale={0.8} />
                <pointLight position={[0, 0.05, 0]} intensity={3.5} color="#FFA94D" distance={4.5} decay={2} />
              </group>
            )}
          </group>
        ))
      )}

      {/* ── French Royal Palace Facade ───────────────────────── */}
      {/* Central Palace Corps de Logis */}
      <mesh position={[0, 3.2, -9.2]}>
        <boxGeometry args={[18, 8.5, 0.8]} />
        <meshStandardMaterial color="#241B1F" roughness={0.88} />
      </mesh>
      {/* Classical Mansard Roof */}
      <mesh position={[0, 8.0, -9.2]} rotation={[0.4, 0, 0]}>
        <boxGeometry args={[18.4, 2.8, 1.2]} />
        <meshStandardMaterial color="#1A1822" roughness={0.95} />
      </mesh>
      {/* Central Classical Pediment & Dome */}
      <mesh position={[0, 8.6, -9.0]} rotation={[0, 0, Math.PI]}>
        <cylinderGeometry args={[2.2, 2.2, 0.5, 3]} />
        <meshStandardMaterial color="#2E2428" roughness={0.7} />
      </mesh>
      <mesh position={[0, 10.2, -9.2]}>
        <sphereGeometry args={[2.0, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#181520" roughness={0.6} />
      </mesh>

      {/* Two Tiers of Lit Palace Windows */}
      {[-7, -4.5, 4.5, 7].map((wx, wi) =>
        [1.8, 5.0].map((wy, wyi) => (
          <group key={`win-${wi}-${wyi}`} position={[wx, wy, -8.78]}>
            {/* Window Frame */}
            <mesh>
              <boxGeometry args={[1.1, 1.8, 0.08]} />
              <meshStandardMaterial color="#1A1417" roughness={0.6} />
            </mesh>
            {/* Warm Lit Panes */}
            <mesh position={[0, 0, 0.045]}>
              <planeGeometry args={[0.9, 1.6]} />
              <meshBasicMaterial color="#FFD199" />
            </mesh>
          </group>
        ))
      )}

      {/* Classical Entrance Portico Arch & Columns */}
      <mesh position={[-1.6, 1.4, -8.5]}>
        <cylinderGeometry args={[0.22, 0.26, 4.8, 16]} />
        <meshStandardMaterial color="#35292E" roughness={0.7} />
      </mesh>
      <mesh position={[1.6, 1.4, -8.5]}>
        <cylinderGeometry args={[0.22, 0.26, 4.8, 16]} />
        <meshStandardMaterial color="#35292E" roughness={0.7} />
      </mesh>
      {/* Portico Arch Top */}
      <mesh position={[0, 3.85, -8.5]}>
        <boxGeometry args={[3.8, 0.45, 0.7]} />
        <meshStandardMaterial color="#35292E" roughness={0.7} />
      </mesh>

      {/* Double Palace Doors */}
      <group ref={leftDoorRef} position={[-1.1, 1.2, -8.45]}>
        <mesh position={[0.55, 0, 0]}>
          <boxGeometry args={[1.1, 4.0, 0.08]} />
          <meshStandardMaterial color="#201518" roughness={0.5} metalness={0.2} />
        </mesh>
        <mesh position={[0.95, 0, 0.06]}>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshStandardMaterial color="#C9A84C" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>
      <group ref={rightDoorRef} position={[1.1, 1.2, -8.45]}>
        <mesh position={[-0.55, 0, 0]}>
          <boxGeometry args={[1.1, 4.0, 0.08]} />
          <meshStandardMaterial color="#201518" roughness={0.5} metalness={0.2} />
        </mesh>
        <mesh position={[-0.95, 0, 0.06]}>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshStandardMaterial color="#C9A84C" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* Warm Golden Light spilling from foyer when doors open */}
      <pointLight position={[0, 1.5, -9.6]} intensity={doorsOpen ? 14 : 3} color="#FFA94D" distance={12} decay={2} />

      <Stars radius={75} depth={45} count={950} factor={4} fade speed={0.3} />
      <DustParticles count={90} spread={14} height={6} />
    </>
  );
}

// ============================================================
// CHAPTER 03: The Royal Gallery (Regal Picture Lights & Frame Crests)
// ============================================================
interface FrameItem {
  id: string;
  year: string;
  date: string;
  title: string;
  story: string;
  photoUrl: string;
  photoAlt?: string;
  isPortrait?: boolean;
  images?: string[];
}

function RoyalFrame({
  position,
  side,
  frame,
  index,
  isSelected,
  onSelect,
}: {
  position: [number, number, number];
  side: 'left' | 'right';
  frame: FrameItem;
  index: number;
  isSelected: boolean;
  onSelect: (index: number) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  const isPortrait = !!frame.isPortrait;

  // Frame dimensions tailored to 9:16 portrait and 16:9 landscape
  const outerW = isPortrait ? 1.04 : 1.68;
  const outerH = isPortrait ? 1.66 : 1.10;
  const bevelW = isPortrait ? 0.88 : 1.52;
  const bevelH = isPortrait ? 1.50 : 0.94;
  const canvasW = isPortrait ? 0.82 : 1.46;
  const canvasH = isPortrait ? 1.44 : 0.88;
  const crestY = isPortrait ? 0.90 : 0.62;
  const lampY = isPortrait ? 1.04 : 0.76;
  const plaqueY = isPortrait ? -0.94 : -0.66;
  const finials = isPortrait
    ? [
        [-0.48, 0.78],
        [0.48, 0.78],
        [-0.48, -0.78],
        [0.48, -0.78],
      ]
    : [
        [-0.78, 0.50],
        [0.78, 0.50],
        [-0.78, -0.50],
        [0.78, -0.50],
      ];

  const texture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';
    const tex = loader.load(frame.photoUrl);
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    return tex;
  }, [frame.photoUrl]);

  const rotY = side === 'left' ? Math.PI / 2 : -Math.PI / 2;

  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* ── 1. Ornate Gilded Wood Frame ────────────────────── */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[outerW, outerH, 0.06]} />
        <meshStandardMaterial
          color={isSelected || hovered ? '#503816' : '#2A1D14'}
          roughness={0.4}
          metalness={0.35}
          emissive={isSelected ? '#C9A84C' : hovered ? '#E2A76F' : '#000000'}
          emissiveIntensity={isSelected ? 0.35 : hovered ? 0.2 : 0}
        />
      </mesh>

      {/* Gold Inner Bevel */}
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[bevelW, bevelH, 0.04]} />
        <meshStandardMaterial color="#C9A84C" metalness={0.88} roughness={0.25} />
      </mesh>

      {/* Dark Museum Matting Backing */}
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[bevelW - 0.02, bevelH - 0.02]} />
        <meshStandardMaterial color="#16100D" roughness={0.85} />
      </mesh>

      {/* ── 2. Top Decorative Brass Crest / Rosette ─────────── */}
      <group position={[0, crestY, 0.04]}>
        {/* Curved Crown Arch */}
        <mesh rotation={[0, 0, 0]}>
          <torusGeometry args={[0.22, 0.025, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#C9A84C" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Central Rosette Medallion */}
        <mesh position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color="#C9A84C" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* 4 Corner Brass Finials / Spheres (as in reference video!) */}
      {finials.map(([fx, fy], fi) => (
        <mesh key={`finial-${fi}`} position={[fx, fy, 0.04]}>
          <sphereGeometry args={[0.042, 12, 12]} />
          <meshStandardMaterial color="#C9A84C" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}

      {/* ── 3. Brass Picture Rail Light Fixture above Frame ─── */}
      <group position={[0, lampY, 0.22]}>
        {/* Horizontal Lamp Bar */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.02, isPortrait ? 0.65 : 0.85, 12]} />
          <meshStandardMaterial color="#C9A84C" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Connecting Arm to Wall */}
        <mesh position={[0, 0.08, -0.1]}>
          <cylinderGeometry args={[0.015, 0.015, 0.2, 8]} />
          <meshStandardMaterial color="#C9A84C" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Focused Golden Spotlight on Artwork — active when inspected */}
        {(isSelected || hovered) && (
          <pointLight
            position={[0, -0.16, 0.14]}
            intensity={isSelected ? 5.5 : 4.0}
            color={isSelected ? '#FFF5E0' : '#FFE8C8'}
            distance={4.0}
            decay={1.8}
          />
        )}
      </group>

      {/* ── 4. Photo Canvas (Clickable target — perfectly centered) ── */}
      <mesh
        ref={meshRef}
        position={[0, 0, 0.035]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(index);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <planeGeometry args={[canvasW, canvasH]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>

      {/* ── 5. Brass Inscribed Year Plaque below Frame ──────── */}
      <mesh position={[0, plaqueY, 0.025]}>
        <boxGeometry args={[0.78, 0.15, 0.02]} />
        <meshStandardMaterial color="#C9A84C" metalness={0.88} roughness={0.2} emissive="#C9A84C" emissiveIntensity={0.15} />
      </mesh>
    </group>
  );
}

// ─── First-Person Camera Rig for Royal Gallery ─────────────────────────────
export function CorridorCameraRig({
  walkZ,
  activeFrameIndex,
}: {
  walkZ: number;
  activeFrameIndex: number | null;
}) {
  const { camera } = useThree();
  const currentLookAt = useRef(new THREE.Vector3(0, 0.55, -5));

  useFrame((_, delta) => {
    let targetX = 0;
    let targetY = 0.58;
    let targetZ = walkZ;
    let lookX = 0;
    let lookY = 0.58;
    let lookZ = walkZ - 6;

    if (activeFrameIndex !== null) {
      const i = activeFrameIndex;
      const side = i % 2 === 0 ? 'left' : 'right';
      const frameZ = -i * 4.5 - 2;

      // Stand directly in front of the artwork
      targetX = side === 'left' ? -0.85 : 0.85;
      targetY = 0.6;
      targetZ = frameZ;

      // Look directly into the center of the painting
      lookX = side === 'left' ? -2.43 : 2.43;
      lookY = 0.6;
      lookZ = frameZ;
    }

    const lerpSpeed = activeFrameIndex !== null ? 4.5 * delta : 5.0 * delta;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, lerpSpeed);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, lerpSpeed);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, lerpSpeed);

    currentLookAt.current.x = THREE.MathUtils.lerp(currentLookAt.current.x, lookX, lerpSpeed);
    currentLookAt.current.y = THREE.MathUtils.lerp(currentLookAt.current.y, lookY, lerpSpeed);
    currentLookAt.current.z = THREE.MathUtils.lerp(currentLookAt.current.z, lookZ, lerpSpeed);

    camera.lookAt(currentLookAt.current);
  });

  return null;
}

export function CorridorScene({
  walkZ,
  activeFrameIndex,
  onSelectFrame,
}: {
  walkZ: number;
  activeFrameIndex: number | null;
  onSelectFrame: (idx: number) => void;
}) {
  const frames = GALLERY_DATA.frames;
  const corridorLength = 56;

  return (
    <>
      <color attach="background" args={["#1E1216"]} />
      {/* Soft distant fog that doesn't darken the gallery */}
      <fog attach="fog" args={["#1E1216", 24, 60]} />

      {/* Romantic Candlelit Palace Ambient Lighting */}
      <ambientLight intensity={0.42} color="#FFE0C5" />
      <directionalLight position={[0, 10, -5]} intensity={0.46} color="#FFE6D0" />

      <CorridorCameraRig walkZ={walkZ} activeFrameIndex={activeFrameIndex} />

      {/* Multi-tier Crystal Chandeliers Overhead */}
      {Array.from({ length: 12 }).map((_, i) => (
        <group key={`chand-${i}`} position={[0, 3.2, -i * 4.2 + 1.2]}>
          <CrystalChandelier position={[0, 0, 0]} scale={0.85} hasLight={i % 3 === 0} />
        </group>
      ))}

      {/* Dark Walnut Parquet Floor with Warm Specular Reflection */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.4, -22]}>
        <planeGeometry args={[5.2, corridorLength + 8]} />
        <meshStandardMaterial color="#201510" roughness={0.34} metalness={0.32} />
      </mesh>

      {/* Rich Royal Crimson & Gold Runner Rug */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.38, -22]}>
        <planeGeometry args={[1.7, corridorLength + 6]} />
        <meshStandardMaterial color="#4A0E18" roughness={0.88} />
      </mesh>
      {/* Gold Damask Border trim on runner */}
      {[-0.82, 0.82].map((rx, ri) => (
        <mesh key={`rug-gold-${ri}`} rotation={[-Math.PI / 2, 0, 0]} position={[rx, -1.37, -22]}>
          <planeGeometry args={[0.08, corridorLength + 6]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.85} roughness={0.25} />
        </mesh>
      ))}

      {/* High Warm Ivory Ceiling with Gold Moulding */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3.6, -22]}>
        <planeGeometry args={[5.2, corridorLength + 8]} />
        <meshStandardMaterial color="#F4EADB" roughness={0.7} />
      </mesh>
      {/* Ceiling Gold Cornice Trims */}
      {[-2.45, 2.45].map((cx, ci) => (
        <mesh key={`cornice-${ci}`} position={[cx, 3.55, -22]}>
          <boxGeometry args={[0.15, 0.12, corridorLength + 8]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.85} roughness={0.25} />
        </mesh>
      ))}

      {/* Left Wall: Royal Bordeaux Velvet with Ivory Wainscoting */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-2.5, 1.1, -22]}>
        <planeGeometry args={[corridorLength + 8, 5]} />
        <meshStandardMaterial color="#380C16" roughness={0.65} />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-2.48, -0.85, -22]}>
        <planeGeometry args={[corridorLength + 8, 1.1]} />
        <meshStandardMaterial color="#FAF4E6" roughness={0.5} />
      </mesh>
      {/* Left Wainscoting Gold Chair Rail */}
      <mesh position={[-2.46, -0.3, -22]}>
        <boxGeometry args={[0.06, 0.08, corridorLength + 8]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.85} roughness={0.25} />
      </mesh>

      {/* Right Wall: Royal Bordeaux Velvet with Ivory Wainscoting */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[2.5, 1.1, -22]}>
        <planeGeometry args={[corridorLength + 8, 5]} />
        <meshStandardMaterial color="#380C16" roughness={0.65} />
      </mesh>
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[2.48, -0.85, -22]}>
        <planeGeometry args={[corridorLength + 8, 1.1]} />
        <meshStandardMaterial color="#FAF4E6" roughness={0.5} />
      </mesh>
      {/* Right Wainscoting Gold Chair Rail */}
      <mesh position={[2.46, -0.3, -22]}>
        <boxGeometry args={[0.06, 0.08, corridorLength + 8]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.85} roughness={0.25} />
      </mesh>

      {/* Ivory Classical Pilasters */}
      {Array.from({ length: 13 }).map((_, i) => (
        <React.Fragment key={`arch-${i}`}>
          {/* Left Pilaster */}
          <mesh position={[-2.42, 1.1, -i * 4.5 + 1.2]}>
            <boxGeometry args={[0.18, 5, 0.28]} />
            <meshStandardMaterial color="#FAF4E6" roughness={0.5} />
          </mesh>
          <mesh position={[-2.4, 3.4, -i * 4.5 + 1.2]}>
            <boxGeometry args={[0.24, 0.22, 0.34]} />
            <meshStandardMaterial color="#D4AF37" metalness={0.88} roughness={0.25} />
          </mesh>

          {/* Right Pilaster */}
          <mesh position={[2.42, 1.1, -i * 4.5 + 1.2]}>
            <boxGeometry args={[0.18, 5, 0.28]} />
            <meshStandardMaterial color="#FAF4E6" roughness={0.5} />
          </mesh>
          <mesh position={[2.4, 3.4, -i * 4.5 + 1.2]}>
            <boxGeometry args={[0.24, 0.22, 0.34]} />
            <meshStandardMaterial color="#D4AF37" metalness={0.88} roughness={0.25} />
          </mesh>
        </React.Fragment>
      ))}

      {/* Candlelit Wall Sconces with flickering golden flames along corridor */}
      {Array.from({ length: 12 }).map((_, i) => (
        <React.Fragment key={`sconce-pair-${i}`}>
          <PalaceWallSconce position={[-2.44, 1.25, -i * 4.5 - 0.4]} rotationY={Math.PI / 2} />
          <PalaceWallSconce position={[2.44, 1.25, -i * 4.5 - 0.4]} rotationY={-Math.PI / 2} />
        </React.Fragment>
      ))}

      {/* Royal Memory Frames */}
      {frames.map((frame, i) => {
        const side = i % 2 === 0 ? 'left' : 'right';
        const x = side === 'left' ? -2.43 : 2.43;
        const z = -i * 4.5 - 2;
        return (
          <RoyalFrame
            key={frame.id}
            frame={frame}
            index={i}
            position={[x, 0.6, z]}
            side={side}
            isSelected={activeFrameIndex === i}
            onSelect={onSelectFrame}
          />
        );
      })}

      {/* Glowing Archway to Grand Ballroom at end of hall */}
      <group position={[0, 0.8, -47]}>
        <mesh position={[-1.35, 0.5, 0]}>
          <boxGeometry args={[0.42, 4.4, 0.42]} />
          <meshStandardMaterial color="#FAF4E6" roughness={0.5} />
        </mesh>
        <mesh position={[1.35, 0.5, 0]}>
          <boxGeometry args={[0.42, 4.4, 0.42]} />
          <meshStandardMaterial color="#FAF4E6" roughness={0.5} />
        </mesh>
        <mesh position={[0, 2.7, 0]}>
          <boxGeometry args={[3.1, 0.42, 0.42]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.88} roughness={0.25} />
        </mesh>
        <pointLight position={[0, 0.8, -1]} intensity={14} color="#FFA94D" distance={12} decay={1.5} />
      </group>

      <DustParticles count={90} spread={4.5} height={5} />
    </>
  );
}

// ============================================================
// CHAPTER 04: The Grand Ballroom / Atrium of Reflection
// ============================================================
export function AtriumScene() {
  const plaqueRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (plaqueRef.current) {
      (plaqueRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.35 + Math.sin(t * 1.5) * 0.1;
    }
  });

  return (
    <>
      <color attach="background" args={["#120D12"]} />
      <fog attach="fog" args={["#120D12", 8, 24]} />
      <ambientLight intensity={0.4} color="#E2A76F" />

      {/* ── Multi-Tiered Central Crystal Chandelier ────────── */}
      <CrystalChandelier position={[0, 3.8, 0]} scale={1.3} />

      {/* Parquet Ballroom Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.4, 0]}>
        <cylinderGeometry args={[7.2, 7.2, 0.1, 48]} />
        <meshStandardMaterial color="#1C1410" roughness={0.6} metalness={0.2} />
      </mesh>

      {/* Concentric Gold Inlaid Floor Circles (as in reference video!) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.34, 0]}>
        <ringGeometry args={[2.0, 2.05, 48]} />
        <meshStandardMaterial color="#C9A84C" metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.34, 0]}>
        <ringGeometry args={[3.2, 3.26, 48]} />
        <meshStandardMaterial color="#C9A84C" metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.34, 0]}>
        <ringGeometry args={[5.2, 5.28, 48]} />
        <meshStandardMaterial color="#C9A84C" metalness={0.85} roughness={0.25} />
      </mesh>

      {/* 8 Classical Corinthian Pillars */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * Math.PI * 2) / 8;
        const x = Math.cos(angle) * 5.4;
        const z = Math.sin(angle) * 5.4;
        return (
          <group key={`b-col-${i}`} position={[x, 1.2, z]}>
            <mesh>
              <cylinderGeometry args={[0.22, 0.28, 5.2, 16]} />
              <meshStandardMaterial color="#FAF4E6" roughness={0.55} />
            </mesh>
            <mesh position={[0, 2.6, 0]}>
              <boxGeometry args={[0.65, 0.28, 0.65]} />
              <meshStandardMaterial color="#C9A84C" metalness={0.8} roughness={0.3} />
            </mesh>
          </group>
        );
      })}

      {/* Oval Ceiling Skylight with Painted Clouds / Sky */}
      <mesh position={[0, 3.9, 0]}>
        <cylinderGeometry args={[4.2, 4.4, 0.15, 32]} />
        <meshBasicMaterial color="#6B8EB8" />
      </mesh>

      {/* ── Central Artist Easel & Plaque Display ───────────── */}
      <group position={[0, -0.6, 0]}>
        {/* Dark Walnut Easel Legs */}
        <mesh position={[-0.32, 0, -0.1]} rotation={[0, 0, -0.12]}>
          <cylinderGeometry args={[0.025, 0.03, 1.8, 8]} />
          <meshStandardMaterial color="#1E140C" roughness={0.6} />
        </mesh>
        <mesh position={[0.32, 0, -0.1]} rotation={[0, 0, 0.12]}>
          <cylinderGeometry args={[0.025, 0.03, 1.8, 8]} />
          <meshStandardMaterial color="#1E140C" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0, -0.32]} rotation={[-0.24, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.03, 1.8, 8]} />
          <meshStandardMaterial color="#1E140C" roughness={0.6} />
        </mesh>

        {/* The Gilded Plaque Display Frame */}
        <mesh ref={plaqueRef} position={[0, 0.38, 0.04]} rotation={[-0.15, 0, 0]}>
          <boxGeometry args={[1.2, 0.76, 0.06]} />
          <meshStandardMaterial
            color="#C9A84C"
            metalness={0.92}
            roughness={0.2}
            emissive="#FFA94D"
            emissiveIntensity={0.35}
          />
        </mesh>
        {/* Inner Plaque Face */}
        <mesh position={[0, 0.38, 0.075]} rotation={[-0.15, 0, 0]}>
          <planeGeometry args={[1.05, 0.62]} />
          <meshStandardMaterial color="#26151B" roughness={0.8} />
        </mesh>
      </group>

      {/* Two Classical Marble Urns with Red Roses Flanking Easel */}
      <RoseUrn position={[-1.7, -1.4, -0.2]} />
      <RoseUrn position={[1.7, -1.4, -0.2]} />

      {/* 5 Candle Pillars surrounding the central display */}
      {[0, 72, 144, 216, 288].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const r = 1.6;
        const x = Math.cos(rad) * r;
        const z = Math.sin(rad) * r;
        return (
          <group key={`ball-c-${i}`} position={[x, -0.9, z]}>
            <mesh position={[0, -0.15, 0]}>
              <cylinderGeometry args={[0.07, 0.09, 0.6, 12]} />
              <meshStandardMaterial color="#FAF4E6" roughness={0.6} />
            </mesh>
            <mesh position={[0, 0.22, 0]}>
              <cylinderGeometry args={[0.035, 0.035, 0.24, 10]} />
              <meshStandardMaterial color="#F5EEDB" roughness={0.8} />
            </mesh>
            <CandleFlame position={[0, 0.38, 0]} scale={1.3} />
            <pointLight position={[0, 0.42, 0]} intensity={2.8} color="#FFA94D" distance={3.5} decay={2} />
          </group>
        );
      })}

      <DustParticles count={90} spread={9} height={6} />
    </>
  );
}

// ============================================================
// CHAPTER 05: The Starlit Terrace, Rose Garden & Full Moon
// ============================================================
function FullMoon() {
  const haloRef = useRef<THREE.Mesh>(null!);
  const cloudsRef = useRef<THREE.Group>(null!);
  const moonRef = useRef<THREE.Mesh>(null!);

  const [moonTexture, haloTexture] = useMemo(() => {
    const mCanvas = document.createElement('canvas');
    mCanvas.width = 1024;
    mCanvas.height = 512;
    const mCtx = mCanvas.getContext('2d')!;

    const baseGrad = mCtx.createLinearGradient(0, 0, 0, 512);
    baseGrad.addColorStop(0, '#E8F1FF');
    baseGrad.addColorStop(0.5, '#F7FAFF');
    baseGrad.addColorStop(1, '#D8E5F8');
    mCtx.fillStyle = baseGrad;
    mCtx.fillRect(0, 0, 1024, 512);

    const maria = [
      { x: 380, y: 220, r: 125, a: 0.32 },
      { x: 510, y: 185, r: 105, a: 0.28 },
      { x: 590, y: 260, r: 95, a: 0.24 },
      { x: 320, y: 320, r: 90, a: 0.22 },
      { x: 650, y: 200, r: 75, a: 0.20 },
      { x: 440, y: 340, r: 100, a: 0.25 },
      { x: 260, y: 235, r: 70, a: 0.18 },
      { x: 730, y: 280, r: 85, a: 0.20 },
    ];
    maria.forEach((m) => {
      const g = mCtx.createRadialGradient(m.x, m.y, 10, m.x, m.y, m.r);
      g.addColorStop(0, `rgba(80, 95, 125, ${m.a})`);
      g.addColorStop(0.65, `rgba(100, 115, 145, ${m.a * 0.7})`);
      g.addColorStop(1, 'rgba(180, 200, 230, 0)');
      mCtx.fillStyle = g;
      mCtx.beginPath();
      mCtx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      mCtx.fill();
    });

    for (let i = 0; i < 260; i++) {
      const cx = Math.random() * 1024;
      const cy = Math.random() * 512;
      const cr = 2 + Math.random() * 16;
      const op = 0.08 + Math.random() * 0.16;

      mCtx.fillStyle = `rgba(50, 65, 90, ${op})`;
      mCtx.beginPath();
      mCtx.arc(cx, cy, cr, 0, Math.PI * 2);
      mCtx.fill();

      mCtx.strokeStyle = `rgba(255, 255, 255, ${op * 1.5})`;
      mCtx.lineWidth = 1.0;
      mCtx.beginPath();
      mCtx.arc(cx - 0.5, cy - 0.5, cr, Math.PI * 0.8, Math.PI * 1.9);
      mCtx.stroke();
    }

    const tx = 590, ty = 370;
    mCtx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
    mCtx.lineWidth = 1.4;
    for (let a = 0; a < 26; a++) {
      const angle = (a * Math.PI * 2) / 26 + (Math.random() - 0.5) * 0.15;
      const len = 70 + Math.random() * 140;
      mCtx.beginPath();
      mCtx.moveTo(tx, ty);
      mCtx.lineTo(tx + Math.cos(angle) * len, ty + Math.sin(angle) * len);
      mCtx.stroke();
    }

    const hCanvas = document.createElement('canvas');
    hCanvas.width = 512;
    hCanvas.height = 512;
    const hCtx = hCanvas.getContext('2d')!;
    const hGrad = hCtx.createRadialGradient(256, 256, 40, 256, 256, 256);
    hGrad.addColorStop(0, 'rgba(240, 248, 255, 0.95)');
    hGrad.addColorStop(0.2, 'rgba(205, 225, 255, 0.5)');
    hGrad.addColorStop(0.45, 'rgba(150, 185, 245, 0.2)');
    hGrad.addColorStop(0.75, 'rgba(90, 125, 190, 0.06)');
    hGrad.addColorStop(1, 'rgba(30, 45, 90, 0)');
    hCtx.fillStyle = hGrad;
    hCtx.fillRect(0, 0, 512, 512);

    return [new THREE.CanvasTexture(mCanvas), new THREE.CanvasTexture(hCanvas)];
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (haloRef.current) {
      const s = 1 + Math.sin(t * 0.8) * 0.03;
      haloRef.current.scale.set(s, s, 1);
    }
    if (cloudsRef.current) {
      cloudsRef.current.position.x = Math.sin(t * 0.04) * 2.2;
    }
    if (moonRef.current) {
      moonRef.current.rotation.y = t * 0.005;
    }
  });

  const moonPos: [number, number, number] = [5, 9, -24];

  return (
    <group position={moonPos}>
      <mesh ref={moonRef}>
        <sphereGeometry args={[4.2, 48, 48]} />
        <meshBasicMaterial map={moonTexture} toneMapped={false} />
      </mesh>

      <mesh scale={[1.05, 1.05, 1.05]}>
        <sphereGeometry args={[4.2, 32, 32]} />
        <meshBasicMaterial
          color="#EAF2FF"
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      <mesh ref={haloRef} position={[0, 0, -0.4]}>
        <planeGeometry args={[26, 26]} />
        <meshBasicMaterial
          map={haloTexture}
          transparent
          opacity={0.82}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <directionalLight position={[0, -4, 14]} intensity={2.8} color="#D6E6FF" />
      <pointLight position={[0, 0, 4]} intensity={18} color="#E8F2FF" distance={55} decay={1.4} />

      <group ref={cloudsRef} position={[0, -0.8, 2]}>
        {[-3.5, 0, 3.8].map((cx, i) => (
          <mesh key={`cloud-${i}`} position={[cx, (i % 2) * 0.8 - 0.4, 0]}>
            <planeGeometry args={[10, 3.2]} />
            <meshBasicMaterial
              color="#A8C4E8"
              transparent
              opacity={0.16 + (i % 2) * 0.06}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function MoonlitOcean() {
  const reflectionRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (reflectionRef.current) {
      const t = clock.getElapsedTime();
      (reflectionRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.35 + Math.sin(t * 1.8) * 0.08 + Math.cos(t * 3.2) * 0.04;
      reflectionRef.current.scale.x = 1 + Math.sin(t * 1.2) * 0.05;
    }
  });

  return (
    <group position={[0, -4.6, -30]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[110, 45]} />
        <meshStandardMaterial color="#060914" roughness={0.2} metalness={0.85} />
      </mesh>

      <mesh ref={reflectionRef} position={[0, 0.05, 10]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[7.5, 26]} />
        <meshBasicMaterial
          color="#D4E5FF"
          transparent
          opacity={0.38}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {[-30, -22, -15, 15, 22, 30].map((mx, i) => (
        <mesh key={`mnt-${i}`} position={[mx, 1.8 + (i % 3) * 0.6, -6]}>
          <coneGeometry args={[9, 5.5, 4]} />
          <meshStandardMaterial color="#070A12" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function TerraceLantern({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.34, 0.1, 0.34]} />
        <meshStandardMaterial color="#2B2117" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[0.22, 0.34, 0.22]} />
        <meshStandardMaterial
          color="#1E150D"
          roughness={0.4}
          metalness={0.8}
          emissive="#FFA94D"
          emissiveIntensity={0.25}
        />
      </mesh>
      <mesh position={[0, 0.44, 0]}>
        <coneGeometry args={[0.18, 0.14, 4]} />
        <meshStandardMaterial color="#C9A84C" metalness={0.7} roughness={0.3} />
      </mesh>
      <CandleFlame position={[0, 0.22, 0]} scale={1.3} />
      <pointLight position={[0, 0.24, 0]} intensity={8} color="#FFA94D" distance={8} decay={2} />
    </group>
  );
}

export function TerraceScene() {
  return (
    <>
      <color attach="background" args={["#0C1120"]} />
      <fog attach="fog" args={["#0C1120", 22, 60]} />
      <ambientLight intensity={1.8} color="#B0C8F0" />
      {/* Strong moonlight from behind camera, angled down onto terrace */}
      <directionalLight position={[0, 12, 16]} intensity={3.0} color="#C8DCFF" />
      {/* Fill light from front */}
      <pointLight position={[0, 4, 6]} intensity={18} color="#90B0E8" distance={26} decay={1.4} />
      {/* Uplight from terrace floor — bounced moonlight */}
      <pointLight position={[0, -0.5, 0]} intensity={10} color="#A0BBEF" distance={16} decay={1.8} />

      {/* Radiant Full Moon & Ocean Reflection */}
      <FullMoon />
      <MoonlitOcean />
      <Stars radius={95} depth={60} count={1200} factor={5} fade speed={0.2} />

      {/* Classical Stone Terrace Patio */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.4, 0]}>
        <cylinderGeometry args={[5.6, 5.8, 0.12, 36]} />
        <meshStandardMaterial color="#3A3545" roughness={0.6} metalness={0.35} />
      </mesh>

      {/* Gold Inlaid Circular Trim */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.33, 0]}>
        <ringGeometry args={[3.2, 3.26, 36]} />
        <meshStandardMaterial color="#C9A84C" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Classical Stone Balustrade */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i / 15) * Math.PI - Math.PI / 2;
        const r = 5.0;
        const x = Math.sin(angle) * r;
        const z = -Math.cos(angle) * r;
        return (
          <mesh key={`balus-col-${i}`} position={[x, -0.85, z]}>
            <cylinderGeometry args={[0.07, 0.09, 0.95, 8]} />
            <meshStandardMaterial color="#FAF4E6" roughness={0.65} />
          </mesh>
        );
      })}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.37, -2.5]}>
        <torusGeometry args={[5.0, 0.09, 8, 36, Math.PI]} />
        <meshStandardMaterial color="#FAF4E6" roughness={0.65} />
      </mesh>

      {/* 4 Warm Bronze Lanterns along Balustrade */}
      <TerraceLantern position={[-3.8, -0.34, -3.2]} />
      <TerraceLantern position={[-1.5, -0.34, -4.8]} />
      <TerraceLantern position={[1.5, -0.34, -4.8]} />
      <TerraceLantern position={[3.8, -0.34, -3.2]} />

      {/* Two Rose Urns on Terrace Balustrade Corners */}
      <RoseUrn position={[-4.2, -1.4, -2.2]} />
      <RoseUrn position={[4.2, -1.4, -2.2]} />

      {/* ── Intimate Bistro Table ─────────────────────────────── */}
      <group position={[0, -0.58, -1.35]}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.7, 0.7, 0.045, 32]} />
          <meshStandardMaterial color="#1C1819" roughness={0.4} metalness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.708, 0.708, 0.035, 32]} />
          <meshStandardMaterial color="#C9A84C" metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[0, -0.38, 0]}>
          <cylinderGeometry args={[0.04, 0.07, 0.72, 12]} />
          <meshStandardMaterial color="#141113" roughness={0.6} metalness={0.7} />
        </mesh>
        <mesh position={[0, -0.74, 0]}>
          <cylinderGeometry args={[0.38, 0.42, 0.05, 16]} />
          <meshStandardMaterial color="#141113" roughness={0.6} metalness={0.7} />
        </mesh>

        {/* 2 Delicate Wine Glasses catching Moonlight */}
        {[-0.28, 0.28].map((gx, i) => (
          <group key={`glass-${i}`} position={[gx, 0.14, -0.15]}>
            <mesh>
              <cylinderGeometry args={[0.05, 0.03, 0.16, 12, 1, true]} />
              <meshPhysicalMaterial
                color="#EAF4FF"
                transparent
                opacity={0.35}
                roughness={0.1}
                metalness={0.1}
                transmission={0.85}
                ior={1.5}
              />
            </mesh>
            <mesh position={[0, -0.09, 0]}>
              <cylinderGeometry args={[0.008, 0.008, 0.12, 8]} />
              <meshPhysicalMaterial color="#EAF4FF" transparent opacity={0.4} />
            </mesh>
            <mesh position={[0, -0.14, 0]}>
              <cylinderGeometry args={[0.045, 0.045, 0.015, 12]} />
              <meshPhysicalMaterial color="#EAF4FF" transparent opacity={0.4} />
            </mesh>
          </group>
        ))}

        {/* Scattered Rose Petals on Tabletop */}
        {[
          [-0.15, 0.05], [0.18, -0.08], [-0.08, 0.16], [0.22, 0.12], [-0.22, -0.1]
        ].map(([px, pz], pi) => (
          <mesh key={`petal-${pi}`} position={[px, 0.026, pz]} rotation={[-Math.PI / 2, 0, pi * 1.2]}>
            <planeGeometry args={[0.045, 0.035]} />
            <meshStandardMaterial color="#881525" roughness={0.8} />
          </mesh>
        ))}

        {/* Two Warm Candles */}
        <group position={[-0.16, 0.14, 0.1]}>
          <mesh>
            <cylinderGeometry args={[0.032, 0.032, 0.22, 10]} />
            <meshStandardMaterial color="#F5EEDB" roughness={0.8} />
          </mesh>
          <CandleFlame position={[0, 0.16, 0]} scale={1.25} />
          <pointLight position={[0, 0.2, 0]} intensity={3.5} color="#FFA94D" distance={3.8} decay={2} />
        </group>
        <group position={[0.16, 0.11, 0.1]}>
          <mesh>
            <cylinderGeometry args={[0.032, 0.032, 0.16, 10]} />
            <meshStandardMaterial color="#F5EEDB" roughness={0.8} />
          </mesh>
          <CandleFlame position={[0, 0.13, 0]} scale={1.1} />
          <pointLight position={[0, 0.17, 0]} intensity={3.0} color="#FFA94D" distance={3.5} decay={2} />
        </group>

        {/* ── The Crimson Wax-Sealed Closing Letter ────────────── */}
        <mesh position={[0, 0.032, -0.02]} rotation={[-0.08, 0.06, 0]}>
          <boxGeometry args={[0.34, 0.016, 0.24]} />
          <meshStandardMaterial
            color="#881515"
            roughness={0.4}
            metalness={0.15}
            emissive="#881515"
            emissiveIntensity={0.2}
          />
        </mesh>
        <mesh position={[0, 0.044, -0.02]}>
          <cylinderGeometry args={[0.04, 0.04, 0.012, 16]} />
          <meshStandardMaterial
            color="#A81818"
            roughness={0.25}
            metalness={0.2}
            emissive="#C41E3A"
            emissiveIntensity={0.35}
          />
        </mesh>
        <mesh position={[0, 0.052, -0.02]}>
          <cylinderGeometry args={[0.022, 0.022, 0.005, 12]} />
          <meshStandardMaterial color="#C9A84C" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      <DustParticles count={70} spread={10} height={5} />
    </>
  );
}
