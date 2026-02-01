import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Subscription } from 'rxjs';

// Import du service de réservation
import { 
  Reservation as ApiReservation, 
  CreateReservationRequest,
  ReservationType,
  RESERVATION_TYPES,
  getTypeOption,
  getStatusOption
} from '../../models/reservation.model';
import { EventFavorite, EventFavoritesService } from 'src/app/sevices/eventFavoritesService';
import { ReservationsService } from 'src/app/sevices/reservations.service';

// Import du service de favoris événements

// ============ INTERFACES ============
interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  preferences: {
    categories: string[];
    budgetMax: number;
    notifications: boolean;
  };
}

interface Recommendation {
  id: number;
  name: string;
  type: string;
  image: string;
  rating: number;
  price: number;
  location: string;
  distance: string;
  isSponsor: boolean;
  matchScore: number;
}

interface BudgetItem {
  id: number;
  category: string;
  name: string;
  amount: number;
  date: Date;
  icon: string;
  color: string;
}

interface NearbyPlace {
  id: number;
  name: string;
  type: string;
  distance: number;
  rating: number;
  image: string;
  isOpen: boolean;
  isSponsor: boolean;
}

interface PlaceRecognitionResult {
  name: string;
  description: string;
  location: string;
  confidence: number;
  wikipediaUrl?: string;
  mapsUrl?: string;
}

