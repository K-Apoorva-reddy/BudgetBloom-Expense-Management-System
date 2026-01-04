/* ---------------- ELEMENTS ---------------- */

const category = document.getElementById('category');
const currencySelect = document.getElementById('currency');
const dateInput = document.getElementById('date');

const balance = document.getElementById('balance');
const income = document.getElementById('income');
const expense = document.getElementById('expense');
const count = document.getElementById('count');

const transactionsUl = document.getElementById('transactions');
const expenseList = document.getElementById('expense-list'); // ✅ NEW

const form = document.getElementById('transaction-form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');
const monthFilter = document.getElementById('monthFilter');
const search = document.getElementById('search');
const clearAll = document.getElementById('clearAll');

let currency = '₹';
let chart;

/* ---------------- LOCAL STORAGE ---------------- */

const localStorageTransactions = JSON.parse(
  localStorage.getItem('transactions')
);

let transactions = localStorageTransactions || [];

/* ---------------- EVENTS ---------------- */

form.addEventListener('submit', addTransaction);
monthFilter.addEventListener('change', init);

currencySelect.addEventListener('change', () => {
  currency = currencySelect.value;
  init();
});

clearAll.addEventListener('click', () => {
  if (confirm('Delete all transactions?')) {
    transactions = [];
    updateLocalStorage();
    init();
  }
});

search.addEventListener('input', searchTransactions);

/* ---------------- FUNCTIONS ---------------- */

function addTransaction(e) {
  e.preventDefault();

  if (text.value.trim() === '' || amount.value === '') {
    alert('Please fill all fields');
    return;
  }

  const transaction = {
    id: Date.now(),
    text: text.value,
    amount: +amount.value,
    category: category.value,
    date: dateInput.value || new Date().toISOString()
  };

  transactions.push(transaction);
  updateLocalStorage();
  init();

  text.value = '';
  amount.value = '';
  dateInput.value = '';
}

/* ---------- HISTORY LIST (ALL TRANSACTIONS) ---------- */

function addTransactionDOM(transaction) {
  const item = document.createElement('li');

  const isExpense = transaction.amount < 0;

  item.classList.add(isExpense ? 'expense-item' : 'income-item');

  item.innerHTML = `
    <span>
      ${transaction.text} (${transaction.category})
    </span>
    <span>
      ${isExpense ? '-' : '+'}${currency}${Math.abs(transaction.amount)}
    </span>
    <button class="delete-btn" onclick="removeTransaction(${transaction.id})">
      Delete
    </button>
  `;

  transactionsUl.appendChild(item);
}




// function addTransactionDOM(transaction) {
//   const item = document.createElement('li');

//   item.classList.add(
//     transaction.amount < 0 ? 'expense-item' : 'income-item'
//   );

//   const sign = transaction.amount < 0 ? '-' : '+';

//   item.innerHTML = `
//     <span>
//       ${transaction.text} (${transaction.category})
//     </span>
//     <span>
//       ${sign}${currency}${Math.abs(transaction.amount)}
//     </span>
//     <button class="delete-btn" onclick="removeTransaction(${transaction.id})">
//       Delete
//     </button>
//   `;

//   transactionsUl.appendChild(item);
// }

/* ---------- EXPENSE LIST ONLY ---------- */

function addExpenseDOM(transaction) {
  if (transaction.amount >= 0) return;

  const item = document.createElement('li');

  item.innerHTML = `
    <span>
      ${transaction.text} (${transaction.category})
    </span>
    <span>
      -${currency}${Math.abs(transaction.amount)}
    </span>
    <button class="delete-btn" onclick="removeTransaction(${transaction.id})">
      Delete
    </button>
  `;

  expenseList.appendChild(item);
}

/* ---------- DELETE ---------- */

function removeTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  updateLocalStorage();
  init();
}

/* ---------- DASHBOARD VALUES ---------- */

function updateValues(filtered) {
  const amounts = filtered.map(t => t.amount);

  const total = amounts.reduce((a, b) => a + b, 0);
  const inc = amounts.filter(a => a > 0).reduce((a, b) => a + b, 0);
  const exp = amounts.filter(a => a < 0).reduce((a, b) => a + b, 0);

  balance.textContent = currency + total;
  income.textContent = currency + inc;
  expense.textContent = currency + Math.abs(exp);
  count.textContent = filtered.length;

  updateChart(inc, exp);
}

/* ---------- PIE CHART ---------- */

function updateChart(inc, exp) {
  const ctx = document.getElementById('myChart');

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Income', 'Expense'],
      datasets: [{
        data: [inc, Math.abs(exp)],
        backgroundColor: ['#22c55e', '#ef4444']
      }]
    }
  });
}

/* ---------- LOCAL STORAGE ---------- */

function updateLocalStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

/* ---------- INIT ---------- */

function init() {
  transactionsUl.innerHTML = '';
  expenseList.innerHTML = '';

  let filtered =
    monthFilter.value === 'all'
      ? transactions
      : transactions.filter(
          t => new Date(t.date).getMonth() == monthFilter.value
        );

  filtered.forEach(t => {
    addTransactionDOM(t);
    addExpenseDOM(t);
  });

  updateValues(filtered);
}

/* ---------- SEARCH ---------- */


function searchTransactions() {
  const keyword = search.value.toLowerCase();

  let filtered =
    monthFilter.value === 'all'
      ? transactions
      : transactions.filter(
          t => new Date(t.date).getMonth() == monthFilter.value
        );

  filtered = filtered.filter(t =>
    t.text.toLowerCase().includes(keyword) ||
    t.category.toLowerCase().includes(keyword)
  );

  transactionsUl.innerHTML = '';
  filtered.forEach(addTransactionDOM);
  updateValues(filtered);
}


// function searchTransactions() {
//   const keyword = search.value.toLowerCase();

//   const filtered = transactions.filter(t =>
//     t.text.toLowerCase().includes(keyword) ||
//     t.category.toLowerCase().includes(keyword)
//   );

//   transactionsUl.innerHTML = '';
//   expenseList.innerHTML = '';

//   filtered.forEach(t => {
//     addTransactionDOM(t);
//     addExpenseDOM(t);
//   });

//   updateValues(filtered);
// }





/* ---------- START ---------- */

init();

