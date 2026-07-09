/**
 * BREIGHT BRAND IDENTITY
 * Vocabulaire, principes, et constantes uniques à la plateforme
 */

export const BREIGHT = {
  // Core mission
  mission: 'Créer des connexions vraies par l\'écoute active',
  tagline: 'L\'écoute est le plus beau cadeau',
  
  // Unique vocabulary
  vocabulary: {
    messages: 'Conversations profondes',
    chat: 'Échanges',
    moments: 'Instants vrais',
    feed: 'Galerie d\'authentiques',
    friends: 'Cercle proche',
    profile: 'Identité',
    score: 'Score d\'écoute',
    listening: 'Écoute active',
    connection: 'Connexion profonde',
    empathy: 'Empathie',
    quest: 'Quête du jour',
  },

  // Listening score badges
  badges: [
    { level: 'Novice', min: 0, max: 20, emoji: '🌱', name: 'Sprout', color: 'jade' },
    { level: 'Listener', min: 20, max: 40, emoji: '👂', name: 'Listener', color: 'cobalt' },
    { level: 'Empath', min: 40, max: 60, emoji: '💜', name: 'Empath', color: 'mauve' },
    { level: 'Sage', min: 60, max: 80, emoji: '🧠', name: 'Sage', color: 'gold' },
    { level: 'Heart', min: 80, max: 100, emoji: '❤️', name: 'Heart Listener', color: 'ruby' },
  ],

  // Daily quests
  quests: [
    {
      id: 'three-followups',
      title: '3 Questions profondes',
      description: 'Pose 3 questions de suivi attentive dans une conversation',
      reward: 15,
      icon: '🎯',
    },
    {
      id: 'moment-posted',
      title: 'Instant authentique',
      description: 'Partage ton instant vrai à 12h12',
      reward: 10,
      icon: '📸',
    },
    {
      id: 'long-conversation',
      title: 'Échange profond',
      description: 'Échange 10+ messages dans une conversation',
      reward: 20,
      icon: '💬',
    },
    {
      id: 'mood-checkin',
      title: 'Introspection quotidienne',
      description: 'Fais ton check-in d\'humeur du jour',
      reward: 5,
      icon: '🎭',
    },
    {
      id: 'share-moment',
      title: 'Moment en commun',
      description: 'Partage un moment avec quelqu\'un de ton cercle',
      reward: 25,
      icon: '✨',
    },
  ],

  // Principles of active listening
  principles: [
    {
      title: 'Écouter sans juger',
      description: 'L\'écoute authentique commence par l\'absence de jugement',
      icon: '🙏',
    },
    {
      title: 'Poser les vraies questions',
      description: 'Les questions approfondissent, elles ne devrent pas fermer',
      icon: '❓',
    },
    {
      title: 'Être présent',
      description: 'La présence complète est le fondement de toute connexion',
      icon: '👁️',
    },
    {
      title: 'Honorer la vulnérabilité',
      description: 'La vulnérabilité partagée crée des liens indestructibles',
      icon: '💎',
    },
    {
      title: 'Créer un espace sûr',
      description: 'E2E chiffré, aucune donnée vendue, aucune pub',
      icon: '🔒',
    },
  ],

  // Manifesto taglines
  manifesto: {
    headline: 'Dans un monde de bruit, nous choisissons l\'écoute',
    subheading: 'Breight est la plateforme où l\'écoute active est une compétence valorisée, pas ignorée',
    sections: {
      why: {
        title: 'Pourquoi Breight existe',
        text: 'Les réseaux sociaux nous ont appris à parler fort. Breight vous apprend à écouter profond. C\'est une révolution tranquille.',
      },
      vision: {
        title: 'Notre vision',
        text: 'Un monde où être un bon listener est aussi important qu\'être intelligent. Où l\'empathie est mesurable. Où les connexions vraies remplacent le scroll vide.',
      },
      promise: {
        title: 'Notre promesse',
        text: 'Aucune pub. Aucune donnée vendue. Aucun algorithme qui vous rend addictif. Juste des outils pour créer des connexions authentiques.',
      },
    },
  },

  // Onboarding story beats
  onboarding: {
    beat1: {
      title: 'Écouter, c\'est un superpouvoir',
      description: 'Sur Breight, les listeners deviennent des sages. Les empaths trouvent leur tribu.',
    },
    beat2: {
      title: 'Chaque conversation compte',
      description: 'Chaque question posée, chaque moment partagé, chaque instant écouté renforce votre score d\'écoute.',
    },
    beat3: {
      title: 'Les vraies connexions s\'approfondissent',
      description: 'Rituel quotidien. Moments éphémères. Quêtes d\'écoute. Tout conçu pour des connexions qui durent.',
    },
  },

  // Copywriting guidelines
  copy: {
    welcomeBack: (name: string) => `Bienvenue, ${name}. Qui écouterez-tu aujourd\'hui ?`,
    questsReady: 'Tes quêtes d\'écoute du jour sont prêtes',
    listeningScoreUpdated: (score: number) => `Ton score d\'écoute : ${score}/100`,
    momentPosted: 'Ton instant vrai est maintenant visible à ton cercle',
    conversationStarted: (name: string) => `C\'est l\'heure d\'écouter ${name}...`,
  },
}

export type Badge = typeof BREIGHT.badges[number]
export type Quest = typeof BREIGHT.quests[number]
export type Principle = typeof BREIGHT.principles[number]
