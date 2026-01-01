# Horaire Prière 🕌

Application mobile d'horaires de prière musulmane développée avec React Native et Expo.

## Fonctionnalités

- 📅 Horaires de prière précis basés sur la géolocalisation
- 🧭 Direction de la Qibla avec boussole animée
- 🔔 Notifications de rappel de prière
- 🌙 Calendrier Hijri
- 🌍 Support multilingue (FR, EN, AR, ES, RU, ZH, JA)
- 🎨 Design neumorphique sombre avec effets de verre

## Stack Technique

- **Framework**: React Native 0.81.5
- **SDK**: Expo SDK 54
- **Langage**: TypeScript 5.9.2 (strict mode)
- **UI**: Neumorphic Dark Design avec glassmorphism
- **i18n**: i18next + react-i18next

## Installation

```bash
# Installer les dépendances
npm install

# Démarrer l'application
npm start

# Lancer sur Android
npm run android

# Lancer sur iOS
npm run ios
```

## Structure du Projet

```
/App.tsx                 # Point d'entrée
/src/
  /components/           # Composants réutilisables
    - NeuCard.tsx       # Carte neumorphique
    - GlassCard.tsx     # Carte avec effet de verre
    - PrayerCard.tsx    # Carte de prière
    - CountdownTimer.tsx # Compte à rebours
    - DateDisplay.tsx   # Affichage des dates
    - TabBar.tsx        # Barre de navigation
    - ...
  /screens/             # Écrans de l'app
    - HomeScreen.tsx    # Écran principal
    - QiblaScreen.tsx   # Direction Qibla
    - SettingsScreen.tsx # Paramètres
  /services/            # Services
    - prayerTimes.ts    # Calcul des prières
    - notifications.ts  # Notifications
    - storage.ts        # Stockage local
    - location.ts       # Géolocalisation
  /theme/               # Design system
    - colors.ts         # Couleurs et ombres
    - typography.ts     # Typographie
  /types/               # Types TypeScript
  /i18n/                # Internationalisation
    /locales/           # Fichiers de traduction
```

## Méthodes de Calcul Supportées

- Muslim World League (MWL)
- Islamic Society of North America (ISNA)
- Egyptian General Authority of Survey
- Umm al-Qura University, Makkah
- University of Islamic Sciences, Karachi
- Institute of Geophysics, Tehran
- Shia Ithna Ashari (Jafari)

## Design System

### Couleurs Principales

- Background: `#1a1a1f`
- Card: `#1e1e24`
- Primary (Vert): `#4ade80`
- Gold: `#f59e0b`
- Text: `#f8f8f8`

### Effets Neumorphiques

```typescript
neuShadow.raised = {
  shadowColor: '#0f0f12',
  shadowOffset: { width: 4, height: 4 },
  shadowOpacity: 0.5,
  shadowRadius: 8,
  elevation: 8,
};
```

## Langues Supportées

| Code | Langue    |
|------|-----------|
| fr   | Français  |
| en   | English   |
| ar   | العربية   |
| es   | Español   |
| ru   | Русский   |
| zh   | 中文      |
| ja   | 日本語    |

## Licence

MIT License

---

Développé avec ❤️ pour la communauté musulmane
