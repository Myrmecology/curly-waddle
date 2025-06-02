// Get canvas and context
const canvas = document.getElementById('duckCanvas');
const ctx = canvas.getContext('2d');

// Game state
let ducks = [];
let breadcrumbs = [];
let animationId;

// Duck class with curly waddle behavior
class Duck {
    constructor(x, y) {
        this.x = x || Math.random() * (canvas.width - 60) + 30;
        this.y = y || Math.random() * (canvas.height - 60) + 30;
        this.baseSpeed = 0.5 + Math.random() * 1;
        this.direction = Math.random() * Math.PI * 2;
        this.waddlePhase = Math.random() * Math.PI * 2;
        this.size = 20 + Math.random() * 15;
        this.color = this.getRandomDuckColor();
        this.tailCurl = 0;
        this.lastDirection = this.direction;
    }

    getRandomDuckColor() {
        const colors = ['#FFD700', '#FFA500', '#FFFF99', '#F0E68C', '#DEB887'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        // Create curly waddle movement
        this.waddlePhase += 0.1;
        this.tailCurl += 0.15;
        
        // Curly movement pattern
        const waddleOffset = Math.sin(this.waddlePhase) * 2;
        const curlyOffset = Math.cos(this.waddlePhase * 0.7) * 1.5;
        
        // Move in current direction with waddle
        this.x += Math.cos(this.direction) * this.baseSpeed + waddleOffset;
        this.y += Math.sin(this.direction) * this.baseSpeed + curlyOffset;
        
        // Bounce off walls
        if (this.x <= this.size/2 || this.x >= canvas.width - this.size/2) {
            this.direction = Math.PI - this.direction;
            this.x = Math.max(this.size/2, Math.min(canvas.width - this.size/2, this.x));
        }
        if (this.y <= this.size/2 || this.y >= canvas.height - this.size/2) {
            this.direction = -this.direction;
            this.y = Math.max(this.size/2, Math.min(canvas.height - this.size/2, this.y));
        }
        
        // Check for breadcrumb collision
        this.checkBreadcrumbCollision();
    }

    checkBreadcrumbCollision() {
        for (let i = breadcrumbs.length - 1; i >= 0; i--) {
            const breadcrumb = breadcrumbs[i];
            const distance = Math.sqrt((this.x - breadcrumb.x) ** 2 + (this.y - breadcrumb.y) ** 2);
            
            if (distance < this.size) {
                // Move towards breadcrumb
                const angle = Math.atan2(breadcrumb.y - this.y, breadcrumb.x - this.x);
                this.direction = angle;
                
                // Eat breadcrumb if close enough
                if (distance < this.size/2) {
                    breadcrumbs.splice(i, 1);
                    updateStats();
                }
            }
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.direction);
        
        // Duck body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Duck head
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(this.size * 0.6, 0, this.size * 0.6, this.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Duck beak
        ctx.fillStyle = '#FF6347';
        ctx.beginPath();
        ctx.ellipse(this.size * 1.1, 0, this.size * 0.3, this.size * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Duck eye
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.ellipse(this.size * 0.8, -this.size * 0.2, this.size * 0.1, this.size * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Curly tail
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-this.size * 0.8, 0);
        
        // Create curly tail pattern
        const curlX = -this.size * 1.2 + Math.cos(this.tailCurl) * this.size * 0.3;
        const curlY = Math.sin(this.tailCurl) * this.size * 0.4;
        ctx.quadraticCurveTo(-this.size, curlY, curlX, curlY * 0.5);
        ctx.stroke();
        
        ctx.restore();
    }

    changeDirection() {
        this.direction += (Math.random() - 0.5) * Math.PI;
    }
}

// Breadcrumb class
class Breadcrumb {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 5 + Math.random() * 5;
        this.age = 0;
        this.maxAge = 300; // Breadcrumbs disappear after 5 seconds
    }

    update() {
        this.age++;
        return this.age < this.maxAge;
    }

    draw() {
        const alpha = 1 - (this.age / this.maxAge);
        ctx.fillStyle = `rgba(139, 69, 19, ${alpha})`;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.size, this.size * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Initialize ducks
function initDucks() {
    ducks = [];
    for (let i = 0; i < 3; i++) {
        ducks.push(new Duck());
    }
}

// Animation loop
function animate() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw ducks
    ducks.forEach(duck => {
        duck.update();
        duck.draw();
    });
    
    // Update and draw breadcrumbs
    breadcrumbs = breadcrumbs.filter(breadcrumb => {
        const stillAlive = breadcrumb.update();
        if (stillAlive) {
            breadcrumb.draw();
        }
        return stillAlive;
    });
    
    // Update stats
    updateStats();
    
    animationId = requestAnimationFrame(animate);
}

// Event handlers
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Make all ducks change direction when canvas is clicked
    ducks.forEach(duck => {
        duck.changeDirection();
    });
    
    // Add a breadcrumb at click location
    breadcrumbs.push(new Breadcrumb(clickX, clickY));
});

document.getElementById('addDuck').addEventListener('click', () => {
    if (ducks.length < 10) { // Limit to 10 ducks
        ducks.push(new Duck());
    }
});

document.getElementById('addBreadcrumb').addEventListener('click', () => {
    const x = Math.random() * (canvas.width - 40) + 20;
    const y = Math.random() * (canvas.height - 40) + 20;
    breadcrumbs.push(new Breadcrumb(x, y));
});

document.getElementById('clearDucks').addEventListener('click', () => {
    ducks = [];
    breadcrumbs = [];
    updateStats();
});

// Update stats display
function updateStats() {
    document.getElementById('duckCount').textContent = ducks.length;
    document.getElementById('breadcrumbCount').textContent = breadcrumbs.length;
}

// Start the simulation
initDucks();
animate();
updateStats();