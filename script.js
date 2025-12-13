// 跨学科项目学习智能评估系统

// 全局变量
let currentUser = null;
let currentUserType = null;

// 初始化系统
document.addEventListener('DOMContentLoaded', function() {
    // 加载本地存储数据
    loadData();
    
    // 登录功能
    document.getElementById('login-btn').addEventListener('click', login);
    
    // 退出登录功能
    document.getElementById('logout-btn').addEventListener('click', logout);
    
    // 标签页切换功能
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', switchTab);
    });
    
    // 用户类型切换
    document.getElementById('user-type').addEventListener('change', function() {
        const groupSelect = document.getElementById('group-number');
        if (this.value === 'teacher') {
            groupSelect.style.display = 'none';
        } else {
            groupSelect.style.display = 'block';
        }
    });
    
    // 文件上传功能
    document.getElementById('upload-report-btn').addEventListener('click', uploadReport);
    document.getElementById('upload-video-btn').addEventListener('click', uploadVideo);
    
    // 评分功能
    document.getElementById('ai-score-btn').addEventListener('click', aiScore);
    document.getElementById('submit-score-btn').addEventListener('click', submitScore);
    
    // 奖状申请功能
    document.getElementById('apply-certificate-btn').addEventListener('click', applyCertificate);
    
    // 初始化界面
    updateInterface();
});

// 数据结构定义
function initData() {
    if (!localStorage.getItem('projectData')) {
        const initialData = {
            groups: {
                1: { name: '小组1', report: null, video: null },
                2: { name: '小组2', report: null, video: null },
                3: { name: '小组3', report: null, video: null },
                4: { name: '小组4', report: null, video: null },
                5: { name: '小组5', report: null, video: null },
                6: { name: '小组6', report: null, video: null },
                7: { name: '小组7', report: null, video: null },
                8: { name: '小组8', report: null, video: null }
            },
            scores: {
                ai: {}, // AI评分 { groupId: { 创新性: 85, 科学性: 90, 实用性: 80, 完整性: 88, 表达清晰: 92 } }
                teacher: {}, // 教师评分 { groupId: 90 }
                self: {}, // 小组自评 { rater: groupId, ratee: groupId, score: 85 }
                peer: {} // 小组互评 { rater: groupId, ratee: groupId, score: 88 }
            },
            certificates: [] // 奖状记录 { groupId: 1, rank: 1, date: '2023-12-13' }
        };
        localStorage.setItem('projectData', JSON.stringify(initialData));
    }
}

// 加载数据
function loadData() {
    initData();
    return JSON.parse(localStorage.getItem('projectData'));
}

// 保存数据
function saveData(data) {
    localStorage.setItem('projectData', JSON.stringify(data));
}

// 登录功能
function login() {
    const userType = document.getElementById('user-type').value;
    const groupNumber = document.getElementById('group-number').value;
    
    if (userType === 'group' && !groupNumber) {
        alert('请选择组号');
        return;
    }
    
    currentUserType = userType;
    currentUser = userType === 'teacher' ? 'teacher' : parseInt(groupNumber);
    
    // 显示主界面
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('main-container').style.display = 'block';
    
    // 更新用户信息
    const userInfo = userType === 'teacher' ? '教师' : `小组${groupNumber}`;
    document.getElementById('current-user').textContent = `当前用户：${userInfo}`;
    
    // 更新界面
    updateInterface();
}

// 退出登录功能
function logout() {
    currentUser = null;
    currentUserType = null;
    
    // 显示登录界面
    document.getElementById('login-container').style.display = 'block';
    document.getElementById('main-container').style.display = 'none';
    
    // 重置登录表单
    document.getElementById('user-type').value = 'group';
    document.getElementById('group-number').value = '';
    document.getElementById('group-number').style.display = 'block';
}

