import api from './api';
import * as Device from 'expo-device';

export const sendSupportTicket = async (message: string) => {
  // On envoie les infos techniques SANS les données personnelles
  const debugInfo = {
    os: Device.osName,
    osVersion: Device.osVersion,
    model: Device.modelName,
    appVersion: "1.0.2",
    timestamp: new Date().toISOString()
  };

  return api.post('/support/tickets', {
    message,
    debugInfo,
    // On n'envoie PAS le contenu de l'écran ou le nom du citoyen
  });
};