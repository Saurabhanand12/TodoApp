import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const CustomCursor = () => {
    const [isHovering, setIsHovering] = React.useState(false);
    const [isDragging, setIsDragging] = React.useState(false);
    const [isVisible, setIsVisible] = React.useState(false);

    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    const [isTouchDevice, setIsTouchDevice] = useState(false);

    React.useEffect(() => {
        const checkTouch = () => {
            setIsTouchDevice(window.matchMedia('(pointer: coarse)').matches);
        };
        checkTouch();
        
        const moveCursor = (e) => {
            if (window.matchMedia('(pointer: coarse)').matches) return;
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
            if (!isVisible) setIsVisible(true);
        };

        const updateHoverState = (e) => {
            const target = e.target;
            const isClickable = target.closest('button') || target.closest('a') || target.closest('.cursor-pointer') || target.closest('input');
            const isDraggable = target.closest('.cursor-move');

            if (isDraggable && e.type === 'mousedown') {
                setIsDragging(true);
            } else if (e.type === 'mouseup') {
                setIsDragging(false);
            }

            setIsHovering(!!isClickable || !!isDraggable);
        };

        const handleMouseLeave = () => setIsVisible(false);
        const handleMouseEnter = () => setIsVisible(true);

        window.addEventListener('mousemove', moveCursor);
        window.addEventListener('mouseover', updateHoverState);
        window.addEventListener('mousedown', updateHoverState);
        window.addEventListener('mouseup', updateHoverState);
        document.addEventListener('mouseleave', handleMouseLeave);
        document.addEventListener('mouseenter', handleMouseEnter);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mouseover', updateHoverState);
            window.removeEventListener('mousedown', updateHoverState);
            window.removeEventListener('mouseup', updateHoverState);
            document.removeEventListener('mouseleave', handleMouseLeave);
            document.removeEventListener('mouseenter', handleMouseEnter);
        };
    }, [isVisible, cursorX, cursorY]);

    if (isTouchDevice || !isVisible) return null;

    return (
        <motion.div
            className="fixed top-0 left-0 pointer-events-none z-[10000]"
            style={{
                x: cursorX,
                y: cursorY,
                // Center the exact tip of the SVG arrow on the mouse coordinate
                translateX: '-6px',
                translateY: '-6px',
            }}
            animate={{
                scale: isDragging ? 0.9 : isHovering ? 1.1 : 1,
                rotate: isDragging ? -5 : 0
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
            <motion.svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                animate={{
                    filter: isDragging
                        ? 'drop-shadow(0 0 12px rgba(255, 20, 147, 1)) drop-shadow(0 0 30px rgba(255, 20, 147, 0.9))'
                        : isHovering
                            ? 'drop-shadow(0 0 10px rgba(255, 20, 147, 0.9)) drop-shadow(0 0 20px rgba(255, 20, 147, 0.8))'
                            : 'drop-shadow(0 0 6px rgba(255, 20, 147, 0.7)) drop-shadow(0 0 12px rgba(255, 20, 147, 0.4))'
                }}
                transition={{ duration: 0.2 }}
            >
                {/* The main neon tube path */}
                <path
                    d="M 6 6 L 6 30 L 12 23 L 18 35 L 23 32 L 17 20 L 26 18 Z"
                    fill="rgba(20, 0, 10, 0.7)"
                    stroke="#ff1493"
                    strokeWidth="3.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />

                {/* The inner bright white core of the neon tube */}
                <path
                    d="M 6 6 L 6 30 L 12 23 L 18 35 L 23 32 L 17 20 L 26 18 Z"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    style={{ opacity: 0.9 }}
                />
            </motion.svg>
        </motion.div>
    );
};

export default CustomCursor;
