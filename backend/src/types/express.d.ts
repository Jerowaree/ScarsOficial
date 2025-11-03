import "express";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      uid: number;
      roles: string[];
      permisos: string[];
    };
  }
}
