// src/app/models/reservation.model.ts

export interface Reservation {
  id: string;
  establishmentName: string;
  type: ReservationType;
  typeDisplayName: string;
  reservationDate: string; // ISO date string
  reservationTime: string; // HH:mm format
  numberOfPersons: number;
  price: number | null;
  location: string;
  status: ReservationStatus;
  statusDisplayName: string;
  notes?: string;
  confirmationCode: string;
  createdAt: string;
  updatedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

export type ReservationType = 'HOTEL' | 'RESTAURANT' | 'SPA' | 'ACTIVITY' | 'TRANSPORT';
export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

export interface CreateReservationRequest {
  establishmentName: string;
  type: ReservationType;
  reservationDate: string;
  reservationTime: string;
  numberOfPersons: number;
  price?: number;
  location: string;
  notes?: string;
}

export interface UpdateReservationRequest {
  establishmentName?: string;
  type?: ReservationType;
  reservationDate?: string;
  reservationTime?: string;
  numberOfPersons?: number;
  price?: number;
  location?: string;
  notes?: string;
}

export interface CancelReservationRequest {
  reason?: string;
}

export interface ReservationStats {
  totalReservations: number;
  pendingReservations: number;
  confirmedReservations: number;
  cancelledReservations: number;
  completedReservations: number;
  upcomingReservations: number;
}

export interface ReservationTypeOption {
  value: ReservationType;
  label: string;
  icon: string;
  color: string;
}

export interface ReservationStatusOption {
  value: ReservationStatus;
  label: string;
  icon: string;
  color: string;
}

// Constantes pour les types et statuts
export const RESERVATION_TYPES: ReservationTypeOption[] = [
  { value: 'HOTEL', label: 'Hôtel', icon: 'bi-building', color: '#1a5f7a' },
  { value: 'RESTAURANT', label: 'Restaurant', icon: 'bi-cup-hot', color: '#e76f51' },
  { value: 'SPA', label: 'Spa', icon: 'bi-droplet', color: '#9b59b6' },
  { value: 'ACTIVITY', label: 'Activité', icon: 'bi-bicycle', color: '#2a9d8f' },
  { value: 'TRANSPORT', label: 'Transport', icon: 'bi-car-front', color: '#f4a261' }
];

export const RESERVATION_STATUSES: ReservationStatusOption[] = [
  { value: 'PENDING', label: 'En attente', icon: 'bi-clock', color: '#f39c12' },
  { value: 'CONFIRMED', label: 'Confirmée', icon: 'bi-check-circle', color: '#27ae60' },
  { value: 'CANCELLED', label: 'Annulée', icon: 'bi-x-circle', color: '#e74c3c' },
  { value: 'COMPLETED', label: 'Terminée', icon: 'bi-check-all', color: '#3498db' },
  { value: 'NO_SHOW', label: 'Non présenté', icon: 'bi-person-x', color: '#95a5a6' }
];

// Helper functions
export function getTypeOption(type: ReservationType): ReservationTypeOption {
  return RESERVATION_TYPES.find(t => t.value === type) || RESERVATION_TYPES[0];
}

export function getStatusOption(status: ReservationStatus): ReservationStatusOption {
  return RESERVATION_STATUSES.find(s => s.value === status) || RESERVATION_STATUSES[0];
}

export function formatReservationDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

export function formatReservationTime(timeStr: string): string {
  return timeStr.substring(0, 5); // HH:mm
}

export function isUpcoming(reservation: Reservation): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const reservationDate = new Date(reservation.reservationDate);
  return reservationDate >= today && reservation.status !== 'CANCELLED';
}

export function isPast(reservation: Reservation): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const reservationDate = new Date(reservation.reservationDate);
  return reservationDate < today;
}
