import React from 'react';
import { Html } from '@react-three/drei';

interface StatusIconProps {
  status: 'occupied' | 'reserved' | 'selected';
}

export default function StatusIcon({ status }: StatusIconProps) {
  const styles = {
    occupied: {
      background: '#FEE2E2',
      color: '#EF4444',
    },
    reserved: {
      background: '#EEF2FF',
      color: '#4F46E5',
    },
    selected: {
      background: '#ECFDF5',
      color: '#059669',
    },
  };

  const labels = {
    occupied: '利用中',
    reserved: '予約中',
    selected: '選択中',
  };

  return (
    <Html
      center
      zIndexRange={[0, 10]}
      style={{
        background: styles[status].background,
        padding: '4px 12px',
        borderRadius: '9999px',
        color: styles[status].color,
        fontWeight: 'bold',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        userSelect: 'none',
        fontSize: '0.875rem',
      }}
    >
      {labels[status]}
    </Html>
  );
}