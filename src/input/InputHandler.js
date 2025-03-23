class InputHandler {
    constructor(canvas, gameCore, renderSystem) {
        this.canvas = canvas;
        this.gameCore = gameCore;
        this.renderSystem = renderSystem;
        this.selectedCandy = null;
        this.mousePos = null;

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
        this.canvas.addEventListener('click', this.handleClick.bind(this));
        document.getElementById('restartBtn').addEventListener('click', this.handleRestart.bind(this));
        document.getElementById('helpBtn').addEventListener('click', this.handleHelp.bind(this));
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this.mousePos = {
            row: Math.floor(y / this.renderSystem.cellSize),
            col: Math.floor(x / this.renderSystem.cellSize)
        };
    }

    handleMouseLeave() {
        this.mousePos = null;
    }

    handleClick(e) {
        if (!this.gameCore.canMove()) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const row = Math.floor(y / this.renderSystem.cellSize);
        const col = Math.floor(x / this.renderSystem.cellSize);

        if (this.selectedCandy === null) {
            this.selectedCandy = { row, col };
        } else {
            const rowDiff = Math.abs(row - this.selectedCandy.row);
            const colDiff = Math.abs(col - this.selectedCandy.col);

            if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
                this.trySwapCandies(row, col);
            }
            this.selectedCandy = null;
        }
    }

    trySwapCandies(row, col) {
        this.gameCore.swapCandies(
            this.selectedCandy.row,
            this.selectedCandy.col,
            row,
            col
        );

        if (this.gameCore.findMatches().length > 0) {
            this.gameCore.moves--;
            this.updateUI();
            this.processMatches();
        } else {
            this.gameCore.swapCandies(
                this.selectedCandy.row,
                this.selectedCandy.col,
                row,
                col
            );
        }
    }

    processMatches() {
        const matches = this.gameCore.findMatches();
        if (matches.length > 0) {
            this.gameCore.isAnimating = true;
            this.gameCore.removeMatches();
            this.gameCore.fillEmptySpaces();
            this.gameCore.updateScore(matches.length * 10);
            this.updateUI();
            
            // 检查是否还有可以消除的糖果
            setTimeout(() => {
                this.gameCore.isAnimating = false;
                this.processMatches();
            }, 300);
        }
    }

    handleRestart() {
        this.gameCore.restart();
        this.selectedCandy = null;
        this.updateUI();
    }

    handleHelp() {
        // 实现提示功能
    }

    updateUI() {
        document.getElementById('score').textContent = this.gameCore.score;
        document.getElementById('level').textContent = this.gameCore.level;
        document.getElementById('moves').textContent = this.gameCore.moves;
    }

    getMousePosition() {
        return this.mousePos;
    }

    getSelectedCandy() {
        return this.selectedCandy;
    }
}