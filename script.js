// 全局变量
let players = [];
let matches = [];

// 添加单个选手
function addPlayer() {
    const input = document.getElementById('newPlayer');
    const name = input.value.trim();
    
    if (name && !players.includes(name)) {
        players.push(name);
        input.value = '';
        updatePlayerList();
    } else if (players.includes(name)) {
        alert('该选手已存在！');
    }
}

// 增强版提示函数
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  
  // 根据类型设置不同颜色
  const colors = {
    success: '#4CAF50',
    error: '#F44336',
    info: '#2196F3',
    warning: '#FF9800'
  };
  toast.style.backgroundColor = colors[type] || colors.info;
  
  toast.textContent = message;
  document.body.appendChild(toast);
  
  // 自动移除
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// 修改后的批量添加函数
function batchAddPlayers() {
    const input = document.getElementById('batchPlayers');
    const names = input.value.split(/[,，、\n]+/)
        .map(name => name.trim())
        .filter(name => name.length > 0 && !/^[,，、\n]+$/.test(name));
    
    if (names.length > 0) {
        const beforeCount = players.length;
        const newPlayers = [...new Set([...players, ...names])];
        
        if (newPlayers.length > beforeCount) {
            players = newPlayers;
            updatePlayerList();
            showToast(`成功添加 ${newPlayers.length - beforeCount} 位选手`, 'success');
        } else {
            showToast('所有选手均已存在', 'warning');
        }
        input.value = '';
    } else {
        showToast('请输入有效选手名称', 'error');
    }
}
// 移除选手
function removePlayer(index) {
    players.splice(index, 1);
    updatePlayerList();
    
    // 如果选手被移除，需要重新生成比赛
    if (matches.length > 0) {
        generateMatches();
    }
}

// 更新选手列表显示
function updatePlayerList() {
  const playerListElement = document.getElementById('playerList');
  playerListElement.innerHTML = '';

  // 创建容器（新增）
  const container = document.createElement('div');
  container.className = 'player-list-container';
  const listElement = document.createElement('ul');
  listElement.className = 'player-list';

  players.forEach((player, index) => {
    const playerItem = document.createElement('li');
    playerItem.className = 'player-item';
    
    // 选手名字
    const nameSpan = document.createElement('span');
    nameSpan.textContent = player;
    
    // 删除按钮
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-player';
    deleteBtn.innerHTML = '×'; // 使用×符号
    deleteBtn.onclick = () => {
      players.splice(index, 1);
      updatePlayerList();
      showToast(`已移除选手: ${player}`, 'info');
    };

    playerItem.appendChild(nameSpan);
    playerItem.appendChild(deleteBtn);
    listElement.appendChild(playerItem);
  });

  container.appendChild(listElement);
  playerListElement.appendChild(container);
}
// 计算单打比赛场次
function calculateSingleMatches() {
    const rounds = parseInt(document.getElementById('roundsPerPlayer').value);
    const totalMatches = Math.ceil(players.length * rounds / 2);
    
    // 确保至少生成1场比赛
    return Math.max(totalMatches, 1);
}

// 计算双打比赛场次
function calculateDoubleMatches() {
    const rounds = parseInt(document.getElementById('roundsPerPlayer').value);
    const teamCount = Math.ceil(players.length / 2);
    const totalMatches = Math.ceil(teamCount * rounds);
    
    return Math.max(totalMatches, 1);
}

// 生成随机比赛对阵
function generateMatches() {
    if (players.length < 2) {
        alert('至少需要2名选手才能生成比赛！');
        return;
    }
    
    const matchType = document.getElementById('matchType').value;
    let totalMatches;
    
    if (matchType === 'single') {
        totalMatches = calculateSingleMatches();
    } else {
        if (players.length < 4) {
            alert('双打比赛至少需要4名选手！');
            return;
        }
        totalMatches = calculateDoubleMatches();
    }
    
    // 清空现有比赛
    matches = [];
    
    // 生成新比赛
    for (let i = 0; i < totalMatches; i++) {
        let playerA, playerB;
        
        if (matchType === 'single') {
            // 单打：随机选择两名不同选手
            let indexA, indexB;
            do {
                indexA = Math.floor(Math.random() * players.length);
                indexB = Math.floor(Math.random() * players.length);
            } while (indexA === indexB);
            
            playerA = players[indexA];
            playerB = players[indexB];
        } else {
            // 双打：随机分成两队
            const shuffled = [...players].sort(() => 0.5 - Math.random());
            playerA = `${shuffled[0]} & ${shuffled[1]}`;
            playerB = `${shuffled[2]} & ${shuffled[3]}`;
            
            // 如果选手数量大于4，后续比赛使用其他组合
            if (players.length > 4) {
                const nextIndex = 4 + (i % Math.floor((players.length - 4) / 2)) * 2;
                if (nextIndex + 1 < players.length) {
                    playerA = `${shuffled[nextIndex]} & ${shuffled[nextIndex + 1]}`;
                    playerB = `${shuffled[(nextIndex + 2) % players.length]} & ${shuffled[(nextIndex + 3) % players.length]}`;
                }
            }
        }
        
        matches.push({
            id: Date.now() + i,
            matchNumber: i + 1,
            playerA: playerA,
            playerB: playerB,
            scoreA: 0,
            scoreB: 0,
            completed: false
        });
    }
    
    updateMatchTable();
}

// 更新比赛表格
function updateMatchTable() {
    const tbody = document.getElementById('matchBody');
    
    if (matches.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    <div>⛔ 暂无比赛数据</div>
                    <div>请先添加选手并生成比赛</div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = matches.map(match => `
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
    `).join('');
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
        updateMatchTable();
    }
}

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    updatePlayerList();
    updateMatchTable();
});