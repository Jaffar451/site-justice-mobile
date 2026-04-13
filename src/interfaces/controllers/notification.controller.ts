import { Request, Response } from "express";

export const getNotifications = async (_: Request, res: Response) => {
  return res.json({ success: true, data: [] });
};

export const markAsRead = async (req: Request, res: Response) => {
  return res.json({ success: true, message: "Notification marquée comme lue" });
};

export const clearAll = async (_: Request, res: Response) => {
  return res.json({
    success: true,
    message: "Toutes les notifications supprimées",
  });
};

export const deleteNotification = async (req: Request, res: Response) => {
  return res.json({ success: true, message: "Notification supprimée" });
};
