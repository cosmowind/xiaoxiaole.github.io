class GameCore {
    constructor(gridSize = 8, candyTypes = 6) {
        this.gridSize = gridSize;
        this.candyTypes = candyTypes;
        this.grid = [];
        this.score = 0;
        this.level = 1;
        this.moves = 30;
        this.isAnimating = false;

        this.initializeGrid();
    }

    initializeGrid() {
        for (let i = 0; i < this.gridSize; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.gridSize; j++) {
                this.grid[i][j] = Math.floor(Math.random() * this.candyTypes) + 1;
            }
        }
        // 检查并消除初始匹配
        while (this.findMatches().length > 0) {
            this.removeMatches();
            this.fillEmptySpaces();
        }
    }

    findMatches() {
        const matches = [];

        // 检查水平匹配
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize - 2; j++) {
                if (this.grid[i][j] !== 0 &&
                    this.grid[i][j] === this.grid[i][j + 1] &&
                    this.grid[i][j] === this.grid[i][j + 2]) {
                    matches.push({ row: i, col: j });
                    matches.push({ row: i, col: j + 1 });
                    matches.push({ row: i, col: j + 2 });
                }
            }
        }

        // 检查垂直匹配
        for (let i = 0; i < this.gridSize - 2; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] !== 0 &&
                    this.grid[i][j] === this.grid[i + 1][j] &&
                    this.grid[i][j] === this.grid[i + 2][j]) {
                    matches.push({ row: i, col: j });
                    matches.push({ row: i + 1, col: j });
                    matches.push({ row: i + 2, col: j });
                }
            }
        }

        return matches;
    }

    removeMatches() {
        const matches = this.findMatches();
        matches.forEach(({row, col}) => {
            this.grid[row][col] = 0;
        });
    }

    fillEmptySpaces() {
        for (let j = 0; j < this.gridSize; j++) {
            let emptySpaces = 0;
            for (let i = this.gridSize - 1; i >= 0; i--) {
                if (this.grid[i][j] === 0) {
                    emptySpaces++;
                } else if (emptySpaces > 0) {
                    this.grid[i + emptySpaces][j] = this.grid[i][j];
                    this.grid[i][j] = 0;
                }
            }
            // 在顶部填充新的糖果
            for (let i = 0; i < emptySpaces; i++) {
                this.grid[i][j] = Math.floor(Math.random() * this.candyTypes) + 1;
            }
        }
    }

    swapCandies(row1, col1, row2, col2) {
        const temp = this.grid[row1][col1];
        this.grid[row1][col1] = this.grid[row2][col2];
        this.grid[row2][col2] = temp;
    }

    updateScore(points) {
        this.score += points;
        if (this.score >= this.level * 100) {
            this.level++;
            this.moves += 5;
        }
    }

    canMove() {
        return this.moves > 0 && !this.isAnimating;
    }

    restart() {
        this.score = 0;
        this.level = 1;
        this.moves = 30;
        this.initializeGrid();
    }
}