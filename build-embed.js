#!/usr/bin/env node
/**
 * Génère `embed-wordpress.html` : le bloc à coller dans WordPress.
 *
 *   node build-embed.js            # la première journée non terminée
 *   node build-embed.js --j=3      # la journée 3
 *
 * Pourquoi un générateur plutôt qu'un fichier écrit à la main : le bloc contient
 * un balisage schema.org `SportsEvent`. Or la règle numéro un des données
 * structurées est de ne décrire QUE ce qui est visible dans la page. Générer les
 * deux d'un coup, depuis la même source, rend impossible le décalage entre la
 * liste affichée et le JSON-LD.
 *
 * ⚠ Le contenu de l'iframe n'appartient PAS à la page parente : Google ne
 * l'attribue pas à l'article. Tout ce qui doit être indexé — et tout ce qui est
 * balisé — vit donc dans le HTML du bloc, pas dans le widget.
 *
 * ⚠⚠ AUCUNE LIGNE DU HTML PRODUIT NE DOIT ÊTRE INDENTÉE, et une balise ne doit
 * jamais s'étaler sur plusieurs lignes. Constaté sur Sports Mole : le CMS
 * remplace l'espace de début de ligne par `&nbsp;`. Une iframe dont les
 * attributs étaient indentés sur sept lignes a perdu son `src`, son `style` et
 * son `title` — il n'en restait qu'une boîte vide de 300 × 2470 px — et le
 * script de hauteur, indenté de deux espaces, échouait sur
 * « SyntaxError: Unexpected token '&' ».
 * Le `<style>`, lui, collé à gauche, était passé intact : c'est la seule
 * différence entre ce qui a survécu et ce qui a été détruit.
 */

const fs = require("fs");
const path = require("path");

const PAGES = "https://jcrochet-netizen.github.io/bracket-c1-2627";
const TZ = "Europe/Paris";

const arg = (process.argv.slice(2).find((a) => a.startsWith("--j=")) || "").slice(4);
const data = JSON.parse(fs.readFileSync(path.join(__dirname, "data.json"), "utf8"));

const journee = arg
  ? data.matchdays.find((j) => String(j.n) === arg)
  : (data.matchdays.find((j) => j.matches.some((m) => m.st !== "FT")) || data.matchdays[0]);
if (!journee) { console.error(`✗ journée ${arg} introuvable`); process.exit(1); }

/* ------------------------------------------------------------------ Dates */

const fJour = new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, weekday: "long", day: "numeric", month: "long", year: "numeric" });
const fHeure = new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });

