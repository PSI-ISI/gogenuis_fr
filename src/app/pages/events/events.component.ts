import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Event {
  id: number;
  title: string;
  description: string;
  image: string;
  date: Date;
  time: string;
  location: string;
  city: string;
  price: number;
  category: string;
  categoryColor: string;
  attendees: number;
  views: number;
  isFavorite: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  count?: number;
}

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsComponent implements OnInit {

  // View mode
  viewMode: 'grid' | 'list' = 'grid';

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
  cities: string[] = ['Paris', 'Lyon', 'Marseille', 'Nice', 'Bordeaux', 'Toulouse', 'Nantes'];

  categories: Category[] = [
    { id: 'all', name: 'Tous', icon: 'bi bi-grid' },
    { id: 'salon', name: 'Salons', icon: 'bi bi-building', count: 8 },
    { id: 'festival', name: 'Festivals', icon: 'bi bi-music-note-beamed', count: 12 },
    { id: 'sport', name: 'Sport', icon: 'bi bi-trophy', count: 6 },
    { id: 'culture', name: 'Culture', icon: 'bi bi-palette', count: 15 },
    { id: 'gastronomie', name: 'Gastronomie', icon: 'bi bi-cup-hot', count: 9 },
    { id: 'business', name: 'Business', icon: 'bi bi-briefcase', count: 4 }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadEvents();
    this.filterEvents();
  }

  loadEvents(): void {
    // Mock data - À remplacer par un appel API
    this.events = [
      {
        id: 1,
        title: 'Salon International du Tourisme',
        description: 'Découvrez les dernières tendances du tourisme mondial avec plus de 200 exposants venus des quatre coins du globe.',
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
        date: new Date('2026-02-15'),
        time: '09:00 - 18:00',
        location: 'Paris Expo',
        city: 'Paris',
        price: 25,
        category: 'SALON',
        categoryColor: '#1a5f7a',
        attendees: 1250,
        views: 4500,
        isFavorite: false
      },
      {
        id: 2,
        title: 'Festival Gastronomique de Lyon',
        description: 'Une célébration des saveurs locales avec les meilleurs chefs de la région lyonnaise.',
        image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
        date: new Date('2026-02-22'),
        time: '11:00 - 23:00',
        location: 'Place Bellecour',
        city: 'Lyon',
        price: 0,
        category: 'FESTIVAL',
        categoryColor: '#e63946',
        attendees: 3200,
        views: 8900,
        isFavorite: true
      },
      {
        id: 3,
        title: 'Marathon de Nice',
        description: 'Parcourez la magnifique Côte d\'Azur lors de ce marathon international.',
        image: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800',
        date: new Date('2026-03-08'),
        time: '07:00 - 14:00',
        location: 'Promenade des Anglais',
        city: 'Nice',
        price: 45,
        category: 'SPORT',
        categoryColor: '#2a9d8f',
        attendees: 8500,
        views: 12000,
        isFavorite: false
      },
      {
        id: 4,
        title: 'Exposition Art Moderne',
        description: 'Une rétrospective exceptionnelle des œuvres majeures du XXe siècle.',
        image: 'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=800',
        date: new Date('2026-02-01'),
        time: '10:00 - 19:00',
        location: 'Musée d\'Art Contemporain',
        city: 'Marseille',
        price: 15,
        category: 'CULTURE',
        categoryColor: '#9b5de5',
        attendees: 890,
        views: 3400,
        isFavorite: false
      },
      {
        id: 5,
        title: 'Salon du Vin de Bordeaux',
        description: 'Dégustez les meilleurs crus de la région bordelaise avec plus de 150 vignerons.',
        image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800',
        date: new Date('2026-03-20'),
        time: '10:00 - 20:00',
        location: 'Palais des Congrès',
        city: 'Bordeaux',
        price: 35,
        category: 'GASTRONOMIE',
        categoryColor: '#f4a261',
        attendees: 2100,
        views: 6700,
        isFavorite: true
      },
      {
        id: 6,
        title: 'Forum Tech Innovation',
        description: 'Rencontrez les startups qui façonnent le monde de demain lors de ce forum dédié à l\'innovation.',
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
        date: new Date('2026-04-05'),
        time: '09:00 - 18:00',
        location: 'Centre de Conférences',
        city: 'Toulouse',
        price: 50,
        category: 'BUSINESS',
        categoryColor: '#457b9d',
        attendees: 1800,
        views: 5200,
        isFavorite: false
      },
      {
        id: 7,
        title: 'Concert Symphonique en Plein Air',
        description: 'L\'Orchestre National de France joue les plus grands classiques sous les étoiles.',
        image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800',
        date: new Date('2026-06-15'),
        time: '20:00 - 23:00',
        location: 'Parc de la Tête d\'Or',
        city: 'Lyon',
        price: 30,
        category: 'CULTURE',
        categoryColor: '#9b5de5',
        attendees: 5000,
        views: 15000,
        isFavorite: false
      },
      {
        id: 8,
        title: 'Foire aux Vins de Nantes',
        description: 'Plus de 200 producteurs vous font découvrir leurs meilleurs millésimes.',
        image: 'https://images.unsplash.com/photo-1474722883778-792e7990302f?w=800',
        date: new Date('2026-04-12'),
        time: '10:00 - 19:00',
        location: 'Parc des Expositions',
        city: 'Nantes',
        price: 12,
        category: 'GASTRONOMIE',
        categoryColor: '#f4a261',
        attendees: 3500,
        views: 8200,
        isFavorite: false
      },
      {
        id: 9,
        title: 'Tournoi de Tennis Open',
        description: 'Assistez aux matchs des meilleurs joueurs mondiaux dans ce tournoi ATP.',
        image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800',
        date: new Date('2026-05-20'),
        time: '10:00 - 21:00',
        location: 'Stade Roland Garros',
        city: 'Paris',
        price: 75,
        category: 'SPORT',
        categoryColor: '#2a9d8f',
        attendees: 12000,
        views: 45000,
        isFavorite: true
      },
      {
        id: 10,
        title: 'Festival de Jazz de Nice',
        description: 'Une semaine de concerts avec les plus grands noms du jazz international.',
        image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800',
        date: new Date('2026-07-10'),
        time: '18:00 - 02:00',
        location: 'Place Masséna',
        city: 'Nice',
        price: 40,
        category: 'FESTIVAL',
        categoryColor: '#e63946',
        attendees: 8000,
        views: 22000,
        isFavorite: false
      },
      {
        id: 11,
        title: 'Salon de l\'Automobile',
        description: 'Découvrez les dernières innovations automobiles et les véhicules du futur.',
        image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800',
        date: new Date('2026-10-01'),
        time: '10:00 - 20:00',
        location: 'Paris Expo Porte de Versailles',
        city: 'Paris',
        price: 20,
        category: 'SALON',
        categoryColor: '#1a5f7a',
        attendees: 25000,
        views: 80000,
        isFavorite: false
      },
      {
        id: 12,
        title: 'Course Cycliste du Sud',
        description: 'Une course de 150 km à travers les paysages pittoresques de la Provence.',
        image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800',
        date: new Date('2026-05-05'),
        time: '08:00 - 16:00',
        location: 'Départ: Vieux Port',
        city: 'Marseille',
        price: 0,
        category: 'SPORT',
        categoryColor: '#2a9d8f',
        attendees: 2000,
        views: 5500,
        isFavorite: false
      }
    ];
  }

  filterEvents(): void {
    let filtered = [...this.events];

    // Search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(e => 
        e.title.toLowerCase().includes(query) ||
        e.description.toLowerCase().includes(query) ||
        e.city.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(e => 
        e.category.toLowerCase() === this.selectedCategory.toLowerCase()
      );
    }

    // City filter
    if (this.selectedCity !== 'all') {
      filtered = filtered.filter(e => e.city === this.selectedCity);
    }

    // Price filter
    if (this.selectedPrice === 'free') {
      filtered = filtered.filter(e => e.price === 0);
    } else if (this.selectedPrice === 'paid') {
      filtered = filtered.filter(e => e.price > 0);
    }

    // Date filter
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
      filtered = filtered.filter(e => e.date >= today && e.date <= weekEnd);
    } else if (this.selectedDate === 'month') {
      const monthEnd = new Date(today);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      filtered = filtered.filter(e => e.date >= today && e.date <= monthEnd);
    } else if (this.selectedDate === 'upcoming') {
      filtered = filtered.filter(e => e.date >= today);
    }

    this.filteredEvents = filtered;
    this.sortEvents();
    this.updatePagination();
  }

  sortEvents(): void {
    switch (this.sortBy) {
      case 'date':
        this.filteredEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
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

  selectCategory(categoryId: string): void {
    this.selectedCategory = categoryId;
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
    this.filterEvents();
  }

  toggleFavorite(event: Event): void {
    event.isFavorite = !event.isFavorite;
    // TODO: Appeler l'API pour sauvegarder
  }

  viewEventDetails(event: Event): void {
    // TODO: Navigation vers la page détail
    console.log('View event:', event.id);
    // this.router.navigate(['/events', event.id]);
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredEvents.length / this.itemsPerPage);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}