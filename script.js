(() => {
  const root = document.documentElement;
  const toggle = document.querySelector('.theme-toggle');
  const updateLabel = () => {
    const label = `Switch to ${root.dataset.theme === 'dark' ? 'light' : 'dark'} theme`;
    toggle.setAttribute('aria-label', label);
    toggle.title = label;
  };
  toggle.hidden = false;
  updateLabel();
  toggle.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('harsh-theme', root.dataset.theme); } catch {}
    updateLabel();
  });
})();

// Keep the small preview controls clear of the demonstrations.
(() => {
  const clips = [...document.querySelectorAll('.reel-media video')];
  if (!clips.length) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const paused = new Set(motion.matches ? clips : []);
  const visible = new Set();
  const updateClip = clip => {
    if (!paused.has(clip) && visible.has(clip) && !document.hidden) clip.play().catch(() => {});
    else clip.pause();
  };
  const update = () => clips.forEach(updateClip);
  clips.forEach(clip => {
    const button = clip.closest('.reel-media').querySelector('.reel-playback');
    const title = document.getElementById(clip.getAttribute('aria-labelledby')).textContent;
    const updateButton = () => {
      button.dataset.paused = String(clip.paused);
      button.setAttribute('aria-label', `${clip.paused ? 'Play' : 'Pause'} ${title}`);
    };
    clip.controls = false;
    button.hidden = false;
    button.addEventListener('click', () => {
      if (clip.paused) paused.delete(clip);
      else paused.add(clip);
      updateClip(clip);
    });
    clip.addEventListener('play', updateButton);
    clip.addEventListener('pause', updateButton);
    updateButton();
  });
  motion.addEventListener('change', () => {
    paused.clear();
    if (motion.matches) clips.forEach(clip => paused.add(clip));
    update();
  });
  document.addEventListener('visibilitychange', update);
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.15) visible.add(entry.target);
      else visible.delete(entry.target);
      updateClip(entry.target);
    });
  }, { threshold: 0.15 });
  clips.forEach(clip => observer.observe(clip));
  update();
})();
