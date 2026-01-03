import { Router } from 'express';
import { getDashboardStats } from '../controllers/stats.controller';

// ✅ CORRECTION : Import des noms EXACTS exportés dans votre middleware
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();

// 🔒 Utilisation des fonctions corrigées
router.get(
  '/dashboard', 
  authenticate, // remplace authMiddleware
  authorize(['admin', 'prosecutor', 'commissaire']), // remplace roleMiddleware
  getDashboardStats
);

export default router;