/* ── App State ───────────────────────────────────────────────────────────── */

// Per-user storage key derived from the logged-in user's ID
function storageKey() {
  const session = getSession();
  return session ? `budgetApp_data_${session.userId}` : 'budgetApp_data_anonymous';
}

let state = {
  view: 'dashboard',
  month: todayMonth(),
  settings: {
    name: 'My Finances',
    country: 'india',
    currency: 'INR',
    symbol: '₹',
    theme: 'light',
  },
  budgets: [],
  expenses: [],
  incomes: [],
  investments: [],
  customCategories: [],
  customInvestments: [],
};

// ── Persistence ───────────────────────────────────────────────────────────────

function save() {
  try { localStorage.setItem(storageKey(), JSON.stringify(state)); } catch(e) {}
}

function load() {
  try {
    const raw = localStorage.getItem(storageKey());
    if (raw) Object.assign(state, JSON.parse(raw));
  } catch(e) {}

  // Sync display name from session if settings name is still default
  const session = getSession();
  if (session && state.settings.name === 'My Finances') {
    state.settings.name = session.name;
  }

  applyTheme();
}

// ── Utility helpers ───────────────────────────────────────────────────────────

function todayMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
}

function formatMonth(ym) {
  const [y, m] = ym.split('-');
  return new Date(+y, +m-1, 1).toLocaleDateString('en-US', { month:'long', year:'numeric' });
}

function fmt(n) {
  const sym = state.settings.symbol;
  return `${sym}${Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

function applyTheme() {
  document.documentElement.classList.toggle('dark', state.settings.theme === 'dark');
}

function getCategoryMeta(cat) {
  return DEFAULT_CATEGORIES[cat] || { icon:'fa-tag', color:'#9ca3af' };
}

function getIncomeCategoryMeta(cat) {
  return INCOME_CATEGORIES[cat] || { icon:'fa-plus', color:'#22c55e' };
}

function toast(msg, type='success') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  const icons = { success:'fa-check-circle', error:'fa-times-circle', warning:'fa-exclamation-triangle', info:'fa-info-circle' };
  el.innerHTML = `<i class="fas ${icons[type]||'fa-info-circle'}"></i> ${msg}`;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

// ── Routing ───────────────────────────────────────────────────────────────────

function navigate(view) {
  state.view = view;
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.view === view);
  });
  renderView();
  updateTopbar();
}

function updateTopbar() {
  const titles = {
    dashboard: ['Dashboard', 'Overview of your finances'],
    budget: ['Budget Planner', 'Set & track your monthly budgets'],
    expenses: ['Expenses', 'Track where your money goes'],
    income: ['Income', 'Track your earnings'],
    investments: ['Investments', 'Monitor your investment portfolio'],
    settings: ['Settings', 'App preferences & configuration'],
  };
  const [title, subtitle] = titles[state.view] || ['', ''];
  document.getElementById('topbar-title').textContent = title;
  document.getElementById('topbar-subtitle').textContent = subtitle;

  const monthWrap = document.getElementById('month-wrap');
  monthWrap.classList.toggle('hidden', !['budget','expenses','income'].includes(state.view));
}

// ── Main render dispatcher ────────────────────────────────────────────────────

function renderView() {
  const el = document.getElementById('page-content');
  el.innerHTML = '';
  const fns = {
    dashboard: renderDashboard,
    budget: renderBudget,
    expenses: renderExpenses,
    income: renderIncome,
    investments: renderInvestments,
    settings: renderSettings,
  };
  (fns[state.view] || (() => {}))(el);
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────

function renderDashboard(el) {
  const m = state.month;
  const monthExpenses  = state.expenses.filter(e => e.date.startsWith(m));
  const monthIncomes   = state.incomes.filter(i => i.date.startsWith(m));
  const monthBudgets   = state.budgets.filter(b => b.month === m);
  const totalExpense   = monthExpenses.reduce((s,e) => s + e.amount, 0);
  const totalIncome    = monthIncomes.reduce((s,i) => s + i.amount, 0);
  const totalBudget    = monthBudgets.reduce((s,b) => s + b.amount, 0);
  const totalInvested  = state.investments.reduce((s,i) => s + i.amount, 0);
  const savings        = totalIncome - totalExpense;

  // 6-month trend
  const last6 = getLast6Months();

  el.innerHTML = `
  ${!hasData() ? `
  <div class="demo-banner">
    <div class="demo-banner-text">
      <h3>👋 Welcome to BudgetPro!</h3>
      <p>Load demo data to explore all features instantly.</p>
    </div>
    <button class="btn" style="background:#fff;color:var(--primary);font-weight:700" onclick="loadDemo()">
      <i class="fas fa-magic"></i> Load Demo Data
    </button>
  </div>` : ''}
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-icon" style="background:var(--primary-bg);color:var(--primary)"><i class="fas fa-wallet"></i></div>
      <div class="stat-info">
        <div class="stat-label">Total Budget ${infoBtn('Monthly budget you have allocated across all categories')}</div>
        <div class="stat-value" style="color:var(--primary)">${fmt(totalBudget)}</div>
        <div class="stat-change"><i class="fas fa-calendar-alt"></i> ${formatMonth(m)}</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:var(--success-bg);color:var(--success)"><i class="fas fa-arrow-circle-down"></i></div>
      <div class="stat-info">
        <div class="stat-label">Total Income ${infoBtn('All income earned this month')}</div>
        <div class="stat-value" style="color:var(--success)">${fmt(totalIncome)}</div>
        <div class="stat-change ${savings>=0?'up':'down'}"><i class="fas fa-arrow-${savings>=0?'up':'down'}"></i> Net: ${fmt(savings)}</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:var(--danger-bg);color:var(--danger)"><i class="fas fa-arrow-circle-up"></i></div>
      <div class="stat-info">
        <div class="stat-label">Total Expenses ${infoBtn('All money spent this month')}</div>
        <div class="stat-value" style="color:var(--danger)">${fmt(totalExpense)}</div>
        <div class="stat-change ${totalBudget>0&&totalExpense/totalBudget>1?'down':'up'}">
          <i class="fas fa-percent"></i> ${totalBudget ? Math.round(totalExpense/totalBudget*100) : 0}% of budget used
        </div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:#f0fdf4;color:#16a34a"><i class="fas fa-chart-line"></i></div>
      <div class="stat-info">
        <div class="stat-label">Total Invested ${infoBtn('Sum of all your recorded investments across all time')}</div>
        <div class="stat-value" style="color:#16a34a">${fmt(totalInvested)}</div>
        <div class="stat-change"><i class="fas fa-layer-group"></i> ${state.investments.length} investment(s)</div>
      </div>
    </div>
  </div>

  <div class="grid-2" style="margin-bottom:20px">
    <div class="card">
      <div class="card-header">
        <div class="card-title"><i class="fas fa-chart-donut" style="color:var(--primary)"></i> Expense by Category ${infoBtn('Distribution of your expenses across categories this month')}</div>
      </div>
      <div class="card-body">
        <div class="chart-container" style="height:240px">
          <canvas id="expensePieChart"></canvas>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-header">
        <div class="card-title"><i class="fas fa-chart-bar" style="color:var(--warning)"></i> Budget vs Actual ${infoBtn('How much you budgeted vs how much you actually spent per category')}</div>
      </div>
      <div class="card-body">
        <div class="chart-container" style="height:240px">
          <canvas id="budgetBarChart"></canvas>
        </div>
      </div>
    </div>
  </div>

  <div class="card" style="margin-bottom:20px">
    <div class="card-header">
      <div class="card-title"><i class="fas fa-chart-line" style="color:var(--success)"></i> 6-Month Trend ${infoBtn('Income vs Expenses over the last 6 months')}</div>
    </div>
    <div class="card-body">
      <div class="chart-container" style="height:200px">
        <canvas id="trendChart"></canvas>
      </div>
    </div>
  </div>

  <div class="grid-2">
    <div class="card">
      <div class="card-header">
        <div class="card-title"><i class="fas fa-receipt" style="color:var(--danger)"></i> Recent Expenses</div>
        <button class="btn btn-sm btn-outline" onclick="navigate('expenses')">View All</button>
      </div>
      <div class="card-body" style="padding:0 20px">
        ${recentExpensesHTML(monthExpenses.slice().reverse().slice(0,5))}
      </div>
    </div>
    <div class="card">
      <div class="card-header">
        <div class="card-title"><i class="fas fa-coins" style="color:var(--success)"></i> Recent Income</div>
        <button class="btn btn-sm btn-outline" onclick="navigate('income')">View All</button>
      </div>
      <div class="card-body" style="padding:0 20px">
        ${recentIncomeHTML(monthIncomes.slice().reverse().slice(0,5))}
      </div>
    </div>
  </div>`;

  requestAnimationFrame(() => {
    renderExpensePieChart(monthExpenses);
    renderBudgetBarChart(monthBudgets, monthExpenses);
    renderTrendChart(last6);
  });
}

function getLast6Months() {
  const result = [];
  const d = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(d.getFullYear(), d.getMonth() - i, 1);
    const ym = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`;
    result.push({
      label: date.toLocaleDateString('en-US', { month:'short', year:'2-digit' }),
      income: state.incomes.filter(x => x.date.startsWith(ym)).reduce((s,x) => s+x.amount, 0),
      expense: state.expenses.filter(x => x.date.startsWith(ym)).reduce((s,x) => s+x.amount, 0),
    });
  }
  return result;
}

function recentExpensesHTML(items) {
  if (!items.length) return `<div class="empty-state" style="padding:24px"><i class="fas fa-receipt"></i><p>No expenses yet</p></div>`;
  return items.map(e => {
    const meta = getCategoryMeta(e.category);
    return `<div class="txn-item">
      <div class="txn-icon" style="background:${meta.color}22;color:${meta.color}"><i class="fas ${meta.icon}"></i></div>
      <div class="txn-info">
        <div class="txn-name">${e.subcategory || e.category}</div>
        <div class="txn-meta">${e.category} · ${new Date(e.date).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</div>
      </div>
      <div class="txn-amount" style="color:var(--danger)">-${fmt(e.amount)}</div>
    </div>`;
  }).join('');
}

