import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface StatCard {
  title: string;
  value: string;
  change: number;
  icon: string;
  color: string;
  filter?: string;
}

interface Reservation {
  id: string;
  clientName: string;
  clientAvatar: string;
  clientEmail: string;
  clientPhone: string;
  type: string;
  date: string;
  time: string;
  guests: number;
  amount: number;
  status: string;
  notes: string;
  createdAt: string;
}

interface Offer {
  id: string;
  title: string;
  category: string;
  originalPrice: number;
  discountType: string;
  discountValue: number;
  finalPrice: number;
  startDate: string;
  endDate: string;
  status: string;
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
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './etablissement-dashboard.component.html',
  styleUrl: './etablissement-dashboard.component.css'
})
export class EtablissementDashboardComponent implements OnInit {
  
  // Storage Keys
  private readonly RESERVATIONS_KEY = 'gogenius_etablissement_reservations';
  private readonly OFFERS_KEY = 'gogenius_offers';

  // État de chargement
  isLoading = true;
  
  // Infos établissement (depuis localStorage user)
  etablissementName = '';
  etablissementType = 'Restaurant';
  userName = '';

  // Stats
  stats: StatCard[] = [];
  
  // Réservations
  reservations: Reservation[] = [];
  recentReservations: Reservation[] = [];
  
  // Offres
  offers: Offer[] = [];
  
  // Quick Actions
  quickActions = [
    { label: 'Nouvelle offre', icon: 'bi-plus-circle', color: '#1a5f7a', action: 'offer' },
    { label: 'Voir réservations', icon: 'bi-calendar-check', color: '#06d6a0', action: 'reservations' },
    { label: 'Gérer offres', icon: 'bi-tag', color: '#7209b7', action: 'offers' }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.loadDashboardData();
  }

  /**
   * Charger les infos utilisateur depuis localStorage
   */
  loadUserInfo(): void {
    this.userName = localStorage.getItem('fullname') || 'Utilisateur';
    this.etablissementName = localStorage.getItem('company') || 'Mon Établissement';
    
    // Si pas de company, utiliser le nom complet
    if (!this.etablissementName || this.etablissementName === 'null') {
      this.etablissementName = this.userName;
    }
  }

  /**
   * Charger les données du dashboard depuis localStorage
   */
  loadDashboardData(): void {
    this.isLoading = true;
    
    // Charger les réservations
    this.loadReservations();
    
    // Charger les offres
    this.loadOffers();
    
    // Construire les stats
    this.buildStats();
    
    // Simuler un délai de chargement
    setTimeout(() => {
      this.isLoading = false;
    }, 300);
  }

  /**
   * Charger les réservations depuis localStorage
   */
  private loadReservations(): void {
    const stored = localStorage.getItem(this.RESERVATIONS_KEY);
    
    if (stored) {
      this.reservations = JSON.parse(stored);
    } else {
      // Initialiser avec des données démo
      this.initDemoReservations();
    }
    
    // Trier par date et prendre les 5 plus récentes
    this.recentReservations = [...this.reservations]
      .filter(r => r.status !== 'cancelled')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }

  /**
   * Charger les offres depuis localStorage
   */
  private loadOffers(): void {
    const stored = localStorage.getItem(this.OFFERS_KEY);
    
    if (stored) {
      this.offers = JSON.parse(stored);
    } else {
      this.offers = [];
    }
  }

  /**
   * Construire les cartes de statistiques
   */
  private buildStats(): void {
    const totalReservations = this.reservations.length;
    const pendingCount = this.reservations.filter(r => r.status === 'pending').length;
    const confirmedCount = this.reservations.filter(r => r.status === 'confirmed').length;
    const completedCount = this.reservations.filter(r => r.status === 'completed').length;
    
    // Calculer le revenu (confirmées + terminées)
    const revenue = this.reservations
      .filter(r => r.status === 'confirmed' || r.status === 'completed')
      .reduce((sum, r) => sum + r.amount, 0);
    
    // Offres actives
    const activeOffers = this.offers.filter(o => o.status === 'active').length;

    this.stats = [
      { 
        title: 'Réservations', 
        value: totalReservations.toString(), 
        change: 12, 
        icon: 'bi-calendar-check', 
        color: '#1a5f7a',
        filter: 'all'
      },
      { 
        title: 'En attente', 
        value: pendingCount.toString(), 
        change: pendingCount > 0 ? -5 : 0, 
        icon: 'bi-hourglass-split', 
        color: '#f59e0b',
        filter: 'pending'
      },
      { 
        title: 'Confirmées', 
        value: confirmedCount.toString(), 
        change: 8, 
        icon: 'bi-check-circle', 
        color: '#10b981',
        filter: 'confirmed'
      },
      { 
        title: 'Revenus', 
        value: this.formatCurrency(revenue), 
        change: 15, 
        icon: 'bi-cash-stack', 
        color: '#8b5cf6',
        filter: 'revenue'
      }
    ];
  }

  /**
   * Confirmer une réservation
   */
  confirmReservation(reservation: Reservation): void {
    const index = this.reservations.findIndex(r => r.id === reservation.id);
    if (index !== -1) {
      this.reservations[index].status = 'confirmed';
      this.saveReservations();
      this.buildStats();
      this.loadReservations();
      console.log('[Dashboard] Réservation confirmée:', reservation.id);
    }
  }

