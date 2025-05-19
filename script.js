// 全局变量
let players = [];
let matches = [];

// 添加单个选手（修复版）
function addPlayer() {
  const playerName = document.getElementById('playerName').value.trim();
  if (playerName && !players.includes(playerName)) {
    players.push(playerName);
    updatePlayerList();
    if (matches.length > 0) {
      generateMatches();
    }
    document.getElementById('playerName').value = '';
    showToast(`已添加选手: ${playerName}`, 'success');
  } else if (players.includes(playerName)) {
    showToast(`选手 ${playerName} 已存在`, 'warning');
  }
}

// 增强版批量添加函数（修复版）
function batchAddPlayers() {
  const input = document.getElementById('batchPlayers');
  const names = input.value.split(/[,，、\n]+/)
    .map(name => name.trim())
    .filter(name => name.length > 0);

  let addedCount = 0;
  names.forEach(name => {
    if (!players.includes(name)) {
      players.push(name);
      addedCount++;
    }
  });

  if (addedCount > 0) {
    updatePlayerList();
    if (matches.length > 0) {
      generateMatches();
    }
    showToast(`成功添加 ${addedCount} 位新选手`, 'success');
  } else {
    showToast("没有新增有效选手", 'info');
  }
  input.value = '';
}

// 修复后的选手列表更新函数
function updatePlayerList() {
  const playerListElement = document.getElementById('playerList');
  if (!playerListElement) {
    console.error('playerList元素未找到');
    return;
  }

  playerListElement.innerHTML = players.map((player, index) => `
    <li class="player-item">
      <span>${player}</span>
      <button class="delete-player" onclick="removePlayer(${index})">×</button>
    </li>
  `).join('');
}

// 移除选手（修复版）
function removePlayer(index) {
  const removedPlayer = players[index];
  players.splice(index, 1);
  updatePlayerList();
  if (matches.length > 0) {
    generateMatches();
  }
  showToast(`已移除选手: ${removedPlayer}`, 'info');
}

// 增强版提示函数
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

// 计算单打比赛场次
function calculateSingleMatches() {
  const rounds = parseInt(document.getElementById('roundsPerPlayer').value) || 1;
  const totalMatches = Math.ceil(players.length * rounds / 2);
  return Math.max(totalMatches, 1);
}

// 计算双打比赛场次
function calculateDoubleMatches() {
  const rounds = parseInt(document.getElementById('roundsPerPlayer').value) || 1;
  const teamCount = Math.ceil(players.length / 2);
  const totalMatches = Math.ceil(teamCount * rounds);
  return Math.max(totalMatches, 1);
}

// 生成随机比赛对阵
function generateMatches() {
  if (players.length < 2) {
    showToast("至少需要2位选手才能生成比赛", 'error');
    return false;
  }
  
  matches = [];
  const matchType = document.getElementById('matchType').value;
  let totalMatches;
  
  if (matchType === 'single') {
    totalMatches = calculateSingleMatches();
  } else {
    if (players.length < 4) {
      showToast('双打比赛至少需要4名选手！', 'error');
      return false;
    }
    totalMatches = calculateDoubleMatches();
  }
  
  for (let i = 0; i < totalMatches; i++) {
    let playerA, playerB;
    
    if (matchType === 'single') {
      let indexA, indexB;
      do {
        indexA = Math.floor(Math.random() * players.length);
        indexB = Math.floor(Math.random() * players.length);
      } while (indexA === indexB);
      
      playerA = players[indexA];
      playerB = players[indexB];
    } else {
      const shuffled = [...players].sort(() => 0.5 - Math.random());
      playerA = `${shuffled[0]} & ${shuffled[1]}`;
      playerB = `${shuffled[2]} & ${shuffled[3]}`;
      
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
    showToast('已清空所有数据', 'info');
  }
}

// 选手管理功能 - 全新实现
document.addEventListener('DOMContentLoaded', function() {
    // 初始化选手列表显示
    const playerList = document.getElementById('currentPlayerList');
    if(playerList.children.length === 0) {
        playerList.innerHTML = '<div class="no-players">暂无选手，请添加</div>';
    }

    // 单个添加功能
    document.getElementById('addPlayerBtn').addEventListener('click', addSinglePlayer);
    
    // 批量添加功能
    document.getElementById('batchAddBtn').addEventListener('click', batchAddPlayers);
    
    // 回车键添加支持
    document.getElementById('playerNameInput').addEventListener('keypress', function(e) {
        if(e.key === 'Enter') addSinglePlayer();
    });
});

function addSinglePlayer() {
    const name = document.getElementById('playerNameInput').value.trim();
    if(name) {
        addPlayerToList(name);
        document.getElementById('playerNameInput').value = '';
    }
}

function batchAddPlayers() {
    const namesInput = document.getElementById('batchPlayerInput').value.trim();
    if(namesInput) {
        const names = namesInput.split(',').map(name => name.trim()).filter(name => name);
        names.forEach(name => addPlayerToList(name));
        document.getElementById('batchPlayerInput').value = '';
    }
}

function addPlayerToList(name) {
    const playerList = document.getElementById('currentPlayerList');
    
    if(playerList.innerHTML.includes('暂无选手')) {
        playerList.innerHTML = '';
    }
    
    const playerItem = document.createElement('div');
    playerItem.className = 'player-item';
    playerItem.innerHTML = `
        <span>${name}</span>
        <span class="delete-player">×</span>
    `;
    
    playerList.appendChild(playerItem);
    
    playerItem.querySelector('.delete-player').addEventListener('click', function() {
        playerItem.remove();
        if(playerList.children.length === 0) {
            playerList.innerHTML = '<div class="no-players">暂无选手，请添加</div>';
        }
    });
}