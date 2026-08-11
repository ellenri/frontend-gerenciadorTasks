/**
 * Lógica de organização do histórico de missões por período.
 *
 * Funções PURAS (sem efeito colateral, sem acesso a rede/DOM) para facilitar
 * teste e reuso entre as telas de histórico do responsável e da criança.
 *
 * Organização:
 *  - 3 granularidades: Hoje (1 dia) / Semana (seg–dom) / Mês (1º ao último dia).
 *  - Cada granularidade é "navegável" para trás via offset (0 = período atual).
 *  - Dentro de uma janela, as missões são agrupadas por dia.
 *
 * Observação de fuso: operamos sempre em data LOCAL (não UTC) para que o
 * agrupamento por dia bata com o que o usuário vê no calendário.
 */
import type { Task } from './types';

export type Period = 'hoje' | 'semana' | 'mes';

export const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 'hoje', label: 'Hoje' },
  { value: 'semana', label: 'Esta semana' },
  { value: 'mes', label: 'Este mês' },
];

/**
 * Período padrão ao abrir a tela, conforme o papel do usuário.
 * Criança → diário (gratificação imediata); Responsável → semanal (consistência).
 */
export const DEFAULT_PERIOD_BY_ROLE: Record<string, Period> = {
  Parent: 'semana',
  Child: 'hoje',
};

/** Janela temporal [start, end] inclusiva, em datas locais no início do dia. */
export interface Window {
  start: Date;
  end: Date;
}

export interface DayGroup {
  /** Chave YYYY-MM-DD (local) — usada para ordenação/lookup. */
  key: string;
  /** Rótulo amigável: "Hoje", "Ontem" ou "Segunda, 12/08". */
  label: string;
  tasks: Task[];
  completed: number;
  skipped: number;
  points: number;
}

export interface HistorySummary {
  completed: number;
  skipped: number;
  total: number;
  /** concluídas / total (0..1). 0 quando não há histórico. */
  completionRate: number;
  points: number;
  /** Sequência atual de dias consecutivos com ≥1 missão concluída. */
  streak: number;
}

const WEEKDAYS = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
];

const MONTHS = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

/** Normaliza o parâmetro de período vindo da URL, caindo no padrão do papel. */
export function normalizePeriod(value: string | null, role: string): Period {
  if (value === 'hoje' || value === 'semana' || value === 'mes') return value;
  return DEFAULT_PERIOD_BY_ROLE[role] ?? 'semana';
}

/** Normaliza o offset (inteiro ≤ 0; futuro não é navegável). */
export function normalizeOffset(value: string | null): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n > 0) return 0;
  return Math.trunc(n);
}

// ============================ Datas (helpers locais) ============================

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** "YYYY-MM-DD" -> Date local (evita o pitfall de parse UTC de new Date(string)). */
function dateFromScheduled(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

/**
 * Data de referência de uma missão para fins de histórico temporal.
 * Concluída -> quando foi concluída (completedAt); cancelada -> quando estava
 * agendada (scheduledDate), que é o ponto mais intuitivo para o usuário.
 */
export function taskDate(t: Task): Date {
  if (t.completedAt) {
    const dt = new Date(t.completedAt);
    if (!Number.isNaN(dt.getTime())) return startOfDay(dt);
  }
  return dateFromScheduled(t.scheduledDate);
}

/**
 * Data AGENDADA da missão (scheduledDate), ignorando completedAt.
 * Usada para organizar a tela de Missões (visão do que está previsto por dia),
 * em contraste com taskDate (usada no Histórico, que prefere completedAt).
 */
export function scheduledTaskDate(t: Task): Date {
  return dateFromScheduled(t.scheduledDate);
}

/** Calcula a janela [start, end] (inclusiva) para o período/offset dados. */
export function getWindow(period: Period, offset: number, now: Date = new Date()): Window {
  const base = startOfDay(now);
  if (period === 'hoje') {
    const d = new Date(base);
    d.setDate(d.getDate() + offset);
    return { start: d, end: d };
  }

  if (period === 'semana') {
    // Semana ISO (começa na segunda). offset em semanas.
    const dayOfWeek = (base.getDay() + 6) % 7; // 0 = segunda, ..., 6 = domingo
    const monday = new Date(base);
    monday.setDate(monday.getDate() - dayOfWeek + offset * 7);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { start: monday, end: sunday };
  }

  // mês: offset em meses, a partir do mês atual.
  const year = base.getFullYear();
  const month = base.getMonth() + offset;
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0); // último dia do mês
  return { start, end };
}

