import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";

export const register = async (
  email: string,
  password: string,
  displayName: string,
) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("EMAIL_TAKEN");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: passwordHash,
      displayName,
    },
  });

  return { id: user.id, email: user.email, displayName: user.displayName };
};

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("INVALID_CREDENTIALS");
  }

  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    isAdmin: user.isAdmin,
  };
};