// 标签页切换功能
function switchTab(e) {
    // 移除所有活动标签页
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    
    // 激活当前标签页
    e.target.classList.add('active');
    const tabId = e.target.getAttribute('data-tab');
    document.getElementById(`${tabId}-tab`).classList.add('active');
    
    // 更新对应模块内容
    if (tabId === 'upload') updateUploadTab();
    if (tabId === 'score') updateScoreTab();
    if (tabId === 'rank') updateRankTab();
    if (tabId === 'certificate') updateCertificateTab();
}

// 更新界面
function updateInterface() {
    if (currentUser) {
        updateUploadTab();
        updateScoreTab();
        updateRankTab();
        updateCertificateTab();
    }
}

// 更新上传标签页
function updateUploadTab() {
    const data = loadData();
    const container = document.getElementById('all-materials');
    container.innerHTML = '';
    
    // 显示所有小组的材料
    for (let i = 1; i <= 8; i++) {
        const group = data.groups[i];
        const groupDiv = document.createElement('div');
        groupDiv.className = 'group-materials';
        groupDiv.innerHTML = `<h4>${group.name}</h4>`;
        
        // 显示报告
        if (group.report) {
            const reportItem = document.createElement('div');
            reportItem.className = 'material-item';
            reportItem.innerHTML = `<strong>项目报告：</strong>${group.report.name} <a href="${group.report.url}" target="_blank">查看</a>`;
            groupDiv.appendChild(reportItem);
        } else {
            const reportItem = document.createElement('div');
            reportItem.className = 'material-item';
            reportItem.textContent = '项目报告：未上传';
            groupDiv.appendChild(reportItem);
        }
        
        // 显示视频
        if (group.video) {
            const videoItem = document.createElement('div');
            videoItem.className = 'material-item';
            videoItem.innerHTML = `<strong>实验视频：</strong>${group.video.name}<br><video class="video-preview" controls src="${group.video.url}"></video>`;
            groupDiv.appendChild(videoItem);
        } else {
            const videoItem = document.createElement('div');
            videoItem.className = 'material-item';
            videoItem.textContent = '实验视频：未上传';
            groupDiv.appendChild(videoItem);
        }
        
        container.appendChild(groupDiv);
    }
}

// 上传报告
function uploadReport() {
    const fileInput = document.getElementById('report-upload');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('请选择要上传的报告文件');
        return;
    }
    
    // 检查文件大小（限制100MB）
    if (file.size > 100 * 1024 * 1024) {
        alert('文件大小不能超过100MB');
        return;
    }
    
    // 检查文件格式
    const allowedTypes = ['.txt', '.doc', '.docx', '.pdf'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
        alert('请上传txt、doc、docx或pdf格式的文件');
        return;
    }
    
    // 模拟文件上传（实际项目中需要后端支持）
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = loadData();
        data.groups[currentUser].report = {
            name: file.name,
            url: e.target.result,
            size: file.size,
            type: file.type,
            uploadTime: new Date().toISOString()
        };
        saveData(data);
        alert('报告上传成功');
        updateUploadTab();
    };
    reader.readAsDataURL(file);
}

// 上传视频
function uploadVideo() {
    const fileInput = document.getElementById('video-upload');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('请选择要上传的视频文件');
        return;
    }
    
    // 检查文件大小（限制100MB）
    if (file.size > 100 * 1024 * 1024) {
        alert('文件大小不能超过100MB');
        return;
    }
    
    // 检查文件格式
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (fileExtension !== '.mp4') {
        alert('请上传MP4格式的视频文件');
        return;
    }
    
    // 模拟文件上传（实际项目中需要后端支持）
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = loadData();
        data.groups[currentUser].video = {
            name: file.name,
            url: e.target.result,
            size: file.size,
            type: file.type,
            uploadTime: new Date().toISOString()
        };
        saveData(data);
        alert('视频上传成功');
        updateUploadTab();
    };
    reader.readAsDataURL(file);
}

// 更新评分标签页
function updateScoreTab() {
    const data = loadData();
    const container = document.getElementById('all-scores');
    container.innerHTML = '';
    
    // 计算并显示所有小组的得分
    for (let i = 1; i <= 8; i++) {
        const totalScore = calculateTotalScore(i);
        const scoreCard = document.createElement('div');
        scoreCard.className = 'score-card';
        scoreCard.innerHTML = `<h4>${data.groups[i].name}</h4><p>总分：${totalScore.toFixed(2)}</p>`;
        container.appendChild(scoreCard);
    }
}