interface Alert {
  id: number;
  type: 'budget' | 'deal' | 'reminder';
  message: string;
  icon: string;
  color: string;
  isRead: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  encapsulation: ViewEncapsulation.None,
  styles: [`
    .modal-overlay {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      margin: 0 !important;
      padding: 0 !important;
      background: rgba(0, 0, 0, 0.6) !important;
      backdrop-filter: blur(4px) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      z-index: 999999 !important;
      box-sizing: border-box !important;
    }
    .modal-overlay .modal {
      background: white !important;
      border-radius: 16px !important;
      width: calc(100% - 40px) !important;
      max-width: 500px !important;
      max-height: calc(100vh - 40px) !important;
      margin: 20px !important;
      overflow: hidden !important;
      display: flex !important;
      flex-direction: column !important;
      box-shadow: 0 25px 80px rgba(0,0,0,0.4) !important;
    }
    .modal-overlay .modal.modal-lg {
      max-width: 600px !important;
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {

  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // ============ USER PROFILE (Module 1) ============
  userProfile: UserProfile = {
    fullName: 'Jean Dupont',
    email: 'jean.dupont@email.com',
    phone: '+212 6 12 34 56 78',
    preferences: {
      categories: ['Restaurants', 'Hôtels', 'Culture'],
      budgetMax: 500,
      notifications: true
    }
  };
  userInitials = 'JD';
  showProfileModal = false;
  editingProfile: UserProfile | null = null;

  availableCategories = [
    { id: 'restaurants', name: 'Restaurants', icon: 'bi-cup-hot' },
    { id: 'hotels', name: 'Hôtels', icon: 'bi-building' },
    { id: 'culture', name: 'Culture', icon: 'bi-palette' },
    { id: 'sport', name: 'Sport', icon: 'bi-bicycle' },
    { id: 'spa', name: 'Spa & Bien-être', icon: 'bi-heart-pulse' },
    { id: 'shopping', name: 'Shopping', icon: 'bi-bag' },
    { id: 'nature', name: 'Nature', icon: 'bi-tree' }
  ];

  favorites: any[] = [];

  // ============ RECOMMENDATIONS (Module 2) ============
  recommendations: Recommendation[] = [
    { id: 1, name: 'La Table du Chef', type: 'Restaurant', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400', rating: 4.8, price: 450, location: 'Casablanca', distance: '1.2 km', isSponsor: true, matchScore: 95 },
    { id: 2, name: 'Riad Authentique', type: 'Hôtel', image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400', rating: 4.6, price: 1200, location: 'Marrakech', distance: '2.5 km', isSponsor: false, matchScore: 88 },
    { id: 3, name: 'Circuit Médina', type: 'Activité', image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=400', rating: 4.9, price: 350, location: 'Fès', distance: '0.8 km', isSponsor: true, matchScore: 92 },
    { id: 4, name: 'Café Hafa', type: 'Café', image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400', rating: 4.4, price: 80, location: 'Tanger', distance: '3.1 km', isSponsor: false, matchScore: 78 }
  ];
  selectedRecommendation: Recommendation | null = null;
  showRecommendationModal = false;

  // ============ BUDGET (Module 3) ============
  budgetTotal = 5000;
  budgetSpent = 2870;

  expenses: BudgetItem[] = [
    { id: 1, category: 'Hébergement', name: 'Hôtel Le Méditerranée', amount: 1500, date: new Date(2026, 0, 28), icon: 'bi-building', color: '#1a5f7a' },
    { id: 2, category: 'Restaurant', name: 'Dîner La Terrasse', amount: 650, date: new Date(2026, 0, 29), icon: 'bi-cup-hot', color: '#f4a261' },
    { id: 3, category: 'Transport', name: 'Location voiture', amount: 400, date: new Date(2026, 0, 30), icon: 'bi-car-front', color: '#2a9d8f' },
    { id: 4, category: 'Activité', name: 'Excursion Atlas', amount: 200, date: new Date(2026, 0, 30), icon: 'bi-compass', color: '#e76f51' },
    { id: 5, category: 'Shopping', name: 'Souvenirs Médina', amount: 120, date: new Date(2026, 0, 31), icon: 'bi-bag', color: '#9b59b6' }
  ];

  showAddExpenseModal = false;
  newExpense: Partial<BudgetItem> = {};
  expenseCategories = [
    { id: 'hebergement', name: 'Hébergement', icon: 'bi-building', color: '#1a5f7a' },
    { id: 'restaurant', name: 'Restaurant', icon: 'bi-cup-hot', color: '#f4a261' },
    { id: 'transport', name: 'Transport', icon: 'bi-car-front', color: '#2a9d8f' },
    { id: 'activite', name: 'Activité', icon: 'bi-compass', color: '#e76f51' },
    { id: 'shopping', name: 'Shopping', icon: 'bi-bag', color: '#9b59b6' }
  ];

  alerts: Alert[] = [
    { id: 1, type: 'budget', message: 'Budget hébergement atteint à 75%', icon: 'bi-exclamation-triangle', color: '#f4a261', isRead: false },
    { id: 2, type: 'deal', message: '-30% sur les spas ce weekend!', icon: 'bi-tag', color: '#2a9d8f', isRead: false },
    { id: 3, type: 'reminder', message: 'Réservation demain à 14h', icon: 'bi-bell', color: '#1a5f7a', isRead: true }
  ];

  deals = [
    { id: 1, name: 'Spa Détente', discount: 30, originalPrice: 800, image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=200', validUntil: '15 Fév' },
    { id: 2, name: 'Brunch Gourmet', discount: 20, originalPrice: 350, image: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=200', validUntil: '10 Fév' },
    { id: 3, name: 'Circuit Guidé', discount: 15, originalPrice: 500, image: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=200', validUntil: '20 Fév' }
  ];

  // ============ RESERVATIONS (Module 4) - BRANCHEMENT API ============
  reservations: ApiReservation[] = [];
  isLoadingReservations = false;
  reservationError: string | null = null;
  reservationTypes = RESERVATION_TYPES;

  showReservationModal = false;
  showNewReservationModal = false;
  selectedReservation: ApiReservation | null = null;
  
  // Formulaire nouvelle réservation
  newReservation: CreateReservationRequest = {
    establishmentName: '',
    type: 'HOTEL',
    reservationDate: this.getTodayDate(),
    reservationTime: '12:00',
    numberOfPersons: 2,
    price: undefined,
    location: '',
    notes: ''
  };
  isSubmittingReservation = false;

  // Villes disponibles
  cities = ['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'Essaouira', 'Chefchaouen'];

  // ============ GEOLOCATION (Module 5) ============
  userLocation: { lat: number; lng: number } | null = null;
  isLocating = false;
  
  nearbyPlaces: NearbyPlace[] = [
    { id: 1, name: 'Café Rick\'s', type: 'Café', distance: 150, rating: 4.2, image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200', isOpen: true, isSponsor: true },
    { id: 2, name: 'Mosquée Hassan II', type: 'Monument', distance: 500, rating: 4.9, image: 'https://images.unsplash.com/photo-1569383746724-6f1b882b8f46?w=200', isOpen: true, isSponsor: false },
    { id: 3, name: 'Restaurant du Port', type: 'Restaurant', distance: 450, rating: 4.5, image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200', isOpen: true, isSponsor: true },
    { id: 4, name: 'Parc de la Ligue Arabe', type: 'Nature', distance: 800, rating: 4.6, image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=200', isOpen: true, isSponsor: false }
  ];

  // Place Recognition
  showPlaceModal = false;
  isUsingCamera = false;
  isCameraActive = false;
  isAnalyzing = false;
  capturedImage: string | null = null;
  recognitionResult: PlaceRecognitionResult | null = null;
  recognitionError: string | null = null;
  private mediaStream: MediaStream | null = null;

  private readonly VISION_API_KEY: any = 'AIzaSyBUNarJUKhAO0036x_Ni7O5frU6PRhXgMs';
  private readonly VISION_API_URL: any = 'https://vision.googleapis.com/v1/images:annotate';
  private readonly DEMO_MODE = false;

  // Navigation
  showNavigationModal = false;
  navigationDestination = '';
  navigationMode: 'walking' | 'driving' | 'transit' = 'walking';

  // ============ UI STATE ============
  activeTab: 'recommendations' | 'budget' | 'reservations' | 'nearby' = 'nearby';
  searchQuery = '';
  notificationCount = 2;

  private favoritesSubscription?: Subscription;

  constructor(
    private http: HttpClient,
    private reservationService: ReservationsService,
    private eventFavoritesService: EventFavoritesService
  ) {}

  fullname:any="";
  ngOnInit(): void {
    this.loadUserProfile();
    this.calculateBudget();
    this.getUserLocation();
    this.loadReservations();
    this.loadEventFavorites();
    
    // S'abonner aux changements de favoris
    this.favoritesSubscription = this.eventFavoritesService.favorites$.subscribe(favorites => {
      console.log(favorites);
      
      this.favorites = favorites;
    });
    
    // Use prefix as initials if available, otherwise generate
    const storedPrefix = localStorage.getItem('gogenius.prefix');
    const storedFullname = localStorage.getItem('gogenius.fname');
    this.fullname = storedFullname || 'Utilisateur';
    this.userInitials = storedPrefix || this.generateInitials(this.fullname);
  }

  private generateInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  ngOnDestroy(): void {
    this.stopCamera();
    this.favoritesSubscription?.unsubscribe();
  }

  loadEventFavorites(): void {
    this.favorites = this.eventFavoritesService.getFavorites();
  }
  userName:any="";
  // ============ MODULE 1: PROFILE ============
  loadUserProfile(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.userProfile.fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.login || 'Utilisateur';
        this.userProfile.email = user.email || '';
        this.userInitials = this.getInitials(this.userProfile.fullName);
      } catch (e) {
        const storedName = localStorage.getItem('gogenius.fname');
        if (storedName) {
          this.userProfile.fullName = storedName;
          this.userInitials = this.getInitials(storedName);
        }
      }
    }
    this.userName = localStorage.getItem('username');
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  openProfileModal(): void {
    this.editingProfile = JSON.parse(JSON.stringify(this.userProfile));
    this.showProfileModal = true;
  }

  closeProfileModal(): void {
    this.showProfileModal = false;
    this.editingProfile = null;
  }

  saveProfile(): void {
    if (this.editingProfile) {
      this.userProfile = { ...this.editingProfile };
      this.userInitials = this.getInitials(this.userProfile.fullName);
      localStorage.setItem('gogenius.fname', this.userProfile.fullName);
      this.closeProfileModal();
    }
  }

  toggleCategory(cat: string): void {
    if (!this.editingProfile) return;
    const idx = this.editingProfile.preferences.categories.indexOf(cat);
    if (idx > -1) {
      this.editingProfile.preferences.categories.splice(idx, 1);
    } else {
      this.editingProfile.preferences.categories.push(cat);
    }
  }

  isCategorySelected(cat: string): boolean {
    return this.editingProfile?.preferences.categories.includes(cat) || false;
  }

  removeFavorite(id: number): void {
    this.eventFavoritesService.removeFavorite(id);
  }

  // ============ MODULE 2: RECOMMENDATIONS ============
  viewRecommendation(rec: Recommendation): void {
    this.selectedRecommendation = rec;
    this.showRecommendationModal = true;
  }

  closeRecommendationModal(): void {
    this.showRecommendationModal = false;
    this.selectedRecommendation = null;
  }

  bookRecommendation(rec: Recommendation): void {
    const typeMap: { [key: string]: ReservationType } = {
      'Restaurant': 'RESTAURANT',
      'Hôtel': 'HOTEL',
      'Spa': 'SPA',
      'Activité': 'ACTIVITY',
      'Transport': 'TRANSPORT',
      'Café': 'RESTAURANT'
    };
    
    this.newReservation = {
      establishmentName: rec.name,
      type: typeMap[rec.type] || 'ACTIVITY',
      reservationDate: this.getTodayDate(),
      reservationTime: '12:00',
      numberOfPersons: 2,
      price: rec.price,
      location: rec.location,
      notes: ''
    };
    this.closeRecommendationModal();
    this.showNewReservationModal = true;
  }

  addToFavorites(rec: Recommendation): void {
    if (!this.favorites.find(f => f.name === rec.name)) {
      this.favorites.push({
        id: Date.now(),
        name: rec.name,
        type: rec.type,
        image: rec.image
      });
    }
  }

  // ============ MODULE 3: BUDGET ============
  calculateBudget(): void {
    this.budgetSpent = this.expenses.reduce((sum, e) => sum + e.amount, 0);
  }

  getBudgetPercentage(): number {
    return Math.round((this.budgetSpent / this.budgetTotal) * 100);
  }

  getBudgetStatus(): string {
    const pct = this.getBudgetPercentage();
    if (pct >= 90) return 'danger';
    if (pct >= 70) return 'warning';
    return 'safe';
  }

  getExpensesByCategory(): any[] {
    const cats: any = {};
    this.expenses.forEach(e => {
      if (!cats[e.category]) cats[e.category] = { total: 0, color: e.color, icon: e.icon };
      cats[e.category].total += e.amount;
    });
    return Object.entries(cats).map(([cat, data]: any) => ({
      category: cat,
      total: data.total,
      color: data.color,
      icon: data.icon,
      percentage: Math.round((data.total / this.budgetSpent) * 100)
    }));
  }

  openAddExpenseModal(): void {
    this.newExpense = { date: new Date(), amount: 0 };
    this.showAddExpenseModal = true;
  }

  closeAddExpenseModal(): void {
    this.showAddExpenseModal = false;
    this.newExpense = {};
  }

  addExpense(): void {
    if (this.newExpense.name && this.newExpense.amount && this.newExpense.category) {
      const cat = this.expenseCategories.find(c => c.id === this.newExpense.category);
      this.expenses.unshift({
        id: Date.now(),
        category: cat?.name || 'Autre',
        name: this.newExpense.name,
        amount: this.newExpense.amount,
        date: this.newExpense.date || new Date(),
        icon: cat?.icon || 'bi-cash',
        color: cat?.color || '#6c757d'
      });
      this.calculateBudget();
      this.closeAddExpenseModal();
    }
  }

  deleteExpense(id: number): void {
    this.expenses = this.expenses.filter(e => e.id !== id);
    this.calculateBudget();
  }

  markAlertRead(id: number): void {
    const alert = this.alerts.find(a => a.id === id);
    if (alert) alert.isRead = true;
    this.notificationCount = this.alerts.filter(a => !a.isRead).length;
  }

  dismissAlert(id: number): void {
    this.alerts = this.alerts.filter(a => a.id !== id);
    this.notificationCount = this.alerts.filter(a => !a.isRead).length;
  }

  // ============ MODULE 4: RESERVATIONS - API BRANCHÉE ============
  
  loadReservations(): void {
    this.isLoadingReservations = true;
    this.reservationError = null;
    
    this.reservationService.getLatestReservations().subscribe({
      next: (data) => {
        this.reservations = data;
        this.isLoadingReservations = false;
      },
      error: (err) => {
        console.error('Erreur chargement réservations:', err);
        this.reservationError = 'Impossible de charger les réservations';
        this.isLoadingReservations = false;
      }
    });
  }

  viewReservation(res: ApiReservation): void {
    this.selectedReservation = res;
    this.showReservationModal = true;
  }

  closeReservationModal(): void {
    this.showReservationModal = false;
    this.selectedReservation = null;
  }

  openNewReservationModal(): void {
    this.resetNewReservationForm();
    this.showNewReservationModal = true;
  }

  openNewReservationWithType(type: ReservationType): void {
    this.resetNewReservationForm();
    this.newReservation.type = type;
    this.showNewReservationModal = true;
  }

  closeNewReservationModal(): void {
    this.showNewReservationModal = false;
    this.resetNewReservationForm();
  }

  resetNewReservationForm(): void {
    this.newReservation = {
      establishmentName: '',
      type: 'HOTEL',
      reservationDate: this.getTodayDate(),
      reservationTime: '12:00',
      numberOfPersons: 2,
      price: undefined,
      location: '',
      notes: ''
    };
    this.reservationError = null;
  }

  createReservation(): void {
    if (!this.newReservation.establishmentName?.trim()) {
      this.reservationError = 'Le nom de l\'établissement est requis';
      return;
    }
    if (!this.newReservation.location?.trim()) {
      this.reservationError = 'La ville est requise';
      return;
    }

    this.isSubmittingReservation = true;
    this.reservationError = null;

    this.reservationService.createReservation(this.newReservation).subscribe({
      next: (reservation) => {
        this.reservations.unshift(reservation);
        if (this.reservations.length > 3) {
          this.reservations = this.reservations.slice(0, 3);
        }
        
        if (this.newReservation.price && this.newReservation.price > 0) {
          const typeOption = getTypeOption(this.newReservation.type);
          this.expenses.unshift({
            id: Date.now(),
            category: typeOption.label,
            name: this.newReservation.establishmentName,
            amount: this.newReservation.price,
            date: new Date(),
            icon: typeOption.icon,
            color: typeOption.color
          });
          this.calculateBudget();
        }
        
        this.isSubmittingReservation = false;
        this.closeNewReservationModal();
      },
      error: (err) => {
        console.error('Erreur création réservation:', err);
        this.reservationError = err?.message || 'Erreur lors de la création';
        this.isSubmittingReservation = false;
      }
    });
  }

  cancelReservation(id: string): void {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) return;
    
    this.reservationService.cancelReservation(id).subscribe({
      next: (updated) => {
        const index = this.reservations.findIndex(r => r.id === id);
        if (index !== -1) {
          this.reservations[index] = updated;
        }
        this.closeReservationModal();
      },
      error: (err) => {
        console.error('Erreur annulation:', err);
        alert('Erreur lors de l\'annulation');
      }
    });
  }

  modifyReservation(): void {
    if (this.selectedReservation) {
      this.newReservation = {
        establishmentName: this.selectedReservation.establishmentName,
        type: this.selectedReservation.type,
        reservationDate: this.selectedReservation.reservationDate,
        reservationTime: this.selectedReservation.reservationTime,
        numberOfPersons: this.selectedReservation.numberOfPersons,
        price: this.selectedReservation.price || undefined,
        location: this.selectedReservation.location,
        notes: this.selectedReservation.notes || ''
      };
      this.closeReservationModal();
      this.showNewReservationModal = true;
    }
  }

  // ============ HELPERS RÉSERVATIONS ============
  
  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  getTypeOption(type: ReservationType) {
    return getTypeOption(type);
  }

  getStatusOption(status: string) {
    return getStatusOption(status as any);
  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'En attente',
      'CONFIRMED': 'Confirmé',
      'CANCELLED': 'Annulé',
      'COMPLETED': 'Terminé'
    };
    return statusMap[status] || status;
  }

  getStatusClass(status: string): string {
    const classMap: { [key: string]: string } = {
      'PENDING': 'status-pending',
      'CONFIRMED': 'status-confirmed',
      'CANCELLED': 'status-cancelled',
      'COMPLETED': 'status-completed'
    };
    return classMap[status] || '';
  }

  formatReservationDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  formatShortDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  formatTime(timeStr: string): string {
    return timeStr?.substring(0, 5) || '';
  }

  formatPrice(price: number | null): string {
    if (!price) return '';
    return price.toLocaleString('fr-FR') + ' MAD';
  }

  getReservationImage(type: ReservationType): string {
    const images: { [key: string]: string } = {
      'HOTEL': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200',
      'RESTAURANT': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200',
      'SPA': 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=200',
      'ACTIVITY': 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=200',
      'TRANSPORT': 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=200'
    };
    return images[type] || images['ACTIVITY'];
  }

  canModifyReservation(reservation: ApiReservation): boolean {
    return reservation.status === 'PENDING' || reservation.status === 'CONFIRMED';
  }

  // ============ MODULE 5: GEOLOCATION ============
  getUserLocation(): void {
    this.isLocating = true;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          this.isLocating = false;
        },
        () => { this.isLocating = false; }
      );
    }
  }

  openNavigation(place: NearbyPlace): void {
    this.navigationDestination = place.name;
    this.showNavigationModal = true;
  }

  closeNavigationModal(): void {
    this.showNavigationModal = false;
  }

  startNavigation(): void {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(this.navigationDestination)}&travelmode=${this.navigationMode}`;
    window.open(url, '_blank');
    this.closeNavigationModal();
  }