/** ISO 8601 avec le décalage de Paris — Google préfère une date située. */
function isoLocal(iso) {
  const d = new Date(iso);
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
 timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit",
 hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
 timeZoneName: "longOffset"
    }).formatToParts(d).map((x) => [x.type, x.value])
  );
  const offset = (p.timeZoneName || "GMT+00:00").replace("GMT", "") || "+00:00";
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}${offset}`;
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const heureFr = (iso) => fHeure.format(new Date(iso)).replace(":", "h");
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/* ------------------------------------------- Liste visible des rencontres */

const parJour = new Map();
for (const m of journee.matches) {
  const cle = fJour.format(new Date(m.iso));
  if (!parJour.has(cle)) parJour.set(cle, []);
  parJour.get(cle).push(m);
}

let listeHtml = "";
for (const [jour, ms] of parJour) {
  listeHtml += `\n<h4>${cap(jour)}</h4>\n\n<ul>\n`;
  for (const m of ms) {
    const v = data.venues[m.v];
    const lieu = v ? ` — ${esc(v.n)}${v.c ? `, ${esc(v.c)}` : ""}` : "";
    listeHtml += `<li><strong>${esc(data.teams[m.h].name)} – ${esc(data.teams[m.a].name)}</strong>, ${heureFr(m.iso)}${lieu}.</li>\n`;
  }
  listeHtml += `</ul>\n`;
}

/* ------------------------------------------------------ JSON-LD SportsEvent
 * Un nœud complet par rencontre : `name`, `startDate` et `location` sont les
 * trois propriétés exigées par Google pour un Event. Pas de `superEvent`, qui
 * obligerait à déclarer la compétition entière comme un Event doté d'un lieu
 * unique — ce qu'elle n'a pas.
 */
const evenements = journee.matches.map((m) => {
  const v = data.venues[m.v] || null;
  const dom = data.teams[m.h], ext = data.teams[m.a];
  const adresse = { "@type": "PostalAddress" };
  if (v && v.c) adresse.addressLocality = v.c;
  if (v && v.cc) adresse.addressCountry = v.cc;
  return {
    "@type": "SportsEvent",
    name: `${dom.name} – ${ext.name}`,
    description: `${journee.n}${journee.n === 1 ? "re" : "e"} journée de la phase de ligue de la Ligue des champions 2026-2027.`,
    startDate: isoLocal(m.iso),
    eventStatus: m.st === "OFF" ? "https://schema.org/EventPostponed" : "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: v
 ? { "@type": "Place", name: v.n, address: adresse }
 : { "@type": "Place", name: "Stade à confirmer", address: { "@type": "PostalAddress", addressCountry: "EU" } },
    homeTeam: { "@type": "SportsTeam", name: dom.name, logo: dom.logo },
    awayTeam: { "@type": "SportsTeam", name: ext.name, logo: ext.logo },
    organizer: { "@type": "SportsOrganization", name: "UEFA", url: "https://www.uefa.com/" }
  };
});

// Retours à la ligne conservés pour la lisibilité, indentation retirée : dans un
// <script>, les entités ne sont pas décodées, donc un `&nbsp;` inséré par le CMS
// en début de ligne rendrait le JSON invalide.
const jsonLd = JSON.stringify({ "@context": "https://schema.org", "@graph": evenements }, null, 2)
  .replace(/^ +/gm, "");

/* ---------------------------------------------------------------- Le bloc */

const html = `<!-- =========================================================================
Bracket LIVE Ligue des champions 2026-2027 — bloc à coller dans un bloc
WordPress « HTML personnalisé ».

Généré par : node build-embed.js${arg ? ` --j=${arg}` : ""}
Journée affichée : ${journee.n}

⚠ NE PAS coller l'iframe seule. Le contenu d'une iframe n'est pas attribué à la
page parente par Google : le texte ci-dessous EST le contenu indexé de l'article.
Le widget, lui, apporte le direct et l'interactivité.

⚠ Le balisage schema.org en bas décrit exactement les rencontres listées plus
haut. Si vous supprimez la liste, supprimez le JSON-LD ; si vous changez de
journée, régénérez les deux avec build-embed.js.
========================================================================= -->

<link rel="preconnect" href="https://jcrochet-netizen.github.io">

<h2>Ligue des champions 2026-2027 : calendrier, classement en direct et bracket</h2>

<p>La phase de ligue de la Ligue des champions 2026-2027 s’ouvre le
<strong>mardi 8 septembre 2026</strong> et se referme le <strong>mercredi 27 janvier 2027</strong>.
Les 36 clubs disputent 8 rencontres chacun, contre 8 adversaires différents : 4 à
domicile, 4 à l’extérieur. Un classement unique départage ensuite les 36 équipes.</p>

<p>Le tableau interactif ci-dessous réunit trois choses : <strong>les 18 matchs de chaque
journée</strong> avec leurs scores en direct, <strong>le classement des 36 clubs recalculé en
temps réel</strong>, et <strong>l’arbre de la phase finale</strong> tel qu’il se dessinerait à
l’instant t. Les données viennent de SportMonks : les résultats sont publiés après
chaque coup de sifflet final, et le classement se recalcule dans la foulée.</p>

<h3>Le bracket interactif de la Ligue des champions</h3>

