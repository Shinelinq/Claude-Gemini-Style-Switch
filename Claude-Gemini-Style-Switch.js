// ==UserScript==
// @name         Gemini 仿 Claude 风格字体转换插件 1.5.1
// @namespace    https://github.com/XXXX/
// @version      1.5.1
// @description  为Gemini网页添加Claude官网字体，支持一键开关切换，并将欢迎词改为Claude主题色
// @author       Claude Assistant
// @match        https://gemini.google.com/*
// @match        https://*.gemini.google.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @run-at       document-start
// @updateURL
// @downloadURL
// ==/UserScript==

(function() {
    'use strict';

    // 配置选项
    const CONFIG = {
        // Claude官网字体栈
        claudeFont: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
        // 代码字体栈（保持等宽）
        codeFont: '"Courier New", Monaco, Consolas, "Liberation Mono", monospace',
        // Claude主题色
        claudeThemeColor: '#da7756',
        // 默认行高
        lineHeight: '1.7',
        // 存储键名
        storageKey: 'gemini_claude_font_enabled'
    };

    // 状态管理
    let isEnabled = GM_getValue(CONFIG.storageKey, false);
    let styleElement = null;
    let toggleButton = null;
    let menuCommandId = null;

    // CSS样式定义 - 排除按钮相关元素 + 欢迎词颜色修改
    const claudeFontCSS = `
        /* 主要字体替换 - 但排除特定元素 */
        body, p, div, span, article, section, h1, h2, h3, h4, h5, h6,
        main, aside, header, footer, nav, ul, li, ol, dl, dt, dd,
        table, thead, tbody, tr, td, th, caption,
        form, fieldset, legend, label, input[type="text"], input[type="email"],
        input[type="password"], input[type="search"], textarea, select, option {
            font-family: ${CONFIG.claudeFont} !important;
            line-height: ${CONFIG.lineHeight} !important;
        }

        /* 标题特殊行高 */
        h1, h2, h3, h4, h5, h6 {
            line-height: 1.3 !important;
        }

        /* 保持代码块的等宽字体 */
        code,
        pre,
        .code,
        [class*="code"],
        [class*="mono"],
        .highlight,
        .language-*,
        textarea[class*="code"],
        div[class*="code"],
        span[class*="code"] {
            font-family: ${CONFIG.codeFont} !important;
        }

        /* 排除所有按钮、图标、控件元素，避免影响UI */
        button,
        input[type="button"],
        input[type="submit"],
        input[type="reset"],
        [role="button"],
        [class*="button"],
        [class*="btn"],
        [class*="icon"],
        [class*="material"],
        [aria-label],
        svg,
        img,
        .mdc-*,
        [class*="mdc-"],
        [data-*="button"] {
            font-family: inherit !important;
        }

        /* 确保中文字符正确显示 */
        [lang="zh"], [lang="zh-CN"], [lang="zh-TW"] {
            font-family: ${CONFIG.claudeFont}, "Microsoft YaHei", "微软雅黑", "SimSun", "宋体" !important;
        }

        /* 欢迎词颜色修改 - 支持多语言 */
        /* 通过文本内容匹配各种语言的欢迎词 */
        *:not(button):not([role="button"]):not(svg):not(path):not([class*="icon"]) {
            /* 检测包含欢迎词的元素 */
        }

        /* 通用欢迎词样式 - 匹配包含用户名的问候语 */
        div[class*="greeting"],
        span[class*="greeting"],
        h1[class*="greeting"],
        h2[class*="greeting"],
        h3[class*="greeting"],
        [data-testid*="greeting"],
        [class*="welcome"],
        [class*="hello"],
        /* 主页面大标题区域 */
        main h1,
        main h2,
        main h3,
        [role="main"] h1,
        [role="main"] h2,
        [role="main"] h3 {
            color: ${CONFIG.claudeThemeColor} !important;
        }

        /* 更精确的选择器 - 针对Gemini的特定结构 */
        /* 主页面的欢迎标题 */
        div[class*="home"] h1,
        div[class*="welcome"] h1,
        div[class*="greeting"] h1,
        /* 包含逗号的文本（通常是"你好，用户名"格式） */
        *:not(button):not([role="button"]):not(svg):not(path):not([class*="icon"]):not(input):not(textarea) {
            /* 这里用JS动态检测和修改 */
        }
    `;

    // 欢迎词检测和颜色修改的JavaScript函数
    function applyWelcomeTextColor() {
        // 常见的欢迎词模式（支持多语言）
        const welcomePatterns = [
            /你好[，,\s]*([^，,\s\n]+)/i,        // 中文：你好，用户名
            /您好[，,\s]*([^，,\s\n]+)/i,        // 中文：您好，用户名
            /hi[，,\s]+([^，,\s\n]+)/i,          // 英文：Hi, 用户名
            /hello[，,\s]+([^，,\s\n]+)/i,       // 英文：Hello, 用户名
            /welcome[，,\s]+([^，,\s\n]+)/i,     // 英文：Welcome, 用户名
            /bonjour[，,\s]+([^，,\s\n]+)/i,     // 法文：Bonjour, 用户名
            /hola[，,\s]+([^，,\s\n]+)/i,        // 西班牙文：Hola, 用户名
            /ciao[，,\s]+([^，,\s\n]+)/i,        // 意大利文：Ciao, 用户名
            /guten\s+tag[，,\s]+([^，,\s\n]+)/i, // 德文：Guten Tag, 用户名
            /こんにちは[，,\s]*([^，,\s\n]+)/i,    // 日文：こんにちは、用户名
            /안녕하세요[，,\s]*([^，,\s\n]+)/i     // 韩文：안녕하세요, 用户名
        ];

        // 搜索所有文本节点
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    // 排除脚本、样式、按钮等元素
                    const parent = node.parentElement;
                    if (!parent) return NodeFilter.FILTER_REJECT;

                    const tagName = parent.tagName.toLowerCase();
                    if (['script', 'style', 'button', 'svg', 'path'].includes(tagName)) {
                        return NodeFilter.FILTER_REJECT;
                    }

                    const className = parent.className || '';
                    if (className.includes('button') || className.includes('btn') || className.includes('icon')) {
                        return NodeFilter.FILTER_REJECT;
                    }

                    const role = parent.getAttribute('role');
                    if (role === 'button') {
                        return NodeFilter.FILTER_REJECT;
                    }

                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }

        // 检查每个文本节点是否包含欢迎词
        textNodes.forEach(textNode => {
            const text = textNode.textContent.trim();
            if (!text) return;

            // 检查是否匹配任何欢迎词模式
            const isWelcomeText = welcomePatterns.some(pattern => pattern.test(text));

            if (isWelcomeText) {
                const parent = textNode.parentElement;
                if (parent) {
                    // 应用Claude主题色
                    parent.style.setProperty('color', CONFIG.claudeThemeColor, 'important');
                    console.log('✅ 找到欢迎词并应用Claude主题色:', text);
                }
            }
        });

        // 也检查特定的元素选择器
        const welcomeSelectors = [
            'h1, h2, h3', // 主标题
            '[class*="welcome"]',
            '[class*="greeting"]',
            '[class*="hello"]',
            '[data-testid*="welcome"]',
            '[data-testid*="greeting"]',
            'main h1, main h2, main h3',
            '[role="main"] h1, [role="main"] h2, [role="main"] h3'
        ];

        welcomeSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    const text = element.textContent.trim();
                    if (!text) return;

                    const isWelcomeText = welcomePatterns.some(pattern => pattern.test(text));
                    if (isWelcomeText) {
                        element.style.setProperty('color', CONFIG.claudeThemeColor, 'important');
                        console.log('✅ 通过选择器找到欢迎词并应用Claude主题色:', text);
                    }
                });
            } catch (e) {
                // 忽略无效选择器错误
            }
        });
    }

    // 切换按钮样式 - 位置下调避免遮挡账户头像
    const buttonCSS = `
        #claude-font-toggle {
            position: fixed !important;
            top: 80px !important;
            right: 20px !important;
            z-index: 9999 !important;
            background: linear-gradient(135deg, #da7756, #bd5d3a) !important;
            color: white !important;
            border: none !important;
            border-radius: 20px !important;
            padding: 8px 14px !important;
            font-size: 12px !important;
            font-weight: 500 !important;
            cursor: pointer !important;
            box-shadow: 0 3px 10px rgba(218, 119, 86, 0.3) !important;
            transition: all 0.2s ease !important;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
            min-width: 85px !important;
            text-align: center !important;
            user-select: none !important;
            white-space: nowrap !important;
            line-height: 1.2 !important;
        }

        #claude-font-toggle:hover {
            background: linear-gradient(135deg, #c96a4a, #a54d32) !important;
            box-shadow: 0 4px 12px rgba(218, 119, 86, 0.4) !important;
            transform: translateY(-1px) !important;
        }

        #claude-font-toggle:active {
            transform: translateY(0) !important;
            box-shadow: 0 2px 6px rgba(218, 119, 86, 0.3) !important;
        }

        #claude-font-toggle.disabled {
            background: linear-gradient(135deg, #888, #666) !important;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2) !important;
        }

        #claude-font-toggle.disabled:hover {
            background: linear-gradient(135deg, #999, #777) !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25) !important;
        }

        /* 响应式设计 */
        @media (max-width: 768px) {
            #claude-font-toggle {
                top: 70px !important;
                right: 15px !important;
                padding: 6px 10px !important;
                font-size: 11px !important;
                min-width: 70px !important;
            }
        }

        /* 确保不影响Gemini原有按钮 */
        #claude-font-toggle * {
            font-family: inherit !important;
        }
    `;

    // 应用Claude字体和主题色
    function applyClaudeFont() {
        if (styleElement) return;

        styleElement = document.createElement('style');
        styleElement.id = 'claude-font-style';
        styleElement.textContent = claudeFontCSS;

        // 添加到head
        const target = document.head || document.documentElement;
        target.appendChild(styleElement);

        // 应用欢迎词颜色
        setTimeout(applyWelcomeTextColor, 500);

        console.log('✅ Claude字体和主题色已应用');
    }

    // 移除Claude字体和主题色
    function removeClaudeFont() {
        if (styleElement) {
            styleElement.remove();
            styleElement = null;

            // 移除欢迎词颜色修改
            restoreWelcomeTextColor();

            console.log('❌ Claude字体和主题色已移除');
        }
    }

    // 恢复欢迎词原始颜色
    function restoreWelcomeTextColor() {
        const elements = document.querySelectorAll('*[style*="color"]');
        elements.forEach(element => {
            const style = element.style.color;
            if (style && style.includes(CONFIG.claudeThemeColor)) {
                element.style.removeProperty('color');
            }
        });
    }

    // 创建切换按钮
    function createToggleButton() {
        if (toggleButton) return;

        // 先添加按钮样式
        const buttonStyle = document.createElement('style');
        buttonStyle.id = 'claude-font-button-style';
        buttonStyle.textContent = buttonCSS;
        (document.head || document.documentElement).appendChild(buttonStyle);

        // 创建按钮元素
        toggleButton = document.createElement('button');
        toggleButton.id = 'claude-font-toggle';

        // 设置按钮文本和状态
        updateButtonState();

        // 添加点击事件
        toggleButton.addEventListener('click', toggleFont);

        // 添加到页面
        document.body.appendChild(toggleButton);

        // 添加悬停提示
        let hoverTimeout;
        toggleButton.addEventListener('mouseenter', () => {
            hoverTimeout = setTimeout(() => {
                showToast(isEnabled ? 'Claude优雅衬线字体已启用' : '使用默认系统字体');
            }, 1000);
        });

        toggleButton.addEventListener('mouseleave', () => {
            clearTimeout(hoverTimeout);
        });

        console.log('✅ 切换按钮已创建');
    }

    // 更新按钮状态
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

    // 切换字体功能
    function toggleFont() {
        isEnabled = !isEnabled;
        GM_setValue(CONFIG.storageKey, isEnabled);

        if (isEnabled) {
            applyClaudeFont();
            showToast('✨ Claude字体和主题色已启用');
        } else {
            removeClaudeFont();
            showToast('   已切换到默认字体');
        }

        // 更新按钮状态
        updateButtonState();

        // 更新菜单命令
        registerMenuCommand();

        console.log(`   字体切换: ${isEnabled ? 'Claude字体+主题色' : '默认字体'}`);
    }

    // 显示提示消息
    function showToast(message) {
        // 移除现有的提示
        const existingToast = document.getElementById('claude-font-toast');
        if (existingToast) {
            existingToast.remove();
        }

        // 创建新提示
        const toast = document.createElement('div');
        toast.id = 'claude-font-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed !important;
            top: 130px !important;
            right: 20px !important;
            z-index: 10000 !important;
            background: rgba(0, 0, 0, 0.85) !important;
            color: white !important;
            padding: 8px 12px !important;
            border-radius: 6px !important;
            font-size: 13px !important;
            font-family: system-ui, -apple-system, sans-serif !important;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3) !important;
            opacity: 0 !important;
            transition: opacity 0.3s ease !important;
            max-width: 200px !important;
            word-wrap: break-word !important;
            white-space: nowrap !important;
            line-height: 1.3 !important;
        `;

        document.body.appendChild(toast);

        // 显示动画
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
        });

        // 自动消失
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, 2000);
    }

    // 注册右键菜单命令
    function registerMenuCommand() {
        if (menuCommandId) {
            GM_unregisterMenuCommand(menuCommandId);
        }

        menuCommandId = GM_registerMenuCommand(
            isEnabled ? '❌ 关闭Claude字体和主题色' : '✅ 启用Claude字体和主题色',
            toggleFont,
            'c'
        );
    }

    // 监听DOM变化，动态应用欢迎词颜色
    function startWelcomeTextObserver() {
        if (!isEnabled) return;

        const observer = new MutationObserver((mutations) => {
            let shouldApplyColor = false;

            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
                            shouldApplyColor = true;
                        }
                    });
                }

                if (mutation.type === 'characterData') {
                    shouldApplyColor = true;
                }
            });

            if (shouldApplyColor) {
                // 延迟应用，避免过于频繁
                setTimeout(applyWelcomeTextColor, 100);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });

        return observer;
    }

    let welcomeObserver = null;

    // 初始化函数
    function init() {
        console.log('   Gemini Claude字体切换器启动...');

        // 如果启用了Claude字体，立即应用
        if (isEnabled) {
            applyClaudeFont();
            welcomeObserver = startWelcomeTextObserver();
        }

        // 等待页面加载完成后创建按钮
        const createButtonWhenReady = () => {
            if (document.body) {
                createToggleButton();
            } else {
                setTimeout(createButtonWhenReady, 100);
            }
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(createButtonWhenReady, 500);
            });
        } else {
            setTimeout(createButtonWhenReady, 500);
        }

        // 注册菜单命令
        registerMenuCommand();

        // 监听页面变化（SPA应用）
        let lastUrl = location.href;
        const observer = new MutationObserver(() => {
            const url = location.href;
            if (url !== lastUrl) {
                lastUrl = url;
                setTimeout(() => {
                    if (!document.getElementById('claude-font-toggle')) {
                        createToggleButton();
                    }
                    if (isEnabled && !styleElement) {
                        applyClaudeFont();
                        if (!welcomeObserver) {
                            welcomeObserver = startWelcomeTextObserver();
                        }
                    }
                    // 页面变化时重新应用欢迎词颜色
                    if (isEnabled) {
                        setTimeout(applyWelcomeTextColor, 500);
                    }
                }, 1000);
            }
        });

        observer.observe(document, { subtree: true, childList: true });

        console.log(`✅ 初始化完成 - 当前状态: ${isEnabled ? 'Claude字体+主题色' : '默认字体'}`);
    }

    // 页面卸载时清理
    window.addEventListener('beforeunload', () => {
        if (menuCommandId) {
            GM_unregisterMenuCommand(menuCommandId);
        }
        if (welcomeObserver) {
            welcomeObserver.disconnect();
        }
    });

    // 快捷键支持 (Ctrl+Shift+F)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'F') {
            e.preventDefault();
            toggleFont();
        }
    });

    // 启动脚本
    init();

    // 控制台调试接口
    window.ClaudeFontToggler = {
        toggle: toggleFont,
        enable: () => {
            if (!isEnabled) {
                toggleFont();
                if (!welcomeObserver) {
                    welcomeObserver = startWelcomeTextObserver();
                }
            }
        },
        disable: () => {
            if (isEnabled) {
                toggleFont();
                if (welcomeObserver) {
                    welcomeObserver.disconnect();
                    welcomeObserver = null;
                }
            }
        },
        status: () => isEnabled,
        applyWelcomeColor: applyWelcomeTextColor,
        version: '1.5.1'
    };

})();