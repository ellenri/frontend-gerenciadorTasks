/**
 * Helpers de data para uso no frontmatter (SSR).
 *
 * Nunca use new Date().toISOString() para datas de formulário:
 * toISOString() devolve em UTC e, à noite (no Brasil, UTC-3),
 * o UTC já "virou o dia seguinte" — e "hoje" ficaria bloqueado
 * no <input type="date"> (mesmo bug corrigido no TaskItem.cs).
 */

/** Data de hoje no fuso LOCAL do servidor, formato YYYY-MM-DD (para <input type="date">). */
export function localToday(): string {
	const now = new Date();
	const y = now.getFullYear();
	const m = String(now.getMonth() + 1).padStart(2, "0"); // +1: janeiro = 0
	const d = String(now.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}