function recentIncomeHTML(items) {
  if (!items.length) return `<div class="empty-state" style="padding:24px"><i class="fas fa-coins"></i><p>No income yet</p></div>`;
  return items.map(i => {
    const meta = getIncomeCategoryMeta(i.category);
    return `<div class="txn-item">
      <div class="txn-icon" style="background:${meta.color}22;color:${meta.color}"><i class="fas ${meta.icon}"></i></div>
      <div class="txn-info">
        <div class="txn-name">${i.subcategory || i.category}</div>
        <div class="txn-meta">${i.category} · ${new Date(i.date).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</div>
      </div>
      <div class="txn-amount" style="color:var(--success)">+${fmt(i.amount)}</div>
    </div>`;
  }).join('');
}

function renderExpensePieChart(expenses) {
  const canvas = document.getElementById('expensePieChart');
  if (!canvas) return;
  const byCategory = {};
  expenses.forEach(e => { byCategory[e.category] = (byCategory[e.category]||0) + e.amount; });
  const labels = Object.keys(byCategory);
  const data   = Object.values(byCategory);
  const colors = labels.map(l => getCategoryMeta(l).color);

  if (window._pieChart) window._pieChart.destroy();
  if (!labels.length) { canvas.parentElement.innerHTML = `<div class="empty-state" style="padding:32px"><i class="fas fa-chart-pie"></i><p>No expenses this month</p></div>`; return; }

  window._pieChart = new Chart(canvas, {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 2, borderColor: getComputedStyle(document.documentElement).getPropertyValue('--surface') }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'right', labels: { boxWidth: 12, padding: 12, font: { size: 11 }, color: getComputedStyle(document.documentElement).getPropertyValue('--text') } } },
      cutout: '65%'
    }
  });
}

function renderBudgetBarChart(budgets, expenses) {
  const canvas = document.getElementById('budgetBarChart');
  if (!canvas) return;
  if (!budgets.length) { canvas.parentElement.innerHTML = `<div class="empty-state" style="padding:32px"><i class="fas fa-chart-bar"></i><p>No budgets set</p></div>`; return; }

  const cats = [...new Set(budgets.map(b => b.category))].slice(0, 8);
  const budgeted = cats.map(c => budgets.filter(b => b.category===c).reduce((s,b)=>s+b.amount,0));
  const spent    = cats.map(c => expenses.filter(e => e.category===c).reduce((s,e)=>s+e.amount,0));

  if (window._barChart) window._barChart.destroy();
  window._barChart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: cats.map(c => c.length > 10 ? c.slice(0,10)+'…' : c),
      datasets: [
        { label: 'Budgeted', data: budgeted, backgroundColor: 'rgba(99,102,241,.7)', borderRadius: 4 },
        { label: 'Spent',    data: spent,    backgroundColor: 'rgba(239,68,68,.7)',   borderRadius: 4 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { boxWidth: 12, font:{ size:11 }, color: getComputedStyle(document.documentElement).getPropertyValue('--text') } } },
      scales: {
        x: { grid: { display:false }, ticks: { font:{size:10}, color: getComputedStyle(document.documentElement).getPropertyValue('--text-muted') } },
        y: { grid: { color: getComputedStyle(document.documentElement).getPropertyValue('--border') }, ticks: { font:{size:10}, color: getComputedStyle(document.documentElement).getPropertyValue('--text-muted') } }
      }
    }
  });
}

function renderTrendChart(months) {
  const canvas = document.getElementById('trendChart');
  if (!canvas) return;
  if (window._trendChart) window._trendChart.destroy();
  window._trendChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: months.map(m => m.label),
      datasets: [
        { label: 'Income',  data: months.map(m=>m.income),  borderColor:'#22c55e', backgroundColor:'rgba(34,197,94,.1)', fill:true, tension:.35, pointRadius:4, pointBackgroundColor:'#22c55e' },
        { label: 'Expense', data: months.map(m=>m.expense), borderColor:'#ef4444', backgroundColor:'rgba(239,68,68,.07)', fill:true, tension:.35, pointRadius:4, pointBackgroundColor:'#ef4444' }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { boxWidth: 12, font:{size:11}, color: getComputedStyle(document.documentElement).getPropertyValue('--text') } } },
      scales: {
        x: { grid:{ display:false }, ticks:{ font:{size:10}, color: getComputedStyle(document.documentElement).getPropertyValue('--text-muted') } },
        y: { grid:{ color: getComputedStyle(document.documentElement).getPropertyValue('--border') }, ticks:{ font:{size:10}, color: getComputedStyle(document.documentElement).getPropertyValue('--text-muted') } }
      }
    }
  });
}

// ── BUDGET ────────────────────────────────────────────────────────────────────

function renderBudget(el) {
  const m = state.month;
  const budgets = state.budgets.filter(b => b.month === m);
  const expenses = state.expenses.filter(e => e.date.startsWith(m));
  const totalBudget = budgets.reduce((s,b) => s+b.amount, 0);
  const totalSpent  = expenses.reduce((s,e) => s+e.amount, 0);

  // group budgets by category
  const grouped = {};
  budgets.forEach(b => {
    if (!grouped[b.category]) grouped[b.category] = [];
    grouped[b.category].push(b);
  });

  el.innerHTML = `
  <div class="section-header">
    <div class="section-title">
      <i class="fas fa-wallet" style="color:var(--primary)"></i>
      Budget for ${formatMonth(m)}
      ${infoBtn('Set spending limits for each category. Track how much you spend vs. your budget. Add as many categories as you need.')}
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn btn-outline" onclick="copyLastMonthBudget()">
        <i class="fas fa-copy"></i> Copy Last Month
      </button>
      <button class="btn btn-primary" onclick="openAddBudget()">
        <i class="fas fa-plus"></i> Add Budget Item
      </button>
    </div>
  </div>

  <div class="stats-grid" style="margin-bottom:20px">
    <div class="stat-card">
      <div class="stat-icon" style="background:var(--primary-bg);color:var(--primary)"><i class="fas fa-wallet"></i></div>
      <div class="stat-info">
        <div class="stat-label">Total Budget ${infoBtn('Sum of all budget allocations for this month')}</div>
        <div class="stat-value" style="color:var(--primary)">${fmt(totalBudget)}</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:var(--danger-bg);color:var(--danger)"><i class="fas fa-fire"></i></div>
      <div class="stat-info">
        <div class="stat-label">Total Spent ${infoBtn('Total expenses recorded for this month')}</div>
        <div class="stat-value" style="color:var(--danger)">${fmt(totalSpent)}</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:var(--success-bg);color:var(--success)"><i class="fas fa-piggy-bank"></i></div>
      <div class="stat-info">
        <div class="stat-label">Remaining ${infoBtn('How much budget is left after deducting expenses')}</div>
        <div class="stat-value" style="color:${totalBudget-totalSpent>=0?'var(--success)':'var(--danger)'}">${fmt(totalBudget - totalSpent)}</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:var(--warning-bg);color:var(--warning)"><i class="fas fa-percent"></i></div>
      <div class="stat-info">
        <div class="stat-label">Budget Used ${infoBtn('Percentage of your total budget consumed so far')}</div>
        <div class="stat-value" style="color:var(--warning)">${totalBudget ? Math.round(totalSpent/totalBudget*100) : 0}%</div>
      </div>
    </div>
  </div>

  ${!budgets.length ? `
  <div class="card">
    <div class="empty-state">
      <i class="fas fa-wallet"></i>
      <h3>No budgets set for ${formatMonth(m)}</h3>
      <p>Create budget allocations for each spending category to track your expenses against your plan.</p>
      <button class="btn btn-primary" onclick="openAddBudget()"><i class="fas fa-plus"></i> Add First Budget</button>
    </div>
  </div>` : `
  <div class="budget-grid">
    ${Object.entries(grouped).map(([cat, items]) => {
      const meta = getCategoryMeta(cat);
      const catBudget = items.reduce((s,b)=>s+b.amount,0);
      const catSpent  = expenses.filter(e=>e.category===cat).reduce((s,e)=>s+e.amount,0);
      const pct = catBudget > 0 ? Math.min(catSpent/catBudget*100, 100) : 0;
      const overBudget = catSpent > catBudget;
      const color = overBudget ? '#ef4444' : pct > 80 ? '#f59e0b' : meta.color;
      return `
      <div class="budget-item">
        <div class="budget-item-header">
          <div class="budget-item-left">
            <div class="budget-cat-icon" style="background:${meta.color}"><i class="fas ${meta.icon}"></i></div>
            <div>
              <div class="budget-cat-name">${cat}</div>
              <div class="budget-cat-sub">${items.length} item${items.length>1?'s':''}</div>
            </div>
          </div>
          <div style="display:flex;gap:4px">
            <button class="tbl-action-btn edit" onclick="openEditBudgetCategory('${cat}')" title="Edit"><i class="fas fa-pencil-alt"></i></button>
            <button class="tbl-action-btn delete" onclick="deleteBudgetCategory('${cat}')" title="Delete"><i class="fas fa-trash"></i></button>
          </div>
        </div>
        <div class="budget-amounts">
          <div style="display:flex;justify-content:space-between;align-items:baseline">
            <span class="budget-spent" style="color:${color}">${fmt(catSpent)}</span>
            <span class="budget-total">/ ${fmt(catBudget)}</span>
          </div>
        </div>
        <div class="progress">
          <div class="progress-bar" style="width:${pct}%;background:${color}"></div>
        </div>
        <div class="progress-info">
          <span>${Math.round(pct)}% used</span>
          <span class="${overBudget?'badge badge-danger':'badge badge-success'}" style="padding:1px 6px;font-size:10.5px">
            ${overBudget ? `Over by ${fmt(catSpent-catBudget)}` : `${fmt(catBudget-catSpent)} left`}
          </span>
        </div>
        ${items.map(b => `
        <div style="margin-top:8px;padding:8px;background:var(--surface2);border-radius:6px;display:flex;justify-content:space-between;align-items:center;font-size:12.5px">
          <span style="color:var(--text-muted)">${b.subcategory}</span>
          <div style="display:flex;align-items:center;gap:8px">
            <strong>${fmt(b.amount)}</strong>
            <button class="tbl-action-btn edit" style="width:22px;height:22px" onclick="openEditBudget('${b.id}')" title="Edit"><i class="fas fa-pencil-alt" style="font-size:10px"></i></button>
            <button class="tbl-action-btn delete" style="width:22px;height:22px" onclick="deleteBudget('${b.id}')" title="Delete"><i class="fas fa-trash" style="font-size:10px"></i></button>
          </div>
        </div>`).join('')}
      </div>`;
    }).join('')}
  </div>`}`;
}

