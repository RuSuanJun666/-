// 全局变量
let players = [];
let matches = [];

// 添加单个选手（修复版）
function addPlayer(name) {
  const playerName = name.trim();
  if (playerName && !players.includes(playerName)) {
    players.push(playerName);
    updatePlayerList();
    if (matches.length > 0) {
      generateMatches();
    }
    showToast(`已添加选手: ${playerName}`, 'success');
  } else if (players.includes(playerName)) {
    showToast(`选手 ${playerName} 已存在`, 'warning');
  }
}

// 增强版批量添加函数（修复版）
function batchAddPlayers(names) {
  let addedCount = 0;
  names.forEach(name => {
    if (!players.includes(name.trim())) {
      players.push(name.trim());
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
}

// 修复后的选手列表更新函数
function updatePlayerList() {
  const playerListElement = document.getElementById('currentPlayerList');
  if (!playerListElement) {
    console.error('playerList元素未找到');
    return;
  }

  playerListElement.innerHTML = players.map((player, index) => `
    <div class="player-item">
      <span>${player}</span>
      <span class="delete-player" onclick="removePlayer(${index})">×</span>
    </div>
  `).join('');
}

// 移除选手（修复版）
function removePlayer(index) {
  players.splice(index, 1);
  updatePlayerList();
  if (matches.length > 0) {
    generateMatches();
  }
  showToast(`已移除选手: ${players[index]}`, 'info');
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

// 选手管理功能 - 全新实现
document.addEventListener('DOMContentLoaded', function() {
    // 初始化选手列表显示
    const playerList = document.getElementById('currentPlayerList');
    if(playerList.children.length === 0) {
        playerList.innerHTML = '<div class="no-players">暂无选手，请添加</div>';
    }

    // 单个添加功能
    document.getElementById('addPlayerBtn').addEventListener('click', function() {
        const name = document.getElementById('playerNameInput').value.trim();
        if(name) {
            addPlayer(name);
            document.getElementById('playerNameInput').value = '';
        }
    });
    
    // 批量添加功能
    document.getElementById('batchAddBtn').addEventListener('click', function() {
        const namesInput = document.getElementById('batchPlayerInput').value.trim();
        if(namesInput) {
            const names = namesInput.split(/[,，、\n]+/).map(name => name.trim()).filter(name => name);
            batchAddPlayers(names);
            document.getElementById('batchPlayerInput').value = '';
        }
    });
    
    // 回车键添加支持
    document.getElementById('playerNameInput').addEventListener('keypress', function(e) {
        if(e.key === 'Enter') {
            const name = document.getElementById('playerNameInput').value.trim();
            if(name) {
                addPlayer(name);
                document.getElementById('playerNameInput').value = '';
            }
        }
    });
});
