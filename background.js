async function getTodaySeconds(apiKey) {
  const res = await fetch(
    "https://hackatime.hackclub.com/api/v1/users/me/stats/today",
    {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "X-Flavortown-Ext-3219": "true"
      }
    }
  );

  const json = await res.json();
  return json?.data?.total_seconds || 0;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg === "GET_TIME") {
    chrome.storage.local.get("hackatimeKey", async (data) => {
      if (!data.hackatimeKey) {
        sendResponse(0);
        return;
      }

      try {
        const sec = await getTodaySeconds(data.hackatimeKey);
        sendResponse(sec);
      } catch {
        sendResponse(0);
      }
    });
    return true;
  }
});
