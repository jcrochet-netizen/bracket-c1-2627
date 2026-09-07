# Bracket LIVE — Ligue des champions 2026-2027

Widget auto-alimenté par l'API **SportMonks**. Trois blocs empilés, dans cet ordre :

1. **Les matchs, journée par journée** — les 18 rencontres de chacune des 8 journées,
   avec leur résultat. Repliées par défaut derrière « Voir tous les résultats » : seule
   la première reste visible, ce qui suffit à comprendre le bloc sans imposer 18 lignes.
2. **Le classement** — les 36 clubs, recalculés à chaque rafraîchissement, avec les
   zones de qualification.
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
  les résultats, l'état (à venir / reporté / terminé) et les points disciplinaires, puis
  écrit un `data-<lang>.json` par langue. Il ne classe rien.
- **`bracket-c1.html`** (client) : calcule le classement, construit l'arbre, gère les
  pronostics. Il relit le JSON toutes les 15 minutes — un fichier statique sur GitHub
  Pages, donc sans aucun appel à SportMonks.

## Pas de score en direct, volontairement

Un match n'a de score que lorsqu'il est **terminé**. Le JSON ne contient jamais de
score partiel, même si l'API en renvoie un pour une rencontre en cours : une rencontre
en cours est rangée avec les matchs à venir et n'affiche que son heure de coup d'envoi.

C'est un choix de coût. Suivre le direct imposait d'interroger SportMonks toutes les
10 minutes de 16 h à 23 h les soirs de C1, soit **≈ 690 appels par semaine**. Le cron
ne passe plus qu'après les coups de sifflet final : **≈ 52 appels par semaine**, treize
fois moins, pour un résultat publié dans les 15 à 30 minutes suivant la fin des matchs.

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
un bracket complet en un clic, que le lecteur peut ensuite modifier.

Les pronostics sont gardés dans le `localStorage` du navigateur, rangés **par tour et
par équipe** — « je vois ce club passer les 8es » — et non par emplacement dans
l'arbre. La nuance est tout sauf cosmétique : le classement bouge à chaque journée,
donc les rencontres sont continuellement rebattues. Rangés par emplacement, les
pronostics étaient effacés en bloc au moindre changement de tête de classement ; à
l'essai, **4 matchs relevés suffisaient à en détruire 19 sur 23**. Rangés par équipe,
le même changement en conserve 12 sur 23, et ceux qui sautent sont ceux dont le club a
réellement changé de tour.

Deux règles complètent le nettoyage : un club qui n'est plus engagé à un tour y perd
son pronostic, et si le rebrassage met deux favoris face à face, les deux sont
relâchés — le lecteur retranche lui-même plutôt que le widget à sa place.

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

## Le bloc WordPress et son SEO

`embed-wordpress.html` n'est pas écrit à la main, il est **généré** :

```bash
node build-embed.js          # la première journée non terminée
node build-embed.js --j=3    # une journée précise
```

Il produit **deux** fichiers : `embed-wordpress.html`, le bloc FR complet avec son
texte indexable et son balisage, et `embed-iframes.html`, l'iframe seule dans les cinq
langues. Chaque bloc de langue est autonome — réserve de hauteur, iframe et script
d'ajustement — et porte un identifiant propre (`busa-c1b-fr`, `-en`…), donc deux
langues peuvent cohabiter sur une même page.

Le message de hauteur, lui, s'appelle `busa-c1b-height` pour les cinq : c'est le
widget qui l'émet, et il ignore l'identifiant que la page donne à son iframe. Chaque
script vérifie donc `e.source === frame.contentWindow` avant d'appliquer la valeur.
Sans cette vérification, deux widgets sur une même page se renvoient leurs hauteurs
respectives — constaté à l'essai avant correction.

Pourquoi un générateur : le bloc contient un balisage `SportsEvent`, et la règle
numéro un des données structurées est de ne décrire que ce qui est **visible dans la
page**. Produire la liste des rencontres et le JSON-LD depuis la même source rend le
décalage impossible.

Ce que fait le bloc, et pourquoi :

