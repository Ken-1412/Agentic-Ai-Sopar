import React, { useState, useEffect } from 'react';
import api from '../api';
import '../styles/App.css';

const ShoppingList = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchList();
    }, []);

    const fetchList = async () => {
        try {
            setLoading(true);
            const response = await api.getShoppingList();
            setItems(response.data || []);
        } catch (error) {
            console.error("Error fetching shopping list", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleItem = (index) => {
        const newItems = [...items];
        newItems[index].checked = !newItems[index].checked;
        setItems(newItems);
    };

    return (
        <div className="shopping-list-container">
            <h1>Shopping List</h1>
            <div className="list-wrapper">
                {loading ? <p>Loading...</p> : (
                    items.length === 0 ? <p>No items needed this week!</p> :
                        items.map((item, index) => (
                            <div key={index} className={`list-item ${item.checked ? 'checked' : ''}`}>
                                <input
                                    type="checkbox"
                                    checked={item.checked || false}
                                    onChange={() => toggleItem(index)}
                                />
                                <div className="item-details">
                                    <span className="item-name">{item.name}</span>
                                    <span className="item-amount">
                                        {item.amount > 0 ? `${item.amount} ${item.unit}` : ''}
                                    </span>
                                </div>
                            </div>
                        ))
                )}
            </div>
        </div>
    );
};

export default ShoppingList;
