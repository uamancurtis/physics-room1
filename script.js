// 全局变量
let currentUser = null;
let currentRole = null;
let currentGroup = null;



// 初始化应用
function initApp() {
    loadFromStorage();
    setupEventListeners();
}

// 设置事件监听器
function setupEventListeners() {
    // 登录相关
    document.getElementById('loginBtn').addEventListener('click', login);
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('role').addEventListener('change', toggleGroupSelect);
    
    // 导航相关
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', switchPage);
    });
    
    // 上传相关
    document.getElementById('uploadBtn').addEventListener('click', uploadMaterials);
    document.getElementById('uploadAIScoreBtn').addEventListener('click', generateAIScoreInUpload);
    
    // 查看材料相关
    document.getElementById('viewGroupSelect').addEventListener('change', viewMaterials);
    
    // 评分相关
    document.querySelectorAll('.score-tab').forEach(tab => {
        tab.addEventListener('click', switchScoreTab);
    });
    
    document.querySelectorAll('.score-range').forEach(range => {
        range.addEventListener('input', updateScoreValue);
    });
    
    document.getElementById('saveSelfScoreBtn').addEventListener('click', saveSelfScore);
    document.getElementById('savePeerScoreBtn').addEventListener('click', savePeerScore);
    document.getElementById('saveTeacherScoreBtn').addEventListener('click', saveTeacherScore);
    document.getElementById('generateAIScoreBtn').addEventListener('click', generateAIScore);
    
    // 排名相关
    document.getElementById('applyCertificateBtn').addEventListener('click', applyCertificate);
}

// 切换登录界面的小组选择显示
function toggleGroupSelect() {
    const role = document.getElementById('role').value;
    const groupSelect = document.getElementById('groupSelectContainer');
    groupSelect.style.display = role === 'group' ? 'block' : 'none';
}

// 登录功能
function login() {
    const role = document.getElementById('role').value;
    const groupNumber = role === 'group' ? document.getElementById('groupNumber').value : null;
    
    currentUser = role === 'group' ? `小组${groupNumber}` : '教师';
    currentRole = role;
    currentGroup = role === 'group' ? parseInt(groupNumber) : null;
    
    document.getElementById('currentUser').textContent = currentUser;
    
    // 隐藏登录页面
    document.getElementById('loginPage').classList.add('hidden');
    
    // 显示主页面
    document.getElementById('mainPage').style.display = 'flex';
    
    // 如果是教师，显示教师评分标签
    if (currentRole === 'teacher') {
        document.getElementById('teacherScoreTab').style.display = 'block';
    }
    
    // 更新界面
    viewMaterials();
    updateRanking();
}

