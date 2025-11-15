// ==UserScript==
// @name         Gemini 仿 Claude 风格转换插件
// @namespace    https://github.com/XXX/
// @version      1.5.0
// @description  v1.5.0: 布局调整（间距/宽度/对齐优化）+ v1.4.0: 完整组件样式覆盖 + 修复切换按钮定位
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

  const THEME_VARS = `
    :root {
      --claude-primary: #D97706 !important;
      --claude-primary-dark: #B45309 !important;
      --claude-bg: #FFFBEB !important;
      --claude-bg-secondary: #FEF3C7 !important;
      --claude-bg-tertiary: #FDE68A !important;
      --claude-text: #78350F !important;
      --claude-text-muted: #92400E !important;
      --claude-border: #FDE68A !important;
      --claude-shadow: rgba(217, 119, 6, 0.1) !important;
      --claude-shadow-md: rgba(217, 119, 6, 0.15) !important;
    }
  `;

  const LAYOUT_STYLES = `
    /* === 主容器布局 === */
    .chat-container, .chat-history, .conversation-container {
      max-width: 900px !important;
      margin: 0 auto !important;
      padding: 32px 24px !important;
    }
    
    /* === 消息间距 === */
    .message-content, message-content, .model-response-text, .user-query {
      margin: 20px 0 !important;
    }
    
    /* === 侧边栏宽度 === */
    bard-sidenav, side-navigation-v2, mat-sidenav, .mat-drawer {
      width: 280px !important;
      min-width: 280px !important;
    }
    
    /* === 输入框容器 === */
    .input-area-container, .text-input-container {
      max-width: 900px !important;
      margin: 0 auto !important;
    }
    
    /* === 卡片网格布局 === */
    .intent-cards-container, .cards-grid {
      display: grid !important;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)) !important;
      gap: 16px !important;
      padding: 16px !important;
    }
  `;

  const GLOBAL_STYLES = `
    body, html, bard-app, chat-app, main {
      background: var(--claude-bg) !important;
      color: var(--claude-text) !important;
    }
    .top-bar-actions, .gb_T, header, mat-toolbar {
      background: white !important;
      border-bottom: 1px solid var(--claude-border) !important;
      box-shadow: 0 1px 3px var(--claude-shadow) !important;
    }
  `;

  const SIDEBAR_STYLES = `
    bard-sidenav, side-navigation-v2, mat-sidenav {
      background: var(--claude-bg-secondary) !important;
    }
    .side-nav-action-button, .conversation, .nav-item {
      background: transparent !important;
      border-radius: 10px !important;
      padding: 10px 12px !important;
      margin: 4px 8px !important;
      transition: all 0.2s ease !important;
    }
    .side-nav-action-button:hover, .conversation:hover {
      background: var(--claude-bg-tertiary) !important;
      transform: translateX(4px) !important;
    }
    .conversation.selected {
      background: var(--claude-bg-tertiary) !important;
      border-left: 3px solid var(--claude-primary) !important;
      font-weight: 600 !important;
    }
  `;

  const CHAT_STYLES = `
    .message-content, message-content, .model-response-text {
      background: white !important;
      border: 1px solid var(--claude-border) !important;
      border-radius: 16px !important;
      padding: 20px !important;
      box-shadow: 0 1px 3px var(--claude-shadow) !important;
      line-height: 1.7 !important;
    }
  `;

  const INPUT_STYLES = `
    .input-area-container, .text-input-container {
      background: white !important;
      border: 2px solid var(--claude-border) !important;
      border-radius: 20px !important;
      padding: 12px 16px !important;
      box-shadow: 0 2px 8px var(--claude-shadow) !important;
      transition: all 0.2s ease !important;
    }
    .input-area-container:focus-within {
      border-color: var(--claude-primary) !important;
      box-shadow: 0 0 0 4px var(--claude-shadow), 0 4px 12px var(--claude-shadow-md) !important;
    }
    .text-input-field, .ql-editor {
      background: transparent !important;
      color: var(--claude-text) !important;
      font-size: 16px !important;
      line-height: 1.6 !important;
    }
  `;

  const BUTTON_STYLES = `
    .mat-mdc-button, .mat-mdc-unelevated-button, button[mat-button] {
      background: var(--claude-primary) !important;
      color: white !important;
      border-radius: 12px !important;
      padding: 10px 20px !important;
      font-weight: 600 !important;
      box-shadow: 0 2px 6px var(--claude-shadow) !important;
      transition: all 0.2s ease !important;
    }
    .mat-mdc-button:hover {
      background: var(--claude-primary-dark) !important;
      transform: translateY(-2px) !important;
      box-shadow: 0 4px 12px var(--claude-shadow-md) !important;
    }
    .send-button {
      background: var(--claude-primary) !important;
      border-radius: 50% !important;
      width: 44px !important;
      height: 44px !important;
    }
    .send-button:hover:not([disabled]) {
      background: var(--claude-primary-dark) !important;
      transform: scale(1.1) !important;
    }
    .send-button[disabled] {
      background: var(--claude-border) !important;
      opacity: 0.5 !important;
    }
  `;

  const CARD_STYLES = `
    .intent-card, .card, mat-card {
      background: white !important;
      border: 2px solid var(--claude-border) !important;
      border-radius: 14px !important;
      padding: 16px !important;
      box-shadow: 0 2px 6px var(--claude-shadow) !important;
      transition: all 0.2s ease !important;
    }
    .intent-card:hover, .card:hover {
      border-color: var(--claude-primary) !important;
      box-shadow: 0 6px 16px var(--claude-shadow-md) !important;
      transform: translateY(-4px) scale(1.02) !important;
    }
  `;

  const MISC_STYLES = `
    a { color: var(--claude-primary) !important; }
    a:hover { color: var(--claude-primary-dark) !important; text-decoration: underline !important; }
    mat-icon { color: var(--claude-text-muted) !important; }
    .mat-mdc-button mat-icon { color: white !important; }
    ::-webkit-scrollbar { width: 10px !important; }
    ::-webkit-scrollbar-track { background: var(--claude-bg-secondary) !important; }
    ::-webkit-scrollbar-thumb { background: var(--claude-primary) !important; border-radius: 5px !important; }
    ::selection { background: var(--claude-bg-tertiary) !important; }
  `;

  const FONT_STYLES = `
    h1, h2, h3, h4, h5, h6 {
      font-family: 'Georgia', serif !important;
      font-weight: 600 !important;
      line-height: 1.4 !important;
    }
    body, p, div, span {
      font-family: 'Inter', Arial, sans-serif !important;
      font-size: 16px !important;
      line-height: 1.6 !important;
    }
    code, pre {
      font-family: 'Fira Code', 'Consolas', monospace !important;
      background: var(--claude-bg-secondary) !important;
      padding: 2px 6px !important;
      border-radius: 4px !important;
    }
  `;

  const TOGGLE_BUTTON_STYLES = `
    #claude-toggle {
      position: fixed !important;
      top: 80px !important;
      right: 20px !important;
      z-index: 9999 !important;
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
    #claude-toggle:hover {
      background: var(--claude-primary-dark) !important;
      transform: translateY(-2px) !important;
    }
    #claude-toggle.off {
      background: #9CA3AF !important;
    }
  `;

  const MAIN_STYLES = 
    THEME_VARS +
    LAYOUT_STYLES +
    GLOBAL_STYLES +
    SIDEBAR_STYLES +
    CHAT_STYLES +
    INPUT_STYLES +
    BUTTON_STYLES +
    CARD_STYLES +
    MISC_STYLES +
    FONT_STYLES;

  let on = GM_getValue('claude_on', false);
  let mainStyle, btnStyle, btn;

  function toggle() {
    on = !on;
    GM_setValue('claude_on', on);
    on ? apply() : remove();
    if (btn) {
      btn.textContent = on ? '🎨 Claude' : '🔵 Gemini';
      btn.className = on ? '' : 'off';
    }
  }

  function apply() {
    if (!mainStyle) {
      mainStyle = document.createElement('style');
      mainStyle.textContent = MAIN_STYLES;
      (document.head || document.documentElement).appendChild(mainStyle);
    }
  }

  function remove() {
    mainStyle?.remove();
    mainStyle = null;
  }

  function applyBtnStyle() {
    if (!btnStyle) {
      btnStyle = document.createElement('style');
      btnStyle.textContent = TOGGLE_BUTTON_STYLES;
      document.head.appendChild(btnStyle);
    }
  }

  function init() {
    if (on) apply();
    const create = () => {
      if (!document.body) return setTimeout(create, 100);
      applyBtnStyle();
      btn = document.createElement('button');
      btn.id = 'claude-toggle';
      btn.textContent = on ? '🎨 Claude' : '🔵 Gemini';
      btn.className = on ? '' : 'off';
      btn.onclick = toggle;
      document.body.appendChild(btn);
    };
    document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', () => setTimeout(create, 300)) : setTimeout(create, 300);
    let url = location.href;
    new MutationObserver(() => {
      if (location.href !== url) {
        url = location.href;
        setTimeout(() => { if (on && !mainStyle) apply(); }, 800);
      }
    }).observe(document, { subtree: true, childList: true });
  }

  init();
  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.shiftKey && e.code === 'KeyC') {
      e.preventDefault();
      toggle();
    }
  }, true);
})();
