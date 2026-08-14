import { getPayload } from 'payload';
import config from '@payload-config';

export async function getUserFromToken(token: string) {
  const payload = await getPayload({ config });
  const { docs: users } = await payload.find({
    collection: 'users',
    where: { email: { equals: token } },
  });
  return users[0] || null;
}

export async function validateSession(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.slice(7);
  const payload = await getPayload({ config });
  
  try {
    const { docs: users } = await payload.find({
      collection: 'users',
      where: { email: { equals: token } },
    });
    return users[0] || null;
  } catch {
    return null;
  }
}

export function requireAuth(user: unknown) {
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

export function requireRole(user: { role?: string }, roles: string[]) {
  if (!user || !user.role || !roles.includes(user.role)) {
    throw new Error('Insufficient permissions');
  }
  return user;
}
