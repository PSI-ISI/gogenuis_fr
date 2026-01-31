import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  Reservation, 
  CreateReservationRequest,
  ReservationType,
  ReservationStatus,
  ReservationStats,
  RESERVATION_TYPES,
  RESERVATION_STATUSES,
  getTypeOption,
  getStatusOption
} from '../../models/reservation.model';
import { ReservationsService } from 'src/app/sevices/reservations.service';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservations.component.html',
  styleUrls: ['./reservations.component.css']
})
export class ReservationsComponent implements OnInit {

  // Data
  reservations: Reservation[] = [];
  filteredReservations: Reservation[] = [];
  stats: ReservationStats | null = null;
  
  // Options
  reservationTypes = RESERVATION_TYPES;
  reservationStatuses = RESERVATION_STATUSES;
  
  // Filters
  searchQuery = '';
  filterStatus: ReservationStatus | 'all' = 'all';
  filterType: ReservationType | 'all' = 'all';
  filterPeriod: 'all' | 'upcoming' | 'past' | 'today' | 'week' | 'month' = 'all';
  sortBy: 'date' | 'createdAt' | 'establishment' | 'status' = 'date';
  sortOrder: 'asc' | 'desc' = 'desc';
  
  // View
  viewMode: 'list' | 'cards' = 'cards';
  
  // Loading states
  isLoading = true;
  isSubmitting = false;
  
  // Modal
  showModal = false;
  modalMode: 'create' | 'edit' | 'view' | 'cancel' = 'create';
  selectedReservation: Reservation | null = null;
  
  // Form
  formData: CreateReservationRequest = {
    establishmentName: '',
    type: 'HOTEL',
    reservationDate: this.getTodayDate(),
    reservationTime: '12:00',
    numberOfPersons: 2,
    price: undefined,
    location: '',
    notes: ''
  };
  
  cancelReason = '';
  
  // Cities
  cities = [
    'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 
    'Essaouira', 'Chefchaouen', 'Ouarzazate', 'Meknès'
  ];

  constructor(
    private reservationService: ReservationsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadReservations();
    this.loadStats();
  }

  // ==================== DATA LOADING ====================

  loadReservations(): void {
    this.isLoading = true;
    this.reservationService.getAllReservations().subscribe({
      next: (data) => {
        this.reservations = data;
        this.applyFilters();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement réservations:', err);
        this.isLoading = false;
      }
    });
  }

