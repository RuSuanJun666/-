// 全局变量
let players = [];
let matches = [];

// 计算单打合理的轮次选项
function calculateRoundsOptions(playerCount) {
    if (playerCount < 2) return [];
    
    // 单循环比赛轮次
    const singleRound = playerCount - 1;
    
    // 双循环比赛轮次
    const doubleRound = (playerCount - 1) * 2;
    
    // 根据人数推荐的轮次
    let recommendedRound = singleRound;
    if (playerCount > 4) {
        recommendedRound = Math.ceil(singleRound * 0.75); // 75%的单循环轮次
    }
    
    return [
        {value: singleRound, text: `单循环 (${singleRound}轮)`},
        {value: doubleRound, text: `双循环 (${doubleRound}轮)`},
        {value: recommendedRound, text: `推荐轮次 (${recommendedRound}轮)`}
    ];
}

// 更新单打轮次选择下拉框
function updateRoundsSelect() {
    const select = document.getElementById('roundsPerPlayer');
    if (!select) return;
    
    const options = calculateRoundsOptions(players.length);
    
    select.innerHTML = '';
    if (options.length === 0) {
        select.disabled = true;
        select.innerHTML = '<option value="">请先添加选手</option>';
        return;
    }
    
    select.disabled = false;
    options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.text;
        select.appendChild(option);
    });
    
    // 默认选择推荐轮次
    if (options.length >= 3) {
        select.value = options[2].value;
    }
}

// 改进的单打贝格尔轮转编排法
function bergerArrange(players, rounds) {
    const n = players.length;
    if (n < 2) return [];
    
    // 如果选手数量为奇数，添加"轮空"
    const hasBye = n % 2 !== 0;
    const playerList = hasBye ? [...players, '轮空'] : [...players];
    const totalPlayers = playerList.length;
    
    const matches = [];
    const playerRoundMap = {}; // 记录选手在每轮的比赛情况
    
    // 初始化选手轮次映射
    playerList.forEach(player => {
        playerRoundMap[player] = {};
    });
    
    // 固定第一个选手
    const fixedPlayer = playerList[0];
    const rotatingPlayers = playerList.slice(1);
    
    for (let round = 1; round <= rounds; round++) {
        // 旋转数组
        if (round > 1) {
            const last = rotatingPlayers.pop();
            rotatingPlayers.unshift(last);
        }
        
        // 生成本轮对阵
        const roundMatches = [];
        const usedPlayers = new Set();
        
        // 固定选手的比赛
        const fixedOpponent = rotatingPlayers[rotatingPlayers.length - 1];
        if (fixedPlayer !== '轮空' && fixedOpponent !== '轮空') {
            roundMatches.push({
                round: round,
                playerA: fixedPlayer,
                playerB: fixedOpponent
            });
            usedPlayers.add(fixedPlayer);
            usedPlayers.add(fixedOpponent);
        }
        
        // 其他选手的比赛
        for (let i = 0; i < Math.floor(totalPlayers / 2) - 1; i++) {
            const playerA = rotatingPlayers[i];
            const playerB = rotatingPlayers[totalPlayers - 2 - i];
            
            // 检查选手是否已在本轮比赛过
            if (!usedPlayers.has(playerA) && !usedPlayers.has(playerB) && 
                playerA !== '轮空' && playerB !== '轮空' && 
                playerA !== playerB) {
                
                // 检查选手是否在本轮已经对阵过其他选手
                if (!playerRoundMap[playerA][round] && !playerRoundMap[playerB][round]) {
                    roundMatches.push({
                        round: round,
                        playerA: playerA,
                        playerB: playerB
                    });
                    usedPlayers.add(playerA);
                    usedPlayers.add(playerB);
                    
                    // 标记选手已在本轮比赛
                    playerRoundMap[playerA][round] = true;
                    playerRoundMap[playerB][round] = true;
                }
            }
        }
        
        matches.push(...roundMatches);
    }
    
    return matches;
}

// 添加单个选手
function addPlayer(name) {
    const playerName = name.trim();
    if (playerName && !players.includes(playerName)) {
        players.push(playerName);
        updatePlayerList();
        updateRoundsSelect(); // 更新轮次选择
        if (matches.length > 0) {
            generateMatches();
        }
        showToast(`已添加选手: ${playerName}`, 'success');
    } else if (players.includes(playerName)) {
        showToast(`选手 ${playerName} 已存在`, 'warning');
    }
}

// 批量添加选手
function batchAddPlayers(namesText) {
    const separators = /[,，、\n;；\s]+/;
    const names = namesText.split(separators)
        .map(name => name.trim())
        .filter(name => name.length > 0);
    
    let addedCount = 0;
    let duplicateCount = 0;
    
    names.forEach(name => {
        if (!players.includes(name)) {
            players.push(name);
            addedCount++;
        } else {
            duplicateCount++;
        }
    });

    if (addedCount > 0) {
        updatePlayerList();
        updateRoundsSelect(); // 更新轮次选择
        if (matches.length > 0) {
            generateMatches();
        }
        let message = `成功添加 ${addedCount} 位新选手`;
        if (duplicateCount > 0) {
            message += ` (跳过 ${duplicateCount} 位重复选手)`;
        }
        showToast(message, 'success');
    } else if (duplicateCount > 0) {
        showToast(`所有 ${duplicateCount} 位选手都已存在`, 'info');
    } else {
        showToast("没有检测到有效选手名称", 'warning');
    }
}

