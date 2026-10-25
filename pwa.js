(() => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));
  }

  let installPrompt;
  const installButton = document.querySelector('[data-install-app]');
  const installHint = document.querySelector('[data-install-hint]');
  const isApple = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;

  const setHint = message => {
    if (installHint) installHint.textContent = message;
  };

  if (isStandalone) {
    if (installButton) installButton.hidden = true;
    setHint('YJ Speaks is installed · 已添加到你的主屏幕');
    return;
  }

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    installPrompt = event;
    if (installButton) installButton.hidden = false;
    setHint('Install for quick access and offline reading · 安装后可快速打开并离线阅读');
  });

  if (installButton) {
    installButton.addEventListener('click', async () => {
      if (installPrompt) {
        installPrompt.prompt();
        const choice = await installPrompt.userChoice;
        setHint(choice.outcome === 'accepted' ? 'Installing YJ Speaks… · 正在安装' : 'You can install whenever you are ready · 随时都可以安装');
        installPrompt = null;
      } else if (isApple) {
        setHint('On iPhone/iPad: tap Share, then “Add to Home Screen” · 点击分享，再选“添加到主屏幕”');
      } else {
        setHint('Use your browser menu and choose “Install app” or “Add to Home screen” · 在浏览器菜单中选择“安装应用”');
      }
    });
  }

  window.addEventListener('appinstalled', () => {
    if (installButton) installButton.hidden = true;
    setHint('YJ Speaks is installed · 已添加到你的主屏幕');
  });

  const newsletterForm = document.getElementById('email-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', async event => {
      event.preventDefault();
      event.stopImmediatePropagation();

      const emailField = document.getElementById('subscriber-email');
      const status = document.getElementById('status');
      const submitButton = newsletterForm.querySelector('button[type="submit"]');
      const email = emailField?.value.trim();

      if (!email) return;

      if (status) status.textContent = '正在保存你的订阅…';
      if (submitButton) submitButton.disabled = true;

      try {
        const response = await fetch('https://mojian-reading.eagerrice32.chatgpt.site/api/newsletter/subscribe', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ email, website: '' }),
        });
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) throw new Error(payload?.error?.message || '订阅暂时无法完成。');

        if (status) status.textContent = '邮箱已保存。请完成下方支付。'; const payment = document.getElementById('payment-step'); if (payment) { payment.hidden = false; payment.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
        newsletterForm.reset();
      } catch (error) {
        if (status) status.textContent = error instanceof Error ? error.message : '订阅暂时无法完成，请稍后再试。';
      } finally {
        if (submitButton) submitButton.disabled = false;
      }
    }, true);
  }
})();