  loadStats(): void {
    this.reservationService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur chargement stats:', err)
    });
  }

  // ==================== FILTERS ====================

  applyFilters(): void {
    let result = [...this.reservations];
    
    // Search
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(r => 
        r.establishmentName.toLowerCase().includes(query) ||
        r.location.toLowerCase().includes(query) ||
        r.confirmationCode.toLowerCase().includes(query)
      );
    }
    
    // Status filter
    if (this.filterStatus !== 'all') {
      result = result.filter(r => r.status === this.filterStatus);
    }
    
    // Type filter
    if (this.filterType !== 'all') {
      result = result.filter(r => r.type === this.filterType);
    }
    
    // Period filter
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (this.filterPeriod) {
      case 'today':
        result = result.filter(r => {
          const d = new Date(r.reservationDate);
          return d.toDateString() === today.toDateString();
        });
        break;
      case 'upcoming':
        result = result.filter(r => new Date(r.reservationDate) >= today);
        break;
      case 'past':
        result = result.filter(r => new Date(r.reservationDate) < today);
        break;
      case 'week':
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() + 7);
        result = result.filter(r => {
          const d = new Date(r.reservationDate);
          return d >= today && d <= weekEnd;
        });
        break;
      case 'month':
        const monthEnd = new Date(today);
        monthEnd.setMonth(monthEnd.getMonth() + 1);
        result = result.filter(r => {
          const d = new Date(r.reservationDate);
          return d >= today && d <= monthEnd;
        });
        break;
    }
    
    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (this.sortBy) {
        case 'date':
          comparison = new Date(a.reservationDate).getTime() - new Date(b.reservationDate).getTime();
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'establishment':
          comparison = a.establishmentName.localeCompare(b.establishmentName);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      return this.sortOrder === 'asc' ? comparison : -comparison;
    });
    
    this.filteredReservations = result;
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.filterStatus = 'all';
    this.filterType = 'all';
    this.filterPeriod = 'all';
    this.sortBy = 'date';
    this.sortOrder = 'desc';
    this.applyFilters();
  }

  // ==================== MODAL ====================

  openCreateModal(): void {
    this.modalMode = 'create';
    this.selectedReservation = null;
    this.resetForm();
    this.showModal = true;
  }

  openEditModal(reservation: Reservation): void {
    this.modalMode = 'edit';
    this.selectedReservation = reservation;
    this.formData = {
      establishmentName: reservation.establishmentName,
      type: reservation.type,
      reservationDate: reservation.reservationDate,
      reservationTime: reservation.reservationTime,
      numberOfPersons: reservation.numberOfPersons,
      price: reservation.price || undefined,
      location: reservation.location,
      notes: reservation.notes || ''
    };
    this.showModal = true;
  }

  openViewModal(reservation: Reservation): void {
    this.modalMode = 'view';
    this.selectedReservation = reservation;
    this.showModal = true;
  }

  openCancelModal(reservation: Reservation): void {
    this.modalMode = 'cancel';
    this.selectedReservation = reservation;
    this.cancelReason = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedReservation = null;
    this.cancelReason = '';
  }

  resetForm(): void {
    this.formData = {
      establishmentName: '',
      type: 'HOTEL',
      reservationDate: this.getTodayDate(),
      reservationTime: '12:00',
      numberOfPersons: 2,
      price: undefined,
      location: '',
      notes: ''
    };
  }

  // ==================== CRUD OPERATIONS ====================

  submitReservation(): void {
    if (!this.validateForm()) return;
    
    this.isSubmitting = true;
    
    if (this.modalMode === 'create') {
      this.reservationService.createReservation(this.formData).subscribe({
        next: (reservation) => {
          this.reservations.unshift(reservation);
          this.applyFilters();
          this.loadStats();
          this.closeModal();
          this.isSubmitting = false;
          this.showNotification('Réservation créée avec succès !', 'success');
        },
        error: (err) => {
          console.error('Erreur création:', err);
          this.isSubmitting = false;
          this.showNotification('Erreur lors de la création', 'error');
        }
      });
    } else if (this.modalMode === 'edit' && this.selectedReservation) {
      this.reservationService.updateReservation(this.selectedReservation.id, this.formData).subscribe({
        next: (updated) => {
          const index = this.reservations.findIndex(r => r.id === updated.id);
          if (index !== -1) {
            this.reservations[index] = updated;
          }
          this.applyFilters();
          this.closeModal();
          this.isSubmitting = false;
          this.showNotification('Réservation modifiée avec succès !', 'success');
        },
        error: (err) => {
          console.error('Erreur modification:', err);
          this.isSubmitting = false;
          this.showNotification('Erreur lors de la modification', 'error');
        }
      });
    }
  }

  confirmCancel(): void {
    if (!this.selectedReservation) return;
    
    this.isSubmitting = true;
    this.reservationService.cancelReservation(this.selectedReservation.id, this.cancelReason).subscribe({
      next: (updated) => {
        const index = this.reservations.findIndex(r => r.id === updated.id);
        if (index !== -1) {
          this.reservations[index] = updated;
        }
        this.applyFilters();
        this.loadStats();
        this.closeModal();
        this.isSubmitting = false;
        this.showNotification('Réservation annulée', 'info');
      },
      error: (err) => {
        console.error('Erreur annulation:', err);
        this.isSubmitting = false;
        this.showNotification('Erreur lors de l\'annulation', 'error');
      }
    });
  }

  deleteReservation(reservation: Reservation): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) return;
    
    this.reservationService.deleteReservation(reservation.id).subscribe({
      next: () => {
        this.reservations = this.reservations.filter(r => r.id !== reservation.id);
        this.applyFilters();
        this.loadStats();
        this.showNotification('Réservation supprimée', 'success');
      },
      error: (err) => {
        console.error('Erreur suppression:', err);
        this.showNotification('Erreur lors de la suppression', 'error');
      }
    });
  }

  // ==================== HELPERS ====================

  validateForm(): boolean {
    if (!this.formData.establishmentName.trim()) {
      this.showNotification('Le nom de l\'établissement est requis', 'error');
      return false;
    }
    if (!this.formData.location.trim()) {
      this.showNotification('La ville est requise', 'error');
      return false;
    }
    if (this.formData.numberOfPersons < 1) {
      this.showNotification('Au moins 1 personne requise', 'error');
      return false;
    }
    return true;
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  getTypeOption(type: ReservationType) {
    return getTypeOption(type);
  }

  getStatusOption(status: ReservationStatus) {
    return getStatusOption(status);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  formatTime(timeStr: string): string {
    return timeStr.substring(0, 5);
  }

  formatPrice(price: number | null): string {
    if (!price) return 'Non spécifié';
    return price.toLocaleString('fr-FR') + ' MAD';
  }

  formatDateTime(dateStr: string): string {
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  isUpcoming(reservation: Reservation): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(reservation.reservationDate) >= today;
  }

  canModify(reservation: Reservation): boolean {
    return reservation.status === 'PENDING' || reservation.status === 'CONFIRMED';
  }

  canCancel(reservation: Reservation): boolean {
    return reservation.status !== 'CANCELLED' && reservation.status !== 'COMPLETED';
  }

  trackById(index: number, reservation: Reservation): string {
    return reservation.id;
  }

  // Notification simple (à remplacer par un service toast)
  private notificationMessage = '';
  private notificationType = '';
  showNotificationFlag = false;

  showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotificationFlag = true;
    setTimeout(() => {
      this.showNotificationFlag = false;
      this.cdr.detectChanges();
    }, 3000);
  }

  getNotificationMessage(): string {
    return this.notificationMessage;
  }

  getNotificationType(): string {
    return this.notificationType;
  }
}
