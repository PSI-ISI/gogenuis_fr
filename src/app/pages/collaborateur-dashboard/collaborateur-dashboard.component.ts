import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';


interface Task {
  id: number;
  title: string;
  establishment: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  status: 'todo' | 'in-progress' | 'done';
}

interface Establishment {
  id: number;
  name: string;
  type: string;
  city: string;
  image: string;
  status: 'active' | 'pending' | 'inactive';
  rating: number;
  tasksCount: number;
}

interface Activity {
  id: number;
  type: 'task' | 'review' | 'reservation' | 'message';
  title: string;
  description: string;
  time: string;
  icon: string;
}

interface Message {
  id: number;
  sender: string;
  senderAvatar: string;
  establishment: string;
  preview: string;
  time: string;
  unread: boolean;
}
@Component({
  selector: 'app-collaborateur-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './collaborateur-dashboard.component.html',
  styleUrl: './collaborateur-dashboard.component.css'
})
export class CollaborateurDashboardComponent {
  // User Info
  userName = 'Khalid Mansouri';
  userRole = 'Responsable Partenariats';
  userAvatar = 'KM';

  // Stats
  stats = [
    { title: 'Établissements', value: '12', icon: 'bi-building', color: '#1a5f7a' },
    { title: 'Tâches en cours', value: '8', icon: 'bi-list-task', color: '#f4a261' },
    { title: 'Tâches terminées', value: '45', icon: 'bi-check-circle', color: '#06d6a0' },
    { title: 'Messages', value: '5', icon: 'bi-envelope', color: '#7209b7' }
  ];

  // Tasks
  tasks: Task[] = [
    { id: 1, title: 'Valider les photos du Riad Andalous', establishment: 'Riad Andalous', priority: 'high', dueDate: '2026-01-30', status: 'todo' },
    { id: 2, title: 'Répondre aux avis négatifs', establishment: 'Café Maure', priority: 'high', dueDate: '2026-01-30', status: 'in-progress' },
    { id: 3, title: 'Mettre à jour les tarifs', establishment: 'Hotel Atlas', priority: 'medium', dueDate: '2026-01-31', status: 'todo' },
    { id: 4, title: 'Vérifier disponibilités', establishment: 'Riad Soleil', priority: 'low', dueDate: '2026-02-01', status: 'todo' },
    { id: 5, title: 'Formation nouvelle offre', establishment: 'Restaurant Dar Zaki', priority: 'medium', dueDate: '2026-02-02', status: 'todo' }
  ];

  // Establishments managed
  establishments: Establishment[] = [
    { id: 1, name: 'Riad Andalous', type: 'Hôtel', city: 'Marrakech', image: 'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=200', status: 'active', rating: 4.7, tasksCount: 2 },
    { id: 2, name: 'Café Maure', type: 'Café', city: 'Casablanca', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200', status: 'active', rating: 4.5, tasksCount: 1 },
    { id: 3, name: 'Hotel Atlas', type: 'Hôtel', city: 'Fès', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200', status: 'pending', rating: 4.2, tasksCount: 3 },
    { id: 4, name: 'Restaurant Dar Zaki', type: 'Restaurant', city: 'Rabat', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200', status: 'active', rating: 4.8, tasksCount: 1 }
  ];

  // Recent Activity
  activities: Activity[] = [
    { id: 1, type: 'task', title: 'Tâche complétée', description: 'Mise à jour du menu - Café Maure', time: 'Il y a 30 min', icon: 'bi-check-circle' },
    { id: 2, type: 'review', title: 'Nouvel avis', description: 'Riad Andalous a reçu un avis 5 étoiles', time: 'Il y a 1h', icon: 'bi-star' },
    { id: 3, type: 'reservation', title: 'Nouvelle réservation', description: 'Hotel Atlas - 3 nuits', time: 'Il y a 2h', icon: 'bi-calendar-check' },
    { id: 4, type: 'message', title: 'Nouveau message', description: 'Question du Riad Soleil', time: 'Il y a 3h', icon: 'bi-envelope' }
  ];

  // Messages
  messages: Message[] = [
    { id: 1, sender: 'Ahmed Riad', senderAvatar: 'AR', establishment: 'Riad Andalous', preview: 'Pouvez-vous vérifier la nouvelle offre...', time: '10:30', unread: true },
    { id: 2, sender: 'Fatima Café', senderAvatar: 'FC', establishment: 'Café Maure', preview: 'Merci pour la mise à jour des photos', time: '09:15', unread: true },
    { id: 3, sender: 'Karim Hotel', senderAvatar: 'KH', establishment: 'Hotel Atlas', preview: 'Les nouveaux tarifs sont prêts', time: 'Hier', unread: false }
  ];

  // Performance data
  performanceData = [
    { label: 'Lun', value: 5 },
    { label: 'Mar', value: 8 },
    { label: 'Mer', value: 6 },
    { label: 'Jeu', value: 9 },
    { label: 'Ven', value: 7 },
    { label: 'Sam', value: 4 },
    { label: 'Dim', value: 3 }
  ];

  constructor() {}

  ngOnInit(): void {}

  getPriorityClass(priority: string): string {
    return priority;
  }

  getStatusClass(status: string): string {
    return status;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'active': 'Actif',
      'pending': 'En attente',
      'inactive': 'Inactif'
    };
    return labels[status] || status;
  }

  getMaxPerformance(): number {
    return Math.max(...this.performanceData.map(d => d.value));
  }

  getBarHeight(value: number): number {
    return (value / this.getMaxPerformance()) * 100;
  }

  toggleTaskStatus(task: Task): void {
    if (task.status === 'todo') {
      task.status = 'in-progress';
    } else if (task.status === 'in-progress') {
      task.status = 'done';
    }
  }
}
