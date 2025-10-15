window.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('loader');
  const main = document.getElementById('mainContainer');

  // Wait for welcome to finish, then show main screen
  setTimeout(() => {
    loader.style.display = 'none';
    main.classList.remove('hidden');
  }, 2500); // 2.5s welcome duration

  // Button click redirect with small transition
  document.querySelectorAll('.btn[data-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');
      main.style.opacity = '0';
      setTimeout(() => {
        window.location.href = target;
      }, 600);
    });
  });
});
