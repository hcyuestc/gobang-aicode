document.addEventListener('DOMContentLoaded', () => {
    // 游戏常量
    const BOARD_SIZE = 15; // 15x15棋盘
    const EMPTY = 0;
    const BLACK = 1;
    const WHITE = 2;
    
    // 游戏状态
    let gameBoard = [];
    let currentPlayer = BLACK;
    let gameOver = false;
    let moveHistory = [];
    let scores = { black: 0, white: 0 };
    
    // DOM元素
    const boardElement = document.getElementById('game-board');
    const statusElement = document.getElementById('game-status');
    const currentPlayerDot = document.getElementById('current-player-dot');
    const currentPlayerText = document.getElementById('current-player-text');
    const restartButton = document.getElementById('restart-btn');
    const undoButton = document.getElementById('undo-btn');
    const blackScoreElement = document.getElementById('black-score');
    const whiteScoreElement = document.getElementById('white-score');
    const gameOverModal = document.getElementById('game-over-modal');
    const winnerText = document.getElementById('winner-text');
    const newGameButton = document.getElementById('new-game-btn');
    
    // 初始化游戏
    function initGame() {
        // 初始化棋盘数组
        gameBoard = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(EMPTY));
        
        // 清空棋盘
        boardElement.innerHTML = '';
        
        // 设置棋盘大小（响应式）
        updateBoardSize();
        
        // 设置当前玩家
        currentPlayer = BLACK;
        gameOver = false;
        moveHistory = [];
        
        // 更新UI
        updateStatus();
        updateUndoButton();
        
        // 添加棋盘事件监听
        boardElement.addEventListener('click', handleBoardClick);
        boardElement.addEventListener('touchstart', handleBoardTouch);
        boardElement.addEventListener('touchend', handleTouchEnd);
        boardElement.addEventListener('touchmove', handleTouchMove);
    }
    
    // 更新棋盘大小（响应式）
    function updateBoardSize() {
        const boardWidth = boardElement.clientWidth;
        const cellSize = boardWidth / BOARD_SIZE;
        
        boardElement.style.backgroundSize = `${cellSize}px ${cellSize}px`;
        
        // 确保棋盘是正方形
        boardElement.style.width = `${boardWidth}px`;
        boardElement.style.height = `${boardWidth}px`;
    }
    
    // 处理棋盘点击
    function handleBoardClick(event) {
        if (gameOver) return;
        
        const rect = boardElement.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        placeStone(x, y);
    }
    
    // 处理触摸事件（移动端支持）
    function handleBoardTouch(event) {
        event.preventDefault(); // 防止触摸时的默认行为
        
        if (gameOver) return;
        
        const rect = boardElement.getBoundingClientRect();
        const touch = event.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        placeStone(x, y);
    }
    
    // 处理触摸结束事件，防止双击缩放
    function handleTouchEnd(event) {
        event.preventDefault();
    }
    
    // 处理触摸移动事件，防止页面滚动
    function handleTouchMove(event) {
        event.preventDefault();
    }
    
    // 放置棋子
    function placeStone(x, y) {
        const boardWidth = boardElement.clientWidth;
        const cellSize = boardWidth / BOARD_SIZE;
        
        // 计算最近的交叉点
        let col = Math.round(x / cellSize);
        let row = Math.round(y / cellSize);
        
        // 边界检查
        if (col < 0 || col >= BOARD_SIZE || row < 0 || row >= BOARD_SIZE) {
            return;
        }
        
        // 检查是否已有棋子
        if (gameBoard[row][col] !== EMPTY) {
            return;
        }
        
        // 在数据中记录棋子
        gameBoard[row][col] = currentPlayer;
        moveHistory.push({ row, col, player: currentPlayer });
        
        // 在UI中绘制棋子
        drawStone(row, col, currentPlayer);
        
        // 更新悔棋按钮状态
        updateUndoButton();
        
        // 检查胜负
        if (checkWin(row, col)) {
            gameOver = true;
            scores[currentPlayer === BLACK ? 'black' : 'white']++;
            updateScoreboard();
            showGameOverModal(currentPlayer);
            return;
        }
        
        // 检查平局
        if (checkDraw()) {
            gameOver = true;
            showGameOverModal(null); // null表示平局
            return;
        }
        
        // 切换玩家
        currentPlayer = currentPlayer === BLACK ? WHITE : BLACK;
        updateStatus();
    }
    
    // 绘制棋子
    function drawStone(row, col, player) {
        const boardWidth = boardElement.clientWidth;
        const cellSize = boardWidth / BOARD_SIZE;
        
        // 移除之前的最后一步标记
        const lastMoveStone = document.querySelector('.stone.last-move');
        if (lastMoveStone) {
            lastMoveStone.classList.remove('last-move');
        }
        
        // 创建新棋子
        const stone = document.createElement('div');
        stone.classList.add('stone');
        stone.classList.add(player === BLACK ? 'black' : 'white');
        stone.classList.add('last-move'); // 标记为最后一步
        
        // 设置位置
        stone.style.left = `${(col + 0.5) * cellSize}px`;
        stone.style.top = `${(row + 0.5) * cellSize}px`;
        
        // 添加到棋盘
        boardElement.appendChild(stone);
    }
    
    // 检查胜负
    function checkWin(row, col) {
        const directions = [
            [1, 0],   // 水平
            [0, 1],   // 垂直
            [1, 1],   // 对角线
            [1, -1]   // 反对角线
        ];
        
        const player = gameBoard[row][col];
        
        for (const [dx, dy] of directions) {
            let count = 1; // 当前位置已有一个棋子
            
            // 正方向
            for (let i = 1; i <= 4; i++) {
                const newRow = row + i * dx;
                const newCol = col + i * dy;
                
                if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE && 
                    gameBoard[newRow][newCol] === player) {
                    count++;
                } else {
                    break;
                }
            }
            
            // 反方向
            for (let i = 1; i <= 4; i++) {
                const newRow = row - i * dx;
                const newCol = col - i * dy;
                
                if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE && 
                    gameBoard[newRow][newCol] === player) {
                    count++;
                } else {
                    break;
                }
            }
            
            // 五子连珠
            if (count >= 5) {
                return true;
            }
        }
        
        return false;
    }
    
    // 检查平局
    function checkDraw() {
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                if (gameBoard[row][col] === EMPTY) {
                    return false; // 还有空位
                }
            }
        }
        return true; // 棋盘已满
    }
    
    // 更新游戏状态显示
    function updateStatus() {
        const playerText = currentPlayer === BLACK ? '黑方' : '白方';
        statusElement.textContent = `轮到${playerText}落子`;
        currentPlayerDot.className = `dot ${currentPlayer === BLACK ? 'black' : 'white'}`;
        currentPlayerText.textContent = `${playerText}回合`;
    }
    
    // 更新悔棋按钮状态
    function updateUndoButton() {
        undoButton.disabled = moveHistory.length === 0 || gameOver;
    }
    
    // 更新分数板
    function updateScoreboard() {
        blackScoreElement.textContent = scores.black;
        whiteScoreElement.textContent = scores.white;
    }
    
    // 显示游戏结束模态框
    function showGameOverModal(winner) {
        if (winner === null) {
            winnerText.textContent = '平局！';
        } else {
            winnerText.textContent = `${winner === BLACK ? '黑方' : '白方'}获胜！`;
        }
        gameOverModal.style.display = 'flex';
    }
    
    // 隐藏游戏结束模态框
    function hideGameOverModal() {
        gameOverModal.style.display = 'none';
    }
    
    // 重新开始游戏
    function restartGame() {
        initGame();
        hideGameOverModal();
    }
    
    // 悔棋
    function undoMove() {
        if (moveHistory.length === 0 || gameOver) {
            return;
        }
        
        // 移除最后一步
        const lastMove = moveHistory.pop();
        gameBoard[lastMove.row][lastMove.col] = EMPTY;
        
        // 重新渲染棋盘
        boardElement.innerHTML = '';
        for (let i = 0; i < moveHistory.length; i++) {
            const move = moveHistory[i];
            drawStone(move.row, move.col, move.player);
        }
        
        // 切换回上一个玩家
        currentPlayer = lastMove.player;
        updateStatus();
        updateUndoButton();
    }
    
    // 事件监听器
    restartButton.addEventListener('click', restartGame);
    undoButton.addEventListener('click', undoMove);
    newGameButton.addEventListener('click', restartGame);
    
    // 点击模态框外部关闭
    gameOverModal.addEventListener('click', (event) => {
        if (event.target === gameOverModal) {
            hideGameOverModal();
        }
    });
    
    // 窗口大小改变时更新棋盘大小
    function handleResize() {
        updateBoardSize();
        // 重新渲染所有棋子
        boardElement.innerHTML = '';
        for (let i = 0; i < moveHistory.length; i++) {
            const move = moveHistory[i];
            drawStone(move.row, move.col, move.player);
        }
    }
    
    // 添加窗口大小改变事件监听，使用防抖优化性能
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleResize, 100);
    });

    // 提供测试钩子，便于在不依赖DOM交互的情况下验证核心逻辑
    if (typeof window !== 'undefined') {
        window.__gomokuTestHooks = {
            setBoardState(state) {
                if (!Array.isArray(state) || state.length !== BOARD_SIZE) {
                    throw new Error('state must be a 15x15 array');
                }
                gameBoard = state.map((row) => {
                    if (!Array.isArray(row) || row.length !== BOARD_SIZE) {
                        throw new Error('state must be a 15x15 array');
                    }
                    return row.slice();
                });
            },
            getBoardState() {
                return gameBoard.map((row) => row.slice());
            },
            checkWinAt(row, col) {
                return checkWin(row, col);
            },
            checkDrawState() {
                return checkDraw();
            },
            constants: {
                BOARD_SIZE,
                EMPTY,
                BLACK,
                WHITE,
            },
        };
    }
    
    // 初始化游戏
    // 添加禁止双击缩放的meta标签支持
    if (!document.querySelector('meta[name="viewport"]')) {
        const viewportMeta = document.createElement('meta');
        viewportMeta.name = 'viewport';
        viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        document.head.appendChild(viewportMeta);
    }
    
    initGame();
    updateScoreboard();
    
    // 初始化时处理一次棋盘大小
    handleResize();
});