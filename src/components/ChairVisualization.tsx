import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Html } from '@react-three/drei';
import { useChair } from '../context/ChairContext';
import { useReservationStore } from '../store/reservationStore';
import { useAuthStore } from '../store/authStore';
import StatusIcon from './StatusIcon';

interface ChairVisualizationProps {
  onChairSelect: (chairId: number) => void;
  highlightedChairId: number | null;
  showReservationHighlight: boolean;
  selectedChairs?: number[];
}

function ChairLabel({ name }: { name: string }) {
  return (
    <Html
      center
      zIndexRange={[0, 10]}
      style={{
        fontSize: '16px',
        fontWeight: 'medium',
        color: '#1F2937',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
      occlude
    >
      {name}
    </Html>
  );
}

function Chair({ 
  position,
  isOccupied,
  isReserved,
  isHighlighted,
  isSelected,
  name,
  chairId,
  onChairClick
}: { 
  position: [number, number, number];
  isOccupied: boolean;
  isReserved: boolean;
  isHighlighted: boolean;
  isSelected: boolean;
  name: string;
  chairId: number;
  onChairClick: (chairId: number) => void;
}) {
  const chairColor = isSelected || isHighlighted ? '#4ADE80' : isOccupied ? '#9CA3AF' : '#FFFFFF';
  const cushionColor = isSelected || isHighlighted ? '#3CB371' : isOccupied ? '#8B8E94' : '#F3F4F6';

  return (
    <group 
      position={position} 
      rotation={[0, Math.PI * 0.25, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onChairClick(chairId);
      }}
    >
      {/* チェア番号表示 */}
      <group position={[0, 2.8, 0]}>
        <ChairLabel name={name} />
      </group>

      {/* ステータスアイコン */}
      {(isOccupied || isReserved || isSelected) && (
        <group position={[0, 3.6, 0]}>
          <StatusIcon status={isSelected ? 'selected' : isOccupied ? 'occupied' : 'reserved'} />
        </group>
      )}

      {/* 座面本体 */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[1.2, 0.15, 1]} />
        <meshStandardMaterial color={chairColor} />
      </mesh>

      {/* 座面クッション */}
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[1.1, 0.1, 0.9]} />
        <meshStandardMaterial color={cushionColor} />
      </mesh>

      {/* 背もたれ本体 */}
      <mesh position={[0, 1.4, -0.4]} rotation={[Math.PI * -0.1, 0, 0]}>
        <boxGeometry args={[1.2, 1.8, 0.15]} />
        <meshStandardMaterial color={chairColor} />
      </mesh>

      {/* 背もたれクッション */}
      <mesh position={[0, 1.4, -0.32]} rotation={[Math.PI * -0.1, 0, 0]}>
        <boxGeometry args={[1.1, 1.6, 0.1]} />
        <meshStandardMaterial color={cushionColor} />
      </mesh>

      {/* フットレスト */}
      <group position={[0, 0.3, 0.8]} rotation={[Math.PI * 0.25, 0, 0]}>
        <mesh>
          <boxGeometry args={[1.2, 0.15, 0.8]} />
          <meshStandardMaterial color={chairColor} />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[1.1, 0.1, 0.7]} />
          <meshStandardMaterial color={cushionColor} />
        </mesh>
      </group>

      {/* アームレスト */}
      {[-0.7, 0.7].map((x, i) => (
        <group key={i} position={[x, 0.9, -0.1]}>
          <mesh>
            <boxGeometry args={[0.1, 0.6, 0.8]} />
            <meshStandardMaterial color={chairColor} />
          </mesh>
          <mesh position={[0, 0.25, 0]}>
            <boxGeometry args={[0.12, 0.15, 0.85]} />
            <meshStandardMaterial color={cushionColor} />
          </mesh>
        </group>
      ))}

      {/* ベース */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.4, 0.5, 0.4, 32]} />
        <meshStandardMaterial color={chairColor} />
      </mesh>
    </group>
  );
}

export default function ChairVisualization({ 
  onChairSelect, 
  highlightedChairId,
  showReservationHighlight,
  selectedChairs = []
}: ChairVisualizationProps) {
  const { chairs } = useChair();
  const { user } = useAuthStore();
  const { getChairReservations } = useReservationStore();

  return (
    <div className="relative">
      <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-lg z-10">
        <h3 className="font-semibold mb-2">3Dビュー操作方法:</h3>
        <ul className="text-sm space-y-1">
          <li>• ドラッグ: 視点を回転</li>
          <li>• スクロール: ズームイン/アウト</li>
          <li>• クリック: チェア選択</li>
        </ul>
      </div>
      <div className="w-full h-[400px] bg-gray-100 rounded-xl overflow-hidden shadow-inner mb-8">
        <Canvas>
          <PerspectiveCamera makeDefault position={[8, 6, 8]} />
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2}
          />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <directionalLight position={[-10, 10, -5]} intensity={0.5} />
          
          {chairs.map((chair, index) => {
            const reservations = getChairReservations(chair.id);
            const userReservation = reservations.find(r => r.user_id === user?.id);
            const isSelected = selectedChairs.includes(chair.id);
            
            return (
              <Chair
                key={chair.id}
                position={[index * 2.5 - 5, 0, 0]}
                isOccupied={chair.isOccupied}
                isReserved={!!userReservation}
                isHighlighted={showReservationHighlight && highlightedChairId === chair.id}
                isSelected={isSelected}
                name={chair.name}
                chairId={chair.id}
                onChairClick={onChairSelect}
              />
            );
          })}
          
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
            <planeGeometry args={[15, 8]} />
            <meshStandardMaterial color="#E5E7EB" />
          </mesh>
        </Canvas>
      </div>
    </div>
  );
}