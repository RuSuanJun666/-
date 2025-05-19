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
function batchAddPlayers(namesText) {
    // 支持多种分隔符：中英文逗号、换行符、分号、空格
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

// 修复后的选手列表更新函数
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
    if(players.length === 0) {
        playerList.innerHTML = '<div class="no-players">暂无选手，请添加</div>';
    }

    // 事件绑定
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
});

// 比赛相关功能保持不变
function generateMatches() {
    // 保持原有比赛生成逻辑
}

function clearAll() {
    // 保持原有清空逻辑
}