declare module "express-session" {
  interface SessionData {
    userId: number;
    isAdmin: boolean;
  }
}

export {};
