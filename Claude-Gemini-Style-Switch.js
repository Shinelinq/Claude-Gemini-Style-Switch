// ==UserScript==
// @name         Gemini 仿 Claude 风格转换插件
// @namespace    https://github.com/XXX/
// @version      1.2.0
// @description  将 Gemini 官网界面变成 Claude 风格：颜色主题 + 衬线字体
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

  // ===== Claude 风格颜色变量 =====
  const THEME_CSS = `
    :root {
      /* Claude 主题色 */
      --claude-primary: #D97706;
      --claude-primary-dark: #B45309;
      --claude-primary-light: #F59E0B;
      --claude-bg: #FFFBEB;
      --claude-bg-secondary: #FEF3C7;
      --claude-bg-tertiary: #FDE68A;
      --claude-text: #78350F;
      --claude-text-muted: #92400E;
      --claude-text-light: #B45309;
      --claude-border: #FDE68A;
      --claude-border-dark: #FCD34D;
      --claude-shadow: rgba(217, 119, 6, 0.1);
      --claude-shadow-md: rgba(217, 119, 6, 0.15);
      --claude-shadow-lg: rgba(217, 119, 6, 0.2);

      /* 字体 */
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

  // ===== Claude 颜色主题覆盖 =====
  const COLOR_THEME_CSS = `
    /* === 全局背景 === */
    body,
    html,
    bard-app,
    chat-app,
    main {
      background: var(--claude-bg) !important;
      color: var(--claude-text) !important;
    }

    /* === 顶部栏 === */
    .top-bar-actions,
    .gb_T,
    header {
      background: white !important;
      border-bottom: 1px solid var(--claude-border) !important;
    }

    /* === 侧边栏 === */
    bard-sidenav,
    side-navigation-v2,
    .side-nav-menu-button,
    .conversations-list-container {
      background: var(--claude-bg-secondary) !important;
    }

    /* 侧边栏按钮 */
    .side-nav-action-button,
    .conversation {
      background: transparent !important;
      border-radius: 8px !important;
      transition: background 0.2s ease !important;
    }

    .side-nav-action-button:hover,
    .conversation:hover {
      background: var(--claude-bg-tertiary) !important;
    }

    .conversation.selected {
      background: var(--claude-bg-tertiary) !important;
      border-left: 3px solid var(--claude-primary) !important;
    }

    /* === 主聊天区域 === */
    .chat-container,
    .chat-history,
    .chat-history-scroll-container {
      background: var(--claude-bg) !important;
    }

    /* === 输入框区域 === */
    .input-area-container,
    .text-input-field {
      background: white !important;
      border: 2px solid var(--claude-border) !important;
      border-radius: 16px !important;
    }

    .text-input-field:focus-within {
      border-color: var(--claude-primary) !important;
      box-shadow: 0 0 0 3px var(--claude-shadow) !important;
    }

    .ql-editor {
      color: var(--claude-text) !important;
    }

    /* === 按钮 === */
    .mat-mdc-button,
    .mat-mdc-unelevated-button,
    .mat-mdc-raised-button {
      background: var(--claude-primary) !important;
      color: white !important;
      border-radius: 12px !important;
      box-shadow: 0 2px 8px var(--claude-shadow) !important;
      transition: all 0.2s ease !important;
    }

    .mat-mdc-button:hover,
    .mat-mdc-unelevated-button:hover {
      background: var(--claude-primary-dark) !important;
      transform: translateY(-1px) !important;
      box-shadow: 0 4px 12px var(--claude-shadow-md) !important;
    }

    /* 发送按钮 */
    .send-button {
      background: var(--claude-primary) !important;
      color: white !important;
    }

    .send-button:hover:not([aria-disabled="true"]) {
      background: var(--claude-primary-dark) !important;
    }

    .send-button[aria-disabled="true"] {
      background: var(--claude-border) !important;
      opacity: 0.5 !important;
    }

    /* === 卡片 === */
    .intent-card,
    .card {
      background: white !important;
      border: 1px solid var(--claude-border) !important;
      border-radius: 12px !important;
      box-shadow: 0 1px 3px var(--claude-shadow) !important;
      transition: all 0.2s ease !important;
    }

    .intent-card:hover,
    .card:hover {
      border-color: var(--claude-primary) !important;
      box-shadow: 0 4px 12px var(--claude-shadow-md) !important;
      transform: translateY(-2px) !important;
    }

    /* === 链接 === */
    a {
      color: var(--claude-primary) !important;
    }

    a:hover {
      color: var(--claude-primary-dark) !important;
      text-decoration: underline !important;
    }

    /* === 图标 === */
    mat-icon {
      color: var(--claude-text-muted) !important;
    }

    .mat-mdc-button mat-icon,
    .send-button mat-icon {
      color: white !important;
    }

    /* === 滚动条 === */
    ::-webkit-scrollbar {
      width: 8px !important;
      height: 8px !important;
    }

    ::-webkit-scrollbar-track {
      background: var(--claude-bg-secondary) !important;
    }

    ::-webkit-scrollbar-thumb {
      background: var(--claude-primary) !important;
      border-radius: 4px !important;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: var(--claude-primary-dark) !important;
    }

    /* === 选中文本 === */
    ::selection {
      background: var(--claude-bg-tertiary) !important;
      color: var(--claude-text) !important;
    }

    /* === 焦点样式 === */
    *:focus-visible {
      outline: 2px solid var(--claude-primary) !important;
      outline-offset: 2px !important;
    }
  `;

  // ===== 配置 =====
  const CONFIG = {
    claudeFont: 'var(--font-serif)',
    codeFont: 'var(--font-mono)',
    lineHeight: '1.75',
    storageKey: 'gemini_claude_style_enabled',
  };

  // ===== 状态 =====
  let isEnabled = GM_getValue(CONFIG.storageKey, false);
  let themeElement = null;
  let colorElement = null;
  let styleElement = null;
  let btnStyleElement = null;
  let toggleButton = null;

  // ===== 字体样式 =====
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
    }

    h1 { font-weight: 700 !important; }
    h2, h3 { font-weight: 600 !important; }
    h4, h5, h6 { font-weight: 600 !important; }
    strong, b { font-weight: var(--font-weight-strong) !important; }
    code, pre, .code, .mono, .highlight {
      font-family: ${CONFIG.codeFont} !important;
    }
  `;

  // ===== 按钮样式 =====
  const buttonCSS = `
    #claude-style-toggle {
      position: fixed !important;
      top: 80px !important;
      right: 20px !important;
      z-index: 2147483646 !important;
      background-color: var(--claude-primary) !important;
      color: white !important;
      border: none !important;
      border-radius: 12px !important;
      padding: 10px 16px !important;
      font-size: 13px !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      box-shadow: 0 2px 8px var(--claude-shadow) !important;
      transition: all 0.2s ease !important;
    }

    #claude-style-toggle:hover {
      background-color: var(--claude-primary-dark) !important;
      transform: translateY(-1px) !important;
      box-shadow: 0 4px 12px var(--claude-shadow-md) !important;
    }

    #claude-style-toggle.disabled {
      background-color: #9CA3AF !important;
      color: #6B7280 !important;
    }
  `;

  // ===== 创建按钮 =====
  function createToggleButton() {
    if (toggleButton) return;

    if (!btnStyleElement) {
      btnStyleElement = document.createElement('style');
      btnStyleElement.id = 'claude-button-style';
      btnStyleElement.textContent = buttonCSS;
      (document.head || document.documentElement).appendChild(btnStyleElement);
    }

    toggleButton = document.createElement('button');
    toggleButton.id = 'claude-style-toggle';
    toggleButton.textContent = isEnabled ? '🎨 Claude 风格' : '🔵 Gemini 风格';
    toggleButton.className = isEnabled ? '' : 'disabled';
    toggleButton.title = isEnabled ? '切换到 Gemini 风格' : '切换到 Claude 风格';
    toggleButton.addEventListener('click', toggleStyle);
    document.body.appendChild(toggleButton);

    console.log('✅ 切换按钮已创建');
  }

  // ===== 更新按钮 =====
  function updateButtonState() {
    if (!toggleButton) return;
    toggleButton.textContent = isEnabled ? '🎨 Claude 风格' : '🔵 Gemini 风格';
    toggleButton.className = isEnabled ? '' : 'disabled';
    toggleButton.title = isEnabled ? '切换到 Gemini 风格' : '切换到 Claude 风格';
  }

  // ===== 应用样式 =====
  function applyClaudeStyle() {
    if (!themeElement) {
      themeElement = document.createElement('style');
      themeElement.id = 'claude-theme-vars';
      themeElement.textContent = THEME_CSS;
      (document.head || document.documentElement).appendChild(themeElement);
    }

    if (!colorElement) {
      colorElement = document.createElement('style');
      colorElement.id = 'claude-color-theme';
      colorElement.textContent = COLOR_THEME_CSS;
      (document.head || document.documentElement).appendChild(colorElement);
    }

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'claude-font-style';
      styleElement.textContent = claudeFontCSS;
      (document.head || document.documentElement).appendChild(styleElement);
    }

    console.log('✅ Claude 风格已应用（颜色主题 + 字体）');
  }

  function removeClaudeStyle() {
    if (styleElement) { styleElement.remove(); styleElement = null; }
    if (colorElement) { colorElement.remove(); colorElement = null; }
    if (themeElement) { themeElement.remove(); themeElement = null; }
    console.log('❌ Claude 风格已移除');
  }

  // ===== 切换功能 =====
  function toggleStyle() {
    isEnabled = !isEnabled;
    GM_setValue(CONFIG.storageKey, isEnabled);

    if (isEnabled) {
      applyClaudeStyle();
    } else {
      removeClaudeStyle();
    }

    updateButtonState();
    console.log(`[Claude Style] ${isEnabled ? '✅ 启用' : '❌ 禁用'}`);
  }

  // ===== 初始化 =====
  function init() {
    console.log('🚀 Gemini → Claude 风格转换插件启动（v1.2.0）');
    if (isEnabled) applyClaudeStyle();

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
          if (isEnabled && !styleElement) applyClaudeStyle();
        }, 800);
      }
    });
    urlObs.observe(document, { subtree: true, childList: true });

    console.log(`✅ 初始化完成 - 当前状态: ${isEnabled ? 'Claude 风格' : 'Gemini 风格'}`);
  }

  // ===== 启动 =====
  init();

  // ===== 快捷键（Ctrl+Shift+C）切换 =====
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && (e.code === 'KeyC' || e.key === 'C')) {
      e.preventDefault();
      toggleStyle();
    }
  }, true);

})();