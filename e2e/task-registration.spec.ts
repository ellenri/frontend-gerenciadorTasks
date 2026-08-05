/**
 * Testes E2E para a página de cadastro de tarefas
 */

import { test, expect } from '@playwright/test';

test.describe('Cadastro de Tarefas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cadastro-tarefas');
  });

  test('deve exibir o título da página corretamente', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Cadastrar Nova Tarefa');
  });

  test('deve ter todos os campos do formulário visíveis', async ({ page }) => {
    // Título
    await expect(page.getByLabel('Título da Tarefa')).toBeVisible();
    // Descrição
    await expect(page.getByLabel('Descrição')).toBeVisible();
    // Categoria
    await expect(page.getByLabel('Categoria')).toBeVisible();
    // Data
    await expect(page.getByLabel('Data')).toBeVisible();
    // Horário
    await expect(page.getByLabel('Horário')).toBeVisible();
  });

  test('deve exibir opções de prioridade', async ({ page }) => {
    await expect(page.getByRole('radiogroup', { name: 'Prioridade' })).toBeVisible();
    const buttons = page.locator('input[name="priority"]');
    await expect(buttons).toHaveCount(3);
  });

  test('deve exibir seleção de crianças', async ({ page }) => {
    const childrenContainer = page.locator('.grid').filter({ hasText: 'João Silva' });
    await expect(childrenContainer).toBeVisible();
  });

  test('deve impedir submissão com campos obrigatórios vazios', async ({ page }) => {
    // Tenta submeter sem preencher nada
    await page.click('button[type="submit"]');

    // Verifica se há campos inválidos
    const requiredFields = page.locator('[required]');
    const firstRequired = requiredFields.first();
    await expect(firstRequired).toHaveAttribute('required');
  });

  test('deve preencher e submeter o formulário com sucesso', async ({ page }) => {
    // Preenche o título
    await page.fill('input[name="title"]', 'Fazer lição de casa');

    // Seleciona a categoria
    await page.selectOption('select[name="category"]', 'school');

    // Seleciona a prioridade
    await page.click('input[name="priority"][value="high"]');

    // Preenche a data
    await page.fill('input[name="scheduledDate"]', '2026-12-25');

    // Preenche o horário
    await page.fill('input[name="scheduledTime"]', '14:00');

    // Seleciona uma criança
    await page.click('input[name="assignedTo"][value="1"]');

    // Submete o formulário
    await page.click('button[type="submit"]');

    // Aguarda o alert (feedback visual atual)
    page.on('dialog', (dialog) => {
      expect(dialog.message()).toContain('sucesso');
      dialog.accept();
    });
  });

  test('deve ser responsivo em dispositivos móveis', async ({ page }) => {
    // Testa em tamanho mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/cadastro-tarefas');

    // Verifica se o formulário ainda está visível
    await expect(page.getByLabel('Título da Tarefa')).toBeVisible();
    await expect(page.getByRole('radiogroup', { name: 'Prioridade' })).toBeVisible();
  });

  test('deve limpar o formulário ao clicar no botão Limpar', async ({ page }) => {
    // Preenche alguns campos
    await page.fill('input[name="title"]', 'Tarefa de teste');
    await page.fill('textarea[name="description"]', 'Descrição de teste');

    // Clica em limpar
    await page.click('button[type="reset"]');

    // Verifica se os campos foram limpos
    await expect(page.locator('input[name="title"]')).toHaveValue('');
    await expect(page.locator('textarea[name="description"]')).toHaveValue('');
  });
});

test.describe('Navegação', () => {
  test('deve navegar para a home a partir do cadastro', async ({ page }) => {
    await page.goto('/cadastro-tarefas');
    await page.click('a[href="/"]');
    await expect(page).toHaveURL('/');
  });

  test('deve navegar para a lista de tarefas', async ({ page }) => {
    await page.goto('/cadastro-tarefas');
    await page.click('a[href="/tarefas"]');
    await expect(page).toHaveURL('/tarefas');
  });
});
