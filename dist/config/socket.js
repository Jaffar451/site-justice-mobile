"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = exports.io = void 0;
// @ts-nocheck
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken")); // ✅ Pour sécuriser la connexion
const env_1 = require("./env");
const initSocket = (server) => {
    exports.io = new socket_io_1.Server(server, {
        cors: {
            origin: "*", // En production, remplacez par l'URL de votre application/API
            methods: ["GET", "POST"]
        }
    });
    // 🛡️ MIDDLEWARE DE SÉCURITÉ : Vérifie le Token avant la connexion
    exports.io.use((socket, next) => {
        const token = socket.handshake.auth.token || socket.handshake.query.token;
        if (!token) {
            return next(new Error("Authentification requise pour les WebSockets"));
        }
        try {
            // Vérification du JWT (même secret que votre API)
            const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
            socket.user = decoded;
            next();
        }
        catch (err) {
            next(new Error("Token invalide ou expiré"));
        }
    });
    exports.io.on("connection", (socket) => {
        const userId = socket.user?.id;
        console.log(`🔌 Utilisateur authentifié connecté : ${userId} (Socket: ${socket.id})`);
        /**
         * Un policier rejoint une "salle" (room) spécifique à son commissariat
         * stationId : l'ID du commissariat (ex: 2 pour Karadjé)
         */
        socket.on("join_station", (stationId) => {
            const roomName = `station_${stationId}`;
            socket.join(roomName);
            console.log(`👮 Policier [${userId}] a rejoint la salle : ${roomName}`);
        });
        /**
         * Quitter une salle (utile si le policier change d'affectation)
         */
        socket.on("leave_station", (stationId) => {
            socket.leave(`station_${stationId}`);
            console.log(`🏃 Policier a quitté la salle : station_${stationId}`);
        });
        socket.on("disconnect", () => {
            console.log(`❌ Utilisateur déconnecté : ${socket.id}`);
        });
    });
    return exports.io;
};
exports.initSocket = initSocket;
