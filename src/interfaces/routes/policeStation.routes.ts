// @ts-nocheck
// PATH: src/interfaces/routes/policeStation.routes.ts
import { Router } from 'express';
import { PoliceStationController } from '../controllers/policeStation.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();
const controller = new PoliceStationController();

/**
 * @route   GET /api/police-stations
 * @desc    Récupérer la liste de tous les commissariats
 * @access  Privé (Admin uniquement pour la gestion)
 */
router.get(
  '/', 
  authenticate, 
  authorize(['admin']), 
  (req, res) => controller.getAll(req, res)
);

/**
 * @route   POST /api/police-stations
 * @desc    Créer un nouveau commissariat
 * @access  Privé (Admin uniquement)
 */
router.post(
  '/', 
  authenticate, 
  authorize(['admin']), 
  (req, res) => controller.create(req, res)
);

/**
 * @route   PUT /api/police-stations/:id
 * @desc    Modifier les informations d'un commissariat existant
 * @access  Privé (Admin uniquement)
 */
router.put(
  '/:id',
  authenticate,
  authorize(['admin']),
  (req, res) => controller.update(req, res)
);

/**
 * @route   DELETE /api/police-stations/:id
 * @desc    Supprimer un commissariat de la base de données
 * @access  Privé (Admin uniquement)
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['admin']),
  (req, res) => controller.delete(req, res)
);

// --- Routes additionnelles (Optionnel) ---

/**
 * @route   GET /api/police-stations/directory
 * @desc    Annuaire simplifié accessible aux citoyens connectés
 */
router.get(
  '/directory', 
  authenticate, 
  (req, res) => {
    // Si vous n'avez pas encore implémenté getDirectory dans le contrôleur, 
    // utilisez getAll ou créez la méthode spécifique.
    if (typeof controller.getDirectory === 'function') {
        return controller.getDirectory(req, res);
    }
    return controller.getAll(req, res);
  }
);

export default router;