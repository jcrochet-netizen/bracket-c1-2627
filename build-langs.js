#!/usr/bin/env node
/**
 * Génère les quatre variantes traduites à partir du master FR.
 *
 * Le widget embarque déjà les cinq jeux de libellés (objet `L10N`) : passer
 * d'une langue à l'autre ne demande que de changer `data-lang` et le fichier
 * de données lu. Ce script ne touche donc qu'à l'en-tête du document (langue,
 * titre, méta) et à ces deux attributs — jamais au corps du widget, qui reste
 * strictement identique d'une langue à l'autre.
 *
 *   node build-langs.js
 *
 * Modifier l'interface = modifier bracket-c1.html (le master FR), puis relancer.
 */

const fs = require("fs");
const path = require("path");

const MASTER = path.join(__dirname, "bracket-c1.html");

const META = {
  en: {
    htmlLang: "en", ogLocale: "en_GB",
    title: "LIVE bracket of the 2026-27 Champions League — fixtures and live table",
    desc: "All eight league-phase matchdays of the 2026-27 UEFA Champions League, the 36-club table updated live, and the knockout bracket projected as it stands.",
    ogTitle: "2026-27 Champions League LIVE bracket",
    ogDesc: "Matchday-by-matchday fixtures, the live 36-club table and a knockout bracket that updates itself."
  },
  es: {
    htmlLang: "es", ogLocale: "es_ES",
    title: "Bracket EN DIRECTO de la Liga de Campeones 2026-2027 — partidos y clasificación",
    desc: "Las 8 jornadas de la fase de liga de la Liga de Campeones 2026-2027, la clasificación de los 36 clubes en directo y el cuadro de la fase final proyectado al instante.",
    ogTitle: "Bracket EN DIRECTO Liga de Campeones 2026-2027",
    ogDesc: "Partidos jornada a jornada, clasificación en directo de los 36 clubes y cuadro de la fase final actualizado automáticamente."
  },
  pt: {
    htmlLang: "pt-BR", ogLocale: "pt_BR",
    title: "Bracket AO VIVO da Liga dos Campeões 2026-2027 — jogos e classificação",
    desc: "As 8 rodadas da fase de liga da Liga dos Campeões 2026-2027, a classificação dos 36 clubes ao vivo e o chaveamento do mata-mata projetado em tempo real.",
    ogTitle: "Bracket AO VIVO Liga dos Campeões 2026-2027",
    ogDesc: "Jogos rodada a rodada, classificação ao vivo dos 36 clubes e chaveamento do mata-mata atualizado automaticamente."
  },
  it: {
    htmlLang: "it", ogLocale: "it_IT",
    title: "Bracket LIVE della Champions League 2026-2027 — partite e classifica in diretta",
    desc: "Le 8 giornate della fase campionato di Champions League 2026-2027, la classifica delle 36 squadre in tempo reale e il tabellone della fase finale proiettato all'istante.",
    ogTitle: "Bracket LIVE Champions League 2026-2027",
    ogDesc: "Partite giornata per giornata, classifica live delle 36 squadre e tabellone della fase finale aggiornato in automatico."
  }
};

function remplacerUnique(src, motif, valeur, lang) {
  const trouve = src.match(motif);
  if (!trouve) throw new Error(`[${lang}] motif introuvable dans le master : ${motif}`);
  if (src.match(new RegExp(motif.source, motif.flags + "g")).length !== 1) {
    throw new Error(`[${lang}] motif ambigu (plusieurs occurrences) : ${motif}`);
  }
  return src.replace(motif, valeur);
}

const master = fs.readFileSync(MASTER, "utf8");

for (const lang of Object.keys(META)) {
  const m = META[lang];
  let out = master;
  out = remplacerUnique(out, /<html lang="fr">/, `<html lang="${m.htmlLang}">`, lang);
  out = remplacerUnique(out, /<title>[^<]*<\/title>/, `<title>${m.title}</title>`, lang);
  out = remplacerUnique(out, /<meta name="description" content="[^"]*">/,
    `<meta name="description" content="${m.desc}">`, lang);
  out = remplacerUnique(out, /<meta property="og:locale" content="[^"]*">/,
    `<meta property="og:locale" content="${m.ogLocale}">`, lang);
  out = remplacerUnique(out, /<meta property="og:title" content="[^"]*">/,
    `<meta property="og:title" content="${m.ogTitle}">`, lang);
  out = remplacerUnique(out, /<meta property="og:description" content="[^"]*">/,
    `<meta property="og:description" content="${m.ogDesc}">`, lang);
  out = remplacerUnique(out, /data-lang="fr"/, `data-lang="${lang}"`, lang);
  out = remplacerUnique(out, /data-src="data\.json"/, `data-src="data-${lang}.json"`, lang);

  const nom = `bracket-c1-${lang}.html`;
  fs.writeFileSync(path.join(__dirname, nom), out);
  console.log(`✓ ${nom}`);
}
console.log("\nMaster FR : bracket-c1.html — c'est le seul fichier à modifier.");
