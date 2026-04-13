"use strict";
// src/scripts/seed-penal-complet.ts
// Source : Code pénal du Niger, Loi n° 61-27 du 15 juillet 1961
// Edition du Ministère de la Justice, Janvier 2018 (175 pages)
// Extraction complète — tous les articles avec peines
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
const offenseCategory_model_1 = __importDefault(require("../models/offenseCategory.model"));
const offense_model_1 = __importDefault(require("../models/offense.model"));
const offenseCircumstance_model_1 = __importDefault(require("../models/offenseCircumstance.model"));
const proceduralTemplate_model_1 = __importDefault(require("../models/proceduralTemplate.model"));
const proceduralStep_model_1 = __importDefault(require("../models/proceduralStep.model"));
async function seedPenalComplet() {
    try {
        console.log("⚖️  Seed COMPLET référentiel pénal Niger (Edition 2018)...");
        await models_1.sequelize.authenticate();
        // ═══════════════════════════════════════════════════════════════════════════
        // CATÉGORIES
        // ═══════════════════════════════════════════════════════════════════════════
        console.log("\n📁 Création des catégories...");
        const [crimesHumanite] = await offenseCategory_model_1.default.findOrCreate({
            where: { code: 'CRIMES_HUM' },
            defaults: { name: 'Crimes contre l\'humanité et crimes de guerre', severity: 'crime', displayOrder: 1, isActive: true }
        });
        const [sureteEtat] = await offenseCategory_model_1.default.findOrCreate({
            where: { code: 'SURETE_ETAT' },
            defaults: { name: 'Sûreté de l\'État et attroupements', severity: 'crime', displayOrder: 2, isActive: true }
        });
        const [constitution] = await offenseCategory_model_1.default.findOrCreate({
            where: { code: 'CONSTITUTION' },
            defaults: { name: 'Crimes contre la Constitution et la paix publique', severity: 'crime', displayOrder: 3, isActive: true }
        });
        const [fonctionnaires] = await offenseCategory_model_1.default.findOrCreate({
            where: { code: 'FONCT' },
            defaults: { name: 'Infractions commises par fonctionnaires', severity: 'crime', displayOrder: 4, isActive: true }
        });
        const [attPersonnes] = await offenseCategory_model_1.default.findOrCreate({
            where: { code: 'ATT_PERS' },
            defaults: { name: 'Atteintes aux personnes (coups, blessures, menaces)', severity: 'délit', displayOrder: 5, isActive: true }
        });
        const [meurtres] = await offenseCategory_model_1.default.findOrCreate({
            where: { code: 'MEURTRE' },
            defaults: { name: 'Meurtres et crimes capitaux', severity: 'crime', displayOrder: 6, isActive: true }
        });
        const [libertePersonne] = await offenseCategory_model_1.default.findOrCreate({
            where: { code: 'LIBERTE' },
            defaults: { name: 'Atteintes à la liberté individuelle et esclavage', severity: 'crime', displayOrder: 7, isActive: true }
        });
        const [homicideInv] = await offenseCategory_model_1.default.findOrCreate({
            where: { code: 'HOMICIDE_INV' },
            defaults: { name: 'Homicide et blessures involontaires', severity: 'délit', displayOrder: 8, isActive: true }
        });
        const [moeurs] = await offenseCategory_model_1.default.findOrCreate({
            where: { code: 'MOEURS' },
            defaults: { name: 'Attentats aux mœurs et infractions sexuelles', severity: 'crime', displayOrder: 9, isActive: true }
        });
        const [famille] = await offenseCategory_model_1.default.findOrCreate({
            where: { code: 'FAMILLE' },
            defaults: { name: 'Crimes contre l\'enfant et la famille', severity: 'délit', displayOrder: 10, isActive: true }
        });
        const [propriete] = await offenseCategory_model_1.default.findOrCreate({
            where: { code: 'ATT_BIENS' },
            defaults: { name: 'Crimes et délits contre la propriété', severity: 'délit', displayOrder: 11, isActive: true }
        });
        const [ohada] = await offenseCategory_model_1.default.findOrCreate({
            where: { code: 'OHADA' },
            defaults: { name: 'Infractions relatives au droit OHADA', severity: 'délit', displayOrder: 12, isActive: true }
        });
        const [destructions] = await offenseCategory_model_1.default.findOrCreate({
            where: { code: 'DESTRUCTION' },
            defaults: { name: 'Destructions et dégradations', severity: 'délit', displayOrder: 13, isActive: true }
        });
        const [ordrePublic] = await offenseCategory_model_1.default.findOrCreate({
            where: { code: 'ORDRE_PUB' },
            defaults: { name: 'Ordre public et autorité de l\'État', severity: 'délit', displayOrder: 14, isActive: true }
        });
        // ═══════════════════════════════════════════════════════════════════════════
        // INFRACTIONS
        // ═══════════════════════════════════════════════════════════════════════════
        console.log("📜 Création des infractions...");
        const offenses = [
            // ── CRIMES CONTRE L'HUMANITÉ ET CRIMES DE GUERRE (Art. 208.1-208.8) ────
            { articleCode: 'CP-208.1', name: 'Génocide', type: 'crime',
                legalDefinition: 'Fait tendant à la destruction totale ou partielle d\'un groupe national, ethnique, racial ou religieux. Puni de la peine de mort.',
                minPenaltyMonths: null, maxPenaltyMonths: null, lifeImprisonment: true, proceduralRoute: 'instruction', categoryId: crimesHumanite.id },
            { articleCode: 'CP-208.2', name: 'Crimes contre l\'humanité', type: 'crime',
                legalDefinition: 'Déportation, réduction en esclavage, exécutions sommaires, enlèvements suivis de disparition, torture ou actes inhumains inspirés par des motifs politiques, raciaux ou religieux. Peine de mort.',
                minPenaltyMonths: null, maxPenaltyMonths: null, lifeImprisonment: true, proceduralRoute: 'instruction', categoryId: crimesHumanite.id },
            { articleCode: 'CP-208.3', name: 'Crimes de guerre', type: 'crime',
                legalDefinition: 'Infractions graves aux conventions de Genève : homicide intentionnel, torture, traitements inhumains, prise d\'otages, déportation illicite de civils protégés.',
                minPenaltyMonths: null, maxPenaltyMonths: null, lifeImprisonment: true, proceduralRoute: 'instruction', categoryId: crimesHumanite.id },
            // ── SÛRETÉ DE L'ÉTAT (Art. 62-96) ────────────────────────────────────
            { articleCode: 'CP-62', name: 'Trahison', type: 'crime',
                legalDefinition: 'Crimes de trahison commis par un Nigérien : intelligence avec une puissance étrangère, atteinte à la défense nationale. Peine de mort.',
                minPenaltyMonths: null, maxPenaltyMonths: null, lifeImprisonment: true, proceduralRoute: 'instruction', categoryId: sureteEtat.id },
            { articleCode: 'CP-78', name: 'Attentat contre les institutions', type: 'crime',
                legalDefinition: 'Attentats, complots et infractions contre l\'autorité de l\'État et l\'intégrité du territoire national. Peine de mort.',
                minPenaltyMonths: null, maxPenaltyMonths: null, lifeImprisonment: true, proceduralRoute: 'instruction', categoryId: sureteEtat.id },
            { articleCode: 'CP-97', name: 'Participation à attroupement armé', type: 'crime',
                legalDefinition: 'Participation à un attroupement armé après sommations légales. Emprisonnement de 2 à 10 ans selon le rang.',
                minPenaltyMonths: 24, maxPenaltyMonths: 120, lifeImprisonment: false, proceduralRoute: 'instruction', categoryId: sureteEtat.id },
            // ── INFRACTIONS CONTRE LA CONSTITUTION (Art. 102-208) ────────────────
            { articleCode: 'CP-102', name: 'Crime à caractère racial, régionaliste ou religieux', type: 'crime',
                legalDefinition: 'Crime de caractère racial, régionaliste ou religieux commis sur le territoire. Peine criminelle.',
                minPenaltyMonths: 60, maxPenaltyMonths: null, lifeImprisonment: true, proceduralRoute: 'instruction', categoryId: constitution.id },
            { articleCode: 'CP-208', name: 'Association de malfaiteurs', type: 'délit',
                legalDefinition: 'Toute association ou entente établie dans le but de préparer ou commettre des crimes ou délits. Emprisonnement de 1 à 5 ans.',
                minPenaltyMonths: 12, maxPenaltyMonths: 60, lifeImprisonment: false, proceduralRoute: 'instruction', categoryId: constitution.id },
            // ── FONCTIONNAIRES (Art. 108-134.6) ──────────────────────────────────
            { articleCode: 'CP-108', name: 'Arrestation arbitraire par fonctionnaire', type: 'crime',
                legalDefinition: 'Fonctionnaire qui aura ordonné ou fait une arrestation arbitraire. Réclusion criminelle.',
                minPenaltyMonths: 60, maxPenaltyMonths: 120, lifeImprisonment: false, proceduralRoute: 'instruction', categoryId: fonctionnaires.id },
            { articleCode: 'CP-114', name: 'Abus d\'autorité contre les particuliers', type: 'délit',
                legalDefinition: 'Abus d\'autorité commis par fonctionnaire contre un particulier. Emprisonnement de 1 à 5 ans.',
                minPenaltyMonths: 12, maxPenaltyMonths: 60, lifeImprisonment: false, proceduralRoute: 'parquet', categoryId: fonctionnaires.id },
            { articleCode: 'CP-121', name: 'Soustraction et détournement de fonds publics', type: 'crime',
                legalDefinition: 'Soustraction ou détournement de deniers publics ou privés par dépositaire public. Réclusion criminelle de 5 à 20 ans + amende.',
                minPenaltyMonths: 60, maxPenaltyMonths: 240, lifeImprisonment: false, proceduralRoute: 'instruction', categoryId: fonctionnaires.id },
            { articleCode: 'CP-124', name: 'Concussion', type: 'crime',
                legalDefinition: 'Fonctionnaire qui perçoit des droits, taxes ou contributions non dues. Réclusion criminelle + amende.',
                minPenaltyMonths: 24, maxPenaltyMonths: 120, lifeImprisonment: false, proceduralRoute: 'instruction', categoryId: fonctionnaires.id },
            { articleCode: 'CP-129', name: 'Ingérence des fonctionnaires', type: 'crime',
                legalDefinition: 'Fonctionnaire qui prend un intérêt dans les actes, adjudications ou entreprises dont il a la surveillance. Emprisonnement de 6 mois à 2 ans + amende 100.000 à 1.000.000 FCFA.',
                minPenaltyMonths: 6, maxPenaltyMonths: 24, lifeImprisonment: false, proceduralRoute: 'instruction', categoryId: fonctionnaires.id },
            { articleCode: 'CP-130', name: 'Corruption passive de fonctionnaire', type: 'crime',
                legalDefinition: 'Fonctionnaire qui sollicite ou agrée des offres ou promesses pour accomplir un acte de sa fonction. Emprisonnement de 2 à 10 ans + amende.',
                minPenaltyMonths: 24, maxPenaltyMonths: 120, lifeImprisonment: false, proceduralRoute: 'instruction', categoryId: fonctionnaires.id },
            { articleCode: 'CP-131', name: 'Corruption active', type: 'crime',
                legalDefinition: 'Quiconque aura usé de promesses, offres, dons ou présents pour corrompre un fonctionnaire. Emprisonnement de 1 à 5 ans + amende 50.000 à 1.000.000 FCFA.',
                minPenaltyMonths: 12, maxPenaltyMonths: 60, lifeImprisonment: false, proceduralRoute: 'instruction', categoryId: fonctionnaires.id },
            { articleCode: 'CP-132', name: 'Trafic d\'influence', type: 'crime',
                legalDefinition: 'Promesse ou octroi d\'avantage indu pour abuser de l\'influence d\'un agent public. Emprisonnement de 2 à moins de 10 ans + amende 50.000 à 1.000.000 FCFA.',
                minPenaltyMonths: 24, maxPenaltyMonths: 108, lifeImprisonment: false, proceduralRoute: 'instruction', categoryId: fonctionnaires.id },
            { articleCode: 'CP-134', name: 'Exercice illégal de l\'autorité publique', type: 'délit',
                legalDefinition: 'Fonctionnaire révoqué ou destitué qui continue l\'exercice de ses fonctions. Emprisonnement de 6 mois à 2 ans + amende.',
                minPenaltyMonths: 6, maxPenaltyMonths: 24, lifeImprisonment: false, proceduralRoute: 'parquet', categoryId: fonctionnaires.id },
            { articleCode: 'CP-134.1', name: 'Atteinte à la liberté d\'accès aux marchés publics', type: 'crime',
                legalDefinition: 'Favoritisme dans l\'attribution des marchés publics par agent public. Emprisonnement de 2 à moins de 10 ans + amende 100.000 à 10.000.000 FCFA.',
                minPenaltyMonths: 24, maxPenaltyMonths: 108, lifeImprisonment: false, proceduralRoute: 'instruction', categoryId: fonctionnaires.id },
            { articleCode: 'CP-152', name: 'Faux en écriture publique', type: 'crime',
                legalDefinition: 'Altération frauduleuse de la vérité dans un écrit public destiné à la preuve. Emprisonnement de 5 à moins de 10 ans + amende 20.000 à 1.000.000 FCFA.',
                minPenaltyMonths: 60, maxPenaltyMonths: 108, lifeImprisonment: false, proceduralRoute: 'instruction', categoryId: fonctionnaires.id },
            // ── ORDRE PUBLIC ET AUTORITÉ (Art. 162-221) ───────────────────────────
            { articleCode: 'CP-162', name: 'Rébellion', type: 'délit',
                legalDefinition: 'Opposition par violence à des agents de l\'autorité ou de la force publique. Emprisonnement de 6 mois à 2 ans.',
                minPenaltyMonths: 6, maxPenaltyMonths: 24, lifeImprisonment: false, proceduralRoute: 'parquet', categoryId: ordrePublic.id },
            { articleCode: 'CP-169', name: 'Outrage à magistrat ou fonctionnaire', type: 'délit',
                legalDefinition: 'Outrage par paroles, gestes, menaces ou écrits à magistrat ou dépositaire de l\'autorité. Emprisonnement de 15 jours à 2 ans + amende.',
                minPenaltyMonths: 1, maxPenaltyMonths: 24, lifeImprisonment: false, proceduralRoute: 'parquet', categoryId: ordrePublic.id },
            { articleCode: 'CP-173', name: 'Violence sur fonctionnaire', type: 'délit',
                legalDefinition: 'Violence sur dépositaire de l\'autorité ou de la force publique. Emprisonnement de 1 à 5 ans.',
                minPenaltyMonths: 12, maxPenaltyMonths: 60, lifeImprisonment: false, proceduralRoute: 'parquet', categoryId: ordrePublic.id },
            { articleCode: 'CP-183', name: 'Refus d\'un service légalement dû', type: 'délit',
                legalDefinition: 'Refus ou négligence de remplir un service légalement dû par agent public. Emprisonnement de 3 mois à 2 ans.',
                minPenaltyMonths: 3, maxPenaltyMonths: 24, lifeImprisonment: false, proceduralRoute: 'parquet', categoryId: ordrePublic.id },
            { articleCode: 'CP-197', name: 'Évasion de détenus', type: 'délit',
                legalDefinition: 'Évasion de prisonnier ou détenu légalement incarcéré. Emprisonnement de 3 mois à 2 ans.',
                minPenaltyMonths: 3, maxPenaltyMonths: 24, lifeImprisonment: false, proceduralRoute: 'parquet', categoryId: ordrePublic.id },
            { articleCode: 'CP-209', name: 'Faux témoignage en matière criminelle', type: 'crime',
                legalDefinition: 'Faux témoignage en matière criminelle. Réclusion criminelle de 5 à 10 ans + amende.',
                minPenaltyMonths: 60, maxPenaltyMonths: 120, lifeImprisonment: false, proceduralRoute: 'instruction', categoryId: ordrePublic.id },
            { articleCode: 'CP-217', name: 'Subornation de témoins', type: 'délit',
                legalDefinition: 'Usage de promesses ou pressions pour obtenir une déposition mensongère. Emprisonnement de 2 mois à 3 ans + amende 50.000 à 500.000 FCFA.',
                minPenaltyMonths: 2, maxPenaltyMonths: 36, lifeImprisonment: false, proceduralRoute: 'parquet', categoryId: ordrePublic.id },
            { articleCode: 'CP-220', name: 'Dénonciation calomnieuse', type: 'délit',
                legalDefinition: 'Dénonciation calomnieuse contre une ou plusieurs personnes aux autorités compétentes. Emprisonnement de 6 mois à 5 ans + amende 50.000 à 500.000 FCFA.',
                minPenaltyMonths: 6, maxPenaltyMonths: 60, lifeImprisonment: false, proceduralRoute: 'parquet', categoryId: ordrePublic.id },
            { articleCode: 'CP-221', name: 'Violation du secret professionnel', type: 'délit',
                legalDefinition: 'Médecins, chirurgiens et autres dépositaires de secrets qui les révèlent hors les cas légaux. Emprisonnement de 2 mois à 1 an + amende 10.000 à 200.000 FCFA.',
                minPenaltyMonths: 2, maxPenaltyMonths: 12, lifeImprisonment: false, proceduralRoute: 'parquet', categoryId: ordrePublic.id },
            { articleCode: 'CP-298', name: 'Port illicite d\'armes', type: 'délit',
                legalDefinition: 'Port ou détention d\'armes prohibées sur l\'étendue du territoire. Emprisonnement de 1 à 5 ans + confiscation.',
                minPenaltyMonths: 12, maxPenaltyMonths: 60, lifeImprisonment: false, proceduralRoute: 'parquet', categoryId: ordrePublic.id },
            { articleCode: 'CP-301', name: 'Ivresse publique', type: 'délit',
                legalDefinition: 'Personne trouvée en état d\'ivresse manifeste dans les lieux publics. Emprisonnement de 10 jours à 2 mois + amende 5.000 à 100.000 FCFA.',
                minPenaltyMonths: 1, maxPenaltyMonths: 2, lifeImprisonment: false, proceduralRoute: 'parquet', categoryId: ordrePublic.id },
            // ── ATTEINTES AUX PERSONNES (Art. 222-236) ───────────────────────────
            { articleCode: 'CP-222', name: 'Coups et blessures volontaires', type: 'délit',
                legalDefinition: 'Tout individu qui, volontairement, aura fait des blessures ou porté des coups. Emprisonnement de 3 mois à 2 ans + amende 10.000 à 100.000 FCFA.',
                minPenaltyMonths: 3, maxPenaltyMonths: 24, lifeImprisonment: false, proceduralRoute: 'parquet', categoryId: attPersonnes.id },
            { articleCode: 'CP-222-AGG', name: 'Coups et blessures avec préméditation ou arme', type: 'délit',
                legalDefinition: 'Coups avec préméditation, guet-apens ou usage d\'une arme. Emprisonnement de 6 mois à 3 ans + amende 20.000 à 200.000 FCFA.',
                minPenaltyMonths: 6, maxPenaltyMonths: 36, lifeImprisonment: false, proceduralRoute: 'parquet', categoryId: attPersonnes.id },
            { articleCode: 'CP-222-GRAV', name: 'Coups et blessures graves (infirmité permanente)', type: 'crime',
                legalDefinition: 'Coups ayant entraîné mutilation, amputation, privation d\'usage d\'un membre ou cécité. Emprisonnement de 1 à 8 ans.',
                minPenaltyMonths: 12, maxPenaltyMonths: 96, lifeImprisonment: false, proceduralRoute: 'instruction', categoryId: attPersonnes.id },
            { articleCode: 'CP-222-MORT', name: 'Coups et blessures ayant causé la mort sans intention', type: 'crime',
                legalDefinition: 'Coups sans intention de tuer ayant causé la mort. Emprisonnement de 10 à 20 ans. Avec préméditation ou arme : 15 à 30 ans.',
                minPenaltyMonths: 120, maxPenaltyMonths: 240, lifeImprisonment: false, proceduralRoute: 'instruction', categoryId: attPersonnes.id },
            { articleCode: 'CP-226', name: 'Coups aggravés sur ascendant ou mineur de 13 ans', type: 'crime',
                legalDefinition: 'Coups commis sur père, mère, ascendants ou enfant de moins de 13 ans. Peines doublées par rapport à l\'Art. 222.',
                minPenaltyMonths: 6, maxPenaltyMonths: 48, lifeImprisonment: false, proceduralRoute: 'instruction', categoryId: attPersonnes.id },
            { articleCode: 'CP-230', name: 'Administration de substances nuisibles', type: 'crime',
                legalDefinition: 'Administration de substances nuisibles portant atteinte à la santé. Emprisonnement de 2 à 5 ans.',
                minPenaltyMonths: 24, maxPenaltyMonths: 60, lifeImprisonment: false, proceduralRoute: 'instruction', categoryId: attPersonnes.id },
            { articleCode: 'CP-231', name: 'Castration', type: 'crime',
                legalDefinition: 'Castration volontaire. Si mort dans les 40 jours : réclusion criminelle. Sinon : emprisonnement de 5 à 10 ans.',
                minPenaltyMonths: 60, maxPenaltyMonths: 120, lifeImprisonment: false, proceduralRoute: 'instruction', categoryId: attPersonnes.id },
            { articleCode: 'CP-232.1', name: 'Mutilations génitales féminines', type: 'crime',
                legalDefinition: 'Mutilations génitales féminines. Emprisonnement de 1 à 3 ans + amende. Si décès : 10 à 20 ans.',
                minPenaltyMonths: 12, maxPenaltyMonths: 36, lifeImprisonment: false, proceduralRoute: 'instruction', categoryId: attPersonnes.id },
            { articleCode: 'CP-233', name: 'Menaces avec ordre ou condition', type: 'délit',
                legalDefinition: 'Menace par écrit avec ordre de déposer une somme ou de remplir une condition. Emprisonnement de 2 à 5 ans + amende 20.000 à 200.000 FCFA.',
                minPenaltyMonths: 24, maxPenaltyMonths: 60, lifeImprisonment: false, proceduralRoute: 'parquet', categoryId: attPersonnes.id },
            { articleCode: 'CP-234', name: 'Menaces sans ordre ni condition', type: 'délit',
                legalDefinition: 'Menace criminelle non accompagnée d\'ordre ou condition. Emprisonnement de 1 à 3 ans + amende 10.000 à 100.000 FCFA.',
                minPenaltyMonths: 12, maxPenaltyMonths: 36, lifeImprisonment: false, proceduralRoute: 'parquet', categoryId: attPersonnes.id },
            { articleCode: 'CP-235', name: 'Menaces verbales avec ordre ou condition', type: 'délit',
                legalDefinition: 'Menace verbale faite avec ordre ou sous condition. Emprisonnement de 6 mois à 2 ans + amende 10.000 à 100.000 FCFA.',
                minPenaltyMonths: 6, maxPenaltyMonths: 24, lifeImprisonment: false, proceduralRoute: 'parquet', categoryId: attPersonnes.id },
            // ── MEURTRES ET CRIMES CAPITAUX (Art. 237-244) ───────────────────────
            { articleCode: 'CP-237', name: 'Meurtre', type: 'crime',
                legalDefinition: 'L\'homicide commis volontairement est un meurtre. Emprisonnement à vie. Peine de mort si précédé, accompagné ou suivi d\'un autre crime.',
                minPenaltyMonths: null, maxPenaltyMonths: null, lifeImprisonment: true, proceduralRoute: 'instruction', categoryId: meurtres.id },
            { articleCode: 'CP-238', name: 'Assassinat', type: 'crime',
                legalDefinition: 'Meurtre commis avec préméditation ou guet-apens. Puni de mort.',
                minPenaltyMonths: null, maxPenaltyMonths: null, lifeImprisonment: true, proceduralRoute: 'instruction', categoryId: meurtres.id },
            { articleCode: 'CP-239', name: 'Parricide', type: 'crime',
                legalDefinition: 'Meurtre des père et mère légitimes, naturels ou adoptifs, ou de tout autre ascendant légitime. Puni de mort.',
                minPenaltyMonths: null, maxPenaltyMonths: null, lifeImprisonment: true, proceduralRoute: 'instruction', categoryId: meurtres.id },
            { articleCode: 'CP-240', name: 'Infanticide', type: 'crime',
                legalDefinition: 'Meurtre ou assassinat d\'un nouveau-né. Peine de mort. Exception pour la mère : emprisonnement de 10 à 20 ans.',
                minPenaltyMonths: 120, maxPenaltyMonths: 240, lifeImprisonment: true, proceduralRoute: 'instruction', categoryId: meurtres.id },
            { articleCode: 'CP-241', name: 'Empoisonnement', type: 'crime',
                legalDefinition: 'Attentat à la vie par substances pouvant donner la mort, de quelque manière employées. Puni de mort.',
                minPenaltyMonths: null, maxPenaltyMonths: null, lifeImprisonment: true, proceduralRoute: 'instruction', categoryId: meurtres.id },
            // ── ATTEINTES À LA LIBERTÉ ET ESCLAVAGE (Art. 265-270.5) ────────────
            { articleCode: 'CP-265', name: 'Arrestation et séquestration arbitraires', type: 'crime',
                legalDefinition: 'Arrestation, détention ou séquestration arbitraire. Emprisonnement de 1 à 5 ans. Si durée > 1 mois : 5 à 10 ans.',
                minPenaltyMonths: 12, maxPenaltyMonths: 120, lifeImprisonment: false, proceduralRoute: 'instruction', categoryId: libertePersonne.id },
            { articleCode: 'CP-270', name: 'Aliénation de la liberté d\'autrui', type: 'crime',
                legalDefinition: 'Aliénation à titre gratuit ou onéreux de la liberté d\'une personne. Emprisonnement de 10 à 30 ans. Si victime < 13 ans ou pluralité : peine de mort.',
                minPenaltyMonths: 120, maxPenaltyMonths: 360, lifeImprisonment: true, proceduralRoute: 'instruction', categoryId: libertePersonne.id },
            { articleCode: 'CP-270.2', name: 'Crime d\'esclavage', type: 'crime',
                legalDefinition: 'Réduction d\'une personne en esclavage ou incitation à aliéner sa liberté. Emprisonnement de 10 à 30 ans + amende 1.000.000 à 5.000.000 FCFA.',
                minPenaltyMonths: 120, maxPenaltyMonths: 360, lifeImprisonment: false, proceduralRoute: 'instruction', categoryId: libertePersonne.id },
            { articleCode: 'CP-270.4', name: 'Délit d\'esclavage', type: 'délit',
                legalDefinition: 'Atteinte à l\'intégrité d\'une personne en condition servile ou exploitation de sa prostitution. Emprisonnement de 5 à moins de 10 ans + amende 500.000 à 1.000.000 FCFA.',
                minPenaltyMonths: 60, maxPenaltyMonths: 108, lifeImprisonment: false, proceduralRoute: 'instruction', categoryId: libertePersonne.id },
            { articleCode: 'CP-271', name: 'Violation de domicile', type: 'délit',
                legalDefinition: 'Introduction dans le domicile d\'une personne par menaces ou violences. Emprisonnement de 3 mois à 2 ans + amende 10.000 à 100.000 FCFA.',
                minPenaltyMonths: 3, maxPenaltyMonths: 24, lifeImprisonment: false, proceduralRoute: 'parquet', categoryId: libertePersonne.id },
            // ── HOMICIDE ET BLESSURES INVOLONTAIRES (Art. 272-274) ───────────────
            { articleCode: 'CP-272', name: 'Homicide involontaire', type: 'délit',
                legalDefinition: 'Homicide par maladresse, imprudence, inattention ou négligence. Si mort s\'en suit : emprisonnement de 3 mois à 3 ans + amende 20.000 à 200.000 FCFA.',
                minPenaltyMonths: 3, maxPenaltyMonths: 36, lifeImprisonment: false, proceduralRoute: 'parquet', categoryId: homicideInv.id },
            { articleCode: 'CP-273', name: 'Incendie involontaire avec mort', type: 'délit',
                legalDefinition: 'Incendie involontaire entraînant la mort. Mêmes peines que l\'Art. 272.',
                minPenaltyMonths: 3, maxPenaltyMonths: 36, lifeImprisonment: false, proceduralRoute: 'parquet', categoryId: homicideInv.id },
            { articleCode: 'CP-274', name: 'Délit de fuite', type: 'délit',
                legalDefinition: 'Conducteur ayant causé un accident qui ne s\'est pas arrêté. Emprisonnement de 1 à moins de 10 ans + amende 50.000 à 500.000 FCFA.',
                minPenaltyMonths: 12, maxPenaltyMonths: 108, lifeImprisonment: false, proceduralRoute: 'parquet', categoryId: homicideInv.id },
            // ── ATTENTATS AUX MŒURS (Art. 275-294) ──────────────────────────────
            { articleCode: 'CP-276', name: 'Outrage public à la pudeur', type: 'délit',
                legalDefinition: 'Acte matériel contraire aux bonnes mœurs commis en public. Emprisonnement de 3 mois à 3 ans + amende 10.000 à 100.000 FCFA.',
                minPenaltyMonths: 3, maxPenaltyMonths: 36, lifeImprisonment: false, proceduralRoute: 'parquet', categoryId: moeurs.id },
            { articleCode: 'CP-278', name: 'Attentat à la pudeur sans violence sur mineur de 13 ans', type: 'crime',
                legalDefinition: 'Attentat à la pudeur sans violence sur enfant de moins de 13 ans. Emprisonnement de 2 à moins de 10 ans + amende 20.000 à 200.000 FCFA.',
                minPenaltyMonths: 24, maxPenaltyMonths: 108, lifeImprisonment: false, proceduralRoute: 'instruction', categoryId: moeurs.id },
            { articleCode: 'CP-280', name: 'Attentat à la pudeur avec violence', type: 'crime',
                legalDefinition: 'Attentat à la pudeur commis avec violence. Emprisonnement de 2 à moins de 10 ans. Si sur mineur de 13 ans : 10 à 20 ans.',
                minPenaltyMonths: 24, maxPenaltyMonths: 240, lifeImprisonment: false, proceduralRoute: 'instruction', categoryId: moeurs.id },
            { articleCode: 'CP-281.1', name: 'Harcèlement sexuel', type: 'délit',
                legalDefinition: 'Harcèlement par ordres, menaces ou contrainte pour obtenir des faveurs sexuelles. Emprisonnement de 3 à 6 mois + amende 10.000 à 100.000 FCFA.',
                minPenaltyMonths: 3, maxPenaltyMonths: 12, lifeImprisonment: false, proceduralRoute: 'parquet', categoryId: moeurs.id },
            { articleCode: 'CP-282', name: 'Actes impudiques sur mineur de même sexe', type: 'délit',
                legalDefinition: 'Acte impudique avec individu de son sexe mineur de 21 ans. Emprisonnement de 6 mois à 3 ans + amende 10.000 à 100.000 FCFA.',
                minPenaltyMonths: 6, maxPenaltyMonths: 36, lifeImprisonment: false, proceduralRoute: 'parquet', categoryId: moeurs.id },
            { articleCode: 'CP-283', name: 'Viol', type: 'crime',
                legalDefinition: 'Tout acte de pénétration sexuelle commis sur autrui par violence, contrainte, menace ou surprise. Emprisonnement de 10 à 20 ans. Si victime < 13 ans : 15 à 30 ans.',
                minPenaltyMonths: 120, maxPenaltyMonths: 360, lifeImprisonment: false, proceduralRoute: 'instruction', categoryId: moeurs.id },
            { articleCode: 'CP-285', name: 'Viol ou attentat aggravé', type: 'crime',
                legalDefinition: 'Viol commis par ascendant, personne ayant autorité, fonctionnaire ou avec l\'aide de plusieurs personnes. Pouvant aller à l\'emprisonnement à vie.',
                minPenaltyMonths: 120, maxPenaltyMonths: null, lifeImprisonment: true, proceduralRoute: 'instruction', categoryId: moeurs.id },
            { articleCode: 'CP-286', name: 'Adultère', type: 'délit',
                legalDefinition: 'Relations sexuelles avec une personne autre que son conjoint. Emprisonnement de 15 jours à 3 mois + amende 10.000 à 100.000 FCFA. Poursuite sur plainte du conjoint uniquement.',
                minPenaltyMonths: 1, maxPenaltyMonths: 3, lifeImprisonment: false, proceduralRoute: 'parquet', categoryId: moeurs.id },
            { articleCode: 'CP-290', name: 'Mariage illégal (polygamie non coutumière)', type: 'délit',
                legalDefinition: 'Contraction d\'un autre mariage hors les cas prévus par la loi ou la coutume. Emprisonnement de 2 mois à 1 an + amende 50.000 à 500.000 FCFA.',
                minPenaltyMonths: 2, maxPenaltyMonths: 12, lifeImprisonment: false, proceduralRoute: 'parquet', categoryId: moeurs.id },
            { articleCode: 'CP-291', name: 'Proxénétisme', type: 'délit',
                legalDefinition: 'Aide, assistance ou protection à la prostitution d\'autrui ou partage de ses produits. Emprisonnement de 6 mois à 3 ans + amende 50.000 à 5.000.000 FCFA.',
                minPenaltyMonths: 6, maxPenaltyMonths: 36, lifeImprisonment: false, proceduralRoute: 'parquet', categoryId: moeurs.id },
            // ── CRIMES CONTRE L'ENFANT ET LA FAMILLE (Art. 248-297) ─────────────
            { articleCode: 'CP-248', name: 'Enlèvement et suppression d\'enfant', type: 'crime',
                legalDefinition: 'Enlèvement, recel, suppression ou substitution d\'enfant. Emprisonnement de 2 à 8 ans.',
                minPenaltyMonths: 24, maxPenaltyMonths: 96, lifeImprisonment: false, proceduralRoute: 'instruction', categoryId: famille.id },
            { articleCode: 'CP-255', name: 'Détournement de mineur', type: 'crime',
                legalDefinition: 'Enlèvement ou détournement par fraude ou violence d\'un mineur de moins de 18 ans. Emprisonnement de 2 à moins de 10 ans. Si rançon : emprisonnement à vie.',
                minPenaltyMonths: 24, maxPenaltyMonths: null, lifeImprisonment: true, proceduralRoute: 'instruction', categoryId: famille.id },
            { articleCode: 'CP-259', name: 'Non-représentation d\'enfant', type: 'délit',
                legalDefinition: 'Non-représentation d\'un enfant dont la garde a été fixée par justice. Emprisonnement de 2 mois à 2 ans + amende 20.000 à 200.000 FCFA.',
                minPenaltyMonths: 2, maxPenaltyMonths: 24, lifeImprisonment: false, proceduralRoute: 'parquet', categoryId: famille.id },
            { articleCode: 'CP-260', name: 'Abandon de famille ou de foyer', type: 'délit',
                legalDefinition: 'Abandon sans motif grave du foyer et des obligations familiales. Emprisonnement de 1 mois à 1 an + amende 20.000 à 200.000 FCFA.',
                minPenaltyMonths: 1, maxPenaltyMonths: 12, lifeImprisonment: false, proceduralRoute: 'parquet', categoryId: famille.id },
            { articleCode: 'CP-295', name: 'Avortement provoqué', type: 'délit',
                legalDefinition: 'Avortement provoqué par aliments, breuvages ou médicaments. Emprisonnement de 1 à 5 ans + amende 50.000 à 500.000 FCFA. Si habituel ou sur mineure < 16 ans : 5 à moins de 10 ans.',
                minPenaltyMonths: 12, maxPenaltyMonths: 108, lifeImprisonment: false, proceduralRoute: 'parquet', categoryId: famille.id },
            // ── VOL ET INFRACTIONS CONTRE LA PROPRIÉTÉ (Art. 306-355) ───────────
            { articleCode: 'CP-306', name: 'Vol simple', type: 'délit',
                legalDefinition: 'Soustraction frauduleuse de la chose d\'autrui. Emprisonnement de 1 à 3 ans + amende 5.000 à 100.000 FCFA.',
                minPenaltyMonths: 12, maxPenaltyMonths: 36, lifeImprisonment: false, proceduralRoute: 'parquet', categoryId: propriete.id },
            { articleCode: 'CP-308', name: 'Vol qualifié (salarié ou aubergiste)', type: 'délit',
                legalDefinition: 'Vol commis par salarié chez employeur ou aubergiste. Emprisonnement de 2 à 7 ans + amende 10.000 à 150.000 FCFA.',
                minPenaltyMonths: 24, maxPenaltyMonths: 84, lifeImprisonment: false, proceduralRoute: 'parquet', categoryId: propriete.id },
            { articleCode: 'CP-309', name: 'Vol avec circonstances aggravantes', type: 'crime',
                legalDefinition: 'Vol commis la nuit, en réunion, avec armes, dans une habitation, par effraction, escalade ou avec véhicule motorisé. Emprisonnement de 2 à 7 ans. Avec violence : 2 à moins de 10 ans.',
                minPenaltyMonths: 24, maxPenaltyMonths: 120, lifeImprisonment: false, proceduralRoute: 'instruction', categoryId: propriete.id },
            { articleCode: 'CP-321', name: 'Vol de bétail', type: 'délit',
                legalDefinition: 'Vol ou tentative de vol de bétail. Emprisonnement de 1 à 5 ans + amende 10.000 à 100.000 FCFA.',
                minPenaltyMonths: 12, maxPenaltyMonths: 60, lifeImprisonment: false, proceduralRoute: 'parquet', categoryId: propriete.id },
            { articleCode: 'CP-333', name: 'Escroquerie', type: 'délit',
                legalDefinition: 'Manœuvres frauduleuses pour obtenir la remise de fonds ou obligations. Emprisonnement de 1 à 5 ans + amende 20.000 à 200.000 FCFA. Si appel au public : 2 à moins de 10 ans.',
                minPenaltyMonths: 12, maxPenaltyMonths: 108, lifeImprisonment: false, proceduralRoute: 'parquet', categoryId: propriete.id },
            { articleCode: 'CP-338', name: 'Abus de confiance', type: 'délit',
                legalDefinition: 'Détournement frauduleux d\'un bien remis à charge de le restituer. Emprisonnement de 2 mois à 2 ans + amende. Si fonctionnaire ou salarié : 2 à moins de 10 ans.',
                minPenaltyMonths: 2, maxPenaltyMonths: 108, lifeImprisonment: false, proceduralRoute: 'parquet', categoryId: propriete.id },
            { articleCode: 'CP-338.2', name: 'Délit d\'initié', type: 'délit',
                legalDefinition: 'Usage d\'informations privilégiées par dirigeant de société pour des fins personnelles. Emprisonnement de 2 à moins de 10 ans + amende 100.000 à 100.000.000 FCFA.',
                minPenaltyMonths: 24, maxPenaltyMonths: 108, lifeImprisonment: false, proceduralRoute: 'parquet', categoryId: propriete.id },
            { articleCode: 'CP-343', name: 'Extorsion de fonds par violence', type: 'crime',
                legalDefinition: 'Extorsion de titres ou signatures par violence. Réclusion criminelle à temps.',
                minPenaltyMonths: 60, maxPenaltyMonths: 240, lifeImprisonment: false, proceduralRoute: 'instruction', categoryId: propriete.id },
            { articleCode: 'CP-344', name: 'Chantage', type: 'délit',
                legalDefinition: 'Chantage pour obtenir une remise de fonds ou valeurs. Emprisonnement de 1 à 5 ans + amende.',
                minPenaltyMonths: 12, maxPenaltyMonths: 60, lifeImprisonment: false, proceduralRoute: 'parquet', categoryId: propriete.id },
            { articleCode: 'CP-348', name: 'Filouterie', type: 'délit',
                legalDefinition: 'Filouterie d\'aliments, d\'hôtel ou carburant. Emprisonnement de 6 jours à 6 mois + amende 5.000 à 50.000 FCFA.',
                minPenaltyMonths: 1, maxPenaltyMonths: 6, lifeImprisonment: false, proceduralRoute: 'parquet', categoryId: propriete.id },
            { articleCode: 'CP-354', name: 'Recel', type: 'délit',
                legalDefinition: 'Détention sciemment de choses obtenues à l\'aide d\'un crime ou délit. Emprisonnement de 1 à moins de 10 ans + amende 20.000 à 200.000 FCFA.',
                minPenaltyMonths: 12, maxPenaltyMonths: 108, lifeImprisonment: false, proceduralRoute: 'parquet', categoryId: propriete.id },
            { articleCode: 'CP-356', name: 'Maison de jeux non autorisée', type: 'délit',
                legalDefinition: 'Tenue d\'une maison de jeux de hasard sans autorisation. Emprisonnement de 1 à 5 ans + amende 50.000 à 5.000.000 FCFA.',
                minPenaltyMonths: 12, maxPenaltyMonths: 60, lifeImprisonment: false, proceduralRoute: 'parquet', categoryId: propriete.id },
            { articleCode: 'CP-364.1', name: 'Délit d\'usure', type: 'délit',
                legalDefinition: 'Prêt à taux usuraire dépassant le seuil UEMOA. Emprisonnement de 2 mois à 2 ans + amende 100.000 à 5.000.000 FCFA.',
                minPenaltyMonths: 2, maxPenaltyMonths: 24, lifeImprisonment: false, proceduralRoute: 'parquet', categoryId: propriete.id },
            { articleCode: 'CP-365', name: 'Banqueroute simple', type: 'délit',
                legalDefinition: 'Banqueroute simple commise par commerçant. Emprisonnement de 1 mois à 2 ans.',
                minPenaltyMonths: 1, maxPenaltyMonths: 24, lifeImprisonment: false, proceduralRoute: 'parquet', categoryId: propriete.id },
            { articleCode: 'CP-365-FRAUD', name: 'Banqueroute frauduleuse', type: 'crime',
                legalDefinition: 'Banqueroute frauduleuse. Emprisonnement de 1 à 5 ans.',
                minPenaltyMonths: 12, maxPenaltyMonths: 60, lifeImprisonment: false, proceduralRoute: 'instruction', categoryId: propriete.id },
            // ── INFRACTIONS OHADA (Art. 377.1-377.43) ────────────────────────────
            { articleCode: 'CP-377.1', name: 'Corruption dans le secteur privé', type: 'crime',
                legalDefinition: 'Avantage indu accordé à un dirigeant d\'entité privée pour accomplir un acte. Emprisonnement de 2 à moins de 10 ans + amende 100.000 à 1.000.000 FCFA.',
                minPenaltyMonths: 24, maxPenaltyMonths: 108, lifeImprisonment: false, proceduralRoute: 'instruction', categoryId: ohada.id },
            { articleCode: 'CP-377.2', name: 'Abus de biens sociaux', type: 'crime',
                legalDefinition: 'Usage des biens ou du crédit de la société contraire à son intérêt à des fins personnelles. Emprisonnement de 2 à moins de 10 ans + amende 100.000 à 100.000.000 FCFA.',
                minPenaltyMonths: 24, maxPenaltyMonths: 108, lifeImprisonment: false, proceduralRoute: 'instruction', categoryId: ohada.id },
            { articleCode: 'CP-377.3', name: 'Émission frauduleuse d\'actions', type: 'crime',
                legalDefinition: 'Émission d\'actions avant immatriculation ou obtention de l\'immatriculation par fraude. Emprisonnement de 3 à moins de 10 ans + amende 2.000.000 à 10.000.000 FCFA.',
                minPenaltyMonths: 36, maxPenaltyMonths: 108, lifeImprisonment: false, proceduralRoute: 'instruction', categoryId: ohada.id },
            { articleCode: 'CP-377.41', name: 'Omission de déclaration au registre de commerce', type: 'délit',
                legalDefinition: 'Défaut d\'immatriculation ou d\'inscription au registre de commerce. Amende de 500.000 à 1.000.000 FCFA.',
                minPenaltyMonths: 0, maxPenaltyMonths: 0, lifeImprisonment: false, proceduralRoute: 'parquet', categoryId: ohada.id },
            // ── DESTRUCTIONS ET DÉGRADATIONS (Art. 378-399) ──────────────────────
            { articleCode: 'CP-378', name: 'Incendie volontaire de bâtiments habités', type: 'crime',
                legalDefinition: 'Incendie volontaire d\'édifices, magasins, véhicules de transports publics, lieux habités. Emprisonnement de 10 à 20 ans. Si mort : emprisonnement à vie.',
                minPenaltyMonths: 120, maxPenaltyMonths: 240, lifeImprisonment: true, proceduralRoute: 'instruction', categoryId: destructions.id },
            { articleCode: 'CP-379', name: 'Incendie volontaire de biens non habités', type: 'crime',
                legalDefinition: 'Incendie volontaire d\'édifices non habités, forêts, bois, récoltes. Emprisonnement de 2 à moins de 10 ans + amende 10.000 à 200.000 FCFA.',
                minPenaltyMonths: 24, maxPenaltyMonths: 108, lifeImprisonment: false, proceduralRoute: 'instruction', categoryId: destructions.id },
            { articleCode: 'CP-385', name: 'Destruction par explosifs', type: 'crime',
                legalDefinition: 'Destruction par explosifs d\'édifices, habitations, ponts ou objets mobiliers. Dépôt d\'engin explosif : emprisonnement de 10 à 20 ans.',
                minPenaltyMonths: 120, maxPenaltyMonths: 240, lifeImprisonment: false, proceduralRoute: 'instruction', categoryId: destructions.id },
            { articleCode: 'CP-388', name: 'Incendie involontaire de maison habitée', type: 'délit',
                legalDefinition: 'Incendie involontaire d\'une maison habitée par maladresse ou négligence. Emprisonnement de 15 jours à 2 mois + amende 5.000 à 100.000 FCFA.',
                minPenaltyMonths: 1, maxPenaltyMonths: 2, lifeImprisonment: false, proceduralRoute: 'parquet', categoryId: destructions.id },
            { articleCode: 'CP-389', name: 'Destruction d\'édifices et monuments publics', type: 'crime',
                legalDefinition: 'Destruction volontaire d\'édifices, ponts, digues, voies publiques. Emprisonnement de 2 à moins de 10 ans. Si mort : emprisonnement à vie.',
                minPenaltyMonths: 24, maxPenaltyMonths: null, lifeImprisonment: true, proceduralRoute: 'instruction', categoryId: destructions.id },
            { articleCode: 'CP-390', name: 'Bris de clôture et enlèvement de bornes', type: 'délit',
                legalDefinition: 'Comblement de fossés, arrachage de haies, déplacement de bornes entre propriétés. Emprisonnement de 6 mois à 2 ans + amende 10.000 à 100.000 FCFA.',
                minPenaltyMonths: 6, maxPenaltyMonths: 24, lifeImprisonment: false, proceduralRoute: 'parquet', categoryId: destructions.id },
            { articleCode: 'CP-391', name: 'Dégradation de véhicule', type: 'délit',
                legalDefinition: 'Dégradation volontaire d\'un véhicule appartenant à autrui. Emprisonnement de 1 à 5 ans + amende 10.000 à 100.000 FCFA.',
                minPenaltyMonths: 12, maxPenaltyMonths: 60, lifeImprisonment: false, proceduralRoute: 'parquet', categoryId: destructions.id },
            { articleCode: 'CP-392', name: 'Destruction de titres', type: 'délit',
                legalDefinition: 'Destruction de registres, minutes ou actes originaux de l\'autorité publique, titres ou lettres de change. Emprisonnement de 2 à moins de 10 ans + amende.',
                minPenaltyMonths: 24, maxPenaltyMonths: 108, lifeImprisonment: false, proceduralRoute: 'parquet', categoryId: destructions.id },
            { articleCode: 'CP-393', name: 'Pillage et dégât d\'objets mobiliers', type: 'délit',
                legalDefinition: 'Pillage ou dégât d\'objets mobiliers, denrées ou substances alimentaires. Emprisonnement de 6 mois à 2 ans. En bande : 2 à moins de 10 ans.',
                minPenaltyMonths: 6, maxPenaltyMonths: 108, lifeImprisonment: false, proceduralRoute: 'parquet', categoryId: destructions.id },
            { articleCode: 'CP-395', name: 'Dévastations de récoltes', type: 'délit',
                legalDefinition: 'Dévastation de récoltes sur pied ou plants naturels. Emprisonnement de 1 à 5 ans + amende 10.000 à 100.000 FCFA.',
                minPenaltyMonths: 12, maxPenaltyMonths: 60, lifeImprisonment: false, proceduralRoute: 'parquet', categoryId: destructions.id },
            { articleCode: 'CP-397', name: 'Abattage et mutilation d\'arbres', type: 'délit',
                legalDefinition: 'Abattage, brûlage ou mutilation d\'arbres appartenant à autrui. Emprisonnement de 3 mois à 1 an + amende 10.000 à 100.000 FCFA.',
                minPenaltyMonths: 3, maxPenaltyMonths: 12, lifeImprisonment: false, proceduralRoute: 'parquet', categoryId: destructions.id },
            { articleCode: 'CP-398', name: 'Dommages aux animaux', type: 'délit',
                legalDefinition: 'Empoisonnement volontaire de chevaux, bêtes de charge ou bétail appartenant à autrui. Emprisonnement de 1 à 5 ans + amende 5.000 à 100.000 FCFA.',
                minPenaltyMonths: 12, maxPenaltyMonths: 60, lifeImprisonment: false, proceduralRoute: 'parquet', categoryId: destructions.id },
        ];
        let created = 0;
        for (const o of offenses) {
            const [, isNew] = await offense_model_1.default.findOrCreate({ where: { articleCode: o.articleCode }, defaults: o });
            if (isNew)
                created++;
        }
        console.log(`   ✅ ${created} nouvelles infractions créées sur ${offenses.length}`);
        // ═══════════════════════════════════════════════════════════════════════════
        // CIRCONSTANCES
        // ═══════════════════════════════════════════════════════════════════════════
        console.log("⚠️  Circonstances aggravantes/atténuantes...");
        const circumstances = [
            { offenseCode: 'CP-306', type: 'aggravating', name: 'Récidive', legalBasis: 'CP Art. 56-61', penaltyModifierMonths: 24 },
            { offenseCode: 'CP-306', type: 'aggravating', name: 'Port d\'arme', legalBasis: 'CP Art. 309', penaltyModifierMonths: 36 },
            { offenseCode: 'CP-306', type: 'aggravating', name: 'Commis la nuit', legalBasis: 'CP Art. 309', penaltyModifierMonths: 12 },
            { offenseCode: 'CP-306', type: 'aggravating', name: 'En réunion de personnes', legalBasis: 'CP Art. 309', penaltyModifierMonths: 12 },
            { offenseCode: 'CP-306', type: 'aggravating', name: 'Par effraction ou escalade', legalBasis: 'CP Art. 309', penaltyModifierMonths: 12 },
            { offenseCode: 'CP-306', type: 'aggravating', name: 'Avec véhicule motorisé', legalBasis: 'CP Art. 309', penaltyModifierMonths: 12 },
            { offenseCode: 'CP-306', type: 'mitigating', name: 'Restitution volontaire avant poursuite', penaltyModifierMonths: -12 },
            { offenseCode: 'CP-237', type: 'aggravating', name: 'Préméditation (assassinat)', legalBasis: 'CP Art. 238', penaltyModifierMonths: null },
            { offenseCode: 'CP-237', type: 'aggravating', name: 'Victime ascendant (parricide)', legalBasis: 'CP Art. 239', penaltyModifierMonths: null },
            { offenseCode: 'CP-237', type: 'aggravating', name: 'Précédé ou suivi d\'un autre crime', legalBasis: 'CP Art. 242', penaltyModifierMonths: null },
            { offenseCode: 'CP-237', type: 'mitigating', name: 'Provocation grave de la victime', legalBasis: 'CP Art. 245', penaltyModifierMonths: -60 },
            { offenseCode: 'CP-237', type: 'mitigating', name: 'Légitime défense', legalBasis: 'CP Art. 41', penaltyModifierMonths: null },
            { offenseCode: 'CP-283', type: 'aggravating', name: 'Victime de moins de 13 ans', legalBasis: 'CP Art. 284', penaltyModifierMonths: 60 },
            { offenseCode: 'CP-283', type: 'aggravating', name: 'Auteur ascendant ou ayant autorité', legalBasis: 'CP Art. 285', penaltyModifierMonths: null },
            { offenseCode: 'CP-283', type: 'aggravating', name: 'Commis par plusieurs personnes', legalBasis: 'CP Art. 285', penaltyModifierMonths: 60 },
            { offenseCode: 'CP-283', type: 'aggravating', name: 'Auteur fonctionnaire ou ministre du culte', legalBasis: 'CP Art. 285', penaltyModifierMonths: 60 },
            { offenseCode: 'CP-222', type: 'aggravating', name: 'Sur ascendant ou enfant < 13 ans', legalBasis: 'CP Art. 226', penaltyModifierMonths: 24 },
            { offenseCode: 'CP-222', type: 'aggravating', name: 'Préméditation ou guet-apens', legalBasis: 'CP Art. 222', penaltyModifierMonths: 12 },
            { offenseCode: 'CP-222', type: 'aggravating', name: 'Usage d\'une arme', legalBasis: 'CP Art. 222', penaltyModifierMonths: 12 },
            { offenseCode: 'CP-222', type: 'mitigating', name: 'Provocation de la victime', legalBasis: 'CP Art. 245', penaltyModifierMonths: -6 },
            { offenseCode: 'CP-130', type: 'aggravating', name: 'Montant détourné important', penaltyModifierMonths: 36 },
            { offenseCode: 'CP-130', type: 'aggravating', name: 'Récidive', penaltyModifierMonths: 24 },
            { offenseCode: 'CP-130', type: 'mitigating', name: 'Dénonciation spontanée', penaltyModifierMonths: -24 },
            { offenseCode: 'CP-121', type: 'aggravating', name: 'Montant > 10.000.000 FCFA', penaltyModifierMonths: 60 },
            { offenseCode: 'CP-121', type: 'aggravating', name: 'Récidive', penaltyModifierMonths: 36 },
            { offenseCode: 'CP-378', type: 'aggravating', name: 'Mort résultante', legalBasis: 'CP Art. 384', penaltyModifierMonths: null },
            { offenseCode: 'CP-378', type: 'aggravating', name: 'Infirmité permanente résultante', legalBasis: 'CP Art. 384', penaltyModifierMonths: 120 },
            { offenseCode: 'CP-333', type: 'aggravating', name: 'Appel au public ou actions en société', legalBasis: 'CP Art. 335', penaltyModifierMonths: 36 },
            { offenseCode: 'CP-333', type: 'aggravating', name: 'Usurpation de titre de fonctionnaire', legalBasis: 'CP Art. 336', penaltyModifierMonths: 24 },
            { offenseCode: 'CP-270.2', type: 'aggravating', name: 'Victime mineure de moins de 13 ans', penaltyModifierMonths: 60 },
            { offenseCode: 'CP-270.2', type: 'aggravating', name: 'Pluralité de victimes', penaltyModifierMonths: null },
        ];
        let circCreated = 0;
        for (const c of circumstances) {
            const offense = await offense_model_1.default.findOne({ where: { articleCode: c.offenseCode } });
            if (!offense)
                continue;
            const [, isNew] = await offenseCircumstance_model_1.default.findOrCreate({
                where: { offenseId: offense.id, name: c.name },
                defaults: { type: c.type, name: c.name, legalBasis: c.legalBasis || null,
                    penaltyModifierMonths: c.penaltyModifierMonths || null, offenseId: offense.id, isActive: true }
            });
            if (isNew)
                circCreated++;
        }
        console.log(`   ✅ ${circCreated} circonstances créées`);
        // ═══════════════════════════════════════════════════════════════════════════
        // TEMPLATES PROCÉDURAUX
        // ═══════════════════════════════════════════════════════════════════════════
        console.log("📋 Templates procéduraux...");
        const [tplParquet] = await proceduralTemplate_model_1.default.findOrCreate({
            where: { name: 'Procédure parquet — délit simple' },
            defaults: { offenseCategoryId: propriete.id, caseType: 'criminal', proceduralRoute: 'parquet', isActive: true }
        });
        const [tplInstruction] = await proceduralTemplate_model_1.default.findOrCreate({
            where: { name: 'Procédure avec instruction — crime' },
            defaults: { offenseCategoryId: meurtres.id, caseType: 'criminal', proceduralRoute: 'instruction', isActive: true }
        });
        const [tplCivil] = await proceduralTemplate_model_1.default.findOrCreate({
            where: { name: 'Procédure civile standard' },
            defaults: { offenseCategoryId: propriete.id, caseType: 'civil', proceduralRoute: 'direct_trial', isActive: true }
        });
        const [tplFlagrant] = await proceduralTemplate_model_1.default.findOrCreate({
            where: { name: 'Procédure de flagrant délit' },
            defaults: { offenseCategoryId: ordrePublic.id, caseType: 'criminal', proceduralRoute: 'direct_trial', isActive: true }
        });
        const allSteps = [
            { templateId: tplParquet.id, name: 'Réception et enregistrement du dossier', order: 1, deadlineDays: 2, requiredRole: 'clerk', isMandatory: true },
            { templateId: tplParquet.id, name: 'Notification au plaignant', order: 2, deadlineDays: 5, requiredRole: 'clerk', isMandatory: true },
            { templateId: tplParquet.id, name: 'Audition du mis en cause par le procureur', order: 3, deadlineDays: 15, requiredRole: 'prosecutor', isMandatory: true },
            { templateId: tplParquet.id, name: 'Audition du plaignant et des témoins', order: 4, deadlineDays: 20, requiredRole: 'prosecutor', isMandatory: true },
            { templateId: tplParquet.id, name: 'Réquisitoire du procureur', order: 5, deadlineDays: 30, requiredRole: 'prosecutor', isMandatory: true },
            { templateId: tplParquet.id, name: 'Fixation de l\'audience', order: 6, deadlineDays: 45, requiredRole: 'clerk', isMandatory: true },
            { templateId: tplParquet.id, name: 'Notification de convocation aux parties', order: 7, deadlineDays: 50, requiredRole: 'clerk', isMandatory: true },
            { templateId: tplParquet.id, name: 'Audience correctionnelle', order: 8, deadlineDays: 60, requiredRole: 'judge_trial', isMandatory: true },
            { templateId: tplParquet.id, name: 'Notification du jugement', order: 9, deadlineDays: 70, requiredRole: 'clerk', isMandatory: true },
            { templateId: tplInstruction.id, name: 'Saisine du cabinet d\'instruction', order: 1, deadlineDays: 5, requiredRole: 'prosecutor', isMandatory: true },
            { templateId: tplInstruction.id, name: 'Ordonnance de soit-communiqué', order: 2, deadlineDays: 8, requiredRole: 'judge_instruction', isMandatory: true },
            { templateId: tplInstruction.id, name: 'Inculpation du mis en examen', order: 3, deadlineDays: 15, requiredRole: 'judge_instruction', isMandatory: true },
            { templateId: tplInstruction.id, name: 'Notification des droits à la défense', order: 4, deadlineDays: 16, requiredRole: 'clerk', isMandatory: true },
            { templateId: tplInstruction.id, name: 'Interrogatoire de première comparution', order: 5, deadlineDays: 20, requiredRole: 'judge_instruction', isMandatory: true },
            { templateId: tplInstruction.id, name: 'Audition des témoins', order: 6, deadlineDays: 45, requiredRole: 'judge_instruction', isMandatory: true },
            { templateId: tplInstruction.id, name: 'Expertise médicale ou technique', order: 7, deadlineDays: 60, requiredRole: 'judge_instruction', isMandatory: false },
            { templateId: tplInstruction.id, name: 'Confrontation des parties', order: 8, deadlineDays: 75, requiredRole: 'judge_instruction', isMandatory: false },
            { templateId: tplInstruction.id, name: 'Clôture de l\'instruction', order: 9, deadlineDays: 90, requiredRole: 'judge_instruction', isMandatory: true },
            { templateId: tplInstruction.id, name: 'Ordonnance de renvoi en jugement', order: 10, deadlineDays: 95, requiredRole: 'judge_instruction', isMandatory: true },
            { templateId: tplInstruction.id, name: 'Notification de l\'ordonnance aux parties', order: 11, deadlineDays: 100, requiredRole: 'clerk', isMandatory: true },
            { templateId: tplInstruction.id, name: 'Fixation de l\'audience de jugement', order: 12, deadlineDays: 110, requiredRole: 'clerk', isMandatory: true },
            { templateId: tplInstruction.id, name: 'Audience de jugement', order: 13, deadlineDays: 130, requiredRole: 'judge_trial', isMandatory: true },
            { templateId: tplInstruction.id, name: 'Prononcé du jugement', order: 14, deadlineDays: 135, requiredRole: 'judge_trial', isMandatory: true },
            { templateId: tplInstruction.id, name: 'Notification du jugement aux parties', order: 15, deadlineDays: 140, requiredRole: 'clerk', isMandatory: true },
            { templateId: tplCivil.id, name: 'Enregistrement de la requête', order: 1, deadlineDays: 3, requiredRole: 'clerk', isMandatory: true },
            { templateId: tplCivil.id, name: 'Assignation de la partie adverse', order: 2, deadlineDays: 15, requiredRole: 'clerk', isMandatory: true },
            { templateId: tplCivil.id, name: 'Audience de mise en état', order: 3, deadlineDays: 30, requiredRole: 'judge_trial', isMandatory: true },
            { templateId: tplCivil.id, name: 'Échange de conclusions', order: 4, deadlineDays: 60, requiredRole: 'clerk', isMandatory: true },
            { templateId: tplCivil.id, name: 'Audience de plaidoiries', order: 5, deadlineDays: 75, requiredRole: 'judge_trial', isMandatory: true },
            { templateId: tplCivil.id, name: 'Délibéré', order: 6, deadlineDays: 90, requiredRole: 'judge_trial', isMandatory: true },
            { templateId: tplCivil.id, name: 'Prononcé du jugement', order: 7, deadlineDays: 95, requiredRole: 'judge_trial', isMandatory: true },
            { templateId: tplCivil.id, name: 'Notification du jugement', order: 8, deadlineDays: 100, requiredRole: 'clerk', isMandatory: true },
            { templateId: tplFlagrant.id, name: 'Arrestation et garde à vue', order: 1, deadlineDays: 1, requiredRole: 'officier_police', isMandatory: true },
            { templateId: tplFlagrant.id, name: 'Procès-verbal d\'audition', order: 2, deadlineDays: 1, requiredRole: 'officier_police', isMandatory: true },
            { templateId: tplFlagrant.id, name: 'Transmission au parquet', order: 3, deadlineDays: 2, requiredRole: 'commissaire', isMandatory: true },
            { templateId: tplFlagrant.id, name: 'Déferrement devant le procureur', order: 4, deadlineDays: 3, requiredRole: 'prosecutor', isMandatory: true },
            { templateId: tplFlagrant.id, name: 'Convocation en audience immédiate', order: 5, deadlineDays: 3, requiredRole: 'clerk', isMandatory: true },
            { templateId: tplFlagrant.id, name: 'Audience de flagrant délit', order: 6, deadlineDays: 5, requiredRole: 'judge_trial', isMandatory: true },
            { templateId: tplFlagrant.id, name: 'Prononcé du jugement', order: 7, deadlineDays: 5, requiredRole: 'judge_trial', isMandatory: true },
        ];
        let stepCreated = 0;
        for (const s of allSteps) {
            const [, isNew] = await proceduralStep_model_1.default.findOrCreate({
                where: { templateId: s.templateId, order: s.order },
                defaults: { ...s, isActive: true }
            });
            if (isNew)
                stepCreated++;
        }
        console.log(`   ✅ ${stepCreated} étapes procédurales créées`);
        console.log("\n✅ Référentiel pénal Niger COMPLET seedé !");
        console.log(`   📁 14 catégories`);
        console.log(`   📜 ${offenses.length} infractions (édition 2018)`);
        console.log(`   ⚠️  ${circumstances.length} circonstances`);
        console.log("   📋 4 templates : parquet (9) · instruction (15) · civil (8) · flagrant (7)");
        console.log("   📖 Couverture : Livre I–V + OHADA + crimes contre l'humanité");
        await models_1.sequelize.close();
        process.exit(0);
    }
    catch (error) {
        console.error("❌ Erreur seed pénal:", error);
        process.exit(1);
    }
}
seedPenalComplet();
