import { createNavigationContainerRef, StackActions, CommonActions } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';

// ✅ Création de la référence typée
// C'est cette variable 'navigationRef' que vous devez passer au <NavigationContainer> dans AppNavigator.tsx
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/**
 * Naviguer vers un écran ou un Stack
 * @param name Nom de la route (ex: 'PoliceStack', 'Auth', 'ComplaintDetail')
 * @param params Paramètres (ex: { screen: 'PoliceHome' } pour naviguer à l'intérieur d'un stack)
 */
export function navigate(name: keyof RootStackParamList, params?: any) {
  if (navigationRef.isReady()) {
    // Le cast 'as any' est nécessaire pour gérer les paramètres des Nested Navigators
    navigationRef.navigate(name as any, params);
  }
}

/**
 * Remplacer l'écran actuel par un autre (Pas de retour possible)
 * 💡 Idéal après la Connexion pour rediriger vers le Dashboard sans pouvoir revenir au Login
 */
export function replace(name: keyof RootStackParamList, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.replace(name, params));
  }
}

/**
 * Réinitialiser toute la pile de navigation
 * 💡 Idéal lors de la Déconnexion (Logout) pour revenir à 'Auth' et effacer l'historique
 */
export function reset(name: keyof RootStackParamList, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name, params }],
      })
    );
  }
}

/**
 * Retourner à l'écran précédent (si possible)
 */
export function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
}

/**
 * Obtenir le nom de l'écran actuel (Utile pour le debug ou Analytics)
 */
export function getCurrentRouteName() {
  if (navigationRef.isReady()) {
    return navigationRef.getCurrentRoute()?.name;
  }
  return undefined;
}
