/**
 * Helper de sessão para uso no frontmatter (SSR).
 *
 * No SSR, o cookie enviado pelo navegador está em Astro.request.headers.
 * Repassamos esse cookie à API para autenticar cada chamada server-side.
 */
import type { APIContext } from "astro";
import { getCurrentUser } from "./api";
import type { AuthUser } from "./types";

export interface Session {
	user: AuthUser;
	/** Cookie do navegador, para repassar nas chamadas server-side à API. */
	cookie: string;
}

/** Página inicial de cada papel após o login. */
export const HOME_BY_ROLE: Record<string, string> = {
	Parent: "/painel",
	Child: "/crianca",
};

export function homeForRole(role?: string): string {
	return (role && HOME_BY_ROLE[role]) || "/login";
}

/**
 * Lê a sessão a partir do cookie do navegador.
 * Retorna null se o usuário não estiver autenticado.
 */
export async function getSession(Astro: APIContext): Promise<Session | null> {
	const cookie = Astro.request.headers.get("cookie") ?? "";
	const user = await getCurrentUser(cookie);
	return user ? { user, cookie } : null;
}

/**
 * Exige login. Redireciona para /login se anônimo.
 */
export async function requireSession(
	Astro: APIContext,
): Promise<Session | string> {
	const session = await getSession(Astro);
	if (!session) return "/login";
	return session;
}

/**
 * Exige que o usuário seja responsável (Parent). Se anônimo → /login;
 * se for criança → área da criança. Usado nas telas de cadastro e gestão.
 */
export async function requireParent(
	Astro: APIContext,
): Promise<Session | string> {
	const session = await requireSession(Astro);
	if (typeof session === "string") return session;
	if (session.user.role !== "Parent") return homeForRole(session.user.role);
	return session;
}

/**
 * Exige que o usuário seja criança (Child). Se anônimo → /login;
 * se for responsável → painel do responsável. Usado nas telas da área da criança.
 */
export async function requireChild(
	Astro: APIContext,
): Promise<Session | string> {
	const session = await requireSession(Astro);
	if (typeof session === "string") return session;
	if (session.user.role !== "Child") return homeForRole(session.user.role);
	return session;
}
