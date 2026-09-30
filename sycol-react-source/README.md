# SyCol — Synergie Collective (version React)

Site vitrine + boutique + prestations + avis clients, reconstruit en **React 18 + Vite + Tailwind CSS**.

## Démarrer en local

```bash
npm install
npm run dev
```
Ouvre ensuite l'adresse affichée dans le terminal (en général http://localhost:5173).

## Construire la version optimisée pour la mise en ligne

```bash
npm run build
```
Le résultat prêt à déployer se trouve dans le dossier `dist/`. Vous pouvez :
- l'héberger sur Netlify, Vercel, GitHub Pages, OVH, o2switch...
- le tester en local avant mise en ligne avec `npm run preview`

## Pourquoi c'est plus performant que la version HTML simple

- **Vite** : bundler moderne, build très rapide, code minifié et découpé automatiquement.
- **Découpage du code (code-splitting)** : les sections « Avis clients », « Contact » et les galeries
  d'exemples de services ne sont chargées par le navigateur qu'au moment où l'utilisateur les atteint /
  clique dessus — le premier écran (Hero) s'affiche donc plus vite.
- **Icônes tree-shakées** (lucide-react) : seules les icônes réellement utilisées sont incluses dans le
  bundle final, contre une police d'icônes complète auparavant.
- **Polices auto-hébergées** (@fontsource) : plus de requête vers un serveur externe (Google Fonts), donc
  moins de temps d'attente et pas de dépendance à un service tiers.
- **Bundle final mesuré** (gzip) : ~9 Ko pour le code de l'application, ~43 Ko pour React lui-même, et
  quelques Ko seulement pour chaque section chargée en différé.

## Structure du projet

```
src/
  components/   → un composant par section (Header, Hero, About, Team, Products, Services...)
  data/         → contenu modifiable (produits, services, équipe, galeries d'exemples)
  hooks/        → logique réutilisable (animations au scroll, gestion des avis)
  context/      → état partagé (notifications, pré-remplissage du formulaire de contact)
```

## À personnaliser avant mise en ligne

1. **Équipe** : `src/data/team.js` — remplacez noms/rôles, et dans `src/components/Team.jsx` remplacez le
   cercle d'initiales par une vraie photo (`<img>`), comme indiqué en commentaire dans le fichier.
2. **Coordonnées** : `src/components/Contact.jsx` (adresse, téléphone, email).
3. **Produits** : `src/data/products.js`.
4. **Photos des galeries services** : `src/data/services.js` — remplacez les photos libres de droits par
   vos propres réalisations dès que vous en aurez.

## ⚠️ Important : avis clients

Les avis sont actuellement enregistrés dans le **localStorage du navigateur** (`src/hooks/useReviews.js`) :
chaque visiteur voit uniquement les avis laissés sur son propre appareil, pas ceux des autres visiteurs.
Pour un vrai système d'avis partagé par tous les visiteurs (comme une vraie boutique en ligne), il faudra
brancher une base de données (Firebase, Supabase, ou une API sur votre serveur). La structure du code est
prête pour ça — dites-le moi et je peux le connecter.

## Formulaire de contact

Le formulaire de contact est fonctionnel côté interface mais n'envoie pas encore d'e-mail réel (pas de
backend). Pour qu'il envoie vraiment un message, il faudra le relier à un service comme Formspree, EmailJS,
ou une API sur votre serveur.
