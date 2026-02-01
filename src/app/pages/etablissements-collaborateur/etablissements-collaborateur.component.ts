import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { 
  EtablissementsService, 
  Etablissement, 
  EtablissementType, 
  EtablissementTypeInfo 
} from '../../sevices/etablissements.service';

@Component({
  selector: 'app-etablissements-collaborateur',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './etablissements-collaborateur.component.html',
  styleUrls: ['./etablissements-collaborateur.component.css']
})
export class EtablissementsCollaborateurComponent implements OnInit, OnDestroy {

  // Data
  etablissements: Etablissement[] = [];
  filteredEtablissements: Etablissement[] = [];
  private subscription!: Subscription;

  // Filters
  searchQuery = '';
  selectedType = 'all';
  selectedCity = 'all';
  selectedStatus = 'all'; // all, verified, unverified, active, inactive
  sortBy = 'recent';

  // Stats
  stats = {
    total: 0,
    verified: 0,
    active: 0,
    byType: {} as { [key: string]: number }
  };

  // Modal states
  showFormModal = false;
  showDeleteModal = false;
  showDetailModal = false;
  isEditMode = false;

  // Selected item
  selectedEtablissement: Etablissement | null = null;

  // Form data
  formData: Partial<Etablissement> = {};

  // Helpers
  types: EtablissementTypeInfo[] = [];
  cities: string[] = [];

  // Current collaborator
  collaboratorName = '';

  constructor(private etablissementsService: EtablissementsService) {
    this.types = this.etablissementsService.types;
    this.cities = this.etablissementsService.cities;
  }

  ngOnInit(): void {
    // Get collaborator name from localStorage
    this.collaboratorName = localStorage.getItem('fullname') || 'Collaborateur';
    console.log('[EtablissementsComponent] ngOnInit - collaboratorName:', this.collaboratorName);

    // Subscribe to etablissements
    this.subscription = this.etablissementsService.etablissements$.subscribe(data => {
      console.log('[EtablissementsComponent] Received data from service:', data.length, 'items');
      this.etablissements = data;
      this.applyFilters();
      this.updateStats();
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  // ==================== FILTERS ====================

  applyFilters(): void {
    let result = [...this.etablissements];

    // Search
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(e =>
        e.name.toLowerCase().includes(query) ||
        e.city.toLowerCase().includes(query) ||
        e.ownerName.toLowerCase().includes(query) ||
        e.email.toLowerCase().includes(query)
      );
    }

    // Type
    if (this.selectedType !== 'all') {
      result = result.filter(e => e.type === this.selectedType);
    }

    // City
    if (this.selectedCity !== 'all') {
      result = result.filter(e => e.city === this.selectedCity);
    }

    // Status
    switch (this.selectedStatus) {
      case 'verified':
        result = result.filter(e => e.isVerified);
        break;
      case 'unverified':
        result = result.filter(e => !e.isVerified);
        break;
      case 'active':
        result = result.filter(e => e.isActive);
        break;
      case 'inactive':
        result = result.filter(e => !e.isActive);
        break;
    }

    // Sort
    result.sort((a, b) => {
      switch (this.sortBy) {
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return b.rating - a.rating;
        case 'reviews':
          return b.reviewCount - a.reviewCount;
        default:
          return 0;
      }
    });

    this.filteredEtablissements = result;
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedType = 'all';
    this.selectedCity = 'all';
    this.selectedStatus = 'all';
    this.sortBy = 'recent';
    this.applyFilters();
  }

  // ==================== STATS ====================

  updateStats(): void {
    this.stats = this.etablissementsService.getStats();
  }

  // ==================== MODAL FORM ====================

  openCreateModal(): void {
    this.isEditMode = false;
    this.formData = {
      name: '',
      type: 'restaurant',
      description: '',
      address: '',
      city: 'Marrakech',
      postalCode: '',
      phone: '',
      email: '',
      website: '',
      ownerName: '',
      ownerEmail: '',
      isActive: true
    };
    this.showFormModal = true;
    console.log('[EtablissementsComponent] openCreateModal - formData:', this.formData);
  }

  openEditModal(etablissement: Etablissement): void {
    this.isEditMode = true;
    this.selectedEtablissement = etablissement;
    this.formData = { ...etablissement };
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.selectedEtablissement = null;
    this.formData = {};
  }

  submitForm(): void {
    console.log('[EtablissementsComponent] submitForm called');
    console.log('[EtablissementsComponent] isEditMode:', this.isEditMode);
    console.log('[EtablissementsComponent] formData:', this.formData);
    
    if (!this.validateForm()) {
      console.log('[EtablissementsComponent] Form validation failed');
      return;
    }

    if (this.isEditMode && this.selectedEtablissement) {
      console.log('[EtablissementsComponent] Updating:', this.selectedEtablissement.id);
      const result = this.etablissementsService.update(this.selectedEtablissement.id, this.formData);
      console.log('[EtablissementsComponent] Update result:', result);
    } else {
      console.log('[EtablissementsComponent] Creating new etablissement');
      const result = this.etablissementsService.create(this.formData);
      console.log('[EtablissementsComponent] Create result:', result);
    }

    this.closeFormModal();
  }

  validateForm(): boolean {
    return !!(
      this.formData.name &&
      this.formData.type &&
      this.formData.address &&
      this.formData.city &&
      this.formData.phone &&
      this.formData.email
    );
  }

  // ==================== DELETE ====================

  openDeleteModal(etablissement: Etablissement): void {
    this.selectedEtablissement = etablissement;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedEtablissement = null;
  }

  confirmDelete(): void {
    if (this.selectedEtablissement) {
      console.log('[EtablissementsComponent] Deleting:', this.selectedEtablissement.id);
      const result = this.etablissementsService.delete(this.selectedEtablissement.id);
      console.log('[EtablissementsComponent] Delete result:', result);
    }
    this.closeDeleteModal();
  }

  // ==================== DETAIL ====================

  openDetailModal(etablissement: Etablissement): void {
    this.selectedEtablissement = etablissement;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedEtablissement = null;
  }

  // ==================== ACTIONS ====================

  verifyEtablissement(etablissement: Etablissement): void {
    this.etablissementsService.verify(etablissement.id, this.collaboratorName);
  }

  unverifyEtablissement(etablissement: Etablissement): void {
    this.etablissementsService.unverify(etablissement.id);
  }

  toggleActive(etablissement: Etablissement): void {
    this.etablissementsService.toggleActive(etablissement.id);
  }

  // ==================== HELPERS ====================

  getTypeInfo(type: EtablissementType): EtablissementTypeInfo {
    return this.etablissementsService.getTypeInfo(type);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  formatDateTime(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getUniqueCities(): string[] {
    const cities = this.etablissements.map(e => e.city);
    return [...new Set(cities)].sort();
  }

  resetDemoData(): void {
    this.etablissementsService.resetToDemo();
  }
}