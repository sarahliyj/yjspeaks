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
})();
