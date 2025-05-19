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

// 选手管理功能 - 安全版本
document.addEventListener('DOMContentLoaded', function() {
    // 获取元素（添加null检查）
    const playerList = document.getElementById('currentPlayerList');
    const addBtn = document.getElementById('addPlayerBtn');
    const batchBtn = document.getElementById('batchAddBtn');
    const nameInput = document.getElementById('playerNameInput');
    const batchInput = document.getElementById('batchPlayerInput');

    // 元素存在性检查
    if(!playerList || !addBtn || !batchBtn || !nameInput || !batchInput) {
        console.error('缺少必要的HTML元素！请检查：');
        console.log('- currentPlayerList:', !!playerList);
        console.log('- addPlayerBtn:', !!addBtn);
        console.log('- batchAddBtn:', !!batchBtn);
        console.log('- playerNameInput:', !!nameInput);
        console.log('- batchPlayerInput:', !!batchInput);
        return;
    }

    // 初始化空列表提示
    if(playerList.children.length === 0) {
        playerList.innerHTML = '<div class="no-players">暂无选手，请添加</div>';
    }

    // 事件绑定
    addBtn.addEventListener('click', addSinglePlayer);
    batchBtn.addEventListener('click', batchAddPlayers);
    nameInput.addEventListener('keypress', function(e) {
        if(e.key === 'Enter') addSinglePlayer();
    });

    function addSinglePlayer() {
        const name = nameInput.value.trim();
        if(name) {
            addPlayerToList(name);
            nameInput.value = '';
        }
    }

    function batchAddPlayers() {
        const namesInput = batchInput.value.trim();
        if(namesInput) {
            const names = namesInput.split(',').map(name => name.trim()).filter(name => name);
            names.forEach(name => addPlayerToList(name));
            batchInput.value = '';
        }
    }

    function addPlayerToList(name) {
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
});