import React, { useState, useEffect } from 'react';
import api from '../api';
import '../styles/App.css';

const Planner = () => {
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const slots = ['breakfast', 'lunch', 'dinner'];

    useEffect(() => {
        fetchPlan();
    }, [currentWeek]);

    const fetchPlan = async () => {
        try {
            setLoading(true);
            // Need to calculate start/end date for currentWeek
            // For simplicity, just fetching all or mocked local caching
            const response = await api.getPlan(getStartOfWeek(currentWeek), getEndOfWeek(currentWeek));
            setPlans(response.data || []);
        } catch (error) {
            console.error("Error fetching plan", error);
            // Fallback for demo if API fails
            setPlans([]);
        } finally {
            setLoading(false);
        }
    };

    const getStartOfWeek = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        return new Date(d.setDate(diff));
    };

    const getEndOfWeek = (date) => {
        const start = getStartOfWeek(date);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        return end;
    };

    const getPlanForSlot = (dayName, slotName) => {
        // This logic heavily depends on how 'date' is stored/compared. 
        // For a hackathon/demo, simpler string comparison might be better if Day is stored.
        // Or matching Day of Week.
        return plans.find(p => {
            // Mock logic: assuming plans have a 'day' string or date match
            return p.slot === slotName && (p.day === dayName || new Date(p.date).getDay() === days.indexOf(dayName) + 1);
        });
    };

    return (
        <div className="planner-container">
            <h1>Weekly Planner</h1>
            <div className="planner-grid">
                <div className="header-row">
                    <div className="corner-cell"></div>
                    {days.map(day => <div key={day} className="day-header">{day}</div>)}
                </div>
                {slots.map(slot => (
                    <div key={slot} className="slot-row">
                        <div className="slot-header">{slot.charAt(0).toUpperCase() + slot.slice(1)}</div>
                        {days.map(day => {
                            const plan = getPlanForSlot(day, slot);
                            return (
                                <div key={`${day}-${slot}`} className="plan-cell">
                                    {plan ? (
                                        <div className="planned-meal">
                                            {plan.meal.name}
                                        </div>
                                    ) : (
                                        <button className="add-btn">+</button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Planner;
