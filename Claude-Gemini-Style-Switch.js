// ==UserScript==
// @name         Gemini 仿 Claude 风格字体转换插件 1.6.2
// @namespace    https://github.com/XXX/
// @version      1.6.2
// @description  为 Gemini 网页添加 Claude 风格字体与主题变量，支持一键开关与欢迎词主题色（修复刷新后按钮缺失 & 更大更粗字体）
// @author       Claude Assistant
// @match        https://gemini.google.com/*
// @match        https://*.gemini.google.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @run-at       document-start
// @license      MIT
// @updateURL
// @downloadURL
// ==/UserScript==

(function () {
  'use strict';

  // ========= Claude 主题变量（含字号/字重控制） =========
  const THEME_CSS = `
:root {
  --background: oklch(0.9818 0.0054 95.0986);
  --foreground: oklch(0.3438 0.0269 95.7226);
  --card: oklch(0.9818 0.0054 95.0986);
  --card-foreground: oklch(0.1908 0.0020 106.5859);
  --popover: oklch(1.0000 0 0);
  --popover-foreground: oklch(0.2671 0.0196 98.9390);
  --primary: oklch(0.6171 0.1375 39.0427);
  --primary-foreground: oklch(1.0000 0 0);
  --secondary: oklch(0.9245 0.0138 92.9892);
  --secondary-foreground: oklch(0.4334 0.0177 98.6048);
  --muted: oklch(0.9341 0.0153 90.2390);
  --muted-foreground: oklch(0.6059 0.0075 97.4233);
  --accent: oklch(0.9245 0.0138 92.9892);
  --accent-foreground: oklch(0.2671 0.0196 98.9390);
  --destructive: oklch(0.1908 0.0020 106.5859);
  --destructive-foreground: oklch(1.0000 0 0);
  --border: oklch(0.8847 0.0069 97.3627);
  --input: oklch(0.7621 0.0156 98.3528);
  --ring: oklch(0.6171 0.1375 39.0427);
  --chart-1: oklch(0.5583 0.1276 42.9956);
  --chart-2: oklch(0.6898 0.1581 290.4107);
  --chart-3: oklch(0.8816 0.0276 93.1280);
  --chart-4: oklch(0.8822 0.0403 298.1792);
  --chart-5: oklch(0.5608 0.1348 42.0584);
  --sidebar: oklch(0.9663 0.0080 98.8792);
  --sidebar-foreground: oklch(0.3590 0.0051 106.6524);
  --sidebar-primary: oklch(0.6171 0.1375 39.0427);
  --sidebar-primary-foreground: oklch(0.9881 0 0);
  --sidebar-accent: oklch(0.9245 0.0138 92.9892);
  --sidebar-accent-foreground: oklch(0.3250 0 0);
  --sidebar-border: oklch(0.9401 0 0);
  --sidebar-ring: oklch(0.7731 0 0);
  --font-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  --font-serif: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  --radius: 0.5rem;
  --shadow-2xs: 0 1px 3px 0px hsl(0 0% 0% / 0.05);
  --shadow-xs: 0 1px 3px 0px hsl(0 0% 0% / 0.05);
  --shadow-sm: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10);
  --shadow: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10);
  --shadow-md: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 2px 4px -1px hsl(0 0% 0% / 0.10);
  --shadow-lg: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 4px 6px -1px hsl(0 0% 0% / 0.10);
  --shadow-xl: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 8px 10px -1px hsl(0 0% 0% / 0.10);
  --shadow-2xl: 0 1px 3px 0px hsl(0 0% 0% / 0.25);
  --tracking-normal: 0em;
  --spacing: 0.25rem;

  /* —— 新增：字号与字重控制 —— */
  --font-size-base: 16.5px;   /* 调到 17px 会更大一点 */
  --font-weight-text: 500;    /* 400 常规，500 微加粗 */
  --font-weight-strong: 600;  /* strong/b 字重 */
}
.dark {
  --background: oklch(0.2679 0.0036 106.6427);
  --foreground: oklch(0.8074 0.0142 93.0137);
  --card: oklch(0.2679 0.0036 106.6427);
  --card-foreground: oklch(0.9818 0.0054 95.0986);
  --popover: oklch(0.3085 0.0035 106.6039);
  --popover-foreground: oklch(0.9211 0.0040 106.4781);
  --primary: oklch(0.6724 0.1308 38.7559);
  --primary-foreground: oklch(1.0000 0 0);
  --secondary: oklch(0.9818 0.0054 95.0986);
  --secondary-foreground: oklch(0.3085 0.0035 106.6039);
  --muted: oklch(0.2213 0.0038 106.7070);
  --muted-foreground: oklch(0.7713 0.0169 99.0657);
  --accent: oklch(0.2130 0.0078 95.4245);
  --accent-foreground: oklch(0.9663 0.0080 98.8792);
  --destructive: oklch(0.6368 0.2078 25.3313);
  --destructive-foreground: oklch(1.0000 0 0);
  --border: oklch(0.3618 0.0101 106.8928);
  --input: oklch(0.4336 0.0113 100.2195);
  --ring: oklch(0.6724 0.1308 38.7559);
  --chart-1: oklch(0.5583 0.1276 42.9956);
  --chart-2: oklch(0.6898 0.1581 290.4107);
  --chart-3: oklch(0.2130 0.0078 95.4245);
  --chart-4: oklch(0.3074 0.0516 289.3230);
  --chart-5: oklch(0.5608 0.1348 42.0584);
  --sidebar: oklch(0.2357 0.0024 67.7077);
  --sidebar-foreground: oklch(0.8074 0.0142 93.0137);
  --sidebar-primary: oklch(0.3250 0 0);
  --sidebar-primary-foreground: oklch(0.9881 0 0);
  --sidebar-accent: oklch(0.1680 0.0020 106.6177);
  --sidebar-accent-foreground: oklch(0.8074 0.0142 93.0137);
  --sidebar-border: oklch(0.9401 0 0);
  --sidebar-ring: oklch(0.7731 0 0);
}
`;

  // ========= 配置 =========
  const CONFIG = {
    claudeFont: 'var(--font-serif)',
    codeFont: 'var(--font-mono)',
    claudeThemeColor: 'var(--primary)',
    lineHeight: '1.72',
    storageKey: 'gemini_claude_font_enabled',
  };

  // ========= 状态 =========
  let isEnabled = GM_getValue(CONFIG.storageKey, false);
  let themeElement = null;
  let styleElement = null;
  let btnStyleElement = null;
  let toggleButton = null;
  let menuCommandId = null;
  let welcomeObserver = null;

  // ========= 主样式 =========
  const claudeFontCSS = `
/* 全站基础文字（更大、更粗） */
body, p, div, span, article, section, h1, h2, h3, h4, h5, h6,
main, aside, header, footer, nav, ul, li, ol, dl, dt, dd,
table, thead, tbody, tr, td, th, caption,
form, fieldset, legend, label, input[type="text"], input[type="email"],
input[type="password"], input[type="search"], textarea, select, option {
  font-family: ${CONFIG.claudeFont} !important;
  font-size: var(--font-size-base) !important;
  font-weight: var(--font-weight-text) !important;
  line-height: ${CONFIG.lineHeight} !important;
  color: var(--foreground);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

/* 标题：更紧凑行高 & 合理字重 */
h1 { line-height: 1.25 !important; font-weight: 700 !important; }
h2 { line-height: 1.28 !important; font-weight: 650 !important; }
h3 { line-height: 1.30 !important; font-weight: 600 !important; }
h4, h5, h6 { line-height: 1.35 !important; font-weight: 600 !important; }

/* 段落/列表微增字号，提升可读性 */
p, li { font-size: calc(var(--font-size-base) * 1.02) !important; }

/* strong/b 更清晰 */
strong, b { font-weight: var(--font-weight-strong) !important; }

/* 代码保持等宽 */
code, pre, .code, [class*="code"], [class*="mono"],
.highlight, .language-*, textarea[class*="code"],
div[class*="code"], span[class*="code"] {
  font-family: ${CONFIG.codeFont} !important;
}

/* 控件/图标不改字体 */
button, input[type="button"], input[type="submit"], input[type="reset"],
[role="button"], [class*="button"], [class*="btn"],
[class*="icon"], [class*="material"], [aria-label],
svg, img, .mdc-*, [class*="mdc-"], [data-*="button"] {
  font-family: inherit !important;
}

/* CJK 兜底 */
[lang="zh"], [lang="zh-CN"], [lang="zh-TW"] {
  font-family: ${CONFIG.claudeFont}, "Microsoft YaHei", "微软雅黑", "SimSun", "宋体" !important;
}

/* 页面背景 */
body { background: var(--background); }

/* 欢迎词候选容器（真正上色由 JS 判断） */
div[class*="greeting"], span[class*="greeting"],
h1[class*="greeting"], h2[class*="greeting"], h3[class*="greeting"],
[data-testid*="greeting"], [class*="welcome"], [class*="hello"],
main h1, main h2, main h3, [role="main"] h1, [role="main"] h2, [role="main"] h3 { }
`;

  // ========= 按钮样式 =========
  const buttonCSS = `
#claude-font-toggle {
  position: fixed !important;
  top: 80px !important;
  right: 20px !important;
  z-index: 2147483646 !important;
  background: linear-gradient(135deg, var(--primary), color-mix(in oklch, var(--primary) 75%, black)) !important;
  color: var(--primary-foreground) !important;
  border: none !important;
  border-radius: 20px !important;
  padding: 8px 14px !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  cursor: pointer !important;
  box-shadow: var(--shadow-sm) !important;
  transition: transform .15s ease, box-shadow .15s ease, opacity .2s ease !important;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
  min-width: 92px !important;
  text-align: center !important;
  user-select: none !important;
  white-space: nowrap !important;
  line-height: 1.2 !important;
}
#claude-font-toggle:hover{
  transform: translateY(-1px) !important;
  box-shadow: var(--shadow-md) !important;
}
#claude-font-toggle:active{ transform: translateY(0) !important; }
#claude-font-toggle.disabled{
  background: linear-gradient(135deg, var(--muted), color-mix(in oklch, var(--muted) 80%, black)) !important;
  color: var(--muted-foreground) !important;
}

/* 响应式 */
@media (max-width: 768px){
  #claude-font-toggle{
    top: 70px !important;
    right: 14px !important;
    padding: 6px 10px !important;
    font-size: 11px !important;
    min-width: 78px !important;
  }
}
`;

  // ========= 欢迎词检测与上色 =========
  function applyWelcomeTextColor() {
    const welcomePatterns = [
      /你好[，,\s]*([^\s，,]+)/i, /您好[，,\s]*([^\s，,]+)/i,
      /hi[，,\s]+([^\s，,]+)/i, /hello[，,\s]+([^\s，,]+)/i,
      /welcome[，,\s]+([^\s，,]+)/i, /bonjour[，,\s]+([^\s，,]+)/i,
      /hola[，,\s]+([^\s，,]+)/i, /ciao[，,\s]+([^\s，,]+)/i,
      /guten\s+tag[，,\s]+([^\s，,]+)/i, /こんにちは[，,\s]*([^\s，,]+)/,
      /안녕하세요[，,\s]*([^\s，,]+)/
    ];

    const isInteractive = (el) => {
      if (!el) return false;
      const tag = el.tagName?.toLowerCase();
      if (['input', 'textarea', 'select', 'button'].includes(tag)) return true;
      if (el.isContentEditable) return true;
      const role = el.getAttribute?.('role');
      if (role === 'textbox' || role === 'button') return true;
      return false;
    };

    // 文本节点扫描
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const p = node.parentElement;
          if (!p) return NodeFilter.FILTER_REJECT;
          const tag = p.tagName.toLowerCase();
          if (['script', 'style', 'svg', 'path'].includes(tag)) return NodeFilter.FILTER_REJECT;
          if (isInteractive(p)) return NodeFilter.FILTER_REJECT;
          const cls = (p.className || '') + '';
          if (/\b(button|btn|icon|mdc-)\b/.test(cls)) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let n;
    while ((n = walker.nextNode())) {
      const text = (n.textContent || '').trim();
      if (!text) continue;
      if (welcomePatterns.some((re) => re.test(text))) {
        const el = n.parentElement;
        if (el && !el.dataset.claudeWelcomeColored) {
          el.style.setProperty('color', CONFIG.claudeThemeColor, 'important');
          el.dataset.claudeWelcomeColored = '1';
        }
      }
    }

    // 再扫一遍候选容器
    const selectors = [
      'h1, h2, h3',
      '[class*="welcome"]',
      '[class*="greeting"]',
      '[class*="hello"]',
      '[data-testid*="welcome"]',
      '[data-testid*="greeting"]',
      'main h1, main h2, main h3',
      '[role="main"] h1, [role="main"] h2, [role="main"] h3'
    ];
    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        const t = (el.textContent || '').trim();
        if (!t) return;
        if (welcomePatterns.some((re) => re.test(t))) {
          if (!el.dataset.claudeWelcomeColored) {
            el.style.setProperty('color', CONFIG.claudeThemeColor, 'important');
            el.dataset.claudeWelcomeColored = '1';
          }
        }
      });
    });
  }

  function restoreWelcomeTextColor() {
    document.querySelectorAll('[data-claude-welcome-colored="1"]').forEach(el => {
      el.style.removeProperty('color');
      delete el.dataset.claudeWelcomeColored;
    });
  }

  // ========= 观察欢迎词（等待 body 就绪后再绑定） =========
  function startWelcomeTextObserver() {
    if (!isEnabled) return null;

    const start = () => {
      if (!document.body) return;
      const debounced = (() => {
        let t = null;
        return () => { clearTimeout(t); t = setTimeout(applyWelcomeTextColor, 120); };
      })();
      try {
        const obs = new MutationObserver(muts => {
          for (const m of muts) {
            if (m.type === 'childList' || m.type === 'characterData') { debounced(); break; }
          }
        });
        obs.observe(document.body, { childList: true, subtree: true, characterData: true });
        welcomeObserver = obs;
        setTimeout(applyWelcomeTextColor, 120); // 初次跑一次
      } catch (e) {
        console.warn('[Claude Font] Observer init failed:', e);
      }
    };

    if (document.body) start();
    else document.addEventListener('DOMContentLoaded', start, { once: true });

    return welcomeObserver;
  }

  // ========= 按钮/Toast =========
  function createToggleButton() {
    if (toggleButton) return;

    if (!btnStyleElement) {
      btnStyleElement = document.createElement('style');
      btnStyleElement.id = 'claude-font-button-style';
      btnStyleElement.textContent = buttonCSS;
      (document.head || document.documentElement).appendChild(btnStyleElement);
    }

    toggleButton = document.createElement('button');
    toggleButton.id = 'claude-font-toggle';
    updateButtonState();
    toggleButton.addEventListener('click', toggleFont);
    document.body.appendChild(toggleButton);

    let hoverTimeout;
    toggleButton.addEventListener('mouseenter', () => {
      hoverTimeout = setTimeout(() => {
        showToast(isEnabled ? 'Claude 优雅衬线字体已启用' : '使用默认系统字体');
      }, 1000);
    });
    toggleButton.addEventListener('mouseleave', () => clearTimeout(hoverTimeout));

    // 在按钮创建时，若开启则确保 Observer 也已绑定
    if (isEnabled && !welcomeObserver) startWelcomeTextObserver();

    console.log('✅ 切换按钮已创建');
  }

  function updateButtonState() {
    if (!toggleButton) return;
    if (isEnabled) {
      toggleButton.textContent = 'Claude字体';
      toggleButton.className = '';
      toggleButton.title = '当前：Claude衬线字体 + 主题色\n点击切换到默认字体\n快捷键：Ctrl+Shift+F';
    } else {
      toggleButton.textContent = '默认字体';
      toggleButton.className = 'disabled';
      toggleButton.title = '当前：默认系统字体\n点击切换到Claude字体 + 主题色\n快捷键：Ctrl+Shift+F';
    }
  }

  function showToast(message) {
    const existing = document.getElementById('claude-font-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'claude-font-toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed !important;
      top: 130px !important;
      right: 20px !important;
      z-index: 2147483647 !important;
      background: color-mix(in oklch, var(--popover) 86%, black) !important;
      color: var(--popover-foreground) !important;
      padding: 8px 12px !important;
      border-radius: 8px !important;
      font-size: 13px !important;
      font-family: system-ui, -apple-system, sans-serif !important;
      box-shadow: var(--shadow-md) !important;
      opacity: 0 !important;
      transition: opacity .25s ease !important;
      max-width: 240px !important;
      white-space: nowrap !important;
      line-height: 1.3 !important;
      pointer-events: none !important;
    `;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.style.opacity = '1');
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 260);
    }, 1800);
  }

  // ========= 菜单 =========
  function registerMenuCommand() {
    if (menuCommandId) GM_unregisterMenuCommand(menuCommandId);
    menuCommandId = GM_registerMenuCommand(
      isEnabled ? '❌ 关闭 Claude 字体与主题色' : '✅ 启用 Claude 字体与主题色',
      toggleFont,
      'c'
    );
  }

  // ========= 应用/移除样式 =========
  function applyClaudeFont() {
    if (!themeElement) {
      themeElement = document.createElement('style');
      themeElement.id = 'claude-theme-style';
      themeElement.textContent = THEME_CSS;
      (document.head || document.documentElement).appendChild(themeElement);
    }
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'claude-font-style';
      styleElement.textContent = claudeFontCSS;
      (document.head || document.documentElement).appendChild(styleElement);
    }
    setTimeout(applyWelcomeTextColor, 300);
    console.log('✅ 主题与 Claude 字体已应用');
  }

  function removeClaudeFont() {
    if (styleElement) { styleElement.remove(); styleElement = null; }
    if (themeElement) { themeElement.remove(); themeElement = null; }
    if (welcomeObserver) { welcomeObserver.disconnect(); welcomeObserver = null; }
    restoreWelcomeTextColor();
    console.log('❌ Claude 字体和主题色已移除');
  }

  // ========= 切换 =========
  function toggleFont() {
    isEnabled = !isEnabled;
    GM_setValue(CONFIG.storageKey, isEnabled);

    if (isEnabled) {
      applyClaudeFont();
      if (!welcomeObserver) startWelcomeTextObserver();
      showToast('✨ Claude 字体与主题色已启用');
    } else {
      removeClaudeFont();
      showToast('已切换到默认字体');
    }
    updateButtonState();
    registerMenuCommand();
    console.log(`[Claude Font] ${isEnabled ? 'ON' : 'OFF'}`);
  }

  // ========= 初始化 =========
  function init() {
    console.log('🔧 Gemini Claude 字体切换器启动...');

    // 若启用：先注入样式，但 Observer 等 body/按钮就绪后再启动
    if (isEnabled) applyClaudeFont();

    const createButtonWhenReady = () => {
      if (document.body) {
        createToggleButton();
      } else {
        setTimeout(createButtonWhenReady, 100);
      }
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => setTimeout(createButtonWhenReady, 300), { once: true });
    } else {
      setTimeout(createButtonWhenReady, 300);
    }

    registerMenuCommand();

    // 监听 SPA URL 变化（保证按钮/样式在新视图可见）
    let lastUrl = location.href;
    const urlObs = new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        setTimeout(() => {
          if (!document.getElementById('claude-font-toggle')) createToggleButton();
          if (isEnabled && !styleElement) applyClaudeFont();
          if (isEnabled && !welcomeObserver && document.body) startWelcomeTextObserver();
          if (isEnabled) setTimeout(applyWelcomeTextColor, 300);
        }, 800);
      }
    });
    urlObs.observe(document, { subtree: true, childList: true });

    console.log(`✅ 初始化完成 - 当前状态: ${isEnabled ? 'Claude字体+主题色' : '默认字体'}`);
  }

  // ========= 快捷键（Ctrl+Shift+F），避免输入态触发 =========
  document.addEventListener('keydown', (e) => {
    const ae = document.activeElement;
    const onInput = ae && (ae.isContentEditable || /^(input|textarea|select)$/i.test(ae.tagName));
    if (onInput) return;
    if (e.ctrlKey && e.shiftKey && (e.code === 'KeyF' || e.key === 'F')) {
      e.preventDefault();
      toggleFont();
    }
  }, true);

  // ========= 卸载清理 =========
  window.addEventListener('beforeunload', () => {
    try { if (menuCommandId) GM_unregisterMenuCommand(menuCommandId); } catch {}
    if (welcomeObserver) { welcomeObserver.disconnect(); welcomeObserver = null; }
  });

  // ========= 启动 =========
  init();

  // ========= 控制台调试接口 =========
  window.ClaudeFontToggler = {
    toggle: toggleFont,
    enable: () => { if (!isEnabled) toggleFont(); },
    disable: () => { if (isEnabled) toggleFont(); },
    status: () => isEnabled,
    applyWelcomeColor: applyWelcomeTextColor,
    version: '1.6.2'
  };
})();
