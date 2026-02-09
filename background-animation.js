/**
 * 3D Background Animation for Sveta Calendar
 * Creates floating particles with 3D effect and gradient waves
 */

(function () {
    'use strict';

    // Configuration
    const config = {
        particleCount: 50,
        particleSize: { min: 2, max: 6 },
        particleSpeed: { min: 0.3, max: 1.5 },
        particleColors: ['#4f8cff', '#a855f7', '#f97316', '#3b7aed'],
        waveCount: 3,
        mouseRadius: 150,
        connectionDistance: 120
    };

    // Particle class
    class Particle {
        constructor(canvas) {
            this.canvas = canvas;
            this.reset();
        }

        reset() {
            this.x = Math.random() * this.canvas.width;
            this.y = Math.random() * this.canvas.height;
            this.z = Math.random() * 1000; // Depth for 3D effect
            this.size = config.particleSize.min + Math.random() * (config.particleSize.max - config.particleSize.min);
            this.speedX = (Math.random() - 0.5) * config.particleSpeed.max;
            this.speedY = (Math.random() - 0.5) * config.particleSpeed.max;
            this.speedZ = config.particleSpeed.min + Math.random() * (config.particleSpeed.max - config.particleSpeed.min);
            this.color = config.particleColors[Math.floor(Math.random() * config.particleColors.length)];
            this.opacity = 0.3 + Math.random() * 0.4;
        }

        update(mouseX, mouseY) {
            // Move particle
            this.x += this.speedX;
            this.y += this.speedY;
            this.z -= this.speedZ;

            // Mouse interaction
            if (mouseX !== null && mouseY !== null) {
                const dx = mouseX - this.x;
                const dy = mouseY - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < config.mouseRadius) {
                    const force = (config.mouseRadius - distance) / config.mouseRadius;
                    this.x -= dx * force * 0.03;
                    this.y -= dy * force * 0.03;
                }
            }

            // Wrap around edges
            if (this.x < 0) this.x = this.canvas.width;
            if (this.x > this.canvas.width) this.x = 0;
            if (this.y < 0) this.y = this.canvas.height;
            if (this.y > this.canvas.height) this.y = 0;

            // Reset Z when too close
            if (this.z < 1) {
                this.z = 1000;
            }
        }

        draw(ctx) {
            // Calculate 3D perspective
            const scale = 1000 / (1000 + this.z);
            const x2d = this.x * scale + (this.canvas.width / 2) * (1 - scale);
            const y2d = this.y * scale + (this.canvas.height / 2) * (1 - scale);
            const size = this.size * scale;

            // Draw particle with glow
            ctx.save();
            ctx.globalAlpha = this.opacity * scale;

            // Glow effect
            const gradient = ctx.createRadialGradient(x2d, y2d, 0, x2d, y2d, size * 3);
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(0.5, this.color + '40');
            gradient.addColorStop(1, this.color + '00');

            ctx.fillStyle = gradient;
            ctx.fillRect(x2d - size * 3, y2d - size * 3, size * 6, size * 6);

            // Core particle
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(x2d, y2d, size, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();

            return { x: x2d, y: y2d, scale };
        }
    }

    // Wave class for background waves
    class Wave {
        constructor(canvas, index) {
            this.canvas = canvas;
            this.index = index;
            this.offset = (index / config.waveCount) * Math.PI * 2;
            this.speed = 0.001 + index * 0.0003;
            this.amplitude = 30 + index * 20;
            this.frequency = 0.003 + index * 0.001;
            this.color = config.particleColors[index % config.particleColors.length];
            this.opacity = 0.03 + index * 0.01;
            this.time = 0;
        }

        update() {
            this.time += this.speed;
        }

        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.beginPath();

            for (let x = 0; x < this.canvas.width; x += 5) {
                const y = this.canvas.height / 2 +
                    Math.sin(x * this.frequency + this.time + this.offset) * this.amplitude +
                    Math.sin(x * this.frequency * 2 + this.time * 1.5) * (this.amplitude / 2);

                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }

            ctx.stroke();
            ctx.restore();
        }
    }

    // Main animation class
    class BackgroundAnimation {
        constructor() {
            this.canvas = null;
            this.ctx = null;
            this.particles = [];
            this.waves = [];
            this.mouseX = null;
            this.mouseY = null;
            this.animationFrame = null;

            this.init();
        }

        init() {
            // Create canvas
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'background-animation';
            this.canvas.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: -1;
                pointer-events: none;
            `;
            document.body.insertBefore(this.canvas, document.body.firstChild);

            this.ctx = this.canvas.getContext('2d');
            this.resize();

            // Create particles
            for (let i = 0; i < config.particleCount; i++) {
                this.particles.push(new Particle(this.canvas));
            }

            // Create waves
            for (let i = 0; i < config.waveCount; i++) {
                this.waves.push(new Wave(this.canvas, i));
            }

            // Event listeners
            window.addEventListener('resize', () => this.resize());
            window.addEventListener('mousemove', (e) => this.onMouseMove(e));
            window.addEventListener('mouseleave', () => this.onMouseLeave());

            // Start animation
            this.animate();
        }

        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;

            // Reinitialize particles for new dimensions
            this.particles.forEach(p => {
                if (p.x > this.canvas.width) p.x = this.canvas.width;
                if (p.y > this.canvas.height) p.y = this.canvas.height;
            });
        }

        onMouseMove(e) {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        }

        onMouseLeave() {
            this.mouseX = null;
            this.mouseY = null;
        }

        drawConnections() {
            const positions = this.particles.map(p => ({
                x: p.x,
                y: p.y,
                opacity: p.opacity
            }));

            for (let i = 0; i < positions.length; i++) {
                for (let j = i + 1; j < positions.length; j++) {
                    const dx = positions[i].x - positions[j].x;
                    const dy = positions[i].y - positions[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < config.connectionDistance) {
                        const opacity = (1 - distance / config.connectionDistance) * 0.15;
                        this.ctx.save();
                        this.ctx.globalAlpha = opacity;
                        this.ctx.strokeStyle = '#4f8cff';
                        this.ctx.lineWidth = 1;
                        this.ctx.beginPath();
                        this.ctx.moveTo(positions[i].x, positions[i].y);
                        this.ctx.lineTo(positions[j].x, positions[j].y);
                        this.ctx.stroke();
                        this.ctx.restore();
                    }
                }
            }
        }

        animate() {
            // Clear canvas
            this.ctx.fillStyle = '#0f1419';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Update and draw waves
            this.waves.forEach(wave => {
                wave.update();
                wave.draw(this.ctx);
            });

            // Update and draw particles
            this.particles.forEach(particle => {
                particle.update(this.mouseX, this.mouseY);
                particle.draw(this.ctx);
            });

            // Draw connections between nearby particles
            this.drawConnections();

            // Continue animation
            this.animationFrame = requestAnimationFrame(() => this.animate());
        }

        destroy() {
            if (this.animationFrame) {
                cancelAnimationFrame(this.animationFrame);
            }
            if (this.canvas && this.canvas.parentNode) {
                this.canvas.parentNode.removeChild(this.canvas);
            }
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.backgroundAnimation = new BackgroundAnimation();
        });
    } else {
        window.backgroundAnimation = new BackgroundAnimation();
    }

    console.log('🎨 3D Background Animation initialized');
})();
