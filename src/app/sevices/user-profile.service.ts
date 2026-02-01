import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

// ============ Interfaces ============

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  login: string;
  userType: string;
  city: string | null;
  company: string | null;
  initials: string;
  createdAt: string;
  lastLoginAt: string | null;
  // Préférences locales (stockées en localStorage)
  preferences: UserPreferences;
}

export interface UserPreferences {
  categories: string[];
  budgetMax: number;
  notifications: boolean;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  city?: string;
  company?: string;
}

// ============ Service ============

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  
  private readonly API_URL = 'http://localhost:8080/api/user';
  private readonly PREFS_KEY = 'gogenius_user_prefs';
  
  // Cache du profil
  private profileSubject = new BehaviorSubject<UserProfile | null>(null);
  public profile$ = this.profileSubject.asObservable();
  
  // Mode démo (sans API)
  private readonly DEMO_MODE = true;

  constructor(private http: HttpClient) {
    // Charger le profil au démarrage si user_id existe
    const userId = localStorage.getItem('user_id');
    if (userId) {
      this.loadProfile();
    }
  }

  /**
   * Récupérer le profil utilisateur
   */
  getProfile(): Observable<UserProfile> {
    const userId = localStorage.getItem('user_id');
    
    if (!userId) {
      return of(this.getDefaultProfile());
    }
    
    if (this.DEMO_MODE) {
      const profile = this.buildProfileFromLocalStorage();
      this.profileSubject.next(profile);
      return of(profile);
    }
    
    const headers = new HttpHeaders({
      'X-User-Id': userId
    });
    
    return this.http.get<any>(`${this.API_URL}/profile`, { headers }).pipe(
      map(response => {
        const profile: UserProfile = {
          ...response.data,
          preferences: this.loadPreferences()
        };
        this.profileSubject.next(profile);
        return profile;
      }),
      catchError(error => {
        console.error('Error fetching profile:', error);
        const fallback = this.buildProfileFromLocalStorage();
        this.profileSubject.next(fallback);
        return of(fallback);
      })
    );
  }

  /**
   * Charger le profil (force reload)
   */
  loadProfile(): void {
    this.getProfile().subscribe();
  }

  /**
   * Mettre à jour le profil
   */
  updateProfile(updates: UpdateProfileRequest): Observable<UserProfile> {
    const userId = localStorage.getItem('user_id');
    
    if (!userId) {
      return of(this.getDefaultProfile());
    }
    
    if (this.DEMO_MODE) {
      // Mettre à jour le localStorage
      if (updates.firstName || updates.lastName) {
        const fullName = `${updates.firstName || ''} ${updates.lastName || ''}`.trim();
        localStorage.setItem('fullname', fullName);
      }
      if (updates.city) {
        localStorage.setItem('user_city', updates.city);
      }
      
      const profile = this.buildProfileFromLocalStorage();
      this.profileSubject.next(profile);
      return of(profile);
    }
    
    const headers = new HttpHeaders({
      'X-User-Id': userId
    });
    
    return this.http.put<any>(`${this.API_URL}/profile`, updates, { headers }).pipe(
      map(response => {
        const profile: UserProfile = {
          ...response.data,
          preferences: this.loadPreferences()
        };
        
        // Mettre à jour localStorage
        if (profile.fullName) {
          localStorage.setItem('fullname', profile.fullName);
        }
        if (profile.city) {
          localStorage.setItem('user_city', profile.city);
        }
        
        this.profileSubject.next(profile);
        return profile;
      }),
      catchError(error => {
        console.error('Error updating profile:', error);
        throw error;
      })
    );
  }

  /**
   * Sauvegarder les préférences locales
   */
  savePreferences(preferences: UserPreferences): void {
    localStorage.setItem(this.PREFS_KEY, JSON.stringify(preferences));
    
    const current = this.profileSubject.value;
    if (current) {
      this.profileSubject.next({
        ...current,
        preferences
      });
    }
  }

  /**
   * Charger les préférences depuis localStorage
   */
  loadPreferences(): UserPreferences {
    const stored = localStorage.getItem(this.PREFS_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing preferences:', e);
      }
    }
    return this.getDefaultPreferences();
  }

  /**
   * Obtenir le profil actuel (synchrone)
   */
  getCurrentProfile(): UserProfile | null {
    return this.profileSubject.value;
  }

  /**
   * Obtenir les initiales
   */
  getInitials(): string {
    const profile = this.profileSubject.value;
    if (profile?.initials) {
      return profile.initials;
    }
    
    const fullname = localStorage.getItem('fullname');
    if (fullname) {
      return this.generateInitials(fullname);
    }
    
    return 'U';
  }

  /**
   * Déconnexion - effacer le profil
   */
  clearProfile(): void {
    this.profileSubject.next(null);
    // Ne pas effacer les préférences
  }

  // ============ Méthodes privées ============

  private buildProfileFromLocalStorage(): UserProfile {
    const userId = localStorage.getItem('user_id') || '';
    const fullname = localStorage.getItem('fullname') || localStorage.getItem('gogenius.fname') || 'Utilisateur';
    const email = localStorage.getItem('user_email') || '';
    const city = localStorage.getItem('user_city') || null;
    const phone = localStorage.getItem('user_phone') || '';
    const profile = localStorage.getItem('profile') || '';
    const username = localStorage.getItem('username') || '';
    
    // Essayer de parser le nom
    const nameParts = fullname.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    // Déterminer le type d'utilisateur
    let userType = 'touriste';
    if (profile === 'Y29tcGFueQ==' || profile === 'etablissement') {
      userType = 'etablissement';
    } else if (profile === 'collaborateur') {
      userType = 'collaborateur';
    }
    
    return {
      id: userId,
      firstName,
      lastName,
      fullName: fullname,
      email,
      login: username,
      userType,
      city,
      company: null,
      initials: this.generateInitials(fullname),
      createdAt: '',
      lastLoginAt: null,
      preferences: this.loadPreferences()
    };
  }

  private generateInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, Math.min(2, name.length)).toUpperCase();
  }

  private getDefaultProfile(): UserProfile {
    return {
      id: '',
      firstName: '',
      lastName: '',
      fullName: 'Utilisateur',
      email: '',
      login: '',
      userType: 'touriste',
      city: null,
      company: null,
      initials: 'U',
      createdAt: '',
      lastLoginAt: null,
      preferences: this.getDefaultPreferences()
    };
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      categories: ['Restaurants', 'Hôtels'],
      budgetMax: 5000,
      notifications: true
    };
  }
}