  // ============ PLACE RECOGNITION ============
  openPlaceModal(): void {
    this.showPlaceModal = true;
    this.resetPlaceRecognition();
  }

  closePlaceModal(): void {
    this.showPlaceModal = false;
    this.stopCamera();
  }

  resetPlaceRecognition(): void {
    this.capturedImage = null;
    this.recognitionResult = null;
    this.recognitionError = null;
    this.isUsingCamera = false;
    this.stopCamera();
  }

  async startCamera(): Promise<void> {
    this.isUsingCamera = true;
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setTimeout(() => {
        if (this.videoElement?.nativeElement) {
          this.videoElement.nativeElement.srcObject = this.mediaStream;
          this.isCameraActive = true;
        }
      }, 100);
    } catch (error) {
      this.recognitionError = 'Impossible d\'accéder à la caméra';
      this.isUsingCamera = false;
    }
  }

  stopCamera(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(t => t.stop());
      this.mediaStream = null;
    }
    this.isCameraActive = false;
    this.isUsingCamera = false;
  }

  capturePhoto(): void {
    if (!this.videoElement?.nativeElement || !this.canvasElement?.nativeElement) return;
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    this.capturedImage = canvas.toDataURL('image/jpeg', 0.8);
    this.stopCamera();
  }

  triggerFileInput(): void {
    this.fileInput?.nativeElement?.click();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file?.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.capturedImage = e.target?.result as string;
        this.recognitionResult = null;
        this.recognitionError = null;
      };
      reader.readAsDataURL(file);
    }
  }

  async analyzeImage(): Promise<void> {
    if (!this.capturedImage) {
      this.recognitionError = 'Aucune image à analyser';
      return;
    }

    this.isAnalyzing = true;
    this.recognitionError = null;

    if (this.DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const demoResults = [
        { name: 'Marina Casablanca', description: 'Complexe touristique moderne.', location: 'Casablanca, Maroc', lat: 33.5970, lng: -7.6296 },
        { name: 'Morocco Mall', description: 'Le plus grand centre commercial d\'Afrique.', location: 'Casablanca, Maroc', lat: 33.5731, lng: -7.6568 }
      ];
      const randomResult = demoResults[Math.floor(Math.random() * demoResults.length)];
      this.recognitionResult = {
        name: randomResult.name,
        description: randomResult.description,
        location: randomResult.location,
        confidence: 85 + Math.floor(Math.random() * 10),
        mapsUrl: `https://www.google.com/maps?q=${randomResult.lat},${randomResult.lng}`,
        wikipediaUrl: `https://fr.wikipedia.org/wiki/${encodeURIComponent(randomResult.name)}`
      };
      this.isAnalyzing = false;
      return;
    }

    if (!this.VISION_API_KEY || this.VISION_API_KEY.trim() === '') {
      this.recognitionError = 'Configurez votre clé API Google Vision';
      this.isAnalyzing = false;
      return;
    }

    try {
      const response: any = await this.http.post(
        `${this.VISION_API_URL}?key=${this.VISION_API_KEY}`,
        {
          requests: [{
            image: { content: this.capturedImage.split(',')[1] },
            features: [
              { type: 'LANDMARK_DETECTION', maxResults: 5 },
              { type: 'WEB_DETECTION', maxResults: 5 }
            ]
          }]
        }
      ).toPromise();

      const result = response?.responses?.[0];
      if (result?.error) {
        this.recognitionError = `Erreur API: ${result.error.message}`;
        this.isAnalyzing = false;
        return;
      }
      
      const landmark = result?.landmarkAnnotations?.[0];
      const webDetection = result?.webDetection;
      
      if (landmark) {
        const loc = landmark.locations?.[0]?.latLng;
        this.recognitionResult = {
          name: landmark.description,
          description: `Lieu reconnu avec ${Math.round((landmark.score || 0.9) * 100)}% de confiance`,
          location: loc ? `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}` : 'Position non disponible',
          confidence: Math.round((landmark.score || 0.9) * 100),
          mapsUrl: loc ? `https://www.google.com/maps?q=${loc.latitude},${loc.longitude}` : undefined,
          wikipediaUrl: `https://fr.wikipedia.org/wiki/${encodeURIComponent(landmark.description)}`
        };
      } else if (webDetection?.webEntities?.length > 0) {
        const entity = webDetection.webEntities[0];
        this.recognitionResult = {
          name: entity.description || 'Lieu détecté',
          description: 'Identifié via analyse web',
          location: 'Position non disponible',
          confidence: Math.round((entity.score || 0.7) * 100),
          wikipediaUrl: `https://fr.wikipedia.org/wiki/${encodeURIComponent(entity.description || '')}`
        };
      } else {
        this.recognitionError = 'Aucun lieu reconnu dans cette image.';
      }
    } catch (error: any) {
      this.recognitionError = `Erreur: ${error?.message || 'Vérifiez votre clé API'}`;
    } finally {
      this.isAnalyzing = false;
    }
  }

  retakePhoto(): void {
    this.capturedImage = null;
    this.recognitionResult = null;
    this.recognitionError = null;
  }

  openInMaps(): void {
    if (this.recognitionResult?.mapsUrl) window.open(this.recognitionResult.mapsUrl, '_blank');
  }

  openWikipedia(): void {
    if (this.recognitionResult?.wikipediaUrl) window.open(this.recognitionResult.wikipediaUrl, '_blank');
  }

  // ============ UI ============
  setActiveTab(tab: 'recommendations' | 'budget' | 'reservations' | 'nearby'): void {
    this.activeTab = tab;
    if (tab === 'reservations') {
      this.loadReservations();
    }
    console.log(this.activeTab);
    
  }
}