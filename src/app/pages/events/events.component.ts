import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  Event, 
  Category, 
  City,
  EVENTS_DATA, 
  CATEGORIES, 
  CITIES,
  getEventsByCategory,
  getEventsByCity,
  getFeaturedEvents,
  getUpcomingEvents,
  searchEvents,
  getEventById,
  getCategoryCount
} from '../../dataset/events-morocco-2026_data';
import { Router } from '@angular/router';


@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css'],
  // IMPORTANT: Default change detection pour éviter les problèmes de lazy loading
  changeDetection: ChangeDetectionStrategy.Default
})
export class EventsComponent implements OnInit, AfterViewInit {

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

  // Data from external file
  events: Event[] = [];
  filteredEvents: Event[] = [];
  paginatedEvents: Event[] = [];
  
  // Categories et Cities depuis le fichier externe
  categories: Category[] = [];
  cities: City[] = [];

  // Stats
  totalEvents = 0;
  freeEvents = 0;
  featuredEvents = 0;
  
  // Loading state
  isLoading = true;

  constructor(
    private router: Router, 
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.loadFavorites();
    this.calculateStats();
    this.filterEvents();
    this.isLoading = false;
  }

  ngAfterViewInit(): void {
    // Force la détection des changements après le rendu initial
    setTimeout(() => {
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    }, 0);
  }

  // ============ CHARGEMENT DES DONNÉES ============
  loadData(): void {
    // Charger les événements depuis le fichier externe
    this.events = EVENTS_DATA.map(e => ({...e})); // Deep copy
    
    // Charger les catégories avec le comptage
    this.categories = CATEGORIES.map(cat => ({
      ...cat,
      count: getCategoryCount(cat.id)
    }));
    
    // Charger les villes
    this.cities = [...CITIES];
    
    // Force update
    this.cdr.detectChanges();
  }

  calculateStats(): void {
    this.totalEvents = this.events.length;
    this.freeEvents = this.events.filter(e => e.price === 0).length;
    this.featuredEvents = this.events.filter(e => e.isFeatured).length;
  }

  // ============ FILTRAGE ============
  filterEvents(): void {
    let filtered = [...this.events];

    // Filtre de recherche
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(query) ||
        e.description.toLowerCase().includes(query) ||
        e.city.toLowerCase().includes(query) ||
        e.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filtre par catégorie
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(e => 
        e.category.toLowerCase() === this.selectedCategory.toLowerCase()
      );
    }

    // Filtre par ville
    if (this.selectedCity !== 'all') {
      filtered = filtered.filter(e => e.city === this.selectedCity);
    }

    // Filtre par prix
    if (this.selectedPrice === 'free') {
      filtered = filtered.filter(e => e.price === 0);
    } else if (this.selectedPrice === 'paid') {
      filtered = filtered.filter(e => e.price > 0);
    } else if (this.selectedPrice === 'under100') {
      filtered = filtered.filter(e => e.price > 0 && e.price <= 100);
    } else if (this.selectedPrice === 'under500') {
      filtered = filtered.filter(e => e.price > 0 && e.price <= 500);
    } else if (this.selectedPrice === 'premium') {
      filtered = filtered.filter(e => e.price > 500);
    }

    // Filtre par date
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
    } else if (this.selectedDate === 'past') {
      filtered = filtered.filter(e => new Date(e.date) < today);
    }

    this.filteredEvents = filtered;
    this.sortEvents();
    this.updatePagination();
    
    // Force la mise à jour de la vue
    this.cdr.detectChanges();
  }

  // ============ TRI ============
  sortEvents(): void {
    switch (this.sortBy) {
      case 'date':
        this.filteredEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'date-desc':
        this.filteredEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'name':
        this.filteredEvents.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'price':
        this.filteredEvents.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        this.filteredEvents.sort((a, b) => b.price - a.price);
        break;
      case 'popularity':
        this.filteredEvents.sort((a, b) => b.attendees - a.attendees);
        break;
      case 'views':
        this.filteredEvents.sort((a, b) => b.views - a.views);
        break;
    }
  }

  // ============ ACTIONS ============
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
    this.searchQuery = '';
    this.selectedCategory = 'all';
    this.selectedDate = 'all';
    this.selectedCity = 'all';
    this.selectedPrice = 'all';
    this.sortBy = 'date';
    this.currentPage = 1;
    this.filterEvents();
  }

  toggleFavorite(event: Event): void {
    event.isFavorite = !event.isFavorite;
    this.saveFavorites();
    this.cdr.detectChanges();
  }

  saveFavorites(): void {
    const favorites = this.events.filter(e => e.isFavorite).map(e => e.id);
    localStorage.setItem('event_favorites', JSON.stringify(favorites));
  }

  loadFavorites(): void {
    const saved = localStorage.getItem('event_favorites');
    if (saved) {
      const favoriteIds = JSON.parse(saved) as number[];
      this.events.forEach(e => {
        e.isFavorite = favoriteIds.includes(e.id);
      });
    }
  }

  viewEventDetails(event: Event): void {
    console.log('View event:', event.id);
    // this.router.navigate(['/events', event.id]);
  }

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

  buyTicket(event: Event, e: MouseEvent): void {
    e.stopPropagation();
    if (event.ticketUrl) {
      window.open(event.ticketUrl, '_blank');
    }
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

  previousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  // ============ HELPERS ============
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  formatPrice(price: number, priceType: string): string {
    if (price === 0 || priceType === 'free') {
      return 'Gratuit';
    }
    const formatted = price.toLocaleString('fr-FR') + ' MAD';
    if (priceType === 'starting_from') {
      return 'À partir de ' + formatted;
    }
    return formatted;
  }

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

  getCityNames(): string[] {
    return this.cities.map(c => c.name);
  }

  // TrackBy pour optimiser le rendu - IMPORTANT pour éviter le lazy loading bug
  trackByEventId(index: number, event: Event): number {
    return event.id;
  }

  // Gestion des erreurs d'images
  onImageError(event: any): void {
    event.target.src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800';
  }
}
















