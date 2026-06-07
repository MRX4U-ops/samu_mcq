const fs = require('fs');
const path = require('path');

const indexCssPath = 'c:/samu_mcq/student-web/src/index.css';

// 1. Update index.css
if (fs.existsSync(indexCssPath)) {
  let content = fs.readFileSync(indexCssPath, 'utf8');

  // Replace :root variables block
  const newVariables = `  /* ═══ PREMIUM VIBRANT LIGHT PALETTE ═══ */
  --bg-base:       #f8fafc;
  --bg-card:       #ffffff;
  --bg-card-solid: #ffffff;
  --bg-card-hover: #ffffff;

  /* Indigo scale */
  --indigo-50:  #f0fdf4;
  --indigo-100: #e0e7ff;
  --indigo-200: #c7d2fe;
  --indigo-400: #818cf8;
  --indigo-500: #6366f1;
  --indigo-600: #4f46e5;
  --indigo-700: #312e81;
  --indigo-800: #4338ca;
  --indigo-900: #1e1b4b;
  --indigo-950: #0f172a;

  /* Violet / Purple */
  --violet:  #8b5cf6;
  --violet2: #7c3aed;

  /* Gold / Amber */
  --gold:    #fbbf24;
  --amber:   #f59e0b;
  --amber2:  #d97706;

  /* Emerald */
  --emerald: #10b981;
  --emerald2:#059669;

  /* Rose */
  --rose:    #f43f5e;
  --rose2:   #e11d48;

  /* Borders */
  --border:       rgba(99, 102, 241, 0.08);
  --border-soft:  rgba(99, 102, 241, 0.05);
  --border-gold:  rgba(251, 191, 36, 0.25);
  --border-hover: rgba(99, 102, 241, 0.20);

  /* Text on light */
  --text-primary:   #0f172a;
  --text-secondary: #4f46e5;
  --text-muted:     #64748b;
  --text-body:      #334155;`;

  // Find root variables block and replace
  content = content.replace(/\/\* ═══ PREMIUM DARK OBSIDIAN PALETTE ═══ \*\/[\s\S]*?--text-body:\s*#e0e7ff;/, newVariables);

  // Update body background
  content = content.replace(/background-color:\s*#080710;/g, 'background-color: #f8fafc;');
  content = content.replace(/rgba\(99,102,241,0\.18\)/g, 'rgba(99,102,241,0.06)');
  content = content.replace(/rgba\(139,92,246,0\.14\)/g, 'rgba(139,92,246,0.05)');
  content = content.replace(/rgba\(245,158,11,0\.08\)/g, 'rgba(245,158,11,0.03)');

  fs.writeFileSync(indexCssPath, content, 'utf8');
  console.log('index.css updated successfully.');
} else {
  console.error('index.css not found!');
}

// 2. Scan and replace hardcoded values in module.css files back to light theme variables
const pagesDir = 'c:/samu_mcq/student-web/src/pages';
if (fs.existsSync(pagesDir)) {
  fs.readdirSync(pagesDir).forEach(file => {
    if (file.endsWith('.module.css')) {
      const filePath = path.join(pagesDir, file);
      let css = fs.readFileSync(filePath, 'utf8');

      // Update LandingPage Hero styling specifically
      if (file === 'LandingPage.module.css') {
        // Remove dark background from hero
        css = css.replace(/rgba\(15,14,26,0\.82\)[\s\S]*?rgba\(67,56,202,0\.55\) 100%\),\s*url\('\/medical_bg\.png'\)/g, '#f8fafc');
        css = css.replace(/\.glow1\s*\{([\s\S]*?)rgba\(99,102,241,0\.25\)/g, '.glow1 {$1rgba(99,102,241,0.08)');
        css = css.replace(/\.glow2\s*\{([\s\S]*?)rgba\(139,92,246,0\.20\)/g, '.glow2 {$1rgba(139,92,246,0.06)');
        css = css.replace(/\.glow3\s*\{([\s\S]*?)rgba\(245,158,11,0\.12\)/g, '.glow3 {$1rgba(245,158,11,0.04)');
        
        // Remove white colors for text in hero
        css = css.replace(/\.heroTitle\s*\{([\s\S]*?)color:\s*#fff/g, '.heroTitle {$1color: var(--text-primary)');
        css = css.replace(/\.heroSub\s*\{([\s\S]*?)rgba\(255,255,255,0\.80\)/g, '.heroSub {$1var(--text-body)');
        css = css.replace(/\.heroCheck\s*\{([\s\S]*?)rgba\(255,255,255,0\.75\)/g, '.heroCheck {$1var(--text-body)');

        // Update demoCard values
        css = css.replace(/\.demoCard\s*\{([\s\S]*?)rgba\(255,\s*255,\s*255,\s*0\.07\)/g, '.demoCard {$1#ffffff');
        css = css.replace(/\.demoCard\s*\{([\s\S]*?)rgba\(255,\s*255,\s*255,\s*0\.12\)/g, '.demoCard {$1rgba(99, 102, 241, 0.12)');
        css = css.replace(/\.demoCard\s*\{([\s\S]*?)color:\s*#fff/g, '.demoCard {$1color: var(--text-body)');
        css = css.replace(/\.demoCard\s*\{([\s\S]*?)box-shadow:[\s\S]*?rgba\(99,\s*102,\s*241,\s*0\.15\);/g, '.demoCard {$1box-shadow: 0 20px 40px rgba(99, 102, 241, 0.06), 0 1px 3px rgba(0, 0, 0, 0.05);');
        css = css.replace(/\.demoCard:hover\s*\{([\s\S]*?)rgba\(255,\s*255,\s*255,\s*0\.22\)/g, '.demoCard:hover {$1rgba(99, 102, 241, 0.22)');
        css = css.replace(/\.demoCard:hover\s*\{([\s\S]*?)rgba\(99,\s*102,\s*241,\s*0\.25\)/g, '.demoCard:hover {$1rgba(99, 102, 241, 0.15)');

        // Options
        css = css.replace(/\.demoOption\s*\{([\s\S]*?)rgba\(255,\s*255,\s*255,\s*0\.04\)/g, '.demoOption {$1rgba(99, 102, 241, 0.03)');
        css = css.replace(/\.demoOption\s*\{([\s\S]*?)rgba\(255,\s*255,\s*255,\s*0\.08\)/g, '.demoOption {$1rgba(99, 102, 241, 0.08)');
        css = css.replace(/\.demoOption\s*\{([\s\S]*?)color:\s*rgba\(255,\s*255,\s*255,\s*0\.85\)/g, '.demoOption {$1color: var(--text-body)');
        css = css.replace(/\.demoOption:hover:not\(:disabled\)\s*\{([\s\S]*?)rgba\(255,\s*255,\s*255,\s*0\.10\)/g, '.demoOption:hover:not(:disabled) {$1rgba(99, 102, 241, 0.07)');

        // Correct / Incorrect Option states
        css = css.replace(/rgba\(16,\s*185,\s*129,\s*0\.15\)/g, 'rgba(16, 185, 129, 0.10)');
        css = css.replace(/rgba\(239,\s*68,\s*68,\s*0\.15\)/g, 'rgba(239, 68, 68, 0.08)');
        css = css.replace(/#34d399/g, '#047857');
        css = css.replace(/#f87171/g, '#b91c1c');
      }

      // Sync dark variables back to clean light variables in general pages
      css = css.replace(/rgba\(20,\s*18,\s*33,\s*0\.65\)/g, 'var(--bg-card)');
      css = css.replace(/#121021/g, 'var(--bg-card-solid)');
      css = css.replace(/rgba\(28,\s*25,\s*48,\s*0\.82\)/g, 'var(--bg-card-hover)');

      // Update chatbot widget to adapt to light theme
      if (file === 'HomePage.module.css') {
        css = css.replace(/\.chatPanel\s*\{([\s\S]*?)rgba\(255,\s*255,\s*255,\s*0\.88\)/g, '.chatPanel {$1#ffffff');
        css = css.replace(/\.chatMsgAI\s*\{([\s\S]*?)#f3f4f6/g, '.chatMsgAI {$1#f1f5f9');
        css = css.replace(/\.chatTyping\s*\{([\s\S]*?)#f3f4f6/g, '.chatTyping {$1#f1f5f9');
        css = css.replace(/\.chatInputArea\s*\{([\s\S]*?)rgba\(255,\s*255,\s*255,\s*0\.95\)/g, '.chatInputArea {$1#ffffff');
        css = css.replace(/\.chatPrompts\s*\{([\s\S]*?)rgba\(255,\s*255,\s*255,\s*0\.95\)/g, '.chatPrompts {$1#ffffff');
      }

      fs.writeFileSync(filePath, css, 'utf8');
      console.log(`Updated light module: ${file}`);
    }
  });
}

// 3. Scan components folder
const compDir = 'c:/samu_mcq/student-web/src/components';
if (fs.existsSync(compDir)) {
  fs.readdirSync(compDir).forEach(file => {
    if (file.endsWith('.module.css')) {
      const filePath = path.join(compDir, file);
      let css = fs.readFileSync(filePath, 'utf8');

      css = css.replace(/rgba\(20,\s*18,\s*33,\s*0\.65\)/g, 'var(--bg-card)');
      css = css.replace(/#121021/g, 'var(--bg-card-solid)');
      css = css.replace(/rgba\(28,\s*25,\s*48,\s*0\.82\)/g, 'var(--bg-card-hover)');

      fs.writeFileSync(filePath, css, 'utf8');
    }
  });
}

console.log('All light theme upgrades completed successfully.');
