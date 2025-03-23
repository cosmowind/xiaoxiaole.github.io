class RenderSystem {
    constructor(canvas, cellSize) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cellSize = cellSize;
    }

    drawGrid(grid, selectedCandy, mousePos) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid[i].length; j++) {
                const x = j * this.cellSize;
                const y = i * this.cellSize;
                
                // 绘制格子背景
                this.drawCell(x, y, i, j);
                
                // 绘制糖果
                this.drawCandy(x, y, grid[i][j]);

                // 绘制选中效果
                if (selectedCandy && selectedCandy.row === i && selectedCandy.col === j) {
                    this.drawSelection(x, y);
                    this.drawSwapHints(i, j, grid.length);
                }
                
                // 绘制鼠标悬停效果
                if (this.shouldDrawHover(i, j, mousePos, selectedCandy)) {
                    this.drawHoverEffect(x, y);
                }
            }
        }
    }

    drawCell(x, y, row, col) {
        this.ctx.fillStyle = (row + col) % 2 === 0 ? '#f0f0f0' : '#ffffff';
        this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
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

        // 绘制糖果
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = colors[type - 1];
        this.ctx.fill();

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
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.fill();

        this.ctx.restore();
    }

    drawSelection(x, y) {
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 4;
        this.ctx.strokeRect(x, y, this.cellSize, this.cellSize);
    }

    drawSwapHints(row, col, gridSize) {
        const directions = [
            {dr: -1, dc: 0, angle: -Math.PI/2}, // 上
            {dr: 1, dc: 0, angle: Math.PI/2},   // 下
            {dr: 0, dc: -1, angle: Math.PI},    // 左
            {dr: 0, dc: 1, angle: 0}            // 右
        ];

        directions.forEach(({dr, dc, angle}) => {
            const newRow = row + dr;
            const newCol = col + dc;
            
            if (newRow >= 0 && newRow < gridSize &&
                newCol >= 0 && newCol < gridSize) {
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

    drawHoverEffect(x, y) {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
    }

    shouldDrawHover(row, col, mousePos, selectedCandy) {
        if (!mousePos) return false;
        return mousePos.row === row && 
               mousePos.col === col && 
               (!selectedCandy || this.isAdjacentToSelected(row, col, selectedCandy));
    }

    isAdjacentToSelected(row, col, selectedCandy) {
        if (!selectedCandy) return false;
        const rowDiff = Math.abs(row - selectedCandy.row);
        const colDiff = Math.abs(col - selectedCandy.col);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }
}