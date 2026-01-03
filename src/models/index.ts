// PATH: src/models/index.ts
import { Sequelize } from 'sequelize-typescript';

// 1. IMPORTS DES MODÈLES
import User from "./user.model";
import PoliceStation from "./policeStation.model";
import Court from "./court.model";
import Prison from "./prison.model";
import RefreshToken from "./refreshToken.model";
import AuditLog from "./auditLog.model";

// Workflow Judiciaire
import Complaint from "./complaint.model";
import ComplaintFile from "./complaintFile.model";
import CaseModel from "./case.model";
import Assignment from "./assignment.model";
import Decision from "./decision.model";
import Attachment from "./attachment.model";
import Evidence from "./evidence.model";
import Hearing from "./hearing.model";
import Note from "./note.model";
import Indictment from "./indictment.model";
import ProcesVerbal from "./procesVerbal.model";
import Archive from "./archive.model";

// Milieu Carcéral
import Detainee from "./detainee.model";
import Incarceration from "./incarceration.model";

// Procédures & Alertes
import SosAlert from "./sosAlert.model"; 
import Appeal from "./appeal.model";
import ArrestWarrant from "./arrestWarrant.model";
import Confiscation from "./confiscation.model";
import Custody from "./custody.model";
import CustodyExtension from "./custodyExtension.model";
import Detention from "./detention.model";
import Interrogation from "./interrogation.model";
import PreventiveDetention from "./preventiveDetention.model";
import Prosecution from "./prosecution.model";
import Release from "./release.model";
import Reparation from "./reparation.model";
import Sentence from "./sentence.model";
import SearchWarrant from "./searchWarrant.model";
import Warrant from "./warrant.model";
import Witness from "./witness.model";
import Summon from "./summon.model";

// 2. CONFIGURATION DB
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.json')[env];

const sequelize = new Sequelize({
  database: config.database,
  username: config.username,
  password: config.password,
  host: config.host,
  dialect: config.dialect || 'postgres',
  logging: false,
  // ✅ Sequelize-typescript scanne ces classes et configure les associations
  // grâce aux décorateurs @HasMany, @BelongsTo, etc. présents dans les fichiers.
  models: [
    User, PoliceStation, Court, Prison, RefreshToken, AuditLog,
    Complaint, ComplaintFile, CaseModel, Assignment, Decision, Attachment, 
    Evidence, Hearing, Note, Indictment, ProcesVerbal, Archive,
    Detainee, Incarceration, SosAlert, Appeal, ArrestWarrant, Confiscation, 
    Custody, CustodyExtension, Detention, Interrogation, PreventiveDetention, 
    Prosecution, Release, Reparation, Sentence, SearchWarrant, Warrant, 
    Witness, Summon
  ],
});

// ✅ NOTE : Pas d'associations manuelles ici pour éviter "SequelizeAssociationError".
// Les alias comme 'operator' sont définis directement dans les modèles.

// 3. EXPORTS
export {
  sequelize,
  User, PoliceStation, Court, Prison, Detainee, Incarceration, ComplaintFile,
  SosAlert, Complaint, CaseModel, Assignment, Decision, Attachment, Evidence,
  Hearing, AuditLog, Note, RefreshToken, Summon, Indictment, Appeal, ArrestWarrant,
  Confiscation, Custody, CustodyExtension, Detention, Interrogation,
  PreventiveDetention, Prosecution, Release, Reparation, Sentence,
  SearchWarrant, Warrant, Witness, ProcesVerbal, Archive
};