import React, { createContext, useContext, useState } from 'react';

interface Chair {
  id: number;
  name: string;
  isOccupied: boolean;
  startTime?: Date;
  userId?: string;
}

interface ChairContextType {
  chairs: Chair[];
  selectedChair: Chair | null;
  startUse: (chairId: number, userId: string) => void;
  endUse: (chairId: number) => void;
  selectChair: (chair: Chair) => void;
  calculateFee: (startTime: Date) => number;
}

const ChairContext = createContext<ChairContextType | undefined>(undefined);

export function ChairProvider({ children }: { children: React.ReactNode }) {
  const [chairs, setChairs] = useState<Chair[]>([
    { id: 1, name: 'チェア 1', isOccupied: false },
    { id: 2, name: 'チェア 2', isOccupied: false },
    { id: 3, name: 'チェア 3', isOccupied: false },
    { id: 4, name: 'チェア 4', isOccupied: false },
    { id: 5, name: 'チェア 5', isOccupied: false },
  ]);
  const [selectedChair, setSelectedChair] = useState<Chair | null>(null);

  const startUse = (chairId: number, userId: string) => {
    setChairs(chairs.map(chair => 
      chair.id === chairId 
        ? { ...chair, isOccupied: true, startTime: new Date(), userId }
        : chair
    ));
  };

  const endUse = (chairId: number) => {
    setChairs(chairs.map(chair =>
      chair.id === chairId
        ? { ...chair, isOccupied: false, startTime: undefined, userId: undefined }
        : chair
    ));
    setSelectedChair(null);
  };

  const selectChair = (chair: Chair) => {
    setSelectedChair(chair);
  };

  const calculateFee = (startTime: Date) => {
    const duration = Math.ceil(
      (new Date().getTime() - startTime.getTime()) / (1000 * 60)
    );
    const baseRate = 100; // 1分あたりの料金（円）
    return duration * baseRate;
  };

  return (
    <ChairContext.Provider value={{
      chairs,
      selectedChair,
      startUse,
      endUse,
      selectChair,
      calculateFee,
    }}>
      {children}
    </ChairContext.Provider>
  );
}

export function useChair() {
  const context = useContext(ChairContext);
  if (context === undefined) {
    throw new Error('useChair must be used within a ChairProvider');
  }
  return context;
}