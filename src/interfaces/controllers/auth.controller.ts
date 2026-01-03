import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, RefreshToken } from '../../models';
import { env } from '../../config/env';

// --- Helpers ---
const signAccessToken = (userId: number, role: string) => {
  if (!env.jwt.secret) throw new Error("JWT_SECRET manquant");
  return jwt.sign({ id: userId, role }, env.jwt.secret, { expiresIn: env.jwt.expiration as any });
};

const signRefreshToken = (userId: number) => {
  const secret = env.jwt.refreshSecret || "FALLBACK";
  return jwt.sign({ id: userId }, secret, { expiresIn: '7d' as any });
};

export default class AuthController {

  /**
   * 📝 INSCRIPTION (REGISTER)
   */
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { firstname, lastname, email, password, matricule } = req.body;
      
      // Vérification existant
      const existing = await User.findOne({ where: { email } });
      if (existing) return res.status(400).json({ message: "Cet email est déjà utilisé." });

      const hashedPassword = await bcrypt.hash(password, 10);
      
      const newUser = await User.create({
        firstname, lastname, email, matricule,
        password: hashedPassword,
        role: 'citizen' // Par défaut
      });

      return res.status(201).json({ 
        success: true, 
        message: "Compte créé avec succès.",
        data: { id: newUser.id, email: newUser.email }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 🔑 CONNEXION (LOGIN)
   */
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      console.log(`[AUTH] Login: ${email}`);

      const user = await User.findOne({ where: { email } });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Identifiants invalides." });
      }

      const accessToken = signAccessToken(user.id, user.role);
      const refreshToken = signRefreshToken(user.id);

      await RefreshToken.destroy({ where: { userId: user.id } });
      await RefreshToken.create({ token: refreshToken, userId: user.id, expiryDate: new Date(Date.now() + 7 * 24 * 3600000) });

      return res.status(200).json({
        success: true,
        message: "Connexion réussie",
        data: {
          user: { id: user.id, email: user.email, role: user.role, matricule: user.matricule },
          tokens: { accessToken, refreshToken }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 🔄 REFRESH TOKEN
   */
  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;
      if (!token) return res.status(400).json({ message: "Token requis" });

      const storedToken = await RefreshToken.findOne({ where: { token } });
      if (!storedToken) return res.status(403).json({ message: "Token invalide" });

      // Vérification expiration
      if (storedToken.expiryDate < new Date()) {
        await RefreshToken.destroy({ where: { id: storedToken.id } });
        return res.status(403).json({ message: "Token expiré, veuillez vous reconnecter" });
      }

      // Génération nouveau token
      const user = await User.findByPk(storedToken.userId);
      if (!user) return res.status(403).json({ message: "Utilisateur introuvable" });

      const newAccessToken = signAccessToken(user.id, user.role);
      
      return res.json({ 
        accessToken: newAccessToken, 
        refreshToken: token // On peut garder le même ou le tourner (rotation)
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 👤 PROFIL (ME)
   */
  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      // L'utilisateur est injecté par le middleware 'authenticate' dans req.user
      const userId = (req as any).user?.id;
      const user = await User.findByPk(userId, { attributes: { exclude: ['password'] } });
      
      if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

      return res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }
}