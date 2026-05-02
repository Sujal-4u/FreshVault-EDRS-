
/* -------------------------------------------------------
   HELPERS
------------------------------------------------------- */
const $ = id => document.getElementById(id);

/** Show/hide a field error message */
function fieldMsg(id, text, type = 'err') {
  const el = $(id);
  if (!el) return;
  el.textContent = (type === 'err' ? '⚠ ' : type === 'ok' ? '✓ ' : 'ℹ ') + text;
  el.className = `field-msg ${type} show`;
}
function clearMsg(id) {
  const el = $(id);
  if (el) { el.className = 'field-msg'; el.textContent = ''; }
}

/** Show alert banner */
function showAlert(alertId, msgId, text, type = 'error') {
  const a = $(alertId), m = $(msgId);
  if (!a || !m) return;
  m.textContent = text;
  a.className = `alert ${type} show`;
  a.querySelector('.alert-icon').textContent =
    type === 'error' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️';
}
function hideAlert(id) {
  const el = $(id);
  if (el) el.className = 'alert';
}

/** Input error state */
function setError(inputId) {
  const el = $(inputId);
  if (el) el.classList.add('error');
}
function setOk(inputId) {
  const el = $(inputId);
  if (el) { el.classList.remove('error'); el.classList.add('success'); }
}
function clearState(inputId) {
  const el = $(inputId);
  if (el) el.classList.remove('error', 'success');
}

/* -------------------------------------------------------
   TAB SWITCHING
------------------------------------------------------- */
function switchTab(tab) {
  const isLogin = tab === 'login';
  $('tab-login').classList.toggle('active', isLogin);
  $('tab-register').classList.toggle('active', !isLogin);
  $('panel-login').classList.toggle('active', isLogin);
  $('panel-register').classList.toggle('active', !isLogin);

  // Clear all messages on switch
  hideAlert('login-alert');
  hideAlert('register-alert');
  ['login-email','login-password','reg-fname','reg-lname',
   'reg-email','reg-phone','reg-password','reg-confirm'].forEach(clearState);
  ['login-email-err','login-pass-err','reg-fname-err','reg-lname-err',
   'reg-email-err','reg-phone-err','reg-pass-err','reg-confirm-msg'].forEach(clearMsg);
}

/* -------------------------------------------------------
   PASSWORD VISIBILITY TOGGLE
------------------------------------------------------- */
function togglePass(inputId, btn) {
  const inp = $(inputId);
  const isText = inp.type === 'text';
  inp.type = isText ? 'password' : 'text';
  btn.innerHTML = isText
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
}

/* -------------------------------------------------------
   PASSWORD STRENGTH CHECKER
------------------------------------------------------- */
function checkStrength() {
  const val = $('reg-password').value;
  const wrap = $('strength-wrap');
  const fill = $('strength-fill');
  const lbl  = $('strength-label');

  if (!val) { wrap.className = 'strength-wrap'; return; }
  wrap.className = 'strength-wrap show';

  let score = 0;
  if (val.length >= 8)  score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;

  const levels = [
    { w:'20%', bg:'#ef4444', t:'Weak' },
    { w:'45%', bg:'#f59e0b', t:'Fair' },
    { w:'70%', bg:'#3b82f6', t:'Good' },
    { w:'100%',bg:'#10b981', t:'Strong ✓' },
  ];
  const lvl = levels[score - 1] || levels[0];
  fill.style.width = lvl.w;
  fill.style.background = lvl.bg;
  lbl.textContent = `Strength: ${lvl.t}`;
  lbl.style.color = lvl.bg;

  // Clear pass error if user is typing
  clearMsg('reg-pass-err');
  clearState('reg-password');
}

/* -------------------------------------------------------
   LIVE CONFIRM PASSWORD CHECK
------------------------------------------------------- */
function checkConfirm() {
  const p = $('reg-password').value;
  const c = $('reg-confirm').value;
  if (!c) { clearMsg('reg-confirm-msg'); clearState('reg-confirm'); return; }
  if (p === c) {
    fieldMsg('reg-confirm-msg', 'Passwords match', 'ok');
    setOk('reg-confirm');
  } else {
    fieldMsg('reg-confirm-msg', 'Passwords do not match', 'err');
    setError('reg-confirm');
  }
}

/* -------------------------------------------------------
   LIVE EMAIL DUPLICATE CHECK (on register)
------------------------------------------------------- */
function checkEmailLive() {
  const email = $('reg-email').value.trim().toLowerCase();
  if (!email) { clearMsg('reg-email-err'); clearState('reg-email'); return; }
  const users = getUsers();
  if (users[email]) {
    fieldMsg('reg-email-err', 'This email is already registered', 'err');
    setError('reg-email');
  } else {
    clearMsg('reg-email-err');
    clearState('reg-email');
  }
}

/* -------------------------------------------------------
   localStorage HELPERS  (simulated database)
------------------------------------------------------- */
function getUsers() {
  try { return JSON.parse(localStorage.getItem('fv_users') || '{}'); }
  catch { return {}; }
}
function saveUser(email, data) {
  const users = getUsers();
  users[email.toLowerCase()] = data;
  localStorage.setItem('fv_users', JSON.stringify(users));
}
function findUser(email) {
  return getUsers()[email.toLowerCase()] || null;
}

