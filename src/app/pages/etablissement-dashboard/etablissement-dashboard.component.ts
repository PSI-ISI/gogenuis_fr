import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { 
  EtablissementDashboardService, 
  EtablissementInfo, 
  Reservation, 
  DashboardStats,
  MonthlyRevenue 
} from '../../sevices/etablissement-dashboard.service';
import { OffersService } from '../../sevices/offers.service';

interface StatCard {
  title: string;
  value: string;
  change: number;
  icon: string;
  color: string;
}

interface NewOffer {
  title: string;
  description: string;
  originalPrice: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate: string;
  endDate: string;
  category: string;
  conditions: string;
  maxUsage: number;
  image: string | null;
}

@Component({
  selector: 'app-etablissement-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './etablissement-dashboard.component.html',
  styleUrl: './etablissement-dashboard.component.css'
})
export class EtablissementDashboardComponent implements OnInit, OnDestroy {
  
  // État de chargement
  isLoading = true;
  
  // Infos établissement
  etablissementId = '';
  etablissementName = 'Mon Établissement';
  etablissementType = 'Hôtel';
  etablissementRating = 0;
  etablissementReviews = 0;

  // Stats
  stats: StatCard[] = [];
  
  // Réservations
  reservations: Reservation[] = [];
  
  // Revenus mensuels
  monthlyData: MonthlyRevenue[] = [];
  
  // Quick Actions
  quickActions = [
    { label: 'Nouvelle offre', icon: 'bi-plus-circle', color: '#1a5f7a' },
    { label: 'Gérer services', icon: 'bi-gear', color: '#06d6a0' },
    { label: 'Voir rapport', icon: 'bi-file-earmark-bar-graph', color: '#7209b7' }
  ];
  
  // Occupation
  occupancy = { value: 0, occupied: 0, available: 0, total: 0 };

  // Subscriptions
  private subscriptions: Subscription[] = [];

