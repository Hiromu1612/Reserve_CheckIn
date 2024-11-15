import { create } from 'zustand';
import { addHours, addMinutes, isAfter, isBefore, isWithinInterval } from 'date-fns';
import { supabase } from '../lib/supabase';
import type { ReservationType } from '../lib/supabase';
import { useAuthStore } from './authStore';

interface ReservationState {
  reservations: ReservationType[];
  loading: boolean;
  error: string | null;
  fetchReservations: () => Promise<void>;
  addReservation: (reservation: Omit<ReservationType, 'id' | 'created_at'>) => Promise<void>;
  cancelReservation: (id: string) => Promise<void>;
  getChairReservations: (chairId: number) => ReservationType[];
  isChairAvailable: (chairId: number, startTime: Date, endTime: Date) => boolean;
  getCurrentReservation: (chairId: number) => ReservationType | null;
}

export const useReservationStore = create<ReservationState>((set, get) => ({
  reservations: [],
  loading: false,
  error: null,

  fetchReservations: async () => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) throw error;

      set({ reservations: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
      console.error('Error fetching reservations:', error);
    } finally {
      set({ loading: false });
    }
  },

  addReservation: async (reservation) => {
    try {
      set({ loading: true, error: null });

      // 予約時間の重複チェック
      const isAvailable = get().isChairAvailable(
        reservation.chair_id,
        new Date(reservation.start_time),
        new Date(reservation.end_time)
      );

      if (!isAvailable) {
        throw new Error('選択した時間帯は既に予約されています');
      }

      const { data, error } = await supabase
        .from('reservations')
        .insert([reservation])
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        reservations: [...state.reservations, data]
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      console.error('Error adding reservation:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  cancelReservation: async (id) => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        reservations: state.reservations.filter(r => r.id !== id)
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      console.error('Error canceling reservation:', error);
    } finally {
      set({ loading: false });
    }
  },

  getChairReservations: (chairId) => {
    const now = new Date();
    return get().reservations
      .filter(r => r.chair_id === chairId && isAfter(new Date(r.end_time), now))
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
      .slice(0, 2); // 最大2件まで表示
  },

  isChairAvailable: (chairId, startTime, endTime) => {
    return !get().reservations.some(r => {
      if (r.chair_id !== chairId) return false;

      const reservationStart = new Date(r.start_time);
      const reservationEnd = new Date(r.end_time);

      // 時間の重複チェック
      return (
        isWithinInterval(startTime, { start: reservationStart, end: reservationEnd }) ||
        isWithinInterval(endTime, { start: reservationStart, end: reservationEnd }) ||
        isWithinInterval(reservationStart, { start: startTime, end: endTime })
      );
    });
  },

  getCurrentReservation: (chairId) => {
    const now = new Date();
    return get().reservations.find(r => 
      r.chair_id === chairId && 
      isWithinInterval(now, { 
        start: new Date(r.start_time), 
        end: new Date(r.end_time) 
      })
    ) || null;
  }
}));