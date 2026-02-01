import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  Event, 
  Category, 
  City,
  EVENTS_DATA, 
  CATEGORIES, 
  CITIES,
  getCategoryCount
} from '../../dataset/events-morocco-2026_data';
import { Router } from '@angular/router';
import { CreateReservationRequest } from '../../models/reservation.model';
import { Subscription } from 'rxjs';
import { ReservationsService } from 'src/app/sevices/reservations.service';
import { EventFavoritesService } from 'src/app/sevices/eventFavoritesService';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class EventsComponent implements OnInit, AfterViewInit, OnDestroy {

  private favoritesSubscription?: Subscription;

  // View mode
  viewMode: 'grid' | 'list' | 'calendar' = 'grid';

  // Search & Filters
  searchQuery = '';
  selectedCategory = 'all';
  selectedDate = 'all';
  selectedCity = 'all';
  selectedPrice = 'all';
  sortBy = 'date';

  // Pagination
  currentPage = 1;
  itemsPerPage = 9;
  totalPages = 1;
  pages: number[] = [];

  // Data
  events: Event[] = [];
  filteredEvents: Event[] = [];
  paginatedEvents: Event[] = [];
  categories: Category[] = [];
  cities: City[] = [];

  // Stats
  totalEvents = 0;
  freeEvents = 0;
  featuredEvents = 0;
  
  // Loading state
  isLoading = true;

  // Past events
  showPastEvents = false;
  pastEventsCount = 0;

  // Modal Event Detail
  showEventModal = false;
  selectedEvent: Event | null = null;
  
  // Quick Reservation
  reservationPersons = 2;
  reservationNotes = '';
  isReserving = false;
  reservationError: string | null = null;
  reservationSuccess: string | null = null;

  constructor(
    private router: Router, 
    private cdr: ChangeDetectorRef,
    private reservationService: ReservationsService,
    private eventFavoritesService: EventFavoritesService
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.loadFavorites();
    this.calculateStats();
    this.filterEvents();
    this.isLoading = false;
    this.pastEventsCount = this.events.filter(e => e.isPast).length;

    // S'abonner aux changements de favoris
    this.favoritesSubscription = this.eventFavoritesService.favorites$.subscribe(() => {
      this.syncFavoritesFromService();
      this.cdr.detectChanges();
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    }, 0);
  }

  ngOnDestroy(): void {
    this.favoritesSubscription?.unsubscribe();
  }

  // Synchroniser les favoris depuis le service
  syncFavoritesFromService(): void {
    const favoriteIds = this.eventFavoritesService.getFavoriteIds();
    console.log(favoriteIds);
    
    this.events.forEach(e => {
      e.isFavorite = favoriteIds.includes(e.id);
    });
  }

  // ============ DATA LOADING ============
  loadData(): void {
    this.events = EVENTS_DATA.map(e => ({...e}));
    this.categories = CATEGORIES.map(cat => ({
      ...cat,
      count: getCategoryCount(cat.id)
    }));
    this.cities = [...CITIES];
    this.cdr.detectChanges();
  }

  calculateStats(): void {
    this.totalEvents = this.events.length;
    this.freeEvents = this.events.filter(e => e.price === 0).length;
    this.featuredEvents = this.events.filter(e => e.isFeatured).length;
  }

  // ============ VIEW MODE ============
  setViewMode(mode: 'grid' | 'list' | 'calendar'): void {
    this.viewMode = mode;
  }

  // ============ FILTERING ============
  filterEvents(): void {
    let filtered = [...this.events];

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(query) ||
        e.description.toLowerCase().includes(query) ||
        e.city.toLowerCase().includes(query) ||
        e.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (!this.showPastEvents) {
      filtered = filtered.filter(e => !e.isPast);
    }

    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(e => 
        e.category.toLowerCase() === this.selectedCategory.toLowerCase()
      );
    }

    if (this.selectedCity !== 'all') {
      filtered = filtered.filter(e => e.city === this.selectedCity);
    }

    if (this.selectedPrice === 'free') {
      filtered = filtered.filter(e => e.price === 0);
    } else if (this.selectedPrice === 'paid') {
      filtered = filtered.filter(e => e.price > 0);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (this.selectedDate === 'today') {
      filtered = filtered.filter(e => {
        const eventDate = new Date(e.date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate.getTime() === today.getTime();
      });
    } else if (this.selectedDate === 'week') {
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() + 7);
      filtered = filtered.filter(e => new Date(e.date) >= today && new Date(e.date) <= weekEnd);
    } else if (this.selectedDate === 'month') {
      const monthEnd = new Date(today);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      filtered = filtered.filter(e => new Date(e.date) >= today && new Date(e.date) <= monthEnd);
    } else if (this.selectedDate === 'upcoming') {
      filtered = filtered.filter(e => new Date(e.date) >= today);
    }

    this.filteredEvents = filtered;
    this.sortEvents();
    this.updatePagination();
    this.cdr.detectChanges();
  }

  // ============ SORTING ============
  sortEvents(): void {
    switch (this.sortBy) {
      case 'date':
        this.filteredEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'name':
        this.filteredEvents.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'price':
        this.filteredEvents.sort((a, b) => a.price - b.price);
        break;
      case 'popularity':
        this.filteredEvents.sort((a, b) => b.attendees - a.attendees);
        break;
    }
  }

  // ============ FILTER ACTIONS ============
  selectCategory(categoryId: string): void {
    this.selectedCategory = categoryId;
    this.currentPage = 1;
    this.filterEvents();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filterEvents();
  }

  resetFilters(): void {
    this.showPastEvents = false;
    this.searchQuery = '';
    this.selectedCategory = 'all';
    this.selectedDate = 'all';
    this.selectedCity = 'all';
    this.selectedPrice = 'all';
    this.sortBy = 'date';
    this.currentPage = 1;
    this.filterEvents();
  }

  // ============ FAVORITES ============
  toggleFavorite(event: Event): void {
    event.isFavorite = this.eventFavoritesService.toggleFavorite(event);
    this.cdr.detectChanges();
  }

  onToggleFavorite(event: Event, e: MouseEvent): void {
    e.stopPropagation();
    this.toggleFavorite(event);
  }

  // syncFavoritesFromService(): void {
  //   const favoriteIds = this.eventFavoritesService.getFavoriteIds();
  //   this.events.forEach(e => {
  //     e.isFavorite = favoriteIds.includes(e.id);
  //   });
  // }

  loadFavorites(): void {
    this.syncFavoritesFromService();
  }

  // ============ EVENT MODAL ============
  viewEventDetails(event: Event): void {
    this.selectedEvent = event;
    this.showEventModal = true;
    this.resetReservationForm();
    document.body.style.overflow = 'hidden';
  }

  onViewDetails(event: Event, e: MouseEvent): void {
    e.stopPropagation();
    this.viewEventDetails(event);
  }

  closeEventModal(): void {
    this.showEventModal = false;
    this.selectedEvent = null;
    this.resetReservationForm();
    document.body.style.overflow = 'auto';
  }

  resetReservationForm(): void {
    this.reservationPersons = 2;
    this.reservationNotes = '';
    this.reservationError = null;
    this.reservationSuccess = null;
    this.isReserving = false;
  }

  // ============ QUICK RESERVATION ============
  incrementPersons(): void {
    if (this.reservationPersons < 20) {
      this.reservationPersons++;
    }
  }

  decrementPersons(): void {
    if (this.reservationPersons > 1) {
      this.reservationPersons--;
    }
  }

  quickReserveEvent(): void {
    if (!this.selectedEvent || this.selectedEvent.isPast) return;

    this.isReserving = true;
    this.reservationError = null;
    this.reservationSuccess = null;

    const categoryToType: { [key: string]: string } = {
      'Festival': 'ACTIVITY',
      'Concert': 'ACTIVITY',
      'Exposition': 'ACTIVITY',
      'Sport': 'ACTIVITY',
      'Théâtre': 'ACTIVITY',
      'Gastronomie': 'RESTAURANT',
      'Conférence': 'ACTIVITY',
      'Marché': 'ACTIVITY',
      'Religieux': 'ACTIVITY',
      'Famille': 'ACTIVITY'
    };

    const reservationType = categoryToType[this.selectedEvent.category] || 'ACTIVITY';
    const eventDate = new Date(this.selectedEvent.date);
    const formattedDate = eventDate.toISOString().split('T')[0];
    const timeMatch = this.selectedEvent.time?.match(/(\d{1,2})[h:](\d{2})/);
    const formattedTime = timeMatch 
      ? `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}` 
      : '10:00';

    const request: CreateReservationRequest = {
      establishmentName: this.selectedEvent.title,
      type: reservationType as any,
      reservationDate: formattedDate,
      reservationTime: formattedTime,
      numberOfPersons: this.reservationPersons,
      price: this.selectedEvent.price * this.reservationPersons,
      location: this.selectedEvent.city,
      notes: this.reservationNotes 
        ? `${this.reservationNotes} | Lieu: ${this.selectedEvent.venue}` 
        : `Lieu: ${this.selectedEvent.venue}`
    };

    this.reservationService.createReservation(request).subscribe({
      next: (reservation) => {
        this.isReserving = false;
        this.reservationSuccess = `Réservation confirmée ! Code: ${reservation.confirmationCode}`;
        setTimeout(() => {
          this.closeEventModal();
        }, 3000);
      },
      error: (err) => {
        console.error('Erreur réservation:', err);
        this.isReserving = false;
        this.reservationError = err?.message || 'Erreur lors de la réservation. Veuillez réessayer.';
      }
    });
  }

  // ============ SHARE & TICKETS ============
  shareEvent(event: Event, e: MouseEvent): void {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href + '/' + event.id
      });
    } else {
      navigator.clipboard.writeText(window.location.href + '/' + event.id);
      alert('Lien copié !');
    }
  }

  onShareEvent(event: Event, e: MouseEvent): void {
    this.shareEvent(event, e);
  }

  buyTicket(event: Event, e: MouseEvent): void {
    e.stopPropagation();
    if (event.ticketUrl) {
      window.open(event.ticketUrl, '_blank');
    }
  }

  onBuyTicket(event: Event, e: MouseEvent): void {
    this.buyTicket(event, e);
  }

  openMaps(event: Event): void {
    const query = encodeURIComponent(`${event.venue}, ${event.city}, Maroc`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  }

  // ============ PAGINATION ============
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredEvents.length / this.itemsPerPage);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
    
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedEvents = this.filteredEvents.slice(start, end);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
      this.cdr.detectChanges();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // ============ HELPERS ============
  formatAttendees(count: number): string {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(0) + 'K';
    }
    return count.toString();
  }

  getDaysUntil(date: Date): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(date);
    eventDate.setHours(0, 0, 0, 0);
    const diff = eventDate.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  getDateBadge(date: Date): { text: string; class: string } | null {
    const days = this.getDaysUntil(date);
    if (days < 0) {
      return { text: 'Passé', class: 'badge-past' };
    }
    if (days === 0) {
      return { text: 'Aujourd\'hui', class: 'badge-today' };
    }
    if (days === 1) {
      return { text: 'Demain', class: 'badge-tomorrow' };
    }
    if (days <= 7) {
      return { text: `Dans ${days} jours`, class: 'badge-soon' };
    }
    return null;
  }

  trackByEventId(index: number, event: Event): number {
    return event.id;
  }

  onImageError(event: any): void {
    event.target.src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800';
  }
}