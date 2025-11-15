// ==UserScript==
// @name         Gemini 仿 Claude 风格转换插件
// @namespace    https://github.com/XXX/
// @version      1.4.0
// @description  将 Gemini 官网界面变成 Claude 风格：完整组件样式覆盖
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
      --claude-primary-light: #F59E0B !important;
      --claude-bg: #FFFBEB !important;
      --claude-bg-secondary: #FEF3C7 !important;
      --claude-bg-tertiary: #FDE68A !important;
      --claude-text: #78350F !important;
      --claude-text-muted: #92400E !important;
      --claude-border: #FDE68A !important;
      --claude-border-dark: #FCD34D !important;
      --claude-shadow: rgba(217, 119, 6, 0.1) !important;
      --claude-shadow-md: rgba(217, 119, 6, 0.15) !important;
      --claude-shadow-lg: rgba(217, 119, 6, 0.2) !important;
    }
  `;

  const GLOBAL_STYLES = `
    /* === 全局背景和文字 === */
    body,
    html,
    bard-app,
    chat-app,
    main,
    .app-container,
    .main-container {
      background: var(--claude-bg) !important;
      background-color: var(--claude-bg) !important;
      color: var(--claude-text) !important;
    }

    /* === 顶部栏 === */
    .top-bar-actions,
    .gb_T,
    header,
    mat-toolbar,
    .mat-toolbar {
      background: white !important;
      background-color: white !important;
      border-bottom: 1px solid var(--claude-border) !important;
      box-shadow: 0 1px 3px var(--claude-shadow) !important;
    }
  `;

  const SIDEBAR_STYLES = `
    /* === 侧边栏背景 === */
    bard-sidenav,
    side-navigation-v2,
    .side-nav-menu-button,
    .conversations-list-container,
    .sidenav-container,
    mat-sidenav,
    .mat-drawer {
      background: var(--claude-bg-secondary) !important;
      background-color: var(--claude-bg-secondary) !important;
    }

    /* === 侧边栏按钮 === */
    .side-nav-action-button,
    .conversation,
    .conversation-item,
    .nav-item {
      background: transparent !important;
      background-color: transparent !important;
      border-radius: 10px !important;
      padding: 10px 12px !important;
      margin: 4px 8px !important;
      transition: all 0.2s ease !important;
      cursor: pointer !important;
    }

    .side-nav-action-button:hover,
    .conversation:hover,
    .conversation-item:hover,
    .nav-item:hover {
      background: var(--claude-bg-tertiary) !important;
      background-color: var(--claude-bg-tertiary) !important;
      transform: translateX(4px) !important;
    }

    .conversation.selected,
    .conversation-item.selected,
    .nav-item.active {
      background: var(--claude-bg-tertiary) !important;
      background-color: var(--claude-bg-tertiary) !important;
      border-left: 3px solid var(--claude-primary) !important;
      font-weight: 600 !important;
    }
  `;

  const CHAT_STYLES = `
    /* === 聊天区域 === */
    .chat-container,
    .chat-history,
    .chat-history-scroll-container,
    .conversation-container {
      background: var(--claude-bg) !important;
      background-color: var(--claude-bg) !important;
      padding: 24px !important;
    }

    /* === 消息气泡 === */
    .message-content,
    message-content,
    .model-response-text,
    .user-query,
    .response-container {
      background: white !important;
      background-color: white !important;
      border: 1px solid var(--claude-border) !important;
      border-radius: 16px !important;
      padding: 20px !important;
      margin: 12px 0 !important;
      box-shadow: 0 1px 3px var(--claude-shadow) !important;
    }

    .model-response-text,
    .response-text {
      line-height: 1.7 !important;
      color: var(--claude-text) !important;
    }
  `;

  const INPUT_STYLES = `
    /* === 输入框容器 === */
    .input-area-container,
    .text-input-container,
    .input-container {
      background: white !important;
      background-color: white !important;
      border: 2px solid var(--claude-border) !important;
      border-radius: 20px !important;
      padding: 12px 16px !important;
      box-shadow: 0 2px 8px var(--claude-shadow) !important;
      transition: all 0.2s ease !important;
    }

    .input-area-container:focus-within,
    .text-input-container:focus-within,
    .input-container:focus-within {
      border-color: var(--claude-primary) !important;
      box-shadow: 0 0 0 4px var(--claude-shadow), 0 4px 12px var(--claude-shadow-md) !important;
    }

    /* === 输入框文本 === */
    .text-input-field,
    .ql-editor,
    .input-field,
    textarea.mat-input-element {
      background: transparent !important;
      background-color: transparent !important;
      color: var(--claude-text) !important;
      font-size: 16px !important;
      line-height: 1.6 !important;
      border: none !important;
    }
  `;

  const BUTTON_STYLES = `
    /* === 普通按钮 === */
    .mat-mdc-button,
    .mat-mdc-unelevated-button,
    .mat-mdc-raised-button,
    button[mat-button],
    button[mat-raised-button],
    button[mat-flat-button] {
      background: var(--claude-primary) !important;
      background-color: var(--claude-primary) !important;
      color: white !important;
      border: none !important;
      border-radius: 12px !important;
      padding: 10px 20px !important;
      font-weight: 600 !important;
      box-shadow: 0 2px 6px var(--claude-shadow) !important;
      transition: all 0.2s ease !important;
    }

    .mat-mdc-button:hover,
    .mat-mdc-unelevated-button:hover,
    .mat-mdc-raised-button:hover,
    button[mat-button]:hover {
      background: var(--claude-primary-dark) !important;
      background-color: var(--claude-primary-dark) !important;
      transform: translateY(-2px) !important;
      box-shadow: 0 4px 12px var(--claude-shadow-md) !important;
    }

    /* === 发送按钮 === */
    .send-button,
    button[aria-label*="Send"],
    button[aria-label*="发送"] {
      background: var(--claude-primary) !important;
      background-color: var(--claude-primary) !important;
      border-radius: 50% !important;
      width: 44px !important;
      height: 44px !important;
      min-width: 44px !important;
      padding: 0 !important;
    }

    .send-button:hover:not([aria-disabled="true"]),
    button[aria-label*="Send"]:hover:not([disabled]) {
      background: var(--claude-primary-dark) !important;
      background-color: var(--claude-primary-dark) !important;
      transform: scale(1.1) !important;
    }

    .send-button[aria-disabled="true"],
    .send-button[disabled],
    button[disabled] {
      background: var(--claude-border) !important;
      background-color: var(--claude-border) !important;
      opacity: 0.5 !important;
      cursor: not-allowed !important;
    }

    /* === 工具按钮 === */
    .upload-button,
    .toolbox-drawer-button,
    .speech_dictation_mic_button,
    button[aria-label*="Upload"],
    button[aria-label*="上传"] {
      background: transparent !important;
      background-color: transparent !important;
      border: 1px solid var(--claude-border) !important;
      border-radius: 10px !important;
      padding: 8px !important;
      transition: all 0.2s ease !important;
    }

    .upload-button:hover,
    .toolbox-drawer-button:hover,
    .speech_dictation_mic_button:hover {
      background: var(--claude-bg-tertiary) !important;
      background-color: var(--claude-bg-tertiary) !important;
      border-color: var(--claude-primary) !important;
    }
  `;

  const CARD_STYLES = `
    /* === 卡片 === */
    .intent-card,
    .card,
    intent-card,
    mat-card,
    .mat-card {
      background: white !important;
      background-color: white !important;
      border: 2px solid var(--claude-border) !important;
      border-radius: 14px !important;
      padding: 16px !important;
      box-shadow: 0 2px 6px var(--claude-shadow) !important;
      transition: all 0.2s ease !important;
      cursor: pointer !important;
    }

    .intent-card:hover,
    .card:hover,
    mat-card:hover,
    .mat-card:hover {
      border-color: var(--claude-primary) !important;
      box-shadow: 0 6px 16px var(--claude-shadow-md) !important;
      transform: translateY(-4px) scale(1.02) !important;
    }

    .card-label,
    .mat-card-title {
      font-weight: 600 !important;
      color: var(--claude-text) !important;
    }
  `;

  const MISC_STYLES = `
    /* === 链接 === */
    a {
      color: var(--claude-primary) !important;
      text-decoration: none !important;
      transition: color 0.2s ease !important;
    }

    a:hover {
      color: var(--claude-primary-dark) !important;
      text-decoration: underline !important;
    }

    /* === 图标 === */
    mat-icon,
    .material-icons,
    .google-symbols {
      color: var(--claude-text-muted) !important;
      transition: color 0.2s ease !important;
    }

    .mat-mdc-button mat-icon,
    .send-button mat-icon,
    button mat-icon {
      color: white !important;
    }

    /* === 滚动条 === */
    ::-webkit-scrollbar {
      width: 10px !important;
      height: 10px !important;
    }

    ::-webkit-scrollbar-track {
      background: var(--claude-bg-secondary) !important;
      border-radius: 5px !important;
    }

    ::-webkit-scrollbar-thumb {
      background: var(--claude-primary) !important;
      border-radius: 5px !important;
      border: 2px solid var(--claude-bg-secondary) !important;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: var(--claude-primary-dark) !important;
    }

    /* === 选中文本 === */
    ::selection {
      background: var(--claude-bg-tertiary) !important;
      color: var(--claude-text) !important;
    }

    /* === 焦点 === */
    *:focus-visible {
      outline: 2px solid var(--claude-primary) !important;
      outline-offset: 2px !important;
      border-radius: 4px !important;
    }
  `;

  const FONT_STYLES = `
    /* === 标题字体 === */
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

    /* === 正文字体 === */
    body, p, div, span,
    .message-content,
    .ql-editor,
    .model-response-text,
    .gds-body-l,
    .gds-body-m {
      font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif !important;
      font-size: 16px !important;
      font-weight: 400 !important;
      line-height: 1.6 !important;
    }

    /* === 代码字体 === */
    code, pre,
    .code-block,
    .highlight,
    .ql-code-block,
    .ql-syntax {
      font-family: 'Fira Code', 'Consolas', 'Monaco', monospace !important;
      font-size: 14px !important;
      line-height: 1.5 !important;
      background: var(--claude-bg-secondary) !important;
      padding: 2px 6px !important;
      border-radius: 4px !important;
    }

    /* === 按钮字体 === */
    button, input, textarea, select {
      font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif !important;
      font-size: 14px !important;
      font-weight: 500 !important;
    }

    /* === 图标字体保持不变 === */
    mat-icon,
    .material-icons,
    .google-symbols {
      font-family: 'Material Icons', 'Google Symbols' !important;
    }
  `;

  const TOGGLE_BUTTON_STYLES = `
    #claude-style-toggle {
      position: fixed !important;
      top: 80px !important;
      right: 20px !important;
      z-index: 2147483647 !important;
      background: var(--claude-primary) !important;
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
      font-family: 'Inter', Arial, sans-serif !important;
    }

    #claude-style-toggle:hover {
      background: var(--claude-primary-dark) !important;
      background-color: var(--claude-primary-dark) !important;
      transform: translateY(-2px) !important;
      box-shadow: 0 4px 12px var(--claude-shadow-md) !important;
    }

    #claude-style-toggle.disabled {
      background: #9CA3AF !important;
      background-color: #9CA3AF !important;
      color: #6B7280 !important;
    }
  `;

  // 合并所有样式
  const ALL_STYLES = 
    THEME_VARS +
    GLOBAL_STYLES +
    SIDEBAR_STYLES +
    CHAT_STYLES +
    INPUT_STYLES +
    BUTTON_STYLES +
    CARD_STYLES +
    MISC_STYLES +
    FONT_STYLES +
    TOGGLE_BUTTON_STYLES;

  let isEnabled = GM_getValue('gemini_claude_style_enabled', false);
  let styleElement = null;
  let toggleButton = null;

  function applyStyles() {
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'claude-style-override';
      styleElement.textContent = ALL_STYLES;
      (document.head || document.documentElement).appendChild(styleElement);
      console.log('✅ Claude 风格已应用');
    }
  }

  function removeStyles() {
    if (styleElement) {
      styleElement.remove();
      styleElement = null;
      console.log('❌ Claude 风格已移除');
    }
  }

  function toggleStyles() {
    isEnabled = !isEnabled;
    GM_setValue('gemini_claude_style_enabled', isEnabled);
    
    if (isEnabled) {
      applyStyles();
    } else {
      removeStyles();
    }
    
    updateButton();
    console.log(`[Claude Style] ${isEnabled ? '✅ 启用' : '❌ 禁用'}`);
  }

  function updateButton() {
    if (!toggleButton) return;
    toggleButton.textContent = isEnabled ? '🎨 Claude 风格' : '🔵 Gemini 风格';
    toggleButton.className = isEnabled ? '' : 'disabled';
    toggleButton.title = isEnabled ? '切换到 Gemini 风格' : '切换到 Claude 风格';
  }

  function createToggleButton() {
    if (toggleButton || !document.body) return;
    
    toggleButton = document.createElement('button');
    toggleButton.id = 'claude-style-toggle';
    toggleButton.textContent = isEnabled ? '🎨 Claude 风格' : '🔵 Gemini 风格';
    toggleButton.className = isEnabled ? '' : 'disabled';
    toggleButton.title = isEnabled ? '切换到 Gemini 风格' : '切换到 Claude 风格';
    toggleButton.addEventListener('click', toggleStyles);
    document.body.appendChild(toggleButton);
    
    console.log('✅ 切换按钮已创建');
  }

  function init() {
    console.log('🚀 Gemini → Claude 风格转换插件 v1.4.0 启动');
    
    // 应用初始样式
    if (isEnabled) {
      applyStyles();
    }
    
    // 创建切换按钮
    const tryCreateButton = () => {
      if (document.body) {
        createToggleButton();
      } else {
        setTimeout(tryCreateButton, 100);
      }
    };
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(tryCreateButton, 300);
      }, { once: true });
    } else {
      setTimeout(tryCreateButton, 300);
    }
    
    // 监听 URL 变化（SPA 应用）
    let lastUrl = location.href;
    const urlObserver = new MutationObserver(() => {
      const currentUrl = location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        setTimeout(() => {
          if (isEnabled && !styleElement) {
            applyStyles();
          }
        }, 800);
      }
    });
    urlObserver.observe(document, { subtree: true, childList: true });
    
    console.log(`✅ 初始化完成 - 当前状态: ${isEnabled ? 'Claude 风格' : 'Gemini 风格'}`);
  }

  // 启动插件
  init();

  // 快捷键切换（Ctrl+Shift+C）
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && (e.code === 'KeyC' || e.key === 'C')) {
      e.preventDefault();
      toggleStyles();
    }
  }, true);

})();
