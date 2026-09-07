# Bracket LIVE — Ligue des champions 2026-2027

Widget auto-alimenté par l'API **SportMonks**. Trois blocs empilés, dans cet ordre :

1. **Les matchs, journée par journée** — les 18 rencontres de chacune des 8 journées,
   avec scores en direct et minute de jeu.
2. **Le classement en direct** — les 36 clubs, recalculés à chaque rafraîchissement,
   avec les zones de qualification et une bascule « matchs en cours inclus ».
3. **L'arbre de la phase finale** — barrages, 8es, quarts, demies, finale, auto-remplis
   d'après le classement à l'instant t, puis pronostiquables au clic.

Même principe que le [bracket Coupe du monde 2026](../../BracketV2auto) : le token
SportMonks reste côté serveur, le widget ne lit qu'un JSON statique.

## Comment ça marche

```
SportMonks API ──> fetch-data.js ──> data-<lang>.json ──> bracket-c1*.html
  (token secret)    (GitHub Action)    (5 fichiers)        (lit le JSON, jamais le token)
```

- **`fetch-data.js`** (serveur) : lit les 144 matchs de la phase de ligue, en extrait
  les scores, l'état (à venir / en cours / terminé) et les points disciplinaires, puis
  écrit un `data-<lang>.json` par langue. Il ne classe rien.
- **`bracket-c1.html`** (client) : calcule le classement, construit l'arbre, gère les
  pronostics. Rafraîchissement du JSON toutes les 3 minutes.

Le classement est calculé **côté client** exprès : c'est ce qui permet la bascule
« matchs en cours inclus » sans embarquer deux jeux de données.

## Le classement : critères UEFA

Phase de ligue (règlement UCL, art. 20.01) — **pas de confrontation directe**, les
36 clubs ne s'affrontent pas tous :

1. points
2. différence de buts
3. buts marqués
4. buts marqués à l'extérieur
5. victoires
6. victoires à l'extérieur
7. points disciplinaires — carton jaune 1, deuxième jaune 3, rouge direct 3,
   jaune + rouge direct 4 ; le plus bas total passe devant
8. coefficient de club UEFA

Le 8<sup>e</sup> critère n'est publié par aucune API. À égalité parfaite, le widget
retombe sur l'**ordre alphabétique** — neutre et stable, plutôt que sur l'ordre
arbitraire renvoyé par SportMonks. En pratique le cas ne se présente qu'avant le coup
d'envoi de la 1<sup>re</sup> journée, où les 36 clubs sont à zéro : le widget l'écrit
alors noir sur blanc sous le tableau.

## Le bracket

Format UEFA depuis 2024-25 :

| Classement | Sort |
| --- | --- |
| 1<sup>er</sup>-8<sup>e</sup> | qualifiés directement pour les 8es |
| 9<sup>e</sup>-24<sup>e</sup> | barrages aller-retour |
| 25<sup>e</sup>-36<sup>e</sup> | éliminés |

Les barrages opposent les paires 9/10-23/24, 11/12-21/22, 13/14-19/20 et 15/16-17/18 ;
en 8es, le vainqueur de chaque branche retrouve la paire de têtes de série
correspondante (1/2 contre la branche 15/16-17/18, etc.).

**Tant que le tirage n'a pas eu lieu**, l'appariement exact à l'intérieur de chaque
paire est indéterminé. Le widget retient une convention lisible et équilibrée — la
mieux classée de la paire affronte la moins bien classée du couple adverse — et
l'annonce comme une projection. Dès que l'UEFA tire les barrages (29 janvier 2027) et
que SportMonks publie les stages correspondants, `fetch-data.js` les détecte tout seul
et les vraies rencontres remplissent le champ `knockout` du JSON.

