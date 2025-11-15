// ==UserScript==
// @name         Gemini 仿 Claude 风格转换插件
// @namespace    https://github.com/XXX/
// @version      1.3.1
// @description  将 Gemini 官网界面变成 Claude 风格：颜色主题 + 优化字体系统
// @author       Claude Assistant
// @match        https://gemini.google.com/*
// @match        https://*.gemini.google.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-start
// @license      MIT
// @noframes
// ==/UserScript==

(function () {
  'use strict';

  const THEME_CSS = `
    :root {
      --claude-primary: #D97706;
      --claude-primary-dark: #B45309;
      --claude-bg: #FFFBEB;
      --claude-bg-secondary: #FEF3C7;
      --claude-bg-tertiary: #FDE68A;
      --claude-text: #78350F;
      --claude-text-muted: #92400E;
      --claude-border: #FDE68A;
      --claude-shadow: rgba(217, 119, 6, 0.1);
      --claude-shadow-md: rgba(217, 119, 6, 0.15);
    }
  `;

  const COLOR_THEME_CSS = `
    body, html, bard-app, chat-app, main { background: var(--claude-bg) !important; color: var(--claude-text) !important; }
    .top-bar-actions, .gb_T, header { background: white !important; border-bottom: 1px solid var(--claude-border) !important; }
    bard-sidenav, side-navigation-v2, .side-nav-menu-button, .conversations-list-container { background: var(--claude-bg-secondary) !important; }
    .side-nav-action-button, .conversation { background: transparent !important; border-radius: 8px !important; transition: background 0.2s ease !important; }
    .side-nav-action-button:hover, .conversation:hover { background: var(--claude-bg-tertiary) !important; }
    .conversation.selected { background: var(--claude-bg-tertiary) !important; border-left: 3px solid var(--claude-primary) !important; }
    .chat-container, .chat-history, .chat-history-scroll-container { background: var(--claude-bg) !important; }
    .input-area-container, .text-input-field { background: white !important; border: 2px solid var(--claude-border) !important; border-radius: 16px !important; }
    .text-input-field:focus-within { border-color: var(--claude-primary) !important; box-shadow: 0 0 0 3px var(--claude-shadow) !important; }
    .ql-editor { color: var(--claude-text) !important; }
    .mat-mdc-button, .mat-mdc-unelevated-button, .mat-mdc-raised-button { background: var(--claude-primary) !important; color: white !important; border-radius: 12px !important; box-shadow: 0 2px 8px var(--claude-shadow) !important; transition: all 0.2s ease !important; }
    .mat-mdc-button:hover, .mat-mdc-unelevated-button:hover { background: var(--claude-primary-dark) !important; transform: translateY(-1px) !important; box-shadow: 0 4px 12px var(--claude-shadow-md) !important; }
    .send-button { background: var(--claude-primary) !important; color: white !important; }
    .send-button:hover:not([aria-disabled="true"]) { background: var(--claude-primary-dark) !important; }
    .send-button[aria-disabled="true"] { background: var(--claude-border) !important; opacity: 0.5 !important; }
    .intent-card, .card { background: white !important; border: 1px solid var(--claude-border) !important; border-radius: 12px !important; box-shadow: 0 1px 3px var(--claude-shadow) !important; transition: all 0.2s ease !important; }
    .intent-card:hover, .card:hover { border-color: var(--claude-primary) !important; box-shadow: 0 4px 12px var(--claude-shadow-md) !important; transform: translateY(-2px) !important; }
    a { color: var(--claude-primary) !important; }
    a:hover { color: var(--claude-primary-dark) !important; text-decoration: underline !important; }
    mat-icon { color: var(--claude-text-muted) !important; }
    .mat-mdc-button mat-icon, .send-button mat-icon { color: white !important; }
    ::-webkit-scrollbar { width: 8px !important; height: 8px !important; }
    ::-webkit-scrollbar-track { background: var(--claude-bg-secondary) !important; }
    ::-webkit-scrollbar-thumb { background: var(--claude-primary) !important; border-radius: 4px !important; }
    ::-webkit-scrollbar-thumb:hover { background: var(--claude-primary-dark) !important; }
    ::selection { background: var(--claude-bg-tertiary) !important; color: var(--claude-text) !important; }
    *:focus-visible { outline: 2px solid var(--claude-primary) !important; outline-offset: 2px !important; }
  `;

  const FONT_CSS = `
    /* 标题 - 衬线字体 */
    h1, h2, h3, h4, h5, h6,
    .user-greeting-text,
    .conversation-title,
    .gds-headline-l,
    .gds-headline-m,
    .gds-headline-s {
      font-family: 'Georgia', 'Times New Roman', serif !important;
      font-weight: 600 !important;
      line-height: 1.4 !important;
    }

    /* 正文 - 无衬线字体 */
    body, p, div, span, article, section,
    .message-content,
    .ql-editor,
    .gds-body-l,
    .gds-body-m,
    .gds-body-s,
    .gds-label-l,
    .gds-label-m {
      font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif !important;
      font-size: 16px !important;
      font-weight: 400 !important;
      line-height: 1.6 !important;
    }

    /* 代码 - 等宽字体 */
    code, pre, .code-block, .highlight,
    .ql-code-block, .ql-syntax {
      font-family: 'Fira Code', 'Consolas', 'Monaco', monospace !important;
      font-size: 14px !important;
      line-height: 1.5 !important;
    }

    /* 按钮和输入框 - 保持原字体 */
    button, input, textarea, select,
    .mat-mdc-button, .mat-mdc-icon-button {
      font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif !important;
      font-size: 14px !important;
      font-weight: 500 !important;
    }

    /* 图标 - 排除字体覆盖 */
    mat-icon, .material-icons, .google-symbols {
      font-family: 'Material Icons', 'Google Symbols' !important;
    }

    /* 强调文本 */
    strong, b { font-weight: 600 !important; }
    em, i { font-style: italic !important; }
  `;

  const BUTTON_CSS = `
    #claude-style-toggle {
      position: fixed !important;
      top: 80px !important;
      right: 20px !important;
      z-index: 2147483646 !important;
      background: var(--claude-primary) !important;
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
      background: var(--claude-primary-dark) !important;
      transform: translateY(-1px) !important;
    }
    #claude-style-toggle.disabled {
      background: #9CA3AF !important;
      color: #6B7280 !important;
    }
  `;

  let isEnabled = GM_getValue('gemini_claude_style_enabled', false);
  let elements = {};
  let toggleButton = null;

  function applyStyle() {
    if (!elements.theme) {
      elements.theme = document.createElement('style');
      elements.theme.textContent = THEME_CSS;
      (document.head || document.documentElement).appendChild(elements.theme);
    }
    if (!elements.color) {
      elements.color = document.createElement('style');
      elements.color.textContent = COLOR_THEME_CSS;
      (document.head || document.documentElement).appendChild(elements.color);
    }
    if (!elements.font) {
      elements.font = document.createElement('style');
      elements.font.textContent = FONT_CSS;
      (document.head || document.documentElement).appendChild(elements.font);
    }
    console.log('✅ Claude 风格已应用');
  }

  function removeStyle() {
    Object.values(elements).forEach(el => el?.remove());
    elements = {};
    console.log('❌ Claude 风格已移除');
  }

  function toggleStyle() {
    isEnabled = !isEnabled;
    GM_setValue('gemini_claude_style_enabled', isEnabled);
    isEnabled ? applyStyle() : removeStyle();
    if (toggleButton) {
      toggleButton.textContent = isEnabled ? '🎨 Claude' : '🔵 Gemini';
      toggleButton.className = isEnabled ? '' : 'disabled';
    }
  }

  function createButton() {
    if (toggleButton || !document.body) return;
    const btnStyle = document.createElement('style');
    btnStyle.textContent = BUTTON_CSS;
    document.head.appendChild(btnStyle);
    toggleButton = document.createElement('button');
    toggleButton.id = 'claude-style-toggle';
    toggleButton.textContent = isEnabled ? '🎨 Claude' : '🔵 Gemini';
    toggleButton.className = isEnabled ? '' : 'disabled';
    toggleButton.onclick = toggleStyle;
    document.body.appendChild(toggleButton);
  }

  function init() {
    console.log('🚀 Gemini → Claude v1.3.1');
    if (isEnabled) applyStyle();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => setTimeout(createButton, 300));
    } else {
      setTimeout(createButton, 300);
    }
    let lastUrl = location.href;
    new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        setTimeout(() => { if (isEnabled && !elements.font) applyStyle(); }, 800);
      }
    }).observe(document, { subtree: true, childList: true });
  }

  init();
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.code === 'KeyC') {
      e.preventDefault();
      toggleStyle();
    }
  }, true);
})();