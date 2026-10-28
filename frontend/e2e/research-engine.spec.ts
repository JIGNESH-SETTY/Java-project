import { test, expect } from '@playwright/test';

test.describe('AI Research Discovery and Evidence Engine E2E Flows', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
  });

  test('User can log in successfully with seeded credentials', async ({ page }) => {
    // Fill credentials
    await page.fill('input[type="email"]', 'admin@airesearch.edu');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=AI Research Discovery')).toBeVisible();
    await expect(page.locator('text=Evidence Provenance')).toBeVisible();
  });

  test('User can browse paper library and inspect paper chunks and claims', async ({ page }) => {
    await page.fill('input[type="email"]', 'admin@airesearch.edu');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Go to Library
    await page.click('a[href="/library"]');
    await expect(page).toHaveURL('/library');

    // Verify seeded papers appear
    await expect(page.locator('text=Attention Is All You Need').first()).toBeVisible();

    // Click on paper to view detail
    await page.click('text=Attention Is All You Need');
    await expect(page.locator('text=Bibliographic Metadata')).toBeVisible();
    await expect(page.locator('text=Extracted Claims')).toBeVisible();
    await expect(page.locator('text=Document Chunks')).toBeVisible();
  });

  test('User can perform hybrid search and inspect source chunk snippets', async ({ page }) => {
    await page.fill('input[type="email"]', 'admin@airesearch.edu');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Go to Search
    await page.click('a[href="/search"]');
    await expect(page).toHaveURL('/search');

    // Fill query
    await page.fill('input[placeholder*="Ask a research question"]', 'transformer self-attention mechanism');
    await page.click('button:has-text("Execute Search")');

    // Should display hybrid search ranking results
    await expect(page.locator('text=Score').first()).toBeVisible();
  });

  test('User can compare two papers in the comparison matrix', async ({ page }) => {
    await page.fill('input[type="email"]', 'admin@airesearch.edu');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Go to Compare
    await page.click('a[href="/compare"]');
    await expect(page).toHaveURL('/compare');

    // Select papers to compare
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    if (count >= 2) {
      await checkboxes.nth(0).check();
      await checkboxes.nth(1).check();
      await page.click('button:has-text("Compare Selected Papers")');

      // Check comparison matrix elements
      await expect(page.locator('text=Research Problem')).toBeVisible();
      await expect(page.locator('text=Methodology')).toBeVisible();
      await expect(page.locator('text=Key Findings / Results')).toBeVisible();
    }
  });

  test('User can explore claims and distinct provenance badges', async ({ page }) => {
    await page.fill('input[type="email"]', 'admin@airesearch.edu');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Go to Claims
    await page.click('a[href="/claims"]');
    await expect(page).toHaveURL('/claims');

    // Verify provenance indicators
    await expect(page.locator('text=Reported in Paper').first()).toBeVisible();
    await expect(page.locator('text=AI Interpretation').first()).toBeVisible();
  });

  test('User can generate literature review with evidence-backed paragraph mappings', async ({ page }) => {
    await page.fill('input[type="email"]', 'admin@airesearch.edu');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Go to Reviews
    await page.click('a[href="/reviews"]');
    await expect(page).toHaveURL('/reviews');

    // Fill review topic
    await page.fill('input[placeholder*="e.g. Effectiveness of dense retrieval"]', 'Transformer Architectures and Attention Efficiency');
    await page.click('button:has-text("Generate Literature Review")');

    // Should display generated review and evidence panel
    await expect(page.locator('text=Review Evidence Panel')).toBeVisible();
    await expect(page.locator('button:has-text("Export Markdown")')).toBeVisible();
    await expect(page.locator('button:has-text("Export BibTeX")')).toBeVisible();
  });

});
