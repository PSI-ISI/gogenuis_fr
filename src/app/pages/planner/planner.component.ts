import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { trigger, transition, style, animate, query, stagger, keyframes } from '@angular/animations';

interface TimeSlot {
  id: string;
  name: string;
  icon: string;
  timeRange: string;
  selected: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  selected: boolean;
}

interface City {
  id: string;
  name: string;
  image: string;
  selected: boolean;
}

interface Suggestion {
  id: number;
  name: string;
  type: string;
  typeIcon: string;
  image: string;
  address: string;
  city: string;
  priceRange: string;
  priceLevel: number;
  rating: number;
  reviewsCount: number;
  openingHours: string;
  description: string;
  tags: string[];
  isFavorite: boolean;
}

interface DayPlan {
  timeSlot: string;
  timeRange: string;
  icon: string;
  suggestion: Suggestion;
  estimatedBudget: number;
}

interface GeneratedPlan {
  id: number;
  title: string;
  totalBudget: number;
  savingsPercentage: number;
  dayPlans: DayPlan[];
  tips: string[];
}

@Component({
  selector: 'app-planner',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './planner.component.html',
  styleUrls: ['./planner.component.css'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerIn', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(80, [
            animate('0.4s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('scaleIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(50px)' }),
        animate('0.4s ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ]),
    trigger('bounceIn', [
      transition(':enter', [
        animate('0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)', keyframes([
          style({ opacity: 0, transform: 'scale(0.3)', offset: 0 }),
          style({ opacity: 1, transform: 'scale(1.05)', offset: 0.7 }),
          style({ transform: 'scale(1)', offset: 1 })
        ]))
      ])
    ])
  ]
})
export class PlannerComponent implements OnInit {

  // Wizard state
  currentStep = 1;
  totalSteps = 4;
  isGenerating = false;
  showResults = false;

  // Step 1: Budget (en MAD)
  budget = 200;
  minBudget = 50;
  maxBudget = 1000;
  budgetStep = 10;

  // Step 2: Time Slots
  timeSlots: TimeSlot[] = [
    { id: 'morning', name: 'Petit-déjeuner / Café', icon: 'bi-cup-hot-fill', timeRange: '07:00 - 10:00', selected: true },
    { id: 'lunch', name: 'Déjeuner', icon: 'bi-egg-fried', timeRange: '12:00 - 15:00', selected: true },
    { id: 'afternoon', name: 'Pause Café / Goûter', icon: 'bi-cake2', timeRange: '16:00 - 18:00', selected: false },
    { id: 'dinner', name: 'Dîner', icon: 'bi-moon-stars', timeRange: '19:00 - 22:00', selected: true },
    { id: 'relax', name: 'Détente / Repos', icon: 'bi-tree', timeRange: 'Flexible', selected: false },
    { id: 'activity', name: 'Activité / Sortie', icon: 'bi-bicycle', timeRange: 'Flexible', selected: false }
  ];

  // Step 3: Categories / Preferences
  categories: Category[] = [
    { id: 'economique', name: 'Économique', icon: 'bi-piggy-bank-fill', color: '#06d6a0', selected: true },
    { id: 'traditionnel', name: 'Cuisine Traditionnelle', icon: 'bi-shop', color: '#e85d04', selected: false },
    { id: 'moderne', name: 'Moderne / Tendance', icon: 'bi-stars', color: '#7209b7', selected: false },
    { id: 'healthy', name: 'Healthy / Bio', icon: 'bi-heart-pulse-fill', color: '#2a9d8f', selected: false },
    { id: 'fastfood', name: 'Fast Food', icon: 'bi-lightning-fill', color: '#f72585', selected: false },
    { id: 'cafe', name: 'Café / Salon de Thé', icon: 'bi-cup-straw', color: '#8b5a2b', selected: false },
    { id: 'nature', name: 'Plein Air / Nature', icon: 'bi-flower1', color: '#588157', selected: false },
    { id: 'culturel', name: 'Culturel / Historique', icon: 'bi-bank2', color: '#bc6c25', selected: false }
  ];

  // Step 4: City Selection
  cities: City[] = [
    { id: 'casablanca', name: 'Casablanca', image: 'https://images.unsplash.com/photo-1569383746724-6f1b882b8f46?w=400', selected: false },
    { id: 'rabat', name: 'Rabat', image: 'https://images.unsplash.com/photo-1570299437488-d430e1e677c7?w=400', selected: false },
    { id: 'marrakech', name: 'Marrakech', image: 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=400', selected: false },
    { id: 'fes', name: 'Fès', image: 'https://images.unsplash.com/photo-1549140600-78c9b8275e9d?w=400', selected: false },
    { id: 'tanger', name: 'Tanger', image: 'https://images.unsplash.com/photo-1553899017-a4c0e77a8c93?w=400', selected: false },
    { id: 'agadir', name: 'Agadir', image: 'https://images.unsplash.com/photo-1596627116790-af6f46dddbf7?w=400', selected: false }
  ];

  // Results
  generatedPlans: GeneratedPlan[] = [];
  selectedPlan: GeneratedPlan | null = null;
  activePlanIndex = 0;

  // Animation
  budgetAnimationValue = 0;

  constructor() {}

  ngOnInit(): void {
    this.budgetAnimationValue = this.budget;
    // Auto-select Casablanca by default
    this.cities[0].selected = true;
  }

  // ==================== NAVIGATION ====================

  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    } else {
      this.generatePlans();
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number): void {
    if (step <= this.currentStep || step === this.currentStep + 1) {
      this.currentStep = step;
    }
  }

  canProceed(): boolean {
    switch (this.currentStep) {
      case 1:
        return this.budget >= this.minBudget;
      case 2:
        return this.timeSlots.some(t => t.selected);
      case 3:
        return this.categories.some(c => c.selected);
      case 4:
        return this.cities.some(c => c.selected);
      default:
        return false;
    }
  }

  // ==================== STEP 1: BUDGET ====================

  onBudgetChange(): void {
    this.animateBudget();
  }

  animateBudget(): void {
    const target = this.budget;
    const diff = target - this.budgetAnimationValue;
    const step = diff / 10;

    const animate = () => {
      if (Math.abs(target - this.budgetAnimationValue) > 1) {
        this.budgetAnimationValue += step;
        requestAnimationFrame(animate);
      } else {
        this.budgetAnimationValue = target;
      }
    };
    animate();
  }

  getBudgetPercentage(): number {
    return ((this.budget - this.minBudget) / (this.maxBudget - this.minBudget)) * 100;
  }

  getBudgetLevel(): string {
    if (this.budget <= 100) return 'Très économique';
    if (this.budget <= 200) return 'Économique';
    if (this.budget <= 400) return 'Confortable';
    if (this.budget <= 700) return 'Généreux';
    return 'Sans limite';
  }

  getBudgetEmoji(): string {
    if (this.budget <= 100) return '🪙';
    if (this.budget <= 200) return '💵';
    if (this.budget <= 400) return '💰';
    if (this.budget <= 700) return '💎';
    return '👑';
  }

  setBudgetPreset(amount: number): void {
    this.budget = amount;
    this.animateBudget();
  }

  // ==================== STEP 2: TIME SLOTS ====================

  toggleTimeSlot(slot: TimeSlot): void {
    slot.selected = !slot.selected;
  }

  getSelectedTimeSlotsCount(): number {
    return this.timeSlots.filter(t => t.selected).length;
  }

  // ==================== STEP 3: CATEGORIES ====================

  toggleCategory(cat: Category): void {
    cat.selected = !cat.selected;
  }

  getSelectedCategoriesCount(): number {
    return this.categories.filter(c => c.selected).length;
  }

  // ==================== STEP 4: CITIES ====================

  toggleCity(city: City): void {
    // Allow only one city selection
    this.cities.forEach(c => c.selected = false);
    city.selected = true;
  }

  getSelectedCity(): City | undefined {
    return this.cities.find(c => c.selected);
  }

  // ==================== PLAN GENERATION ====================

  generatePlans(): void {
    this.isGenerating = true;
    this.showResults = false;

    setTimeout(() => {
      this.generatedPlans = this.createMockPlans();
      this.isGenerating = false;
      this.showResults = true;
    }, 2500);
  }

  createMockPlans(): GeneratedPlan[] {
    const selectedCity = this.getSelectedCity()?.name || 'Casablanca';
    const selectedSlots = this.timeSlots.filter(t => t.selected);

    // Plan Économique
    const economiquePlan: GeneratedPlan = {
      id: 1,
      title: 'Plan Économique 💰',
      totalBudget: Math.round(this.budget * 0.6),
      savingsPercentage: 40,
      dayPlans: this.generateDayPlans(selectedSlots, 'economique', selectedCity),
      tips: [
        'Privilégiez les snacks locaux pour le petit-déjeuner',
        'Les marchés offrent les meilleurs prix pour le déjeuner',
        'Évitez les zones touristiques pour économiser'
      ]
    };

    // Plan Équilibré
    const equilibrePlan: GeneratedPlan = {
      id: 2,
      title: 'Plan Équilibré ⚖️',
      totalBudget: Math.round(this.budget * 0.85),
      savingsPercentage: 15,
      dayPlans: this.generateDayPlans(selectedSlots, 'equilibre', selectedCity),
      tips: [
        'Un bon compromis qualité-prix',
        'Mélangez restaurants locaux et modernes',
        'Profitez des happy hours pour les cafés'
      ]
    };

    // Plan Confort
    const confortPlan: GeneratedPlan = {
      id: 3,
      title: 'Plan Confort ✨',
      totalBudget: Math.round(this.budget * 0.95),
      savingsPercentage: 5,
      dayPlans: this.generateDayPlans(selectedSlots, 'confort', selectedCity),
      tips: [
        'Expériences premium sélectionnées',
        'Ambiances soignées garanties',
        'Service de qualité assuré'
      ]
    };

    return [economiquePlan, equilibrePlan, confortPlan];
  }

  generateDayPlans(slots: TimeSlot[], planType: string, city: string): DayPlan[] {
    const suggestions = this.getMockSuggestions(city, planType);
    
    return slots.map((slot, index) => {
      const suggestion = suggestions[index % suggestions.length];
      const budgetMultiplier = planType === 'economique' ? 0.5 : planType === 'equilibre' ? 0.75 : 1;
      
      return {
        timeSlot: slot.name,
        timeRange: slot.timeRange,
        icon: slot.icon,
        suggestion: suggestion,
        estimatedBudget: Math.round((30 + Math.random() * 70) * budgetMultiplier)
      };
    });
  }

  getMockSuggestions(city: string, planType: string): Suggestion[] {
    const baseSuggestions: Suggestion[] = [
      {
        id: 1,
        name: 'Café Maure',
        type: 'Café',
        typeIcon: 'bi-cup-hot-fill',
        image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
        address: 'Ancienne Médina',
        city: city,
        priceRange: '15-30 MAD',
        priceLevel: 1,
        rating: 4.5,
        reviewsCount: 234,
        openingHours: '06:00 - 22:00',
        description: 'Café traditionnel marocain avec thé à la menthe et msemen frais.',
        tags: ['Traditionnel', 'Économique', 'Authentique'],
        isFavorite: false
      },
      {
        id: 2,
        name: 'Snack Populaire',
        type: 'Restaurant',
        typeIcon: 'bi-shop',
        image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400',
        address: 'Quartier Maarif',
        city: city,
        priceRange: '25-50 MAD',
        priceLevel: 1,
        rating: 4.3,
        reviewsCount: 567,
        openingHours: '11:00 - 23:00',
        description: 'Sandwichs, tajines express et plats du jour à petits prix.',
        tags: ['Rapide', 'Économique', 'Local'],
        isFavorite: false
      },
      {
        id: 3,
        name: 'Jardin Public',
        type: 'Espace Vert',
        typeIcon: 'bi-tree-fill',
        image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400',
        address: 'Centre Ville',
        city: city,
        priceRange: 'Gratuit',
        priceLevel: 0,
        rating: 4.2,
        reviewsCount: 890,
        openingHours: '06:00 - 20:00',
        description: 'Espace vert idéal pour se détendre et profiter du soleil.',
        tags: ['Gratuit', 'Nature', 'Famille'],
        isFavorite: false
      },
      {
        id: 4,
        name: 'Gargote du Coin',
        type: 'Restaurant',
        typeIcon: 'bi-egg-fried',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
        address: 'Derb Sultan',
        city: city,
        priceRange: '30-60 MAD',
        priceLevel: 2,
        rating: 4.6,
        reviewsCount: 345,
        openingHours: '12:00 - 16:00',
        description: 'Tajines maison, couscous du vendredi et plats mijotés.',
        tags: ['Traditionnel', 'Fait maison', 'Copieux'],
        isFavorite: false
      },
      {
        id: 5,
        name: 'Salon de Thé Moderne',
        type: 'Café',
        typeIcon: 'bi-cup-straw',
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
        address: 'Anfa',
        city: city,
        priceRange: '35-70 MAD',
        priceLevel: 2,
        rating: 4.4,
        reviewsCount: 421,
        openingHours: '08:00 - 23:00',
        description: 'Café branché avec pâtisseries maison et smoothies frais.',
        tags: ['Moderne', 'Wifi', 'Coworking'],
        isFavorite: false
      },
      {
        id: 6,
        name: 'Food Court Économique',
        type: 'Food Court',
        typeIcon: 'bi-grid-3x3-gap-fill',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
        address: 'Centre Commercial',
        city: city,
        priceRange: '40-80 MAD',
        priceLevel: 2,
        rating: 4.1,
        reviewsCount: 678,
        openingHours: '10:00 - 22:00',
        description: 'Plusieurs options de restauration à prix abordables.',
        tags: ['Varié', 'Climatisé', 'Familial'],
        isFavorite: false
      }
    ];

    // Adjust based on plan type
    if (planType === 'economique') {
      return baseSuggestions.filter(s => s.priceLevel <= 1);
    } else if (planType === 'confort') {
      return baseSuggestions.map(s => ({
        ...s,
        priceLevel: s.priceLevel + 1,
        priceRange: s.priceRange.replace(/\d+/g, (match) => String(parseInt(match) * 1.5))
      }));
    }
    return baseSuggestions;
  }

  // ==================== RESULTS ACTIONS ====================

  selectPlanTab(index: number): void {
    this.activePlanIndex = index;
  }

  toggleFavorite(suggestion: Suggestion): void {
    suggestion.isFavorite = !suggestion.isFavorite;
  }

  viewDetails(plan: GeneratedPlan): void {
    this.selectedPlan = plan;
  }

  closeDetails(): void {
    this.selectedPlan = null;
  }

  savePlan(plan: GeneratedPlan): void {
    console.log('Saving plan:', plan);
    alert(`Plan "${plan.title}" sauvegardé ! 🎉`);
  }

  sharePlan(plan: GeneratedPlan): void {
    console.log('Sharing plan:', plan);
    alert('Fonctionnalité de partage bientôt disponible !');
  }

  resetPlanner(): void {
    this.currentStep = 1;
    this.showResults = false;
    this.selectedPlan = null;
    this.generatedPlans = [];
    this.activePlanIndex = 0;
    this.budget = 200;
    this.timeSlots.forEach(t => t.selected = ['morning', 'lunch', 'dinner'].includes(t.id));
    this.categories.forEach(c => c.selected = c.id === 'economique');
    this.cities.forEach(c => c.selected = c.id === 'casablanca');
  }

  // ==================== HELPERS ====================

  getProgressWidth(): string {
    return `${(this.currentStep / this.totalSteps) * 100}%`;
  }

  getStepTitle(): string {
    const titles = [
      'Quel est votre budget pour la journée ?',
      'Quels moments voulez-vous planifier ?',
      'Quel type d\'expérience recherchez-vous ?',
      'Dans quelle ville êtes-vous ?'
    ];
    return titles[this.currentStep - 1];
  }

  getStepSubtitle(): string {
    const subtitles = [
      'Définissez votre budget maximum en Dirhams (MAD)',
      'Sélectionnez les créneaux horaires à organiser',
      'Choisissez vos préférences pour les suggestions',
      'Sélectionnez votre ville pour des recommandations locales'
    ];
    return subtitles[this.currentStep - 1];
  }

  getPriceLevelStars(level: number): string {
    return '💰'.repeat(level + 1);
  }
}