import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Event, EVENTS_DATA } from '../dataset/events-morocco-2026_data';

export interface EventFavorite {
  id: number;
  name: string;
  type: string;
  image: string;
  date: Date;
  city: string;
  price: number;
}

@Injectable({
  providedIn: 'root'
})
export class EventFavoritesService {
  
  private readonly STORAGE_KEY = 'event_favorites';
  private favoritesSubject = new BehaviorSubject<EventFavorite[]>([]);
  
  favorites$ = this.favoritesSubject.asObservable();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        const favoriteIds = JSON.parse(saved) as number[];
        const favorites = this.mapIdsToFavorites(favoriteIds);
        this.favoritesSubject.next(favorites);
      } catch (e) {
        console.error('Error loading favorites:', e);
        this.favoritesSubject.next([]);
      }
    }
  }

  private mapIdsToFavorites(ids: number[]): EventFavorite[] {
    return EVENTS_DATA
      .filter(e => ids.includes(e.id))
      .map(e => ({
        id: e.id,
        name: e.title,
        type: e.category,
        image: e.image,
        date: e.date,
        city: e.city,
        price: e.price
      }));
  }

  private saveToStorage(ids: number[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(ids));
  }

  getFavorites(): EventFavorite[] {
    return this.favoritesSubject.getValue();
  }

  getFavoriteIds(): number[] {
    return this.getFavorites().map(f => f.id);
  }

  isFavorite(eventId: number): boolean {
    return this.getFavoriteIds().includes(eventId);
  }

  addFavorite(event: Event): void {
    const current = this.getFavorites();
    if (!current.find(f => f.id === event.id)) {
      const newFavorite: EventFavorite = {
        id: event.id,
        name: event.title,
        type: event.category,
        image: event.image,
        date: event.date,
        city: event.city,
        price: event.price
      };
      const updated = [newFavorite, ...current];
      this.favoritesSubject.next(updated);
      this.saveToStorage(updated.map(f => f.id));
    }
  }

  removeFavorite(eventId: number): void {
    const current = this.getFavorites();
    const updated = current.filter(f => f.id !== eventId);
    this.favoritesSubject.next(updated);
    this.saveToStorage(updated.map(f => f.id));
  }

  toggleFavorite(event: Event): boolean {
    if (this.isFavorite(event.id)) {
      this.removeFavorite(event.id);
      return false;
    } else {
      this.addFavorite(event);
      return true;
    }
  }

  clearAll(): void {
    this.favoritesSubject.next([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }
}