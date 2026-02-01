import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Etablissement {
  id: string;
  name: string;
  type: EtablissementType;
  description: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  logoUrl: string;
  coverImageUrl: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isActive: boolean;
  ownerName: string;
  ownerEmail: string;
  createdAt: string;
  updatedAt: string | null;
  verifiedAt: string | null;
  verifiedBy: string | null;
}

export type EtablissementType = 'hotel' | 'restaurant' | 'spa' | 'activity' | 'site' | 'transport';

export interface EtablissementTypeInfo {
  id: EtablissementType;
  name: string;
  icon: string;
  color: string;
}

@Injectable({
  providedIn: 'root'
})
export class EtablissementsService {

  private readonly STORAGE_KEY = 'gogenius_etablissements';

  private etablissementsSubject = new BehaviorSubject<Etablissement[]>([]);
  public etablissements$ = this.etablissementsSubject.asObservable();

  public readonly types: EtablissementTypeInfo[] = [
    { id: 'hotel', name: 'Hôtel', icon: 'bi-building', color: '#3b82f6' },
    { id: 'restaurant', name: 'Restaurant', icon: 'bi-cup-hot', color: '#f59e0b' },
    { id: 'spa', name: 'Spa & Bien-être', icon: 'bi-droplet', color: '#8b5cf6' },
    { id: 'activity', name: 'Activité', icon: 'bi-bicycle', color: '#10b981' },
    { id: 'site', name: 'Site touristique', icon: 'bi-geo-alt', color: '#ef4444' },
    { id: 'transport', name: 'Transport', icon: 'bi-car-front', color: '#6366f1' }
  ];

  public readonly cities: string[] = [
    'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 
    'Meknès', 'Oujda', 'Kenitra', 'Tétouan', 'Essaouira', 'Chefchaouen',
    'Ouarzazate', 'Ifrane', 'El Jadida', 'Mohammedia'
  ];

  constructor() {
    this.loadFromStorage();
  }

