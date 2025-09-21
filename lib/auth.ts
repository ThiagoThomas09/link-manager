import jwt, { SignOptions } from "jsonwebtoken";

const secret = process.env.JWT_SECRET;

if (!secret) {
  console.warn("JWT_SECRET não definido. Defina no .env para habilitar autenticação JWT.");
}

type JWTPayload = {
  userId: number;
  iat?: number;
  exp?: number;
};

export function signToken(userId: number, expiresIn: string = "7d"): string {
  if (!secret) throw new Error("JWT_SECRET ausente");
  const payload: JWTPayload = { userId };
  return jwt.sign(payload, secret, { expiresIn } as SignOptions);
}

// Retorna o userId do header Authorization: Bearer <token>
export function getUserIdFromRequest(req: Request): number | null {
  try {
    const auth = req.headers.get("authorization");
    if (!auth) return null;
    const [, token] = auth.split(" ");
    if (!token) return null;
    if (!secret) return null;

    const decoded = jwt.verify(token, secret) as JWTPayload;
    return typeof decoded.userId === "number" ? decoded.userId : null;
  } catch {
    return null;
  }
}
