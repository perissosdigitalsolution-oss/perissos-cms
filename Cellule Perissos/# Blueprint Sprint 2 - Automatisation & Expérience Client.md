# Blueprint Sprint 2 – Automatisation & Expérience Client

**Version :** 2.0
**Date :** [À définir]
**Auteur :** [Votre Équipe]
**Statut :** À lancer
**Précédé par :** Sprint 1 – Fondations et Preuve de Concept

---

## 🎯 Objectifs Stratégiques du Sprint 2

1. **Automatiser le provisionnement** — Le script `pnpm new-client <nom>` doit être opérationnel et créer une instance client en moins de 5 minutes.
2. **Offrir une interface d'édition "live"** — Les clients doivent pouvoir prévisualiser leurs modifications en temps réel.
3. **Ajouter la facturation et les plans** — Intégrer un système de paiement (Stripe) avec des plans (essai, pro, entreprise).
4. **Renforcer la sécurité et la résilience** — Mettre en place des sauvegardes automatiques, une surveillance avancée, et des tests de charge.
5. **Préparer le lancement** — Documentation client, landing page de présentation, et onboarding automatisé.

---

## 📅 Phases du Sprint 2 (Durée : 2 semaines)

### 🔹 Phase 1 : Automatisation du Provisionnement (Jours 1-3)

| Tâche | Responsable | Livrable |
|---|---|---|
| Finaliser le script `pnpm new-client` en **TypeScript** | DevOps | Script opérationnel avec logs et notifications |
| Intégrer la création de base de données Neon via API | DevOps | Script créant une DB dédiée par client |
| Automatiser la création du projet Vercel (via API) | DevOps | Projet Vercel provisionné avec variables d'env |
| Automatiser la création du projet Cloudflare Pages (via API) | DevOps | Projet Cloudflare créé avec les bons paramètres |
| Créer un préfixe R2 pour chaque client | DevOps | Structure de dossiers `clients/{client-id}/media/` |
| Envoyer un email de bienvenue automatisé | DevOps | Email avec identifiants, URL admin, documentation |

**Prompt pour le DevOps :**

```markdown
[ROLE] DevOps – Sprint 2
[OBJECTIF] Automatiser le provisionnement d'une nouvelle instance client.
[TÂCHES]
1. Écrire le script `pnpm new-client` en TypeScript (Node.js).
2. Utiliser les API de Neon, Vercel, Cloudflare et R2.
3. Gérer les erreurs (rollback en cas d'échec).
4. Ajouter une file d'attente (queue) pour éviter les appels simultanées.
[CONTRAINTES]
- Temps de provisionnement < 5 minutes.
- Logs complets pour audit.
- Aucune intervention manuelle requise.
[COMMANDES]
  pnpm new-client --name "acme-corp" --plan "pro" --email "admin@acme.com"
[LIVRABLE] Script opérationnel avec documentation.
```

---

### 🔹 Phase 2 : Interface d'Édition en Direct (Jours 4-6)

| Tâche | Responsable | Livrable |
|---|---|---|
| Implémenter la prévisualisation en direct (Live Preview) | Full-Stack | URL de preview générée dynamiquement |
| Ajouter un bouton "Aperçu" dans l'admin Payload | Full-Stack | Ouverture d'un nouvel onglet avec le frontend en mode preview |
| Configurer les webhooks de revalidation Cloudflare | Full-Stack | À chaque modification, déclencher un rebuild du frontend |
| Ajouter un indicateur de "build en cours" pour le client | Frontend | Spinner ou notification dans l'admin |
| Tester le flux complet : modification → preview → publication | QA | Rapport de test validé |

**Prompt pour le Full-Stack :**

