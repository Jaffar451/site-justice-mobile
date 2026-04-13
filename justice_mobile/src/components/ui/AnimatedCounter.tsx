import React, { useEffect, useState, useRef } from 'react';
import { Text, TextProps, Platform } from 'react-native';

interface Props extends TextProps {
  value: number | string;
  duration?: number;
}

export default function AnimatedCounter({ value, duration = 1000, style, ...props }: Props) {
  // ✅ Sécurisation de l'entrée
  const safeValue = value ?? 0;
  
  // ✅ On initialise direct avec 0
  const [displayValue, setDisplayValue] = useState(0);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  
  const targetValue = parseInt(String(safeValue), 10);

  useEffect(() => {
    // ✅ 1. Si ce n'est pas un nombre valide, on arrête tout
    if (isNaN(targetValue)) return;

    // ✅ 2. Si la cible est 0, on affiche juste 0 sans calcul
    if (targetValue === 0) {
      setDisplayValue(0);
      return;
    }

    // ✅ 3. Sur WEB, on utilise requestAnimationFrame (plus performant)
    if (Platform.OS === 'web') {
      startTimeRef.current = null;
      
      const animate = (timestamp: number) => {
        if (!startTimeRef.current) startTimeRef.current = timestamp;
        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        
        // ✅ Easing function (smooth)
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.round(targetValue * easeOutQuart);
        
        setDisplayValue(currentValue);
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setDisplayValue(targetValue);
        }
      };
      
      animationRef.current = requestAnimationFrame(animate);
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
    
    // ✅ 4. Sur NATIVE, on garde setInterval (fonctionne bien)
    let start = 0;
    const stepTime = Math.max(Math.floor(duration / (Math.abs(targetValue) || 1)), 30);
    
    const timer = setInterval(() => {
      const increment = Math.ceil(targetValue / (duration / stepTime));
      start += increment;
      
      if ((targetValue > 0 && start >= targetValue) || (targetValue < 0 && start <= targetValue)) {
        setDisplayValue(targetValue);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [targetValue, duration]);

  // ✅ Rendu de secours si NaN traîne encore
  if (isNaN(displayValue)) return <Text style={style} {...props}>0</Text>;

  return <Text style={style} {...props}>{displayValue}</Text>;
}