// PATH: src/hooks/useToggle.ts
import { useState, useCallback } from "react";

// Définition du type de retour explicite
interface UseToggleReturn {
  value: boolean;
  toggle: () => void;
  setValue: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useToggle = (initial = false): UseToggleReturn => {
  const [value, setValue] = useState(initial);

  // ✅ OPTIMISATION : useCallback permet de garder la même référence de fonction
  // entre les rendus, ce qui est meilleur pour la performance.
  const toggle = useCallback(() => {
    setValue((v) => !v);
  }, []);

  return { value, toggle, setValue };
};