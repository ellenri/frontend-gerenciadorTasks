/**
 * Helper de sessão para uso no frontmatter (SSR).
 *
 * No SSR, o cookie enviado pelo navegador está em Astro.request.headers.
 * Repassamos esse cookie à API para autenticar cada chamada server-side.
 */
import type { APIContext } from 'astro';
import { getCurrentUser } from './api';
import type { AuthUser } from './types';

export interface Session {
  user: AuthUser;
  /** Cookie do navegador, para repassar nas chamadas server-side à API. */
  cookie: string;
}

/**
 * Lê a sessão a partir do cookie do navegador.
 * Retorna null se o usuário não estiver autenticado.
 */
export async function getSession(Astro: APIContext): Promise<Session | null> {
  const cookie = Astro.request.headers.get('cookie') ?? '';
  const user = await getCurrentUser(cookie);
  return user ? { user, cookie } : null;
}