```markdown
[ROLE] Développeur Full-Stack – Sprint 2
[OBJECTIF] Permettre aux clients de prévisualiser leurs modifications en temps réel.
[TÂCHES]
1. Ajouter un champ `previewSecret` dans la collection Client.
2. Créer une route API `/api/preview` qui génère un token JWT.
3. Dans le frontend (Cloudflare), ajouter un middleware qui détecte le token et active le mode preview.
4. Configurer le webhook Payload → Cloudflare : à chaque modification, appeler l'API de rebuild.
5. Ajouter un bouton "Aperçu" dans l'admin Payload (custom component).
[CONTRAINTES]
- Le mode preview doit être sécurisé (token à durée limitée).
- La preview doit refléter les modifications non publiées (draft).
[LIVRABLE] Fonctionnalité de preview opérationnelle.
```

---

### 🔹 Phase 3 : Facturation et Plans (Jours 7-9)

| Tâche | Responsable | Livrable |
|---|---|---|
| Intégrer Stripe (ou Paddle) pour les paiements | Full-Stack | Système de paiement fonctionnel |
| Créer les plans tarifaires (Gratuit, Pro, Entreprise) | Product Owner | Définition des plans et des limites |
| Ajouter des limites par plan (nombre de pages, articles, etc.) | Backend | Middleware de vérification des limites |
| Gérer les essais gratuits (14 jours) | Backend | Période d'essai avec rappel automatique |
| Créer une page de gestion d'abonnement dans l'admin | Frontend | Interface client pour gérer son abonnement |
| Mettre en place les webhooks Stripe (paiement, expiration) | DevOps | Synchronisation automatique des statuts |

**Prompt pour le Backend :**

```markdown
[ROLE] Développeur Backend – Sprint 2
[OBJECTIF] Intégrer la facturation avec Stripe.
[TÂCHES]
1. Ajouter les champs `plan`, `subscriptionStatus`, `stripeCustomerId`, `trialEndsAt` dans la collection Client.
2. Créer les endpoints Stripe : création de session de paiement, gestion des webhooks.
3. Implémenter les vérifications de limites (middleware) : nombre de pages, d'articles, d'activités.
4. Ajouter un cron job pour vérifier les essais expirés et désactiver les clients.
5. Créer une page d'administration des abonnements pour le client.
[CONTRAINTES]
- La facturation doit être sécurisée (webhooks signés).
- Les clients gratuits doivent avoir des limites strictes.
- L'essai gratuit doit être proposé à l'inscription.
[LIVRABLE] Système de facturation complet.
```

---

### 🔹 Phase 4 : Sécurité, Résilience et Surveillance (Jours 10-12)

| Tâche | Responsable | Livrable |
|---|---|---|
| Mettre en place des sauvegardes automatiques des bases de données | DevOps | Sauvegardes quotidiennes (Neon PITR) |
| Configurer des alertes de surveillance (Sentry, Logtail) | DevOps | Alertes en cas d'erreur ou de panne |
| Effectuer des tests de charge (k6) | DevOps | Rapport de performance et seuils définis |
| Renforcer la politique CORS et CSP | Sécurité | Configuration validée |
| Ajouter un rate limiting avancé (Redis ou Upstash) | Backend | Protection contre les abus |
| Réaliser un audit de sécurité complet | Sécurité | Rapport d'audit avec correctifs |

**Prompt pour l'équipe Sécurité + DevOps :**

```markdown
[ROLE] Sécurité & DevOps – Sprint 2
[OBJECTIF] Assurer la résilience et la sécurité de la plateforme.
[TÂCHES]
1. Configurer les sauvegardes Neon (PITR) et tester une restauration.
2. Intégrer Sentry pour le monitoring des erreurs frontend/backend.
3. Ajouter Logtail pour la centralisation des logs.
4. Écrire un script de test de charge (k6) simulant 100 clients simultanés.
5. Vérifier et durcir les en-têtes de sécurité (CSP, HSTS, X-Frame-Options).
6. Mettre en place un rate limiting distribué avec Upstash Redis.
[CONTRAINTES]
- Les sauvegardes doivent être testées mensuellement.
- Le temps de réponse moyen doit rester < 200ms sous charge.
- Aucune faille de sécurité critique.
[LIVRABLE] Plateforme sécurisée, surveillée et résiliente.
```