Le bouton **« Remplir d'après le classement »** fait avancer partout la mieux classée :
un bracket complet en un clic, que le lecteur peut ensuite modifier. Les pronostics
sont gardés dans le `localStorage` du navigateur ; un pronostic devenu impossible
(le club n'est plus dans cette rencontre) est effacé automatiquement.

## Multilingue

| Langue | Widget | Données | Fuseau des horaires |
| --- | --- | --- | --- |
| Français | `bracket-c1.html` | `data.json` | Europe/Paris |
| English | `bracket-c1-en.html` | `data-en.json` | Europe/London |
| Español | `bracket-c1-es.html` | `data-es.json` | Europe/Madrid |
| Português (BR) | `bracket-c1-pt.html` | `data-pt.json` | America/São Paulo |
| Italiano | `bracket-c1-it.html` | `data-it.json` | Europe/Rome |

`index.html` est un sélecteur de langue.

Les cinq jeux de libellés vivent dans le **master FR** (objet `L10N` de
`bracket-c1.html`) : passer d'une langue à l'autre ne change que `data-lang` et le
fichier de données lu. Pour modifier l'interface :

```bash
node build-langs.js   # régénère les 4 variantes depuis le master FR
```

Les **noms de clubs** sont traduits dans `teams.js` et injectés par `fetch-data.js`.

## Développement local

```bash
node fetch-data.js    # régénère les 5 data-*.json depuis SportMonks (lit .env)
node build-langs.js   # régénère les 4 variantes traduites
node serve.js         # http://localhost:8757/bracket-c1.html
```

`.env` (gitignoré) :

```
SPORTMONKS_API_TOKEN=...
```

## Déploiement

Dépôt : **[jcrochet-netizen/bracket-c1-2627](https://github.com/jcrochet-netizen/bracket-c1-2627)** —
Pages : `https://jcrochet-netizen.github.io/bracket-c1-2627/`

1. Ajouter le secret `SPORTMONKS_API_TOKEN` dans
   **Settings → Secrets and variables → Actions → New repository secret**.
   Sans lui, la GitHub Action échoue à chaque exécution.
2. Activer GitHub Pages : **Settings → Pages → Deploy from a branch → `main` → `/ (root)`**.
3. Coller `embed-wordpress.html` dans un bloc « HTML personnalisé ». Ne pas coller
   l'iframe seule : le contenu d'une iframe n'est pas attribué à la page parente
   par Google.

Le widget renvoie sa hauteur à la page parente via un message `busa-c1b-height` — même
convention que les calendriers Ligue 1 et NBA, avec un préfixe distinct pour qu'ils
puissent coexister sur une même page.

### Rythme de rafraîchissement

`.github/workflows/refresh.yml` :

- **toutes les 10 minutes**, de 16 h à 23 h UTC, les mardis, mercredis et jeudis —
  la plage couvre les coups d'envoi de 18 h 45 et 21 h 00 (heure de Paris) sur les
  deux régimes horaires ;
- **toutes les 6 heures** le reste du temps, pour le calendrier, les reports et les
  tirages.

Le commit n'est écrit que si les données ont réellement changé : `data-changed.js`
compare les fichiers **sans** leur champ `updatedAt`, sinon le cron produirait un
commit toutes les 10 minutes pour rien.

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `teams.js` | Les 36 clubs : id SportMonks, écusson UEFA, couleurs, noms dans 5 langues |
| `fetch-data.js` | SportMonks → les 5 `data-*.json` |
| `build-langs.js` | Génère EN/ES/PT/IT depuis le master FR |
| `bracket-c1.html` | **Master FR** — le seul fichier d'interface à modifier |
| `bracket-c1-*.html` | Variantes traduites (générées) |
| `data*.json` | Matchs + points disciplinaires, par langue |
| `index.html` | Sélecteur de langue |
| `embed-wordpress.html` | Bloc à coller dans WordPress |
| `serve.js` | Serveur statique local |
| `.github/workflows/refresh.yml` | Cron de rafraîchissement |
| `.github/data-changed.js` | Détecte un vrai changement de données |

## Données

- SportMonks : ligue `2`, saison `28155` (2026/2027), stage `77484090` (phase de ligue).
- Les 8 journées sont les rounds `424304` et `424596` à `424602`.
- Écussons : CDN UEFA (`img.uefa.com`, PNG couleur 100×100), identifiants dans `teams.js`.

**Recoupement** : les 144 rencontres renvoyées par SportMonks — affiche, date **et
heure de Paris** — sont identiques une à une au calendrier du PDF officiel UEFA extrait
dans [`ScheduleFootball/c1`](../../ScheduleFootball/c1). Zéro écart.
