import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

// ============ Interfaces ============

export interface EtablissementInfo {
  id: string;
  name: string;
  type: string;
  typeCode: string;
  city: string;
  address: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  logoUrl?: string;
  coverImageUrl?: string;
}

export interface Reservation {
  id: string;
  clientName: string;
  clientAvatar: string;
  clientEmail?: string;
  clientPhone?: string;
  date: string;
  time: string;
  guests: number;
  amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  statusLabel: string;
  confirmationCode?: string;
  notes?: string;
}

export interface DashboardStats {
  reservations: { value: number; change: number };
  revenue: { value: number; change: number };
  pending: number;
  confirmed: number;
  cancelled: number;
  occupancy: {
    value: number;
    occupied: number;
    available: number;
    total: number;
  };
}

export interface MonthlyRevenue {
  month: string;
  year: number;
  value: number;
}

export interface DashboardData {
  etablissement: EtablissementInfo;
  stats: DashboardStats;
  recentReservations: Reservation[];
  todayReservations: Reservation[];
  monthlyRevenue: MonthlyRevenue[];
}

// ============ Service ============

@Injectable({
  providedIn: 'root'
})
export class EtablissementDashboardService {
  
  private readonly API_URL = 'http://localhost:8080/api/etablissement';
  
  // Mode démo (sans API)
  private readonly DEMO_MODE = true;
  
  // Cache
  private etablissementSubject = new BehaviorSubject<EtablissementInfo | null>(null);
  public etablissement$ = this.etablissementSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Récupérer les données du dashboard
   */
  getDashboardData(): Observable<DashboardData> {
    if (this.DEMO_MODE) {
      return of(this.getDemoData());
    }
    
    const userId = localStorage.getItem('user_id');
    const headers = new HttpHeaders({
      'X-User-Id': userId || ''
    });
    
    return this.http.get<any>(`${this.API_URL}/dashboard`, { headers }).pipe(
      map(response => response.data),
      tap(data => this.etablissementSubject.next(data.etablissement)),
      catchError(error => {
        console.error('Error fetching dashboard:', error);
        return of(this.getDemoData());
      })
    );
  }

  /**
   * Récupérer les statistiques
   */
  getStats(etablissementId: string): Observable<DashboardStats> {
    if (this.DEMO_MODE) {
      return of(this.getDemoData().stats);
    }
    
    return this.http.get<any>(`${this.API_URL}/${etablissementId}/stats`).pipe(
      map(response => response.data),
      catchError(() => of(this.getDemoData().stats))
    );
  }

  /**
   * Récupérer les réservations récentes
   */
  getRecentReservations(etablissementId: string, limit: number = 5): Observable<Reservation[]> {
    if (this.DEMO_MODE) {
      return of(this.getDemoData().recentReservations.slice(0, limit));
    }
    
    return this.http.get<any>(`${this.API_URL}/${etablissementId}/reservations/recent?limit=${limit}`).pipe(
      map(response => response.data),
      catchError(() => of([]))
    );
  }

  /**
   * Récupérer les réservations du jour
   */
  getTodayReservations(etablissementId: string): Observable<Reservation[]> {
    if (this.DEMO_MODE) {
      return of(this.getDemoData().todayReservations);
    }
    
    return this.http.get<any>(`${this.API_URL}/${etablissementId}/reservations/today`).pipe(
      map(response => response.data),
      catchError(() => of([]))
    );
  }

  /**
   * Récupérer les réservations avec filtres
   */
  getReservations(
    etablissementId: string,
    status?: string,
    startDate?: string,
    endDate?: string,
    page: number = 0,
    size: number = 20
  ): Observable<{ content: Reservation[]; totalElements: number; totalPages: number }> {
    if (this.DEMO_MODE) {
      const all = this.getDemoData().recentReservations;
      const filtered = status ? all.filter(r => r.status === status) : all;
      return of({
        content: filtered.slice(page * size, (page + 1) * size),
        totalElements: filtered.length,
        totalPages: Math.ceil(filtered.length / size)
      });
    }
    
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (status) params = params.set('status', status);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    
    return this.http.get<any>(`${this.API_URL}/${etablissementId}/reservations`, { params }).pipe(
      map(response => response.data),
      catchError(() => of({ content: [], totalElements: 0, totalPages: 0 }))
    );
  }

