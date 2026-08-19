import {
  BarreFer,
  EstimateResult,
  MaterialLine,
  OuvrageEstimate,
  TechnicalParams,
  VerifiedData,
} from "./types";

// Ratios de métré simplifiés (ordres de grandeur usuels du BTP) utilisés
// pour produire une estimation PRÉLIMINAIRE. Ils ne remplacent pas une étude
// structurelle réalisée par un bureau d'études.
const DOSAGE_SABLE_PAR_M3_BETON = 0.42; // m3 sable / m3 béton dosé à 350
const DOSAGE_GRAVIER_PAR_M3_BETON = 0.82; // m3 gravier / m3 béton
const M3_PAR_BROUETTE = 0.05; // brouette de chantier standard (~50 litres)
const PARPAINGS_PAR_M2 = 12.5; // parpaings 20x20x40 posés / m² de mur net
const RATIO_ACIER = {
  fondations: 40, // kg / m3 béton
  poteauxPoutres: 90,
  dalles: 70,
  toitureDalle: 70,
};
const POIDS_LINEAIRE_ACIER: Record<number, number> = {
  6: 0.222,
  8: 0.395,
  10: 0.617,
  12: 0.888,
  14: 1.208,
  16: 1.578,
  20: 2.466,
};
const LONGUEUR_BARRE_ACIER = 12; // m

