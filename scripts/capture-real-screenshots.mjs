import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, 'out');
const assetsDir = path.join(rootDir, 'assets');

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// 1. Servidor HTTP local servindo out com suporte a MIME types e basePath
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath.startsWith('/rogue-term')) {
    reqPath = reqPath.slice('/rogue-term'.length);
  }
  if (!reqPath || reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  let filePath = path.join(outDir, reqPath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!fs.existsSync(filePath)) {
    filePath = path.join(outDir, 'index.html');
  }

  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

const PORT = 3599;
await new Promise((resolve) => server.listen(PORT, '127.0.0.1', resolve));
console.log(`Servidor local ativo em http://127.0.0.1:${PORT}/rogue-term/`);

// 2. Iniciar Puppeteer com Chrome
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browser = await puppeteer.launch({
  executablePath: chromePath,
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
});

const page = await browser.newPage();
// Viewport otimizado para layout mobile-first impecável (estilo Zenny)
await page.setViewport({ width: 440, height: 880, deviceScaleFactor: 2 });

await page.goto(`http://127.0.0.1:${PORT}/rogue-term/`, { waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 1000));

// CAPTURA 1: Terminal Principal (Gameplay Real com palpites digitados e feedback de cores)
console.log('Capturando Tela 1: Gameplay Real...');
await page.evaluate(() => {
  const store = window.useGameStore.getState();
  store.closeTutorial();
  store.setHasSeenTutorial(true);
  store.closeDailyModal();
  store.startNewRun('TERMO');

  const words = ['PORTA', 'CLUBE'];
  for (const w of words) {
    for (const char of w) store.addLetter(char);
    store.submitGuess();
  }

  for (const char of 'TERM') {
    store.addLetter(char);
  }

  window.useGameStore.setState({
    coins: 22,
    score: 1850,
    streak: 3,
    sector: 2,
    stage: 1
  });
});

await new Promise((r) => setTimeout(r, 1200));
const fileScreen1 = path.join(assetsDir, 'real_screen_gameplay.png');
await page.screenshot({ path: fileScreen1 });
console.log(`Captura 1 salva: ${fileScreen1}`);

// CAPTURA 2: Mercado Clandestino (Shop Real com itens e upgrades)
console.log('Capturando Tela 2: Loja Real...');
await page.evaluate(() => {
  const store = window.useGameStore.getState();
  window.useGameStore.setState({
    gamePhase: 'shop',
    coins: 34,
    score: 2900,
    sector: 2,
    stage: 2,
    round: 4,
    lastRoundEarnings: {
      base: 4,
      keysBonus: 3,
      streakBonus: 2,
      speedBonus: 1,
      total: 10
    }
  });
  store.rerollShop();
});

await new Promise((r) => setTimeout(r, 1200));
const fileScreen2 = path.join(assetsDir, 'real_screen_shop.png');
await page.screenshot({ path: fileScreen2 });
console.log(`Captura 2 salva: ${fileScreen2}`);

// CAPTURA 3: Modal de Desafio Diário & Sementes
console.log('Capturando Tela 3: Desafio Diário Real...');
await page.evaluate(() => {
  const store = window.useGameStore.getState();
  window.useGameStore.setState({
    gamePhase: 'playing',
    careerStats: {
      runsCompleted: 42,
      runsWon: 29,
      bestStreak: 15,
      totalScore: 78500,
      totalCoinsEarned: 1240,
      dailyRunsCompleted: 21,
      dailyBestStreak: 11,
      dailyCurrentStreak: 7,
      history: []
    }
  });
  store.openDailyModal();
});

await new Promise((r) => setTimeout(r, 1200));
const fileScreen3 = path.join(assetsDir, 'real_screen_daily.png');
await page.screenshot({ path: fileScreen3 });
console.log(`Captura 3 salva: ${fileScreen3}`);

// 3. Montar o Banner Panorâmico Final (1920x1080)
console.log('Compondo o banner final de demonstração com as capturas reais no estilo Zenny...');
const b64Screen1 = fs.readFileSync(fileScreen1).toString('base64');
const b64Screen2 = fs.readFileSync(fileScreen2).toString('base64');
const b64Screen3 = fs.readFileSync(fileScreen3).toString('base64');

const previewHtmlPath = path.join(rootDir, 'preview_builder.html');
const previewHtmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1920px;
      height: 1080px;
      background: #05070a;
      background-image: 
        radial-gradient(ellipse at 50% 0%, rgba(16, 185, 129, 0.16) 0%, transparent 65%),
        radial-gradient(ellipse at 85% 100%, rgba(245, 158, 11, 0.1) 0%, transparent 55%),
        linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
      background-size: 100% 100%, 100% 100%, 40px 40px, 40px 40px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      overflow: hidden;
      color: #e2e8f0;
    }
    
    .header-bar {
      margin-bottom: 26px;
      text-align: center;
    }
    .header-title {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: 4px;
      text-transform: uppercase;
      color: #10b981;
      text-shadow: 0 0 25px rgba(16, 185, 129, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }
    .header-subtitle {
      font-size: 15px;
      color: #94a3b8;
      letter-spacing: 2px;
      margin-top: 6px;
      text-transform: uppercase;
      font-weight: 600;
    }

    .screens-container {
      display: flex;
      gap: 40px;
      align-items: center;
      justify-content: center;
      width: 1780px;
    }

    .screen-card {
      width: 480px;
      height: 840px;
      background: #070a0f;
      border: 1px solid rgba(16, 185, 129, 0.4);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 25px 50px -10px rgba(0, 0, 0, 0.95), 0 0 30px rgba(16, 185, 129, 0.18);
      display: flex;
      flex-direction: column;
    }

    .card-topbar {
      background: #0e1522;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding: 12px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }
    .card-dots {
      display: flex;
      gap: 6px;
    }
    .dot {
      width: 11px;
      height: 11px;
      border-radius: 50%;
    }
    .dot-red { background: #ef4444; }
    .dot-yellow { background: #eab308; }
    .dot-green { background: #22c55e; }

    .card-label {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 2px;
      color: #38bdf8;
      text-transform: uppercase;
    }

    .screen-img-wrapper {
      flex: 1;
      width: 100%;
      background: #020406;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .screen-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top center;
      display: block;
    }

    .card-caption {
      padding: 14px 20px;
      background: #0a0f1a;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      font-size: 13px;
      color: #cbd5e1;
      text-align: center;
      font-weight: 500;
      letter-spacing: 0.5px;
      flex-shrink: 0;
    }
  </style>
</head>
<body>
  <div class="header-bar">
    <div class="header-title">
      ROGUE TERM // CAPTURAS DO SISTEMA
    </div>
    <div class="header-subtitle">Wordle Tático + Deckbuilding Roguelike com Estética Retrô CRT</div>
  </div>

  <div class="screens-container">
    <!-- Card 1 -->
    <div class="screen-card">
      <div class="card-topbar">
        <div class="card-dots">
          <div class="dot dot-red"></div>
          <div class="dot dot-yellow"></div>
          <div class="dot dot-green"></div>
        </div>
        <div class="card-label">Terminal Principal // Gameplay</div>
        <div style="width: 38px;"></div>
      </div>
      <div class="screen-img-wrapper">
        <img class="screen-img" src="data:image/png;base64,${b64Screen1}" />
      </div>
      <div class="card-caption">Adivinhação de palavras, status de teclas e cartuchos ativos</div>
    </div>

    <!-- Card 2 -->
    <div class="screen-card">
      <div class="card-topbar">
        <div class="card-dots">
          <div class="dot dot-red"></div>
          <div class="dot dot-yellow"></div>
          <div class="dot dot-green"></div>
        </div>
        <div class="card-label">Mercado Clandestino // Loja</div>
        <div style="width: 38px;"></div>
      </div>
      <div class="screen-img-wrapper">
        <img class="screen-img" src="data:image/png;base64,${b64Screen2}" />
      </div>
      <div class="card-caption">Compra de cartuchos passivos, hacks ativos e itens de reparo</div>
    </div>

    <!-- Card 3 -->
    <div class="screen-card">
      <div class="card-topbar">
        <div class="card-dots">
          <div class="dot dot-red"></div>
          <div class="dot dot-yellow"></div>
          <div class="dot dot-green"></div>
        </div>
        <div class="card-label">Desafio Diário & Sementes</div>
        <div style="width: 38px;"></div>
      </div>
      <div class="screen-img-wrapper">
        <img class="screen-img" src="data:image/png;base64,${b64Screen3}" />
      </div>
      <div class="card-caption">Palavra global do dia, sementes customizadas e carreira livre</div>
    </div>
  </div>
</body>
</html>`;

fs.writeFileSync(previewHtmlPath, previewHtmlContent, 'utf-8');

await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
const previewUrl = 'file:///' + previewHtmlPath.replace(/\\/g, '/');
await page.goto(previewUrl, { waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 1000));

const bannerOutputPath = path.join(assetsDir, 'preview.png');
await page.screenshot({ path: bannerOutputPath });
console.log(`Banner final com prints reais gerado com sucesso: ${bannerOutputPath}`);

await browser.close();
server.close();
process.exit(0);
