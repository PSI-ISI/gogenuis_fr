export const CITIES_CONFIG = [
  { 
    id: 'casablanca', 
    name: 'Casablanca', 
    image: 'https://plus.unsplash.com/premium_photo-1697729894473-f42211860691?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8Q2FzYWJsYW5jYSUyME1vcm9jY28lMjBsYW5kbWFya3xlbnwwfHx8fDE3Njk5MDkyNzF8MA&ixlib=rb-4.1.0&q=80&w=1080', 
    desc: 'La métropole dynamique',
    selected: true 
  },
  { 
    id: 'rabat', 
    name: 'Rabat', 
    image: 'https://plus.unsplash.com/premium_photo-1697730046699-02d93a2ce32d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8UmFiYXQlMjBNb3JvY2NvJTIwSGFzc2FuJTIwVG93ZXJ8ZW58MHx8fHwxNzY5OTA5MjczfDA&ixlib=rb-4.1.0&q=80&w=1080', 
    desc: 'Capitale culturelle',
    selected: false 
  },
  { 
    id: 'marrakech', 
    name: 'Marrakech', 
    image: 'https://images.unsplash.com/photo-1739686176648-2b53d1bbe87f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8TWFycmFrZWNoJTIwTW9yb2NjbyUyMEphcmRpbiUyME1ham9yZWxsZXxlbnwwfHx8fDE3Njk5MDkyNzV8MA&ixlib=rb-4.1.0&q=80&w=1080', 
    desc: 'La ville ocre',
    selected: false 
  },
  { 
    id: 'tanger', 
    name: 'Tanger', 
    image: 'https://images.unsplash.com/photo-1641753352787-754ac585ab11?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8VGFuZ2VyJTIwTW9yb2NjbyUyMGNpdHl8ZW58MHx8fHwxNzY5OTA5Mjc3fDA&ixlib=rb-4.1.0&q=80&w=1080', 
    desc: 'La porte de l\'Afrique',
    selected: false 
  },
  { 
    id: 'agadir', 
    name: 'Agadir', 
    image: 'https://images.unsplash.com/photo-1675271815142-2b8c5373d091?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8QWdhZGlyJTIwTW9yb2NjbyUyMGJlYWNofGVufDB8fHx8MTc2OTkwOTI3OHww&ixlib=rb-4.1.0&q=80&w=1080', 
    desc: 'Soleil et plage',
    selected: false 
  },
  { 
    id: 'fes', 
    name: 'Fès', 
    image: 'https://plus.unsplash.com/premium_photo-1675875487519-52d6b2e3edba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8RmVzJTIwTW9yb2NjbyUyMHRhbm5lcmllc3xlbnwwfHx8fDE3Njk5MDkyODB8MA&ixlib=rb-4.1.0&q=80&w=1080', 
    desc: 'Cité impériale',
    selected: false 
  },
  {
    id: 'chefchaouen',
    name: 'Chefchaouen',
    image: 'https://plus.unsplash.com/premium_photo-1697730233434-7b9494119cfe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8Q2hlZmNoYW91ZW4lMjBibHVlJTIwY2l0eXxlbnwwfHx8fDE3Njk5MDkyODN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    desc: 'La perle bleue',
    selected: false
  },
  {
    id: 'essaouira',
    name: 'Essaouira',
    image: 'https://plus.unsplash.com/premium_photo-1697730007162-3acd986a87f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8RXNzYW91aXJhJTIwTW9yb2NjbyUyMHBvcnR8ZW58MHx8fHwxNzY5OTA5Mjg0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    desc: 'La cité du vent',
    selected: false
  }
];

export const CATEGORIES_CONFIG = [
  { id: 'economique', name: 'Économique', icon: 'bi-piggy-bank-fill', color: '#06d6a0', selected: true },
  { id: 'traditionnel', name: 'Traditionnel', icon: 'bi-shop', color: '#e85d04', selected: false },
  { id: 'moderne', name: 'Tendance', icon: 'bi-stars', color: '#7209b7', selected: false },
  { id: 'healthy', name: 'Healthy / Bio', icon: 'bi-heart-pulse-fill', color: '#2a9d8f', selected: false },
  { id: 'fastfood', name: 'Fast Food', icon: 'bi-lightning-fill', color: '#f72585', selected: false },
  { id: 'cafe', name: 'Café / Détente', icon: 'bi-cup-straw', color: '#8b5a2b', selected: false },
  { id: 'nature', name: 'Plein Air', icon: 'bi-flower1', color: '#588157', selected: false },
  { id: 'culturel', name: 'Culture & Art', icon: 'bi-bank2', color: '#bc6c25', selected: false }
];

export const TIME_SLOTS_CONFIG = [
  { id: 'morning', name: 'Petit-déjeuner', icon: 'bi-cup-hot-fill', timeRange: '08:00 - 10:00', selected: true },
  { id: 'lunch', name: 'Déjeuner', icon: 'bi-egg-fried', timeRange: '12:00 - 14:00', selected: true },
  { id: 'afternoon', name: 'Café / Goûter', icon: 'bi-cake2', timeRange: '16:00 - 17:30', selected: false },
  { id: 'dinner', name: 'Dîner', icon: 'bi-moon-stars', timeRange: '20:00 - 22:30', selected: true },
  { id: 'activity', name: 'Activité', icon: 'bi-bicycle', timeRange: 'Flexible', selected: false }
];

export const SMART_TIPS = {
  economique: ["Privilégiez les 'Mahlabas'.", "Utilisez les petits taxis rouges."],
  confort: ["Réservez votre table à l'avance.", "Demandez une vue mer."],
  equilibre: ["Le pourboire est de 10%.", "Un bon mix culture/détente."]
};