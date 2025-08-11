import React from 'react';

interface TransactionsTableProps {
  sales: any[];
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({ sales }) => {
    return (
        <div id="transactions-tab" className="tab-content">
            <h2>All Sales</h2>
            <table id="transactions-table">
                <thead>
                    <tr>
                        <th>Invoice #</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {sales.map(sale => (
                        <tr key={sale.id}>
                            <td>{sale.invoice_number}</td>
                            <td>{sale.customer.name}</td>
                            <td>{new Date(sale.sale_date).toLocaleDateString()}</td>
                            <td>{sale.net_total}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TransactionsTable;
