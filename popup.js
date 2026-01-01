document.addEventListener("DOMContentLoaded", () => {

  const cookiesInput = document.getElementById("cookies");
  const levelSelect = document.getElementById("level");
  const setPlanBtn = document.getElementById("setPlan");

  const todayTimeEl = document.getElementById("todayTime");
  const statsEl = document.getElementById("stats");

  const addHourBtn = document.getElementById("addHour");
  const addMinuteBtn = document.getElementById("addMinute");
  const confirmBtn = document.getElementById("confirm");
  const undoBtn = document.getElementById("undo");
  const resetBtn = document.getElementById("reset");

  const todayKey = new Date().toISOString().slice(0, 10);
  const deadline = new Date("2026-03-29");

  let tempSeconds = 0;
  let lastAdded = 0;

  function format(sec) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${h} hr ${m} min`;
  }

  function formatHours(hours) {
    const totalMinutes = Math.ceil(hours * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h} hr ${m} min`;
  }

  function daysLeft() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.max(1, Math.ceil((deadline - today) / 86400000));
  }

  function loadToday(cb) {
    chrome.storage.local.get(todayKey, d => cb(d[todayKey] || 0));
  }

  function renderTemp(base) {
    todayTimeEl.textContent = format(base + tempSeconds);
  }

  function saveToday(sec) {
    chrome.storage.local.set({ [todayKey]: sec });
    updateStats();
  }

  function updateStats() {
    chrome.storage.local.get(["cookies", "divider"], data => {
      if (!data.cookies || !data.divider) {
        statsEl.innerHTML = "";
        return;
      }

      const totalHours = data.cookies / data.divider;
      const dailyTarget = totalHours / daysLeft();

      loadToday(sec => {
        const todayHours = sec / 3600;
        let status = "➖ On Track";

        if (todayHours > dailyTarget) status = "✅ Ahead";
        else if (todayHours < dailyTarget) status = "⚠️ Behind";

        statsEl.innerHTML = `
          <p>Total Target: ${Math.floor(totalHours)} hrs</p>
          <p>Days Left: ${daysLeft()}</p>
          <p>Daily Target: ${formatHours(dailyTarget)}</p>
          <p>Status: ${status}</p>
        `;
      });
    });
  }

  loadToday(sec => {
    tempSeconds = 0;
    renderTemp(sec);
  });

  addHourBtn.onclick = () => {
    tempSeconds += 3600;
    lastAdded = 3600;
    loadToday(renderTemp);
  };

  addMinuteBtn.onclick = () => {
    tempSeconds += 600;
    lastAdded = 600;
    loadToday(renderTemp);
  };

  undoBtn.onclick = () => {
    tempSeconds = Math.max(0, tempSeconds - lastAdded);
    lastAdded = 0;
    loadToday(renderTemp);
  };

  confirmBtn.onclick = () => {
    loadToday(sec => {
      const newTotal = sec + tempSeconds;
      saveToday(newTotal);
      tempSeconds = 0;
      lastAdded = 0;
      todayTimeEl.textContent = format(newTotal);
    });
  };

  resetBtn.onclick = () => {
    chrome.storage.local.set({ [todayKey]: 0 }, () => {
      tempSeconds = 0;
      lastAdded = 0;
      todayTimeEl.textContent = "0 hr 0 min";
      updateStats();
    });
  };

  setPlanBtn.onclick = () => {
    const cookies = Number(cookiesInput.value);
    const divider = Number(levelSelect.value);
    if (!cookies) return;

    chrome.storage.local.set({ cookies, divider }, updateStats);
  };

  updateStats();

});