  /**
   * Confirmer une réservation
   */
  confirmReservation(etablissementId: string, reservationId: string): Observable<boolean> {
    if (this.DEMO_MODE) {
      return of(true);
    }
    
    return this.http.post<any>(`${this.API_URL}/${etablissementId}/reservations/${reservationId}/confirm`, {}).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  /**
   * Annuler une réservation
   */
  cancelReservation(etablissementId: string, reservationId: string): Observable<boolean> {
    if (this.DEMO_MODE) {
      return of(true);
    }
    
    return this.http.post<any>(`${this.API_URL}/${etablissementId}/reservations/${reservationId}/cancel`, {}).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  /**
   * Mettre à jour le statut
   */
  updateReservationStatus(etablissementId: string, reservationId: string, status: string): Observable<boolean> {
    if (this.DEMO_MODE) {
      return of(true);
    }
    
    return this.http.put<any>(
      `${this.API_URL}/${etablissementId}/reservations/${reservationId}/status`,
      { status }
    ).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  // ============ DONNÉES DE DÉMO ============
  
  private getDemoData(): DashboardData {
    const today = new Date();
    const formatDate = (d: Date) => d.toISOString().split('T')[0];
    
    return {
      etablissement: {
        id: 'demo-etablissement-001',
        name: 'Riad Andalous',
        type: 'Hôtel & Spa',
        typeCode: 'HOTEL',
        city: 'Marrakech',
        address: '23 Derb El Ferrane, Médina',
        rating: 4.7,
        reviewCount: 342,
        isVerified: true,
        logoUrl: null,
        coverImageUrl: null
      },
      stats: {
        reservations: { value: 156, change: 12 },
        revenue: { value: 45800, change: 8 },
        pending: 12,
        confirmed: 134,
        cancelled: 10,
        occupancy: {
          value: 78,
          occupied: 14,
          available: 4,
          total: 18
        }
      },
      recentReservations: [
        { 
          id: '1', 
          clientName: 'Ahmed Benali', 
          clientAvatar: 'AB', 
          date: formatDate(today),
          time: '14:00', 
          guests: 2, 
          status: 'confirmed', 
          statusLabel: 'Confirmée',
          amount: 1200,
          confirmationCode: 'RES-12345678'
        },
        { 
          id: '2', 
          clientName: 'Sarah Martin', 
          clientAvatar: 'SM', 
          date: formatDate(today),
          time: '16:00', 
          guests: 4, 
          status: 'pending', 
          statusLabel: 'En attente',
          amount: 2400 
        },
        { 
          id: '3', 
          clientName: 'Karim Idrissi', 
          clientAvatar: 'KI', 
          date: formatDate(new Date(today.getTime() + 86400000)),
          time: '10:00', 
          guests: 1, 
          status: 'confirmed', 
          statusLabel: 'Confirmée',
          amount: 800 
        },
        { 
          id: '4', 
          clientName: 'Marie Dubois', 
          clientAvatar: 'MD', 
          date: formatDate(new Date(today.getTime() + 86400000)),
          time: '12:00', 
          guests: 3, 
          status: 'cancelled', 
          statusLabel: 'Annulée',
          amount: 1800 
        },
        { 
          id: '5', 
          clientName: 'Youssef Alami', 
          clientAvatar: 'YA', 
          date: formatDate(new Date(today.getTime() + 172800000)),
          time: '09:00', 
          guests: 2, 
          status: 'pending', 
          statusLabel: 'En attente',
          amount: 1500 
        }
      ],
      todayReservations: [
        { 
          id: '1', 
          clientName: 'Ahmed Benali', 
          clientAvatar: 'AB', 
          date: formatDate(today),
          time: '14:00', 
          guests: 2, 
          status: 'confirmed', 
          statusLabel: 'Confirmée',
          amount: 1200 
        },
        { 
          id: '2', 
          clientName: 'Sarah Martin', 
          clientAvatar: 'SM', 
          date: formatDate(today),
          time: '16:00', 
          guests: 4, 
          status: 'pending', 
          statusLabel: 'En attente',
          amount: 2400 
        }
      ],
      monthlyRevenue: [
        { month: 'Août', year: 2025, value: 38000 },
        { month: 'Sep', year: 2025, value: 42000 },
        { month: 'Oct', year: 2025, value: 35000 },
        { month: 'Nov', year: 2025, value: 48000 },
        { month: 'Déc', year: 2025, value: 52000 },
        { month: 'Jan', year: 2026, value: 45800 }
      ]
    };
  }
}