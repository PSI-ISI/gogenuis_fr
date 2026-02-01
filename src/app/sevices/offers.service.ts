import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Offer {
  id: string;
  title: string;
  category: string;
  description: string;
  originalPrice: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  finalPrice: number;
  startDate: string;
  endDate: string;
  maxUsage: number | null;
  currentUsage: number;
  conditions: string;
  image: string;
  status: 'active' | 'scheduled' | 'expired' | 'paused';
  createdAt: string;
  updatedAt: string;
  etablissementId: string;
}

export interface OfferCategory {
  id: string;
  name: string;
  icon: string;
}

@Injectable({
  providedIn: 'root'
})
export class OffersService {
  private readonly STORAGE_KEY = 'gogenius_offers';
  private offersSubject = new BehaviorSubject<Offer[]>([]);
  public offers$ = this.offersSubject.asObservable();

  constructor() {
    this.loadOffers();
  }

  private loadOffers(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      const offers = JSON.parse(stored) as Offer[];
      const updatedOffers = offers.map(o => this.updateOfferStatus(o));
      this.offersSubject.next(updatedOffers);
      this.saveToStorage(updatedOffers);
    } else {
      const demoOffers = this.getDemoOffers();
      this.offersSubject.next(demoOffers);
      this.saveToStorage(demoOffers);
    }
  }

  private saveToStorage(offers: Offer[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(offers));
  }

  private updateOfferStatus(offer: Offer): Offer {
    const now = new Date();
    const start = new Date(offer.startDate);
    const end = new Date(offer.endDate);

    if (offer.status === 'paused') return offer;

    if (now < start) {
      offer.status = 'scheduled';
    } else if (now > end) {
      offer.status = 'expired';
    } else {
      offer.status = 'active';
    }
    return offer;
  }

  getOffers(): Offer[] {
    return this.offersSubject.getValue();
  }

  getOffersByEtablissement(etablissementId: string): Offer[] {
    return this.getOffers().filter(o => o.etablissementId === etablissementId);
  }

  getOfferById(id: string): Offer | undefined {
    return this.getOffers().find(o => o.id === id);
  }

  createOffer(offerData: Partial<Offer>): Offer {
    const etablissementId = localStorage.getItem('user_id') || 'demo-etablissement';
    const now = new Date().toISOString();
    
    const finalPrice = this.calculateFinalPrice(
      offerData.originalPrice || 0,
      offerData.discountType || 'percentage',
      offerData.discountValue || 0
    );

    const newOffer: Offer = {
      id: 'offer-' + Date.now(),
      title: offerData.title || '',
      category: offerData.category || 'restaurant',
      description: offerData.description || '',
      originalPrice: offerData.originalPrice || 0,
      discountType: offerData.discountType || 'percentage',
      discountValue: offerData.discountValue || 0,
      finalPrice,
      startDate: offerData.startDate || now.split('T')[0],
      endDate: offerData.endDate || now.split('T')[0],
      maxUsage: offerData.maxUsage || null,
      currentUsage: 0,
      conditions: offerData.conditions || '',
      image: offerData.image || '',
      status: 'scheduled',
      createdAt: now,
      updatedAt: now,
      etablissementId
    };

    const updatedOffer = this.updateOfferStatus(newOffer);
    const offers = [...this.getOffers(), updatedOffer];
    this.offersSubject.next(offers);
    this.saveToStorage(offers);

    return updatedOffer;
  }

  updateOffer(id: string, updates: Partial<Offer>): Offer | null {
    const offers = this.getOffers();
    const index = offers.findIndex(o => o.id === id);
    
    if (index === -1) return null;

    const updatedOffer = {
      ...offers[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    if (updates.originalPrice || updates.discountType || updates.discountValue) {
      updatedOffer.finalPrice = this.calculateFinalPrice(
        updatedOffer.originalPrice,
        updatedOffer.discountType,
        updatedOffer.discountValue
      );
    }

    offers[index] = this.updateOfferStatus(updatedOffer);
    this.offersSubject.next(offers);
    this.saveToStorage(offers);

    return offers[index];
  }

  deleteOffer(id: string): boolean {
    const offers = this.getOffers().filter(o => o.id !== id);
    this.offersSubject.next(offers);
    this.saveToStorage(offers);
    return true;
  }

  toggleOfferStatus(id: string): Offer | null {
    const offer = this.getOfferById(id);
    if (!offer) return null;

    const newStatus = offer.status === 'paused' ? 'active' : 'paused';
    return this.updateOffer(id, { status: newStatus });
  }

  duplicateOffer(id: string): Offer | null {
    const original = this.getOfferById(id);
    if (!original) return null;

    return this.createOffer({
      ...original,
      title: original.title + ' (copie)',
      status: 'scheduled'
    });
  }

  private calculateFinalPrice(original: number, type: 'percentage' | 'fixed', value: number): number {
    if (type === 'percentage') {
      return original - (original * value / 100);
    }
    return original - value;
  }

  getStats(): { total: number; active: number; scheduled: number; expired: number; totalRevenue: number } {
    const offers = this.getOffers();
    const etablissementId = localStorage.getItem('user_id') || 'demo-etablissement';
    const myOffers = offers.filter(o => o.etablissementId === etablissementId);

    return {
      total: myOffers.length,
      active: myOffers.filter(o => o.status === 'active').length,
      scheduled: myOffers.filter(o => o.status === 'scheduled').length,
      expired: myOffers.filter(o => o.status === 'expired').length,
      totalRevenue: myOffers.reduce((sum, o) => sum + (o.currentUsage * o.finalPrice), 0)
    };
  }

  private getDemoOffers(): Offer[] {
    const etablissementId = localStorage.getItem('user_id') || 'demo-etablissement';
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    return [
      {
        id: 'offer-demo-1',
        title: 'Week-end Romantique -30%',
        category: 'hebergement',
        description: 'Profitez d\'un séjour inoubliable avec petit-déjeuner inclus et spa offert.',
        originalPrice: 2500,
        discountType: 'percentage',
        discountValue: 30,
        finalPrice: 1750,
        startDate: lastWeek.toISOString().split('T')[0],
        endDate: nextMonth.toISOString().split('T')[0],
        maxUsage: 50,
        currentUsage: 23,
        conditions: 'Valable du vendredi au dimanche uniquement.',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
        status: 'active',
        createdAt: lastWeek.toISOString(),
        updatedAt: today.toISOString(),
        etablissementId
      },
      {
        id: 'offer-demo-2',
        title: 'Menu Gastronomique Spécial',
        category: 'restaurant',
        description: 'Menu 5 services avec accord mets et vins.',
        originalPrice: 800,
        discountType: 'fixed',
        discountValue: 200,
        finalPrice: 600,
        startDate: today.toISOString().split('T')[0],
        endDate: nextWeek.toISOString().split('T')[0],
        maxUsage: 30,
        currentUsage: 8,
        conditions: 'Réservation obligatoire.',
        image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
        status: 'active',
        createdAt: today.toISOString(),
        updatedAt: today.toISOString(),
        etablissementId
      },
      {
        id: 'offer-demo-3',
        title: 'Forfait Spa Détente',
        category: 'spa',
        description: 'Accès illimité au spa + massage 1h.',
        originalPrice: 1200,
        discountType: 'percentage',
        discountValue: 25,
        finalPrice: 900,
        startDate: nextWeek.toISOString().split('T')[0],
        endDate: nextMonth.toISOString().split('T')[0],
        maxUsage: null,
        currentUsage: 0,
        conditions: 'Sur rendez-vous uniquement.',
        image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400',
        status: 'scheduled',
        createdAt: today.toISOString(),
        updatedAt: today.toISOString(),
        etablissementId
      },
      {
        id: 'offer-demo-4',
        title: 'Happy Hour -50%',
        category: 'restaurant',
        description: 'Toutes les boissons à moitié prix.',
        originalPrice: 100,
        discountType: 'percentage',
        discountValue: 50,
        finalPrice: 50,
        startDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: lastWeek.toISOString().split('T')[0],
        maxUsage: 100,
        currentUsage: 87,
        conditions: 'Du lundi au jeudi uniquement.',
        image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400',
        status: 'expired',
        createdAt: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: lastWeek.toISOString(),
        etablissementId
      }
    ];
  }
}