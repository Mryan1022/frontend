/**
 * 执行配置弹窗 - 选择平台和执行模式
 * 用于替换原有的 showExecutionDialog 函数
 */

function showExecutionConfigDialog(callback, testCaseCtx) {
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.2s ease;
    `;

    dialog.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            padding: 40px;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            min-width: 500px;
            max-width: 600px;
            animation: slideUp 0.3s ease;
        ">
            <div style="text-align: center; margin-bottom: 30px;">
                <div style="
                    display: inline-block;
                    width: 60px;
                    height: 60px;
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 32px;
                    margin-bottom: 16px;
                    box-shadow: 0 8px 20px rgba(245, 158, 11, 0.3);
                ">🚀</div>
                <h3 style="margin: 0; color: #1e293b; font-size: 24px; font-weight: 700;">配置自动化执行</h3>
                <p style="margin: 8px 0 0 0; color: #64748b; font-size: 14px;">选择执行平台和自动化模式</p>
            </div>

            <!-- 平台选择 -->
            <div style="margin-bottom: 24px;">
                <label style="display: block; margin-bottom: 12px; color: #334155; font-weight: 600; font-size: 15px;">
                    📱 执行平台
                </label>
                <div style="display: flex; gap: 12px;">
                    <button class="platform-select-btn" data-platform="android" style="
                        flex: 1;
                        padding: 12px;
                        border: 2px solid #10b981;
                        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                        color: white;
                        border-radius: 10px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 600;
                        transition: all 0.3s;
                        box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
                    ">
                        📱 Android
                    </button>
                    <button class="platform-select-btn" data-platform="ios" style="
                        flex: 1;
                        padding: 12px;
                        border: 2px solid #e2e8f0;
                        background: white;
                        color: #64748b;
                        border-radius: 10px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 600;
                        transition: all 0.3s;
                    ">
                        🍎 iOS
                    </button>
                    <button class="platform-select-btn" data-platform="h5" style="
                        flex: 1;
                        padding: 12px;
                        border: 2px solid #e2e8f0;
                        background: white;
                        color: #64748b;
                        border-radius: 10px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 600;
                        transition: all 0.3s;
                    ">
                        🌐 H5
                    </button>
                </div>
            </div>

            <!-- 模式选择 -->
            <div style="margin-bottom: 24px;">
                <label style="display: block; margin-bottom: 12px; color: #334155; font-weight: 600; font-size: 15px;">
                    🎯 执行模式
                </label>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <div class="mode-option" data-mode="simple" style="
                        padding: 16px;
                        border: 2px solid #8b5cf6;
                        background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
                        border-radius: 10px;
                        cursor: pointer;
                        transition: all 0.3s;
                    ">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                            <span style="font-size: 24px;">⚡</span>
                            <span style="font-weight: 600; color: #1e293b; font-size: 16px;">Simple 模式</span>
                            <span style="margin-left: auto; color: #8b5cf6; font-size: 12px; font-weight: 600; background: white; padding: 4px 12px; border-radius: 12px;">推荐</span>
                        </div>
                        <p style="margin: 0; color: #64748b; font-size: 13px; line-height: 1.5; padding-left: 36px;">
                            启动APP + 自动截图验证。快速、稳定，适合冒烟测试。
                        </p>
                    </div>

                    <div class="mode-option" data-mode="standard" style="
                        padding: 16px;
                        border: 2px solid #e2e8f0;
                        background: white;
                        border-radius: 10px;
                        cursor: pointer;
                        transition: all 0.3s;
                    ">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                            <span style="font-size: 24px;">🎮</span>
                            <span style="font-weight: 600; color: #1e293b; font-size: 16px;">Standard 模式</span>
                        </div>
                        <p style="margin: 0; color: #64748b; font-size: 13px; line-height: 1.5; padding-left: 36px;">
                            执行点击、输入、验证等操作。需要配置JSON步骤。
                        </p>
                    </div>

                    <div class="mode-option" data-mode="script" style="
                        padding: 16px;
                        border: 2px solid #e2e8f0;
                        background: white;
                        border-radius: 10px;
                        cursor: pointer;
                        transition: all 0.3s;
                    ">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                            <span style="font-size: 24px;">🐍</span>
                            <span style="font-weight: 600; color: #1e293b; font-size: 16px;">Script 模式</span>
                        </div>
                        <p style="margin: 0; color: #64748b; font-size: 13px; line-height: 1.5; padding-left: 36px;">
                            运行自定义Python脚本。完全自定义，需要提供脚本路径。
                        </p>
                    </div>
                </div>
            </div>

            <!-- 预检结果区 -->
            <div id="previewResultArea" style="display:none; margin-top: 20px; padding: 12px; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; max-height: 280px; overflow-y: auto;"></div>

            <!-- 操作按钮 -->
            <div style="display: flex; gap: 10px; margin-top: 24px;">
                <button id="cancelExecuteConfig" style="
                    flex: 1;
                    padding: 14px 16px;
                    border: 2px solid #e2e8f0;
                    background: white;
                    color: #64748b;
                    border-radius: 12px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 600;
                    transition: all 0.3s;
                ">取消</button>
                <button id="previewStepsBtn" style="
                    flex: 1;
                    padding: 14px 16px;
                    border: 2px solid #8b5cf6;
                    background: white;
                    color: #8b5cf6;
                    border-radius: 12px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 600;
                    transition: all 0.3s;
                    ${testCaseCtx ? '' : 'display:none;'}
                ">🔍 预检步骤</button>
                <button id="confirmExecuteConfig" style="
                    flex: 2;
                    padding: 14px 16px;
                    border: none;
                    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
                    color: white;
                    border-radius: 12px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 600;
                    transition: all 0.3s;
                    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
                ">🚀 开始执行</button>
            </div>
        </div>
    `;

    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(dialog);

    // 状态变量
    let selectedPlatform = 'android';
    let selectedMode = 'simple';

    // 平台选择逻辑
    const platformBtns = dialog.querySelectorAll('.platform-select-btn');
    platformBtns.forEach(btn => {
        btn.onclick = () => {
            selectedPlatform = btn.dataset.platform;
            platformBtns.forEach(b => {
                if (b === btn) {
                    if (selectedPlatform === 'android') {
                        b.style.border = '2px solid #10b981';
                        b.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                        b.style.color = 'white';
                        b.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.2)';
                    } else if (selectedPlatform === 'ios') {
                        b.style.border = '2px solid #3b82f6';
                        b.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
                        b.style.color = 'white';
                        b.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.2)';
                    } else {
                        b.style.border = '2px solid #f59e0b';
                        b.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
                        b.style.color = 'white';
                        b.style.boxShadow = '0 2px 8px rgba(245, 158, 11, 0.2)';
                    }
                } else {
                    b.style.border = '2px solid #e2e8f0';
                    b.style.background = 'white';
                    b.style.color = '#64748b';
                    b.style.boxShadow = 'none';
                }
            });
        };
    });

    // 模式选择逻辑
    const modeOptions = dialog.querySelectorAll('.mode-option');
    modeOptions.forEach(option => {
        option.onclick = () => {
            selectedMode = option.dataset.mode;
            modeOptions.forEach(opt => {
                if (opt === option) {
                    opt.style.border = '2px solid #8b5cf6';
                    opt.style.background = 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)';
                    opt.style.transform = 'scale(1.02)';
                } else {
                    opt.style.border = '2px solid #e2e8f0';
                    opt.style.background = 'white';
                    opt.style.transform = 'scale(1)';
                }
            });
        };

        // 鼠标悬停效果
        option.onmouseover = () => {
            if (option.dataset.mode !== selectedMode) {
                option.style.transform = 'translateX(4px)';
                option.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            }
        };
        option.onmouseout = () => {
            if (option.dataset.mode !== selectedMode) {
                option.style.transform = 'translateX(0)';
                option.style.boxShadow = 'none';
            }
        };
    });

    // 确认按钮
    const confirmBtn = dialog.querySelector('#confirmExecuteConfig');
    confirmBtn.onmouseover = () => {
        confirmBtn.style.transform = 'translateY(-2px)';
        confirmBtn.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.4)';
    };
    confirmBtn.onmouseout = () => {
        confirmBtn.style.transform = 'translateY(0)';
        confirmBtn.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
    };
    confirmBtn.onclick = () => {
        dialog.style.animation = 'fadeOut 0.2s ease';
        setTimeout(() => {
            dialog.remove();
            // 构建执行配置
            const executionConfig = {
                automation_level: selectedMode,
                platform: selectedPlatform,
                app_package: 'com.dolilive',
                app_activity: 'com.dolilive.splash.SplashActivity'
            };
            callback(selectedPlatform, executionConfig);
        }, 200);
    };

    // 取消按钮
    const cancelBtn = dialog.querySelector('#cancelExecuteConfig');
    cancelBtn.onmouseover = () => {
        cancelBtn.style.background = '#f1f5f9';
        cancelBtn.style.borderColor = '#cbd5e1';
    };
    cancelBtn.onmouseout = () => {
        cancelBtn.style.background = 'white';
        cancelBtn.style.borderColor = '#e2e8f0';
    };
    cancelBtn.onclick = () => {
        dialog.style.animation = 'fadeOut 0.2s ease';
        setTimeout(() => dialog.remove(), 200);
    };

    // 预检按钮
    const previewBtn = dialog.querySelector('#previewStepsBtn');
    const previewArea = dialog.querySelector('#previewResultArea');
    if (previewBtn && testCaseCtx) {
        previewBtn.onclick = async () => {
            previewBtn.disabled = true;
            previewBtn.innerText = '🔄 解析中…';
            previewArea.style.display = 'block';
            previewArea.innerHTML = '<div style="color:#64748b; font-size:13px;">正在翻译步骤…</div>';
            try {
                const token = (window.getAuthToken && window.getAuthToken()) || localStorage.getItem('token') || '';
                const resp = await fetch('/api/automation/preview-steps', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token ? `Bearer ${token}` : ''
                    },
                    body: JSON.stringify({
                        steps: testCaseCtx.steps || '',
                        preconditions: testCaseCtx.preconditions || '',
                        expected: testCaseCtx.expected || ''
                    })
                });
                const data = await resp.json();
                if (!data.success) {
                    previewArea.innerHTML = `<div style="color:#dc2626;">❌ 预检失败：${data.error || '未知错误'}</div>`;
                    return;
                }
                const sections = data.sections || {};
                const renderSection = (label, actions) => {
                    if (!actions || !actions.length) return '';
                    const rows = actions.map((a, i) => {
                        const isManual = a.action === 'manual';
                        const color = isManual ? '#dc2626' : '#059669';
                        const icon = isManual ? '❌' : '✅';
                        const detail = isManual ? (a.raw_text || a.description) : `${a.action}${a.element ? ' → ' + a.element : ''}${a.text ? ' = ' + a.text : ''}`;
                        return `<div style="padding:4px 0; border-bottom:1px dashed #e2e8f0; font-size:12px;"><span style="color:${color}">${icon} ${i+1}. ${detail}</span></div>`;
                    }).join('');
                    return `<div style="margin-bottom:10px;"><div style="font-weight:600; font-size:13px; color:#334155; margin-bottom:4px;">${label}（${actions.length} 步）</div>${rows}</div>`;
                };
                const manualCount = data.manual_count || 0;
                const summaryColor = manualCount ? '#dc2626' : '#059669';
                previewArea.innerHTML = `
                    <div style="margin-bottom:10px; padding:8px; background:white; border-radius:6px; color:${summaryColor}; font-weight:600; font-size:13px;">
                        共 ${data.step_count || 0} 步，${manualCount} 步无法翻译（manual）
                    </div>
                    ${renderSection('前置条件', sections.pre)}
                    ${renderSection('主步骤', sections.main)}
                    ${renderSection('预期结果', sections.expected)}
                `;
            } catch (err) {
                previewArea.innerHTML = `<div style="color:#dc2626;">❌ 请求失败：${err.message}</div>`;
            } finally {
                previewBtn.disabled = false;
                previewBtn.innerText = '🔍 预检步骤';
            }
        };
    }

    // 点击背景关闭
    dialog.onclick = (e) => {
        if (e.target === dialog) {
            dialog.style.animation = 'fadeOut 0.2s ease';
            setTimeout(() => dialog.remove(), 200);
        }
    };
}
