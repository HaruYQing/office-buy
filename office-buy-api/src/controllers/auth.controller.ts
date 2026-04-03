import { prisma } from "../lib/prisma";
import { Request, Response } from "express";
import * as authService from "../services/auth.service";

export const register = async (req: Request, res: Response) => {
  const { email, password, displayName } = req.body;

  if (!email || !password || !displayName) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  try {
    const user = await authService.register(email, password, displayName);
    req.session.userId = user.id;
    req.session.isAdmin = false;
    res.status(201).json(user);
  } catch (err) {
    if (err instanceof Error && err.message === "EMAIL_TAKEN") {
      res.status(409).json({ message: "Email already taken" });
      return;
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  try {
    const user = await authService.login(email, password);
    req.session.userId = user.id;
    req.session.isAdmin = user.isAdmin;
    res
      .status(200)
      .json({
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        isAdmin: user.isAdmin,
      });
  } catch (err) {
    if (err instanceof Error && err.message === "INVALID_CREDENTIALS") {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ message: "Logout failed" });
      return;
    }
    res.clearCookie("connect.sid");
    res.status(200).json({ message: "Logged out" });
  });
};

export const me = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      select: { id: true, email: true, displayName: true, isAdmin: true },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};
