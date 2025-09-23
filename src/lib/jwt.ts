import { SignJWT, jwtVerify } from 'jose';

const issuer = process.env.JWT_ISSUER ?? 'socialconnect';
const audience = process.env.JWT_AUDIENCE ?? 'socialconnect-users';
const accessTtl = Number(process.env.JWT_ACCESS_TTL ?? 900); // seconds
const refreshTtl = Number(process.env.JWT_REFRESH_TTL ?? 1209600); // 14 days
const secret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET ?? 'dev-secret-change');

export type JwtPayload = {
  sub: string;
  role: 'user' | 'admin';
  type: 'access' | 'refresh';
};

export async function signToken(payload: JwtPayload, expiresInSeconds: number) {
  const jwt = await new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(issuer)
    .setAudience(audience)
    .setSubject(payload.sub)
    .setExpirationTime(`${expiresInSeconds}s`)
    .sign(secret);
  return jwt;
}

export function signAccessToken(payload: Omit<JwtPayload, 'type'>) {
  return signToken({ ...payload, type: 'access' }, accessTtl);
}

export function signRefreshToken(payload: Omit<JwtPayload, 'type'>) {
  return signToken({ ...payload, type: 'refresh' }, refreshTtl);
}

export async function verifyToken<T extends JwtPayload>(token: string): Promise<T> {
  const { payload } = await jwtVerify(token, secret, { issuer, audience });
  return payload as T;
}

