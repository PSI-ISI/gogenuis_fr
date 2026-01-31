import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

interface Reservation {
  id: number;
  clientName: string;
  clientAvatar: string;
  date: string;
  time: string;
  guests: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  amount: number;
}

interface Review {
  id: number;
  clientName: string;
  clientAvatar: string;
  rating: number;
  comment: string;
  date: string;
  replied: boolean;
}

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
export class EtablissementDashboardComponent {
  // Establishment Info
  etablissementName = 'Riad Andalous';
  etablissementType = 'Hôtel & Spa';
  etablissementRating = 4.7;
  etablissementReviews = 342;

  // Stats
  stats: StatCard[] = [
    { title: 'Réservations', value: '156', change: 12, icon: 'bi-calendar-check', color: '#1a5f7a' },
    { title: 'Revenus du mois', value: '45,800', change: 8, icon: 'bi-cash-stack', color: '#06d6a0' },
    { title: 'Taux occupation', value: '78%', change: 5, icon: 'bi-pie-chart', color: '#f4a261' },
    { title: 'Avis reçus', value: '28', change: -3, icon: 'bi-star', color: '#e76f51' }
  ];

  // Recent Reservations
  reservations: Reservation[] = [
    { id: 1, clientName: 'Ahmed Benali', clientAvatar: 'AB', date: '2026-01-30', time: '14:00', guests: 2, status: 'confirmed', amount: 1200 },
    { id: 2, clientName: 'Sarah Martin', clientAvatar: 'SM', date: '2026-01-30', time: '16:00', guests: 4, status: 'pending', amount: 2400 },
    { id: 3, clientName: 'Karim Idrissi', clientAvatar: 'KI', date: '2026-01-31', time: '10:00', guests: 1, status: 'confirmed', amount: 800 },
    { id: 4, clientName: 'Marie Dubois', clientAvatar: 'MD', date: '2026-01-31', time: '12:00', guests: 3, status: 'cancelled', amount: 1800 },
    { id: 5, clientName: 'Youssef Alami', clientAvatar: 'YA', date: '2026-02-01', time: '09:00', guests: 2, status: 'pending', amount: 1500 }
  ];

  // Recent Reviews
  reviews: Review[] = [
    { id: 1, clientName: 'Sophie Laurent', clientAvatar: 'SL', rating: 5, comment: 'Séjour exceptionnel ! Le personnel est aux petits soins.', date: '2026-01-29', replied: true },
    { id: 2, clientName: 'Omar Tazi', clientAvatar: 'OT', rating: 4, comment: 'Très bon rapport qualité-prix. Je recommande.', date: '2026-01-28', replied: false },
    { id: 3, clientName: 'Claire Petit', clientAvatar: 'CP', rating: 5, comment: 'Le spa est incroyable, moment de détente parfait.', date: '2026-01-27', replied: true }
  ];

  // Chart data (monthly revenue)
  monthlyData = [
    { month: 'Août', value: 38000 },
    { month: 'Sep', value: 42000 },
    { month: 'Oct', value: 35000 },
    { month: 'Nov', value: 48000 },
    { month: 'Déc', value: 52000 },
    { month: 'Jan', value: 45800 }
  ];

  // Quick Actions
  quickActions = [
    { label: 'Nouvelle offre', icon: 'bi-plus-circle', color: '#1a5f7a' },
    { label: 'Gérer chambres', icon: 'bi-door-open', color: '#06d6a0' },
    { label: 'Répondre avis', icon: 'bi-chat-dots', color: '#f4a261' },
    { label: 'Voir rapport', icon: 'bi-file-earmark-bar-graph', color: '#7209b7' }
  ];

  constructor() {}

  ngOnInit(): void {}

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
    { id: 'hebergement', name: 'Hébergement', icon: 'bi-house-door' },
    { id: 'restaurant', name: 'Restaurant', icon: 'bi-cup-hot' },
    { id: 'spa', name: 'Spa & Bien-être', icon: 'bi-droplet' },
    { id: 'activite', name: 'Activité', icon: 'bi-bicycle' },
    { id: 'package', name: 'Package', icon: 'bi-gift' },
    { id: 'evenement', name: 'Événement', icon: 'bi-calendar-event' }
  ];

  previewImages = [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400',
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400',
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
    console.log(this.currentOfferStep);
    
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
    
    // Simulate API call
    setTimeout(() => {
      this.isSubmitting = false;
      this.offerCreated = true;
      
      // Auto close after success
      setTimeout(() => {
        this.closeOfferModal();
      }, 3000);
    }, 2000);
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

  getStatusClass(status: string): string {
    return status;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'confirmed': 'Confirmée',
      'pending': 'En attente',
      'cancelled': 'Annulée'
    };
    return labels[status] || status;
  }

  getMaxValue(): number {
    return Math.max(...this.monthlyData.map(d => d.value));
  }

  getBarHeight(value: number): number {
    return (value / this.getMaxValue()) * 100;
  }

  getRatingStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }
}