// AI评分功能
function aiScore() {
    const targetGroup = document.getElementById('score-target').value;
    if (!targetGroup) {
        alert('请选择要评分的小组');
        return;
    }
    
    const data = loadData();
    const groupId = parseInt(targetGroup);
    
    // 检查是否有报告
    if (!data.groups[groupId].report) {
        alert('该小组尚未上传报告');
        return;
    }
    
    // 显示加载状态
    const resultContainer = document.getElementById('ai-score-result');
    resultContainer.innerHTML = '<h3>AI评分中，请稍候...</h3>';
    
    // 调用AI评分（实际项目中应替换为真实API调用）
    callAIModel(groupId).then(aiScores => {
        // 保存AI评分
        data.scores.ai[groupId] = aiScores;
        saveData(data);
        
        // 显示评分结果
        resultContainer.innerHTML = `
            <h3>AI评分结果（小组${groupId}）</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 20px;">
                <div style="flex: 1; min-width: 150px; padding: 10px; background-color: #f9f9f9; border-radius: 5px;">
                    <p><strong>创新性：</strong>${aiScores.创新性}分</p>
                </div>
                <div style="flex: 1; min-width: 150px; padding: 10px; background-color: #f9f9f9; border-radius: 5px;">
                    <p><strong>科学性：</strong>${aiScores.科学性}分</p>
                </div>
                <div style="flex: 1; min-width: 150px; padding: 10px; background-color: #f9f9f9; border-radius: 5px;">
                    <p><strong>实用性：</strong>${aiScores.实用性}分</p>
                </div>
                <div style="flex: 1; min-width: 150px; padding: 10px; background-color: #f9f9f9; border-radius: 5px;">
                    <p><strong>完整性：</strong>${aiScores.完整性}分</p>
                </div>
                <div style="flex: 1; min-width: 150px; padding: 10px; background-color: #f9f9f9; border-radius: 5px;">
                    <p><strong>表达清晰：</strong>${aiScores.表达清晰}分</p>
                </div>
            </div>
            <p style="margin-top: 20px;"><strong>平均得分：</strong>${((aiScores.创新性 + aiScores.科学性 + aiScores.实用性 + aiScores.完整性 + aiScores.表达清晰) / 5).toFixed(2)}分</p>
        `;
        
        // 更新界面
        updateScoreTab();
        updateRankTab();
    }).catch(error => {
        alert('AI评分失败：' + error.message);
        resultContainer.innerHTML = '<h3>AI评分失败，请重试</h3>';
    });
}

// 调用AI模型（模拟）
async function callAIModel(groupId) {
    const data = loadData();
    const report = data.groups[groupId].report;
    
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 在实际项目中，这里应该调用豆包、千义等AI大模型的API
    // 示例代码（需要替换为实际API调用）：
    /*
    const response = await fetch('AI_MODEL_API_URL', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer YOUR_API_KEY'
        },
        body: JSON.stringify({
            prompt: `请对以下项目报告从5个方面进行评分（0-100分）：\n1. 创新性\n2. 科学性\n3. 实用性\n4. 完整性\n5. 表达清晰\n\n报告内容：${report.content}`,
            max_tokens: 1000
        })
    });
    
    const result = await response.json();
    // 解析AI返回的评分结果
    const aiScores = parseAIScores(result);
    return aiScores;
    */
    
    // 模拟AI评分结果
    // 实际项目中应替换为从AI API返回的真实评分
    return {
        创新性: Math.floor(Math.random() * 15) + 85, // 85-100分
        科学性: Math.floor(Math.random() * 15) + 85,
        实用性: Math.floor(Math.random() * 15) + 85,
        完整性: Math.floor(Math.random() * 15) + 85,
        表达清晰: Math.floor(Math.random() * 15) + 85
    };
}