| Choix | Raison |
| --- | --- |
| Texte complet autour de l'iframe | Google n'attribue pas le contenu d'une iframe à la page parente. Le texte du bloc **est** le contenu indexé de l'article. |
| `min-height` calé sur la hauteur réelle (2470 / 2520 / 2660 px) | Sans réserve exacte, l'iframe grandit au chargement et pousse tout le texte suivant : c'est du CLS. Mesuré à **0 px de décalage**. |
| `loading="lazy"` | L'iframe fait près de 2500 px : la charger avant qu'elle approche du viewport ralentirait le LCP pour rien. |
| `title` descriptif | Lu par les lecteurs d'écran, et seul libellé de l'iframe pour les moteurs. |
| `<link rel="preconnect">` | Ouvre la connexion vers GitHub Pages pendant que le reste de la page se charge. |
| `<noscript>` avec lien direct | Une iframe vide sans JavaScript n'apporte rien ; le lien, si. |
| `referrerpolicy="strict-origin-when-cross-origin"` | Ne fuite pas l'URL complète de l'article vers GitHub. |
| **Pas** de `Article`, `WebPage`, `Organization` ni `BreadcrumbList` | Yoast et Rank Math les produisent déjà pour toute la page. Un doublon est une erreur, pas un bonus. |

Le JSON-LD décrit **une rencontre = un `SportsEvent`**, avec les trois propriétés
exigées par Google (`name`, `startDate`, `location`) plus `homeTeam`, `awayTeam`,
`organizer` et le stade avec sa ville et son pays. Pas de `superEvent` : il faudrait
déclarer la compétition entière comme un Event doté d'un lieu unique, ce qu'elle n'a
pas.

À vérifier avant publication sur https://search.google.com/test/rich-results.

⚠ Si vous changez de journée affichée, régénérez **la liste et le balisage ensemble**
avec `build-embed.js`. Ne jamais modifier l'une sans l'autre.

Le widget renvoie sa hauteur à la page parente via un message `busa-c1b-height` — même
convention que les calendriers Ligue 1 et NBA, avec un préfixe distinct pour qu'ils
puissent coexister sur une même page.

### Rythme de rafraîchissement : le rendez-vous est pris par le script

Une première version plaçait deux crons à heure fixe, après la fin supposée des
matchs. Elle ne tenait pas : en **heure d'hiver**, un cron à 19 h 50 UTC tombait à la
minute près sur la fin des rencontres de 18 h 45, et celui de 22 h 10 n'avait que
5 minutes d'avance sur celles de 21 h 00. **Cinq journées sur huit** étaient exposées.

C'est donc `fetch-data.js` qui décide, pas l'horloge. Avant tout appel, il relit le
`data.json` du passage précédent — les heures de coup d'envoi y sont déjà — et
n'interroge SportMonks que s'il existe un match **sans résultat dont le coup d'envoi
remonte à plus de 2 h 05** (90 minutes, 15 de mi-temps, 20 d'arrêts de jeu). Si la
rencontre traîne au-delà, le passage suivant la rattrape : la constante n'a pas à
être exacte.

| Cron (UTC) | Rôle |
| --- | --- |
| `*/30 18-23 * * *` | fenêtre des fins de match, **tous les jours** — le portillon rend ces passages quasi gratuits |
| `20 5 * * *` | filet quotidien, **forcé** : calendrier, reports, tirages |

Passer tous les jours plutôt que les mardis, mercredis et jeudis n'est pas un luxe :
l'UEFA déplace des rencontres, la finale se joue un samedi, et un match reporté peut
être rejoué n'importe quand. Le portillon rend ce filet large sans le rendre coûteux —
la quasi-totalité des exécutions s'arrêtent sans consommer un seul appel d'API.

Résultat : un résultat publié **dans les 30 minutes** suivant le coup de sifflet, pour
**une poignée d'appels par journée de championnat**.

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
| `build-embed.js` | Génère le bloc WordPress + son balisage schema.org |
| `embed-wordpress.html` | Bloc FR complet à coller dans WordPress, texte indexable + balisage (généré) |
| `embed-iframes.html` | L'iframe seule, dans les 5 langues (généré) |
| `serve.js` | Serveur statique local |
| `.github/workflows/refresh.yml` | Cron de rafraîchissement |
| `.github/data-changed.js` | Détecte un vrai changement de données |

## Données

- SportMonks : ligue `2`, saison `28155` (2026/2027), stage `77484090` (phase de ligue).
- Les 8 journées sont les rounds `424304` et `424596` à `424602`.
- Écussons : CDN UEFA (`img.uefa.com`, PNG couleur 100×100), identifiants dans `teams.js`.
- Stades : `venue.country` de SportMonks, dédupliqués dans `venues` (36 enceintes pour
  144 rencontres). Les codes `EN`, `SC`, `WA` et `NI` renvoyés pour les nations
  britanniques ne sont pas des codes ISO 3166-1 valides et sont corrigés en `GB`,
  sans quoi Google refuserait l'adresse.

**Recoupement** : les 144 rencontres renvoyées par SportMonks — affiche, date **et
heure de Paris** — sont identiques une à une au calendrier du PDF officiel UEFA extrait
dans [`ScheduleFootball/c1`](../../ScheduleFootball/c1). Zéro écart.
