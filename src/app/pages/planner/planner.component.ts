import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 
import { CITIES_CONFIG, CATEGORIES_CONFIG, TIME_SLOTS_CONFIG, SMART_TIPS } from '../../dataset/planner.config';
import { REAL_SUGGESTIONS, Suggestion } from '../../dataset/planner-suggestions.data';
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
  timeSlots = JSON.parse(JSON.stringify(TIME_SLOTS_CONFIG));

  // Step 3: Categories / Preferences
  categories = JSON.parse(JSON.stringify(CATEGORIES_CONFIG));

  // Step 4: City Selection
  cities = JSON.parse(JSON.stringify(CITIES_CONFIG));

  loadingText = 'Analyse de vos préférences...';

  // Results
  generatedPlans: GeneratedPlan[] = [];
  selectedPlan: GeneratedPlan | null = null;
  activePlanIndex = 0;

  // Animation
  budgetAnimationValue = 0;

  constructor(private cd: ChangeDetectorRef) { }

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

    // Séquence d'animation
    this.loadingText = 'Analyse de vos préférences...';

    setTimeout(() => {
      const city = this.getSelectedCity()?.name || 'votre destination';
      this.loadingText = `Recherche des meilleurs lieux à ${city}...`;
    }, 400);

    setTimeout(() => {
      // 1. Créer les plans
      this.generatedPlans = this.createMockPlans();
      
      // 2. Changer les états
      this.isGenerating = false;
      this.showResults = true;

      // 3. IMPORTANT : Forcer Angular à détecter les changements et mettre à jour l'écran
      this.cd.detectChanges();
      
    }, 1000); 
  }
  createMockPlans(): GeneratedPlan[] {
    const selectedCity = this.getSelectedCity()?.name || 'Casablanca';
    const selectedSlots = this.timeSlots.filter((t: any) => t.selected);

    // Plan Économique
    const economiquePlan: GeneratedPlan = {
      id: 1,
      title: 'Plan Économique 💰',
      totalBudget: Math.round(this.budget * 0.6),
      savingsPercentage: 40,
      dayPlans: this.generateDayPlans(selectedSlots, 'economique', selectedCity),
      tips: [
        SMART_TIPS.economique[0],
        `Profitez des parcs gratuits de ${selectedCity}`,
        'Évitez les zones trop touristiques'
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
        SMART_TIPS.equilibre[2],
        'Un mix parfait entre culture et détente',
        SMART_TIPS.equilibre[1]
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
        SMART_TIPS.confort[0],
        `Les meilleurs spots VIP de ${selectedCity}`,
        SMART_TIPS.confort[1]
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
    console.log('🔍 Recherche de données pour :', city);

    // 1. Filtrer par ville (insensible à la casse)
    // On normalise les noms (ex: "Fès" vs "Fes")
    let filtered = REAL_SUGGESTIONS.filter(s =>
      s.city.toLowerCase().includes(city.toLowerCase()) ||
      city.toLowerCase().includes(s.city.toLowerCase())
    );

    // Fallback : Si aucune donnée trouvée pour cette ville (ex: Agadir non présent dans le set),
    // on renvoie tout pour ne pas avoir un écran vide lors de la démo
    if (filtered.length === 0) {
      console.warn('⚠️ Pas de données pour cette ville, affichage global.');
      filtered = REAL_SUGGESTIONS;
    }

    // 2. Filtrer par budget / type de plan
    if (planType === 'economique') {
      // On garde les lieux pas chers (Niveau 0, 1) et parfois 2
      return filtered.filter(s => s.priceLevel <= 1);
    }
    else if (planType === 'confort') {
      // On privilégie le confort et le luxe (Niveau 2 et 3)
      const luxe = filtered.filter(s => s.priceLevel >= 2);
      return luxe.length > 0 ? luxe : filtered;
    }

    // Par défaut (Equilibré) : on renvoie une sélection mixte
    return filtered;
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
  window.print(); 
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

  // Méthode sécurisée avec les liens HD frais
  getPlaceImage(suggestion: Suggestion): string {
    // 1. Priorité à l'image réelle si elle existe
    if (suggestion.image && suggestion.image.startsWith('http')) {
      return `url('${suggestion.image}')`;
    }

    // 2. Images de secours HD (Récupérées par script)
    const type = suggestion.type ? suggestion.type.toLowerCase() : '';
    const tags = suggestion.tags ? suggestion.tags.join(' ').toLowerCase() : '';
    
    if (type.includes('restaurant') || type.includes('diner')) {
        if (suggestion.priceLevel >= 3) {
            // Luxury restaurant interior
            return `url('https://plus.unsplash.com/premium_photo-1670984940206-0318b607fb9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8THV4dXJ5JTIwcmVzdGF1cmFudCUyMGludGVyaW9yfGVufDB8fHx8MTc2OTkwOTI5MXww&ixlib=rb-4.1.0&q=80&w=600')`;
        }
        // Moroccan Couscous par défaut
        return `url('https://plus.unsplash.com/premium_photo-1664391688423-7cb847237bcd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8TW9yb2NjYW4lMjBDb3VzY291c3xlbnwwfHx8fDE3Njk5MDkyODh8MA&ixlib=rb-4.1.0&q=80&w=600')`;
    } 
    else if (type.includes('cafe') || type.includes('café') || type.includes('thé')) {
        // Cozy cafe interior
        return `url('https://plus.unsplash.com/premium_photo-1670984939630-8c3b98012f06?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8Q296eSUyMGNhZmUlMjBpbnRlcmlvcnxlbnwwfHx8fDE3Njk5MDkyOTN8MA&ixlib=rb-4.1.0&q=80&w=600')`;
    } 
    else if (type.includes('fast') || type.includes('burger')) {
        // Fast food burger
        return `url('https://plus.unsplash.com/premium_photo-1683655058728-415f4f2674bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8RmFzdCUyMGZvb2QlMjBidXJnZXJ8ZW58MHx8fHwxNzY5OTA5Mjk1fDA&ixlib=rb-4.1.0&q=80&w=600')`;
    } 
    else {
        // Mint tea Morocco (Générique)
        return `url('https://plus.unsplash.com/premium_photo-1682097617396-e510665e0dc8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8TWludCUyMHRlYSUyME1vcm9jY298ZW58MHx8fHwxNzY5OTA5MjkwfDA&ixlib=rb-4.1.0&q=80&w=600')`;
    }
  }

  // Génère un lien Google Maps vers le lieu
  getMapsUrl(suggestion: Suggestion): string {
    // On crée une requête de recherche : "Nom du lieu + Ville + Maroc"
    const query = encodeURIComponent(`${suggestion.name}, ${suggestion.city}, Maroc`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  }

}