  /**
   * Annuler une réservation
   */
  cancelReservation(reservation: Reservation): void {
    if (confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      const index = this.reservations.findIndex(r => r.id === reservation.id);
      if (index !== -1) {
        this.reservations[index].status = 'cancelled';
        this.saveReservations();
        this.buildStats();
        this.loadReservations();
        console.log('[Dashboard] Réservation annulée:', reservation.id);
      }
    }
  }

  /**
   * Marquer comme terminée
   */
  completeReservation(reservation: Reservation): void {
    const index = this.reservations.findIndex(r => r.id === reservation.id);
    if (index !== -1) {
      this.reservations[index].status = 'completed';
      this.saveReservations();
      this.buildStats();
      this.loadReservations();
      console.log('[Dashboard] Réservation terminée:', reservation.id);
    }
  }

  /**
   * Sauvegarder les réservations dans localStorage
   */
  private saveReservations(): void {
    localStorage.setItem(this.RESERVATIONS_KEY, JSON.stringify(this.reservations));
  }

  /**
   * Navigation vers les réservations avec filtre
   */
  navigateToReservations(filter?: string): void {
    if (filter && filter !== 'revenue') {
      this.router.navigate(['/reservations-etablissement'], { queryParams: { status: filter } });
    } else {
      this.router.navigate(['/reservations-etablissement']);
    }
  }

  /**
   * Exécuter une action rapide
   */
  executeQuickAction(action: string): void {
    switch (action) {
      case 'offer':
        this.openOfferModal();
        break;
      case 'reservations':
        this.router.navigate(['/reservations-etablissement']);
        break;
      case 'offers':
        this.router.navigate(['/offers']);
        break;
    }
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
    
    // Créer l'offre et sauvegarder dans localStorage
    setTimeout(() => {
      const newOffer = {
        id: 'offer_' + Date.now(),
        title: this.newOffer.title,
        description: this.newOffer.description,
        category: this.newOffer.category,
        originalPrice: this.newOffer.originalPrice,
        discountType: this.newOffer.discountType,
        discountValue: this.newOffer.discountValue,
        finalPrice: this.calculateFinalPrice(),
        startDate: this.newOffer.startDate,
        endDate: this.newOffer.endDate,
        maxUsage: this.newOffer.maxUsage || null,
        currentUsage: 0,
        conditions: this.newOffer.conditions,
        imageUrl: this.newOffer.image || this.previewImages[0],
        status: 'active',
        createdAt: new Date().toISOString()
      };
      
      // Charger les offres existantes et ajouter la nouvelle
      const stored = localStorage.getItem(this.OFFERS_KEY);
      const offers = stored ? JSON.parse(stored) : [];
      offers.push(newOffer);
      localStorage.setItem(this.OFFERS_KEY, JSON.stringify(offers));
      
      console.log('[Dashboard] Offre créée:', newOffer.id);
      
      this.isSubmitting = false;
      this.offerCreated = true;
      this.loadOffers();
      this.buildStats();
    }, 800);
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

  formatCurrency(amount: number): string {
    if (amount >= 1000) {
      return (amount / 1000).toFixed(1).replace('.0', '') + 'k MAD';
    }
    return amount + ' MAD';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short'
    });
  }

  // ==================== DEMO DATA ====================

  private initDemoReservations(): void {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const demoReservations: Reservation[] = [
      {
        id: 'res_001',
        clientName: 'Rachid OUAGUID',
        clientAvatar: 'RO',
        clientEmail: 'rachidouaguid@gmail.com',
        clientPhone: '+212 6 35 11 45 40',
        type: 'restaurant',
        date: today.toISOString().split('T')[0],
        time: '12:30',
        guests: 4,
        amount: 450,
        status: 'pending',
        notes: 'Table près de la fenêtre si possible',
        createdAt: new Date(today.getTime() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'res_002',
        clientName: 'Rachid OUAGUID',
        clientAvatar: 'RO',
        clientEmail: 'rachidouaguid@gmail.com',
        clientPhone: '+212 6 35 11 45 40',
        type: 'sejour',
        date: today.toISOString().split('T')[0],
        time: '14:00',
        guests: 2,
        amount: 1200,
        status: 'confirmed',
        notes: 'Chambre avec vue mer',
        createdAt: new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'res_003',
        clientName: 'Rachid OUAGUID',
        clientAvatar: 'RO',
        clientEmail: 'rachidouaguid@gmail.com',
        clientPhone: '+212 6 35 11 45 40',
        type: 'spa',
        date: tomorrow.toISOString().split('T')[0],
        time: '10:00',
        guests: 2,
        amount: 350,
        status: 'confirmed',
        notes: 'Massage en duo',
        createdAt: new Date(today.getTime() - 48 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'res_004',
        clientName: 'Rachid OUAGUID',
        clientAvatar: 'RO',
        clientEmail: 'rachidouaguid@gmail.com',
        clientPhone: '+212 6 35 11 45 40',
        type: 'restaurant',
        date: tomorrow.toISOString().split('T')[0],
        time: '20:00',
        guests: 6,
        amount: 890,
        status: 'pending',
        notes: 'Anniversaire - prévoir gâteau',
        createdAt: new Date(today.getTime() - 1 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'res_005',
        clientName: 'Rachid OUAGUID',
        clientAvatar: 'RO',
        clientEmail: 'rachidouaguid@gmail.com',
        clientPhone: '+212 6 35 11 45 40',
        type: 'activite',
        date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '09:00',
        guests: 4,
        amount: 560,
        status: 'completed',
        notes: 'Excursion Atlas',
        createdAt: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    this.reservations = demoReservations;
    this.saveReservations();
    console.log('[Dashboard] Demo reservations initialized');
  }
}