/** Rótulo do cabeçalho de um grupo de dia ("Hoje", "Ontem", "Segunda, 12/08"). */
export function dayLabel(date: Date, now: Date = new Date()): string {
  const today = startOfDay(now);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date.getTime() === today.getTime()) return 'Hoje';
  if (date.getTime() === yesterday.getTime()) return 'Ontem';
  return `${WEEKDAYS[date.getDay()]}, ${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}`;
}

/** Título da janela (ex.: "Hoje, 12/08", "04/08 a 10/08", "Agosto de 2026"). */
export function windowTitle(period: Period, w: Window, now: Date = new Date()): string {
  if (period === 'hoje') {
    const today = startOfDay(now);
    if (w.start.getTime() === today.getTime()) return `Hoje, ${pad2(w.start.getDate())}/${pad2(w.start.getMonth() + 1)}`;
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (w.start.getTime() === yesterday.getTime()) return `Ontem, ${pad2(yesterday.getDate())}/${pad2(yesterday.getMonth() + 1)}`;
    return `${pad2(w.start.getDate())}/${pad2(w.start.getMonth() + 1)}/${w.start.getFullYear()}`;
  }
  if (period === 'semana') {
    return `${pad2(w.start.getDate())}/${pad2(w.start.getMonth() + 1)} a ${pad2(
      w.end.getDate(),
    )}/${pad2(w.end.getMonth() + 1)}`;
  }
  return `${MONTHS[w.start.getMonth()][0].toUpperCase()}${MONTHS[w.start.getMonth()].slice(1)} de ${w.start.getFullYear()}`;
}

// ============================ Filtragem / agrupamento ============================

/**
 * Mantém só as missões dentro da janela [start, end] (comparação local por dia).
 * @param dateFn Extrator de data (default: taskDate = completedAt ?? scheduledDate.
 *   Para Missões, passe scheduledTaskDate para agrupar pela data prevista).
 */
export function filterInWindow(
  tasks: Task[],
  w: Window,
  dateFn: (t: Task) => Date = taskDate,
): Task[] {
  const startKey = dayKey(w.start);
  const endKey = dayKey(w.end);
  return tasks.filter((t) => {
    const k = dayKey(dateFn(t));
    return k >= startKey && k <= endKey;
  });
}

/** Grupo de dia "puro" (sem contadores) — base compartilhada entre visões. */
export interface DayBucket {
  key: string;
  label: string;
  tasks: Task[];
}

/**
 * Agrupa as missões por dia (do mais recente ao mais antigo), sem ordenar nem
 * contar nada dentro de cada grupo — cada visão ordena/conta como precisar.
 */
export function bucketByDay(
  tasks: Task[],
  dateFn: (t: Task) => Date = taskDate,
): DayBucket[] {
  const byKey = new Map<string, Task[]>();
  for (const t of tasks) {
    const k = dayKey(dateFn(t));
    const arr = byKey.get(k);
    if (arr) arr.push(t);
    else byKey.set(k, [t]);
  }

  const keys = [...byKey.keys()].sort((a, b) => (a < b ? 1 : -1));
  return keys.map((k) => {
    const [y, m, d] = k.split('-').map(Number);
    return { key: k, label: dayLabel(new Date(y, m - 1, d)), tasks: byKey.get(k)! };
  });
}