  constructor(
    private dashboardService: EtablissementDashboardService,
    private offersService: OffersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Charger les données du dashboard depuis l'API
   */
  loadDashboardData(): void {
    this.isLoading = true;
    
    const sub = this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        // Infos établissement
        this.etablissementId = data.etablissement.id;
        this.etablissementName = data.etablissement.name;
        this.etablissementType = data.etablissement.type;
        this.etablissementRating = data.etablissement.rating;
        this.etablissementReviews = data.etablissement.reviewCount;
        
        // Stocker l'ID pour les appels API
        localStorage.setItem('etablissement_id', this.etablissementId);
        
        // Stats
        this.buildStats(data.stats);
        
        // Occupation
        this.occupancy = data.stats.occupancy;
        
        // Réservations récentes
        this.reservations = data.recentReservations;
        
        // Revenus mensuels
        this.monthlyData = data.monthlyRevenue;
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur chargement dashboard:', error);
        this.isLoading = false;
      }
    });
    
    this.subscriptions.push(sub);
  }

  /**
   * Construire les cartes de statistiques
   */
  private buildStats(stats: DashboardStats): void {
    this.stats = [
      { 
        title: 'Réservations', 
        value: stats.reservations.value.toString(), 
        change: stats.reservations.change, 
        icon: 'bi-calendar-check', 
        color: '#1a5f7a' 
      },
      // { 
      //   title: 'Revenus du mois', 
      //   value: this.formatNumber(stats.revenue.value), 
      //   change: stats.revenue.change, 
      //   icon: 'bi-cash-stack', 
      //   color: '#06d6a0' 
      // },
      // { 
      //   title: 'Taux occupation', 
      //   value: stats.occupancy.value + '%', 
      //   change: 5, 
      //   icon: 'bi-pie-chart', 
      //   color: '#f4a261' 
      // },
      { 
        title: 'En attente', 
        value: stats.pending.toString(), 
        change: 0, 
        icon: 'bi-hourglass-split', 
        color: '#e76f51' 
      }
    ];
  }

  /**
   * Confirmer une réservation
   */
  confirmReservation(reservation: Reservation): void {
    const sub = this.dashboardService.confirmReservation(this.etablissementId, reservation.id).subscribe({
      next: (success) => {
        if (success) {
          reservation.status = 'confirmed';
          reservation.statusLabel = 'Confirmée';
          // Rafraîchir les stats
          this.refreshStats();
        }
      },
      error: (err) => console.error('Erreur confirmation:', err)
    });
    this.subscriptions.push(sub);
  }

  /**
   * Annuler une réservation
   */
  cancelReservation(reservation: Reservation): void {
    if (confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      const sub = this.dashboardService.cancelReservation(this.etablissementId, reservation.id).subscribe({
        next: (success) => {
          if (success) {
            reservation.status = 'cancelled';
            reservation.statusLabel = 'Annulée';
            // Rafraîchir les stats
            this.refreshStats();
          }
        },
        error: (err) => console.error('Erreur annulation:', err)
      });
      this.subscriptions.push(sub);
    }
  }

  /**
   * Marquer comme terminée
   */
  completeReservation(reservation: Reservation): void {
    const sub = this.dashboardService.updateReservationStatus(this.etablissementId, reservation.id, 'COMPLETED').subscribe({
      next: (success) => {
        if (success) {
          reservation.status = 'completed';
          reservation.statusLabel = 'Terminée';
        }
      }
    });
    this.subscriptions.push(sub);
  }

  /**
   * Rafraîchir les statistiques
   */
  private refreshStats(): void {
    const sub = this.dashboardService.getStats(this.etablissementId).subscribe({
      next: (stats) => this.buildStats(stats)
    });
    this.subscriptions.push(sub);
  }

  // ==================== MODAL NOUVELLE OFFRE ====================
  
  showOfferModal = false;
  currentOfferStep = 1;
  totalOfferSteps = 4;
  isSubmitting = false;
  offerCreated = false;
  
  newOffer: NewOffer = {
    title: '',
    description: '',
    originalPrice: 0,
    discountType: 'percentage',
    discountValue: 0,
    startDate: '',
    endDate: '',
    category: '',
    conditions: '',
    maxUsage: 0,
    image: null
  };

  offerCategories = [
    { id: 'sejour', name: 'Séjour', icon: 'bi-house-heart' },
    { id: 'restaurant', name: 'Restaurant', icon: 'bi-cup-hot' },
    { id: 'spa', name: 'Spa & Bien-être', icon: 'bi-droplet' },
    { id: 'activite', name: 'Activité', icon: 'bi-bicycle' },
    { id: 'transport', name: 'Transport', icon: 'bi-car-front' },
    { id: 'evenement', name: 'Événement', icon: 'bi-calendar-event' }
  ];

  previewImages = [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
    'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400',
    'https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=400',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400'
  ];

  openOfferModal(): void {
    this.showOfferModal = true;
    this.currentOfferStep = 1;
    this.offerCreated = false;
    this.resetOfferForm();
    document.body.style.overflow = 'hidden';
  }

  closeOfferModal(): void {
    this.showOfferModal = false;
    document.body.style.overflow = '';
  }

  resetOfferForm(): void {
    this.newOffer = {
      title: '',
      description: '',
      originalPrice: 0,
      discountType: 'percentage',
      discountValue: 0,
      startDate: '',
      endDate: '',
      category: '',
      conditions: '',
      maxUsage: 0,
      image: null
    };
  }

  nextOfferStep(): void {
    if (this.currentOfferStep < this.totalOfferSteps) {
      this.currentOfferStep++;
    }
  }

  prevOfferStep(): void {
    if (this.currentOfferStep > 1) {
      this.currentOfferStep--;
    }
  }

  goToOfferStep(step: number): void {
    if (step <= this.currentOfferStep) {
      this.currentOfferStep = step;
    }
  }

  canProceedOffer(): boolean {
    switch (this.currentOfferStep) {
      case 1:
        return (this.newOffer.title?.length || 0) >= 3 && this.newOffer?.category !== '';
      case 2:
        return this.newOffer?.originalPrice > 0 && this.newOffer?.discountValue > 0;
      case 3:
        return this.newOffer?.startDate !== '' && this.newOffer?.endDate !== '';
      case 4:
        return true;
      default:
        return false;
    }
  }

  selectCategory(categoryId: string): void {
    this.newOffer.category = categoryId;
  }

  selectPreviewImage(imageUrl: string): void {
    this.newOffer.image = imageUrl;
  }

  calculateFinalPrice(): number {
    if (this.newOffer.discountType === 'percentage') {
      return this.newOffer.originalPrice * (1 - this.newOffer.discountValue / 100);
    } else {
      return Math.max(0, this.newOffer.originalPrice - this.newOffer.discountValue);
    }
  }

  calculateSavings(): number {
    return this.newOffer.originalPrice - this.calculateFinalPrice();
  }

  submitOffer(): void {
    this.isSubmitting = true;
    
    // Créer l'offre via le service
    setTimeout(() => {
      this.offersService.createOffer({
        title: this.newOffer.title,
        description: this.newOffer.description,
        category: this.newOffer.category,
        originalPrice: this.newOffer.originalPrice,
        discountType: this.newOffer.discountType,
        discountValue: this.newOffer.discountValue,
        startDate: this.newOffer.startDate,
        endDate: this.newOffer.endDate,
        maxUsage: this.newOffer.maxUsage || null,
        conditions: this.newOffer.conditions,
        image: this.newOffer.image || ''
      });
      
      this.isSubmitting = false;
      this.offerCreated = true;
    }, 1000);
  }

  viewCreatedOffer(): void {
    this.closeOfferModal();
    this.router.navigate(['/offers']);
  }

  getCategoryName(categoryId: string): string {
    const cat = this.offerCategories.find(c => c.id === categoryId);
    return cat ? cat.name : '';
  }

  getCategoryIcon(categoryId: string): string {
    const cat = this.offerCategories.find(c => c.id === categoryId);
    return cat ? cat.icon : 'bi-tag';
  }

  getOfferStepTitle(): string {
    const titles = [
      'Informations de base',
      'Prix et réduction',
      'Période de validité',
      'Aperçu et confirmation'
    ];
    return titles[this.currentOfferStep - 1];
  }

  // ==================== HELPERS ====================

  getStatusClass(status: string): string {
    return status;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'confirmed': 'Confirmée',
      'pending': 'En attente',
      'cancelled': 'Annulée',
      'completed': 'Terminée'
    };
    return labels[status] || status;
  }

  getMaxValue(): number {
    if (!this.monthlyData || this.monthlyData.length === 0) return 1;
    return Math.max(...this.monthlyData.map(d => d.value));
  }

  getBarHeight(value: number): number {
    const max = this.getMaxValue();
    return max > 0 ? (value / max) * 100 : 0;
  }

  getRatingStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }

  formatNumber(num: number): string {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace('.0', '') + 'k';
    }
    return num.toString();
  }
}