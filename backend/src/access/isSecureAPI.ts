import type { Access } from 'payload'

export const isSecureAPI: Access = ({ req }) => {
  // Allow if a user is logged in to the Payload Admin panel
  if (req.user) {
    return true;
  }

  // Allow if the frontend provides the correct API Key
  const authHeader = typeof req.headers.get === 'function' ? req.headers.get('authorization') : (req.headers as any).authorization;
  if (authHeader && authHeader === `API-Key ${process.env.PAYLOAD_API_KEY}`) {
    return true;
  }

  // Otherwise, deny access
  return false;
}
