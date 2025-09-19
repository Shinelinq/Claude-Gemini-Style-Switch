// ==UserScript==
// @name         Gemini 仿 Claude 风格字体转换插件
// @namespace    https://github.com/XXX/
// @version      1.6.5
// @description  Claude 风格字体与主题变量 + 侧栏与正文背景统一；支持一键开关、修复刷新后按钮缺失（更大&更粗字体）
// @author       Claude Assistant
// @match        https://gemini.google.com/*
// @match        https://*.gemini.google.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @run-at       document-start
// @license      MIT
// ==/UserScript==

(function () {
  'use strict';

  // ========= Claude 主题变量（含字号/字重控制：更大&更粗） =========
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

  /* —— 更大&更粗：你喜欢的手感 —— */
  --font-size-base: 16.5px;    /* 想再大一点可改 17px */
  --font-weight-text: 500;     /* 400 常规，500 微加粗 */
  --font-weight-strong: 600;   /* strong/b 字重 */
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
  let sidebarStyleElement = null;
  let mainContentStyleElement = null;
  let toggleButton = null;
  let menuCommandId = null;

  // ========= 主样式（更大&更粗） =========
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
h1 { line-height: 1.25 !important; font-weight: 700 !important; }
h2 { line-height: 1.28 !important; font-weight: 650 !important; }
h3 { line-height: 1.30 !important; font-weight: 600 !important; }
h4, h5, h6 { line-height: 1.35 !important; font-weight: 600 !important; }
p, li { font-size: calc(var(--font-size-base) * 1.02) !important; }
strong, b { font-weight: var(--font-weight-strong) !important; }
code, pre, .code, [class*="code"], [class*="mono"],
.highlight, .language-*, textarea[class*="code"],
div[class*="code"], span[class*="code"] {
  font-family: ${CONFIG.codeFont} !important;
}
button, input[type="button"], input[type="submit"], input[type="reset"],
[role="button"], [class*="button"], [class*="btn"],
[class*="icon"], [class*="material"], [aria-label],
svg, img, .mdc-*, [class*="mdc-"], [data-*="button"] {
  font-family: inherit !important;
}
[lang="zh"], [lang="zh-CN"], [lang="zh-TW"] {
  font-family: ${CONFIG.claudeFont}, "Microsoft YaHei", "微软雅黑", "SimSun", "宋体" !important;
}
`;

  // ========= 侧栏主题补丁 =========
  const SIDEBAR_CSS = `
:is(aside, nav)[class*="sidebar" i],
[aria-label*="sidebar" i], [aria-label*="侧边" i],
[role="navigation"][class], [class*="side-nav" i],
[class*="leftnav" i], [class*="left-nav" i] {
  background: var(--sidebar) !important;
  color: var(--sidebar-foreground) !important;
  border-right: 1px solid var(--sidebar-border) !important;
}
:is(aside, nav)[class*="sidebar" i] h1, :is(aside, nav)[class*="sidebar" i] h2,
:is(aside, nav)[class*="sidebar" i] h3, [aria-label*="sidebar" i] h1,
[aria-label*="sidebar" i] h2, [aria-label*="sidebar" i] h3 {
  color: var(--sidebar-foreground) !important;
  font-weight: 650 !important;
}
:is(aside, nav)[class*="sidebar" i] a, :is(aside, nav)[class*="sidebar" i] button,
[aria-label*="sidebar" i] a, [aria-label*="sidebar" i] button,
[class*="side-nav" i] a, [class*="side-nav" i] button,
[class*="leftnav" i] a, [class*="leftnav" i] button,
[class*="left-nav" i] a, [class*="left-nav" i] button {
  color: var(--sidebar-foreground) !important;
  border-radius: var(--radius) !important;
}
:is(aside, nav)[class*="sidebar" i] a:hover, :is(aside, nav)[class*="sidebar" i] button:hover,
[aria-label*="sidebar" i] a:hover, [aria-label*="sidebar" i] button:hover {
  background: var(--sidebar-accent) !important;
  color: var(--sidebar-accent-foreground) !important;
}
:is(aside, nav)[class*="sidebar" i] [aria-current], :is(aside, nav)[class*="sidebar" i] .active,
[aria-label*="sidebar" i] [aria-current], [aria-label*="sidebar" i] .active {
  background: var(--sidebar-primary) !important;
  color: var(--sidebar-primary-foreground) !important;
}
:is(aside, nav)[class*="sidebar" i] svg, [aria-label*="sidebar" i] svg { fill: currentColor !important; color: currentColor !important; }
:is(aside, nav)[class*="sidebar" i] hr, [aria-label*="sidebar" i] hr { border-color: var(--sidebar-border) !important; opacity: .8 !important; }
`;

  // ========= 正文区域背景补丁 (增强版) =========
  const MAIN_CONTENT_CSS = `
/* 1. 设置整体对话区域的背景色 */
.chat-container {
    background-color: var(--background) !important;
}

/* 2. 移除底部输入框区域的独立背景，使其与上层融合 */
input-container,
/* 同时处理输入框本身可能存在的背景 */
rich-textarea > div {
    background: transparent !important;
    background-color: transparent !important;
}

/* 3. 移除对话气泡的独立背景和阴影，实现 Claude 的无边界感 */
model-response,
user-request,
response-container,
[class*="response-container"] { /* 通用规则，以防万一 */
    background: transparent !important;
    background-color: transparent !important;
    box-shadow: none !important;
}
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
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif !important;
  min-width: 92px !important;
  text-align: center !important;
  user-select: none !important;
  white-space: nowrap !important;
  line-height: 1.2 !important;
}
#claude-font-toggle:hover{ transform: translateY(-1px) !important; box-shadow: var(--shadow-md) !important; }
#claude-font-toggle:active{ transform: translateY(0) !important; }
#claude-font-toggle.disabled{
  background: linear-gradient(135deg, var(--muted), color-mix(in oklch, var(--muted) 80%, black)) !important;
  color: var(--muted-foreground) !important;
}
@media (max-width: 768px){
  #claude-font-toggle{
    top: 70px !important; right: 14px !important; padding: 6px 10px !important;
    font-size: 11px !important; min-width: 78px !important;
  }
}
`;

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
      position: fixed !important; top: 130px !important; right: 20px !important;
      z-index: 2147483647 !important; background: color-mix(in oklch, var(--popover) 86%, black) !important;
      color: var(--popover-foreground) !important; padding: 8px 12px !important; border-radius: 8px !important;
      font-size: 13px !important; font-family: system-ui, -apple-system, sans-serif !important;
      box-shadow: var(--shadow-md) !important; opacity: 0 !important;
      transition: opacity 0.25s ease !important; max-width: 240px !important;
      white-space: nowrap !important; line-height: 1.3 !important; pointer-events: none !important;
    `;
    document.body.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
    });
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 260);
    }, 1800);
  }

  // ========= 菜单 =========
  function registerMenuCommand() {
    if (menuCommandId) {
      GM_unregisterMenuCommand(menuCommandId);
    }
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
    if (!sidebarStyleElement) {
      sidebarStyleElement = document.createElement('style');
      sidebarStyleElement.id = 'claude-sidebar-style';
      sidebarStyleElement.textContent = SIDEBAR_CSS;
      (document.head || document.documentElement).appendChild(sidebarStyleElement);
    }
    if (!mainContentStyleElement) {
        mainContentStyleElement = document.createElement('style');
        mainContentStyleElement.id = 'claude-main-content-style';
        mainContentStyleElement.textContent = MAIN_CONTENT_CSS;
        (document.head || document.documentElement).appendChild(mainContentStyleElement);
    }
    console.log('✅ 主题、字体、侧栏与正文背景已应用');
  }

  function removeClaudeFont() {
    if (styleElement) { styleElement.remove(); styleElement = null; }
    if (themeElement) { themeElement.remove(); themeElement = null; }
    if (sidebarStyleElement) { sidebarStyleElement.remove(); sidebarStyleElement = null; }
    if (mainContentStyleElement) { mainContentStyleElement.remove(); mainContentStyleElement = null; }
    console.log('❌ Claude 字体和主题色已移除');
  }

  // ========= 切换 =========
  function toggleFont() {
    isEnabled = !isEnabled;
    GM_setValue(CONFIG.storageKey, isEnabled);

    if (isEnabled) {
      applyClaudeFont();
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

    // 监听 SPA URL 变化
    let lastUrl = location.href;
    const urlObs = new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        setTimeout(() => {
          if (!document.getElementById('claude-font-toggle')) createToggleButton();
          if (isEnabled && !styleElement) applyClaudeFont();
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
  });

  // ========= 启动 =========
  init();

  // ========= 控制台调试接口 =========
  window.ClaudeFontToggler = {
    toggle: toggleFont,
    enable: () => { if (!isEnabled) toggleFont(); },
    disable: () => { if (isEnabled) toggleFont(); },
    status: () => isEnabled,
    version: '1.6.8'
  };
})();