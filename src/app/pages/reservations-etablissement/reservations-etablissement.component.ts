import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface Reservation {
  id: string;
  clientName: string;
  clientAvatar: string;
  clientEmail: string;
  clientPhone: string;
  date: string;
  time: string;
  guests: number;
  amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  type: string;
  notes: string;
  createdAt: string;
}

@Component({
  selector: 'app-reservations-etablissement',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reservations-etablissement.component.html',
  styleUrls: ['./reservations-etablissement.component.css']
})
export class ReservationsEtablissementComponent implements OnInit {

  // Data
  reservations: Reservation[] = [];
  filteredReservations: Reservation[] = [];

  // Filters
  searchQuery = '';
  selectedStatus = 'all';
  selectedType = 'all';
  selectedPeriod = 'all';
  sortBy = 'date-desc';

  // Stats
  stats = {
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    totalRevenue: 0
  };

  // Modal
  showDetailModal = false;
  showConfirmModal = false;
  selectedReservation: Reservation | null = null;
  confirmAction: 'confirm' | 'cancel' | 'complete' | null = null;

  // Types de réservation
  reservationTypes = [
    { id: 'sejour', name: 'Séjour', icon: 'bi-house-heart' },
    { id: 'restaurant', name: 'Restaurant', icon: 'bi-cup-hot' },
    { id: 'spa', name: 'Spa', icon: 'bi-droplet' },
    { id: 'activite', name: 'Activité', icon: 'bi-bicycle' },
    { id: 'evenement', name: 'Événement', icon: 'bi-calendar-event' }
  ];

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    // Charger depuis localStorage ou utiliser les données démo
    const stored = localStorage.getItem('gogenius_etablissement_reservations');
    if (stored) {
      this.reservations = JSON.parse(stored);
    } else {
      this.initDemoData();
    }
    this.applyFilters();
    this.calculateStats();
  }

  private initDemoData(): void {
    const today = new Date();
    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    this.reservations = [
      {
        id: 'res_001',
        clientName: 'Ahmed Benali',
        clientAvatar: 'AB',
        clientEmail: 'ahmed.benali@email.com',
        clientPhone: '+212 6 12 34 56 78',
        date: formatDate(today),
        time: '14:00',
        guests: 2,
        amount: 1200,
        status: 'confirmed',
        type: 'sejour',
        notes: 'Chambre avec vue sur la piscine',
        createdAt: new Date(today.getTime() - 86400000 * 2).toISOString()
      },
      {
        id: 'res_002',
        clientName: 'Sarah Martin',
        clientAvatar: 'SM',
        clientEmail: 'sarah.martin@email.com',
        clientPhone: '+33 6 98 76 54 32',
        date: formatDate(today),
        time: '19:30',
        guests: 4,
        amount: 450,
        status: 'pending',
        type: 'restaurant',
        notes: 'Table en terrasse si possible',
        createdAt: new Date(today.getTime() - 86400000).toISOString()
      },
      {
        id: 'res_003',
        clientName: 'Karim Idrissi',
        clientAvatar: 'KI',
        clientEmail: 'karim.idrissi@email.com',
        clientPhone: '+212 6 11 22 33 44',
        date: formatDate(new Date(today.getTime() + 86400000)),
        time: '10:00',
        guests: 1,
        amount: 350,
        status: 'confirmed',
        type: 'spa',
        notes: 'Massage relaxant 1h',
        createdAt: new Date(today.getTime() - 86400000 * 3).toISOString()
      },
      {
        id: 'res_004',
        clientName: 'Marie Dubois',
        clientAvatar: 'MD',
        clientEmail: 'marie.dubois@email.com',
        clientPhone: '+33 6 55 44 33 22',
        date: formatDate(new Date(today.getTime() + 86400000)),
        time: '12:00',
        guests: 6,
        amount: 890,
        status: 'pending',
        type: 'restaurant',
        notes: 'Anniversaire - prévoir un gâteau',
        createdAt: new Date(today.getTime() - 43200000).toISOString()
      },
      {
        id: 'res_005',
        clientName: 'Youssef Alami',
        clientAvatar: 'YA',
        clientEmail: 'youssef.alami@email.com',
        clientPhone: '+212 6 77 88 99 00',
        date: formatDate(new Date(today.getTime() + 86400000 * 2)),
        time: '09:00',
        guests: 2,
        amount: 2400,
        status: 'confirmed',
        type: 'sejour',
        notes: 'Suite junior pour 3 nuits',
        createdAt: new Date(today.getTime() - 86400000 * 5).toISOString()
      },
      {
        id: 'res_006',
        clientName: 'Emma Laurent',
        clientAvatar: 'EL',
        clientEmail: 'emma.laurent@email.com',
        clientPhone: '+33 6 12 12 12 12',
        date: formatDate(new Date(today.getTime() - 86400000)),
        time: '15:00',
        guests: 2,
        amount: 280,
        status: 'completed',
        type: 'spa',
        notes: '',
        createdAt: new Date(today.getTime() - 86400000 * 4).toISOString()
      },
      {
        id: 'res_007',
        clientName: 'Omar Fassi',
        clientAvatar: 'OF',
        clientEmail: 'omar.fassi@email.com',
        clientPhone: '+212 6 33 44 55 66',
        date: formatDate(new Date(today.getTime() - 86400000 * 2)),
        time: '20:00',
        guests: 8,
        amount: 1200,
        status: 'completed',
        type: 'restaurant',
        notes: 'Dîner d\'affaires',
        createdAt: new Date(today.getTime() - 86400000 * 6).toISOString()
      },
      {
        id: 'res_008',
        clientName: 'Sophie Petit',
        clientAvatar: 'SP',
        clientEmail: 'sophie.petit@email.com',
        clientPhone: '+33 6 99 88 77 66',
        date: formatDate(new Date(today.getTime() - 86400000 * 3)),
        time: '11:00',
        guests: 1,
        amount: 180,
        status: 'cancelled',
        type: 'activite',
        notes: 'Cours de cuisine annulé',
        createdAt: new Date(today.getTime() - 86400000 * 7).toISOString()
      },
      {
        id: 'res_009',
        clientName: 'Hassan Berrada',
        clientAvatar: 'HB',
        clientEmail: 'hassan.berrada@email.com',
        clientPhone: '+212 6 22 33 44 55',
        date: formatDate(new Date(today.getTime() + 86400000 * 3)),
        time: '16:00',
        guests: 4,
        amount: 560,
        status: 'pending',
        type: 'activite',
        notes: 'Excursion dans la palmeraie',
        createdAt: new Date(today.getTime() - 21600000).toISOString()
      },
      {
        id: 'res_010',
        clientName: 'Isabelle Moreau',
        clientAvatar: 'IM',
        clientEmail: 'isabelle.moreau@email.com',
        clientPhone: '+33 6 44 55 66 77',
        date: formatDate(new Date(today.getTime() + 86400000 * 5)),
        time: '18:00',
        guests: 2,
        amount: 3200,
        status: 'confirmed',
        type: 'sejour',
        notes: 'Lune de miel - Suite prestige',
        createdAt: new Date(today.getTime() - 86400000 * 10).toISOString()
      }
    ];

    this.saveReservations();
  }

  private saveReservations(): void {
    localStorage.setItem('gogenius_etablissement_reservations', JSON.stringify(this.reservations));
  }

  // ==================== FILTERS ====================

  applyFilters(): void {
    let result = [...this.reservations];

    // Search
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(r =>
        r.clientName.toLowerCase().includes(query) ||
        r.clientEmail.toLowerCase().includes(query) ||
        r.clientPhone.includes(query) ||
        r.id.toLowerCase().includes(query)
      );
    }

    // Status
    if (this.selectedStatus !== 'all') {
      result = result.filter(r => r.status === this.selectedStatus);
    }

    // Type
    if (this.selectedType !== 'all') {
      result = result.filter(r => r.type === this.selectedType);
    }

    // Period
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (this.selectedPeriod !== 'all') {
      result = result.filter(r => {
        const resDate = new Date(r.date);
        resDate.setHours(0, 0, 0, 0);
        
        switch (this.selectedPeriod) {
          case 'today':
            return resDate.getTime() === today.getTime();
          case 'tomorrow':
            const tomorrow = new Date(today.getTime() + 86400000);
            return resDate.getTime() === tomorrow.getTime();
          case 'week':
            const weekEnd = new Date(today.getTime() + 86400000 * 7);
            return resDate >= today && resDate <= weekEnd;
          case 'month':
            return resDate.getMonth() === today.getMonth() && resDate.getFullYear() === today.getFullYear();
          case 'past':
            return resDate < today;
          default:
            return true;
        }
      });
    }

    // Sort
    result.sort((a, b) => {
      switch (this.sortBy) {
        case 'date-asc':
          return new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime();
        case 'date-desc':
          return new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime();
        case 'amount-asc':
          return a.amount - b.amount;
        case 'amount-desc':
          return b.amount - a.amount;
        case 'name':
          return a.clientName.localeCompare(b.clientName);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    this.filteredReservations = result;
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = 'all';
    this.selectedType = 'all';
    this.selectedPeriod = 'all';
    this.sortBy = 'date-desc';
    this.applyFilters();
  }

  // ==================== STATS ====================

  calculateStats(): void {
    this.stats = {
      total: this.reservations.length,
      pending: this.reservations.filter(r => r.status === 'pending').length,
      confirmed: this.reservations.filter(r => r.status === 'confirmed').length,
      completed: this.reservations.filter(r => r.status === 'completed').length,
      cancelled: this.reservations.filter(r => r.status === 'cancelled').length,
      totalRevenue: this.reservations
        .filter(r => r.status === 'confirmed' || r.status === 'completed')
        .reduce((sum, r) => sum + r.amount, 0)
    };
  }

  // ==================== ACTIONS ====================

  confirmReservation(reservation: Reservation): void {
    this.selectedReservation = reservation;
    this.confirmAction = 'confirm';
    this.showConfirmModal = true;
  }

  cancelReservation(reservation: Reservation): void {
    this.selectedReservation = reservation;
    this.confirmAction = 'cancel';
    this.showConfirmModal = true;
  }

  completeReservation(reservation: Reservation): void {
    this.selectedReservation = reservation;
    this.confirmAction = 'complete';
    this.showConfirmModal = true;
  }

  executeAction(): void {
    if (!this.selectedReservation || !this.confirmAction) return;

    const index = this.reservations.findIndex(r => r.id === this.selectedReservation!.id);
    if (index === -1) return;

    switch (this.confirmAction) {
      case 'confirm':
        this.reservations[index].status = 'confirmed';
        break;
      case 'cancel':
        this.reservations[index].status = 'cancelled';
        break;
      case 'complete':
        this.reservations[index].status = 'completed';
        break;
    }

    this.saveReservations();
    this.applyFilters();
    this.calculateStats();
    this.closeConfirmModal();
  }

  // ==================== MODALS ====================

  openDetailModal(reservation: Reservation): void {
    this.selectedReservation = reservation;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedReservation = null;
  }

  closeConfirmModal(): void {
    this.showConfirmModal = false;
    this.selectedReservation = null;
    this.confirmAction = null;
  }

  // ==================== HELPERS ====================

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      cancelled: 'Annulée',
      completed: 'Terminée'
    };
    return labels[status] || status;
  }

  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      pending: 'bi-clock',
      confirmed: 'bi-check-circle',
      cancelled: 'bi-x-circle',
      completed: 'bi-check-all'
    };
    return icons[status] || 'bi-circle';
  }

  getTypeLabel(type: string): string {
    const found = this.reservationTypes.find(t => t.id === type);
    return found ? found.name : type;
  }

  getTypeIcon(type: string): string {
    const found = this.reservationTypes.find(t => t.id === type);
    return found ? found.icon : 'bi-tag';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'short', 
      day: '2-digit', 
      month: 'short' 
    });
  }

  formatFullDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      day: '2-digit', 
      month: 'long',
      year: 'numeric'
    });
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  isToday(dateString: string): boolean {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  isTomorrow(dateString: string): boolean {
    const date = new Date(dateString);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.toDateString() === tomorrow.toDateString();
  }

  isPast(dateString: string): boolean {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }

  getActionMessage(): string {
    if (!this.confirmAction) return '';
    const messages: { [key: string]: string } = {
      confirm: 'confirmer cette réservation',
      cancel: 'annuler cette réservation',
      complete: 'marquer cette réservation comme terminée'
    };
    return messages[this.confirmAction];
  }

  getActionButtonClass(): string {
    if (!this.confirmAction) return 'btn-primary';
    const classes: { [key: string]: string } = {
      confirm: 'btn-success',
      cancel: 'btn-danger',
      complete: 'btn-primary'
    };
    return classes[this.confirmAction];
  }

  // Reset demo data
  resetDemoData(): void {
    localStorage.removeItem('gogenius_etablissement_reservations');
    this.initDemoData();
    this.applyFilters();
    this.calculateStats();
  }
}