// ==UserScript==
// @name         Gemini 仿 Claude 风格转换插件
// @namespace    https://github.com/XXX/
// @version      1.6.0
// @description  v1.6.0: 添加交互效果（悬停/点击/过渡动画）
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

  const CSS = `
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

    /* 全局 */
    body, html, bard-app, chat-app, main { background: var(--claude-bg) !important; color: var(--claude-text) !important; }
    .top-bar-actions, header, mat-toolbar { background: white !important; border-bottom: 1px solid var(--claude-border) !important; box-shadow: 0 1px 3px var(--claude-shadow) !important; }

    /* 布局 */
    .chat-container, .chat-history { max-width: 900px !important; margin: 0 auto !important; padding: 32px 24px !important; }
    bard-sidenav, side-navigation-v2, mat-sidenav { width: 280px !important; background: var(--claude-bg-secondary) !important; }
    .input-area-container { max-width: 900px !important; margin: 0 auto !important; }

    /* 侧边栏 - 交互效果 */
    .side-nav-action-button, .conversation, .nav-item {
      background: transparent !important;
      border-radius: 10px !important;
      padding: 10px 12px !important;
      margin: 4px 8px !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      cursor: pointer !important;
    }
    .side-nav-action-button:hover, .conversation:hover {
      background: var(--claude-bg-tertiary) !important;
      transform: translateX(6px) !important;
      box-shadow: 0 2px 8px var(--claude-shadow) !important;
    }
    .side-nav-action-button:active, .conversation:active {
      transform: translateX(4px) scale(0.98) !important;
    }
    .conversation.selected {
      background: var(--claude-bg-tertiary) !important;
      border-left: 3px solid var(--claude-primary) !important;
      font-weight: 600 !important;
    }

    /* 消息 - 淡入效果 */
    .message-content, message-content {
      background: white !important;
      border: 1px solid var(--claude-border) !important;
      border-radius: 16px !important;
      padding: 20px !important;
      margin: 20px 0 !important;
      box-shadow: 0 1px 3px var(--claude-shadow) !important;
      animation: fadeInUp 0.4s ease-out !important;
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* 输入框 - 焦点效果 */
    .input-area-container {
      background: white !important;
      border: 2px solid var(--claude-border) !important;
      border-radius: 20px !important;
      padding: 12px 16px !important;
      box-shadow: 0 2px 8px var(--claude-shadow) !important;
      transition: all 0.3s ease !important;
    }
    .input-area-container:focus-within {
      border-color: var(--claude-primary) !important;
      box-shadow: 0 0 0 4px var(--claude-shadow), 0 4px 12px var(--claude-shadow-md) !important;
      transform: translateY(-2px) !important;
    }

    /* 按钮 - 悬停/点击效果 */
    .mat-mdc-button, button[mat-button] {
      background: var(--claude-primary) !important;
      color: white !important;
      border-radius: 12px !important;
      padding: 10px 20px !important;
      font-weight: 600 !important;
      box-shadow: 0 2px 6px var(--claude-shadow) !important;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }
    .mat-mdc-button:hover {
      background: var(--claude-primary-dark) !important;
      transform: translateY(-3px) !important;
      box-shadow: 0 6px 16px var(--claude-shadow-md) !important;
    }
    .mat-mdc-button:active {
      transform: translateY(-1px) scale(0.98) !important;
      box-shadow: 0 2px 8px var(--claude-shadow) !important;
    }

    /* 发送按钮 - 脉冲效果 */
    .send-button {
      background: var(--claude-primary) !important;
      border-radius: 50% !important;
      width: 44px !important;
      height: 44px !important;
      transition: all 0.3s ease !important;
    }
    .send-button:hover:not([disabled]) {
      background: var(--claude-primary-dark) !important;
      transform: scale(1.15) rotate(5deg) !important;
      box-shadow: 0 4px 12px var(--claude-shadow-md) !important;
    }
    .send-button:active:not([disabled]) {
      transform: scale(1.05) !important;
    }
    .send-button[disabled] {
      background: var(--claude-border) !important;
      opacity: 0.5 !important;
      cursor: not-allowed !important;
    }

    /* 卡片 - 悬停效果 */
    .intent-card, .card, mat-card {
      background: white !important;
      border: 2px solid var(--claude-border) !important;
      border-radius: 14px !important;
      padding: 16px !important;
      box-shadow: 0 2px 6px var(--claude-shadow) !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      cursor: pointer !important;
    }
    .intent-card:hover, .card:hover {
      border-color: var(--claude-primary) !important;
      box-shadow: 0 8px 20px var(--claude-shadow-md) !important;
      transform: translateY(-6px) scale(1.03) !important;
    }
    .intent-card:active, .card:active {
      transform: translateY(-3px) scale(1.01) !important;
    }

    /* 链接 - 下划线动画 */
    a {
      color: var(--claude-primary) !important;
      text-decoration: none !important;
      position: relative !important;
      transition: color 0.2s ease !important;
    }
    a::after {
      content: '' !important;
      position: absolute !important;
      bottom: -2px !important;
      left: 0 !important;
      width: 0 !important;
      height: 2px !important;
      background: var(--claude-primary-dark) !important;
      transition: width 0.3s ease !important;
    }
    a:hover::after {
      width: 100% !important;
    }

    /* 滚动条 - 平滑过渡 */
    ::-webkit-scrollbar { width: 10px !important; }
    ::-webkit-scrollbar-track { background: var(--claude-bg-secondary) !important; }
    ::-webkit-scrollbar-thumb {
      background: var(--claude-primary) !important;
      border-radius: 5px !important;
      transition: background 0.2s ease !important;
    }
    ::-webkit-scrollbar-thumb:hover { background: var(--claude-primary-dark) !important; }

    /* 字体 */
    h1, h2, h3, h4, h5, h6 { font-family: 'Georgia', serif !important; font-weight: 600 !important; }
    body, p, div, span { font-family: 'Inter', Arial, sans-serif !important; font-size: 16px !important; line-height: 1.6 !important; }
    code, pre { font-family: 'Fira Code', monospace !important; background: var(--claude-bg-secondary) !important; padding: 2px 6px !important; border-radius: 4px !important; }
  `;

  const BTN_CSS = `
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
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }
    #claude-toggle:hover {
      background: var(--claude-primary-dark) !important;
      transform: translateY(-3px) scale(1.05) !important;
      box-shadow: 0 6px 16px var(--claude-shadow-md) !important;
    }
    #claude-toggle:active {
      transform: translateY(-1px) scale(1.02) !important;
    }
    #claude-toggle.off { background: #9CA3AF !important; }
  `;

  let on = GM_getValue('claude_on', false);
  let style, btnStyle, btn;

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
    if (!style) {
      style = document.createElement('style');
      style.textContent = CSS;
      (document.head || document.documentElement).appendChild(style);
    }
  }

  function remove() {
    style?.remove();
    style = null;
  }

  function init() {
    if (on) apply();
    const create = () => {
      if (!document.body) return setTimeout(create, 100);
      if (!btnStyle) {
        btnStyle = document.createElement('style');
        btnStyle.textContent = BTN_CSS;
        document.head.appendChild(btnStyle);
      }
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
        setTimeout(() => { if (on && !style) apply(); }, 800);
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
