/**
 * Tipos de dados para o sistema de gerenciamento de tarefas
 */

/**
 * Representa uma criança/pessoa que receberá tarefas
 */
export interface Child {
  id: string;
  name: string;
  avatar?: string;
  birthDate?: string;
  points: number;   // pontuação acumulada (gamificação)
  createdAt: Date;
  parentUserId?: string; // responsável (User Parent)
  userId?: string;       // login da criança (User Child)
  email?: string;        // e-mail de acesso (só preenchido na edição)
}

/**
 * Níveis de prioridade para as tarefas
 */
export type TaskPriority = 'low' | 'medium' | 'high';

/**
 * Status possível de uma tarefa
 */
export type TaskStatus =
  | 'pending'
  | 'in_progress'
  | 'pending_review' // criança enviou comprovação; aguarda aprovação do responsável
  | 'completed'
  | 'skipped';

/**
 * Categorias de tarefas
 */
export type TaskCategory =
  | 'school'
  | 'chores'
  | 'personal_care'
  | 'extracurricular'
  | 'other';

/**
 * Representa uma tarefa a ser realizada
 */
export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  assignedTo: string; // Child ID
  estimatedDuration?: number; // em minutos
  createdBy: string; // Parent ID
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  notificationSent?: boolean;
  rewardPoints: number;   // pontos concedidos ao concluir
  submissionImageUrl?: string | null;  // foto de comprovação enviada pela criança
  reviewerComment?: string | null;     // feedback do responsável ao rejeitar
  submittedAt?: Date | null;           // quando a criança enviou a comprovação
  recurrenceGroupId?: string | null;   // agrupa ocorrências de uma missão recorrente
}

/**
 * Tipos de repetição de uma missão
 */
export type RecurrenceType = 'once' | 'weekly' | 'twice_weekly';

/**
 * Dados do formulário para criar/editar tarefa
 */
export interface TaskFormData {
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  scheduledDate: string;
  scheduledTime: string;
  assignedTo: string;
  estimatedDuration: string;
  recurrenceType: RecurrenceType;
  recurrenceDays: number[]; // DayOfWeek 0=Dom ... 6=Sáb
}

/**
 * Opções para o campo de categoria
 */
export const CATEGORY_OPTIONS: { value: TaskCategory; label: string }[] = [
  { value: 'school', label: 'Escola' },
  { value: 'chores', label: 'Tarefas de Casa' },
  { value: 'personal_care', label: 'Cuidados Pessoais' },
  { value: 'extracurricular', label: 'Extra-curricular' },
  { value: 'other', label: 'Outro' },
];

/** Opções de repetição. */
export const RECURRENCE_OPTIONS: { value: RecurrenceType; label: string }[] = [
  { value: 'once', label: 'Uma vez' },
  { value: 'weekly', label: 'Toda semana' },
  { value: 'twice_weekly', label: '2x na semana' },
];

/** Dias da semana (DayOfWeek). value bate com o int do backend (0=Dom). */
export const WEEKDAY_OPTIONS: { value: number; label: string }[] = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' },
];

/**
 * Opções para o campo de prioridade
 */
export const PRIORITY_OPTIONS: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Baixa', color: 'bg-secondary' },
  { value: 'medium', label: 'Média', color: 'bg-highlight' },
  { value: 'high', label: 'Alta', color: 'bg-action' },
];

/**
 * Payload para cadastrar uma nova criança.
 * Inclui as credenciais de acesso (e-mail + senha) que a criança usará no login.
 */
export interface CreateChildRequest {
  name: string;
  birthDate: string; // "YYYY-MM-DD"
  avatar?: string;    // caminho do avatar, ex.: "/avatars/boy1.png"
  email: string;      // login da criança (único)
  password: string;   // senha da criança (mín. 6)
}

/**
 * Payload para editar uma criança existente.
 * A senha é opcional: vazia/nula = manter a atual.
 */
export interface UpdateChildRequest {
  name: string;
  birthDate: string; // "YYYY-MM-DD"
  avatar?: string;
  email: string;      // novo e-mail de acesso (único)
  password?: string;  // nova senha (mín. 6); vazio = manter a atual
}

/**
 * Avatares disponíveis para escolha no cadastro (arquivos em /public/avatars).
 */
export const AVATAR_OPTIONS: string[] = [
  '/avatars/boy1.png',
  '/avatars/boy-colorhair.png',
  '/avatars/boy_blackskin.png',
  '/avatars/boy_cap.png',
  '/avatars/girl_blondehair.png',
  '/avatars/girl_colorhair.png',
  '/avatars/girl_blackskin.png',
  '/avatars/girl_glasses.png',
];

/** Usuário autenticado (responsável). */
export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

/** Payload de login. */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Payload de cadastro de responsável. */
export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

/** Recompensa resgatável com pontos. */
export interface Reward {
  id: string;
  title: string;
  description: string;
  requiredPoints: number;
  createdById: string;
  redeemedById?: string | null;
  redeemedAt?: string | null;
  createdAt: string;
}

/** Payload para criar uma recompensa. */
export interface CreateRewardRequest {
  title: string;
  description: string;
  requiredPoints: number;
}

/** Notificação do usuário (aviso de missão/recompensa). */
export interface NotificationItem {
  id: string;
  message: string;
  type: string;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}
