import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', ...props }) => {
    return (
        <motion.div
            className={`glass-card ${className}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default GlassCard;
