/**
 * Camada de acesso à API REST do backend (.NET).
 *
 * Centraliza TODA a comunicação com o servidor em um único arquivo:
 * se a URL base ou o formato mudar, alteramos aqui (DRY).
 *
 * Conceitos:
 * - apiFetch: helper genérico que executa o fetch e TRADUZ respostas de erro
 *   (ProblemDetails do .NET) em exceções JS com mensagem legível.
 * - ApiError: erro tipado para distinguir "falha de regra de negócio" (ex: 400)
 *   de erros de rede/programação, permitindo feedback adequado na UI.
 */
import type { Child, CreateChildRequest, Task, TaskFormData } from './types';

// URL base do backend. PUBLIC_* é exposta ao navegador pelo Astro.
// O fallback torna o projeto funcional sem configurar nada em dev.
const API_BASE = import.meta.env.PUBLIC_API_BASE ?? 'http://localhost:5104';

/** Erro de API com status HTTP, para tratamento diferenciado na UI. */
export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Executa uma requisição e devolve o JSON tipado, ou lança ApiError.
 * O 'T' genérico permite reusar o mesmo helper para qualquer endpoint.
 */
async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

  if (!response.ok) {
    // Tenta extrair a mensagem do ProblemDetails (RFC 7807) que o .NET devolve.
    let message = `Erro ${response.status} ao chamar ${path}`;
    try {
      const body = await response.json();
      // O DomainExceptionHandler preenche 'detail' com a mensagem da regra.
      if (body?.detail) message = body.detail;
      else if (body?.title) message = body.title;
    } catch {
      // resposta sem corpo JSON — mantém a mensagem padrão
    }
    throw new ApiError(message, response.status);
  }

  // 204 No Content não tem corpo.
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

/** GET /api/children — lista todas as crianças. */
export async function getChildren(): Promise<Child[]> {
  return apiFetch<Child[]>('/api/children');
}

/** GET /api/tasks — lista todas as missões. */
export async function getTasks(): Promise<Task[]> {
  return apiFetch<Task[]>('/api/tasks');
}

/** POST /api/tasks — cria uma missão a partir dos dados do formulário. */
export async function createTask(data: TaskFormData): Promise<Task> {
  return apiFetch<Task>('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** POST /api/tasks/{id}/complete — conclui a missão (credita pontos à criança). */
export async function completeTask(id: string): Promise<Task> {
  return apiFetch<Task>(`/api/tasks/${id}/complete`, { method: 'POST' });
}

/** POST /api/children — cadastra uma nova criança (com avatar escolhido). */
export async function createChild(data: CreateChildRequest): Promise<Child> {
  return apiFetch<Child>('/api/children', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