---

### 🔹 Phase 5 : Préparation au Lancement (Jours 13-14)

| Tâche | Responsable | Livrable |
|---|---|---|
| Rédiger la documentation client (manuel d'utilisation) | Product Owner | Guide complet (PDF / Notion) |
| Créer une landing page de présentation du SaaS | Frontend | Page marketing avec démo interactive |
| Mettre en place un système d'onboarding interactif | Frontend | Tutoriel guidé pour les nouveaux clients |
| Effectuer des tests utilisateurs (beta) | QA | Retours et correctifs |
| Planifier la stratégie de go-live | Chef de Projet | Plan de communication et de déploiement |

**Prompt pour le Frontend :**

```markdown
[ROLE] Développeur Frontend – Sprint 2
[OBJECTIF] Préparer l'expérience utilisateur pour le lancement.
[TÂCHES]
1. Créer une landing page avec : présentation, fonctionnalités, témoignages, appel à l'action.
2. Ajouter une démo interactive (vidéo ou iframe de l'admin).
3. Implémenter un onboarding progressif (tooltips, étapes) pour les nouveaux clients.
4. Assurer la responsivité et l'accessibilité (WCAG 2.1).
5. Préparer les pages : conditions générales, politique de confidentialité, mentions légales.
[CONTRAINTES]
- La landing page doit être statique (exportée sur Cloudflare Pages).
- L'onboarding doit être facultatif (le client peut le sauter).
- Design cohérent avec l'identité visuelle du SaaS.
[LIVRABLE] Landing page + onboarding + documentation.
```

---

## 📊 Matrice des Risques – Sprint 2

| Risque | Probabilité | Impact | Atténuation |
|---|---|---|---|
| Échec du script de provisionnement | Moyenne | Élevé | Tests intensifs en staging, rollback automatique |
| Surcoûts imprévus (Vercel, Neon, R2) | Faible | Moyen | Mettre en place des alertes de coût et des quotas |
| Fuite de données entre clients | Faible | Critique | Audit de sécurité, isolation renforcée, revue de code |
| Échec des paiements Stripe | Faible | Élevé | Webhooks avec retry, notification manuelle |
| Temps de build Cloudflare trop long | Moyenne | Moyen | Optimiser le build (caching, réduction des dépendances) |

---

## 📦 Livrables du Sprint 2

À l'issue de ce sprint, l'équipe aura :

| Livrable | Responsable | Statut |
|---|---|---|
| Script `pnpm new-client` (TypeScript) | DevOps | ⬜ |
| Fonctionnalité de prévisualisation en direct | Full-Stack | ⬜ |
| Système de facturation Stripe | Backend | ⬜ |
| Sauvegardes et monitoring | DevOps + Sécurité | ⬜ |
| Tests de charge (k6) | DevOps | ⬜ |
| Landing page et onboarding | Frontend | ⬜ |
| Documentation client | Product Owner | ⬜ |

---

## 🔄 Continuité → Sprint 3 (Évolution)

Le Sprint 3 ajoutera :

- Modules d'activités avancés (calendrier, inscriptions, notifications)
- Analytics et statistiques pour les clients
- Personnalisation avancée des templates (couleurs, polices, CSS)
- Intégration avec des outils externes (Zapier, Make)

---

## 🔗 Références

- **Sprint 1** : `# Blueprint Sprint 1 - Plateforme SaaS (Payload + Next.js).md`
- **Architecture** : Vercel (Back Office) + Cloudflare Pages (Frontend) + Neon (DB) + R2 (Media)
- **Monorepo** : Turborepo + pnpm (`apps/backoffice` + `apps/frontend` + `packages/shared` + `packages/ui`)
