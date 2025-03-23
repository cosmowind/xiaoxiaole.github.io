class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.gridSize = 8;
        this.cellSize = this.canvas.width / this.gridSize;

        // 初始化游戏核心
        this.gameCore = new GameCore(this.gridSize);

        // 初始化渲染系统
        this.renderSystem = new RenderSystem(this.canvas, this.cellSize);

        // 初始化输入处理器
        this.inputHandler = new InputHandler(this.canvas, this.gameCore, this.renderSystem);

        // 开始游戏循环
        this.gameLoop();
    }

    gameLoop() {
        // 更新渲染
        this.renderSystem.drawGrid(
            this.gameCore.grid,
            this.inputHandler.getSelectedCandy(),
            this.inputHandler.getMousePosition()
        );

        // 请求下一帧
        requestAnimationFrame(() => this.gameLoop());
    }
}

// 当页面加载完成时初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});