function round(value: number, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function brouettes(m3: number) {
  return Math.ceil(m3 / M3_PAR_BROUETTE);
}

function noteBrouettes(m3: number) {
  return `≈ ${brouettes(m3)} brouettes`;
}

function betonComposition(volumeM3: number, dosageCiment: number) {
  const cimentKg = volumeM3 * dosageCiment;
  return {
    cimentSacs: cimentKg / 50,
    sableM3: volumeM3 * DOSAGE_SABLE_PAR_M3_BETON,
    gravierM3: volumeM3 * DOSAGE_GRAVIER_PAR_M3_BETON,
  };
}

// Répartit le tonnage d'acier par diamètre en imitant la pratique BTP
// courante plutôt qu'un simple partage égal : les poteaux/poutres reçoivent
// une part réservée d'étriers (petit diamètre) puis leurs barres principales
// pondérées vers les gros diamètres ; les fondations/dalles/toiture (armées
// en treillis/lits de barres) sont pondérées vers les petits diamètres.
function weightsAscending(n: number, biasSmall: boolean): number[] {
  const ramp = Array.from({ length: n }, (_, i) => (biasSmall ? n - i : i + 1));
  const sum = ramp.reduce((a, b) => a + b, 0);
  return ramp.map((w) => w / sum);
}

interface AcierParElement {
  fondations: number;
  dalles: number;
  toiture: number;
  poteauxPoutres: number;
}

function repartirFerraillage(
  kgParElement: AcierParElement,
  diametresInput: number[]
): BarreFer[] {
  const diametres = [...diametresInput].sort((a, b) => a - b);
  if (diametres.length === 0) return [];

  const kgParDiametre = new Map<number, number>(diametres.map((d) => [d, 0]));
  const addWeighted = (kg: number, biasSmall: boolean) => {
    if (kg <= 0) return;
    const weights = weightsAscending(diametres.length, biasSmall);
    diametres.forEach((d, i) => {
      kgParDiametre.set(d, (kgParDiametre.get(d) ?? 0) + kg * weights[i]);
    });
  };

  const kgStructVerticale = kgParElement.poteauxPoutres;
  const etriersKg = diametres.length > 1 ? kgStructVerticale * 0.15 : 0;
  const mainStructKg = kgStructVerticale - etriersKg;

  if (etriersKg > 0) {
    kgParDiametre.set(diametres[0], (kgParDiametre.get(diametres[0]) ?? 0) + etriersKg);
  }
  addWeighted(mainStructKg, false);
  addWeighted(kgParElement.fondations + kgParElement.dalles + kgParElement.toiture, true);

  return diametres.flatMap((diametre) => {
    const kg = kgParDiametre.get(diametre) ?? 0;
    if (kg <= 0) return [];
    const poidsLineaire = POIDS_LINEAIRE_ACIER[diametre] ?? 0.6;
    const poidsParBarre = poidsLineaire * LONGUEUR_BARRE_ACIER;
    return [{ diametre, nombre: Math.ceil(kg / poidsParBarre) }];
  });
}

export function computeEstimate(
  data: VerifiedData,
  params: TechnicalParams
): EstimateResult {
  const {
    longueurMurs,
    hauteurSousPlafond,
    niveaux,
    surface,
    nombrePortes,
    nombreFenetres,
  } = data;

  const ouvrages: OuvrageEstimate[] = [];
  let acierTotalKg = 0;
  let betonTotalM3 = 0;
  let cimentTotalSacs = 0;
  let sableTotalM3 = 0;
  let gravierTotalM3 = 0;
  let parpaingsTotal = 0;
  let boisTotalM3 = 0;
  let toleFeuillesTotal = 0;
  let acierFondation = 0;
  let acierDalles = 0;
  let acierToiture = 0;
  let acierStructureVerticale = 0;

  // 1. Fondations (semelles filantes)
  const largeurSemelle = 0.5;
  const hauteurSemelle = 0.4;
  const volBetonFondation = longueurMurs * largeurSemelle * hauteurSemelle;
  const volBetonProprete = longueurMurs * (largeurSemelle + 0.1) * 0.05;
  const volFondationTotal = volBetonFondation + volBetonProprete;
  const compFondation = betonComposition(
    volFondationTotal,
    params.dosageCimentBeton
  );
  acierFondation = volFondationTotal * RATIO_ACIER.fondations;
  ouvrages.push({
    key: "fondations",
    label: "Fondations",
    lines: [
      { label: "Béton de fondation", quantity: round(volFondationTotal), unit: "m³" },
      { label: "Ciment", quantity: round(compFondation.cimentSacs), unit: "sacs (50kg)" },
      { label: "Sable", quantity: round(compFondation.sableM3), unit: "m³", note: noteBrouettes(compFondation.sableM3) },
      { label: "Gravier", quantity: round(compFondation.gravierM3), unit: "m³", note: noteBrouettes(compFondation.gravierM3) },
      { label: "Aciers", quantity: round(acierFondation), unit: "kg" },
    ],
  });
  betonTotalM3 += volFondationTotal;
  cimentTotalSacs += compFondation.cimentSacs;
  sableTotalM3 += compFondation.sableM3;
  gravierTotalM3 += compFondation.gravierM3;
  acierTotalKg += acierFondation;

  // 2. Soubassement (élévation en parpaings avant dallage)
  const hauteurSoubassement = 0.6;
  const surfaceSoubassement = longueurMurs * hauteurSoubassement;
  const parpaingsSoubassement = surfaceSoubassement * PARPAINGS_PAR_M2;
  ouvrages.push({
    key: "soubassement",
    label: "Soubassement",
    lines: [
      { label: "Parpaings 20x20x40", quantity: Math.ceil(parpaingsSoubassement), unit: "unités" },
      { label: "Surface montée", quantity: round(surfaceSoubassement), unit: "m²" },
    ],
  });
  parpaingsTotal += parpaingsSoubassement;

  // 3. Murs en élévation
  const surfaceMurBrute = longueurMurs * hauteurSousPlafond * niveaux;
  const surfaceOuvertures = surfaceMurBrute * params.tauxOuvertures;
  const surfaceMurNette = surfaceMurBrute - surfaceOuvertures;
  const nbParpaingsMurs = surfaceMurNette * PARPAINGS_PAR_M2;
  const volMortierPose = surfaceMurNette * params.epaisseurMurs * 0.03;
  const compMortier = betonComposition(volMortierPose, 300);
  ouvrages.push({
    key: "murs",
    label: "Murs en élévation",
    lines: [
      { label: "Parpaings 20x20x40", quantity: Math.ceil(nbParpaingsMurs), unit: "unités" },
      { label: "Surface nette de murs", quantity: round(surfaceMurNette), unit: "m²", note: `${nombrePortes} portes, ${nombreFenetres} fenêtres déduites` },
      { label: "Ciment (mortier de pose)", quantity: round(compMortier.cimentSacs), unit: "sacs (50kg)" },
      { label: "Sable (mortier de pose)", quantity: round(compMortier.sableM3), unit: "m³", note: noteBrouettes(compMortier.sableM3) },
    ],
  });
  parpaingsTotal += nbParpaingsMurs;
  cimentTotalSacs += compMortier.cimentSacs;
  sableTotalM3 += compMortier.sableM3;

  // 4. Poteaux (chaînage vertical, tous les 3m environ)
  const hauteurTotaleBatiment = hauteurSousPlafond * niveaux + 0.3;
  const nbPoteaux = Math.max(Math.ceil(longueurMurs / 3), 4);
  const sectionPoteau = 0.2 * 0.2;
  const volBetonPoteaux = nbPoteaux * sectionPoteau * hauteurTotaleBatiment;
  const compPoteaux = betonComposition(volBetonPoteaux, params.dosageCimentBeton);
  const acierPoteaux = volBetonPoteaux * RATIO_ACIER.poteauxPoutres;
  ouvrages.push({
    key: "poteaux",
    label: "Poteaux",
    lines: [
      { label: "Nombre de poteaux (20x20)", quantity: nbPoteaux, unit: "unités" },
      { label: "Béton poteaux", quantity: round(volBetonPoteaux), unit: "m³" },
      { label: "Ciment", quantity: round(compPoteaux.cimentSacs), unit: "sacs (50kg)" },
      { label: "Sable", quantity: round(compPoteaux.sableM3), unit: "m³", note: noteBrouettes(compPoteaux.sableM3) },
      { label: "Gravier", quantity: round(compPoteaux.gravierM3), unit: "m³", note: noteBrouettes(compPoteaux.gravierM3) },
      { label: "Aciers", quantity: round(acierPoteaux), unit: "kg" },
    ],
  });
  betonTotalM3 += volBetonPoteaux;
  cimentTotalSacs += compPoteaux.cimentSacs;
  sableTotalM3 += compPoteaux.sableM3;
  gravierTotalM3 += compPoteaux.gravierM3;
  acierTotalKg += acierPoteaux;
  acierStructureVerticale += acierPoteaux;

  // 5. Poutres (chaînage horizontal, une ceinture par niveau)
  const longueurPoutres = longueurMurs * niveaux;
  const sectionPoutre = 0.2 * 0.2;
  const volBetonPoutres = longueurPoutres * sectionPoutre;
  const compPoutres = betonComposition(volBetonPoutres, params.dosageCimentBeton);
  const acierPoutres = volBetonPoutres * RATIO_ACIER.poteauxPoutres;
  ouvrages.push({
    key: "poutres",
    label: "Poutres",
    lines: [
      { label: "Linéaire de poutres", quantity: round(longueurPoutres), unit: "m" },
      { label: "Béton poutres", quantity: round(volBetonPoutres), unit: "m³" },
      { label: "Ciment", quantity: round(compPoutres.cimentSacs), unit: "sacs (50kg)" },
      { label: "Sable", quantity: round(compPoutres.sableM3), unit: "m³", note: noteBrouettes(compPoutres.sableM3) },
      { label: "Gravier", quantity: round(compPoutres.gravierM3), unit: "m³", note: noteBrouettes(compPoutres.gravierM3) },
      { label: "Aciers", quantity: round(acierPoutres), unit: "kg" },
    ],
  });
  betonTotalM3 += volBetonPoutres;
  cimentTotalSacs += compPoutres.cimentSacs;
  sableTotalM3 += compPoutres.sableM3;
  gravierTotalM3 += compPoutres.gravierM3;
  acierTotalKg += acierPoutres;
  acierStructureVerticale += acierPoutres;

  // 6. Dalles (plancher haut de chaque niveau)
  const volBetonDalles = surface * params.epaisseurDalle * niveaux;
  const compDalles = betonComposition(volBetonDalles, params.dosageCimentBeton);
  acierDalles = volBetonDalles * RATIO_ACIER.dalles;
  ouvrages.push({
    key: "dalles",
    label: "Dalles",
    lines: [
      { label: `Dalles (${niveaux} niveau${niveaux > 1 ? "x" : ""})`, quantity: round(volBetonDalles), unit: "m³" },
      { label: "Ciment", quantity: round(compDalles.cimentSacs), unit: "sacs (50kg)" },
      { label: "Sable", quantity: round(compDalles.sableM3), unit: "m³", note: noteBrouettes(compDalles.sableM3) },
      { label: "Gravier", quantity: round(compDalles.gravierM3), unit: "m³", note: noteBrouettes(compDalles.gravierM3) },
      { label: "Aciers", quantity: round(acierDalles), unit: "kg" },
    ],
  });
  betonTotalM3 += volBetonDalles;
  cimentTotalSacs += compDalles.cimentSacs;
  sableTotalM3 += compDalles.sableM3;
  gravierTotalM3 += compDalles.gravierM3;
  acierTotalKg += acierDalles;

  // 7. Toiture
  const surfaceToiture = surface * 1.15; // majoration pente
  const toitureLines: MaterialLine[] = [];
  if (params.typeCharpente === "dalle_beton") {
    const volBetonToiture = surface * params.epaisseurDalle;
    const compToiture = betonComposition(volBetonToiture, params.dosageCimentBeton);
    acierToiture = volBetonToiture * RATIO_ACIER.toitureDalle;
    toitureLines.push(
      { label: "Béton toit-terrasse", quantity: round(volBetonToiture), unit: "m³" },
      { label: "Ciment", quantity: round(compToiture.cimentSacs), unit: "sacs (50kg)" },
      { label: "Sable", quantity: round(compToiture.sableM3), unit: "m³", note: noteBrouettes(compToiture.sableM3) },
      { label: "Gravier", quantity: round(compToiture.gravierM3), unit: "m³", note: noteBrouettes(compToiture.gravierM3) },
      { label: "Aciers", quantity: round(acierToiture), unit: "kg" }
    );
    betonTotalM3 += volBetonToiture;
    cimentTotalSacs += compToiture.cimentSacs;
    sableTotalM3 += compToiture.sableM3;
    gravierTotalM3 += compToiture.gravierM3;
    acierTotalKg += acierToiture;
  } else {
    const volBoisCharpente = surfaceToiture * 0.02;
    boisTotalM3 += volBoisCharpente;
    toitureLines.push({
      label: "Bois de charpente",
      quantity: round(volBoisCharpente),
      unit: "m³",
    });
    if (params.typeCouverture === "tole_bac_acier") {
      const nbFeuilles = Math.ceil(surfaceToiture / (0.9 * 3));
      toleFeuillesTotal += nbFeuilles;
      toitureLines.push({
        label: "Tôles bac acier (2.7m²/feuille)",
        quantity: nbFeuilles,
        unit: "feuilles",
      });
    } else if (params.typeCouverture === "tuile") {
      const nbTuiles = Math.ceil(surfaceToiture * 22);
      toitureLines.push({ label: "Tuiles", quantity: nbTuiles, unit: "unités" });
    }
    toitureLines.push({
      label: "Surface de couverture (avec pente)",
      quantity: round(surfaceToiture),
      unit: "m²",
    });
  }
  ouvrages.push({ key: "toiture", label: "Toiture", lines: toitureLines });

  const barres = repartirFerraillage(
    {
      fondations: acierFondation,
      dalles: acierDalles,
      toiture: acierToiture,
      poteauxPoutres: acierStructureVerticale,
    },
    params.diametresFerraillage
  );

  const coutEstimeFCFA =
    cimentTotalSacs * params.prixCimentSac +
    parpaingsTotal * params.prixParpaing +
    barres.reduce((sum, b) => sum + b.nombre, 0) * params.prixFerBarre +
    sableTotalM3 * params.prixSableM3 +
    gravierTotalM3 * params.prixGravierM3 +
    boisTotalM3 * params.prixBoisM3 +
    toleFeuillesTotal * params.prixToleFeuille;

  return {
    ouvrages,
    totals: {
      cimentSacs: Math.ceil(cimentTotalSacs),
      sableM3: round(sableTotalM3),
      sableBrouettes: brouettes(sableTotalM3),
      gravierM3: round(gravierTotalM3),
      gravierBrouettes: brouettes(gravierTotalM3),
      betonM3: round(betonTotalM3),
      parpaings: Math.ceil(parpaingsTotal),
      boisM3: round(boisTotalM3),
      acierKg: round(acierTotalKg),
      barres,
    },
    coutEstimeFCFA: Math.round(coutEstimeFCFA),
    computedAt: new Date().toISOString(),
  };
}
