// ==UserScript==
// @name         Gemini 仿 Claude 风格转换插件
// @namespace    https://github.com/XXX/
// @version      1.2.3
// @description  将 Gemini 官网界面变成 Claude 风格：衬线字体与主题色
// @author       Claude Assistant
// @match        https://gemini.google.com/*
// @match        https://*.gemini.google.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-end
// @license      MIT
// @noframes
// ==/UserScript==

(function () {
  'use strict';

  // ===== 样式变量与主题色 =====
  const THEME_CSS = `
    :root {
      /* 颜色系统 */
      --claude-primary: #D97706 !important;  /* 主色 */
      --claude-primary-hover: #B45309 !important;  /* 主色悬停 */
      --claude-primary-active: #92400E !important;  /* 主色点击 */
      --claude-primary-light: #FED7AA !important;  /* 主色浅色 */
      --claude-primary-focus: rgba(217, 119, 6, 0.15) !important;  /* 主色焦点 */

      --claude-bg-primary: #FFFBF5 !important;  /* 背景色 */
      --claude-bg-secondary: #FEF7ED !important;  /* 辅助背景 */
      --claude-bg-card: #FFFFFF !important;  /* 卡片背景 */
      --claude-bg-nav: #fdf9f0 !important;  /* 导航栏背景 */
      --claude-bg-divider: #F3E8DB !important;  /* 分隔线背景 */

      --claude-text-primary: #1F2937 !important;  /* 主要文字色 */
      --claude-text-secondary: #6B7280 !important;  /* 次要文字色 */
      --claude-text-muted: #9CA3AF !important;  /* 淡文字色 */
      --claude-text-inverse: #FFFFFF !important;  /* 反转文字色 */

      --claude-success: #059669 !important;  /* 成功状态 */
      --claude-warning: #D97706 !important;  /* 警告状态 */
      --claude-error: #DC2626 !important;  /* 错误状态 */
      --claude-info: #2563EB !important;  /* 信息状态 */

      --claude-shadow: rgba(0, 0, 0, 0.08) !important;  /* 阴影 */
      --claude-shadow-hover: rgba(0, 0, 0, 0.12) !important;  /* 悬停阴影 */
      --claude-hover-mask: rgba(0, 0, 0, 0.05) !important;  /* 悬停遮罩 */

      /* 字体 */
      --claude-font-serif: 'Sitka Text', Georgia, 'Times New Roman', serif !important;
      --claude-font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
      --claude-font-code: 'Cascadia Code', Consolas, 'Courier New', monospace !important;

      /* 间距 */
      --claude-space-1: 4px !important;
      --claude-space-2: 8px !important;
      --claude-space-3: 12px !important;
      --claude-space-4: 16px !important;
      --claude-space-6: 24px !important;
      --claude-space-8: 32px !important;

      /* 圆角 */
      --claude-radius-sm: 6px !important;
      --claude-radius-md: 8px !important;
      --claude-radius-lg: 12px !important;
      --claude-radius-xl: 16px !important;

      /* 动画 */
      --claude-duration-fast: 150ms !important;
      --claude-duration-normal: 300ms !important;
      --claude-ease: cubic-bezier(0.4, 0, 0.2, 1) !important;
    }

    /* 应用主题色 */
    body {
      background-color: var(--claude-bg-primary) !important;
      color: var(--claude-text-primary) !important;
      font-family: var(--claude-font-sans) !important;
    }

    a, button {
      color: var(--claude-primary) !important;
    }

    /* 按钮样式 */
    button, .btn, .btn-primary {
      background-color: var(--claude-primary) !important;
      border: none !important;
      border-radius: var(--claude-radius-md) !important;
      color: var(--claude-text-inverse) !important;
      padding: var(--claude-space-2) var(--claude-space-4) !important;
      font-size: 16px !important;
      box-shadow: var(--claude-shadow) !important;
      cursor: pointer !important;
      transition: background-color var(--claude-duration-normal), box-shadow var(--claude-duration-normal) !important;
    }

    button:hover, .btn-primary:hover {
      background-color: var(--claude-primary-hover) !important;
      box-shadow: var(--claude-shadow-hover) !important;
    }

    button:active, .btn-primary:active {
      background-color: var(--claude-primary-active) !important;
    }

    /* 选中按钮样式 */
    .btn-primary.selected, .btn.selected {
      background-color: var(--claude-primary-light) !important;
      color: var(--claude-primary-foreground) !important;
      border: 2px solid var(--claude-primary) !important;
    }

    .card, .sidenav, .navbar, .sidebar {
      background-color: var(--claude-bg-card) !important;
    }

    .navbar, .sidebar {
      background-color: var(--claude-bg-nav) !important;
    }

    .text-muted {
      color: var(--claude-text-muted) !important;
    }

    .divider {
      background-color: var(--claude-bg-divider) !important;
    }
  `;

  // ===== 将 CSS 样式注入页面 =====
  function injectStyles() {
    if (!document.querySelector('#claude-theme-style')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'claude-theme-style';
      styleElement.textContent = THEME_CSS;
      document.head.appendChild(styleElement);
      console.log('✅ Claude 样式已注入');
    }
  }

  // ===== 页面加载完成后注入样式 =====
  window.addEventListener('load', () => {
    injectStyles();
  });

})();