  // ==================== STORAGE ====================

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        console.log('[EtablissementsService] Loaded from localStorage:', data.length, 'items');
        this.etablissementsSubject.next(data);
      } else {
        console.log('[EtablissementsService] No data in localStorage, initializing demo data');
        this.initDemoData();
      }
    } catch (error) {
      console.error('[EtablissementsService] Error loading from localStorage:', error);
      this.initDemoData();
    }
  }

  private saveToStorage(): void {
    try {
      const data = this.etablissementsSubject.value;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      console.log('[EtablissementsService] Saved to localStorage:', data.length, 'items');
    } catch (error) {
      console.error('[EtablissementsService] Error saving to localStorage:', error);
    }
  }

  // ==================== CRUD ====================

  getAll(): Etablissement[] {
    return this.etablissementsSubject.value;
  }

  getById(id: string): Etablissement | undefined {
    return this.etablissementsSubject.value.find(e => e.id === id);
  }

  create(data: Partial<Etablissement>): Etablissement {
    console.log('[EtablissementsService] Creating new etablissement:', data);

    const newEtablissement: Etablissement = {
      id: 'etab_' + Date.now(),
      name: data.name || '',
      type: (data.type as EtablissementType) || 'restaurant',
      description: data.description || '',
      address: data.address || '',
      city: data.city || '',
      postalCode: data.postalCode || '',
      phone: data.phone || '',
      email: data.email || '',
      website: data.website || '',
      logoUrl: '',
      coverImageUrl: this.getDefaultCover((data.type as EtablissementType) || 'restaurant'),
      rating: 0,
      reviewCount: 0,
      isVerified: false,
      isActive: data.isActive !== undefined ? data.isActive : true,
      ownerName: data.ownerName || '',
      ownerEmail: data.ownerEmail || '',
      createdAt: new Date().toISOString(),
      updatedAt: null,
      verifiedAt: null,
      verifiedBy: null
    };

    // Get current array, add new item, emit and save
    const currentList = [...this.etablissementsSubject.value];
    currentList.push(newEtablissement);
    
    this.etablissementsSubject.next(currentList);
    this.saveToStorage();
    
    console.log('[EtablissementsService] Created successfully:', newEtablissement.id);
    return newEtablissement;
  }

  update(id: string, data: Partial<Etablissement>): Etablissement | null {
    console.log('[EtablissementsService] Updating etablissement:', id, data);

    const currentList = [...this.etablissementsSubject.value];
    const index = currentList.findIndex(e => e.id === id);
    
    if (index === -1) {
      console.error('[EtablissementsService] Etablissement not found:', id);
      return null;
    }

    // Create updated object
    const updated: Etablissement = {
      ...currentList[index],
      ...data,
      id: currentList[index].id,
      createdAt: currentList[index].createdAt,
      updatedAt: new Date().toISOString()
    };

    // Replace in array
    currentList[index] = updated;
    
    // Emit new array and save
    this.etablissementsSubject.next(currentList);
    this.saveToStorage();
    
    console.log('[EtablissementsService] Updated successfully:', id);
    return updated;
  }

  delete(id: string): boolean {
    console.log('[EtablissementsService] Deleting etablissement:', id);

    const currentList = this.etablissementsSubject.value;
    const filteredList = currentList.filter(e => e.id !== id);
    
    if (filteredList.length === currentList.length) {
      console.error('[EtablissementsService] Etablissement not found:', id);
      return false;
    }

    this.etablissementsSubject.next(filteredList);
    this.saveToStorage();
    
    console.log('[EtablissementsService] Deleted successfully:', id);
    return true;
  }

  // ==================== ACTIONS COLLABORATEUR ====================

  verify(id: string, collaboratorName: string): Etablissement | null {
    console.log('[EtablissementsService] Verifying etablissement:', id);
    return this.update(id, {
      isVerified: true,
      verifiedAt: new Date().toISOString(),
      verifiedBy: collaboratorName
    });
  }

  unverify(id: string): Etablissement | null {
    console.log('[EtablissementsService] Unverifying etablissement:', id);
    return this.update(id, {
      isVerified: false,
      verifiedAt: null,
      verifiedBy: null
    });
  }

  toggleActive(id: string): Etablissement | null {
    const etablissement = this.getById(id);
    if (!etablissement) return null;
    console.log('[EtablissementsService] Toggling active:', id, '→', !etablissement.isActive);
    return this.update(id, { isActive: !etablissement.isActive });
  }

  // ==================== HELPERS ====================

  getTypeInfo(type: EtablissementType): EtablissementTypeInfo {
    return this.types.find(t => t.id === type) || this.types[0];
  }

  getDefaultCover(type: EtablissementType): string {
    const covers: { [key: string]: string } = {
      hotel: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      spa: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800',
      activity: 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800',
      site: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=800',
      transport: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800'
    };
    return covers[type] || covers['restaurant'];
  }

  getStats(): { total: number; verified: number; active: number; pending: number; byType: { [key: string]: number } } {
    const all = this.etablissementsSubject.value;
    const byType: { [key: string]: number } = {};
    
    this.types.forEach(t => {
      byType[t.id] = all.filter(e => e.type === t.id).length;
    });

    return {
      total: all.length,
      verified: all.filter(e => e.isVerified).length,
      active: all.filter(e => e.isActive).length,
      pending: all.filter(e => !e.isVerified).length,
      byType
    };
  }

  // ==================== DEMO DATA ====================

  initDemoData(): void {
    const collaboratorName = localStorage.getItem('fullname') || 'Collaborateur';
    
    const demoData: Etablissement[] = [
      {
        id: 'etab_001',
        name: 'La Table du Palais - Marrakech',
        type: 'restaurant',
        description: 'Restaurant gastronomique proposant une cuisine marocaine raffinée avec vue panoramique sur la place Jemaa el-Fna.',
        address: '45 Avenue Mohammed V, Médina',
        city: 'Marrakech',
        postalCode: '40000',
        phone: '+212 5 24 44 55 66',
        email: 'marrakech@tabledupalais.ma',
        website: 'www.tabledupalais.ma',
        logoUrl: '',
        coverImageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
        rating: 4.7,
        reviewCount: 342,
        isVerified: true,
        isActive: true,
        ownerName: 'Fatima Zahra Alaoui',
        ownerEmail: 'fz.alaoui@tabledupalais.ma',
        createdAt: '2025-06-15T10:00:00Z',
        updatedAt: null,
        verifiedAt: '2025-07-01T09:00:00Z',
        verifiedBy: collaboratorName
      },
      {
        id: 'etab_002',
        name: 'La Table du Palais - Fès',
        type: 'restaurant',
        description: 'Succursale de Fès au cœur de la médina. Cuisine traditionnelle fassi dans un riad du XVIIe siècle.',
        address: '12 Derb El Miter, Fès El Bali',
        city: 'Fès',
        postalCode: '30000',
        phone: '+212 5 35 63 78 90',
        email: 'fes@tabledupalais.ma',
        website: 'www.tabledupalais.ma/fes',
        logoUrl: '',
        coverImageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
        rating: 4.5,
        reviewCount: 187,
        isVerified: true,
        isActive: true,
        ownerName: 'Karim Bennani',
        ownerEmail: 'k.bennani@tabledupalais.ma',
        createdAt: '2025-08-20T11:00:00Z',
        updatedAt: null,
        verifiedAt: '2025-09-05T10:00:00Z',
        verifiedBy: collaboratorName
      },
      {
        id: 'etab_003',
        name: 'La Table du Palais - Tanger',
        type: 'restaurant',
        description: 'Nouvelle ouverture avec terrasse vue mer. Cuisine fusion maroco-méditerranéenne et produits frais du port.',
        address: '78 Boulevard Mohammed VI, Corniche',
        city: 'Tanger',
        postalCode: '90000',
        phone: '+212 5 39 33 44 55',
        email: 'tanger@tabledupalais.ma',
        website: 'www.tabledupalais.ma/tanger',
        logoUrl: '',
        coverImageUrl: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800',
        rating: 4.3,
        reviewCount: 89,
        isVerified: false,
        isActive: true,
        ownerName: 'Sara Tazi',
        ownerEmail: 's.tazi@tabledupalais.ma',
        createdAt: '2025-11-10T09:00:00Z',
        updatedAt: null,
        verifiedAt: null,
        verifiedBy: null
      }
    ];

    console.log('[EtablissementsService] Initializing demo data:', demoData.length, 'items');
    this.etablissementsSubject.next(demoData);
    this.saveToStorage();
  }

  resetToDemo(): void {
    console.log('[EtablissementsService] Resetting to demo data');
    localStorage.removeItem(this.STORAGE_KEY);
    this.initDemoData();
  }
}