// 更新选手列表
function updatePlayerList() {
    const playerListElement = document.getElementById('currentPlayerList');
    if (!playerListElement) {
        console.error('playerList元素未找到');
        return;
    }

    if (players.length === 0) {
        playerListElement.innerHTML = '<div class="no-players">暂无选手，请添加</div>';
        return;
    }

    playerListElement.innerHTML = players.map((player, index) => `
        <div class="player-item" data-index="${index}">
            <span>${player}</span>
            <span class="delete-player" onclick="removePlayer(${index})">×</span>
        </div>
    `).join('');
}

// 移除选手
function removePlayer(index) {
    const removedPlayer = players[index];
    players.splice(index, 1);
    updatePlayerList();
    updateRoundsSelect(); // 更新轮次选择
    if (matches.length > 0) {
        generateMatches();
    }
    showToast(`已移除选手: ${removedPlayer}`, 'info');
}

// 提示函数
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// 选手管理功能
document.addEventListener('DOMContentLoaded', function() {
    const playerList = document.getElementById('currentPlayerList');
    const addBtn = document.getElementById('addPlayerBtn');
    const batchBtn = document.getElementById('batchAddBtn');
    const nameInput = document.getElementById('playerNameInput');
    const batchInput = document.getElementById('batchPlayerInput');

    if(!playerList || !addBtn || !batchBtn || !nameInput || !batchInput) {
        console.error('缺少必要的HTML元素！');
        return;
    }

    if(players.length === 0) {
        playerList.innerHTML = '<div class="no-players">暂无选手，请添加</div>';
    }

    addBtn.addEventListener('click', addSinglePlayer);
    batchBtn.addEventListener('click', handleBatchAdd);
    nameInput.addEventListener('keypress', function(e) {
        if(e.key === 'Enter') addSinglePlayer();
    });

    function addSinglePlayer() {
        const name = nameInput.value.trim();
        if(name) {
            addPlayer(name);
            nameInput.value = '';
        }
    }

    function handleBatchAdd() {
        const namesText = batchInput.value.trim();
        if(namesText) {
            batchAddPlayers(namesText);
            batchInput.value = '';
        } else {
            showToast("请输入要批量添加的选手名称", 'warning');
        }
    }
    
    // 初始化轮次选择
    updateRoundsSelect();
});

// 生成比赛对阵
function generateMatches() {
    if (players.length < 2) {
        showToast("至少需要2位选手才能生成比赛", 'error');
        return false;
    }
    
    const matchType = document.getElementById('matchType').value;
    const rounds = parseInt(document.getElementById('roundsPerPlayer').value) || 1;
    
    matches = [];
    
    if (matchType === 'single') {
        // 使用改进的贝格尔轮转编排法生成单打比赛
        const bergerMatches = bergerArrange(players, rounds);
        
        bergerMatches.forEach((match, index) => {
            matches.push({
                id: Date.now() + index,
                matchNumber: index + 1,
                playerA: match.playerA,
                playerB: match.playerB,
                scoreA: 0,
                scoreB: 0,
                completed: false,
                round: match.round
            });
        });
    } else {
        // 改进的双打比赛逻辑
        if (players.length < 4) {
            showToast('双打比赛至少需要4名选手！', 'error');
            return false;
        }

        const totalRounds = Math.ceil((players.length * rounds) / 4); // 每场双打比赛的轮数
        const playerStats = {};
        
        players.forEach(player => playerStats[player] = { matches: 0 });

        for (let i = 0; i < totalRounds; i++) {
            let shuffledPlayers = [...players].sort(() => 0.5 - Math.random());
            for (let j = 0; j < shuffledPlayers.length; j += 4) {
                if (j + 3 < shuffledPlayers.length) {
                    let teamA = `${shuffledPlayers[j]} & ${shuffledPlayers[j + 1]}`;
                    let teamB = `${shuffledPlayers[j + 2]} & ${shuffledPlayers[j + 3]}`;

                    if (playerStats[shuffledPlayers[j]].matches < rounds / 2 &&
                        playerStats[shuffledPlayers[j + 1]].matches < rounds / 2 &&
                        playerStats[shuffledPlayers[j + 2]].matches < rounds / 2 &&
                        playerStats[shuffledPlayers[j + 3]].matches < rounds / 2) {

                        matches.push({
                            id: Date.now() + matches.length,
                            matchNumber: matches.length + 1,
                            playerA: teamA,
                            playerB: teamB,
                            scoreA: 0,
                            scoreB: 0,
                            completed: false,
                            round: Math.floor(i / (players.length / 4)) + 1
                        });

                        playerStats[shuffledPlayers[j]].matches++;
                        playerStats[shuffledPlayers[j + 1]].matches++;
                        playerStats[shuffledPlayers[j + 2]].matches++;
                        playerStats[shuffledPlayers[j + 3]].matches++;
                    }
                }
            }
        }
    }
    
    updateMatchTable();
    return true;
}

