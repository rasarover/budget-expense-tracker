// ── Session helpers (shared between auth.html and app) ─────────────────────

function getSession() {
  try { return JSON.parse(sessionStorage.getItem('budgetApp_session')); } catch(e) { return null; }
}

function clearSession() {
  sessionStorage.removeItem('budgetApp_session');
}

function logout() {
  if (!confirm('Sign out of BudgetPro?')) return;
  clearSession();
  window.location.href = 'auth.html';
}

// ── Auth gate: redirect to auth.html if no active session ─────────────────

(function checkAuth() {
  const session = getSession();
  if (!session || !session.userId) {
    window.location.replace('auth.html');
    return;
  }

  // Populate sidebar user info immediately
  document.addEventListener('DOMContentLoaded', () => {
    const nameEl  = document.getElementById('user-name-display');
    const emailEl = document.getElementById('user-email-display');
    const avatarEl= document.getElementById('user-avatar');

    if (nameEl)   nameEl.textContent   = session.name;
    if (emailEl)  emailEl.textContent  = session.email;
    if (avatarEl) avatarEl.textContent = session.name.charAt(0).toUpperCase();

    // Reveal app, hide gate
    document.getElementById('auth-gate').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
  });
})();
