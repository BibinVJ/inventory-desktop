import React, { useState, useEffect } from 'react';

interface AddSaleFormProps {
  customers: any[];
  items: any[];
}

const AddSaleForm: React.FC<AddSaleFormProps> = ({ customers, items }) => {
    const [saleDate, setSaleDate] = useState(new Date().toISOString().substring(0, 10));
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [saleItems, setSaleItems] = useState<any[]>([]);
    const [netTotal, setNetTotal] = useState(0);

    useEffect(() => {
        const getNextInvoice = async () => {
            const nextInvoice = await (window as any).api.getNextInvoiceNumber();
            setInvoiceNumber(nextInvoice);
        };
        getNextInvoice();
    }, []);

    useEffect(() => {
        const total = saleItems.reduce((acc, item) => acc + item.total, 0);
        setNetTotal(total);
    }, [saleItems]);

    const handleAddItem = () => {
        setSaleItems([...saleItems, { item: '', quantity: 1, unit_price: 0, total: 0 }]);
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newSaleItems = [...saleItems];
        newSaleItems[index][field] = value;

        if (field === 'item') {
            const selectedItem = items.find(i => i.id === value);
            if (selectedItem) {
                newSaleItems[index].unit_price = selectedItem.price;
            }
        }

        newSaleItems[index].total = newSaleItems[index].quantity * newSaleItems[index].unit_price;
        setSaleItems(newSaleItems);
    };

    const handleRemoveItem = (index: number) => {
        const newSaleItems = [...saleItems];
        newSaleItems.splice(index, 1);
        setSaleItems(newSaleItems);
    };

    const handleSaveSale = async (e: React.FormEvent) => {
        e.preventDefault();
        const sale = {
            customer: (document.getElementById('customer') as HTMLSelectElement).value,
            sale_date: saleDate,
            invoice_number: invoiceNumber,
            items: saleItems,
            net_total: netTotal,
        };
        await (window as any).api.addSale(sale);
        window.location.reload();
    };

    return (
        <div id="add-sale-tab" className="tab-content active">
            <form id="add-sale-form" onSubmit={handleSaveSale}>
                <div className="grid-container">
                    <div className="form-group">
                        <label htmlFor="customer">Customer</label>
                        <select id="customer" name="customer" required>
                            {customers.map(customer => (
                                <option key={customer.id} value={customer.id}>{customer.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="invoice-number">Invoice Number</label>
                        <input type="text" id="invoice-number" name="invoice-number" value={invoiceNumber} readOnly />
                    </div>
                    <div className="form-group">
                        <label htmlFor="sale-date">Sale Date</label>
                        <input
                            type="date"
                            id="sale-date"
                            name="sale-date"
                            value={saleDate}
                            onChange={(e) => setSaleDate(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <h3>Items</h3>
                <table id="sale-items-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Total</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {saleItems.map((saleItem, index) => (
                            <tr key={index}>
                                <td>
                                    <select
                                        value={saleItem.item}
                                        onChange={(e) => handleItemChange(index, 'item', e.target.value)}
                                        required
                                    >
                                        <option value="">Select an item</option>
                                        {items.map(item => (
                                            <option key={item.id} value={item.id}>{item.name}</option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={saleItem.quantity}
                                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                                        required
                                    />
                                </td>
                                <td>{saleItem.unit_price}</td>
                                <td>{saleItem.total}</td>
                                <td>
                                    <button type="button" onClick={() => handleRemoveItem(index)}>Remove</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button type="button" id="add-item-button" onClick={handleAddItem}>Add Item</button>

                <div className="total-section">
                    <strong>Net Total:</strong> <span id="net-total">{netTotal}</span>
                </div>

                <button type="submit">Save Sale</button>
            </form>
        </div>
    );
};

export default AddSaleForm;
