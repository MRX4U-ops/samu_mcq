const fs = require('fs');
const path = require('path');

const indexCssPath = 'c:/samu_mcq/student-web/src/index.css';

// 1. Update index.css
if (fs.existsSync(indexCssPath)) {
  let content = fs.readFileSync(indexCssPath, 'utf8');

  // Replace :root variables block
  const newVariables = `  /* ═══ PREMIUM DARK OBSIDIAN PALETTE ═══ */
  --bg-base:       #080710;
  --bg-card:       rgba(20, 18, 33, 0.65);
  --bg-card-solid: #121021;
  --bg-card-hover: rgba(28, 25, 48, 0.82);

  /* Indigo scale */
  --indigo-50:  #1e1b4b;
  --indigo-100: #312e81;
  --indigo-200: #4338ca;
  --indigo-400: #818cf8;
  --indigo-500: #6366f1;
  --indigo-600: #4f46e5;
  --indigo-700: #c7d2fe;
  --indigo-800: #e0e7ff;
  --indigo-900: #eef2ff;
  --indigo-950: #ffffff;

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
  --border:       rgba(255, 255, 255, 0.08);
  --border-soft:  rgba(99, 102, 241, 0.18);
  --border-gold:  rgba(251, 191, 36, 0.45);
  --border-hover: rgba(99, 102, 241, 0.50);

  /* Text on dark */
  --text-primary:   #ffffff;
  --text-secondary: #c7d2fe;
  --text-muted:     #9ca3af;
  --text-body:      #e0e7ff;`;

  // Find root variables block and replace
  content = content.replace(/\/\* ═══ PREMIUM ROYAL PALETTE ═══ \*\/[\s\S]*?--text-body:\s*#374151;/, newVariables);

  // Update body background
  content = content.replace(/body\s*\{\s*background-color:\s*#faf9f6;/, 'body {\n  background-color: #080710;');

  fs.writeFileSync(indexCssPath, content, 'utf8');
  console.log('index.css updated successfully.');
} else {
  console.error('index.css not found!');
}

// 2. Scan and replace hardcoded values in module.css files
const pagesDir = 'c:/samu_mcq/student-web/src/pages';
if (fs.existsSync(pagesDir)) {
  fs.readdirSync(pagesDir).forEach(file => {
    if (file.endsWith('.module.css')) {
      const filePath = path.join(pagesDir, file);
      console.log(`Processing module: ${filePath}`);
      let css = fs.readFileSync(filePath, 'utf8');

      // Replace common card backgrounds
      css = css.replace(/rgba\(255,\s*255,\s*255,\s*0\.70\)/g, 'var(--bg-card)');
      css = css.replace(/rgba\(255,\s*255,\s*255,\s*0\.75\)/g, 'var(--bg-card)');
      css = css.replace(/rgba\(255,\s*255,\s*255,\s*0\.80\)/g, 'var(--bg-card-hover)');
      css = css.replace(/rgba\(255,\s*255,\s*255,\s*0\.85\)/g, 'var(--bg-card-hover)');
      css = css.replace(/rgba\(255,\s*255,\s*255,\s*0\.90\)/g, 'var(--bg-card-hover)');
      css = css.replace(/rgba\(255,\s*255,\s*255,\s*0\.95\)/g, 'var(--bg-card-solid)');
      css = css.replace(/#ffffff/g, 'var(--bg-card-solid)');
      css = css.replace(/#fff\b/g, 'var(--bg-card-solid)');

      // Replace borders
      css = css.replace(/rgba\(255,\s*255,\s*255,\s*0\.90\)/g, 'var(--border)');
      css = css.replace(/rgba\(255,\s*255,\s*255,\s*0\.95\)/g, 'var(--border)');
      css = css.replace(/rgba\(99,\s*102,\s*241,\s*0\.12\)/g, 'var(--border-soft)');

      // Replace text colors
      css = css.replace(/#1e1b4b/g, 'var(--text-primary)');
      css = css.replace(/#374151/g, 'var(--text-body)');
      css = css.replace(/#4b5563/g, 'var(--text-body)');
      css = css.replace(/#6b7280/g, 'var(--text-muted)');
      css = css.replace(/#9ca3af/g, 'var(--text-muted)');

      fs.writeFileSync(filePath, css, 'utf8');
      console.log(`Updated module: ${file}`);
    }
  });
}

// 3. Scan components folder
const compDir = 'c:/samu_mcq/student-web/src/components';
if (fs.existsSync(compDir)) {
  fs.readdirSync(compDir).forEach(file => {
    if (file.endsWith('.module.css')) {
      const filePath = path.join(compDir, file);
      console.log(`Processing component module: ${filePath}`);
      let css = fs.readFileSync(filePath, 'utf8');

      css = css.replace(/rgba\(255,\s*255,\s*255,\s*0\.70\)/g, 'var(--bg-card)');
      css = css.replace(/rgba\(255,\s*255,\s*255,\s*0\.80\)/g, 'var(--bg-card-hover)');
      css = css.replace(/#ffffff/g, 'var(--bg-card-solid)');
      css = css.replace(/#fff\b/g, 'var(--bg-card-solid)');
      css = css.replace(/#1e1b4b/g, 'var(--text-primary)');
      css = css.replace(/#374151/g, 'var(--text-body)');
      css = css.replace(/#4b5563/g, 'var(--text-body)');

      fs.writeFileSync(filePath, css, 'utf8');
    }
  });
}

console.log('All styling upgrades completed successfully.');
