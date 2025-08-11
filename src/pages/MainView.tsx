import React, { useState, useEffect } from 'react';
import AddSaleForm from '../components/AddSaleForm';
import TransactionsTable from '../components/TransactionsTable';

const MainView = () => {
    const [activeTab, setActiveTab] = useState('add-sale');
    const [customers, setCustomers] = useState([]);
    const [items, setItems] = useState([]);
    const [sales, setSales] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const [customers, items, sales] = await Promise.all([
                (window as any).api.getCustomers(),
                (window as any).api.getItems(),
                (window as any).api.getSales(),
            ]);
            setCustomers(customers);
            setItems(items);
            setSales(sales);
        };
        fetchData();
    }, []);

    const handleLogout = () => {
        (window as any).auth.logout();
        window.location.reload();
    };

    return (
        <div id="main-view" className="view">
            <div className="top-bar">
                <div className="tabs">
                    <button
                        className={`tab-button ${activeTab === 'add-sale' ? 'active' : ''}`}
                        onClick={() => setActiveTab('add-sale')}
                    >
                        Add Sale
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'transactions' ? 'active' : ''}`}
                        onClick={() => setActiveTab('transactions')}
                    >
                        View Transactions
                    </button>
                </div>
                <button id="logout-button" onClick={handleLogout}>Logout</button>
            </div>
            <div className="content">
                {activeTab === 'add-sale' && <AddSaleForm customers={customers} items={items} />}
                {activeTab === 'transactions' && <TransactionsTable sales={sales} />}
            </div>
        </div>
    );
};

export default MainView;
