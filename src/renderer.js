document.addEventListener('DOMContentLoaded', () => {

    // Views
    const signinView = document.getElementById('signin-view');
    const mainView = document.getElementById('main-view');

    // Auth
    const signinForm = document.getElementById('signin-form');
    const signinError = document.getElementById('signin-error');
    const logoutButton = document.getElementById('logout-button');

    // Tabs
    const tabs = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const addSaleTab = document.getElementById('add-sale-tab');
    const transactionsTab = document.getElementById('transactions-tab');

    // Add Sale Form
    const addSaleForm = document.getElementById('add-sale-form');
    const customerSelect = document.getElementById('customer');
    const invoiceNumberInput = document.getElementById('invoice-number');
    const saleDateInput = document.getElementById('sale-date');
    const saleItemsTableBody = document.querySelector('#sale-items-table tbody');
    const addItemButton = document.getElementById('add-item-button');
    const netTotalSpan = document.getElementById('net-total');

    // Transactions Table
    const transactionsTableBody = document.querySelector('#transactions-table tbody');

    let items = [];

    // Initial Check
    if (window.auth.getToken()) {
        showMainView();
    } else {
        showSigninView();
    }

    // Auth Logic
    signinForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const data = await window.auth.login(e.target.email.value, e.target.password.value);
            if (data.token) {
                window.auth.storeToken(data.token);
                showMainView();
            } else {
                signinError.textContent = 'Login failed: No token received.';
            }
        } catch (error) {
            signinError.textContent = 'Invalid email or password.';
        }
    });

    logoutButton.addEventListener('click', () => {
        window.auth.logout();
        showSigninView();
    });

    // Tab Navigation
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            tabContents.forEach(content => content.classList.toggle('active', content.id === targetTab));
            if (targetTab === 'transactions-tab') {
                loadTransactions();
            }
        });
    });

    // Main View Logic
    async function showMainView() {
        signinView.style.display = 'none';
        mainView.style.display = 'flex';
        await loadInitialData();
    }

    function showSigninView() {
        signinView.style.display = 'flex';
        mainView.style.display = 'none';
    }

    async function loadInitialData() {
        try {
            const [customers, fetchedItems, nextInvoice] = await Promise.all([
                window.api.getCustomers(),
                window.api.getItems(),
                window.api.getNextInvoiceNumber()
            ]);

            items = fetchedItems;

            // Populate customers
            customerSelect.innerHTML = customers.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

            // Set invoice number and date
            invoiceNumberInput.value = nextInvoice.invoice_number;
            saleDateInput.valueAsDate = new Date();

            // Reset form
            resetSaleForm();

        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }

    function resetSaleForm() {
        saleItemsTableBody.innerHTML = '';
        addItemRow();
        updateNetTotal();
    }

    function addItemRow() {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <select class="item-select">
                    <option value="">Select an item</option>
                    ${items.map(i => `<option value="${i.id}">${i.name}</option>`).join('')}
                </select>
            </td>
            <td><input type="number" class="quantity" value="1" min="1"></td>
            <td><input type="number" class="unit-price" value="0" min="0"></td>
            <td class="total">0.00</td>
            <td><button type="button" class="remove-item-button">Remove</button></td>
        `;
        saleItemsTableBody.appendChild(row);
    }

    addItemButton.addEventListener('click', addItemRow);

    saleItemsTableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-item-button')) {
            e.target.closest('tr').remove();
            updateNetTotal();
        }
    });

    saleItemsTableBody.addEventListener('change', (e) => {
        const row = e.target.closest('tr');
        if (e.target.classList.contains('item-select')) {
            const selectedItem = items.find(i => i.id == e.target.value);
            if (selectedItem) {
                row.querySelector('.unit-price').value = selectedItem.price || 0;
            }
        }
        updateRowTotal(row);
    });

     saleItemsTableBody.addEventListener('input', (e) => {
        if (e.target.classList.contains('quantity') || e.target.classList.contains('unit-price')) {
            updateRowTotal(e.target.closest('tr'));
        }
    });


    function updateRowTotal(row) {
        const quantity = row.querySelector('.quantity').value;
        const unitPrice = row.querySelector('.unit-price').value;
        const total = (quantity * unitPrice).toFixed(2);
        row.querySelector('.total').textContent = total;
        updateNetTotal();
    }

    function updateNetTotal() {
        let netTotal = 0;
        saleItemsTableBody.querySelectorAll('tr').forEach(row => {
            netTotal += parseFloat(row.querySelector('.total').textContent);
        });
        netTotalSpan.textContent = netTotal.toFixed(2);
    }

    addSaleForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const saleData = {
            customer_id: customerSelect.value,
            invoice_number: invoiceNumberInput.value,
            sale_date: saleDateInput.value,
            items: Array.from(saleItemsTableBody.querySelectorAll('tr')).map(row => ({
                item_id: row.querySelector('.item-select').value,
                quantity: row.querySelector('.quantity').value,
                unit_price: row.querySelector('.unit-price').value,
            })),
        };

        try {
            await window.api.addSale(saleData);
            alert('Sale saved successfully!');
            await loadInitialData(); // Refresh for next sale
        } catch (error) {
            console.error('Error saving sale:', error);
            alert('Failed to save sale.');
        }
    });

    async function loadTransactions() {
        try {
            const sales = await window.api.getSales();
            transactionsTableBody.innerHTML = sales.data.map(sale => `
                <tr>
                    <td>${sale.invoice_number}</td>
                    <td>${sale.customer.name}</td>
                    <td>${new Date(sale.sale_date).toLocaleDateString()}</td>
                    <td>${sale.total_amount}</td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('Error loading transactions:', error);
        }
    }
});