// 更新比赛表格
function updateMatchTable() {
    const tbody = document.getElementById('matchBody');
    
    if (!tbody) {
        console.error('matchBody元素未找到');
        return;
    }

    if (matches.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <div>⛔ 暂无比赛数据</div>
                    <div>请先添加选手并生成比赛</div>
                </td>
            </tr>
        `;
        return;
    }
    
    // 按轮次分组
    const rounds = {};
    matches.forEach(match => {
        if (!rounds[match.round]) {
            rounds[match.round] = [];
        }
        rounds[match.round].push(match);
    });
    
    // 生成表格内容
    let html = '';
    Object.keys(rounds).sort().forEach(round => {
        html += `<tr class="round-header"><td colspan="6">第 ${round} 轮</td></tr>`;
        
        rounds[round].forEach(match => {
            html += `
                <tr>
                    <td>${match.matchNumber}</td>
                    <td>${match.playerA}</td>
                    <td>
                        <div class="score-input">
                            <input type="number" min="0" value="${match.scoreA}" 
                                   onchange="updateScore(${match.id}, 'A', this.value)">
                            <span>:</span>
                            <input type="number" min="0" value="${match.scoreB}" 
                                   onchange="updateScore(${match.id}, 'B', this.value)">
                        </div>
                    </td>
                    <td>${match.playerB}</td>
                    <td class="action-buttons">
                        <button onclick="completeMatch(${match.id})" 
                                class="${match.completed ? 'secondary' : ''}">
                            ${match.completed ? '已结束' : '结束比赛'}
                        </button>
                        <button onclick="deleteMatch(${match.id})" class="danger">删除</button>
                    </td>
                </tr>
            `;
        });
    });
    
    tbody.innerHTML = html;
}

// 更新比分
function updateScore(matchId, player, score) {
    const match = matches.find(m => m.id === matchId);
    if (!match) return;
    
    score = parseInt(score) || 0;
    
    if (player === 'A') {
        match.scoreA = score;
    } else {
        match.scoreB = score;
    }
}

// 标记比赛完成
function completeMatch(matchId) {
    const match = matches.find(m => m.id === matchId);
    if (match) {
        match.completed = !match.completed;
        updateMatchTable();
    }
}

// 删除比赛
function deleteMatch(matchId) {
    matches = matches.filter(m => m.id !== matchId);
    updateMatchTable();
}

// 清空所有数据
function clearAll() {
    if (confirm('确定要清空所有选手和比赛数据吗？')) {
        players = [];
        matches = [];
        updatePlayerList();
        updateRoundsSelect();
        updateMatchTable();
        showToast('已清空所有数据', 'info');
    }
}

// 获取选手参赛次数统计
function getPlayerStats() {
    const stats = {};
    players.forEach(player => {
        stats[player] = {
            matches: 0,
            wins: 0,
            losses: 0,
            pointsFor: 0,
            pointsAgainst: 0
        };
    });
    
    matches.forEach(match => {
        if (match.completed) {
            // 单打比赛统计
            if (match.playerA.indexOf('&') === -1 && match.playerB.indexOf('&') === -1) {
                stats[match.playerA].matches++;
                stats[match.playerB].matches++;
                
                stats[match.playerA].pointsFor += match.scoreA;
                stats[match.playerA].pointsAgainst += match.scoreB;
                
                stats[match.playerB].pointsFor += match.scoreB;
                stats[match.playerB].pointsAgainst += match.scoreA;
                
                if (match.scoreA > match.scoreB) {
                    stats[match.playerA].wins++;
                    stats[match.playerB].losses++;
                } else if (match.scoreA < match.scoreB) {
                    stats[match.playerA].losses++;
                    stats[match.playerB].wins++;
                }
            }
        }
    });
    
    return stats;
}

// 显示选手统计数据
function showPlayerStats() {
    const stats = getPlayerStats();
    let html = '<table class="stats-table"><tr><th>选手</th><th>比赛场次</th><th>胜场</th><th>负场</th><th>得分</th><th>失分</th></tr>';
    
    Object.keys(stats).forEach(player => {
        const s = stats[player];
        html += `<tr>
            <td>${player}</td>
            <td>${s.matches}</td>
            <td>${s.wins}</td>
            <td>${s.losses}</td>
            <td>${s.pointsFor}</td>
            <td>${s.pointsAgainst}</td>
        </tr>`;
    });
    
    html += '</table>';
    
    const statsContainer = document.getElementById('playerStats');
    if (statsContainer) {
        statsContainer.innerHTML = html;
    } else {
        // 如果没有统计容器，创建一个临时弹窗显示
        const popup = document.createElement('div');
        popup.className = 'stats-popup';
        popup.innerHTML = `
            <div class="stats-content">
                <h3>选手统计</h3>
                ${html}
                <button onclick="this.parentNode.parentNode.remove()">关闭</button>
            </div>
        `;
        document.body.appendChild(popup);
    }
}