/* -------------------------------------------------------
   LOGIN HANDLER
------------------------------------------------------- */
function handleLogin() {
  const email = $('login-email').value.trim();
  const pass  = $('login-password').value;
  let valid = true;

  hideAlert('login-alert');
  clearMsg('login-email-err');
  clearMsg('login-pass-err');
  clearState('login-email');
  clearState('login-password');

  // Email validation
  if (!email) {
    fieldMsg('login-email-err', 'Email address is required', 'err');
    setError('login-email');
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldMsg('login-email-err', 'Please enter a valid email address', 'err');
    setError('login-email');
    valid = false;
  }

  // Password validation
  if (!pass) {
    fieldMsg('login-pass-err', 'Password is required', 'err');
    setError('login-password');
    valid = false;
  }

  if (!valid) return;

  // Simulate loading
  const btn = $('login-btn');
  btn.classList.add('loading');
  btn.disabled = true;

  setTimeout(() => {
    btn.classList.remove('loading');
    btn.disabled = false;

    const user = findUser(email);

    // ── CASE 1: User not registered ──
    if (!user) {
      showAlert('login-alert', 'login-alert-msg',
        `No account found for "${email}". Please register first.`, 'error');
      setError('login-email');
      return;
    }

    // ── CASE 2: Wrong password ──
    if (user.password !== pass) {
      showAlert('login-alert', 'login-alert-msg',
        'Incorrect password. Please try again.', 'error');
      setError('login-password');
      return;
    }

    // ── CASE 3: Success ──
    

    // TODO: replace this with a real redirect once the dashboard is ready
   setTimeout(() => { window.location.href = '../Dashboard/dash.html'; }, 1500);
  }, 900);
}

/* -------------------------------------------------------
   REGISTER HANDLER
------------------------------------------------------- */
function handleRegister() {
  const fname   = $('reg-fname').value.trim();
  const lname   = $('reg-lname').value.trim();
  const email   = $('reg-email').value.trim();
  const phone   = $('reg-phone').value.trim();
  const pass    = $('reg-password').value;
  const confirm = $('reg-confirm').value;
  const terms   = $('reg-terms').checked;
  let valid = true;

  // Clear previous
  hideAlert('register-alert');
  ['reg-fname','reg-lname','reg-email','reg-phone','reg-password','reg-confirm'].forEach(clearState);
  ['reg-fname-err','reg-lname-err','reg-email-err','reg-phone-err','reg-pass-err'].forEach(clearMsg);

  // First name
  if (!fname) {
    fieldMsg('reg-fname-err', 'First name is required', 'err');
    setError('reg-fname'); valid = false;
  }

  // Last name
  if (!lname) {
    fieldMsg('reg-lname-err', 'Last name is required', 'err');
    setError('reg-lname'); valid = false;
  }

  // Email
  if (!email) {
    fieldMsg('reg-email-err', 'Email address is required', 'err');
    setError('reg-email'); valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldMsg('reg-email-err', 'Please enter a valid email address', 'err');
    setError('reg-email'); valid = false;
  } else if (findUser(email)) {
    fieldMsg('reg-email-err', 'This email is already registered. Please sign in.', 'err');
    setError('reg-email'); valid = false;
  }

  // Phone (optional but validate if filled)
  if (phone && !/^[+\d\s\-()]{7,15}$/.test(phone)) {
    fieldMsg('reg-phone-err', 'Enter a valid phone number', 'err');
    setError('reg-phone'); valid = false;
  }

  // Password
  if (!pass) {
    fieldMsg('reg-pass-err', 'Password is required', 'err');
    setError('reg-password'); valid = false;
  } else if (pass.length < 8) {
    fieldMsg('reg-pass-err', 'Password must be at least 8 characters', 'err');
    setError('reg-password'); valid = false;
  }

  // Confirm
  if (pass && confirm !== pass) {
    fieldMsg('reg-confirm-msg', 'Passwords do not match', 'err');
    setError('reg-confirm'); valid = false;
  }

  // Terms
  if (!terms) {
    showAlert('register-alert', 'register-alert-msg',
      'Please accept the Terms of Service to continue.', 'warn');
    valid = false;
  }

  if (!valid) return;

  // Simulate loading
  const btn = $('register-btn');
  btn.classList.add('loading');
  btn.disabled = true;

  setTimeout(() => {
    btn.classList.remove('loading');
    btn.disabled = false;

    // Save to localStorage (simulated DB)
    saveUser(email, {
      firstName: fname,
      lastName:  lname,
      email:     email.toLowerCase(),
      phone:     phone,
      password:  pass,          // NOTE: In production, NEVER store plain passwords — use hashing
      createdAt: new Date().toISOString()
    });

    // Show success state
    $('reg-fname').value = $('reg-lname').value = $('reg-email').value =
    $('reg-phone').value = $('reg-password').value = $('reg-confirm').value = '';
    $('reg-terms').checked = false;
    $('strength-wrap').className = 'strength-wrap';

    $('success-email').textContent = email;
    $('register-form-body').style.display = 'none';
    $('register-success').className = 'success-state show';

  }, 1000);
}

/* -------------------------------------------------------
   URL param to auto-open a tab: auth.html?tab=register
------------------------------------------------------- */
(function() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('tab') === 'register') switchTab('register');
})();

function registerUser(e){
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;

  // Save user
  localStorage.setItem("user", JSON.stringify({ name, email }));

  // 🔥 Redirect to dashboard (IMPORTANT PATH)
  window.location.href = "./Dashboard/dash.html";
}
