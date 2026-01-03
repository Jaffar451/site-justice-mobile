"use strict";
// Ce fichier centralise toutes les données de test pour le script de seed.
Object.defineProperty(exports, "__esModule", { value: true });
exports.summonsData = exports.assignmentsData = exports.casesData = exports.complaintsData = exports.usersData = void 0;
exports.usersData = [
    { key: "admin", firstname: "Admin", lastname: "Système", email: "admin@justice.com", role: "admin", phone: "+227 90 00 00 01", matricule: "ADM001", poste: "Administrateur Système" },
    { key: "commissaire", firstname: "Moussa", lastname: "Adamou", email: "commissaire@police.ne", role: "police", phone: "+227 90 00 00 02", matricule: "POL001", poste: "Commissaire de Police" },
    { key: "inspecteur", firstname: "Aïcha", lastname: "Ibrahim", email: "inspecteur@police.ne", role: "police", phone: "+227 90 00 00 03", matricule: "POL002", poste: "Inspecteur OPJ" },
    { key: "procureur", firstname: "Hassan", lastname: "Boubacar", email: "procureur@justice.ne", role: "prosecutor", phone: "+227 90 00 00 04", matricule: "PROC001", poste: "Procureur de la République" },
    { key: "substitut", firstname: "Fatima", lastname: "Moussa", email: "substitut@justice.ne", role: "prosecutor", phone: "+227 90 00 00 05", matricule: "PROC002", poste: "Substitut du Procureur" },
    { key: "jugeInstruction", firstname: "Amadou", lastname: "Seydou", email: "juge.instruction@justice.ne", role: "judge", phone: "+227 90 00 00 06", matricule: "JUG001", poste: "Juge d'Instruction" },
    { key: "jugeSiege", firstname: "Mariama", lastname: "Ali", email: "juge.siege@justice.ne", role: "judge", phone: "+227 90 00 00 07", matricule: "JUG002", poste: "Juge du Siège" },
    { key: "greffier", firstname: "Abdoulaye", lastname: "Mamane", email: "greffier@justice.ne", role: "clerk", phone: "+227 90 00 00 08", matricule: "GREF001", poste: "Greffier en Chef" },
    { key: "avocat", firstname: "Khadija", lastname: "Issoufou", email: "avocat@barreau.ne", role: "lawyer", phone: "+227 90 00 00 09", matricule: "AV001", poste: "Avocat au Barreau" },
    { key: "gardien", firstname: "Ousmane", lastname: "Hamidou", email: "gardien@prison.ne", role: "prison_officer", phone: "+227 90 00 00 10", matricule: "PRIS001", poste: "Agent Pénitentiaire" },
    { key: "citoyen1", firstname: "Ibrahim", lastname: "Soumana", email: "citoyen1@example.com", role: "citizen", phone: "+227 90 00 00 11" },
    { key: "citoyen2", firstname: "Rahma", lastname: "Abdou", email: "citoyen2@example.com", role: "citizen", phone: "+227 90 00 00 12" },
];
exports.complaintsData = [
    {
        key: "plainte1",
        citizenKey: "citoyen1",
        description: "Vol à main armée dans un commerce au quartier Terminus. Trois individus armés ont emporté environ 2 millions de FCFA.",
        status: "en_cours_OPJ",
        filedAt: new Date("2024-12-01T10:00:00Z"),
        location: "Niamey, Quartier Terminus",
        provisionalOffence: "Vol qualifié avec violence",
    },
    {
        key: "plainte2",
        citizenKey: "citoyen2",
        description: "Agression physique suite à un différend entre voisins. Coups et blessures volontaires.",
        status: "transmise_procur",
        filedAt: new Date("2024-12-03T14:30:00Z"),
        location: "Niamey, Quartier Yantala",
        provisionalOffence: "Coups et blessures volontaires",
    },
    {
        key: "plainte3",
        citizenKey: "citoyen1",
        description: "Escroquerie via les réseaux sociaux. Vente de faux produits électroniques pour un montant de 500 000 FCFA.",
        status: "soumise",
        filedAt: new Date("2024-12-10T09:15:00Z"),
        location: "Niamey, Centre-ville",
        provisionalOffence: "Escroquerie",
    },
];
exports.casesData = [
    {
        complaintKey: "plainte1",
        reference: "AFF-2024-001",
        type: "criminal",
        status: "open",
        stage: "police_investigation",
        openedAt: new Date("2024-12-01T11:00:00Z"),
    },
    {
        complaintKey: "plainte2",
        reference: "AFF-2024-002",
        type: "criminal",
        status: "open",
        stage: "prosecution_review",
        openedAt: new Date("2024-12-03T15:00:00Z"),
    },
];
exports.assignmentsData = [
    {
        caseRef: "AFF-2024-001",
        userKey: "inspecteur",
        role: "police_investigator",
        assignedAt: new Date("2024-12-01T11:30:00Z"),
    },
    {
        caseRef: "AFF-2024-002",
        userKey: "commissaire",
        role: "police_investigator",
        assignedAt: new Date("2024-12-03T15:30:00Z"),
    },
    {
        caseRef: "AFF-2024-002",
        userKey: "substitut",
        role: "prosecutor",
        assignedAt: new Date("2024-12-04T09:00:00Z"),
    },
];
exports.summonsData = [
    {
        complaintKey: "plainte1",
        issuerKey: "inspecteur",
        targetName: "Amadou MOUSSA",
        targetPhone: "+227 90 11 22 33",
        scheduledAt: new Date("2024-12-15T09:00:00Z"),
        location: "Commissariat Central de Niamey",
        reason: "Audition dans le cadre de l'enquête sur le vol à main armée",
        status: "envoyée",
    },
    {
        complaintKey: "plainte2",
        issuerKey: "commissaire",
        targetName: "Fati ALI",
        targetPhone: "+227 90 44 55 66",
        scheduledAt: new Date("2024-12-14T14:00:00Z"),
        location: "Commissariat du 3ème arrondissement",
        reason: "Témoignage sur l'agression du 3 décembre",
        status: "reçue",
    }
];
