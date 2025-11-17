// ==UserScript==
// @name         Gemini 仿 Claude 风格转换插件
// @namespace    https://github.com/XXX/
// @version      1.9.8
// @description  v1.9.8: 修复mat-menu弹出菜单样式,统一Claude风格
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
      --color-primary: #c96442 !important;
      --color-primary-dark: #b05730 !important;
      --color-bg: #faf9f5 !important;
      --color-bg-secondary: #e9e6dc !important;
      --color-bg-tertiary: #dad5c9 !important;
      --color-fg: #3d3929 !important;
      --color-fg-muted: #83827d !important;
      --color-border: #dad9d4 !important;
      --color-input: #b4b2a7 !important;
      --color-card: #ffffff !important;
      --color-shadow: rgba(201, 100, 66, 0.1) !important;
      --color-shadow-md: rgba(201, 100, 66, 0.15) !important;
      --bard-sidenav-open-width: 280px;
      --scrollbar-thumb: rgba(201, 100, 66, 0.4);
      --scrollbar-thumb-hover: rgba(201, 100, 66, 0.7);
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --color-primary: #d97757 !important;
        --color-primary-dark: #b05730 !important;
        --color-bg: #262624 !important;
        --color-bg-secondary: #1b1b19 !important;
        --color-bg-tertiary: #2f2f2a !important;
        --color-fg: #c3c0b6 !important;
        --color-fg-muted: #b7b5a9 !important;
        --color-border: #3e3e38 !important;
        --color-input: #52514a !important;
        --color-card: #2d2d2b !important;
        --color-shadow: rgba(217, 119, 87, 0.1) !important;
        --color-shadow-md: rgba(217, 119, 87, 0.15) !important;
        --scrollbar-thumb: rgba(217, 119, 87, 0.4);
        --scrollbar-thumb-hover: rgba(217, 119, 87, 0.7);
      }
    }

    .input-gradient, input-container.input-gradient {
      background: transparent !important;
      background-image: none !important;
    }

    .input-gradient::before, .input-gradient::after,
    input-container.input-gradient::before, input-container.input-gradient::after {
      content: none !important;
      display: none !important;
    }

    .top-gradient-container .top-gradient {
      background: linear-gradient(to bottom, var(--color-bg-secondary), transparent) !important;
    }

    .bottom-gradient-container .bottom-gradient {
      background: linear-gradient(to top, var(--color-bg-secondary), transparent) !important;
    }

    body, html, bard-app, chat-app, main, chat-window, zero-state-v2 {
      background: var(--color-bg) !important;
      color: var(--color-fg) !important;
    }

    .top-bar-actions, header, mat-toolbar {
      background: var(--color-card) !important;
      border-bottom: 1px solid var(--color-border) !important;
      box-shadow: 0 1px 3px var(--color-shadow) !important;
    }

    .chat-container {
      padding: 32px 24px !important;
    }

    .chat-history {
      padding: 0 24px 0 0 !important;
    }

    infinite-scroller {
      padding-bottom: 140px !important;
    }

    .conversation-container {
      max-width: 900px !important;
      margin: 0 auto !important;
    }

    conversations-list[data-test-id="all-conversations"] {
      margin-top: 10px !important;
    }

    conversations-list .title-container .title {
      margin: 0px !important;
    }

    bard-sidenav, side-navigation-v2, mat-sidenav {
      background: var(--color-bg-secondary) !important;
    }

    .input-area-container, input-area-v2, .text-input-field {
      max-width: 900px !important;
      margin: 0 auto !important;
    }

    .side-nav-action-button, .conversation, .nav-item {
      background: transparent !important;
      border-radius: 10px !important;
      padding: 3px 31px 10px 12px !important;
      margin: 4px 8px !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }

    .side-nav-action-button {
      margin: 0 !important;
      padding-left: 10px !important;
    }

    .conversation-items-container {
      display: flex !important;
      align-items: center !important;
    }

    .conversation {
      flex: 1 !important;
      min-width: 0 !important;
    }

    .side-nav-action-button:hover, .conversation:hover {
      background: var(--color-bg-tertiary) !important;
      transform: translateX(6px) !important;
      box-shadow: 0 2px 8px var(--color-shadow) !important;
    }

    .conversation.selected {
      background: var(--color-bg-tertiary) !important;
      border-left: 3px solid var(--color-primary) !important;
      font-weight: 600 !important;
    }

    user-query,
    .user-query-container,
    .user-query-bubble-container {
      display: block !important;
      width: 100% !important;
    }

    .user-query-bubble-with-background {
      display: block !important;
      background: var(--color-card) !important;
      border: 1px solid var(--color-border) !important;
      border-radius: 16px !important;
      padding: 28px 36px !important;
      box-shadow: 0 1px 3px var(--color-shadow) !important;
    }

    .query-text,
    .query-text-line {
      font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif !important;
      font-size: 18px !important;
      font-weight: 400 !important;
      line-height: 1.75 !important;
      color: var(--color-fg) !important;
    }

    .message-content, message-content {
      width: 100% !important;
      box-sizing: border-box !important;
      background: var(--color-card) !important;
      border: 1px solid var(--color-border) !important;
      border-radius: 16px !important;
      padding: 28px 36px !important;
      margin: 0 !important;
      box-shadow: 0 1px 3px var(--color-shadow) !important;
      animation: fadeInUp 0.4s ease-out !important;
    }

    .markdown {
      padding: 0 4px !important;
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .input-area-container, input-area-v2 .text-input-field {
      background: var(--color-card) !important;
      border: 2px solid var(--color-border) !important;
      border-radius: 20px !important;
      padding: 12px 16px !important;
      box-shadow: 0 2px 8px var(--color-shadow) !important;
      transition: all 0.3s ease !important;
    }

    .input-area-container:focus-within, input-area-v2:focus-within {
      border-color: var(--color-primary) !important;
      box-shadow: 0 0 0 4px var(--color-shadow), 0 4px 12px var(--color-shadow-md) !important;
      transform: translateY(-2px) !important;
    }

    .mat-mdc-button, button[mat-button] {
      background: var(--color-primary) !important;
      color: white !important;
      border-radius: 12px !important;
      padding: 10px 20px !important;
      font-weight: 600 !important;
      box-shadow: 0 2px 6px var(--color-shadow) !important;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }

    .mat-mdc-button:hover {
      background: var(--color-primary-dark) !important;
      transform: translateY(-3px) !important;
      box-shadow: 0 6px 16px var(--color-shadow-md) !important;
    }

    .send-button {
      background: var(--color-primary) !important;
      border-radius: 50% !important;
      width: 44px !important;
      height: 44px !important;
      transition: all 0.3s ease !important;
    }

    .send-button:hover:not([disabled]) {
      background: var(--color-primary-dark) !important;
      transform: scale(1.15) rotate(5deg) !important;
      box-shadow: 0 4px 12px var(--color-shadow-md) !important;
    }

    .send-button[disabled] {
      background: var(--color-border) !important;
      opacity: 0.5 !important;
    }

    .intent-card, .card, mat-card {
      background: var(--color-card) !important;
      border: 2px solid var(--color-border) !important;
      border-radius: 14px !important;
      padding: 16px !important;
      box-shadow: 0 2px 6px var(--color-shadow) !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }

    .intent-card:hover, .card:hover {
      border-color: var(--color-primary) !important;
      box-shadow: 0 8px 20px var(--color-shadow-md) !important;
      transform: translateY(-6px) scale(1.03) !important;
    }

    .avatar-gutter {
      display: none !important;
    }

    .response-container {
      padding-bottom: 0 !important;
    }

    .response-container-content {
      padding-top: 0 !important;
    }

    model-thoughts, .model-thoughts {
      display: block !important;
      width: 100% !important;
      box-sizing: border-box !important;
      background: var(--color-bg-secondary) !important;
      border: 1px solid var(--color-border) !important;
      border-radius: 12px 12px 0 0 !important;
      padding: 16px !important;
      margin: 0 !important;
    }

    model-thoughts message-content, model-thoughts .message-content {
      background: transparent !important;
      border: none !important;
      border-radius: 0 !important;
      padding: 0 !important;
      margin: 0 !important;
      box-shadow: none !important;
      animation: none !important;
    }

    .thoughts-content {
      color: var(--color-fg-muted) !important;
      margin-top: 12px !important;
    }

    message-content.has-thoughts {
      border-radius: 0 0 16px 16px !important;
      border-top: none !important;
      margin: 0 !important;
    }

    .actions-container-v2, .buttons-container-v2 {
      opacity: 1 !important;
      visibility: visible !important;
      display: flex !important;
      background: transparent !important;
      margin: 12px 0 !important;
    }

    .buttons-container-v2 {
      padding-left: 12px !important;
    }

    .buttons-container-v2::before {
      display: none !important;
    }

    message-actions button, message-actions .mat-mdc-icon-button, message-actions .mat-mdc-button {
      margin: 0 4px !important;
      border-radius: 8px !important;
      transition: all 0.2s ease !important;
    }

    message-actions button:hover, message-actions .mat-mdc-icon-button:hover, message-actions .mat-mdc-button:hover {
      background: var(--color-bg-tertiary) !important;
    }

    code-block, .code-block {
      display: block !important;
      background: var(--color-bg-secondary) !important;
      border: 1px solid var(--color-border) !important;
      border-radius: 8px !important;
      overflow: hidden !important;
      margin: 16px 0 !important;
    }

    .code-block-decoration {
      background: var(--color-bg-tertiary) !important;
      padding: 8px 16px !important;
      border-bottom: 1px solid var(--color-border) !important;
    }

    table-block, .table-block {
      display: block !important;
      margin: 16px 0 !important;
    }

    .table-content table {
      border-radius: 8px !important;
      overflow: hidden !important;
    }

    .table-content thead td {
      background: var(--color-bg-secondary) !important;
    }

    pre, .highlight {
      background: var(--color-bg-secondary) !important;
      border: 1px solid var(--color-border) !important;
      border-radius: 8px !important;
      padding: 16px !important;
      margin: 16px 0 !important;
      overflow-x: auto !important;
      font-family: 'Fira Code', 'Consolas', monospace !important;
      font-size: 14px !important;
      line-height: 1.6 !important;
    }

    code {
      background: var(--color-bg-secondary) !important;
      color: var(--color-fg) !important;
      padding: 2px 6px !important;
      border-radius: 4px !important;
      font-family: 'Fira Code', 'Consolas', monospace !important;
      font-size: 14px !important;
    }

    pre code {
      background: transparent !important;
      padding: 0 !important;
    }

    blockquote {
      border-left: 4px solid var(--color-primary) !important;
      background: var(--color-bg-secondary) !important;
      padding: 12px 16px !important;
      margin: 16px 0 !important;
      border-radius: 0 8px 8px 0 !important;
      color: var(--color-fg-muted) !important;
      font-style: italic !important;
    }

    ul, ol {
      padding-left: 24px !important;
      margin: 12px 0 !important;
    }

    li {
      margin: 8px 0 !important;
      line-height: 1.75 !important;
    }

    ul li::marker, ol li::marker {
      color: var(--color-primary) !important;
      font-weight: 600 !important;
    }

    table {
      width: 100% !important;
      border-collapse: collapse !important;
      margin: 16px 0 !important;
      background: var(--color-card) !important;
      border-radius: 8px !important;
      overflow: hidden !important;
      box-shadow: 0 1px 3px var(--color-shadow) !important;
    }

    th {
      background: var(--color-bg-secondary) !important;
      color: var(--color-fg) !important;
      font-weight: 600 !important;
      padding: 12px !important;
      text-align: left !important;
      border-bottom: 2px solid var(--color-border) !important;
    }

    td {
      padding: 12px !important;
      border-bottom: 1px solid var(--color-border) !important;
    }

    tr:last-child td {
      border-bottom: none !important;
    }

    tr:hover {
      background: var(--color-bg) !important;
    }

    hr {
      border: none !important;
      border-top: 2px solid var(--color-border) !important;
      margin: 24px 0 !important;
    }

    a {
      color: var(--color-primary) !important;
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
      background: var(--color-primary-dark) !important;
      transition: width 0.3s ease !important;
    }

    a:hover::after {
      width: 100% !important;
    }

    infinite-scroller::-webkit-scrollbar {
      width: 10px !important;
    }

    infinite-scroller::-webkit-scrollbar-track {
      background: transparent !important;
    }

    infinite-scroller::-webkit-scrollbar-thumb {
      background: var(--scrollbar-thumb) !important;
      border-radius: 5px !important;
    }

    infinite-scroller::-webkit-scrollbar-thumb:hover {
      background: var(--scrollbar-thumb-hover) !important;
    }

    h1, h2, h3, h4, h5, h6, .user-greeting-text, .conversation-title, .gds-headline-l, .gds-headline-m, .gds-headline-s {
      font-family: 'Georgia', 'Times New Roman', serif !important;
      font-weight: 600 !important;
      line-height: 1.4 !important;
      margin: 20px 0 12px !important;
    }

    body, p, div, span, .message-content, .ql-editor, .model-response-text, .gds-body-l, .gds-body-m {
      font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif !important;
      font-size: 18px !important;
      font-weight: 400 !important;
      line-height: 1.75 !important;
    }

    code, pre, .code-block, .highlight, .ql-code-block, .ql-syntax {
      font-family: 'Fira Code', 'Consolas', 'Monaco', monospace !important;
    }

    button, input, textarea, select {
      font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif !important;
      font-size: 14px !important;
      font-weight: 500 !important;
    }

    mat-icon, .material-icons, .google-symbols {
      font-family: 'Material Icons', 'Google Symbols' !important;
    }

    bot-list, bot-list-item, .bots-list-container {
      background: var(--color-bg-secondary) !important;
    }

    .cdk-overlay-container {
      z-index: 10000 !important;
    }

    .cdk-overlay-backdrop {
      background: rgba(0, 0, 0, 0.3) !important;
    }

    .mat-mdc-menu-panel {
      background: var(--color-card) !important;
      border: 1px solid var(--color-border) !important;
      border-radius: 12px !important;
      box-shadow: 0 4px 16px var(--color-shadow-md) !important;
      padding: 8px 0 !important;
      min-width: 200px !important;
    }

    .mat-mdc-menu-content {
      padding: 0 !important;
    }

    .mat-mdc-menu-item {
      background: transparent !important;
      color: var(--color-fg) !important;
      padding: 12px 16px !important;
      min-height: 48px !important;
      transition: all 0.2s ease !important;
      border-radius: 0 !important;
    }

    .mat-mdc-menu-item:hover,
    .mat-mdc-menu-item-highlighted {
      background: var(--color-bg-tertiary) !important;
      color: var(--color-fg) !important;
    }

    .mat-mdc-menu-item .mat-icon {
      color: var(--color-fg-muted) !important;
      margin-right: 12px !important;
    }

    .mat-mdc-menu-item:hover .mat-icon,
    .mat-mdc-menu-item-highlighted .mat-icon {
      color: var(--color-primary) !important;
    }

    .mat-mdc-menu-submenu-icon {
      fill: var(--color-fg-muted) !important;
    }

    .mat-mdc-menu-item:hover .mat-mdc-menu-submenu-icon {
      fill: var(--color-primary) !important;
    }
  `;

  const BTN_CSS = `
    #claude-toggle {
      position: fixed !important;
      top: 80px !important;
      right: 20px !important;
      z-index: 9999 !important;
      background: var(--color-primary) !important;
      color: white !important;
      border: none !important;
      border-radius: 12px !important;
      padding: 10px 16px !important;
      font-size: 13px !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      box-shadow: 0 2px 8px var(--color-shadow) !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }

    #claude-toggle:hover {
      background: var(--color-primary-dark) !important;
      transform: translateY(-3px) scale(1.05) !important;
      box-shadow: 0 6px 16px var(--color-shadow-md) !important;
    }

    #claude-toggle.off {
      background: #9CA3AF !important;
    }
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
    document.readyState === 'loading'
      ? document.addEventListener('DOMContentLoaded', () => setTimeout(create, 300))
      : setTimeout(create, 300);

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