function openAddBudget(prefill={}) {
  const allCats = [...Object.keys(DEFAULT_CATEGORIES), ...state.customCategories.filter(c=>c.type==='budget').map(c=>c.category)];
  const uniqueCats = [...new Set(allCats)];

  openModal('modal-add-budget', `
  <div class="modal-header">
    <div class="modal-title"><i class="fas fa-wallet" style="color:var(--primary)"></i> Add Budget Item ${infoBtn('Set a spending limit for a specific category and sub-category.')}</div>
    <button class="modal-close" onclick="closeModal('modal-add-budget')"><i class="fas fa-times"></i></button>
  </div>
  <div class="modal-body">
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Category <span class="required">*</span> ${infoBtn('Choose a main spending category. These align with your expense categories.')}</label>
        <select class="form-control" id="b-cat" onchange="updateBudgetSubcats()">
          <option value="">-- Select Category --</option>
          ${uniqueCats.map(c => `<option value="${c}" ${prefill.category===c?'selected':''}>${c}</option>`).join('')}
          <option value="__new__">+ Add New Category</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Sub-category <span class="required">*</span> ${infoBtn('Choose a specific sub-item under the main category, or create your own.')}</label>
        <select class="form-control" id="b-subcat">
          <option value="">-- Select Category First --</option>
        </select>
      </div>
    </div>
    <div class="form-group" id="b-newcat-wrap" style="display:none">
      <label class="form-label">New Category Name</label>
      <input class="form-control" id="b-newcat" placeholder="Enter custom category name">
    </div>
    <div class="form-group" id="b-newsubcat-wrap" style="display:none">
      <label class="form-label">New Sub-category Name</label>
      <input class="form-control" id="b-newsubcat" placeholder="Enter custom sub-category name">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Budget Amount <span class="required">*</span> ${infoBtn('Maximum amount you plan to spend in this sub-category for the month.')}</label>
        <div class="amount-input-wrap">
          <span class="currency-prefix">${state.settings.symbol}</span>
          <input type="number" class="form-control" id="b-amount" placeholder="0" min="0" value="${prefill.amount||''}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Month ${infoBtn('Which month does this budget apply to?')}</label>
        <input type="month" class="form-control" id="b-month" value="${state.month}">
      </div>
    </div>
  </div>
  <div class="modal-footer">
    <button class="btn btn-outline" onclick="closeModal('modal-add-budget')">Cancel</button>
    <button class="btn btn-primary" onclick="saveBudget()"><i class="fas fa-save"></i> Save Budget</button>
  </div>`, prefill);
  if (prefill.category) updateBudgetSubcats(prefill.subcategory);
}

function updateBudgetSubcats(presel='') {
  const cat = document.getElementById('b-cat').value;
  const subEl = document.getElementById('b-subcat');
  const newCatWrap = document.getElementById('b-newcat-wrap');
  newCatWrap.style.display = cat === '__new__' ? 'block' : 'none';

  if (!cat || cat === '__new__') { subEl.innerHTML = '<option value="">-- Enter category first --</option>'; return; }

  const builtIn = DEFAULT_CATEGORIES[cat]?.subcategories || [];
  const custom  = state.customCategories.filter(c=>c.type==='budget'&&c.category===cat).map(c=>c.subcategory);
  const all = [...builtIn, ...custom];

  subEl.innerHTML = all.map(s => `<option value="${s}" ${s===presel?'selected':''}>${s}</option>`).join('') +
    `<option value="__new__">+ Add New Sub-category</option>`;

  subEl.onchange = () => {
    document.getElementById('b-newsubcat-wrap').style.display = subEl.value === '__new__' ? 'block' : 'none';
  };
}

function saveBudget(editId=null) {
  let cat = document.getElementById('b-cat').value;
  let subcat = document.getElementById('b-subcat').value;
  const amount = parseFloat(document.getElementById('b-amount').value);
  const month  = document.getElementById('b-month').value;

  if (cat === '__new__') {
    cat = document.getElementById('b-newcat').value.trim();
    if (!cat) { toast('Please enter a category name', 'error'); return; }
    if (!state.customCategories.find(c=>c.type==='budget'&&c.category===cat)) {
      state.customCategories.push({ type:'budget', category:cat, subcategory:'' });
    }
  }
  if (subcat === '__new__' || !subcat) {
    subcat = document.getElementById('b-newsubcat')?.value?.trim() || document.getElementById('b-newcat')?.value?.trim() || cat;
    if (!subcat) { toast('Please select or enter a sub-category', 'error'); return; }
    if (!state.customCategories.find(c=>c.type==='budget'&&c.category===cat&&c.subcategory===subcat)) {
      state.customCategories.push({ type:'budget', category:cat, subcategory:subcat });
    }
  }

  if (!cat)    { toast('Please select a category', 'error'); return; }
  if (!amount || amount <= 0) { toast('Please enter a valid amount', 'error'); return; }
  if (!month)  { toast('Please select a month', 'error'); return; }

  if (editId) {
    const idx = state.budgets.findIndex(b=>b.id===editId);
    if (idx > -1) Object.assign(state.budgets[idx], { category:cat, subcategory:subcat, amount, month });
    toast('Budget updated!');
  } else {
    state.budgets.push({ id:uid(), month, category:cat, subcategory:subcat, amount });
    toast('Budget added!');
  }
  save();
  closeModal('modal-add-budget');
  renderView();
}

function openEditBudget(id) {
  const b = state.budgets.find(x=>x.id===id);
  if (!b) return;
  openAddBudget({ ...b, _editId: id });
  requestAnimationFrame(() => {
    document.querySelector('#modal-add-budget .btn-primary').onclick = () => saveBudget(id);
  });
}

function deleteBudget(id) {
  if (!confirm('Delete this budget item?')) return;
  state.budgets = state.budgets.filter(b => b.id !== id);
  save(); renderView(); toast('Budget deleted', 'warning');
}

function deleteBudgetCategory(cat) {
  if (!confirm(`Delete all budgets for "${cat}"?`)) return;
  state.budgets = state.budgets.filter(b => !(b.category === cat && b.month === state.month));
  save(); renderView(); toast('Category budgets deleted', 'warning');
}

function openEditBudgetCategory(cat) {
  const items = state.budgets.filter(b=>b.category===cat&&b.month===state.month);
  if (items.length === 1) { openEditBudget(items[0].id); return; }
  toast('Edit individual items by clicking the pencil icon on each sub-item', 'info');
}

function copyLastMonthBudget() {
  const [y,m] = state.month.split('-').map(Number);
  const lastDate = new Date(y, m-2, 1);
  const lastYM   = `${lastDate.getFullYear()}-${String(lastDate.getMonth()+1).padStart(2,'0')}`;
  const lastBudgets = state.budgets.filter(b=>b.month===lastYM);
  if (!lastBudgets.length) { toast('No budgets found for last month', 'warning'); return; }
  const currentExists = state.budgets.some(b=>b.month===state.month);
  if (currentExists && !confirm('This month already has budgets. Add last month\'s budgets on top?')) return;
  lastBudgets.forEach(b => {
    state.budgets.push({ ...b, id:uid(), month:state.month });
  });
  save(); renderView(); toast(`Copied ${lastBudgets.length} budgets from last month!`);
}

// ── EXPENSES ──────────────────────────────────────────────────────────────────

function renderExpenses(el) {
  const m = state.month;
  const expenses = state.expenses.filter(e => e.date.startsWith(m));
  const total = expenses.reduce((s,e) => s+e.amount, 0);

  el.innerHTML = `
  <div class="section-header">
    <div class="section-title">
      <i class="fas fa-receipt" style="color:var(--danger)"></i>
      Expenses for ${formatMonth(m)}
      ${infoBtn('Record all your expenses here. Each expense belongs to a main group (category) and sub-group (sub-category), which links to your budget planning.')}
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-primary" onclick="openAddExpense()">
        <i class="fas fa-plus"></i> Add Expense
      </button>
    </div>
  </div>

  <div class="stats-grid" style="margin-bottom:20px">
    <div class="stat-card">
      <div class="stat-icon" style="background:var(--danger-bg);color:var(--danger)"><i class="fas fa-receipt"></i></div>
      <div class="stat-info">
        <div class="stat-label">Total Spent</div>
        <div class="stat-value" style="color:var(--danger)">${fmt(total)}</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:var(--warning-bg);color:var(--warning)"><i class="fas fa-hashtag"></i></div>
      <div class="stat-info">
        <div class="stat-label">Transactions</div>
        <div class="stat-value" style="color:var(--warning)">${expenses.length}</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:var(--primary-bg);color:var(--primary)"><i class="fas fa-calculator"></i></div>
      <div class="stat-info">
        <div class="stat-label">Avg per Transaction ${infoBtn('Average amount spent per transaction this month')}</div>
        <div class="stat-value" style="color:var(--primary)">${expenses.length ? fmt(total/expenses.length) : fmt(0)}</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:var(--success-bg);color:var(--success)"><i class="fas fa-crown"></i></div>
      <div class="stat-info">
        <div class="stat-label">Largest Expense ${infoBtn('The single highest expense recorded this month')}</div>
        <div class="stat-value" style="color:var(--success)">${expenses.length ? fmt(Math.max(...expenses.map(e=>e.amount))) : fmt(0)}</div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-header">
      <div class="card-title"><i class="fas fa-list"></i> All Expenses</div>
      <div class="filters">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input type="text" placeholder="Search expenses…" id="exp-search" oninput="filterExpenses()">
        </div>
        <select class="form-control" id="exp-cat-filter" onchange="filterExpenses()" style="width:auto;padding:7px 28px 7px 10px;font-size:13px">
          <option value="">All Categories</option>
          ${[...new Set(expenses.map(e=>e.category))].map(c=>`<option value="${c}">${c}</option>`).join('')}
        </select>
      </div>
    </div>
    ${expenses.length ? `
    <div class="table-wrap">
      <table id="expenses-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Category ${infoBtn('Main expense group — links to your budget category')}</th>
            <th>Sub-category ${infoBtn('Sub-group within the main category for detailed tracking')}</th>
            <th>Description</th>
            <th>Payment ${infoBtn('Method used to pay for this expense')}</th>
            <th style="text-align:right">Amount</th>
            <th style="text-align:right">Actions</th>
          </tr>
        </thead>
        <tbody id="expenses-tbody">
          ${renderExpenseRows(expenses)}
        </tbody>
      </table>
    </div>` : `
    <div class="empty-state">
      <i class="fas fa-receipt"></i>
      <h3>No expenses recorded for ${formatMonth(m)}</h3>
      <p>Start tracking your spending by adding your first expense.</p>
      <button class="btn btn-primary" onclick="openAddExpense()"><i class="fas fa-plus"></i> Add Expense</button>
    </div>`}
  </div>`;
}

