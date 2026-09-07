/**
 * Les 36 clubs de la phase de ligue 2026-27.
 *
 * Clé = identifiant SportMonks (stable, contrairement aux libellés qui varient
 * d'une source à l'autre : « Paris Saint Germain » chez SportMonks,
 * « Paris Saint-Germain » dans le PDF UEFA).
 *
 *   code   : code interne à 3 lettres (mêmes codes que ScheduleFootball/c1)
 *   uefa   : identifiant du CDN écussons UEFA (logos officiels, en couleur)
 *   short  : libellé court pour le mobile et le bracket
 *   light  : couleur du club lisible sur fond clair
 *   dark   : couleur du club lisible sur fond sombre
 *   fr/en/es/pt/it : nom du club dans chaque langue
 */
const TEAMS = {
  781:    { code:"AEK", uefa:"50129",   light:"#1A1A1A", dark:"#F2C230", short:"AEK",
            fr:"AEK Athènes",        en:"AEK Athens",       es:"AEK Atenas",       pt:"AEK Atenas",        it:"AEK Atene" },
  19:     { code:"ARS", uefa:"52280",   light:"#C8102E", dark:"#FF6B6E", short:"Arsenal",
            fr:"Arsenal",            en:"Arsenal",          es:"Arsenal",          pt:"Arsenal",           it:"Arsenal" },
  15:     { code:"AVL", uefa:"52683",   light:"#670E36", dark:"#95BFE5", short:"Aston Villa",
            fr:"Aston Villa",        en:"Aston Villa",      es:"Aston Villa",      pt:"Aston Villa",       it:"Aston Villa" },
  7980:   { code:"ATM", uefa:"50124",   light:"#C8102E", dark:"#FF6B7E", short:"Atlético",
            fr:"Atlético de Madrid", en:"Atlético Madrid",  es:"Atlético de Madrid", pt:"Atlético de Madrid", it:"Atlético Madrid" },
  1668:   { code:"BOD", uefa:"59333",   light:"#1A1A1A", dark:"#FFD400", short:"Bodø/Glimt",
            fr:"Bodø/Glimt",         en:"Bodø/Glimt",       es:"Bodø/Glimt",       pt:"Bodø/Glimt",        it:"Bodø/Glimt" },
  68:     { code:"BVB", uefa:"52758",   light:"#1A1A1A", dark:"#FDE100", short:"Dortmund",
            fr:"Borussia Dortmund",  en:"Borussia Dortmund", es:"Borussia Dortmund", pt:"Borussia Dortmund", it:"Borussia Dortmund" },
  340:    { code:"BRU", uefa:"50043",   light:"#005CA9", dark:"#4FA3E8", short:"Bruges",
            fr:"Club Bruges",        en:"Club Brugge",      es:"Club Brujas",      pt:"Club Brugge",       it:"Club Bruges" },
  268:    { code:"COM", uefa:"79946",   light:"#0B3E8C", dark:"#6E9BEF", short:"Como",
            fr:"Como",               en:"Como",             es:"Como",             pt:"Como",              it:"Como" },
  83:     { code:"BAR", uefa:"50080",   light:"#A50044", dark:"#F0518A", short:"Barcelone",
            fr:"FC Barcelone",       en:"Barcelona",        es:"FC Barcelona",     pt:"Barcelona",         it:"Barcellona" },
  503:    { code:"BAY", uefa:"50037",   light:"#C8102E", dark:"#FF6B7E", short:"Bayern",
            fr:"Bayern Munich",      en:"Bayern München",   es:"Bayern de Múnich", pt:"Bayern de Munique", it:"Bayern Monaco" },
  88:     { code:"FEN", uefa:"52692",   light:"#10357F", dark:"#FFEC00", short:"Fenerbahçe",
            fr:"Fenerbahçe",         en:"Fenerbahçe",       es:"Fenerbahçe",       pt:"Fenerbahçe",        it:"Fenerbahçe" },
  73:     { code:"FEY", uefa:"52749",   light:"#C8102E", dark:"#FF6B7E", short:"Feyenoord",
            fr:"Feyenoord",          en:"Feyenoord",        es:"Feyenoord",        pt:"Feyenoord",         it:"Feyenoord" },
  34:     { code:"GAL", uefa:"50067",   light:"#A90432", dark:"#FDB912", short:"Galatasaray",
            fr:"Galatasaray",        en:"Galatasaray",      es:"Galatasaray",      pt:"Galatasaray",       it:"Galatasaray" },
  2930:   { code:"INT", uefa:"50138",   light:"#0068A8", dark:"#4FA3E8", short:"Inter",
            fr:"Inter Milan",        en:"Inter Milan",      es:"Inter de Milán",   pt:"Inter de Milão",    it:"Inter" },
  3369:   { code:"LSK", uefa:"63405",   light:"#1A1A1A", dark:"#E8EAED", short:"LASK",
            fr:"LASK Linz",          en:"LASK",             es:"LASK",             pt:"LASK",              it:"LASK" },
  690:    { code:"LIL", uefa:"75797",   light:"#C8102E", dark:"#FF6B6E", short:"LOSC",
            fr:"LOSC",               en:"Lille",            es:"Lille",            pt:"Lille",             it:"Lille" },
  271:    { code:"LEN", uefa:"52277",   light:"#D10012", dark:"#FFE000", short:"Lens",
            fr:"RC Lens",            en:"Lens",             es:"Lens",             pt:"Lens",              it:"Lens" },
  8:      { code:"LIV", uefa:"7889",    light:"#C8102E", dark:"#FF6B6E", short:"Liverpool",
            fr:"Liverpool",          en:"Liverpool",        es:"Liverpool",        pt:"Liverpool",         it:"Liverpool" },
  9:      { code:"MCI", uefa:"52919",   light:"#0E7EB0", dark:"#6CABDD", short:"Man City",
            fr:"Manchester City",    en:"Manchester City",  es:"Manchester City",  pt:"Manchester City",   it:"Manchester City" },
  14:     { code:"MUN", uefa:"52682",   light:"#DA291C", dark:"#FF6B6E", short:"Man United",
            fr:"Manchester United",  en:"Manchester United", es:"Manchester United", pt:"Manchester United", it:"Manchester United" },
  597:    { code:"NAP", uefa:"50136",   light:"#0E7EB0", dark:"#4FC3F7", short:"Naples",
            fr:"Naples",             en:"Napoli",           es:"Nápoles",          pt:"Napoli",            it:"Napoli" },
  682:    { code:"PSV", uefa:"50062",   light:"#C8102E", dark:"#FF6B7E", short:"PSV",
            fr:"PSV Eindhoven",      en:"PSV Eindhoven",    es:"PSV Eindhoven",    pt:"PSV Eindhoven",     it:"PSV Eindhoven" },
  591:    { code:"PSG", uefa:"52747",   light:"#004170", dark:"#E8637A", short:"PSG",
            fr:"Paris Saint-Germain", en:"Paris Saint-Germain", es:"Paris Saint-Germain", pt:"Paris Saint-Germain", it:"Paris Saint-Germain" },
  652:    { code:"POR", uefa:"50064",   light:"#00428C", dark:"#5AA9E8", short:"Porto",
            fr:"FC Porto",           en:"Porto",            es:"Oporto",           pt:"FC Porto",          it:"Porto" },
  277:    { code:"RBL", uefa:"2603790", light:"#C50741", dark:"#FF6B8E", short:"Leipzig",
            fr:"RB Leipzig",         en:"RB Leipzig",       es:"RB Leipzig",       pt:"RB Leipzig",        it:"RB Lipsia" },
  485:    { code:"BET", uefa:"52265",   light:"#007A3D", dark:"#3FCB78", short:"Betis",
            fr:"Real Betis",         en:"Real Betis",       es:"Real Betis",       pt:"Real Betis",        it:"Real Betis" },
  3468:   { code:"RMA", uefa:"50051",   light:"#00529F", dark:"#FEBE10", short:"Real Madrid",
            fr:"Real Madrid",        en:"Real Madrid",      es:"Real Madrid",      pt:"Real Madrid",       it:"Real Madrid" },
  37:     { code:"ROM", uefa:"50137",   light:"#8E1F2F", dark:"#F0A05A", short:"Roma",
            fr:"AS Roma",            en:"Roma",             es:"Roma",             pt:"Roma",              it:"Roma" },
  138649: { code:"SAB", uefa:"2609356", light:"#0B4EA2", dark:"#5AA9E8", short:"Sabah",
            fr:"Sabah FK",           en:"Sabah",            es:"Sabah",            pt:"Sabah",             it:"Sabah" },
  621:    { code:"SHK", uefa:"52707",   light:"#C75300", dark:"#FF9E42", short:"Shakhtar",
            fr:"Shakhtar Donetsk",   en:"Shakhtar Donetsk", es:"Shakhtar Donetsk", pt:"Shakhtar Donetsk",  it:"Shakhtar Donetsk" },
  216:    { code:"SLA", uefa:"52498",   light:"#C8102E", dark:"#FF6B7E", short:"Slavia",
            fr:"Slavia Prague",      en:"Slavia Prague",    es:"Slavia de Praga",  pt:"Slavia Praga",      it:"Slavia Praga" },
  2417:   { code:"SLO", uefa:"52797",   light:"#0B4EA2", dark:"#5AA9E8", short:"Slovan",
            fr:"Slovan Bratislava",  en:"Slovan Bratislava", es:"Slovan Bratislava", pt:"Slovan Bratislava", it:"Slovan Bratislava" },
  58:     { code:"SPO", uefa:"50149",   light:"#007A3D", dark:"#3FCB78", short:"Sporting",
            fr:"Sporting Portugal",  en:"Sporting CP",      es:"Sporting de Lisboa", pt:"Sporting CP",     it:"Sporting Lisbona" },
  3319:   { code:"STU", uefa:"50107",   light:"#C8102E", dark:"#FF6B7E", short:"Stuttgart",
            fr:"Stuttgart",          en:"Stuttgart",        es:"Stuttgart",        pt:"Stuttgart",         it:"Stoccarda" },
  321:    { code:"VIK", uefa:"52319",   light:"#0B3C8C", dark:"#6E9BEF", short:"Viking",
            fr:"Viking Stavanger",   en:"Viking",           es:"Viking",           pt:"Viking",            it:"Viking" },
  3477:   { code:"VIL", uefa:"70691",   light:"#8F6314", dark:"#FFE000", short:"Villarreal",
            fr:"Villarreal",         en:"Villarreal",       es:"Villarreal",       pt:"Villarreal",        it:"Villarreal" }
};

// Écussons officiels UEFA, en couleur. 100×100 pour couvrir les écrans 3× :
// l'écusson s'affiche entre 22 et 30 px.
const LOGO = (uefa) => `https://img.uefa.com/imgml/TP/teams/logos/100x100/${uefa}.png`;

module.exports = { TEAMS, LOGO };
