import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { Offer, OfferCategory, OffersService } from 'src/app/sevices/offers.service';

@Component({
  selector: 'app-offers',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.css']
})
export class OffersComponent implements OnInit, OnDestroy {

  offers: Offer[] = [];
  filteredOffers: Offer[] = [];
  
  searchQuery = '';
  statusFilter: string = 'all';
  categoryFilter: string = 'all';
  sortBy: string = 'newest';

  stats = { total: 0, active: 0, scheduled: 0, expired: 0, totalRevenue: 0 };

  offerCategories: OfferCategory[] = [
    { id: 'hebergement', name: 'Hébergement', icon: 'bi-building' },
    { id: 'restaurant', name: 'Restaurant', icon: 'bi-cup-hot' },
    { id: 'spa', name: 'Spa & Bien-être', icon: 'bi-droplet' },
    { id: 'activite', name: 'Activité', icon: 'bi-bicycle' },
    { id: 'transport', name: 'Transport', icon: 'bi-car-front' },
    { id: 'excursion', name: 'Excursion', icon: 'bi-compass' }
  ];

  showOfferModal = false;
  isEditMode = false;
  currentOfferStep = 1;
  totalOfferSteps = 4;
  isSubmitting = false;
  offerCreated = false;

  newOffer: Partial<Offer> = this.getEmptyOffer();
  editingOfferId: string | null = null;

  previewImages = [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
    'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400'
  ];

  showDeleteModal = false;
  offerToDelete: Offer | null = null;

  showDetailModal = false;
  selectedOffer: Offer | null = null;

  private subscription: Subscription = new Subscription();

  constructor(private offersService: OffersService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.offersService.offers$.subscribe(offers => {
        const etablissementId = localStorage.getItem('user_id') || 'demo-etablissement';
        this.offers = offers.filter(o => o.etablissementId === etablissementId);
        this.applyFilters();
        this.updateStats();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  applyFilters(): void {
    let result = [...this.offers];

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(o => 
        o.title.toLowerCase().includes(query) ||
        o.description.toLowerCase().includes(query)
      );
    }

    if (this.statusFilter !== 'all') {
      result = result.filter(o => o.status === this.statusFilter);
    }

    if (this.categoryFilter !== 'all') {
      result = result.filter(o => o.category === this.categoryFilter);
    }

    switch (this.sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'price-asc':
        result.sort((a, b) => a.finalPrice - b.finalPrice);
        break;
      case 'price-desc':
        result.sort((a, b) => b.finalPrice - a.finalPrice);
        break;
      case 'discount':
        result.sort((a, b) => b.discountValue - a.discountValue);
        break;
    }

    this.filteredOffers = result;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  updateStats(): void {
    this.stats = this.offersService.getStats();
  }

  openOfferModal(offer?: Offer): void {
    if (offer) {
      this.isEditMode = true;
      this.editingOfferId = offer.id;
      this.newOffer = { ...offer };
    } else {
      this.isEditMode = false;
      this.editingOfferId = null;
      this.newOffer = this.getEmptyOffer();
    }
    this.currentOfferStep = 1;
    this.offerCreated = false;
    this.showOfferModal = true;
  }

  closeOfferModal(): void {
    this.showOfferModal = false;
    this.isEditMode = false;
    this.editingOfferId = null;
    this.newOffer = this.getEmptyOffer();
    this.currentOfferStep = 1;
    this.offerCreated = false;
  }

  getEmptyOffer(): Partial<Offer> {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return {
      title: '',
      category: '',
      description: '',
      originalPrice: 0,
      discountType: 'percentage',
      discountValue: 0,
      startDate: today.toISOString().split('T')[0],
      endDate: nextWeek.toISOString().split('T')[0],
      maxUsage: null,
      conditions: '',
      image: ''
    };
  }

  nextOfferStep(): void {
    if (this.currentOfferStep < this.totalOfferSteps && this.canProceedOffer()) {
      this.currentOfferStep++;
    }
  }

  prevOfferStep(): void {
    if (this.currentOfferStep > 1) {
      this.currentOfferStep--;
    }
  }

  goToOfferStep(step: number): void {
    if (step <= this.currentOfferStep || this.canProceedOffer()) {
      this.currentOfferStep = step;
    }
  }

  getOfferStepTitle(): string {
    switch (this.currentOfferStep) {
      case 1: return 'Informations de base';
      case 2: return 'Tarification';
      case 3: return 'Dates et conditions';
      case 4: return 'Aperçu final';
      default: return '';
    }
  }

  canProceedOffer(): boolean {
    switch (this.currentOfferStep) {
      case 1:
        return !!(this.newOffer.title && this.newOffer.category);
      case 2:
        return !!(this.newOffer.originalPrice && this.newOffer.originalPrice > 0 && 
                  this.newOffer.discountValue && this.newOffer.discountValue > 0);
      case 3:
        return !!(this.newOffer.startDate && this.newOffer.endDate);
      default:
        return true;
    }
  }

  selectCategory(categoryId: string): void {
    this.newOffer.category = categoryId;
  }

  selectPreviewImage(img: string): void {
    this.newOffer.image = img;
  }

  calculateFinalPrice(): number {
    if (!this.newOffer.originalPrice || !this.newOffer.discountValue) return 0;
    
    if (this.newOffer.discountType === 'percentage') {
      return this.newOffer.originalPrice - (this.newOffer.originalPrice * this.newOffer.discountValue / 100);
    }
    return this.newOffer.originalPrice - this.newOffer.discountValue;
  }

  calculateSavings(): number {
    if (!this.newOffer.originalPrice) return 0;
    return this.newOffer.originalPrice - this.calculateFinalPrice();
  }

  submitOffer(): void {
    this.isSubmitting = true;

    setTimeout(() => {
      if (this.isEditMode && this.editingOfferId) {
        this.offersService.updateOffer(this.editingOfferId, this.newOffer);
      } else {
        this.offersService.createOffer(this.newOffer);
      }
      
      this.isSubmitting = false;
      this.offerCreated = true;
    }, 1000);
  }

  viewOffer(offer: Offer): void {
    this.selectedOffer = offer;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedOffer = null;
  }

  editOffer(offer: Offer): void {
    this.closeDetailModal();
    this.openOfferModal(offer);
  }

  toggleOfferStatus(offer: Offer): void {
    this.offersService.toggleOfferStatus(offer.id);
  }

  duplicateOffer(offer: Offer): void {
    this.offersService.duplicateOffer(offer.id);
  }

  confirmDelete(offer: Offer): void {
    this.offerToDelete = offer;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.offerToDelete = null;
  }

  deleteOffer(): void {
    if (this.offerToDelete) {
      this.offersService.deleteOffer(this.offerToDelete.id);
      this.showDeleteModal = false;
      this.offerToDelete = null;
      this.closeDetailModal();
    }
  }

  getCategoryIcon(categoryId: string): string {
    return this.offerCategories.find(c => c.id === categoryId)?.icon || 'bi-tag';
  }

  getCategoryName(categoryId: string): string {
    return this.offerCategories.find(c => c.id === categoryId)?.name || categoryId;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'status-active';
      case 'scheduled': return 'status-scheduled';
      case 'expired': return 'status-expired';
      case 'paused': return 'status-paused';
      default: return '';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'active': return 'Active';
      case 'scheduled': return 'Programmée';
      case 'expired': return 'Expirée';
      case 'paused': return 'En pause';
      default: return status;
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  getUsagePercentage(offer: Offer): number {
    if (!offer.maxUsage) return 0;
    return Math.round((offer.currentUsage / offer.maxUsage) * 100);
  }

  getDaysRemaining(endDate: string): number {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}