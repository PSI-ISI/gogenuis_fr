// src/app/services/reservation.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { 
  Reservation, 
  CreateReservationRequest, 
  UpdateReservationRequest, 
  CancelReservationRequest,
  ReservationStats,
  ReservationType,
  ReservationStatus,
  RESERVATION_TYPES,
  RESERVATION_STATUSES
} from '../models/reservation.model';

@Injectable({
  providedIn: 'root'
})
export class ReservationsService {
  
  private readonly API_URL = 'http://localhost:2222/api/reservations';
  
  // Mode démo (sans API)
  private readonly DEMO_MODE = false;
  
  // Cache des réservations
  private reservationsSubject = new BehaviorSubject<Reservation[]>([]);
  public reservations$ = this.reservationsSubject.asObservable();

  // Données de démo
  private demoReservations: Reservation[] = [
    {
      id: '1',
      establishmentName: 'Riad Yasmine Marrakech',
      type: 'HOTEL',
      typeDisplayName: 'Hôtel',
      reservationDate: '2026-02-15',
      reservationTime: '14:00',
      numberOfPersons: 2,
      price: 1500,
      location: 'Marrakech',
      status: 'CONFIRMED',
      statusDisplayName: 'Confirmée',
      confirmationCode: 'RES-78542163',
      createdAt: '2026-01-28T10:30:00',
      notes: 'Chambre avec vue sur le patio'
    },
    {
      id: '2',
      establishmentName: 'Le Jardin Restaurant',
      type: 'RESTAURANT',
      typeDisplayName: 'Restaurant',
      reservationDate: '2026-02-10',
      reservationTime: '20:00',
      numberOfPersons: 4,
      price: 800,
      location: 'Casablanca',
      status: 'PENDING',
      statusDisplayName: 'En attente',
      confirmationCode: 'RES-78542164',
      createdAt: '2026-01-29T14:20:00'
    },
    {
      id: '3',
      establishmentName: 'Spa Essaouira Beach',
      type: 'SPA',
      typeDisplayName: 'Spa',
      reservationDate: '2026-02-20',
      reservationTime: '10:00',
      numberOfPersons: 2,
      price: 600,
      location: 'Essaouira',
      status: 'CONFIRMED',
      statusDisplayName: 'Confirmée',
      confirmationCode: 'RES-78542165',
      createdAt: '2026-01-30T09:15:00'
    },
    {
      id: '4',
      establishmentName: 'Excursion Atlas Mountains',
      type: 'ACTIVITY',
      typeDisplayName: 'Activité',
      reservationDate: '2026-03-05',
      reservationTime: '08:00',
      numberOfPersons: 3,
      price: 450,
      location: 'Imlil',
      status: 'PENDING',
      statusDisplayName: 'En attente',
      confirmationCode: 'RES-78542166',
      createdAt: '2026-01-31T16:45:00'
    },
    {
      id: '5',
      establishmentName: 'CTM Bus Marrakech-Fès',
      type: 'TRANSPORT',
      typeDisplayName: 'Transport',
      reservationDate: '2026-02-25',
      reservationTime: '07:30',
      numberOfPersons: 2,
      price: 300,
      location: 'Marrakech',
      status: 'CONFIRMED',
      statusDisplayName: 'Confirmée',
      confirmationCode: 'RES-78542167',
      createdAt: '2026-01-27T11:00:00'
    },
    {
      id: '6',
      establishmentName: 'Hotel Sofitel Rabat',
      type: 'HOTEL',
      typeDisplayName: 'Hôtel',
      reservationDate: '2026-01-20',
      reservationTime: '15:00',
      numberOfPersons: 2,
      price: 2200,
      location: 'Rabat',
      status: 'COMPLETED',
      statusDisplayName: 'Terminée',
      confirmationCode: 'RES-78542168',
      createdAt: '2026-01-10T08:30:00'
    },
    {
      id: '7',
      establishmentName: 'La Sqala Restaurant',
      type: 'RESTAURANT',
      typeDisplayName: 'Restaurant',
      reservationDate: '2026-01-15',
      reservationTime: '19:30',
      numberOfPersons: 2,
      price: 500,
      location: 'Casablanca',
      status: 'CANCELLED',
      statusDisplayName: 'Annulée',
      confirmationCode: 'RES-78542169',
      createdAt: '2026-01-05T12:00:00',
      cancelledAt: '2026-01-14T10:00:00',
      cancellationReason: 'Changement de plans'
    }
  ];

  constructor(private http: HttpClient) {
    if (this.DEMO_MODE) {
      this.reservationsSubject.next(this.demoReservations);
    }
  }

