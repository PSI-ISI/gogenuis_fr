import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
// Interfaces
interface Stat {
  icon: string;
  value: string | number;
  label: string;
  trend: number;
  bgColor: string;
}

interface Event {
  id: number;
  title: string;
  description: string;
  date: Date;
  location: string;
  image: string;
  category: string;
  categoryColor: string;
  price: number;
  isFavorite: boolean;
}

interface BudgetCategory {
  id: string;
  name: string;
  icon: string;
}

interface BudgetResult {
  id: number;
  name: string;
  location: string;
  image: string;
  price: number;
  rating: number;
  reviews: number;
  category: string;
}

interface CalendarDay {
  number: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasEvent: boolean;
  date: Date;
}

interface DayEvent {
  time: string;
  name: string;
  color: string;
}

interface Advertisement {
  id: number;
  title: string;
  description: string;
  image: string;
  type: string;
  ctaText: string;
}

interface Reservation {
  id: number;
  name: string;
  date: Date;
  time: string;
  icon: string;
  iconBg: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}
interface PlaceRecognitionResult {
  name: string;
  description: string;
  location: string;
  confidence: number;
  wikipediaUrl?: string;
  mapsUrl?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy{
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // User info
  userName = 'Jean';
  userInitials = 'JD';
  searchQuery = '';
  notificationCount = 3;

  // Stats
  stats: Stat[] = [
    { icon: 'bi bi-bookmark-check', value: 12, label: 'Réservations', trend: 8, bgColor: 'linear-gradient(135deg, #1a5f7a 0%, #2d8bba 100%)' },
    { icon: 'bi bi-calendar-event', value: 5, label: 'Événements', trend: 15, bgColor: 'linear-gradient(135deg, #f4a261 0%, #e9c46a 100%)' },
    { icon: 'bi bi-percent', value: 23, label: 'Bons Plans', trend: -3, bgColor: 'linear-gradient(135deg, #e76f51 0%, #f4a261 100%)' },
    { icon: 'bi bi-award', value: '1,250', label: 'Points Fidélité', trend: 12, bgColor: 'linear-gradient(135deg, #2a9d8f 0%, #52b788 100%)' }
  ];

  // Events
  events: Event[] = [
    {
      id: 1,
      title: 'Salon International du Tourisme',
      description: 'Découvrez les dernières tendances du tourisme mondial avec plus de 200 exposants.',
      date: new Date(2026, 1, 15),
      location: 'Paris Expo',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
      category: 'Salon',
      categoryColor: '#1a5f7a',
      price: 25,
      isFavorite: false
    },
    {
      id: 2,
      title: 'Festival Gastronomique de Lyon',
      description: 'Une célébration des saveurs locales avec les meilleurs chefs de la région.',
      date: new Date(2026, 1, 22),
      location: 'Lyon Centre',
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
      category: 'Festival',
      categoryColor: '#e76f51',
      price: 0,
      isFavorite: true
    },
    {
      id: 3,
      title: 'Marathon de Nice',
      description: 'Parcourez la magnifique Côte d\'Azur lors de ce marathon international.',
      date: new Date(2026, 2, 8),
      location: 'Nice',
      image: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=400',
      category: 'Sport',
      categoryColor: '#2a9d8f',
      price: 45,
      isFavorite: false
    }
  ];

  // Budget Search
  budgetMin = 0;
  budgetMax = 500;
  budgetValue = 150;
  selectedCategory = 'all';
  budgetSearched = false;

  budgetCategories: BudgetCategory[] = [
    { id: 'all', name: 'Tous', icon: 'bi bi-grid' },
    { id: 'hotel', name: 'Hôtels', icon: 'bi bi-building' },
    { id: 'restaurant', name: 'Restaurants', icon: 'bi bi-cup-hot' },
    { id: 'activity', name: 'Activités', icon: 'bi bi-bicycle' },
    { id: 'spa', name: 'Spa & Bien-être', icon: 'bi bi-heart-pulse' }
  ];

  budgetResults: BudgetResult[] = [];

  allDeals: BudgetResult[] = [
    { id: 1, name: 'Hôtel Le Méditerranée', location: 'Nice', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400', price: 89, rating: 4, reviews: 128, category: 'hotel' },
    { id: 2, name: 'Restaurant La Belle Vue', location: 'Cannes', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400', price: 45, rating: 5, reviews: 89, category: 'restaurant' },
    { id: 3, name: 'Spa Zen & Harmony', location: 'Monaco', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400', price: 120, rating: 5, reviews: 67, category: 'spa' },
    { id: 4, name: 'Location Vélos Côte Azur', location: 'Antibes', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', price: 25, rating: 4, reviews: 45, category: 'activity' },
    { id: 5, name: 'Hôtel Petit Palace', location: 'Marseille', image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400', price: 75, rating: 4, reviews: 156, category: 'hotel' },
    { id: 6, name: 'Bistrot du Port', location: 'Saint-Tropez', image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400', price: 65, rating: 4, reviews: 92, category: 'restaurant' }
  ];

  // Calendar
  weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  currentDate = new Date();
  currentMonthYear = '';
  calendarDays: CalendarDay[] = [];
  selectedDate: Date = new Date();
  selectedDayEvents: DayEvent[] = [];

  // Calendar events data
  calendarEvents: { [key: string]: DayEvent[] } = {
    '2026-01-27': [
      { time: '10:00', name: 'Check-in Hôtel', color: '#1a5f7a' },
      { time: '14:00', name: 'Visite guidée', color: '#f4a261' }
    ],
    '2026-01-30': [
      { time: '19:00', name: 'Dîner restaurant', color: '#e76f51' }
    ],
    '2026-02-05': [
      { time: '09:00', name: 'Spa & Massage', color: '#2a9d8f' }
    ],
    '2026-02-15': [
      { time: '10:00', name: 'Salon du Tourisme', color: '#1a5f7a' }
    ]
  };

  // Advertisements
  advertisements: Advertisement[] = [
    {
      id: 1,
      title: 'Offre Spéciale Hiver',
      description: '-30% sur les séjours ski',
      image: 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=600',
      type: 'Hôtel',
      ctaText: 'Réserver'
    },
    {
      id: 2,
      title: 'Brunch Dominical',
      description: 'Menu découverte à 29€',
      image: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=600',
      type: 'Restaurant',
      ctaText: 'Découvrir'
    },
    {
      id: 3,
      title: 'Séance Découverte',
      description: 'Essai fitness gratuit',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600',
      type: 'Fitness',
      ctaText: 'S\'inscrire'
    }
  ];
  currentAdIndex = 0;
  private adInterval: any;

  // Reservations
  recentReservations: Reservation[] = [
    {
      id: 1,
      name: 'Hôtel Le Méditerranée',
      date: new Date(2026, 1, 15),
      time: '14:00',
      icon: 'bi bi-building',
      iconBg: 'linear-gradient(135deg, #1a5f7a 0%, #2d8bba 100%)',
      status: 'confirmed'
    },
    {
      id: 2,
      name: 'Restaurant La Terrasse',
      date: new Date(2026, 1, 18),
      time: '20:00',
      icon: 'bi bi-cup-hot',
      iconBg: 'linear-gradient(135deg, #f4a261 0%, #e9c46a 100%)',
      status: 'pending'
    },
    {
      id: 3,
      name: 'Spa Zen Paradise',
      date: new Date(2026, 1, 10),
      time: '10:30',
      icon: 'bi bi-heart-pulse',
      iconBg: 'linear-gradient(135deg, #2a9d8f 0%, #52b788 100%)',
      status: 'confirmed'
    }
  ];

  ngOnInit(): void {
    this.generateCalendar();
    this.onBudgetChange();
    this.startAdCarousel();
    this.updateMonthYearDisplay();
  }

  ngOnDestroy(): void {
    if (this.adInterval) {
      clearInterval(this.adInterval);
    }
  }

  // Notifications
  toggleNotifications(): void {
    // TODO: Implement notifications panel
    console.log('Toggle notifications');
  }

  // Events
  toggleFavorite(event: Event): void {
    event.isFavorite = !event.isFavorite;
    // TODO: Call API to update favorite status
  }

  // Budget Search
  onBudgetChange(): void {
    this.budgetSearched = true;
    this.filterBudgetResults();
  }

  selectCategory(categoryId: string): void {
    this.selectedCategory = categoryId;
    this.filterBudgetResults();
  }

  private filterBudgetResults(): void {
    this.budgetResults = this.allDeals.filter(deal => {
      const matchesBudget = deal.price <= this.budgetValue;
      const matchesCategory = this.selectedCategory === 'all' || deal.category === this.selectedCategory;
      return matchesBudget && matchesCategory;
    }).slice(0, 3); // Limit to 3 results
  }

  // Calendar
  private updateMonthYearDisplay(): void {
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    this.currentMonthYear = `${months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
  }

  generateCalendar(): void {
    this.calendarDays = [];
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Get day of week (0 = Sunday, adjust for Monday start)
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      this.calendarDays.push({
        number: prevMonthLastDay - i,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        hasEvent: this.hasEventOnDate(date),
        date
      });
    }

    // Current month days
    const today = new Date();
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const isToday = today.getDate() === day &&
        today.getMonth() === month &&
        today.getFullYear() === year;
      
      this.calendarDays.push({
        number: day,
        isCurrentMonth: true,
        isToday,
        isSelected: this.isSameDay(date, this.selectedDate),
        hasEvent: this.hasEventOnDate(date),
        date
      });
    }

    // Next month days (fill to complete 6 rows)
    const remaining = 42 - this.calendarDays.length;
    for (let day = 1; day <= remaining; day++) {
      const date = new Date(year, month + 1, day);
      this.calendarDays.push({
        number: day,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        hasEvent: this.hasEventOnDate(date),
        date
      });
    }
  }

  private hasEventOnDate(date: Date): boolean {
    const key = this.formatDateKey(date);
    return !!this.calendarEvents[key];
  }

  private formatDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear();
  }

  selectDay(day: CalendarDay): void {
    this.calendarDays.forEach(d => d.isSelected = false);
    day.isSelected = true;
    this.selectedDate = day.date;
    
    const key = this.formatDateKey(day.date);
    this.selectedDayEvents = this.calendarEvents[key] || [];
  }

  prevMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.updateMonthYearDisplay();
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.updateMonthYearDisplay();
    this.generateCalendar();
  }

  // Ads Carousel
  private startAdCarousel(): void {
    this.adInterval = setInterval(() => {
      this.currentAdIndex = (this.currentAdIndex + 1) % this.advertisements.length;
    }, 5000);
  }

  goToAd(index: number): void {
    this.currentAdIndex = index;
    // Reset interval
    if (this.adInterval) {
      clearInterval(this.adInterval);
    }
    this.startAdCarousel();
  }

  // Reservations
  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'confirmed': 'Confirmé',
      'pending': 'En attente',
      'cancelled': 'Annulé'
    };
    return labels[status] || status;
  }

  // ==================== PLACE RECOGNITION ====================
  
  showPlaceModal = false;
  isUsingCamera = false;
  isCameraActive = false;
  isAnalyzing = false;
  capturedImage: string | null = null;
  recognitionResult: PlaceRecognitionResult | null = null;
  recognitionError: string | null = null;
  private mediaStream: MediaStream | null = null;

  // ============ CONFIGURATION API ============
  // Google Cloud Vision API - Obtenez votre clé gratuite :
  // 1. Allez sur https://console.cloud.google.com/
  // 2. Créez un projet (ou sélectionnez un existant)
  // 3. Activez "Cloud Vision API" dans APIs & Services > Library
  // 4. Créez une clé API dans APIs & Services > Credentials
  // 5. Collez votre clé ci-dessous
  // GRATUIT : 1000 requêtes/mois
  
  private readonly VISION_API_KEY = 'AIzaSyCc1MBZ21R3BYlRpeRYCX_2Z8e3B0Kw6SI';
  private readonly VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate';

  constructor(private http: HttpClient) {}

  openPlaceModal(): void {
    this.showPlaceModal = true;
    this.resetPlaceRecognition();
    document.body.style.overflow = 'hidden';
  }

  closePlaceModal(): void {
    this.showPlaceModal = false;
    this.stopCamera();
    document.body.style.overflow = '';
  }

  resetPlaceRecognition(): void {
    this.capturedImage = null;
    this.recognitionResult = null;
    this.recognitionError = null;
    this.isAnalyzing = false;
    this.isUsingCamera = false;
    this.stopCamera();
  }

  // Camera methods
  async startCamera(): Promise<void> {
    this.isUsingCamera = true;
    this.capturedImage = null;
    this.recognitionResult = null;
    
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      
      setTimeout(() => {
        if (this.videoElement?.nativeElement) {
          this.videoElement.nativeElement.srcObject = this.mediaStream;
          this.isCameraActive = true;
        }
      }, 100);
    } catch (error) {
      console.error('Camera error:', error);
      this.recognitionError = 'Impossible d\'accéder à la caméra. Vérifiez les permissions.';
      this.isUsingCamera = false;
    }
  }

  stopCamera(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
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
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      this.capturedImage = canvas.toDataURL('image/jpeg', 0.8);
      this.stopCamera();
    }
  }

  // File upload
  triggerFileInput(): void {
    this.fileInput?.nativeElement?.click();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.recognitionError = 'Veuillez sélectionner une image valide.';
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.capturedImage = e.target?.result as string;
        this.recognitionResult = null;
        this.recognitionError = null;
      };
      reader.readAsDataURL(file);
    }
  }

  // Analyze image with Google Cloud Vision API
  async analyzeImage(): Promise<void> {
    if (!this.capturedImage) return;

    // Check if API key is configured
    if (!this.VISION_API_KEY || this.VISION_API_KEY === 'AIzaSyCc1MBZ21R3BYlRpeRYCX_2Z8e3B0Kw6SI') {
      this.recognitionError = 'Veuillez configurer votre clé API Google Vision dans le fichier dashboard.component.ts';
      return;
    }

    this.isAnalyzing = true;
    this.recognitionError = null;
    this.recognitionResult = null;

    // Extract base64 data (remove data:image/...;base64, prefix)
    const base64Image = this.capturedImage.split(',')[1];

    // Build request for Google Cloud Vision API
    const requestBody = {
      requests: [{
        image: { content: base64Image },
        features: [
          { type: 'LANDMARK_DETECTION', maxResults: 10 },
          { type: 'WEB_DETECTION', maxResults: 10 },
          { type: 'LABEL_DETECTION', maxResults: 10 }
        ]
      }]
    };

    try {
      const response: any = await this.http.post(
        `${this.VISION_API_URL}?key=${this.VISION_API_KEY}`,
        requestBody
      ).toPromise();

      this.processVisionResponse(response);
    } catch (error: any) {
      console.error('Vision API error:', error);
      
      if (error.status === 403) {
        this.recognitionError = 'Clé API invalide ou API non activée. Vérifiez votre configuration Google Cloud.';
      } else if (error.status === 429) {
        this.recognitionError = 'Quota API dépassé. Réessayez plus tard ou vérifiez votre quota Google Cloud.';
      } else {
        this.recognitionError = 'Erreur de connexion à l\'API. Vérifiez votre connexion internet.';
      }
    } finally {
      this.isAnalyzing = false;
    }
  }

  private processVisionResponse(response: any): void {
    const result = response?.responses?.[0];
    
    if (!result) {
      this.recognitionError = 'Aucune réponse de l\'API. Réessayez.';
      return;
    }

    // Check for API errors
    if (result.error) {
      this.recognitionError = `Erreur API: ${result.error.message}`;
      return;
    }

    // Priority 1: Landmark Detection (monuments, lieux célèbres)
    const landmarks = result?.landmarkAnnotations;
    if (landmarks && landmarks.length > 0) {
      const landmark = landmarks[0];
      const location = landmark.locations?.[0]?.latLng;
      
      this.recognitionResult = {
        name: landmark.description,
        description: this.generateLandmarkDescription(landmark, result),
        location: location ? this.formatLocation(location) : 'Localisation non disponible',
        confidence: Math.round((landmark.score || 0.9) * 100),
        mapsUrl: location ? `https://www.google.com/maps?q=${location.latitude},${location.longitude}` : 
                 `https://www.google.com/maps/search/${encodeURIComponent(landmark.description)}`,
        wikipediaUrl: `https://fr.wikipedia.org/wiki/${encodeURIComponent(landmark.description.replace(/ /g, '_'))}`
      };
      return;
    }

    // Priority 2: Web Detection (recherche d'image inversée)
    const webDetection = result?.webDetection;
    if (webDetection) {
      // Check for web entities (identified places/things)
      if (webDetection.webEntities && webDetection.webEntities.length > 0) {
        const topEntities = webDetection.webEntities
          .filter((e: any) => e.description && e.score > 0.5)
          .slice(0, 3);
        
        if (topEntities.length > 0) {
          const mainEntity = topEntities[0];
          
          // Check if we have matching pages with location info
          const bestGuess = webDetection.bestGuessLabels?.[0]?.label || mainEntity.description;
          
          this.recognitionResult = {
            name: bestGuess,
            description: this.generateWebDescription(topEntities, result?.labelAnnotations),
            location: 'Rechercher sur Google Maps',
            confidence: Math.round((mainEntity.score || 0.7) * 100),
            mapsUrl: `https://www.google.com/maps/search/${encodeURIComponent(bestGuess)}`,
            wikipediaUrl: `https://fr.wikipedia.org/wiki/${encodeURIComponent(bestGuess.replace(/ /g, '_'))}`
          };
          return;
        }
      }
    }

    // Priority 3: Label Detection (description générale de la scène)
    const labels = result?.labelAnnotations;
    if (labels && labels.length > 0) {
      const topLabels = labels.slice(0, 5).map((l: any) => l.description);
      
      this.recognitionResult = {
        name: 'Lieu non identifié',
        description: `Cette image semble contenir : ${topLabels.join(', ')}.`,
        location: 'Non déterminée',
        confidence: Math.round((labels[0].score || 0.5) * 100),
        mapsUrl: undefined,
        wikipediaUrl: undefined
      };
      return;
    }

    // No results found
    this.recognitionError = 'Aucun lieu reconnu dans cette image. Essayez avec une photo plus claire d\'un monument ou lieu célèbre.';
  }

  private generateLandmarkDescription(landmark: any, result: any): string {
    let description = `${landmark.description} - Monument ou lieu célèbre identifié`;
    
    // Add labels context if available
    const labels = result?.labelAnnotations?.slice(0, 3).map((l: any) => l.description);
    if (labels && labels.length > 0) {
      description += `. Caractéristiques détectées : ${labels.join(', ')}.`;
    }
    
    return description;
  }

  private generateWebDescription(entities: any[], labels: any[]): string {
    const entityNames = entities.map((e: any) => e.description).join(', ');
    let description = `Lieu potentiellement identifié comme : ${entityNames}`;
    
    if (labels && labels.length > 0) {
      const labelNames = labels.slice(0, 3).map((l: any) => l.description);
      description += `. Éléments détectés : ${labelNames.join(', ')}.`;
    }
    
    return description;
  }

  private formatLocation(latLng: { latitude: number; longitude: number }): string {
    // Try to get a readable location name using reverse geocoding
    return `${latLng.latitude.toFixed(6)}, ${latLng.longitude.toFixed(6)}`;
  }

  retakePhoto(): void {
    this.capturedImage = null;
    this.recognitionResult = null;
    this.recognitionError = null;
  }

  openInMaps(): void {
    if (this.recognitionResult?.mapsUrl) {
      window.open(this.recognitionResult.mapsUrl, '_blank');
    }
  }

  openWikipedia(): void {
    if (this.recognitionResult?.wikipediaUrl) {
      window.open(this.recognitionResult.wikipediaUrl, '_blank');
    }
  }
}
