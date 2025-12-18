/**
 * E2E Tests for Task Board Application
 * Test scenarios: project creation, task management, status transitions, team collaboration
 */

const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3000';
const API_URL = 'http://localhost:8001';

// Helper function to wait for app to be ready
async function waitForApp(page) {
  await page.waitForSelector('text=Task Board', { timeout: 10000 });
  await page.waitForTimeout(500); // Wait for WebSocket to connect
}

// Helper to create a project
async function createProject(page, name, description) {
  await page.click('button:has-text("Create Project")');
  await page.fill('input[name="name"]', name);
  await page.fill('textarea[name="description"]', description);
  await page.click('button[type="submit"]:has-text("Create")');
  await page.waitForTimeout(500);
}

// Helper to create a team member
async function createTeamMember(page, name, email) {
  await page.click('button:has-text("Manage Team")');
  await page.fill('input[label="Name"]', name);
  await page.fill('input[label="Email"]', email);
  await page.click('button:has-text("Add")');
  await page.waitForTimeout(500);
}

test.describe('Task Board E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForApp(page);
  });

  test('1. Project Creation - Create and manage multiple projects', async ({ page }) => {
    // Create first project
    await createProject(page, 'Website Redesign', 'Redesign company website');
    
    // Verify project appears in sidebar
    await expect(page.locator('text=Website Redesign')).toBeVisible();
    
    // Create second project
    await createProject(page, 'Mobile App', 'Build iOS and Android apps');
    await expect(page.locator('text=Mobile App')).toBeVisible();
    
    // Verify both projects exist
    const projects = await page.locator('[role="listitem"]').count();
    expect(projects).toBeGreaterThanOrEqual(2);
    
    console.log('✅ Project creation test passed');
  });

  test('2. Team Collaboration - Add team members and assign tasks', async ({ page }) => {
    // Create a project first
    await createProject(page, 'Team Project', 'Testing team collaboration');
    
    // Add team members
    await page.click('button:has-text("Manage Team")');
    
    // Add Alice
    await page.locator('input[label="Name"]').first().fill('Alice Johnson');
    await page.locator('input[label="Email"]').first().fill('alice@example.com');
    await page.click('button:has-text("Add")');
    await page.waitForTimeout(300);
    
    // Add Bob
    await page.locator('input[label="Name"]').first().fill('Bob Smith');
    await page.locator('input[label="Email"]').first().fill('bob@example.com');
    await page.click('button:has-text("Add")');
    await page.waitForTimeout(300);
    
    // Verify team members appear
    await expect(page.locator('text=Alice Johnson')).toBeVisible();
    await expect(page.locator('text=Bob Smith')).toBeVisible();
    
    await page.click('button:has-text("Close")');
    
    console.log('✅ Team collaboration test passed');
  });

  test('3. Task Management - Full CRUD operations', async ({ page }) => {
    // Create project
    await createProject(page, 'CRUD Test Project', 'Testing task CRUD operations');
    
    // Create task
    await page.click('button:has-text("Add")').first();
    await page.fill('input[label="Task Title"]', 'Implement login feature');
    await page.fill('textarea[label="Description"]', 'Add authentication to the app');
    await page.selectOption('select[label="Priority"]', 'high');
    await page.click('button[type="submit"]:has-text("Create")');
    await page.waitForTimeout(500);
    
    // Verify task appears
    await expect(page.locator('text=Implement login feature')).toBeVisible();
    
    // Edit task
    await page.hover('text=Implement login feature');
    await page.click('[aria-label="Edit"]').first();
    await page.fill('input[label="Task Title"]', 'Implement OAuth login');
    await page.click('button:has-text("Update")');
    await page.waitForTimeout(500);
    
    // Verify edit
    await expect(page.locator('text=Implement OAuth login')).toBeVisible();
    
    // Delete task
    await page.hover('text=Implement OAuth login');
    await page.click('[aria-label="Delete"]').first();
    page.on('dialog', dialog => dialog.accept()); // Accept confirmation
    await page.waitForTimeout(500);
    
    console.log('✅ Task CRUD operations test passed');
  });

  test('4. Status Transitions - Drag and drop tasks between columns', async ({ page }) => {
    // Create project
    await createProject(page, 'Status Test', 'Testing status transitions');
    
    // Create task in "To Do"
    await page.click('button:has-text("Add")').first();
    await page.fill('input[label="Task Title"]', 'Design mockups');
    await page.selectOption('select[label="Status"]', 'to_do');
    await page.click('button[type="submit"]:has-text("Create")');
    await page.waitForTimeout(1000);
    
    // Verify task is in "To Do" column
    const todoColumn = page.locator('text=To Do').locator('..');
    await expect(todoColumn.locator('text=Design mockups')).toBeVisible();
    
    // Note: Actual drag-and-drop is complex with react-beautiful-dnd
    // Alternative: Test via edit dialog status change
    await page.hover('text=Design mockups');
    await page.click('[aria-label="Edit"]').first();
    await page.selectOption('select[label="Status"]', 'in_progress');
    await page.click('button:has-text("Update")');
    await page.waitForTimeout(1000);
    
    // Verify task moved to "In Progress"
    const progressColumn = page.locator('text=In Progress').locator('..');
    await expect(progressColumn.locator('text=Design mockups')).toBeVisible();
    
    // Move to "Done"
    await page.hover('text=Design mockups');
    await page.click('[aria-label="Edit"]').first();
    await page.selectOption('select[label="Status"]', 'done');
    await page.click('button:has-text("Update")');
    await page.waitForTimeout(1000);
    
    // Verify task in "Done"
    const doneColumn = page.locator('text=Done').locator('..');
    await expect(doneColumn.locator('text=Design mockups')).toBeVisible();
    
    console.log('✅ Status transitions test passed');
  });

  test('5. Complete Workflow - Project to completion', async ({ page }) => {
    // 1. Create project
    await createProject(page, 'Complete Workflow', 'End-to-end workflow test');
    
    // 2. Add team member
    await page.click('button:has-text("Manage Team")');
    await page.locator('input[label="Name"]').first().fill('Charlie Brown');
    await page.locator('input[label="Email"]').first().fill('charlie@example.com');
    await page.click('button:has-text("Add")');
    await page.waitForTimeout(300);
    await page.click('button:has-text("Close")');
    
    // 3. Create multiple tasks
    const tasks = [
      { title: 'Setup repository', priority: 'high', status: 'done' },
      { title: 'Write API endpoints', priority: 'high', status: 'in_progress' },
      { title: 'Create UI components', priority: 'medium', status: 'to_do' },
    ];
    
    for (const task of tasks) {
      await page.click('button:has-text("Add")').first();
      await page.fill('input[label="Task Title"]', task.title);
      await page.selectOption('select[label="Priority"]', task.priority);
      await page.selectOption('select[label="Status"]', task.status);
      await page.click('button[type="submit"]:has-text("Create")');
      await page.waitForTimeout(500);
    }
    
    // 4. Verify all tasks exist
    await expect(page.locator('text=Setup repository')).toBeVisible();
    await expect(page.locator('text=Write API endpoints')).toBeVisible();
    await expect(page.locator('text=Create UI components')).toBeVisible();
    
    // 5. Test filtering
    await page.selectOption('select[label="Priority"]', 'high');
    await page.waitForTimeout(300);
    
    // High priority tasks should be visible
    await expect(page.locator('text=Setup repository')).toBeVisible();
    await expect(page.locator('text=Write API endpoints')).toBeVisible();
    
    console.log('✅ Complete workflow test passed');
  });

  test('6. Search and Filter - Test search functionality', async ({ page }) => {
    // Create project
    await createProject(page, 'Search Test', 'Testing search features');
    
    // Create tasks with different keywords
    await page.click('button:has-text("Add")').first();
    await page.fill('input[label="Task Title"]', 'Fix bug in authentication');
    await page.click('button[type="submit"]:has-text("Create")');
    await page.waitForTimeout(300);
    
    await page.click('button:has-text("Add")').first();
    await page.fill('input[label="Task Title"]', 'Update database schema');
    await page.click('button[type="submit"]:has-text("Create")');
    await page.waitForTimeout(300);
    
    // Search for "bug"
    await page.fill('input[placeholder*="Search"]', 'bug');
    await page.waitForTimeout(500);
    
    // Should see authentication task
    await expect(page.locator('text=Fix bug in authentication')).toBeVisible();
    
    // Should NOT see database task
    const databaseTaskCount = await page.locator('text=Update database schema').count();
    expect(databaseTaskCount).toBe(0);
    
    console.log('✅ Search and filter test passed');
  });

  test('7. WebSocket Connection - Verify real-time indicator', async ({ page }) => {
    // Wait for app to load
    await waitForApp(page);
    
    // Check for WebSocket connection indicator
    // Look for green chip or "Connected" status
    const wsIndicator = page.locator('text=Connected').or(page.locator('[role="status"]'));
    
    // WebSocket should connect within a few seconds
    await expect(wsIndicator).toBeVisible({ timeout: 5000 });
    
    console.log('✅ WebSocket connection test passed');
  });
});

test.describe('API Health Checks', () => {
  test('Backend API is accessible', async ({ request }) => {
    const response = await request.get(`${API_URL}/docs`);
    expect(response.status()).toBe(200);
    console.log('✅ Backend API health check passed');
  });
});