function renderExpenseRows(expenses) {
  return [...expenses].reverse().map(e => {
    const meta = getCategoryMeta(e.category);
    return `<tr>
      <td>${new Date(e.date).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</td>
      <td>
        <span style="display:flex;align-items:center;gap:6px">
          <span style="width:8px;height:8px;border-radius:50%;background:${meta.color};display:inline-block;flex-shrink:0"></span>
          ${e.category}
        </span>
      </td>
      <td>${e.subcategory || '—'}</td>
      <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${e.description||''}">${e.description || '—'}</td>
      <td><span class="badge badge-gray">${e.payment || 'Cash'}</span></td>
      <td style="text-align:right;font-weight:700;color:var(--danger)">${fmt(e.amount)}</td>
      <td>
        <div class="tbl-actions">
          <button class="tbl-action-btn edit" onclick="openEditExpense('${e.id}')" title="Edit"><i class="fas fa-pencil-alt"></i></button>
          <button class="tbl-action-btn delete" onclick="deleteExpense('${e.id}')" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function filterExpenses() {
  const search = document.getElementById('exp-search')?.value?.toLowerCase() || '';
  const cat    = document.getElementById('exp-cat-filter')?.value || '';
  const m = state.month;
  let expenses = state.expenses.filter(e => e.date.startsWith(m));
  if (cat)    expenses = expenses.filter(e => e.category === cat);
  if (search) expenses = expenses.filter(e =>
    e.category.toLowerCase().includes(search) ||
    (e.subcategory||'').toLowerCase().includes(search) ||
    (e.description||'').toLowerCase().includes(search)
  );
  const tbody = document.getElementById('expenses-tbody');
  if (tbody) tbody.innerHTML = renderExpenseRows(expenses);
}

function openAddExpense(prefill={}) {
  const allCats = [...Object.keys(DEFAULT_CATEGORIES), ...state.customCategories.filter(c=>c.type==='expense').map(c=>c.category)];
  const uniqueCats = [...new Set(allCats)];
  const today = new Date().toISOString().split('T')[0];

  openModal('modal-add-expense', `
  <div class="modal-header">
    <div class="modal-title"><i class="fas fa-receipt" style="color:var(--danger)"></i> ${prefill.id?'Edit':'Add'} Expense ${infoBtn('Record an expense. Assign it to a main group (category) and a specific sub-group for accurate budget tracking.')}</div>
    <button class="modal-close" onclick="closeModal('modal-add-expense')"><i class="fas fa-times"></i></button>
  </div>
  <div class="modal-body">
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Main Group (Category) <span class="required">*</span> ${infoBtn('Main category — this must match your budget categories for tracking to work.')}</label>
        <select class="form-control" id="e-cat" onchange="updateExpenseSubcats()">
          <option value="">-- Select Category --</option>
          ${uniqueCats.map(c => `<option value="${c}" ${prefill.category===c?'selected':''}>${c}</option>`).join('')}
          <option value="__new__">+ Add New Category</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Sub-group (Sub-category) ${infoBtn('Specific sub-item within the main category. Helps you see exactly where money goes.')}</label>
        <select class="form-control" id="e-subcat">
          <option value="">-- Select Category First --</option>
        </select>
      </div>
    </div>
    <div class="form-group" id="e-newcat-wrap" style="display:none">
      <label class="form-label">New Category Name</label>
      <input class="form-control" id="e-newcat" placeholder="Enter custom category name">
    </div>
    <div class="form-group" id="e-newsubcat-wrap" style="display:none">
      <label class="form-label">New Sub-category Name</label>
      <input class="form-control" id="e-newsubcat" placeholder="Enter custom sub-category name">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Amount <span class="required">*</span></label>
        <div class="amount-input-wrap">
          <span class="currency-prefix">${state.settings.symbol}</span>
          <input type="number" class="form-control" id="e-amount" placeholder="0" min="0" value="${prefill.amount||''}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Date <span class="required">*</span></label>
        <input type="date" class="form-control" id="e-date" value="${prefill.date || today}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Payment Method ${infoBtn('How did you pay for this expense?')}</label>
        <select class="form-control" id="e-payment">
          ${PAYMENT_METHODS.map(p => `<option value="${p}" ${prefill.payment===p?'selected':''}>${p}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Description / Notes</label>
        <input class="form-control" id="e-desc" placeholder="Optional notes" value="${prefill.description||''}">
      </div>
    </div>
  </div>
  <div class="modal-footer">
    <button class="btn btn-outline" onclick="closeModal('modal-add-expense')">Cancel</button>
    <button class="btn btn-primary" onclick="saveExpense(${prefill.id?`'${prefill.id}'`:null})"><i class="fas fa-save"></i> ${prefill.id?'Update':'Save'} Expense</button>
  </div>`);
  if (prefill.category) updateExpenseSubcats(prefill.subcategory);
}

function updateExpenseSubcats(presel='') {
  const cat = document.getElementById('e-cat').value;
  const subEl = document.getElementById('e-subcat');
  document.getElementById('e-newcat-wrap').style.display = cat==='__new__' ? 'block' : 'none';
  if (!cat || cat==='__new__') { subEl.innerHTML = '<option value="">-- Enter category first --</option>'; return; }

  const builtIn = DEFAULT_CATEGORIES[cat]?.subcategories || [];
  const custom  = state.customCategories.filter(c=>c.type==='expense'&&c.category===cat).map(c=>c.subcategory);
  const all = [...builtIn, ...custom];

  subEl.innerHTML = `<option value="">-- Optional --</option>` +
    all.map(s => `<option value="${s}" ${s===presel?'selected':''}>${s}</option>`).join('') +
    `<option value="__new__">+ Add New Sub-category</option>`;

  subEl.onchange = () => {
    document.getElementById('e-newsubcat-wrap').style.display = subEl.value==='__new__' ? 'block' : 'none';
  };
}

function saveExpense(editId=null) {
  let cat    = document.getElementById('e-cat').value;
  let subcat = document.getElementById('e-subcat').value;
  const amount  = parseFloat(document.getElementById('e-amount').value);
  const date    = document.getElementById('e-date').value;
  const payment = document.getElementById('e-payment').value;
  const desc    = document.getElementById('e-desc').value.trim();

  if (cat==='__new__') {
    cat = document.getElementById('e-newcat').value.trim();
    if (!cat) { toast('Please enter a category name','error'); return; }
    if (!state.customCategories.find(c=>c.type==='expense'&&c.category===cat)) state.customCategories.push({type:'expense',category:cat,subcategory:''});
  }
  if (subcat==='__new__') {
    subcat = document.getElementById('e-newsubcat').value.trim();
    if (subcat && !state.customCategories.find(c=>c.type==='expense'&&c.category===cat&&c.subcategory===subcat)) state.customCategories.push({type:'expense',category:cat,subcategory:subcat});
  }

  if (!cat)   { toast('Please select a category','error'); return; }
  if (!amount || amount<=0) { toast('Please enter a valid amount','error'); return; }
  if (!date)  { toast('Please select a date','error'); return; }

  const entry = { category:cat, subcategory:subcat||'', amount, date, payment, description:desc };
  if (editId) {
    const idx = state.expenses.findIndex(e=>e.id===editId);
    if (idx>-1) Object.assign(state.expenses[idx], entry);
    toast('Expense updated!');
  } else {
    state.expenses.push({ id:uid(), ...entry });
    toast('Expense added!');
  }
  save(); closeModal('modal-add-expense'); renderView();
}

function openEditExpense(id) {
  const e = state.expenses.find(x=>x.id===id);
  if (!e) return;
  openAddExpense(e);
}

function deleteExpense(id) {
  if (!confirm('Delete this expense?')) return;
  state.expenses = state.expenses.filter(e=>e.id!==id);
  save(); renderView(); toast('Expense deleted','warning');
}

// ── INCOME ────────────────────────────────────────────────────────────────────

function renderIncome(el) {
  const m = state.month;
  const incomes = state.incomes.filter(i => i.date.startsWith(m));
  const total   = incomes.reduce((s,i) => s+i.amount, 0);

  el.innerHTML = `
  <div class="section-header">
    <div class="section-title">
      <i class="fas fa-coins" style="color:var(--success)"></i>
      Income for ${formatMonth(m)}
      ${infoBtn('Track all sources of income — salary, freelance, investments, etc. This powers your savings calculation on the dashboard.')}
    </div>
    <button class="btn btn-success" onclick="openAddIncome()">
      <i class="fas fa-plus"></i> Add Income
    </button>
  </div>

  <div class="stats-grid" style="margin-bottom:20px">
    <div class="stat-card">
      <div class="stat-icon" style="background:var(--success-bg);color:var(--success)"><i class="fas fa-coins"></i></div>
      <div class="stat-info">
        <div class="stat-label">Total Income</div>
        <div class="stat-value" style="color:var(--success)">${fmt(total)}</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:var(--warning-bg);color:var(--warning)"><i class="fas fa-list-ol"></i></div>
      <div class="stat-info">
        <div class="stat-label">Income Sources</div>
        <div class="stat-value" style="color:var(--warning)">${incomes.length}</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:var(--danger-bg);color:var(--danger)"><i class="fas fa-minus-circle"></i></div>
      <div class="stat-info">
        <div class="stat-label">Total Expenses</div>
        <div class="stat-value" style="color:var(--danger)">${fmt(state.expenses.filter(e=>e.date.startsWith(m)).reduce((s,e)=>s+e.amount,0))}</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:var(--primary-bg);color:var(--primary)"><i class="fas fa-piggy-bank"></i></div>
      <div class="stat-info">
        <div class="stat-label">Net Savings ${infoBtn('Income minus Expenses for the month')}</div>
        <div class="stat-value" style="color:var(--primary)">
          ${fmt(total - state.expenses.filter(e=>e.date.startsWith(m)).reduce((s,e)=>s+e.amount,0))}
        </div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-header">
      <div class="card-title"><i class="fas fa-list"></i> Income Records</div>
    </div>
    ${incomes.length ? `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Category ${infoBtn('Main income type — salary, business, investment, etc.')}</th>
            <th>Sub-category ${infoBtn('Specific source within the main income type')}</th>
            <th>Source / Description</th>
            <th style="text-align:right">Amount</th>
            <th style="text-align:right">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${[...incomes].reverse().map(i => {
            const meta = getIncomeCategoryMeta(i.category);
            return `<tr>
              <td>${new Date(i.date).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</td>
              <td><span style="display:flex;align-items:center;gap:6px">
                <span style="width:8px;height:8px;border-radius:50%;background:${meta.color};display:inline-block"></span>${i.category}
              </span></td>
              <td>${i.subcategory||'—'}</td>
              <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${i.description||'—'}</td>
              <td style="text-align:right;font-weight:700;color:var(--success)">+${fmt(i.amount)}</td>
              <td>
                <div class="tbl-actions">
                  <button class="tbl-action-btn edit" onclick="openEditIncome('${i.id}')"><i class="fas fa-pencil-alt"></i></button>
                  <button class="tbl-action-btn delete" onclick="deleteIncome('${i.id}')"><i class="fas fa-trash"></i></button>
                </div>
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>` : `
    <div class="empty-state">
      <i class="fas fa-coins"></i>
      <h3>No income recorded for ${formatMonth(m)}</h3>
      <p>Add your salary, freelance income, dividends and other earnings here.</p>
      <button class="btn btn-success" onclick="openAddIncome()"><i class="fas fa-plus"></i> Add Income</button>
    </div>`}
  </div>`;
}

function openAddIncome(prefill={}) {
  const allCats = [...Object.keys(INCOME_CATEGORIES), ...state.customCategories.filter(c=>c.type==='income').map(c=>c.category)];
  const uniqueCats = [...new Set(allCats)];
  const today = new Date().toISOString().split('T')[0];

  openModal('modal-add-income', `
  <div class="modal-header">
    <div class="modal-title"><i class="fas fa-coins" style="color:var(--success)"></i> ${prefill.id?'Edit':'Add'} Income ${infoBtn('Record any income you receive — salary, rental, dividends, freelance, gifts, etc.')}</div>
    <button class="modal-close" onclick="closeModal('modal-add-income')"><i class="fas fa-times"></i></button>
  </div>
  <div class="modal-body">
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Income Category <span class="required">*</span> ${infoBtn('Type of income — helps categorise your earnings for reporting.')}</label>
        <select class="form-control" id="inc-cat" onchange="updateIncomeSubcats()">
          <option value="">-- Select Category --</option>
          ${uniqueCats.map(c=>`<option value="${c}" ${prefill.category===c?'selected':''}>${c}</option>`).join('')}
          <option value="__new__">+ Add New Category</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Sub-category ${infoBtn('More specific source — e.g., for Employment Income: "Monthly Salary", "Bonus" etc.')}</label>
        <select class="form-control" id="inc-subcat">
          <option value="">-- Select Category First --</option>
        </select>
      </div>
    </div>
    <div class="form-group" id="inc-newcat-wrap" style="display:none">
      <label class="form-label">New Category Name</label>
      <input class="form-control" id="inc-newcat" placeholder="e.g., Rental Income">
    </div>
    <div class="form-group" id="inc-newsubcat-wrap" style="display:none">
      <label class="form-label">New Sub-category</label>
      <input class="form-control" id="inc-newsubcat" placeholder="e.g., Shop Rent">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Amount <span class="required">*</span></label>
        <div class="amount-input-wrap">
          <span class="currency-prefix">${state.settings.symbol}</span>
          <input type="number" class="form-control" id="inc-amount" placeholder="0" min="0" value="${prefill.amount||''}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Date <span class="required">*</span></label>
        <input type="date" class="form-control" id="inc-date" value="${prefill.date||today}">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Source / Description</label>
      <input class="form-control" id="inc-desc" placeholder="e.g., TechCorp Ltd — April 2026 salary" value="${prefill.description||''}">
    </div>
  </div>
  <div class="modal-footer">
    <button class="btn btn-outline" onclick="closeModal('modal-add-income')">Cancel</button>
    <button class="btn btn-success" onclick="saveIncome(${prefill.id?`'${prefill.id}'`:null})"><i class="fas fa-save"></i> ${prefill.id?'Update':'Save'} Income</button>
  </div>`);
  if (prefill.category) updateIncomeSubcats(prefill.subcategory);
}

function updateIncomeSubcats(presel='') {
  const cat   = document.getElementById('inc-cat').value;
  const subEl = document.getElementById('inc-subcat');
  document.getElementById('inc-newcat-wrap').style.display = cat==='__new__'?'block':'none';
  if (!cat||cat==='__new__') { subEl.innerHTML='<option value="">—</option>'; return; }

  const builtIn = INCOME_CATEGORIES[cat]?.subcategories||[];
  const custom  = state.customCategories.filter(c=>c.type==='income'&&c.category===cat).map(c=>c.subcategory);
  const all = [...builtIn,...custom];
  subEl.innerHTML = `<option value="">-- Optional --</option>` +
    all.map(s=>`<option value="${s}" ${s===presel?'selected':''}>${s}</option>`).join('')+
    `<option value="__new__">+ Add New</option>`;
  subEl.onchange = () => { document.getElementById('inc-newsubcat-wrap').style.display = subEl.value==='__new__'?'block':'none'; };
}

function saveIncome(editId=null) {
  let cat    = document.getElementById('inc-cat').value;
  let subcat = document.getElementById('inc-subcat').value;
  const amount = parseFloat(document.getElementById('inc-amount').value);
  const date   = document.getElementById('inc-date').value;
  const desc   = document.getElementById('inc-desc').value.trim();

  if (cat==='__new__') {
    cat = document.getElementById('inc-newcat').value.trim();
    if (!cat){toast('Enter category name','error');return;}
    if(!state.customCategories.find(c=>c.type==='income'&&c.category===cat)) state.customCategories.push({type:'income',category:cat,subcategory:''});
  }
  if (subcat==='__new__') {
    subcat = document.getElementById('inc-newsubcat').value.trim();
    if(subcat&&!state.customCategories.find(c=>c.type==='income'&&c.category===cat&&c.subcategory===subcat)) state.customCategories.push({type:'income',category:cat,subcategory:subcat});
  }

  if (!cat)  {toast('Select a category','error');return;}
  if (!amount||amount<=0){toast('Enter a valid amount','error');return;}
  if (!date) {toast('Select a date','error');return;}

  const entry = { category:cat, subcategory:subcat||'', amount, date, description:desc };
  if (editId) {
    const idx = state.incomes.findIndex(i=>i.id===editId);
    if(idx>-1) Object.assign(state.incomes[idx], entry);
    toast('Income updated!');
  } else {
    state.incomes.push({ id:uid(), ...entry });
    toast('Income added!');
  }
  save(); closeModal('modal-add-income'); renderView();
}

function openEditIncome(id) {
  const i = state.incomes.find(x=>x.id===id);
  if (i) openAddIncome(i);
}

function deleteIncome(id) {
  if (!confirm('Delete this income entry?')) return;
  state.incomes = state.incomes.filter(i=>i.id!==id);
  save(); renderView(); toast('Income deleted','warning');
}

// ── INVESTMENTS ───────────────────────────────────────────────────────────────

function renderInvestments(el) {
  const country = state.settings.country;
  const countryData = COUNTRIES[country];
  const total = state.investments.reduce((s,i) => s+i.amount, 0);
  const byType = {};
  state.investments.forEach(i => { byType[i.assetType] = (byType[i.assetType]||0) + i.amount; });

  el.innerHTML = `
  <div class="section-header">
    <div class="section-title">
      <i class="fas fa-chart-line" style="color:#22c55e"></i>
      Investment Portfolio
      ${infoBtn('Track all your investments in one place. Investments are grouped by your home country to show relevant options. You can always add custom investments not in the list.')}
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn btn-outline" onclick="openCountrySelector()">
        ${countryData?.flag||'🌍'} Change Country
      </button>
      <button class="btn btn-success" onclick="openAddInvestment()">
        <i class="fas fa-plus"></i> Add Investment
      </button>
    </div>
  </div>

  <div class="stats-grid" style="margin-bottom:20px">
    <div class="stat-card">
      <div class="stat-icon" style="background:#dcfce7;color:#16a34a"><i class="fas fa-coins"></i></div>
      <div class="stat-info">
        <div class="stat-label">Total Invested ${infoBtn('Sum of principal amounts across all investments recorded')}</div>
        <div class="stat-value" style="color:#16a34a">${fmt(total)}</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:var(--primary-bg);color:var(--primary)"><i class="fas fa-layer-group"></i></div>
      <div class="stat-info">
        <div class="stat-label">Investments</div>
        <div class="stat-value" style="color:var(--primary)">${state.investments.length}</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:var(--warning-bg);color:var(--warning)"><i class="fas fa-th-large"></i></div>
      <div class="stat-info">
        <div class="stat-label">Asset Types ${infoBtn('Number of distinct asset type categories you hold')}</div>
        <div class="stat-value" style="color:var(--warning)">${Object.keys(byType).length}</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:var(--info-bg);color:var(--info)"><i class="fas fa-globe"></i></div>
      <div class="stat-info">
        <div class="stat-label">Home Country ${infoBtn('Your selected home country determines which investment types are suggested')}</div>
        <div class="stat-value" style="font-size:16px">${countryData?.flag||'🌍'} ${countryData?.name||'Other'}</div>
      </div>
    </div>
  </div>

  <div class="grid-2" style="margin-bottom:20px">
    <div class="card">
      <div class="card-header">
        <div class="card-title"><i class="fas fa-chart-donut" style="color:#16a34a"></i> Portfolio by Asset Type ${infoBtn('Distribution of your investments across different asset type categories')}</div>
      </div>
      <div class="card-body">
        <div class="chart-container" style="height:240px">
          <canvas id="invPieChart"></canvas>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-header">
        <div class="card-title"><i class="fas fa-list-ul" style="color:var(--primary)"></i> Asset Allocation ${infoBtn('How much of your total portfolio is in each asset type')}</div>
      </div>
      <div class="card-body">
        ${Object.entries(byType).sort((a,b)=>b[1]-a[1]).map(([type, amt]) => {
          const pct = total > 0 ? Math.round(amt/total*100) : 0;
          const colors = ['#6366f1','#22c55e','#f59e0b','#ef4444','#06b6d4','#8b5cf6','#ec4899','#10b981'];
          const color  = colors[Object.keys(byType).indexOf(type) % colors.length];
          return `<div style="margin-bottom:12px">
            <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:600;margin-bottom:4px">
              <span style="display:flex;align-items:center;gap:6px"><span class="color-dot" style="background:${color}"></span>${type}</span>
              <span>${pct}% · ${fmt(amt)}</span>
            </div>
            <div class="progress"><div class="progress-bar" style="width:${pct}%;background:${color}"></div></div>
          </div>`;
        }).join('') || `<div class="empty-state" style="padding:24px"><p>No investments yet</p></div>`}
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-header">
      <div class="card-title"><i class="fas fa-list"></i> All Investments</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${Object.keys(countryData?.assetTypes||{}).map(t =>
          `<button class="filter-chip" data-assettype="${t}" onclick="filterInvestments('${t}')">${t}</button>`
        ).join('')}
        <button class="filter-chip active" data-assettype="all" onclick="filterInvestments('all')">All</button>
      </div>
    </div>
    <div id="inv-list">
      ${renderInvestmentList(state.investments)}
    </div>
  </div>`;

  requestAnimationFrame(() => renderInvPieChart(byType));
}

function renderInvestmentList(investments) {
  if (!investments.length) return `
  <div class="empty-state">
    <i class="fas fa-chart-line"></i>
    <h3>No investments recorded yet</h3>
    <p>Start tracking your investments — stocks, mutual funds, PPF, FDs, real estate and more.</p>
    <button class="btn btn-success" onclick="openAddInvestment()"><i class="fas fa-plus"></i> Add Investment</button>
  </div>`;

  return `<div class="table-wrap"><table>
    <thead><tr>
      <th>Name</th>
      <th>Asset Type ${infoBtn('Category of investment — e.g., Government Schemes, Mutual Funds, Stocks etc.')}</th>
      <th>Amount</th>
      <th>Date</th>
      <th>Expected Return ${infoBtn('Approximate expected annual return for this investment type')}</th>
      <th>Tax Benefit ${infoBtn('Any tax deduction or exemption available on this investment')}</th>
      <th>Notes</th>
      <th style="text-align:right">Actions</th>
    </tr></thead>
    <tbody>
      ${[...investments].reverse().map(inv => `
      <tr>
        <td>
          <div style="font-weight:700;font-size:13.5px">${inv.name}</div>
          ${inv.isCustom ? '<span class="badge badge-info" style="font-size:10px">Custom</span>' : ''}
        </td>
        <td><span class="badge badge-primary">${inv.assetType}</span></td>
        <td style="font-weight:700;color:#16a34a">${fmt(inv.amount)}</td>
        <td>${inv.date ? new Date(inv.date).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) : '—'}</td>
        <td><span class="badge badge-success">${inv.expectedReturn||'—'}</span></td>
        <td style="font-size:12.5px;max-width:140px">${inv.taxBenefit||'—'}</td>
        <td style="font-size:12.5px;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${inv.notes||'—'}</td>
        <td>
          <div class="tbl-actions">
            <button class="tbl-action-btn edit" onclick="openEditInvestment('${inv.id}')"><i class="fas fa-pencil-alt"></i></button>
            <button class="tbl-action-btn delete" onclick="deleteInvestment('${inv.id}')"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>`).join('')}
    </tbody>
  </table></div>`;
}

function filterInvestments(assetType) {
  document.querySelectorAll('.filter-chip').forEach(el => {
    el.classList.toggle('active', el.dataset.assettype === assetType);
  });
  const filtered = assetType === 'all' ? state.investments : state.investments.filter(i => i.assetType === assetType);
  document.getElementById('inv-list').innerHTML = renderInvestmentList(filtered);
}

function renderInvPieChart(byType) {
  const canvas = document.getElementById('invPieChart');
  if (!canvas) return;
  if (!Object.keys(byType).length) { canvas.parentElement.innerHTML = `<div class="empty-state" style="padding:32px"><i class="fas fa-chart-pie"></i><p>No investments yet</p></div>`; return; }
  const labels = Object.keys(byType);
  const data   = Object.values(byType);
  const colors = ['#6366f1','#22c55e','#f59e0b','#ef4444','#06b6d4','#8b5cf6','#ec4899','#10b981'];
  if (window._invPie) window._invPie.destroy();
  window._invPie = new Chart(canvas, {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: colors.slice(0,labels.length), borderWidth:2, borderColor: getComputedStyle(document.documentElement).getPropertyValue('--surface') }] },
    options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'right', labels:{ boxWidth:12, padding:10, font:{size:11}, color: getComputedStyle(document.documentElement).getPropertyValue('--text') }}}, cutout:'65%' }
  });
}

function openCountrySelector() {
  openModal('modal-country', `
  <div class="modal-header">
    <div class="modal-title"><i class="fas fa-globe" style="color:var(--info)"></i> Select Your Home Country ${infoBtn('Your home country determines which investment types are suggested. Country-specific investment options like PPF, NPS (India), 401k (USA), ISA (UK) etc. will be shown.')}</div>
    <button class="modal-close" onclick="closeModal('modal-country')"><i class="fas fa-times"></i></button>
  </div>
  <div class="modal-body">
    <p style="font-size:13px;color:var(--text-muted);margin-bottom:12px">Choose your country to see relevant investment types. You can always add custom investments not in the list.</p>
    <div class="country-grid">
      ${Object.entries(COUNTRIES).map(([k,v]) => `
      <div class="country-item ${state.settings.country===k?'selected':''}" onclick="setCountry('${k}')">
        <span class="country-flag">${v.flag}</span>
        <span>${v.name}</span>
      </div>`).join('')}
    </div>
  </div>
  <div class="modal-footer">
    <button class="btn btn-outline" onclick="closeModal('modal-country')">Close</button>
  </div>`);
}

function setCountry(code) {
  state.settings.country = code;
  state.settings.currency = COUNTRIES[code].currency;
  state.settings.symbol   = COUNTRIES[code].symbol;
  save();
  closeModal('modal-country');
  renderView();
  toast(`Country set to ${COUNTRIES[code].name}`);
}

function openAddInvestment(prefill={}) {
  const country = state.settings.country;
  const assetTypes = Object.keys(COUNTRIES[country]?.assetTypes || {});

  openModal('modal-add-inv', `
  <div class="modal-header">
    <div class="modal-title"><i class="fas fa-chart-line" style="color:#16a34a"></i> ${prefill.id?'Edit':'Add'} Investment ${infoBtn('Record an investment. Choose from country-specific options or add a custom investment type not in the list.')}</div>
    <button class="modal-close" onclick="closeModal('modal-add-inv')"><i class="fas fa-times"></i></button>
  </div>
  <div class="modal-body">
    <div class="form-group">
      <label class="form-label">Asset Type <span class="required">*</span> ${infoBtn('Broad category of investment — e.g., Government Schemes, Mutual Funds, Retirement Accounts. Based on your home country: ' + (COUNTRIES[country]?.name||'Other'))}</label>
      <select class="form-control" id="inv-assettype" onchange="updateInvNames()">
        <option value="">-- Select Asset Type --</option>
        ${assetTypes.map(t=>`<option value="${t}" ${prefill.assetType===t?'selected':''}>${t}</option>`).join('')}
        <option value="__custom__">+ Custom Asset Type</option>
      </select>
    </div>
    <div class="form-group" id="inv-custom-type-wrap" style="display:none">
      <label class="form-label">Custom Asset Type Name</label>
      <input class="form-control" id="inv-custom-type" placeholder="e.g., Angel Investment, Art Collection">
    </div>
    <div class="form-group">
      <label class="form-label">Investment Name <span class="required">*</span> ${infoBtn('Specific investment product — e.g., "HDFC Balanced Fund", "Reliance Stock", "PPF Account". Appears in the investment list.')}</label>
      <select class="form-control" id="inv-name-select" style="margin-bottom:6px" onchange="onInvNameSelect()">
        <option value="">-- Select Asset Type First --</option>
      </select>
      <input class="form-control" id="inv-name-custom" placeholder="Or type custom investment name…" value="${prefill.name||''}">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Amount Invested <span class="required">*</span> ${infoBtn('Principal amount you invested or contributed. For SIPs, use total invested so far.')}</label>
        <div class="amount-input-wrap">
          <span class="currency-prefix">${state.settings.symbol}</span>
          <input type="number" class="form-control" id="inv-amount" placeholder="0" min="0" value="${prefill.amount||''}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Start / Purchase Date</label>
        <input type="date" class="form-control" id="inv-date" value="${prefill.date||new Date().toISOString().split('T')[0]}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Expected Annual Return ${infoBtn('Approximate return percentage per year — pre-filled from investment type but you can override.')}</label>
        <input class="form-control" id="inv-return" placeholder="e.g., 7.1% p.a." value="${prefill.expectedReturn||''}">
      </div>
      <div class="form-group">
        <label class="form-label">Tax Benefit ${infoBtn('Any tax deduction or exemption — e.g., Section 80C, Roth IRA, ISA etc. Auto-filled but editable.')}</label>
        <input class="form-control" id="inv-tax" placeholder="e.g., Section 80C" value="${prefill.taxBenefit||''}">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Lock-in Period ${infoBtn('Minimum holding period before you can withdraw without penalty.')}</label>
      <input class="form-control" id="inv-lockin" placeholder="e.g., 3 years, None" value="${prefill.lockIn||''}">
    </div>
    <div class="form-group">
      <label class="form-label">Notes</label>
      <textarea class="form-control" id="inv-notes" placeholder="e.g., Account number, broker name, maturity date, goal…">${prefill.notes||''}</textarea>
    </div>
  </div>
  <div class="modal-footer">
    <button class="btn btn-outline" onclick="closeModal('modal-add-inv')">Cancel</button>
    <button class="btn btn-success" onclick="saveInvestment(${prefill.id?`'${prefill.id}'`:null})"><i class="fas fa-save"></i> ${prefill.id?'Update':'Save'} Investment</button>
  </div>`);

  document.getElementById('inv-assettype').onchange = updateInvNames;
  if (prefill.assetType) { document.getElementById('inv-assettype').value = prefill.assetType; updateInvNames(prefill.name); }
}

function updateInvNames(presel='') {
  const at = document.getElementById('inv-assettype').value;
  const country = state.settings.country;
  const customWrap = document.getElementById('inv-custom-type-wrap');
  customWrap.style.display = at === '__custom__' ? 'block' : 'none';

  const sel = document.getElementById('inv-name-select');
  if (!at || at === '__custom__') { sel.innerHTML='<option value="">—</option>'; return; }

  const items = COUNTRIES[country]?.assetTypes?.[at] || [];
  const customInvs = state.customInvestments.filter(c=>c.country===country&&c.assetType===at);
  const all = [...items, ...customInvs.map(c=>({ name:c.name, returns:'Custom', lockIn:'Custom', taxBenefit:'Custom' }))];

  sel.innerHTML = `<option value="">-- Choose or type below --</option>` +
    all.map(i=>`<option value="${i.name}|${i.returns}|${i.lockIn}|${i.taxBenefit}" ${i.name===presel?'selected':''}>${i.name}</option>`).join('');
  if (presel) { const opt = all.find(i=>i.name===presel); if(opt) sel.value=`${opt.name}|${opt.returns}|${opt.lockIn}|${opt.taxBenefit}`; }
}

function onInvNameSelect() {
  const sel = document.getElementById('inv-name-select');
  const val = sel.value;
  if (!val) return;
  const [name,ret,lockin,tax] = val.split('|');
  document.getElementById('inv-name-custom').value = name;
  document.getElementById('inv-return').value = ret !== 'Varies' && ret !== 'Custom' ? ret : '';
  document.getElementById('inv-lockin').value = lockin !== 'Custom' ? lockin : '';
  document.getElementById('inv-tax').value    = tax !== 'None' && tax !== 'Custom' ? tax : '';
}

function saveInvestment(editId=null) {
  let assetType = document.getElementById('inv-assettype').value;
  const country = state.settings.country;

  if (assetType === '__custom__') {
    assetType = document.getElementById('inv-custom-type').value.trim();
    if (!assetType) { toast('Enter asset type name','error'); return; }
  }

  let name = document.getElementById('inv-name-custom').value.trim();
  if (!name) name = document.getElementById('inv-name-select').value.split('|')[0];
  const amount   = parseFloat(document.getElementById('inv-amount').value);
  const date     = document.getElementById('inv-date').value;
  const ret      = document.getElementById('inv-return').value.trim();
  const tax      = document.getElementById('inv-tax').value.trim();
  const lockin   = document.getElementById('inv-lockin').value.trim();
  const notes    = document.getElementById('inv-notes').value.trim();

  if (!assetType) { toast('Select an asset type','error'); return; }
  if (!name)      { toast('Enter investment name','error'); return; }
  if (!amount||amount<=0) { toast('Enter valid amount','error'); return; }

  // save custom investment if new
  const known = COUNTRIES[country]?.assetTypes?.[assetType]?.find(i=>i.name===name);
  if (!known && !state.customInvestments.find(c=>c.country===country&&c.name===name)) {
    state.customInvestments.push({ country, assetType, name });
  }

  const entry = { assetType, name, amount, date, expectedReturn:ret, taxBenefit:tax, lockIn:lockin, notes, country, isCustom:!known };
  if (editId) {
    const idx = state.investments.findIndex(i=>i.id===editId);
    if (idx>-1) Object.assign(state.investments[idx], entry);
    toast('Investment updated!');
  } else {
    state.investments.push({ id:uid(), ...entry });
    toast('Investment added!');
  }
  save(); closeModal('modal-add-inv'); renderView();
}

function openEditInvestment(id) {
  const i = state.investments.find(x=>x.id===id);
  if (i) openAddInvestment(i);
}

function deleteInvestment(id) {
  if (!confirm('Delete this investment?')) return;
  state.investments = state.investments.filter(i=>i.id!==id);
  save(); renderView(); toast('Investment deleted','warning');
}

// ── SETTINGS ──────────────────────────────────────────────────────────────────

function renderSettings(el) {
  const s = state.settings;
  const session = getSession() || {};
  el.innerHTML = `
  <div class="section-title" style="margin-bottom:20px"><i class="fas fa-cog" style="color:var(--primary)"></i> Settings</div>

  <div class="settings-section">
    <div class="settings-section-title">Account</div>
    <div class="setting-row">
      <div class="setting-info">
        <div class="setting-name">Signed In As</div>
        <div class="setting-desc">${session.email || '—'}</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:14px;font-weight:700">${session.name || '—'}</span>
        <button class="btn btn-outline btn-sm" onclick="logout()" style="border-color:#ef4444;color:#ef4444" onmouseover="this.style.background='#fee2e2'" onmouseout="this.style.background=''">
          <i class="fas fa-sign-out-alt"></i> Sign Out
        </button>
      </div>
    </div>
  </div>

  <div class="settings-section">
    <div class="settings-section-title">Profile & Preferences</div>
    <div class="setting-row">
      <div class="setting-info">
        <div class="setting-name">Display Name</div>
        <div class="setting-desc">Your name shown in the app sidebar</div>
      </div>
      <input class="form-control" id="s-name" value="${s.name}" style="width:200px" onchange="updateSetting('name',this.value)">
    </div>
    <div class="setting-row">
      <div class="setting-info">
        <div class="setting-name">Dark Mode ${infoBtn('Toggle between light and dark color scheme')}</div>
        <div class="setting-desc">Switch between light and dark theme</div>
      </div>
      <label class="toggle">
        <input type="checkbox" ${s.theme==='dark'?'checked':''} onchange="toggleTheme()">
        <span class="toggle-slider"></span>
      </label>
    </div>
  </div>

  <div class="settings-section">
    <div class="settings-section-title">Country & Currency ${infoBtn('Set your home country to get relevant investment options and set the currency symbol used throughout the app.')}</div>
    <div class="setting-row">
      <div class="setting-info">
        <div class="setting-name">Home Country</div>
        <div class="setting-desc">Determines available investment types</div>
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        <span>${COUNTRIES[s.country]?.flag} ${COUNTRIES[s.country]?.name||'Other'}</span>
        <button class="btn btn-outline btn-sm" onclick="openCountrySelector()">Change</button>
      </div>
    </div>
    <div class="setting-row">
      <div class="setting-info">
        <div class="setting-name">Currency</div>
        <div class="setting-desc">Currency symbol used throughout the app</div>
      </div>
      <select class="form-control" style="width:200px" onchange="updateSetting('currency',this.value);updateSetting('symbol',CURRENCIES.find(c=>c.code===this.value)?.symbol||this.value)">
        ${CURRENCIES.map(c=>`<option value="${c.code}" ${s.currency===c.code?'selected':''}>${c.symbol} ${c.name} (${c.code})</option>`).join('')}
      </select>
    </div>
  </div>

  <div class="settings-section">
    <div class="settings-section-title">Data Management</div>
    <div class="setting-row">
      <div class="setting-info">
        <div class="setting-name">Load Demo Data</div>
        <div class="setting-desc">Populate with sample data to explore the app</div>
      </div>
      <button class="btn btn-primary btn-sm" onclick="loadDemo()"><i class="fas fa-magic"></i> Load Demo</button>
    </div>
    <div class="setting-row">
      <div class="setting-info">
        <div class="setting-name">Export Data</div>
        <div class="setting-desc">Download all your data as JSON</div>
      </div>
      <button class="btn btn-outline btn-sm" onclick="exportData()"><i class="fas fa-download"></i> Export JSON</button>
    </div>
    <div class="setting-row">
      <div class="setting-info">
        <div class="setting-name" style="color:var(--danger)">Clear All Data</div>
        <div class="setting-desc">Permanently delete all budgets, expenses, income and investments</div>
      </div>
      <button class="btn btn-danger btn-sm" onclick="clearAll()"><i class="fas fa-trash"></i> Clear Data</button>
    </div>
  </div>

  <div class="settings-section">
    <div class="settings-section-title">About</div>
    <div class="card card-body" style="font-size:13.5px;color:var(--text-muted);line-height:2">
      <strong style="color:var(--text)">BudgetPro</strong> — Personal Finance Tracker<br>
      Track budgets, expenses, income and investments in one place.<br>
      All data is stored locally in your browser (localStorage) — nothing is sent to any server.<br><br>
      <span class="badge badge-primary">v1.0</span>
    </div>
  </div>`;
}

function updateSetting(key, value) {
  state.settings[key] = value;
  save();
  toast('Setting saved');
}

function toggleTheme() {
  state.settings.theme = state.settings.theme === 'dark' ? 'light' : 'dark';
  save();
  applyTheme();
}

function exportData() {
  const json = JSON.stringify(state, null, 2);
  const blob = new Blob([json], { type:'application/json' });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = `budgetpro-export-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  toast('Data exported!');
}

function clearAll() {
  if (!confirm('This will permanently delete ALL your data. Are you sure?')) return;
  if (!confirm('Last chance — delete all budgets, expenses, income and investments?')) return;
  state.budgets = [];
  state.expenses = [];
  state.incomes = [];
  state.investments = [];
  state.customCategories = [];
  state.customInvestments = [];
  save(); renderView(); toast('All data cleared', 'warning');
}

function hasData() {
  return state.budgets.length || state.expenses.length || state.incomes.length || state.investments.length;
}

// ── MODAL helpers ─────────────────────────────────────────────────────────────

function openModal(id, html) {
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = `overlay-${id}`;
  overlay.innerHTML = `<div class="modal" id="${id}">${html}</div>`;
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(id); });
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.querySelector('.form-control, input')?.focus?.());
}

function closeModal(id) {
  if (id) {
    const el = document.getElementById(`overlay-${id}`);
    if (el) el.remove();
  } else {
    document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
  }
}

function infoBtn(tip) {
  return `<button class="info-btn" data-tip="${tip.replace(/"/g,"'")}" type="button">i</button>`;
}

// ── Demo data ─────────────────────────────────────────────────────────────────

function loadDemo() {
  if (hasData() && !confirm('This will add demo data on top of your existing data. Continue?')) return;

  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth()+1).padStart(2,'0');
  const ym = `${y}-${m}`;

  // Settings
  state.settings.country  = 'india';
  state.settings.currency = 'INR';
  state.settings.symbol   = '₹';
  state.settings.name     = 'Anurag';
  state.month = ym;

  // Budgets
  const budgetItems = [
    { category:'Housing',        subcategory:'Rent / Mortgage',                    amount:25000 },
    { category:'Housing',        subcategory:'Electricity',                         amount:3000  },
    { category:'Housing',        subcategory:'Internet / Broadband',               amount:1200  },
    { category:'Food & Dining',  subcategory:'Groceries / Supermarket',            amount:8000  },
    { category:'Food & Dining',  subcategory:'Eating Out / Restaurant',            amount:4000  },
    { category:'Food & Dining',  subcategory:'Food Delivery (Swiggy/Zomato/UberEats)', amount:2000 },
    { category:'Transportation', subcategory:'Fuel / Petrol / Diesel',             amount:3500  },
    { category:'Transportation', subcategory:'Ride-Sharing (Ola/Uber/Lyft)',       amount:1500  },
    { category:'Health & Fitness',subcategory:'Gym / Fitness Membership',          amount:2000  },
    { category:'Health & Fitness',subcategory:'Medicines / Pharmacy',              amount:1000  },
    { category:'Entertainment',  subcategory:'Movies / OTT Subscriptions (Netflix/Prime)', amount:1500 },
    { category:'Shopping',       subcategory:'Clothing & Footwear',               amount:3000  },
    { category:'Personal Care',  subcategory:'Haircut / Salon / Barber',          amount:800   },
    { category:'Savings & Investments', subcategory:'Mutual Fund SIP',            amount:10000 },
    { category:'Miscellaneous',  subcategory:'Other / Unlisted',                  amount:2000  },
  ];
  budgetItems.forEach(b => state.budgets.push({ id:uid(), month:ym, ...b }));

  // Expenses
  const expItems = [
    { date:`${y}-${m}-01`, category:'Housing',        subcategory:'Rent / Mortgage',   amount:25000, payment:'Bank Transfer',  description:'Monthly rent' },
    { date:`${y}-${m}-02`, category:'Food & Dining',  subcategory:'Groceries / Supermarket', amount:3200, payment:'UPI / Mobile Payment', description:'BigBasket weekly order' },
    { date:`${y}-${m}-03`, category:'Transportation', subcategory:'Fuel / Petrol / Diesel',  amount:2200, payment:'Debit Card',  description:'Petrol refill' },
    { date:`${y}-${m}-05`, category:'Food & Dining',  subcategory:'Eating Out / Restaurant',  amount:1450, payment:'UPI / Mobile Payment', description:'Team lunch' },
    { date:`${y}-${m}-06`, category:'Entertainment',  subcategory:'Movies / OTT Subscriptions (Netflix/Prime)', amount:649, payment:'Credit Card', description:'Netflix subscription' },
    { date:`${y}-${m}-08`, category:'Health & Fitness',subcategory:'Gym / Fitness Membership', amount:2000, payment:'UPI / Mobile Payment', description:'Monthly gym fee' },
    { date:`${y}-${m}-09`, category:'Food & Dining',  subcategory:'Food Delivery (Swiggy/Zomato/UberEats)', amount:850, payment:'UPI / Mobile Payment', description:'Swiggy dinner' },
    { date:`${y}-${m}-10`, category:'Shopping',       subcategory:'Clothing & Footwear', amount:2800, payment:'Credit Card',   description:'Shirt & trousers' },
    { date:`${y}-${m}-11`, category:'Housing',        subcategory:'Electricity',         amount:2200, payment:'Net Banking',   description:'BESCOM bill' },
    { date:`${y}-${m}-12`, category:'Transportation', subcategory:'Ride-Sharing (Ola/Uber/Lyft)', amount:620, payment:'UPI / Mobile Payment', description:'Ola rides' },
    { date:`${y}-${m}-13`, category:'Food & Dining',  subcategory:'Groceries / Supermarket', amount:2800, payment:'Debit Card', description:'Supermarket run' },
    { date:`${y}-${m}-14`, category:'Personal Care',  subcategory:'Haircut / Salon / Barber', amount:400, payment:'Cash', description:'Haircut' },
    { date:`${y}-${m}-15`, category:'Savings & Investments', subcategory:'Mutual Fund SIP', amount:10000, payment:'Bank Transfer', description:'HDFC Balanced Advantage Fund SIP' },
    { date:`${y}-${m}-16`, category:'Housing',        subcategory:'Internet / Broadband', amount:1199, payment:'Credit Card',  description:'ACT Fibernet' },
    { date:`${y}-${m}-18`, category:'Food & Dining',  subcategory:'Coffee & Cafes',       amount:540, payment:'UPI / Mobile Payment', description:'Starbucks' },
    { date:`${y}-${m}-20`, category:'Health & Fitness',subcategory:'Medicines / Pharmacy', amount:680, payment:'Cash', description:'Prescription medicines' },
    { date:`${y}-${m}-21`, category:'Entertainment',  subcategory:'Movies / OTT Subscriptions (Netflix/Prime)', amount:350, payment:'UPI / Mobile Payment', description:'Movie tickets' },
    { date:`${y}-${m}-22`, category:'Food & Dining',  subcategory:'Food Delivery (Swiggy/Zomato/UberEats)', amount:720, payment:'UPI / Mobile Payment', description:'Zomato lunch' },
    { date:`${y}-${m}-25`, category:'Miscellaneous',  subcategory:'ATM / Bank Charges',   amount:250, payment:'Cash', description:'ATM fee' },
  ];
  expItems.forEach(e => state.expenses.push({ id:uid(), ...e }));

  // Income
  state.incomes.push({ id:uid(), date:`${y}-${m}-01`, category:'Employment Income', subcategory:'Monthly Salary', amount:95000, description:'April 2026 salary — TechCorp India Ltd' });
  state.incomes.push({ id:uid(), date:`${y}-${m}-10`, category:'Investment Returns', subcategory:'Interest Income (FD/RD/Savings)', amount:3800, description:'HDFC FD interest credit' });
  state.incomes.push({ id:uid(), date:`${y}-${m}-15`, category:'Investment Returns', subcategory:'Stock / MF Dividends', amount:1200, description:'HDFC Mid Cap Fund dividend' });

  // Investments
  state.investments = [
    { id:uid(), date:`${y}-01-01`, country:'india', assetType:'Provident Funds', name:'EPF (Employee Provident Fund)', amount:320000, expectedReturn:'8.15%', taxBenefit:'Section 80C', lockIn:'Till retirement', notes:'Auto-deducted from salary', isCustom:false },
    { id:uid(), date:`${y}-01-05`, country:'india', assetType:'Mutual Funds',    name:'HDFC Balanced Advantage Fund (SIP)', amount:120000, expectedReturn:'10–12% historical', taxBenefit:'None', lockIn:'None', notes:'₹10,000/month SIP since Jan 2023', isCustom:false },
    { id:uid(), date:`${y}-02-10`, country:'india', assetType:'Mutual Funds',    name:'ELSS (Equity Linked Savings Scheme)', amount:50000, expectedReturn:'12–15% historical', taxBenefit:'Section 80C', lockIn:'3 years', notes:'AXIS Long Term Equity Fund', isCustom:false },
    { id:uid(), date:`2024-04-01`, country:'india', assetType:'Government Schemes', name:'PPF (Public Provident Fund)', amount:150000, expectedReturn:'7.1% p.a.', taxBenefit:'Section 80C', lockIn:'15 years', notes:'State Bank of India PPF account', isCustom:false },
    { id:uid(), date:`2023-08-15`, country:'india', assetType:'Fixed Deposits & Recurring', name:'Bank Fixed Deposit', amount:200000, expectedReturn:'7.25%', taxBenefit:'None', lockIn:'1 year', notes:'HDFC Bank FD — matures Aug 2025', isCustom:false },
    { id:uid(), date:`${y}-03-01`, country:'india', assetType:'Stocks & Securities', name:'BSE / NSE Listed Stocks', amount:85000, expectedReturn:'Varies', taxBenefit:'None', lockIn:'None', notes:'Portfolio: Infosys, TCS, Reliance, HDFC Bank', isCustom:false },
    { id:uid(), date:`2024-11-01`, country:'india', assetType:'Physical & Alternate Assets', name:'Digital Gold', amount:30000, expectedReturn:'Varies', taxBenefit:'None', lockIn:'None', notes:'Zerodha Gold ETF', isCustom:false },
  ];

  // Historical months income/expenses
  for (let i = 1; i <= 3; i++) {
    const d = new Date(today.getFullYear(), today.getMonth()-i, 1);
    const ym2 = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    state.incomes.push({ id:uid(), date:`${ym2}-01`, category:'Employment Income', subcategory:'Monthly Salary', amount:95000, description:`Salary — ${formatMonth(ym2)}` });
    const expAmt = 48000 + Math.round(Math.random()*8000);
    state.expenses.push({ id:uid(), date:`${ym2}-15`, category:'Housing', subcategory:'Rent / Mortgage', amount:25000, payment:'Bank Transfer', description:'Monthly rent' });
    state.expenses.push({ id:uid(), date:`${ym2}-10`, category:'Food & Dining', subcategory:'Groceries / Supermarket', amount:expAmt-25000, payment:'Debit Card', description:'Mixed expenses' });
  }

  save();
  navigate('dashboard');
  toast('Demo data loaded! Explore your dashboard 🎉');
}

// ── Month picker ──────────────────────────────────────────────────────────────

function initMonthPicker() {
  const input = document.getElementById('month-input');
  input.value = state.month;
  input.addEventListener('change', () => {
    state.month = input.value;
    save();
    renderView();
    updateTopbar();
  });
}

// ── Init ──────────────────────────────────────────────────────────────────────

function init() {
  load();
  initMonthPicker();

  // Sync sidebar with session user
  const session = getSession();
  if (session) {
    const nameEl   = document.getElementById('user-name-display');
    const emailEl  = document.getElementById('user-email-display');
    const avatarEl = document.getElementById('user-avatar');
    if (nameEl)   nameEl.textContent   = session.name;
    if (emailEl)  emailEl.textContent  = session.email;
    if (avatarEl) avatarEl.textContent = session.name.charAt(0).toUpperCase();
  }

  // Hamburger for mobile
  document.getElementById('hamburger')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });

  // Theme toggle in topbar
  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);

  navigate(state.view || 'dashboard');
}

document.addEventListener('DOMContentLoaded', init);
