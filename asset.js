const ICONS = {
  warning: "assets/warning.svg",
  success: "assets/success.svg",
  perfect: "assets/perfect.svg"
};

function feedbackHTML(type, message) {
  return `
    <div class="feedback-box">
      <img src="${ICONS[type]}" class="icon">
      <span>${message}</span>
    </div>
  `;
}