import React from 'react';
import { Html } from '@react-three/drei';

export default function ReservationIcon() {
  return (
    <Html
      center
      zIndexRange={[0, 10]}
      style={{
        background: '#EEF2FF',
        padding: '4px 12px',
        borderRadius: '9999px',
        color: '#4F46E5',
        fontWeight: 'bold',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        userSelect: 'none',
        fontSize: '0.875rem',
      }}
    >
      予約中
    </Html>
  );
}