import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export type JWTPayload = {
  uid: number;
  roles: string[];
  permisos: string[];
};

export function auth(req: Request, res: Response, next: NextFunction) {
  const hdr = req.headers.authorization;
  if (!hdr?.startsWith("Bearer ")) return res.status(401).json({ error: "NO_AUTH" });
  try {
    const token = hdr.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    (req as any).user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "TOKEN_INVALIDO" });
  }
}
