/**
 * Camada de acesso à API REST do backend (.NET).
 *
 * SSR-aware: no servidor (frontmatter das páginas) usamos a URL absoluta e
 * repassamos o cookie do navegador manualmente (o fetch do Node não envia
 * cookies do browser). No cliente usamos caminho relativo + proxy do Vite,
 * assim tudo fica same-origin e o cookie de auth funciona sem problema de
 * SameSite cross-origin.
 */
import type {
  AuthUser,
  Child,
  CreateChildRequest,
  CreateRewardRequest,
  LoginRequest,
  NotificationItem,
  RegisterRequest,
  Reward,
  Task,
  TaskFormData,
  UpdateChildRequest,
} from './types';

const API_BASE =
  import.meta.env.PUBLIC_API_BASE ??
  // SSR (Node) precisa de URL absoluta; cliente usa relativo (proxy do Vite).
  (import.meta.env.SSR ? 'http://localhost:5104' : '');

/** Erro de API com status HTTP, para tratamento diferenciado na UI. */
export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

interface FetchOptions extends RequestInit {
  /** Cabeçalho Cookie a repassar no SSR (Node não envia cookies do browser). */
  cookie?: string;
}

async function apiFetch<T>(path: string, init: FetchOptions = {}): Promise<T> {
  const { cookie, headers, ...rest } = init;
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {}),
      ...headers,
    },
    credentials: 'include',
    ...rest,
  });

  if (!response.ok) {
    // Cliente: se não autenticado e não estamos em login/registro, manda pro login.
    if (
      response.status === 401 &&
      !import.meta.env.SSR &&
      typeof location !== 'undefined' &&
      !location.pathname.startsWith('/login') &&
      !location.pathname.startsWith('/registro')
    ) {
      location.href = '/login';
    }

    let message = `Erro ${response.status} ao chamar ${path}`;
    try {
      const body = await response.json();
      if (body?.detail) message = body.detail;
      else if (body?.title) message = body.title;
      else if (body?.message) message = body.message;
    } catch {
      // resposta sem corpo JSON
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

/** GET /api/children — lista as crianças (do responsável, ou só a si se for criança). */
export async function getChildren(cookie = ''): Promise<Child[]> {
  return apiFetch<Child[]>('/api/children', { cookie });
}

/** GET /api/children/me — perfil da própria criança logada. */
export async function getMyChild(cookie = ''): Promise<Child> {
  return apiFetch<Child>('/api/children/me', { cookie });
}

/** GET /api/children/{id}/edit — dados completos de uma criança para edição (perfil + e-mail). */
export async function getChildForEdit(id: string, cookie = ''): Promise<Child> {
  return apiFetch<Child>(`/api/children/${id}/edit`, { cookie });
}

/** PUT /api/children/{id} — edita uma criança (perfil + e-mail/senha). */
export async function updateChild(id: string, data: UpdateChildRequest, cookie = ''): Promise<Child> {
  return apiFetch<Child>(`/api/children/${id}`, { method: 'PUT', body: JSON.stringify(data), cookie });
}

/** GET /api/tasks — lista todas as missões. */
export async function getTasks(cookie = ''): Promise<Task[]> {
  return apiFetch<Task[]>('/api/tasks', { cookie });
}

/** POST /api/tasks — cria uma missão a partir dos dados do formulário. */
export async function createTask(data: TaskFormData, cookie = ''): Promise<Task> {
  return apiFetch<Task>('/api/tasks', { method: 'POST', body: JSON.stringify(data), cookie });
}

/** POST /api/tasks/{id}/complete — conclui a missão (credita pontos à criança). */
export async function completeTask(id: string, cookie = ''): Promise<Task> {
  return apiFetch<Task>(`/api/tasks/${id}/complete`, { method: 'POST', cookie });
}

/** POST /api/children — cadastra uma nova criança (com avatar escolhido). */
export async function createChild(data: CreateChildRequest, cookie = ''): Promise<Child> {
  return apiFetch<Child>('/api/children', { method: 'POST', body: JSON.stringify(data), cookie });
}

// ============================== Recompensas ==============================

/** GET /api/rewards — lista todas as recompensas. */
export async function getRewards(cookie = ''): Promise<Reward[]> {
  return apiFetch<Reward[]>('/api/rewards', { cookie });
}

/** POST /api/rewards — cria uma recompensa. */
export async function createReward(data: CreateRewardRequest, cookie = ''): Promise<Reward> {
  return apiFetch<Reward>('/api/rewards', { method: 'POST', body: JSON.stringify(data), cookie });
}

/** POST /api/rewards/{id}/redeem — resgata a recompensa para uma criança (desconta pontos). */
export async function redeemReward(id: string, childId: string, cookie = ''): Promise<Reward> {
  return apiFetch<Reward>(`/api/rewards/${id}/redeem`, {
    method: 'POST',
    body: JSON.stringify({ childId }),
    cookie,
  });
}

// ============================== Notificações ==============================

/** GET /api/notifications — lista as notificações do usuário logado. */
export async function getNotifications(cookie = ''): Promise<NotificationItem[]> {
  return apiFetch<NotificationItem[]>('/api/notifications', { cookie });
}

/** GET /api/notifications/unread-count — total de não-lidas (para o sininho). */
export async function getUnreadNotificationCount(cookie = ''): Promise<number> {
  const data = await apiFetch<{ count: number }>('/api/notifications/unread-count', { cookie });
  return data.count;
}

/** POST /api/notifications/{id}/read — marca como lida. */
export async function markNotificationRead(id: string, cookie = ''): Promise<void> {
  await apiFetch<void>(`/api/notifications/${id}/read`, { method: 'POST', cookie });
}

// ============================== Autenticação ==============================

/** POST /api/auth/login — autentica (o servidor emite o cookie HttpOnly). */
export async function login(data: LoginRequest): Promise<AuthUser> {
  return apiFetch<AuthUser>('/api/auth/login', { method: 'POST', body: JSON.stringify(data) });
}

/** POST /api/auth/register — cadastra um responsável e já o autentica. */
export async function register(data: RegisterRequest): Promise<AuthUser> {
  return apiFetch<AuthUser>('/api/auth/register', { method: 'POST', body: JSON.stringify(data) });
}

/** POST /api/auth/logout — encerra a sessão. */
export async function logout(): Promise<void> {
  await apiFetch<void>('/api/auth/logout', { method: 'POST' });
}

/**
 * GET /api/auth/me — usuário atual.
 * Retorna null se anônimo (401) OU se a API estiver indisponível (erro de rede).
 * Assim uma queda do backend degrada para "anônimo" em vez de quebrar a página (SSR).
 */
export async function getCurrentUser(cookie = ''): Promise<AuthUser | null> {
  try {
    return await apiFetch<AuthUser>('/api/auth/me', { cookie });
  } catch (error) {
    // 401 = simplesmente não autenticado.
    if (error instanceof ApiError && error.status === 401) return null;
    // Qualquer outro erro aqui é tipicamente de conectividade (API offline):
    // loga e degrada para anônimo em vez de propagar e quebrar o SSR.
    console.warn('[auth] API indisponível, tratando como anônimo:', error);
    return null;
  }
}
