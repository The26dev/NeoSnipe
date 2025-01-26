import { toMatchImageSnapshot } from 'jest-image-snapshot';
import puppeteer from 'puppeteer';
import { startTestServer, stopTestServer } from '../utils/test-server';

expect.extend({ toMatchImageSnapshot });

describe('Sacred Geometry Visual Regression Tests', () => {
  let browser;
  let page;
  let server;

  beforeAll(async () => {
    server = await startTestServer();
    browser = await puppeteer.launch();
  });

  afterAll(async () => {
    await browser.close();
    await stopTestServer(server);
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
  });

  afterEach(async () => {
    await page.close();
  });

  test('flower of life pattern renders correctly', async () => {
    await page.goto('http://localhost:3000/sacred-geometry/flower-of-life');
    await page.waitForSelector('[data-testid="pattern-canvas"]');
    
    // Wait for animations to complete
    await page.waitForTimeout(1000);
    
    const image = await page.screenshot();
    expect(image).toMatchImageSnapshot({
      customSnapshotsDir: '__image_snapshots__/sacred-geometry',
      failureThreshold: 0.01,
      failureThresholdType: 'percent'
    });
  });

  test('metatrons cube pattern renders correctly', async () => {
    await page.goto('http://localhost:3000/sacred-geometry/metatrons-cube');
    await page.waitForSelector('[data-testid="pattern-canvas"]');
    
    await page.waitForTimeout(1000);
    
    const image = await page.screenshot();
    expect(image).toMatchImageSnapshot({
      customSnapshotsDir: '__image_snapshots__/sacred-geometry',
      failureThreshold: 0.01,
      failureThresholdType: 'percent'
    });
  });

  test('pattern animation transitions smoothly', async () => {
    await page.goto('http://localhost:3000/sacred-geometry/pattern-transitions');
    await page.waitForSelector('[data-testid="pattern-canvas"]');
    
    const frames = [];
    for (let i = 0; i < 5; i++) {
      await page.waitForTimeout(200);
      frames.push(await page.screenshot());
    }
    
    frames.forEach((frame, index) => {
      expect(frame).toMatchImageSnapshot({
        customSnapshotsDir: '__image_snapshots__/sacred-geometry/transitions',
        customSnapshotIdentifier: `transition-frame-${index}`,
        failureThreshold: 0.01,
        failureThresholdType: 'percent'
      });
    });
  });

  test('pattern controls affect rendering', async () => {
    await page.goto('http://localhost:3000/sacred-geometry/pattern-controls');
    await page.waitForSelector('[data-testid="pattern-canvas"]');
    
    // Capture initial state
    const initialImage = await page.screenshot();
    
    // Adjust scale
    await page.click('[data-testid="scale-slider"]');
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);
    const scaledImage = await page.screenshot();
    
    // Adjust rotation
    await page.click('[data-testid="rotation-slider"]');
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);
    const rotatedImage = await page.screenshot();
    
    expect(initialImage).toMatchImageSnapshot({
      customSnapshotsDir: '__image_snapshots__/sacred-geometry/controls',
      customSnapshotIdentifier: 'initial'
    });
    
    expect(scaledImage).toMatchImageSnapshot({
      customSnapshotsDir: '__image_snapshots__/sacred-geometry/controls',
      customSnapshotIdentifier: 'scaled'
    });
    
    expect(rotatedImage).toMatchImageSnapshot({
      customSnapshotsDir: '__image_snapshots__/sacred-geometry/controls',
      customSnapshotIdentifier: 'rotated'
    });
  });
});