// 解析AI评分结果（示例函数）
function parseAIScores(aiResponse) {
    // 实际项目中需要根据AI返回的格式进行解析
    // 这里只是示例
    return {
        创新性: 90,
        科学性: 88,
        实用性: 92,
        完整性: 85,
        表达清晰: 95
    };
}

// 提交评分功能
function submitScore() {
    const targetGroup = document.getElementById('score-target').value;
    if (!targetGroup) {
        alert('请选择要评分的小组');
        return;
    }
    
    const scoreInputs = document.querySelectorAll('.score-input');
    let totalScore = 0;
    let hasEmpty = false;
    
    // 验证评分
    scoreInputs.forEach(input => {
        if (!input.value || isNaN(input.value) || input.value < 0 || input.value > 100) {
            hasEmpty = true;
        } else {
            totalScore += parseFloat(input.value);
        }
    });
    
    if (hasEmpty) {
        alert('请填写有效的评分（0-100分）');
        return;
    }
    
    const averageScore = totalScore / 5;
    const data = loadData();
    const groupId = parseInt(targetGroup);
    
    // 根据用户角色保存评分
    if (currentUserType === 'teacher') {
        // 教师评分
        data.scores.teacher[groupId] = averageScore;
    } else if (currentUser === groupId) {
        // 小组自评
        data.scores.self[currentUser] = averageScore;
    } else {
        // 小组互评
        if (!data.scores.peer[currentUser]) {
            data.scores.peer[currentUser] = {};
        }
        data.scores.peer[currentUser][groupId] = averageScore;
    }
    
    saveData(data);
    alert('评分提交成功');
    
    // 重置评分表单
    scoreInputs.forEach(input => input.value = '');
    
    // 更新界面
    updateScoreTab();
    updateRankTab();
}

// 计算总分
function calculateTotalScore(groupId) {
    const data = loadData();
    
    // AI评分（20%）
    let aiScore = 0;
    if (data.scores.ai[groupId]) {
        const aiScores = data.scores.ai[groupId];
        aiScore = (aiScores.创新性 + aiScores.科学性 + aiScores.实用性 + aiScores.完整性 + aiScores.表达清晰) / 5;
    }
    
    // 教师评分（30%）
    const teacherScore = data.scores.teacher[groupId] || 0;
    
    // 小组自评（10%）
    const selfScore = data.scores.self[groupId] || 0;
    
    // 小组互评（40%）
    let peerScore = 0;
    let peerCount = 0;
    for (let rater = 1; rater <= 8; rater++) {
        if (rater !== groupId && data.scores.peer[rater] && data.scores.peer[rater][groupId]) {
            peerScore += data.scores.peer[rater][groupId];
            peerCount++;
        }
    }
    peerScore = peerCount > 0 ? peerScore / peerCount : 0;
    
    // 计算总分
    const totalScore = aiScore * 0.2 + teacherScore * 0.3 + selfScore * 0.1 + peerScore * 0.4;
    return totalScore;
}

