import { Request, Response, NextFunction } from "express";

export function requirePerm(...codes: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as { permisos?: string[] };
    const ok = codes.every(c => user?.permisos?.includes(c));
    if (!ok) return res.status(403).json({ error: "PERMISO_DENEGADO" });
    next();
  };
}
