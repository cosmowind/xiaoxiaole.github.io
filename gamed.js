class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 8;
        this.cellSize = this.canvas.width / this.gridSize;
        this.candyTypes = 6;
        this.grid = [];
        this.selectedCandy = null;
        this.score = 0;
        this.level = 1;
        this.moves = 30;
        this.animations = [];
        this.isAnimating = false;
        this.hintTimeout = null;
        this.mousePos = null;

        this.initializeGrid();
        this.setupEventListeners();
        this.updateScore();
        this.gameLoop();
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

    setupEventListeners() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mousePos = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.mousePos = null;
        });

        this.canvas.addEventListener('click', (e) => {
            if (this.isAnimating || this.moves <= 0) return;

            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const row = Math.floor(y / this.cellSize);
            const col = Math.floor(x / this.cellSize);

            if (this.selectedCandy === null) {
                this.selectedCandy = { row, col };
            } else {
                const rowDiff = Math.abs(row - this.selectedCandy.row);
                const colDiff = Math.abs(col - this.selectedCandy.col);

                if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
                    this.swapCandies(this.selectedCandy.row, this.selectedCandy.col, row, col);
                    if (this.findMatches().length > 0) {
                        this.moves--;
                        this.updateMoves();
                        this.processMatches();
                    } else {
                        this.swapCandies(this.selectedCandy.row, this.selectedCandy.col, row, col);
                    }
                }
                this.selectedCandy = null;
            }
        });

        document.getElementById('restartBtn').addEventListener('click', () => this.restart());
        document.getElementById('helpBtn').addEventListener('click', () => this.showHint());
    }

    gameLoop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawGrid();
        requestAnimationFrame(() => this.gameLoop());
    }

    drawGrid() {
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const x = j * this.cellSize;
                const y = i * this.cellSize;
                
                // 绘制格子背景
                this.ctx.fillStyle = (i + j) % 2 === 0 ? '#f0f0f0' : '#ffffff';
                this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
                
                // 绘制糖果
                this.drawCandy(x, y, this.grid[i][j]);

                // 绘制选中效果
                if (this.selectedCandy && this.selectedCandy.row === i && this.selectedCandy.col === j) {
                    // 绘制选中高亮
                    this.ctx.strokeStyle = '#FFD700';
                    this.ctx.lineWidth = 4;
                    this.ctx.strokeRect(x, y, this.cellSize, this.cellSize);
                    
                    // 绘制可交换方向提示
                    this.drawSwapHints(i, j);
                }
                
                // 鼠标悬停效果
                const mousePos = this.getMousePosition();
                if (mousePos && 
                    mousePos.row === i && 
                    mousePos.col === j && 
                    (!this.selectedCandy || 
                    this.isAdjacentToSelected(i, j))) {
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
                }
            }
        }
    }

    drawSwapHints(row, col) {
        const directions = [
            {dr: -1, dc: 0, angle: -Math.PI/2}, // 上
            {dr: 1, dc: 0, angle: Math.PI/2},   // 下
            {dr: 0, dc: -1, angle: Math.PI},    // 左
            {dr: 0, dc: 1, angle: 0}            // 右
        ];

        directions.forEach(({dr, dc, angle}) => {
            const newRow = row + dr;
            const newCol = col + dc;
            
            if (newRow >= 0 && newRow < this.gridSize &&
                newCol >= 0 && newCol < this.gridSize) {
                const x = (col + 0.5) * this.cellSize;
                const y = (row + 0.5) * this.cellSize;
                
                this.ctx.save();
                this.ctx.translate(x, y);
                this.ctx.rotate(angle);
                
                // 绘制箭头
                this.ctx.beginPath();
                this.ctx.moveTo(10, 0);
                this.ctx.lineTo(-10, -10);
                this.ctx.lineTo(-10, 10);
                this.ctx.closePath();
                
                this.ctx.fillStyle = 'rgba(255, 215, 0, 0.6)';
                this.ctx.fill();
                this.ctx.restore();
            }
        });
    }

    getMousePosition() {
        if (!this.mousePos) return null;
        return {
            row: Math.floor(this.mousePos.y / this.cellSize),
            col: Math.floor(this.mousePos.x / this.cellSize)
        };
    }

    isAdjacentToSelected(row, col) {
        if (!this.selectedCandy) return false;
        const rowDiff = Math.abs(row - this.selectedCandy.row);
        const colDiff = Math.abs(col - this.selectedCandy.col);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }
    }

    drawCandy(x, y, type) {
        const colors = [
            '#FF4444', // 红色
            '#4CAF50', // 绿色
            '#2196F3', // 蓝色
            '#FFC107', // 黄色
            '#9C27B0', // 紫色
            '#FF9800'  // 橙色
        ];

        const centerX = x + this.cellSize / 2;
        const centerY = y + this.cellSize / 2;
        const radius = this.cellSize * 0.35;

        // 绘制阴影
        this.ctx.save();
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 5;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;

        // 绘制基础形状
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = colors[type - 1];
        this.ctx.fill();

        // 绘制高光效果
        const gradient = this.ctx.createRadialGradient(
            centerX - radius * 0.3,
            centerY - radius * 0.3,
            radius * 0.1,
            centerX,
            centerY,
            radius
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        this.ctx.globalCompositeOperation = 'overlay';
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        this.ctx.restore();

        // 添加图案
        switch(type) {
            case 1: // 红色糖果 - 星形
                this.drawStar(centerX, centerY, radius * 0.6);
                break;
            case 2: // 绿色糖果 - 花形
                this.drawFlower(centerX, centerY, radius * 0.6);
                break;
            case 3: // 蓝色糖果 - 雪花
                this.drawSnowflake(centerX, centerY, radius * 0.6);
                break;
            case 4: // 黄色糖果 - 太阳
                this.drawSun(centerX, centerY, radius * 0.6);
                break;
            case 5: // 紫色糖果 - 心形
                this.drawHeart(centerX, centerY, radius * 0.6);
                break;
            case 6: // 橙色糖果 - 螺旋
                this.drawSpiral(centerX, centerY, radius * 0.6);
                break;
        }

        // 添加高光效果
        const gradient = this.ctx.createRadialGradient(
            centerX - radius * 0.3,
            centerY - radius * 0.3,
            radius * 0.1,
            centerX,
            centerY,
            radius
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.fill();

        // 添加边框
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.restore();
    }

    drawStar(x, y, radius) {
        const spikes = 5;
        const rotation = Math.PI / 2;
        this.ctx.beginPath();
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for (let i = 0; i < spikes * 2; i++) {
            const r = i % 2 === 0 ? radius : radius * 0.4;
            const angle = (i * Math.PI) / spikes - rotation;
            if (i === 0) this.ctx.moveTo(x + r * Math.cos(angle), y + r * Math.sin(angle));
            else this.ctx.lineTo(x + r * Math.cos(angle), y + r * Math.sin(angle));
        }
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawFlower(x, y, radius) {
        const petals = 6;
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for (let i = 0; i < petals; i++) {
            const angle = (i * 2 * Math.PI) / petals;
            this.ctx.beginPath();
            this.ctx.ellipse(x, y, radius * 0.8, radius * 0.3, angle, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawSnowflake(x, y, radius) {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 2;
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x + radius * Math.cos(angle), y + radius * Math.sin(angle));
            this.ctx.stroke();
        }
    }

    drawSun(x, y, radius) {
        const rays = 12;
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for (let i = 0; i < rays; i++) {
            const angle = (i * 2 * Math.PI) / rays;
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(
                x + radius * Math.cos(angle),
                y + radius * Math.sin(angle)
            );
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
        }
    }

    drawHeart(x, y, radius) {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.beginPath();
        this.ctx.moveTo(x, y + radius * 0.3);
        this.ctx.bezierCurveTo(
            x, y, 
            x - radius, y, 
            x - radius, y + radius
        );
        this.ctx.bezierCurveTo(
            x - radius, y + radius * 1.5,
            x, y + radius * 1.4,
            x, y + radius * 1.4
        );
        this.ctx.bezierCurveTo(
            x, y + radius * 1.4,
            x + radius, y + radius * 1.5,
            x + radius, y + radius
        );
        this.ctx.bezierCurveTo(
            x + radius, y,
            x, y,
            x, y + radius * 0.3
        );
        this.ctx.fill();
    }

    drawSpiral(x, y, radius) {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        for (let i = 0; i < 360; i++) {
            const angle = (i * Math.PI) / 180;
            const r = (radius * i) / 360;
            const px = x + r * Math.cos(angle * 6);
            const py = y + r * Math.sin(angle * 6);
            if (i === 0) this.ctx.moveTo(px, py);
            else this.ctx.lineTo(px, py);
        }
        this.ctx.stroke();
    }
    }

    swapCandies(row1, col1, row2, col2) {
        const temp = this.grid[row1][col1];
        this.grid[row1][col1] = this.grid[row2][col2];
        this.grid[row2][col2] = temp;
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

    async processMatches() {
        this.isAnimating = true;
        const matches = this.findMatches();
        if (matches.length > 0) {
            this.score += matches.length * 10;
            this.updateScore();
            await this.removeMatches();
            await this.fillEmptySpaces();
            await new Promise(resolve => setTimeout(resolve, 300));
            await this.processMatches();
        } else {
            this.isAnimating = false;
            if (this.moves <= 0) {
                this.gameOver();
            }
        }
    }

    removeMatches() {
        const matches = this.findMatches();
        matches.forEach(match => {
            this.grid[match.row][match.col] = 0;
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
            for (let i = 0; i < emptySpaces; i++) {
                this.grid[i][j] = Math.floor(Math.random() * this.candyTypes) + 1;
            }
        }
    }

    // ... 其他方法保持不变 ...

    updateScore() {
        document.getElementById('score').textContent = this.score;
        // 检查是否达到升级条件
        if (this.score >= this.level * 1000) {
            this.levelUp();
        }
    }

    updateMoves() {
        document.getElementById('moves').textContent = this.moves;
    }

    async levelUp() {
        this.level++;
        document.getElementById('level').textContent = this.level;
        this.moves = 30 + (this.level - 1) * 5; // 每升一级增加5步
        this.updateMoves();

        // 显示升级动画
        const text = `Level ${this.level}!`;
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.font = 'bold 48px Arial';
        this.ctx.fillStyle = '#FFD700';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(text, this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.restore();

        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    async gameOver() {
        this.isAnimating = true;

        // 显示游戏结束动画
        const text = '游戏结束';
        const scoreText = `最终得分: ${this.score}`;
        
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.font = 'bold 48px Arial';
        this.ctx.fillStyle = '#FF4444';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(text, this.canvas.width / 2, this.canvas.height / 2 - 30);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillText(scoreText, this.canvas.width / 2, this.canvas.height / 2 + 30);
        this.ctx.restore();

        await new Promise(resolve => setTimeout(resolve, 3000));
        this.restart();
    }

    restart() {
        this.score = 0;
        this.level = 1;
        this.moves = 30;
        this.selectedCandy = null;
        this.isAnimating = false;
        if (this.hintTimeout) {
            clearTimeout(this.hintTimeout);
            this.hintTimeout = null;
        }

        this.updateScore();
        this.updateMoves();
        document.getElementById('level').textContent = this.level;
        this.initializeGrid();
    }

    showHint() {
        if (this.hintTimeout || this.isAnimating || this.moves <= 0) return;

        // 查找可能的移动
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                // 检查水平交换
                if (j < this.gridSize - 1) {
                    this.swapCandies(i, j, i, j + 1);
                    if (this.findMatches().length > 0) {
                        this.swapCandies(i, j, i, j + 1);
                        this.highlightHint(i, j, i, j + 1);
                        return;
                    }
                    this.swapCandies(i, j, i, j + 1);
                }

                // 检查垂直交换
                if (i < this.gridSize - 1) {
                    this.swapCandies(i, j, i + 1, j);
                    if (this.findMatches().length > 0) {
                        this.swapCandies(i, j, i + 1, j);
                        this.highlightHint(i, j, i + 1, j);
                        return;
                    }
                    this.swapCandies(i, j, i + 1, j);
                }
            }
        }
    }

    highlightHint(row1, col1, row2, col2) {
        const originalDraw = this.drawCandy.bind(this);
        let hintAlpha = 0;
        let increasing = true;

        const animate = () => {
            if (increasing) {
                hintAlpha += 0.1;
                if (hintAlpha >= 1) increasing = false;
            } else {
                hintAlpha -= 0.1;
                if (hintAlpha <= 0) increasing = true;
            }

            this.drawCandy = (x, y, type) => {
                originalDraw(x, y, type);
                const row = Math.floor(y / this.cellSize);
                const col = Math.floor(x / this.cellSize);
                if ((row === row1 && col === col1) || (row === row2 && col === col2)) {
                    this.ctx.strokeStyle = `rgba(255, 215, 0, ${hintAlpha})`;
                    this.ctx.lineWidth = 4;
                    this.ctx.stroke();
                }
            };
        };

        const hintAnimation = setInterval(animate, 50);
        this.hintTimeout = setTimeout(() => {
            clearInterval(hintAnimation);
            this.drawCandy = originalDraw;
            this.hintTimeout = null;
        }, 3000);
    }
}