<style>
/* Réserve la hauteur réelle du widget AVANT son chargement, sinon l'iframe grandit
d'un coup et pousse tout le texte qui suit : c'est le décalage de mise en page que
Google mesure (Cumulative Layout Shift). Valeurs relevées DANS UNE PAGE PARENTE
RÉELLE, cache vidé, liste des matchs repliée — 2532 px dans un article de 900 px,
2577 à 700, 2820 en mobile. Mesurer le widget seul ne suffit pas : dans un article
il est plus étroit que le viewport, donc plus haut. Le script ci-dessous remplace
ensuite cette réserve par la hauteur exacte. */
#busa-c1b-fr{min-height:2535px}
@media (max-width:760px){#busa-c1b-fr{min-height:2580px}}
@media (max-width:520px){#busa-c1b-fr{min-height:2825px}}
</style>

<iframe id="busa-c1b-fr" src="${PAGES}/bracket-c1.html" title="Bracket de la Ligue des champions 2026-2027 - matchs, classement et phase finale" loading="lazy" scrolling="no" referrerpolicy="strict-origin-when-cross-origin" style="display:block;margin:0 auto;width:100%;max-width:900px;border:0;overflow:hidden"></iframe>

<noscript><p><a href="${PAGES}/bracket-c1.html" rel="noopener">Ouvrir le bracket de la Ligue des champions 2026-2027 en plein écran</a> — le tableau interactif a besoin de JavaScript.</p></noscript>

<script>
// Ajuste la hauteur de l'iframe a son contenu, pour qu'aucune barre de defilement
// interne n'apparaisse. Si le CMS filtre ce script, l'iframe reste parfaitement
// lisible grace au min-height ci-dessus, qui est deja a la bonne hauteur.
// NE JAMAIS REINDENTER : certains CMS remplacent l'espace de debut de ligne par
// &nbsp;, ce qui produit une erreur de syntaxe et casse tout.
(function(){
var ORIGIN='https://jcrochet-netizen.github.io';
var frame=document.getElementById('busa-c1b-fr');
window.addEventListener('message',function(e){
if(e.origin!==ORIGIN)return;
var d=e.data;
if(!d||d.type!=='busa-c1b-height')return;
if(!frame)frame=document.getElementById('busa-c1b-fr');
if(!frame)return;
if(e.source!==frame.contentWindow)return;
var h=parseInt(d.height,10);
if(!h||h<1)return;
frame.style.height=h+'px';
frame.style.minHeight='0';
},false);
})();
</script>

<h3>Les matchs de la ${journee.n}<sup>${journee.n === 1 ? "re" : "e"}</sup> journée</h3>

<p>Coups d’envoi en heure française. L’UEFA programme en heure d’Europe centrale,
qui correspond exactement à l’heure de Paris : aucune conversion n’est nécessaire.</p>
${listeHtml}
<h3>Comment se qualifie-t-on pour la phase finale ?</h3>

<p>Le classement unique des 36 clubs décide de tout, à l’issue des 8 journées :</p>

<ul>
<li><strong>Du 1<sup>er</sup> au 8<sup>e</sup></strong> : qualifiés directement pour les huitièmes de finale.</li>
<li><strong>Du 9<sup>e</sup> au 24<sup>e</sup></strong> : barrages en aller-retour, les moins bien classés recevant au match aller.</li>
<li><strong>Du 25<sup>e</sup> au 36<sup>e</sup></strong> : éliminés, sans repêchage en Ligue Europa.</li>
</ul>

<h3>Comment les égalités sont-elles départagées ?</h3>

<p>À égalité de points, l’UEFA départage dans cet ordre : différence de buts, buts
marqués, buts marqués à l’extérieur, nombre de victoires, victoires à l’extérieur,
puis points disciplinaires. Il n’y a <strong>pas</strong> de confrontation directe, contrairement
à une phase de groupes classique : les 36 clubs ne s’affrontent pas tous.</p>

<h3>Quand a lieu la finale de la Ligue des champions 2027 ?</h3>

<p>La finale se joue le <strong>samedi 5 juin 2027 à l’Estadio Metropolitano de Madrid</strong>.
Le calendrier complet de la phase finale :</p>

<ul>
<li><strong>Barrages</strong> — tirage le 29 janvier 2027, matchs les 16-17 et 23-24 février 2027.</li>
<li><strong>Huitièmes de finale</strong> — tirage le 26 février 2027, matchs les 9-10 et 16-17 mars 2027.</li>
<li><strong>Quarts de finale</strong> — 6-7 et 13-14 avril 2027.</li>
<li><strong>Demi-finales</strong> — 27-28 avril et 4-5 mai 2027.</li>
<li><strong>Finale</strong> — samedi 5 juin 2027, Estadio Metropolitano, Madrid.</li>
</ul>

<h3>Les 36 clubs de la phase de ligue 2026-2027</h3>

<p>AEK Athènes, Arsenal, AS Roma, Aston Villa, Atlético de Madrid, Bayern Munich,
Bodø/Glimt, Borussia Dortmund, Club Bruges, Como, FC Barcelone, FC Porto, Fenerbahçe,
Feyenoord, Galatasaray, Inter Milan, LASK Linz, Liverpool, LOSC, Manchester City,
Manchester United, Naples, Paris Saint-Germain, PSV Eindhoven, RB Leipzig, RC Lens,
Real Betis, Real Madrid, Sabah FK, Shakhtar Donetsk, Slavia Prague, Slovan Bratislava,
Sporting Portugal, Stuttgart, Viking Stavanger, Villarreal.</p>

<p>Trois clubs français sont engagés : le <strong>Paris Saint-Germain</strong>, le
<strong>LOSC</strong> et le <strong>RC Lens</strong>.</p>

<!-- =========================================================================
Données structurées : une fiche SportsEvent par rencontre de la journée
${journee.n}, celles listées plus haut dans la page. Rien d'autre n'est balisé.

Volontairement ABSENTS de ce bloc, parce que Yoast / Rank Math les
produisent déjà pour toute la page et qu'un doublon est une erreur :
Article, WebPage, Organization, BreadcrumbList.
========================================================================= -->

<script type="application/ld+json">
${jsonLd}
</script>
`;

fs.writeFileSync(path.join(__dirname, "embed-wordpress.html"), html);
console.log(`✓ embed-wordpress.html — journée ${journee.n}, ${journee.matches.length} rencontres balisées`);

/* ------------------------------------------------- Les 5 iframes, une par langue
 * Bloc autonome par langue : la réserve de hauteur, l'iframe et le script
 * d'ajustement voyagent ensemble, avec un identifiant propre. Deux langues
 * peuvent donc cohabiter sur une même page sans se marcher dessus.
 *
 * Réserves identiques pour les cinq : mesurées entre 2446 et 2462 px à 900 px
 * de large, l'écart entre langues est dans le bruit.
 */
const LANGUES = [
  { code:"fr", fichier:"bracket-c1.html",    langAttr:"fr",
    titre:"Bracket de la Ligue des champions 2026-2027 - matchs, classement et phase finale",
    lien:"Ouvrir le bracket de la Ligue des champions 2026-2027 en plein écran",
    js:"le tableau interactif a besoin de JavaScript." },
  { code:"en", fichier:"bracket-c1-en.html", langAttr:"en",
    titre:"2026-27 Champions League bracket - fixtures, table and knockout stage",
    lien:"Open the 2026-27 Champions League bracket full screen",
    js:"the interactive table needs JavaScript." },
  { code:"es", fichier:"bracket-c1-es.html", langAttr:"es",
    titre:"Cuadro de la Liga de Campeones 2026-2027 - partidos, clasificación y fase final",
    lien:"Abrir el cuadro de la Liga de Campeones 2026-2027 a pantalla completa",
    js:"la tabla interactiva necesita JavaScript." },
  { code:"pt", fichier:"bracket-c1-pt.html", langAttr:"pt-BR",
    titre:"Chaveamento da Liga dos Campeões 2026-2027 - jogos, classificação e mata-mata",
    lien:"Abrir o chaveamento da Liga dos Campeões 2026-2027 em tela cheia",
    js:"a tabela interativa precisa de JavaScript." },
  { code:"it", fichier:"bracket-c1-it.html", langAttr:"it",
    titre:"Tabellone della Champions League 2026-2027 - partite, classifica e fase finale",
    lien:"Aprire il tabellone della Champions League 2026-2027 a schermo intero",
    js:"la tabella interattiva ha bisogno di JavaScript." }
];

const bloc = (L) => {
  const id = `busa-c1b-${L.code}`;
  // AUCUNE INDENTATION dans ce qui suit — voir l'avertissement en tête du fichier.
  return `<!-- ${L.code.toUpperCase()} — ${PAGES}/${L.fichier} -->
<link rel="preconnect" href="https://jcrochet-netizen.github.io">
<style>
#${id}{min-height:2535px}
@media (max-width:760px){#${id}{min-height:2580px}}
@media (max-width:520px){#${id}{min-height:2825px}}
</style>
<iframe id="${id}" src="${PAGES}/${L.fichier}" title="${L.titre}" loading="lazy" scrolling="no" referrerpolicy="strict-origin-when-cross-origin" style="display:block;margin:0 auto;width:100%;max-width:900px;border:0;overflow:hidden"></iframe>
<noscript><p lang="${L.langAttr}"><a href="${PAGES}/${L.fichier}" rel="noopener">${L.lien}</a> — ${L.js}</p></noscript>
<script>
// Ajuste la hauteur de l'iframe a son contenu.
// NE JAMAIS REINDENTER CE SCRIPT : certains CMS remplacent l'espace de debut de
// ligne par &nbsp;, ce qui produit une erreur de syntaxe et casse tout.
(function(){
var ORIGIN='https://jcrochet-netizen.github.io';
var frame=document.getElementById('${id}');
window.addEventListener('message',function(e){
if(e.origin!==ORIGIN)return;
var d=e.data;
// Type identique pour les cinq langues, d'ou la verification de l'emetteur.
if(!d||d.type!=='busa-c1b-height')return;
if(!frame)frame=document.getElementById('${id}');
if(!frame)return;
if(e.source!==frame.contentWindow)return;
var h=parseInt(d.height,10);
if(!h||h<1)return;
frame.style.height=h+'px';
frame.style.minHeight='0';
},false);
})();
</script>`;
};

const iframes = `<!-- =========================================================================
Bracket Ligue des champions 2026-2027 — l'iframe seule, dans les 5 langues.
Généré par : node build-embed.js

Chaque bloc est AUTONOME : réserve de hauteur, iframe et script d'ajustement
voyagent ensemble, avec un identifiant propre à la langue. Deux langues
peuvent donc cohabiter sur une même page.

⚠ L'iframe seule ne rapporte aucun SEO : Google n'attribue pas le contenu d'une
iframe à la page parente. Pour un article destiné à ranker, coller
embed-wordpress.html, qui entoure l'iframe du texte indexable.
========================================================================= -->

${LANGUES.map((L) => bloc(L)).join("\n\n\n")}
`;

fs.writeFileSync(path.join(__dirname, "embed-iframes.html"), iframes);
console.log(`✓ embed-iframes.html — ${LANGUES.length} langues`);

/* Garde-fou. Une seule ligne indentée suffit à casser le bloc sur un CMS qui
   convertit l'espace de début de ligne en `&nbsp;` — c'est arrivé sur Sports
   Mole, où l'iframe a perdu son `src`. Le générateur refuse donc d'écrire un
   fichier qui contiendrait la moindre indentation. */
let fautes = 0;
for (const f of ["embed-wordpress.html", "embed-iframes.html"]) {
  const lignes = fs.readFileSync(path.join(__dirname, f), "utf8").split("\n");
  lignes.forEach((l, i) => {
    if (/^[ \t]+\S/.test(l)) { console.error(`✗ ${f}:${i + 1} ligne indentée — ${l.slice(0, 60)}`); fautes++; }
  });
}
if (fautes) {
  console.error(`\n✗ ${fautes} ligne(s) indentée(s) : le bloc serait cassé par un CMS qui convertit les espaces de début de ligne.`);
  process.exit(1);
}
console.log("✓ aucune ligne indentée — le bloc survit aux CMS qui réécrivent les espaces");
