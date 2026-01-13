import React, { useEffect, useState } from 'react';
import { Text, TextProps } from 'react-native';

interface Props extends TextProps {
  value: number | string;
  duration?: number;
}

export default function AnimatedCounter({ value, duration = 1000, style, ...props }: Props) {
  // Sécurisation de l'entrée
  const safeValue = value ?? 0;
  
  // On initialise direct avec 0
  const [displayValue, setDisplayValue] = useState(0);
  
  const targetValue = parseInt(String(safeValue), 10);

  useEffect(() => {
    // 1. Si ce n'est pas un nombre valide, on arrête tout
    if (isNaN(targetValue)) return;

    // 2. Si la cible est 0, on affiche juste 0 sans calcul (évite le NaN)
    if (targetValue === 0) {
      setDisplayValue(0);
      return;
    }
    
    let start = 0;
    // On s'assure que stepTime est au moins 30ms et fini
    const stepTime = Math.max(Math.floor(duration / (Math.abs(targetValue) || 1)), 30);
    
    const timer = setInterval(() => {
      // Calcul de l'incrément
      const increment = Math.ceil(targetValue / (duration / stepTime));
      
      start += increment;
      
      // Condition de fin (on gère positif et négatif si jamais)
      if ((targetValue > 0 && start >= targetValue) || (targetValue < 0 && start <= targetValue)) {
        setDisplayValue(targetValue);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [targetValue, duration]);

  // Rendu de secours si NaN traîne encore
  if (isNaN(displayValue)) return <Text style={style} {...props}>0</Text>;

  return <Text style={style} {...props}>{displayValue}</Text>;
}