document.addEventListener('DOMContentLoaded', function() {
  var typingText = document.getElementById('typing-text');
  if (!typingText) return;

  var text = 'Get in touch with me...';
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    typingText.textContent = text;
    return;
  }

  var idx = 0;
  function typeWriter() {
    if (idx < text.length) {
      typingText.textContent += text.charAt(idx);
      idx++;
      setTimeout(typeWriter, 50);
    }
  }
  typeWriter();
});
