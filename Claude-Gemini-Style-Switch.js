// ==UserScript==
// @name         Gemini 仿 Claude 风格转换插件
// @namespace    https://github.com/XXX/
// @version      1.3.0
// @description  将 Gemini 官网界面变成 Claude 风格：颜色主题 + 优化字体系统
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
      --font-sans: 'Helvetica Neue', Arial, sans-serif;
      --font-serif: 'Georgia', 'Times New Roman', serif;
      --font-mono: 'Fira Code', 'Consolas', 'Courier New', monospace;
      --font-size-base: 16px;
      --font-size-lg: 18px;
      --font-size-xl: 20px;
      --font-weight-normal: 400;
      --font-weight-medium: 500;
      --font-weight-semibold: 600;
      --font-weight-bold: 700;
      --line-height-tight: 1.5;
      --line-height-normal: 1.75;
      --line-height-relaxed: 2;
      --radius: 0.5rem;
    }
  `;

  // ===== Claude 颜色主题覆盖 =====
  const COLOR_THEME_CSS = `
    body, html, bard-app, chat-app, main {
      background: var(--claude-bg) !important;
      color: var(--claude-text) !important;
    }
    .top-bar-actions, .gb_T, header {
      background: white !important;
      border-bottom: 1px solid var(--claude-border) !important;
    }
    bard-sidenav, side-navigation-v2, .side-nav-menu-button, .conversations-list-container {
      background: var(--claude-bg-secondary) !important;
    }
    .side-nav-action-button, .conversation {
      background: transparent !important;
      border-radius: 8px !important;
      transition: background 0.2s ease !important;
    }
    .side-nav-action-button:hover, .conversation:hover {
      background: var(--claude-bg-tertiary) !important;
    }
    .conversation.selected {
      background: var(--claude-bg-tertiary) !important;
      border-left: 3px solid var(--claude-primary) !important;
    }
    .chat-container, .chat-history, .chat-history-scroll-container {
      background: var(--claude-bg) !important;
    }
    .input-area-container, .text-input-field {
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
    .mat-mdc-button, .mat-mdc-unelevated-button, .mat-mdc-raised-button {
      background: var(--claude-primary) !important;
      color: white !important;
      border-radius: 12px !important;
      box-shadow: 0 2px 8px var(--claude-shadow) !important;
      transition: all 0.2s ease !important;
    }
    .mat-mdc-button:hover, .mat-mdc-unelevated-button:hover {
      background: var(--claude-primary-dark) !important;
      transform: translateY(-1px) !important;
      box-shadow: 0 4px 12px var(--claude-shadow-md) !important;
    }
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
    .intent-card, .card {
      background: white !important;
      border: 1px solid var(--claude-border) !important;
      border-radius: 12px !important;
      box-shadow: 0 1px 3px var(--claude-shadow) !important;
      transition: all 0.2s ease !important;
    }
    .intent-card:hover, .card:hover {
      border-color: var(--claude-primary) !important;
      box-shadow: 0 4px 12px var(--claude-shadow-md) !important;
      transform: translateY(-2px) !important;
    }
    a {
      color: var(--claude-primary) !important;
    }
    a:hover {
      color: var(--claude-primary-dark) !important;
      text-decoration: underline !important;
    }
    mat-icon {
      color: var(--claude-text-muted) !important;
    }
    .mat-mdc-button mat-icon, .send-button mat-icon {
      color: white !important;
    }
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
    ::selection {
      background: var(--claude-bg-tertiary) !important;
      color: var(--claude-text) !important;
    }
    *:focus-visible {
      outline: 2px solid var(--claude-primary) !important;
      outline-offset: 2px !important;
    }
  `;

  // ===== 优化的字体系统 =====
  const claudeFontCSS = `
    /* === 主要文本内容 === */
    .chat-history p,
    .chat-history div:not([class*="icon"]):not([class*="button"]),
    .message-content,
    .message-content p,
    .message-content div,
    .message-content span,
    .conversation-title,
    .user-greeting-text,
    .response-container,
    .model-response-text,
    article p,
    article div {
      font-family: var(--font-serif) !important;
      font-size: var(--font-size-lg) !important;
      font-weight: var(--font-weight-normal) !important;
      line-height: var(--line-height-normal) !important;
      color: var(--claude-text) !important;
    }

    /* === 标题 === */
    h1, h2, h3, h4, h5, h6,
    .conversation-title,
    .user-greeting-text {
      font-family: var(--font-serif) !important;
      color: var(--claude-text) !important;
    }
    h1 { 
      font-size: var(--font-size-xl) !important;
      font-weight: var(--font-weight-bold) !important;
      line-height: var(--line-height-tight) !important;
    }
    h2, h3 { 
      font-size: var(--font-size-lg) !important;
      font-weight: var(--font-weight-semibold) !important;
      line-height: var(--line-height-tight) !important;
    }
    h4, h5, h6 { 
      font-size: var(--font-size-base) !important;
      font-weight: var(--font-weight-semibold) !important;
    }

    /* === 强调文本 === */
    strong, b {
      font-weight: var(--font-weight-bold) !important;
    }
    em, i {
      font-style: italic !important;
    }

    /* === 代码块 === */
    code, pre, 
    .code, .code-block, 
    .mono, .highlight,
    [class*="code"],
    [class*="highlight"] {
      font-family: var(--font-mono) !important;
      font-size: 14px !important;
      line-height: var(--line-height-tight) !important;
      background: var(--claude-bg-secondary) !important;
      border: 1px solid var(--claude-border) !important;
      border-radius: 6px !important;
      padding: 2px 6px !important;
    }
    pre {
      padding: 12px !important;
      overflow-x: auto !important;
    }
    pre code {
      background: transparent !important;
      border: none !important;
      padding: 0 !important;
    }

    /* === 输入框 === */
    .ql-editor,
    .text-input-field textarea,
    input[type="text"],
    textarea {
      font-family: var(--font-serif) !important;
      font-size: var(--font-size-base) !important;
      line-height: var(--line-height-normal) !important;
    }

    /* === 排除：图标和按钮 === */
    mat-icon,
    .icon,
    [class*="icon"],
    button,
    .mat-mdc-button,
    .mat-mdc-icon-button,
    input[type="button"],
    input[type="submit"] {
      font-family: var(--font-sans) !important;
    }

    /* === 排除：UI 控件 === */
    select,
    option,
    .mat-select,
    .mat-option {
      font-family: var(--font-sans) !important;
      font-size: 14px !important;
    }
  `;

  // ===== 配置 =====
  const CONFIG = {
    storageKey: 'gemini_claude_style_enabled',
  };

  // ===== 状态 =====
  let isEnabled = GM_getValue(CONFIG.storageKey, false);
  let themeElement = null;
  let colorElement = null;
  let styleElement = null;
  let btnStyleElement = null;
  let toggleButton = null;

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
  }

  function removeClaudeStyle() {
    if (styleElement) { styleElement.remove(); styleElement = null; }
    if (colorElement) { colorElement.remove(); colorElement = null; }
    if (themeElement) { themeElement.remove(); themeElement = null; }
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
  }

  // ===== 初始化 =====
  function init() {
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
  }

  init();

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && (e.code === 'KeyC' || e.key === 'C')) {
      e.preventDefault();
      toggleStyle();
    }
  }, true);

})();