// 退出登录
function logout() {
    currentUser = null;
    currentRole = null;
    currentGroup = null;
    
    // 显示登录页面
    document.getElementById('loginPage').classList.remove('hidden');
    
    // 重置所有页面
    document.querySelectorAll('.content-page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById('uploadPage').classList.add('active');
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector('[data-page="upload"]').classList.add('active');
    
    document.getElementById('teacherScoreTab').style.display = 'none';
}

// 切换主页面
function switchPage(e) {
    const targetPage = e.target.dataset.page;
    
    // 更新导航按钮状态
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    e.target.classList.add('active');
    
    // 更新内容页面
    document.querySelectorAll('.content-page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(`${targetPage}Page`).classList.add('active');
    
    // 特定页面更新
    if (targetPage === 'view') {
        viewMaterials();
    } else if (targetPage === 'ranking') {
        updateRanking();
    }
}

// 切换评分标签页
function switchScoreTab(e) {
    const targetTab = e.target.dataset.tab;
    
    // 更新标签页按钮状态
    document.querySelectorAll('.score-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    e.target.classList.add('active');
    
    // 更新内容
    document.querySelectorAll('.score-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${targetTab}ScoreTab`).classList.add('active');
    
    // 更新评分显示
    updateScoreDisplay(targetTab);
}

// 更新评分显示（AI和教师评分）
function updateScoreDisplay(tab) {
    let groupIndex;
    
    if (tab === 'self') {
        // 自评页面 - 当前小组
        groupIndex = currentGroup - 1;
        updateSelfScoreDisplay(groupIndex);
    } else if (tab === 'peer') {
        // 互评页面 - 选择的小组
        const peerGroup = parseInt(document.getElementById('peerGroupSelect').value);
        groupIndex = peerGroup - 1;
        updatePeerScoreDisplay(groupIndex);
    } else if (tab === 'teacher') {
        // 教师评分页面 - 选择的小组
        const teacherGroup = parseInt(document.getElementById('teacherGroupSelect').value);
        groupIndex = teacherGroup - 1;
        // 教师页面已有AI评分显示
    }
}

// 更新自评页面的评分显示
function updateSelfScoreDisplay(groupIndex) {
    const group = groups[groupIndex];
    const aiScoreDisplay = document.getElementById('selfAIScoreDisplay');
    const teacherScoreDisplay = document.getElementById('selfTeacherScoreDisplay');
    
    // 更新AI评分显示
    if (group.scores.ai) {
        const aiScores = group.scores.ai.scores;
        aiScoreDisplay.innerHTML = `
            <div class="ai-score-item">项目创新性：${aiScores.innovation}分</div>
            <div class="ai-score-item">技术实现：${aiScores.technical}分</div>
            <div class="ai-score-item">实验设计：${aiScores.experiment}分</div>
            <div class="ai-score-item">成果展示：${aiScores.presentation}分</div>
            <div class="ai-score-item">团队合作：${aiScores.collaboration}分</div>
            <div class="ai-score-item"><strong>总分：${group.scores.ai.total.toFixed(2)}分</strong></div>
        `;
    } else {
        aiScoreDisplay.innerHTML = '<p>暂无AI评分</p>';
    }
    
    // 更新教师评分显示
    if (group.scores.teacher) {
        const teacherScores = group.scores.teacher.scores;
        teacherScoreDisplay.innerHTML = `
            <div class="teacher-score-item">项目创新性：${teacherScores.innovation}分</div>
            <div class="teacher-score-item">技术实现：${teacherScores.technical}分</div>
            <div class="teacher-score-item">实验设计：${teacherScores.experiment}分</div>
            <div class="teacher-score-item">成果展示：${teacherScores.presentation}分</div>
            <div class="teacher-score-item">团队合作：${teacherScores.collaboration}分</div>
            <div class="teacher-score-item"><strong>总分：${group.scores.teacher.total.toFixed(2)}分</strong></div>
        `;
    } else {
        teacherScoreDisplay.innerHTML = '<p>暂无教师评分</p>';
    }
}

// 更新互评页面的评分显示
function updatePeerScoreDisplay(groupIndex) {
    const group = groups[groupIndex];
    const aiScoreDisplay = document.getElementById('peerAIScoreDisplay');
    const teacherScoreDisplay = document.getElementById('peerTeacherScoreDisplay');
    
    // 更新AI评分显示
    if (group.scores.ai) {
        const aiScores = group.scores.ai.scores;
        aiScoreDisplay.innerHTML = `
            <div class="ai-score-item">项目创新性：${aiScores.innovation}分</div>
            <div class="ai-score-item">技术实现：${aiScores.technical}分</div>
            <div class="ai-score-item">实验设计：${aiScores.experiment}分</div>
            <div class="ai-score-item">成果展示：${aiScores.presentation}分</div>
            <div class="ai-score-item">团队合作：${aiScores.collaboration}分</div>
            <div class="ai-score-item"><strong>总分：${group.scores.ai.total.toFixed(2)}分</strong></div>
        `;
    } else {
        aiScoreDisplay.innerHTML = '<p>暂无AI评分</p>';
    }
    
    // 更新教师评分显示
    if (group.scores.teacher) {
        const teacherScores = group.scores.teacher.scores;
        teacherScoreDisplay.innerHTML = `
            <div class="teacher-score-item">项目创新性：${teacherScores.innovation}分</div>
            <div class="teacher-score-item">技术实现：${teacherScores.technical}分</div>
            <div class="teacher-score-item">实验设计：${teacherScores.experiment}分</div>
            <div class="teacher-score-item">成果展示：${teacherScores.presentation}分</div>
            <div class="teacher-score-item">团队合作：${teacherScores.collaboration}分</div>
            <div class="teacher-score-item"><strong>总分：${group.scores.teacher.total.toFixed(2)}分</strong></div>
        `;
    } else {
        teacherScoreDisplay.innerHTML = '<p>暂无教师评分</p>';
    }
}

// 更新分数显示
function updateScoreValue(e) {
    const value = e.target.value;
    const scoreValue = e.target.nextElementSibling;
    scoreValue.textContent = value;
}

// 上传材料
function uploadMaterials() {
    const reportFile = document.getElementById('reportFile').files[0];
    const videoFile = document.getElementById('videoFile').files[0];
    
    if (!reportFile && !videoFile) {
        alert('请至少上传一个文件');
        return;
    }
    
    // 检查文件大小
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (reportFile && reportFile.size > maxSize) {
        alert('报告文件大小不能超过100MB');
        return;
    }
    if (videoFile && videoFile.size > maxSize) {
        alert('视频文件大小不能超过100MB');
        return;
    }
    
    // 在实际项目中，这里会上传文件到服务器
    // 这里我们使用localStorage模拟
    const groupIndex = currentGroup - 1;
    
    if (reportFile) {
        // 创建报告对象
        const report = {
            name: reportFile.name,
            type: reportFile.type,
            size: reportFile.size,
            uploadedAt: new Date().toISOString()
        };
        
        // 如果是txt文件，读取内容
        if (reportFile.type === 'text/plain' || reportFile.name.endsWith('.txt')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                report.content = e.target.result;
                groups[groupIndex].report = report;
                saveToStorage();
                alert('材料上传成功！');
            };
            reader.readAsText(reportFile);
        } else {
            // 非txt文件，只保存基本信息
            groups[groupIndex].report = report;
            saveToStorage();
            alert('材料上传成功！');
        }
    } else {
        alert('材料上传成功！');
    }
    
    if (videoFile) {
        groups[groupIndex].video = {
            name: videoFile.name,
            type: videoFile.type,
            size: videoFile.size,
            uploadedAt: new Date().toISOString()
        };
        saveToStorage();
    }
    
    // 清空文件选择
    document.getElementById('reportFile').value = '';
    document.getElementById('videoFile').value = '';
}

// 查看材料
function viewMaterials() {
    const selectedGroup = document.getElementById('viewGroupSelect').value;
    const materialsList = document.getElementById('materialsList');
    materialsList.innerHTML = '';
    
    const groupsToShow = selectedGroup === 'all' ? groups : [groups[parseInt(selectedGroup) - 1]];
    
    groupsToShow.forEach((group, index) => {
        const materialItem = document.createElement('div');
        materialItem.className = 'material-item';
        
        let content = `<h4>小组${index + 1}</h4>`;
        
        if (group.report) {
            content += `<div><strong>项目报告：</strong>${group.report.name}</div>`;
        }
        
        if (group.video) {
            content += `<div><strong>实验视频：</strong></div>`;
            content += `<video controls width="100%" src="#">
                          您的浏览器不支持视频播放
                       </video>`;
        }
        
        materialItem.innerHTML = content;
        materialsList.appendChild(materialItem);
    });
}

// 保存自评分数
function saveSelfScore() {
    const scores = getScoreValues();
    const groupIndex = currentGroup - 1;
    
    groups[groupIndex].scores.self = {
        scores: scores,
        total: calculateTotalScore(scores),
        submittedAt: new Date().toISOString()
    };
    
    saveToStorage();
    updateRanking();
    alert('自评保存成功！');
}

// 保存互评分数
function savePeerScore() {
    const peerGroup = parseInt(document.getElementById('peerGroupSelect').value);
    const scores = getScoreValues();
    
    if (peerGroup === currentGroup) {
        alert('不能给自己的小组互评');
        return;
    }
    
    const peerIndex = peerGroup - 1;
    
    if (!groups[peerIndex].scores.peer) {
        groups[peerIndex].scores.peer = [];
    }
    
    // 查找是否已存在该小组的评分
    const existingScoreIndex = groups[peerIndex].scores.peer.findIndex(score => score.from === currentGroup);
    
    if (existingScoreIndex !== -1) {
        // 更新已有评分
        groups[peerIndex].scores.peer[existingScoreIndex] = {
            from: currentGroup,
            scores: scores,
            total: calculateTotalScore(scores),
            submittedAt: new Date().toISOString()
        };
    } else {
        // 添加新评分
        groups[peerIndex].scores.peer.push({
            from: currentGroup,
            scores: scores,
            total: calculateTotalScore(scores),
            submittedAt: new Date().toISOString()
        });
    }
    
    saveToStorage();
    updateRanking();
    alert('互评保存成功！');
}

// 保存教师评分
function saveTeacherScore() {
    const teacherGroup = parseInt(document.getElementById('teacherGroupSelect').value);
    const scores = getScoreValues();
    const groupIndex = teacherGroup - 1;
    
    groups[groupIndex].scores.teacher = {
        scores: scores,
        total: calculateTotalScore(scores),
        submittedAt: new Date().toISOString()
    };
    
    saveToStorage();
    updateRanking();
    alert('教师评分保存成功！');
}

// 分析报告内容，生成AI评分
function analyzeReportForScore(reportContent) {
    // 定义评分规则和关键词（增强版，包含更多关键词和不同权重）
    const rules = {
        innovation: {
            keywords: ['创新', '创意', '新颖', '独特', '首创', '新方法', '新思路', '突破', '革新', '创新点', '创造性', '创新思维', '创新方法', '前瞻性', '引领性', '颠覆性', '原创性', '创新应用', '创新成果', '创新案例', '创新实践'],
            baseScore: 55,
            maxScore: 100,
            weight: 1.8
        },
        technical: {
            keywords: ['技术', '实现', '算法', '代码', '系统', '架构', '编程', '开发', '实现方案', '技术路线', '技术实现', '技术难点', '技术创新', '技术验证', '技术选型', '技术文档', '技术方案', '技术栈', '技术参数', '技术指标', '技术细节', '技术优势', '技术挑战', '技术解决'],
            baseScore: 60,
            maxScore: 100,
            weight: 2.0
        },
        experiment: {
            keywords: ['实验', '设计', '方法', '步骤', '数据', '结果', '分析', '验证', '实验设计', '实验方法', '实验步骤', '实验数据', '数据分析', '实验结论', '实验目的', '实验原理', '实验设备', '实验过程', '实验记录', '实验结果', '实验分析', '实验验证', '实验误差', '实验改进'],
            baseScore: 65,
            maxScore: 100,
            weight: 2.2
        },
        presentation: {
            keywords: ['展示', '清晰', '结构', '逻辑', '图表', '说明', '总结', '结论', '内容清晰', '结构合理', '逻辑严谨', '图文并茂', '表达清晰', '总结到位', '内容完整', '层次分明', '重点突出', '语言流畅', '表述准确', '视觉效果', '排版美观', '易于理解', '说服力强'],
            baseScore: 60,
            maxScore: 100,
            weight: 1.5
        },
        collaboration: {
            keywords: ['团队', '合作', '分工', '配合', '协调', '成员', '共同', '团队合作', '分工明确', '配合默契', '协作顺畅', '团队精神', '集体智慧', '共同完成', '团队分工', '团队协作', '团队沟通', '团队配合', '团队贡献', '团队成员', '团队目标', '团队效率', '团队凝聚力'],
            baseScore: 55,
            maxScore: 100,
            weight: 1.5
        }
    };
    
    const scores = {};
    
    if (!reportContent) {
        // 没有报告内容，生成基础分数
        Object.keys(rules).forEach(category => {
            scores[category] = Math.floor(Math.random() * (rules[category].maxScore - rules[category].baseScore) + rules[category].baseScore);
        });
        return scores;
    }
    
    // 分析报告内容
    const content = reportContent.toLowerCase();
    
    // 额外的内容分析指标
    const contentMetrics = {
        wordCount: content.replace(/\s+/g, '').length,
        paragraphCount: content.split(/[\n\r]+/).filter(para => para.trim().length > 0).length,
        hasStructure: /(摘要|引言|背景|方法|结果|结论|参考文献)/i.test(reportContent),
        hasData: /(数据|表格|图表|统计|数值)/i.test(reportContent),
        hasConclusion: /(结论|总结|展望)/i.test(reportContent)
    };
    
    Object.keys(rules).forEach(category => {
        const rule = rules[category];
        let keywordCount = 0;
        
        // 统计关键词出现次数
        rule.keywords.forEach(keyword => {
            const regex = new RegExp(keyword.toLowerCase(), 'g');
            const matches = content.match(regex);
            if (matches) {
                keywordCount += matches.length;
            }
        });
        
        // 计算基础分数（关键词匹配）
        let score = rule.baseScore + (keywordCount * rule.weight);
        score = Math.min(score, rule.maxScore);
        score = Math.max(score, rule.baseScore);
        
        // 内容质量调整
        // 根据报告结构、数据和结论进行加分
        if (contentMetrics.hasStructure && contentMetrics.hasData && contentMetrics.hasConclusion) {
            score += 5;
        }
        
        // 根据内容长度调整分数（避免过短的报告）
        if (contentMetrics.wordCount < 100) {
            score -= 10;
        } else if (contentMetrics.wordCount > 500) {
            score += 5;
        }
        
        // 根据段落数调整分数（结构合理性）
        if (contentMetrics.paragraphCount < 3) {
            score -= 5;
        } else if (contentMetrics.paragraphCount >= 5) {
            score += 3;
        }
        
        // 确保分数在合理范围内
        score = Math.min(score, rule.maxScore);
        score = Math.max(score, 0);
        
        scores[category] = Math.round(score);
    });
    
    // 添加小幅度随机波动，使评分更自然
    Object.keys(scores).forEach(category => {
        const variation = Math.floor(Math.random() * 8) - 3; // -3到+3的随机波动
        scores[category] = Math.max(0, Math.min(100, scores[category] + variation));
    });
    
    return scores;
}

// 上传页面生成AI评分
function generateAIScoreInUpload() {
    const groupIndex = currentGroup - 1;
    const group = groups[groupIndex];
    
    // 检查是否有上传报告
    if (!group.report) {
        alert('请先上传项目报告');
        return;
    }
    
    const reportContent = group.report.content;
    const processDiv = document.getElementById('aiScoringProcess');
    
    // 显示评分过程
    processDiv.innerHTML = '<p class="ai-process-step">AI评分中...正在分析报告内容</p>';
    
    // 模拟分析过程
    setTimeout(() => {
        processDiv.innerHTML += '<p class="ai-process-step">正在匹配关键指标：创新、技术实现、实验设计...</p>';
        
        // 分析报告内容
        const aiScores = analyzeReportForScore(reportContent);
        
        setTimeout(() => {
            processDiv.innerHTML += '<p class="ai-process-step">正在计算各维度得分...</p>';
            
            setTimeout(() => {
                // 保存AI评分
                groups[groupIndex].scores.ai = {
                    scores: aiScores,
                    total: calculateTotalScore(aiScores),
                    submittedAt: new Date().toISOString(),
                    reportAnalyzed: !!reportContent
                };
                
                saveToStorage();
                
                // 显示详细评分结果和依据
                let processHTML = `
                    <div class="ai-score-result">
                        <h4>AI评分结果（占比20%）</h4>
                        <div class="ai-score-item">项目创新性：${aiScores.innovation}分</div>
                        <div class="ai-score-item">技术实现：${aiScores.technical}分</div>
                        <div class="ai-score-item">实验设计：${aiScores.experiment}分</div>
                        <div class="ai-score-item">成果展示：${aiScores.presentation}分</div>
                        <div class="ai-score-item">团队合作：${aiScores.collaboration}分</div>
                        <div class="ai-score-item"><strong>总分：${calculateTotalScore(aiScores).toFixed(2)}分</strong></div>
                    </div>
                    <div class="ai-scoring-basis">
                        <h4>评分依据</h4>
                `;
                
                if (reportContent) {
                    // 显示详细的分析依据
                    const content = reportContent.toLowerCase();
                    const rules = {
                        innovation: { keywords: ['创新', '创意', '新颖', '独特', '首创', '新方法', '新思路'] },
                        technical: { keywords: ['技术', '实现', '算法', '系统', '架构', '编程', '开发'] },
                        experiment: { keywords: ['实验', '设计', '方法', '步骤', '数据', '结果', '分析'] },
                        presentation: { keywords: ['展示', '清晰', '结构', '逻辑', '图表', '说明', '总结'] },
                        collaboration: { keywords: ['团队', '合作', '分工', '配合', '协调', '成员', '共同'] }
                    };
                    
                    // 统计每个维度的关键词
                    const keywordStats = {};
                    Object.keys(rules).forEach(category => {
                        keywordStats[category] = [];
                        rules[category].keywords.forEach(keyword => {
                            const regex = new RegExp(keyword.toLowerCase(), 'g');
                            const matches = content.match(regex);
                            if (matches) {
                                keywordStats[category].push(`${keyword}(${matches.length}次)`);
                            }
                        });
                    });
                    
                    // 内容质量分析
                    const contentMetrics = {
                        wordCount: content.replace(/\s+/g, '').length,
                        paragraphCount: content.split(/[\n\r]+/).filter(para => para.trim().length > 0).length,
                        hasStructure: /(摘要|引言|背景|方法|结果|结论|参考文献)/i.test(reportContent),
                        hasData: /(数据|表格|图表|统计|数值)/i.test(reportContent),
                        hasConclusion: /(结论|总结|展望)/i.test(reportContent)
                    };
                    
                    processHTML += `
                        <div class="basis-section">
                            <h5>关键词分析</h5>
                            <p>项目创新性：${keywordStats.innovation.length > 0 ? keywordStats.innovation.join(', ') : '未检测到相关关键词'}</p>
                            <p>技术实现：${keywordStats.technical.length > 0 ? keywordStats.technical.join(', ') : '未检测到相关关键词'}</p>
                            <p>实验设计：${keywordStats.experiment.length > 0 ? keywordStats.experiment.join(', ') : '未检测到相关关键词'}</p>
                            <p>成果展示：${keywordStats.presentation.length > 0 ? keywordStats.presentation.join(', ') : '未检测到相关关键词'}</p>
                            <p>团队合作：${keywordStats.collaboration.length > 0 ? keywordStats.collaboration.join(', ') : '未检测到相关关键词'}</p>
                        </div>
                        <div class="basis-section">
                            <h5>内容质量分析</h5>
                            <p>报告字数：${contentMetrics.wordCount}字</p>
                            <p>段落数量：${contentMetrics.paragraphCount}段</p>
                            <p>报告结构：${contentMetrics.hasStructure ? '完整' : '需要完善'}</p>
                            <p>数据分析：${contentMetrics.hasData ? '包含' : '需要补充'}</p>
                            <p>结论总结：${contentMetrics.hasConclusion ? '清晰' : '需要明确'}</p>
                        </div>
                        <div class="basis-section">
                            <h5>评分规则</h5>
                            <p>1. 关键词匹配度（50%权重）：基于报告中各维度关键词的出现频率</p>
                            <p>2. 内容质量（30%权重）：包括报告结构、数据分析和结论完整性</p>
                            <p>3. 内容丰富度（20%权重）：基于报告字数和段落数量</p>
                        </div>
                    `;
                } else {
                    processHTML += '<p class="ai-process-note">未检测到可分析的报告内容，基于基础规则生成评分</p>';
                }
                
                processHTML += '</div>';
                processDiv.innerHTML = processHTML;
                
                updateRanking();
            }, 800);
        }, 1200);
    }, 1000);
}

// 生成AI评分（教师页面）
function generateAIScore() {
    const teacherGroup = parseInt(document.getElementById('teacherGroupSelect').value);
    const groupIndex = teacherGroup - 1;
    const group = groups[groupIndex];
    
    // 检查是否有上传报告
    const reportContent = group.report && group.report.content ? group.report.content : null;
    
    // 基于报告内容分析生成评分
    const aiScores = analyzeReportForScore(reportContent);
    
    groups[groupIndex].scores.ai = {
        scores: aiScores,
        total: calculateTotalScore(aiScores),
        submittedAt: new Date().toISOString(),
        reportAnalyzed: !!reportContent
    };
    
    saveToStorage();
    
    // 显示AI评分结果
    const resultDiv = document.getElementById('aiScoreResult');
    let resultHTML = `
        <div class="ai-score-item"><strong>AI评分结果（占比20%）</strong></div>
        <div class="ai-score-item">项目创新性：${aiScores.innovation}分</div>
        <div class="ai-score-item">技术实现：${aiScores.technical}分</div>
        <div class="ai-score-item">实验设计：${aiScores.experiment}分</div>
        <div class="ai-score-item">成果展示：${aiScores.presentation}分</div>
        <div class="ai-score-item">团队合作：${aiScores.collaboration}分</div>
        <div class="ai-score-item"><strong>总分：${calculateTotalScore(aiScores).toFixed(2)}分</strong></div>
    `;
    
    if (reportContent) {
        resultHTML += `<div class="ai-score-item" style="margin-top: 1em; font-style: italic;">备注：AI基于报告内容分析生成评分</div>`;
    } else {
        resultHTML += `<div class="ai-score-item" style="margin-top: 1em; font-style: italic;">备注：未检测到可分析的报告内容，基于基础规则生成评分</div>`;
    }
    
    resultDiv.innerHTML = resultHTML;
    
    updateRanking();
    alert('AI评分生成成功！');
}

// 获取当前评分值
function getScoreValues() {
    const ranges = document.querySelectorAll('.score-tab-content.active .score-range');
    const scores = {};
    
    ranges.forEach(range => {
        const category = range.dataset.category;
        scores[category] = parseInt(range.value);
    });
    
    return scores;
}

// 计算总分
function calculateTotalScore(scores) {
    return Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.values(scores).length;
}

// 更新排名
function updateRanking() {
    const rankingList = document.getElementById('rankingList');
    const certificateSection = document.getElementById('certificateSection');
    
    // 计算每个小组的最终得分
    const groupsWithTotal = groups.map((group, index) => {
        const scores = group.scores;
        let totalScore = 0;
        let weightSum = 0;
        
        // 获取各项得分
        const aiScore = scores.ai && scores.ai.total ? scores.ai.total : 0;
        const teacherScore = scores.teacher && scores.teacher.total ? scores.teacher.total : 0;
        const selfScore = scores.self && scores.self.total ? scores.self.total : 0;
        const peerAverage = scores.peer && scores.peer.length > 0 ? 
            scores.peer.reduce((sum, peer) => sum + peer.total, 0) / scores.peer.length : 0;
        
        // 计算各项得分的加权总和
        if (aiScore > 0) {
            totalScore += aiScore * 0.2;
            weightSum += 0.2;
        }
        
        if (teacherScore > 0) {
            totalScore += teacherScore * 0.3;
            weightSum += 0.3;
        }
        
        if (selfScore > 0) {
            totalScore += selfScore * 0.1;
            weightSum += 0.1;
        }
        
        if (peerAverage > 0) {
            totalScore += peerAverage * 0.4;
            weightSum += 0.4;
        }
        
        // 如果没有任何评分，设置为0
        const finalScore = weightSum > 0 ? totalScore / weightSum : 0;
        
        return {
            group: index + 1,
            score: finalScore,
            aiScore: aiScore,
            teacherScore: teacherScore,
            selfScore: selfScore,
            peerAverage: peerAverage
        };
    });
    
    // 按分数排序
    groupsWithTotal.sort((a, b) => b.score - a.score);
    
    // 更新排名列表
    rankingList.innerHTML = '';
    groupsWithTotal.forEach((item, index) => {
        const rankItem = document.createElement('div');
        rankItem.className = 'rank-item';
        
        // 计算各部分得分的加权值
        const aiWeighted = (item.aiScore * 0.2).toFixed(2);
        const teacherWeighted = (item.teacherScore * 0.3).toFixed(2);
        const selfWeighted = (item.selfScore * 0.1).toFixed(2);
        const peerWeighted = (item.peerAverage * 0.4).toFixed(2);
        
        // 基础排名信息
        let rankHTML = `
            <div class="rank-number">${index + 1}</div>
            <div class="rank-info">
                <div class="rank-group">小组${item.group}</div>
                <div class="rank-details">
                    <div class="score-detail">AI评分：${item.aiScore.toFixed(2)}（20% → ${aiWeighted}）</div>
                    <div class="score-detail">教师评分：${item.teacherScore.toFixed(2)}（30% → ${teacherWeighted}）</div>
                    <div class="score-detail">小组自评：${item.selfScore.toFixed(2)}（10% → ${selfWeighted}）</div>
                    <div class="score-detail">小组互评：${item.peerAverage.toFixed(2)}（40% → ${peerWeighted}）</div>
                </div>
            </div>
            <div class="rank-score">${item.score.toFixed(2)}</div>
        `;
        
        // 为前三名添加申请奖状按钮，但只有当前小组可以看到自己的按钮
        if (index < 3 && currentRole === 'group' && item.group === currentGroup) {
            rankHTML += `<button class="apply-cert-btn" onclick="applyCertificate(${item.group})">申请奖状</button>`;
        }
        
        rankItem.innerHTML = rankHTML;
        rankingList.appendChild(rankItem);
    });
    
    // 隐藏原来的证书申请部分
    certificateSection.style.display = 'none';
}

// 申请奖状
function applyCertificate(groupNumber) {
    // 确保只有当前小组的成员可以为自己的小组申请奖状
    if (groupNumber !== currentGroup) {
        alert('您只能为自己所在的小组申请奖状');
        return;
    }
    
    const groupsWithTotal = groups.map((group, index) => {
        const scores = group.scores;
        let totalScore = 0;
        let weightSum = 0;
        
        if (scores.ai && scores.ai.total) {
            totalScore += scores.ai.total * 0.2;
            weightSum += 0.2;
        }
        if (scores.teacher && scores.teacher.total) {
            totalScore += scores.teacher.total * 0.3;
            weightSum += 0.3;
        }
        if (scores.self && scores.self.total) {
            totalScore += scores.self.total * 0.1;
            weightSum += 0.1;
        }
        if (scores.peer && scores.peer.length > 0) {
            const peerAverage = scores.peer.reduce((sum, peer) => sum + peer.total, 0) / scores.peer.length;
            totalScore += peerAverage * 0.4;
            weightSum += 0.4;
        }
        
        const finalScore = weightSum > 0 ? totalScore / weightSum : 0;
        
        return {
            group: index + 1,
            score: finalScore
        };
    });
    
    groupsWithTotal.sort((a, b) => b.score - a.score);
    const currentGroupRank = groupsWithTotal.findIndex(item => item.group === groupNumber) + 1;
    const currentGroupScore = groupsWithTotal.find(item => item.group === groupNumber).score;
    
    if (currentGroupRank > 3) {
        alert('只有前三名可以申请奖状');
        return;
    }
    
    const certificatePreview = document.getElementById('certificatePreview');
    const now = new Date();
    
    certificatePreview.innerHTML = `
        <h4>跨学科项目学习优胜奖状</h4>
        <p>恭喜<strong>小组${groupNumber}</strong>在本次跨学科项目学习中获得第<strong>${currentGroupRank}</strong>名！</p>
        <p>最终得分：<strong>${currentGroupScore.toFixed(2)}</strong></p>
        <p>颁发时间：${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日</p>
        <button onclick="printCertificate()">打印奖状</button>
    `;
    
    certificatePreview.style.display = 'block';
}

// 打印奖状
function printCertificate() {
    window.print();
}

// 从localStorage加载数据
function loadFromStorage() {
    const storedGroups = localStorage.getItem('physicsClassroomGroups');
    
    if (storedGroups) {
        groups = JSON.parse(storedGroups);
    } else {
        // 初始化8个小组的数据
        groups = Array.from({ length: 8 }, (_, index) => ({
            id: index + 1,
            report: null,
            video: null,
            scores: {
                ai: null,
                teacher: null,
                self: null,
                peer: []
            }
        }));
        
        saveToStorage();
    }
}

// 保存数据到localStorage
function saveToStorage() {
    localStorage.setItem('physicsClassroomGroups', JSON.stringify(groups));
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', initApp);
