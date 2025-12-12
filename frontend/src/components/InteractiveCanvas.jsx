import { useEffect, useRef } from 'react';

const InteractiveCanvas = () => {
    const canvasRef = useRef(null);
    const dotsRef = useRef([]);
    const animationRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const arrayColors = ['#64ffda', '#00d9ff', '#a78bfa', '#fb7185', '#fbbf24'];

        const resizeCanvas = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            initDots();
        };

        const initDots = () => {
            dotsRef.current = [];
            for (let i = 0; i < 60; i++) {
                dotsRef.current.push({
                    x: Math.floor(Math.random() * canvas.width),
                    y: Math.floor(Math.random() * canvas.height),
                    size: Math.random() * 2 + 3,
                    color: arrayColors[Math.floor(Math.random() * arrayColors.length)],
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5
                });
            }
        };

        const drawDots = () => {
            dotsRef.current.forEach(dot => {
                ctx.fillStyle = dot.color;
                ctx.beginPath();
                ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
                ctx.fill();
            });
        };

        const animate = (mousePos) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update dot positions
            dotsRef.current.forEach(dot => {
                dot.x += dot.vx;
                dot.y += dot.vy;

                // Bounce off edges
                if (dot.x < 0 || dot.x > canvas.width) dot.vx *= -1;
                if (dot.y < 0 || dot.y > canvas.height) dot.vy *= -1;
            });

            drawDots();

            if (mousePos) {
                dotsRef.current.forEach(dot => {
                    const distance = Math.sqrt(
                        (mousePos.x - dot.x) ** 2 + (mousePos.y - dot.y) ** 2
                    );
                    if (distance < 200) {
                        ctx.strokeStyle = dot.color;
                        ctx.lineWidth = 0.5;
                        ctx.globalAlpha = 1 - distance / 200;
                        ctx.beginPath();
                        ctx.moveTo(dot.x, dot.y);
                        ctx.lineTo(mousePos.x, mousePos.y);
                        ctx.stroke();
                        ctx.globalAlpha = 1;
                    }
                });
            }

            animationRef.current = requestAnimationFrame(() => animate(mousePos));
        };

        let currentMousePos = null;

        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            currentMousePos = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        };

        const handleMouseLeave = () => {
            currentMousePos = null;
        };

        resizeCanvas();
        animate(null);

        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseLeave);
        window.addEventListener('resize', resizeCanvas);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'auto',
                zIndex: 1
            }}
        />
    );
};

export default InteractiveCanvas;
