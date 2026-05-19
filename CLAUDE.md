# CLAUDE.md — BubblePop

Ce fichier fournit le contexte du projet à Claude Code pour ce répertoire.

## Vue d'ensemble

**BubblePop** est une application web statique permettant à l'utilisateur de générer des bulles de BD personnalisées au format PNG. L'utilisateur saisit son texte, choisit un style de bulle et une police, puis télécharge l'image finale avec fond transparent.

- **Nom de marque** : BubblePop
- **Domaine cible (placeholder)** : `https://bubblepop.app`
- **Cible** : créateurs de contenu et pros (YouTubeurs, illustrateurs, marketeurs, créateurs BD) — public international

## Stack technique

- **HTML5 + CSS3 + JavaScript vanilla** — aucun framework, aucune dépendance externe (npm, bundler, etc.)
- **Canvas API** pour la composition et l'export PNG
- **Application mono-fichier** : tout (HTML + CSS + JS) vit dans `index.html` pour faciliter le déploiement et la maintenance long terme

## Structure du projet

```
app texte bulle/
├── index.html             # Application complète (HTML + CSS + JS inline)
├── robots.txt             # SEO
├── sitemap.xml            # SEO
├── og-image.png           # Image 1200x630 pour Open Graph (partages sociaux)
├── make_og_image.py       # Script de génération de og-image.png (à relancer si modif)
├── make_transparent.py    # Script utilitaire (rend le blanc transparent dans un PNG)
├── bulles BD/             # Images des bulles
│   ├── 1.png              # 5000x5000 px — Parole
│   ├── 2.png              # 5000x5000 px — Pensée
│   ├── 3.png              # 5000x5000 px — Murmure
│   ├── 4.png              # Cri (fond rendu transparent)
│   └── 4_original.png     # Sauvegarde avant transparence
└── fonts/                 # Polices Comic locales (à créer si on veut migrer hors Google Fonts)
```

## Fonctionnalités

### Interface utilisateur
- Textarea pour la saisie du texte
- Sélecteur de style de bulle (4 options avec aperçu)
- Sélecteur de police (5 polices)
- Bouton "Générer PNG"
- Aperçu en temps réel
- Bouton de téléchargement du PNG

### Traitement des images
- Charger les 4 images de bulles depuis `bulles BD/`
- Redimensionner proportionnellement la bulle selon la longueur du texte
- Superposer le texte centré dans la zone de texte de la bulle
- Exporter un PNG avec **fond transparent** autour de la bulle

### Gestion du texte
- Centrage automatique (horizontal + vertical) dans la zone de texte de la bulle
- Ajustement dynamique de la taille de police selon la taille de la bulle
- Retours à la ligne automatiques (word-wrap sur Canvas)

## Polices intégrées

| Police | Usage typique |
|--------|---------------|
| Comic Relief | Texte BD standard |
| Bangers | Titres / cris |
| Komika | Texte BD classique |
| Komika Hands | Style manuscrit |
| Anime Ace BB | Style manga / comics US |

Les polices sont chargées via `@font-face` dans le CSS inline.

## Règles de développement

### À faire
- **Conserver le mono-fichier** : tout le HTML, CSS et JS doit rester dans `index.html`
- **Pas de dépendances externes** : aucun CDN, aucun package npm, aucune bibliothèque tierce
- **JavaScript vanilla pur** : pas de jQuery, pas de React, pas de Vue
- **Compatibilité navigateurs modernes** : Chrome, Firefox, Safari, Edge récents
- **Code commenté en français** quand un commentaire est nécessaire (le projet est francophone)

### À éviter
- Ne pas introduire de build step (Webpack, Vite, etc.)
- Ne pas externaliser le CSS ou le JS dans des fichiers séparés
- Ne pas ajouter de backend — l'app doit rester 100% statique
- Ne pas casser la transparence du PNG exporté

## Déploiement

L'application est un fichier HTML statique déployable partout :
- Netlify / Vercel (drag-and-drop du dossier)
- GitHub Pages
- N'importe quel hébergement classique

Aucune configuration serveur n'est requise.

## SEO

L'app est référencée sous le nom **BubblePop** avec une stratégie internationale (titres et descriptions en anglais, interface en français pour l'instant).

- **Balises** : title, description, keywords, canonical, Open Graph, Twitter Card, Schema.org JSON-LD (`WebApplication`)
- **Fichiers** : `robots.txt`, `sitemap.xml`, `og-image.png` (1200x630)
- **Favicons** : SVG inline en data-URI (bulle simple)
- **Mots-clés cibles** : "speech bubble generator", "comic bubble", "générateur bulle BD", "transparent PNG"
- **URL placeholder** : remplacer `https://bubblepop.app` par le vrai domaine quand il sera acheté (search/replace dans `index.html`, `sitemap.xml`, `robots.txt`)

## Communication

L'utilisateur préfère échanger en **français**.