// 更新排名标签页
function updateRankTab() {
    const data = loadData();
    const container = document.getElementById('ranking-list');
    container.innerHTML = '';
    
    // 计算所有小组的总分
    const groupsWithScores = [];
    for (let i = 1; i <= 8; i++) {
        groupsWithScores.push({
            id: i,
            name: data.groups[i].name,
            score: calculateTotalScore(i),
            aiScore: data.scores.ai[i] ? (data.scores.ai[i].创新性 + data.scores.ai[i].科学性 + data.scores.ai[i].实用性 + data.scores.ai[i].完整性 + data.scores.ai[i].表达清晰) / 5 : 0,
            teacherScore: data.scores.teacher[i] || 0,
            selfScore: data.scores.self[i] || 0
        });
    }
    
    // 按分数排序
    groupsWithScores.sort((a, b) => b.score - a.score);
    
    // 显示排名
    groupsWithScores.forEach((group, index) => {
        const rankItem = document.createElement('div');
        rankItem.className = 'rank-item';
        
        // 添加排名图标
        let rankIcon = '';
        if (index === 0) rankIcon = '🥇';
        if (index === 1) rankIcon = '🥈';
        if (index === 2) rankIcon = '🥉';
        
        rankItem.innerHTML = `
            <div class="rank-number">${rankIcon} ${index + 1}</div>
            <div class="rank-info">
                <h4>${group.name}</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 10px; font-size: 14px; color: #666;">
                    <p>AI评分: ${group.aiScore.toFixed(1)}</p>
                    <p>教师评分: ${group.teacherScore.toFixed(1)}</p>
                    <p>自评: ${group.selfScore.toFixed(1)}</p>
                </div>
            </div>
            <div class="rank-score">${group.score.toFixed(2)}</div>
        `;
        
        // 添加动画效果
        rankItem.style.opacity = '0';
        rankItem.style.transform = 'translateY(20px)';
        container.appendChild(rankItem);
        
        // 触发动画
        setTimeout(() => {
            rankItem.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            rankItem.style.opacity = '1';
            rankItem.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    // 添加更新时间
    const updateTime = document.createElement('div');
    updateTime.style.textAlign = 'center';
    updateTime.style.marginTop = '20px';
    updateTime.style.color = '#666';
    updateTime.style.fontSize = '14px';
    updateTime.textContent = `最后更新时间：${new Date().toLocaleTimeString()}`;
    container.appendChild(updateTime);
}

// 实时更新排名（每10秒）
setInterval(() => {
    if (currentUser && document.getElementById('rank-tab').classList.contains('active')) {
        updateRankTab();
    }
}, 10000);

// 更新奖状标签页
function updateCertificateTab() {
    const data = loadData();
    const infoContainer = document.getElementById('certificate-info');
    const applyBtn = document.getElementById('apply-certificate-btn');
    
    // 计算当前排名
    const groupsWithScores = [];
    for (let i = 1; i <= 8; i++) {
        groupsWithScores.push({
            id: i,
            name: data.groups[i].name,
            score: calculateTotalScore(i)
        });
    }
    groupsWithScores.sort((a, b) => b.score - a.score);
    
    // 检查当前用户是否在前三名
    const userRank = groupsWithScores.findIndex(group => group.id === currentUser) + 1;
    
    if (currentUserType === 'teacher') {
        infoContainer.innerHTML = '<p>教师可以查看所有奖状申请</p>';
        applyBtn.style.display = 'none';
    } else if (userRank <= 3 && userRank > 0) {
        infoContainer.innerHTML = `<p>恭喜！您的小组当前排名第${userRank}名，可以申请奖状。</p>`;
        applyBtn.disabled = false;
        applyBtn.style.display = 'block';
    } else {
        infoContainer.innerHTML = '<p>只有排名前三的小组可以申请奖状</p>';
        applyBtn.disabled = true;
        applyBtn.style.display = 'block';
    }
}

// 申请奖状功能
function applyCertificate() {
    const data = loadData();
    
    // 计算当前排名
    const groupsWithScores = [];
    for (let i = 1; i <= 8; i++) {
        groupsWithScores.push({
            id: i,
            name: data.groups[i].name,
            score: calculateTotalScore(i)
        });
    }
    groupsWithScores.sort((a, b) => b.score - a.score);
    
    const userRank = groupsWithScores.findIndex(group => group.id === currentUser) + 1;
    const userScore = groupsWithScores.find(group => group.id === currentUser).score;
    
    if (userRank > 3) {
        alert('只有排名前三的小组可以申请奖状');
        return;
    }
    
    // 创建奖状
    const certificate = {
        groupId: currentUser,
        rank: userRank,
        score: userScore,
        date: new Date().toISOString(),
        id: Date.now()
    };
    
    // 保存奖状记录
    data.certificates.push(certificate);
    saveData(data);
    
    // 显示奖状预览
    const previewContainer = document.getElementById('certificate-preview');
    const rankText = ['', '一', '二', '三'][userRank];
    const rankIcon = ['', '🥇', '🥈', '🥉'][userRank];
    
    previewContainer.innerHTML = `
        <div class="certificate" style="font-family: 'SimSun', serif; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #FF6B35; font-size: 36px; margin: 0;\ text-shadow: 2px 2px 4px rgba(0,0,0,0.1);">荣誉证书</h1>
                <div style="font-size: 18px; color: #666; margin-top: 10px;">CERTIFICATE OF HONOR</div>
            </div>
            
            <div style="text-align: center; margin-bottom: 30px;">
                <p style="font-size: 20px; margin: 10px 0;">兹证明</p>
                <h2 style="font-size: 28px; color: #333; margin: 20px 0;">${rankIcon} 小组${currentUser} ${rankIcon}</h2>
                <p style="font-size: 20px; margin: 10px 0;">在本次跨学科项目学习中表现优异，</p>
                <p style="font-size: 20px; margin: 10px 0;">荣获第${rankText}名的好成绩！</p>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-top: 50px;">
                <div style="text-align: center;">
                    <p style="font-size: 16px; margin: 5px 0;">总分</p>
                    <p style="font-size: 24px; font-weight: bold; color: #4CAF50;">${userScore.toFixed(2)}</p>
                </div>
                <div style="text-align: center;">
                    <p style="font-size: 16px; margin: 5px 0;">颁发日期</p>
                    <p style="font-size: 18px; color: #666;">${new Date().toLocaleDateString()}</p>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 40px;">
                <div style="width: 120px; height: 80px; margin: 0 auto;">
                    <div style="width: 100%; height: 2px; background-color: #333; margin-top: 40px;"></div>
                    <p style="font-size: 16px; margin: 5px 0;">系统颁发</p>
                </div>
            </div>
        </div>
        <div style="text-align: center; margin-top: 20px;">
            <button onclick="printCertificate()" style="background-color: #4CAF50; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-size: 16px;">打印奖状</button>
        </div>
    `;
    
    alert('奖状申请成功！');
}

// 打印奖状功能
function printCertificate() {
    const previewContainer = document.getElementById('certificate-preview');
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write('<html><head><title>奖状打印</title>');
    printWindow.document.write('<style>body { font-family: "SimSun", serif; margin: 20px; }</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(previewContainer.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}

// 数据同步功能
function syncData() {
    if (!currentUser) return;
    
    console.log('正在同步数据...');
    
    // 模拟数据同步（实际项目中需要后端API支持）
    // 这里通过检查LocalStorage的修改时间来模拟数据更新
    const lastSyncTime = localStorage.getItem('lastSyncTime');
    const currentData = loadData();
    
    // 模拟从服务器获取最新数据
    // 在实际项目中，这里应该是一个API调用
    simulateServerSync().then(serverData => {
        if (serverData) {
            // 合并服务器数据和本地数据
            const mergedData = mergeData(currentData, serverData);
            
            // 保存合并后的数据
            saveData(mergedData);
            
            // 更新界面
            updateInterface();
            
            console.log('数据同步完成');
        }
        
        // 更新最后同步时间
        localStorage.setItem('lastSyncTime', new Date().toISOString());
    }).catch(error => {
        console.error('数据同步失败:', error);
    });
}

// 模拟服务器同步
async function simulateServerSync() {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 在实际项目中，这里应该是从服务器获取最新数据
    // 由于是纯前端实现，我们返回null表示没有新数据
    // 实际项目中应替换为真实的API调用
    return null;
}

// 合并数据
function mergeData(localData, serverData) {
    if (!serverData) return localData;
    
    // 合并数据逻辑
    // 在实际项目中，需要根据数据类型和时间戳进行合并
    // 这里简单返回服务器数据
    return serverData;
}

// 定期同步数据（每30秒）
setInterval(syncData, 30000);

// 页面可见性变化时同步数据
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && currentUser) {
        syncData();
    }
});

// 窗口获得焦点时同步数据
window.addEventListener('focus', function() {
    if (currentUser) {
        syncData();
    }
});