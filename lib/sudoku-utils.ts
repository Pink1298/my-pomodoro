export const BLANK = 0;
type Board = number[][];

const SHUFFLE = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[j]];
    }
    return array;
}

const isValid = (board: Board, row: number, col: number, num: number) => {
    // Row
    for (let x = 0; x < 9; x++) if (board[row][x] === num) return false;
    // Col
    for (let x = 0; x < 9; x++) if (board[x][col] === num) return false;
    // 3x3 Block
    const startRow = row - (row % 3);
    const startCol = col - (col % 3);
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[i + startRow][j + startCol] === num) return false;
        }
    }
    return true;
}

const solveSudoku = (board: Board, visualize = false): boolean => {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === BLANK) {
                const nums = SHUFFLE([1, 2, 3, 4, 5, 6, 7, 8, 9]);
                for (let num of nums) {
                    if (isValid(board, row, col, num)) {
                        board[row][col] = num;
                        if (solveSudoku(board)) return true;
                        board[row][col] = BLANK;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

export const generateSudoku = (difficulty: 'Easy' | 'Medium' | 'Hard') => {
    // 1. Create a full valid board
    const board = Array.from({ length: 9 }, () => Array(9).fill(BLANK));
    solveSudoku(board);

    // Copy for solution
    const solution = board.map(row => [...row]);

    // 2. Remove numbers based on difficulty
    let attempts = difficulty === 'Easy' ? 30 : difficulty === 'Medium' ? 45 : 55;

    // Naive removal (statistically usually good enough for casual play)
    // A robust generator would check for unique solutions, but that's expensive for client-side JS
    while (attempts > 0) {
        let row = Math.floor(Math.random() * 9);
        let col = Math.floor(Math.random() * 9);
        while (board[row][col] === 0) {
            row = Math.floor(Math.random() * 9);
            col = Math.floor(Math.random() * 9);
        }
        board[row][col] = BLANK;
        attempts--;
    }

    return { initial: board, solution };
}
