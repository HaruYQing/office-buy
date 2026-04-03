import { Request, Response, NextFunction } from "express";

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.session.userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  next();
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.session.userId || !req.session.isAdmin) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }
  next();
};
