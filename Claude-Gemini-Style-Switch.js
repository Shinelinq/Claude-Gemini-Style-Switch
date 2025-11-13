// ==UserScript==
// @name         Gemini 仿 Claude 风格转换插件
// @namespace    https://github.com/XXX/
// @version      1.1.0
// @description  将 Gemini 官网界面变成 Claude 风格：衬线字体与主题色
// @author       Claude Assistant
// @match        https://gemini.google.com/*
// @match        https://*.gemini.google.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @run-at       document-start
// @license      MIT
// @noframes
// ==/UserScript==

(function () {
  'use strict';

  // ===== Claude 风格变量 =====
  const THEME_CSS = `
    :root {
      --background: #F5F5F5; /* 背景色 */
      --foreground: #333333; /* 文字色 */
      --primary: #2D9CDB; /* 主题色 */
      --secondary: #E0E0E0; /* 辅助色 */
      --muted: #BDBDBD; /* 淡色 */
      --accent: #FF8C00; /* 高亮色 */
      --border: #E0E0E0; /* 边框色 */
      --font-sans: 'Helvetica Neue', Arial, sans-serif;
      --font-serif: 'Georgia', 'Times New Roman', serif;
      --font-mono: 'Courier New', Courier, monospace;
      --font-size-base: 18px; 
      --font-weight-text: 500;
      --font-weight-strong: 600;
      --line-height: 1.75;
      --radius: 0.5rem;
    }
  `;

  // ===== 配置 =====
  const CONFIG = {
    claudeFont: 'var(--font-serif)',
    codeFont: 'var(--font-mono)',
    claudeThemeColor: 'var(--primary)',
    lineHeight: '1.75',
    storageKey: 'gemini_claude_font_enabled',
  };

  // ===== 状态 =====
  let isEnabled = GM_getValue(CONFIG.storageKey, false);
  let themeElement = null;
  let styleElement = null;
  let btnStyleElement = null;
  let toggleButton = null;
  let menuCommandId = null;

  // ===== 更大且更粗的字体样式 =====
  const claudeFontCSS = `
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
    }

    h1 { font-weight: 700 !important; }
    h2 { font-weight: 600 !important; }
    h3 { font-weight: 600 !important; }
    h4, h5, h6 { font-weight: 600 !important; }
    strong, b { font-weight: var(--font-weight-strong) !important; }
    code, pre, .code, .mono, .highlight {
      font-family: ${CONFIG.codeFont} !important;
    }
  `;

  // ===== 按钮样式 =====
  const buttonCSS = `
    #claude-font-toggle {
      position: fixed !important;
      top: 80px !important;
      right: 20px !important;
      z-index: 2147483646 !important;
      background-color: var(--primary) !important;
      color: white !important;
      border: none !important;
      border-radius: var(--radius) !important;
      padding: 8px 14px !important;
      font-size: 12px !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1) !important;
    }

    #claude-font-toggle:hover {
      background-color: var(--accent) !important;
    }

    #claude-font-toggle.disabled {
      background-color: var(--muted) !important;
      color: var(--muted) !important;
    }
  `;

  // ===== 创建并更新按钮 =====
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
    toggleButton.textContent = isEnabled ? 'Claude 字体启用' : '默认字体';
    toggleButton.className = isEnabled ? '' : 'disabled';
    toggleButton.title = isEnabled ? '切换到默认字体' : '切换到 Claude 字体';
    toggleButton.addEventListener('click', toggleFont);
    document.body.appendChild(toggleButton);

    console.log('✅ 切换按钮已创建');
  }

  // ===== 更新按钮状态 =====
  function updateButtonState() {
    if (!toggleButton) return;

    toggleButton.textContent = isEnabled ? 'Claude 字体启用' : '默认字体';
    toggleButton.className = isEnabled ? '' : 'disabled';
    toggleButton.title = isEnabled ? '切换到默认字体' : '切换到 Claude 字体';
  }

  // ===== 应用或移除样式 =====
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

    console.log('✅ Claude 字体和主题已应用');
  }

  function removeClaudeFont() {
    if (styleElement) { styleElement.remove(); styleElement = null; }
    if (themeElement) { themeElement.remove(); themeElement = null; }
    console.log('❌ Claude 字体和主题已移除');
  }

  // ===== 切换功能 =====
  function toggleFont() {
    isEnabled = !isEnabled;
    GM_setValue(CONFIG.storageKey, isEnabled);

    if (isEnabled) {
      applyClaudeFont();
    } else {
      removeClaudeFont();
    }

    updateButtonState();
    console.log(`[Claude Font] ${isEnabled ? '启用' : '禁用'}`);
  }

  // ===== 初始化 =====
  function init() {
    console.log('🔧 Gemini Claude 风格字体转换插件启动...');
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

    // 监听 URL 变化
    let lastUrl = location.href;
    const urlObs = new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        setTimeout(() => {
          if (isEnabled && !styleElement) applyClaudeFont();
        }, 800);
      }
    });
    urlObs.observe(document, { subtree: true, childList: true });

    console.log(`✅ 初始化完成 - 当前状态: ${isEnabled ? 'Claude 字体已启用' : '默认字体'}`);
  }

  // ===== 启动 =====
  init();

  // ===== 快捷键（Ctrl+Shift+F）切换 =====
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && (e.code === 'KeyF' || e.key === 'F')) {
      e.preventDefault();
      toggleFont();
    }
  }, true);

})();
