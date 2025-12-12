import React from 'react';
import { motion } from 'framer-motion';

const NeonButton = ({ children, onClick, disabled, className = '', ...props }) => {
    return (
        <motion.button
            className={`get-recommendations-btn ${className}`}
            onClick={onClick}
            disabled={disabled}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            {...props}
        >
            {children}
        </motion.button>
    );
};

export default NeonButton;