  private getHeaders(): HttpHeaders {
    // Récupérer l'utilisateur connecté depuis le localStorage
    const userStr = localStorage.getItem('user');
    let userId = '';
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        userId = user.id || user.userId || '';
      } catch (e) {
        console.error('Erreur parsing user:', e);
      }
    }
    
    // Fallback sur d'autres clés possibles
    if (!userId) {
      userId = localStorage.getItem('idUser') || localStorage.getItem('id_user') || '';
    }
    
    console.log('User ID envoyé:', userId); // Debug
    
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'X-User-Id': userId
    });
  }

  // ==================== API CALLS ====================

  /**
   * Créer une nouvelle réservation
   */
  createReservation(request: CreateReservationRequest): Observable<Reservation> {
    if (this.DEMO_MODE) {
      return this.createReservationDemo(request);
    }
    return this.http.post<Reservation>(this.API_URL, request, { headers: this.getHeaders() })
      .pipe(
        tap(reservation => {
          const current = this.reservationsSubject.value;
          this.reservationsSubject.next([reservation, ...current]);
        })
      );
  }

  /**
   * Obtenir toutes les réservations
   */
  getAllReservations(): Observable<Reservation[]> {
    if (this.DEMO_MODE) {
      return of(this.demoReservations.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    }
    return this.http.get<Reservation[]>(this.API_URL, { headers: this.getHeaders() })
      .pipe(
        tap(reservations => this.reservationsSubject.next(reservations))
      );
  }

  /**
   * Obtenir les 3 dernières réservations (pour le dashboard)
   */
  getLatestReservations(): Observable<Reservation[]> {
    if (this.DEMO_MODE) {
      const sorted = [...this.demoReservations].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      return of(sorted.slice(0, 3));
    }
    return this.http.get<Reservation[]>(`${this.API_URL}/latest`, { headers: this.getHeaders() });
  }

  /**
   * Obtenir les réservations à venir
   */
  getUpcomingReservations(): Observable<Reservation[]> {
    if (this.DEMO_MODE) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return of(this.demoReservations
        .filter(r => new Date(r.reservationDate) >= today && r.status !== 'CANCELLED')
        .sort((a, b) => new Date(a.reservationDate).getTime() - new Date(b.reservationDate).getTime())
      );
    }
    return this.http.get<Reservation[]>(`${this.API_URL}/upcoming`, { headers: this.getHeaders() });
  }

  /**
   * Obtenir les réservations passées
   */
  getPastReservations(): Observable<Reservation[]> {
    if (this.DEMO_MODE) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return of(this.demoReservations
        .filter(r => new Date(r.reservationDate) < today)
        .sort((a, b) => new Date(b.reservationDate).getTime() - new Date(a.reservationDate).getTime())
      );
    }
    return this.http.get<Reservation[]>(`${this.API_URL}/past`, { headers: this.getHeaders() });
  }

  /**
   * Obtenir une réservation par ID
   */
  getReservationById(id: string): Observable<Reservation | null> {
    if (this.DEMO_MODE) {
      const reservation = this.demoReservations.find(r => r.id === id);
      return of(reservation || null);
    }
    return this.http.get<Reservation>(`${this.API_URL}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(() => of(null)));
  }

  /**
   * Mettre à jour une réservation
   */
  updateReservation(id: string, request: UpdateReservationRequest): Observable<Reservation> {
    if (this.DEMO_MODE) {
      return this.updateReservationDemo(id, request);
    }
    return this.http.put<Reservation>(`${this.API_URL}/${id}`, request, { headers: this.getHeaders() })
      .pipe(
        tap(updated => {
          const current = this.reservationsSubject.value;
          const index = current.findIndex(r => r.id === id);
          if (index !== -1) {
            current[index] = updated;
            this.reservationsSubject.next([...current]);
          }
        })
      );
  }

  /**
   * Annuler une réservation
   */
  cancelReservation(id: string, reason?: string): Observable<Reservation> {
    if (this.DEMO_MODE) {
      return this.cancelReservationDemo(id, reason);
    }
    const request: CancelReservationRequest = { reason };
    return this.http.post<Reservation>(`${this.API_URL}/${id}/cancel`, request, { headers: this.getHeaders() })
      .pipe(
        tap(updated => {
          const current = this.reservationsSubject.value;
          const index = current.findIndex(r => r.id === id);
          if (index !== -1) {
            current[index] = updated;
            this.reservationsSubject.next([...current]);
          }
        })
      );
  }

  /**
   * Supprimer une réservation
   */
  deleteReservation(id: string): Observable<void> {
    if (this.DEMO_MODE) {
      return this.deleteReservationDemo(id);
    }
    return this.http.delete<void>(`${this.API_URL}/${id}`, { headers: this.getHeaders() })
      .pipe(
        tap(() => {
          const current = this.reservationsSubject.value;
          this.reservationsSubject.next(current.filter(r => r.id !== id));
        })
      );
  }

  /**
   * Obtenir les statistiques
   */
  getStats(): Observable<ReservationStats> {
    if (this.DEMO_MODE) {
      return this.getStatsDemo();
    }
    return this.http.get<ReservationStats>(`${this.API_URL}/stats`, { headers: this.getHeaders() });
  }

  /**
   * Rechercher des réservations
   */
  searchReservations(
    status?: ReservationStatus,
    type?: ReservationType,
    location?: string,
    startDate?: string,
    endDate?: string
  ): Observable<Reservation[]> {
    if (this.DEMO_MODE) {
      return this.searchReservationsDemo(status, type, location, startDate, endDate);
    }
    
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (type) params = params.set('type', type);
    if (location) params = params.set('location', location);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<any>(`${this.API_URL}/search`, { 
      headers: this.getHeaders(),
      params 
    }).pipe(map(response => response.content || response));
  }

  /**
   * Obtenir les types de réservation
   */
  getReservationTypes() {
    return RESERVATION_TYPES;
  }

  /**
   * Obtenir les statuts de réservation
   */
  getReservationStatuses() {
    return RESERVATION_STATUSES;
  }

  // ==================== DEMO MODE METHODS ====================

  private createReservationDemo(request: CreateReservationRequest): Observable<Reservation> {
    const typeOption = RESERVATION_TYPES.find(t => t.value === request.type);
    const newReservation: Reservation = {
      id: (this.demoReservations.length + 1).toString(),
      establishmentName: request.establishmentName,
      type: request.type,
      typeDisplayName: typeOption?.label || request.type,
      reservationDate: request.reservationDate,
      reservationTime: request.reservationTime,
      numberOfPersons: request.numberOfPersons,
      price: request.price || null,
      location: request.location,
      status: 'PENDING',
      statusDisplayName: 'En attente',
      notes: request.notes,
      confirmationCode: 'RES-' + Math.floor(Math.random() * 100000000),
      createdAt: new Date().toISOString()
    };
    this.demoReservations.unshift(newReservation);
    this.reservationsSubject.next([...this.demoReservations]);
    return of(newReservation);
  }

  private updateReservationDemo(id: string, request: UpdateReservationRequest): Observable<Reservation> {
    const index = this.demoReservations.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error('Réservation non trouvée');
    }
    
    const updated = { ...this.demoReservations[index] };
    if (request.establishmentName) updated.establishmentName = request.establishmentName;
    if (request.type) {
      updated.type = request.type;
      const typeOption = RESERVATION_TYPES.find(t => t.value === request.type);
      updated.typeDisplayName = typeOption?.label || request.type;
    }
    if (request.reservationDate) updated.reservationDate = request.reservationDate;
    if (request.reservationTime) updated.reservationTime = request.reservationTime;
    if (request.numberOfPersons) updated.numberOfPersons = request.numberOfPersons;
    if (request.price !== undefined) updated.price = request.price;
    if (request.location) updated.location = request.location;
    if (request.notes !== undefined) updated.notes = request.notes;
    updated.updatedAt = new Date().toISOString();
    
    this.demoReservations[index] = updated;
    this.reservationsSubject.next([...this.demoReservations]);
    return of(updated);
  }

  private cancelReservationDemo(id: string, reason?: string): Observable<Reservation> {
    const index = this.demoReservations.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error('Réservation non trouvée');
    }
    
    this.demoReservations[index] = {
      ...this.demoReservations[index],
      status: 'CANCELLED',
      statusDisplayName: 'Annulée',
      cancelledAt: new Date().toISOString(),
      cancellationReason: reason
    };
    this.reservationsSubject.next([...this.demoReservations]);
    return of(this.demoReservations[index]);
  }

  private deleteReservationDemo(id: string): Observable<void> {
    const index = this.demoReservations.findIndex(r => r.id === id);
    if (index !== -1) {
      this.demoReservations.splice(index, 1);
      this.reservationsSubject.next([...this.demoReservations]);
    }
    return of(void 0);
  }

  private getStatsDemo(): Observable<ReservationStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return of({
      totalReservations: this.demoReservations.length,
      pendingReservations: this.demoReservations.filter(r => r.status === 'PENDING').length,
      confirmedReservations: this.demoReservations.filter(r => r.status === 'CONFIRMED').length,
      cancelledReservations: this.demoReservations.filter(r => r.status === 'CANCELLED').length,
      completedReservations: this.demoReservations.filter(r => r.status === 'COMPLETED').length,
      upcomingReservations: this.demoReservations.filter(r => 
        new Date(r.reservationDate) >= today && r.status !== 'CANCELLED'
      ).length
    });
  }

  private searchReservationsDemo(
    status?: ReservationStatus,
    type?: ReservationType,
    location?: string,
    startDate?: string,
    endDate?: string
  ): Observable<Reservation[]> {
    let filtered = [...this.demoReservations];
    
    if (status) {
      filtered = filtered.filter(r => r.status === status);
    }
    if (type) {
      filtered = filtered.filter(r => r.type === type);
    }
    if (location) {
      filtered = filtered.filter(r => 
        r.location.toLowerCase().includes(location.toLowerCase())
      );
    }
    if (startDate) {
      filtered = filtered.filter(r => r.reservationDate >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(r => r.reservationDate <= endDate);
    }
    
    return of(filtered.sort((a, b) => 
      new Date(b.reservationDate).getTime() - new Date(a.reservationDate).getTime()
    ));
  }
}