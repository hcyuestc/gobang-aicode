const path = require('path');

const TEMPLATE = `
    <div id="game-board"></div>
    <div id="game-status"></div>
    <span id="current-player-dot"></span>
    <span id="current-player-text"></span>
    <button id="restart-btn"></button>
    <button id="undo-btn"></button>
    <span id="black-score"></span>
    <span id="white-score"></span>
    <div id="game-over-modal"></div>
    <h2 id="winner-text"></h2>
    <button id="new-game-btn"></button>
`;

function createEmptyBoard(size) {
    return Array.from({ length: size }, () =>
        Array.from({ length: size }, () => 0)
    );
}

describe('五子棋核心逻辑', () => {
    let hooks;

    beforeEach(() => {
        document.body.innerHTML = TEMPLATE;
        jest.resetModules();

        require(path.resolve(__dirname, '../script.js'));
        document.dispatchEvent(new Event('DOMContentLoaded'));
        hooks = window.__gomokuTestHooks;
    });

    test('checkWinAt 能够识别横向五连珠', () => {
        const { BOARD_SIZE, BLACK, WHITE } = hooks.constants;
        const board = createEmptyBoard(BOARD_SIZE);
        for (let offset = 0; offset < 5; offset += 1) {
            board[7][3 + offset] = BLACK;
        }
        board[7][2] = WHITE;
        hooks.setBoardState(board);

        expect(hooks.checkWinAt(7, 5)).toBe(true);
    });

    test('checkWinAt 不会被被打断的棋型误判', () => {
        const { BOARD_SIZE, BLACK } = hooks.constants;
        const board = createEmptyBoard(BOARD_SIZE);
        board[5][4] = BLACK;
        board[5][5] = BLACK;
        board[5][7] = BLACK;
        board[5][8] = BLACK;
        hooks.setBoardState(board);

        expect(hooks.checkWinAt(5, 5)).toBe(false);
    });

    test('checkDrawState 在棋盘被填满时返回 true', () => {
        const { BOARD_SIZE, BLACK, WHITE } = hooks.constants;
        const board = Array.from({ length: BOARD_SIZE }, (_, row) =>
            Array.from({ length: BOARD_SIZE }, (_, col) =>
                (row + col) % 2 === 0 ? BLACK : WHITE
            )
        );
        hooks.setBoardState(board);

        expect(hooks.checkDrawState()).toBe(true);
    });
});

