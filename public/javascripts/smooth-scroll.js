// 1. Initialize Lenis
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  wheelMultiplier: 1,
  smoothWheel: true,
  autoRaf: true, // Modern versions of Lenis can handle the loop automatically
});

// 2. The Animation Loop (Necessary if autoRaf is not supported in your version)
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

//stvara problem ne radi lenis update
window.addEventListener('resize', () => {
  lenis.update();
});