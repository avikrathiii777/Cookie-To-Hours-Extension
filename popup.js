document.addEventListener("DOMContentLoaded", () => {

  // -------- SAFE ELEMENT GETTER --------
  function el(id) {
    return document.getElementById(id);
  }

  const cookiesInput   = el("cookies");
  const levelSelect    = el("quality");
  const todayHoursIn   = el("todayHours");

  const setPlanBtn     = el("setPlan");
  const updateBtn      = el("updateProgress");

  const totalHoursEl   = el("totalHours");
  const daysLeftEl     = el("daysLeft");
  const dailyTargetEl = el("dailyTarget");
  const resultDiv      = el("result");
  const statusIcon     = el("statusIcon");

  // -------- FALLBACK IF assets.js FAILS --------
  const SAFE_ICONS = (typeof ICONS !== "undefined") ? ICONS : {
    warning: "",
    success: "",
    perfect: ""
  };

  let remainingHours = 0;

  // -------- DATE LOGIC (NEXT 29 MARCH) --------
  function daysLeftTillMarch29() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let year = today.getFullYear();
    let end = new Date(year, 2, 29);
    end.setHours(0, 0, 0, 0);

    if (today > end) {
      end = new Date(year + 1, 2, 29);
      end.setHours(0, 0, 0, 0);
    }

    const diff = end - today;
    const oneDay = 1000 * 60 * 60 * 24;

    return diff <= 0 ? 0 : Math.ceil(diff / oneDay);
  }

  // -------- COOKIE → HOURS --------
  function calculateTotalHours(cookies, level) {
    if (level === "functional") return cookies / 10;
    if (level === "intermediate") return cookies / 20;
    if (level === "verygood") return cookies / 30;
    return 0;
  }

  // -------- SET PLAN --------
  setPlanBtn.addEventListener("click", () => {
    const cookies = Number(cookiesInput.value);

    if (!cookies || cookies <= 0) {
      resultDiv.textContent = "Enter a valid cookie number.";
      return;
    }

    remainingHours = calculateTotalHours(cookies, levelSelect.value);

    const days = daysLeftTillMarch29();
    const dailyTarget = days > 0 ? (remainingHours / days) : remainingHours;

    totalHoursEl.textContent   = remainingHours.toFixed(2);
    daysLeftEl.textContent     = days;
    dailyTargetEl.textContent  = dailyTarget.toFixed(2);

    resultDiv.textContent = "Plan set successfully.";
    statusIcon.src = SAFE_ICONS.perfect;
  });

  // -------- UPDATE PROGRESS --------
  updateBtn.addEventListener("click", () => {
    const todayHours = Number(todayHoursIn.value);
    if (isNaN(todayHours) || todayHours < 0) return;

    const days = daysLeftTillMarch29();
    const todayTarget = days > 0 ? remainingHours / days : remainingHours;

    remainingHours -= todayHours;
    if (remainingHours < 0) remainingHours = 0;

    const nextTarget =
      days > 1 ? remainingHours / (days - 1) : remainingHours;

    if (todayHours < todayTarget) {
      statusIcon.src = SAFE_ICONS.warning;
      resultDiv.textContent = "Missed target. Tomorrow increases.";
    } 
    else if (todayHours > todayTarget) {
      statusIcon.src = SAFE_ICONS.success;
      resultDiv.textContent = "Extra work done! Tomorrow decreases.";
    } 
    else {
      statusIcon.src = SAFE_ICONS.perfect;
      resultDiv.textContent = "Perfectly on track.";
    }

    totalHoursEl.textContent  = remainingHours.toFixed(2);
    daysLeftEl.textContent    = Math.max(days - 1, 0);
    dailyTargetEl.textContent = nextTarget.toFixed(2);
  });

});