/**
 * Agrupa as missões por dia (do mais recente ao mais antigo). Cada grupo traz
 * contadores prontos para o Histórico (concluídas, canceladas, pontos).
 */
export function groupByDay(
  tasks: Task[],
  dateFn: (t: Task) => Date = taskDate,
): DayGroup[] {
  return bucketByDay(tasks, dateFn).map((b) => {
    const dayTasks = [...b.tasks].sort(taskOrder);
    const completed = dayTasks.filter((t) => t.status === 'completed').length;
    const skipped = dayTasks.filter((t) => t.status === 'skipped').length;
    const points = dayTasks.reduce(
      (sum, t) => sum + (t.status === 'completed' ? t.rewardPoints : 0),
      0,
    );
    return {
      key: b.key,
      label: b.label,
      tasks: dayTasks,
      completed,
      skipped,
      points,
    };
  });
}

/** Ordenação dentro de um dia: concluídas antes de canceladas; mais recente primeiro. */
function taskOrder(a: Task, b: Task): number {
  if (a.status === 'completed' && b.status !== 'completed') return -1;
  if (a.status !== 'completed' && b.status === 'completed') return 1;
  return b.updatedAt > a.updatedAt ? 1 : -1;
}

/** Resumo do período para a tela de Missões (a fazer, aguardando, feitas, pontos). */
export interface MissionSummary {
  total: number;
  todo: number; // pending + in_progress
  waiting: number; // pending_review
  done: number; // completed
  /** Pontos ainda disponíveis nas missões a fazer (motivação). */
  potentialPoints: number;
  /** Pontos já ganhos no período (missões concluídas na janela). */
  earnedPoints: number;
}

export function summarizeMissions(inWindow: Task[]): MissionSummary {
  let todo = 0;
  let waiting = 0;
  let done = 0;
  let potential = 0;
  let earned = 0;
  for (const t of inWindow) {
    if (t.status === 'completed') {
      done++;
      earned += t.rewardPoints;
    } else if (t.status === 'pending_review') {
      waiting++;
    } else {
      // pending ou in_progress
      todo++;
      potential += t.rewardPoints;
    }
  }
  return {
    total: inWindow.length,
    todo,
    waiting,
    done,
    potentialPoints: potential,
    earnedPoints: earned,
  };
}

/** Resumo do período (taxa de conclusão, pontos) — opera sobre as tarefas da janela. */
export function summarize(inWindow: Task[]): HistorySummary {
  const completed = inWindow.filter((t) => t.status === 'completed');
  const skipped = inWindow.filter((t) => t.status === 'skipped').length;
  const total = completed.length + skipped;
  return {
    completed: completed.length,
    skipped,
    total,
    completionRate: total === 0 ? 0 : completed.length / total,
    points: completed.reduce((sum, t) => sum + t.rewardPoints, 0),
    streak: 0, // calculado à parte (independente da janela)
  };
}

/**
 * Sequência atual de dias consecutivos com ≥1 missão concluída.
 *
 * Estilo Duolingo: se HOJE ainda não há conclusão, a sequência conta a partir de
 * ONTEM (ainda não "quebrou" — só quebra quando um dia é efetivamente pulado).
 *
 * @param allCompleted Todas as missões concluídas disponíveis (não só da janela).
 */
export function computeStreak(allCompleted: Task[], now: Date = new Date()): number {
  if (allCompleted.length === 0) return 0;
  const days = new Set(allCompleted.map((t) => dayKey(taskDate(t))));

  let streak = 0;
  const cursor = startOfDay(now);
  if (!days.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1); // tolera "hoje" ainda vazio
  }
  while (days.has(dayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Monta a URL de navegação (período + offset) mantendo a granularidade. */
export function periodHref(basePath: string, period: Period, offset: number): string {
  return `${basePath}?periodo=${period}&offset=${offset}`;
}
