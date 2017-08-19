browser.downloads.onChanged.addListener(findActionIcon);
browser.downloads.onCreated.addListener(findActionIcon);
browser.downloads.onErased.addListener(findActionIcon);

let timeout;
var shouldNotify = false;
async function findActionIcon() {
  timeout && clearTimeout(timeout);

  let downloads = await browser.downloads.search({});
  downloads = downloads.filter(download => {
    return (download.state === "in_progress" || download.paused);
  });

  if (downloads.length === 0) {
    return updateActionIcon(shouldNotify ? "notify-done" : "");
  }
  
  downloads = downloads.filter(download => download.totalBytes > -1);
  shouldNotify = true;

  if (downloads.length === 0) {
    return updateActionIcon("");
  }

  let totalBytes = 0, bytesReceived = 0, remainingTime = -1;
  let now = new Date(Date.now()).getTime();
  for (let download of downloads) {
    totalBytes += download.totalBytes;
    bytesReceived += download.bytesReceived;

    if (!download.paused) {
      // Estimated end time and speed polyfill
      if (download.startTime) {
        let speed = download.bytesReceived / (now - new Date(download.startTime).getTime()); // Not accurate if the user has paused
        if (!download.estimatedEndTime) {
          let sizeLeft = download.totalBytes - download.bytesReceived;
          let rawTimeLeft = sizeLeft / speed;
          download.estimatedEndTime = now + rawTimeLeft;
        }
      }
      remainingTime = Math.max(download.estimatedEndTime - now, remainingTime);
    }
  }

  timeout = setTimeout(findActionIcon, 2000);

  return updateActionIcon("progress", { progress: bytesReceived / totalBytes, remainingTime })
}

function updateActionIcon(state, data) {
  switch (state) {
    case "progress":
      updateProgressBar({
        progress: Math.round(data.progress * 10) / 10,
        remainingTime: data.remainingTime > -1 ? formatDuration(data.remainingTime, 1) : -1,
      });
    break;
    case "notify-done":
      browser.browserAction.setIcon({ path: "img/downloads-notify.svg" });
    break;
    default:
      browser.browserAction.setIcon({ path: "img/downloads.svg" });
    break;
  }
}
function updateProgressBar({ progress, remainingTime }) {
  let size = 16;
  let canvas = document.createElement("canvas");
  canvas.width = canvas.height = size * devicePixelRatio;

  let ctx = canvas.getContext("2d");
  ctx.scale(devicePixelRatio, devicePixelRatio);

  let lineWidth = ctx.lineWidth = 2;
  if (remainingTime && remainingTime !== -1) {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = Math.min(10, 16 / (remainingTime.length * 0.6)) + "px sans-serif";
    ctx.fillText(remainingTime, size / 2, (size - lineWidth) / 2);
  } else if (remainingTime === -1) {
    let path = new Path2D("M7.293 12.707c.39.39 1.024.39 1.414 0l5-5c.38-.392.374-1.016-.012-1.402-.386-.386-1.01-.39-1.402-.012L9 9.586V1c0-.552-.448-1-1-1S7 .448 7 1v8.586L3.707 6.293c-.392-.38-1.016-.374-1.402.012-.386.386-.39 1.01-.012 1.402l5 5z");
    ctx.fillStyle = "#4d4d4d";
    ctx.fill(path);
  }

  ctx.strokeStyle = "#c3c3c3";
  let lineY = size - (lineWidth / 2);
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(lineWidth, lineY);
  ctx.lineTo(size - lineWidth, lineY);

  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  let lineLength = size - lineWidth;
  ctx.moveTo(lineWidth, lineY);
  ctx.lineTo(lineLength * progress, lineY);

  ctx.strokeStyle = "#0a84ff";
  ctx.stroke();
  ctx.closePath();

  browser.browserAction.setIcon({ imageData: ctx.getImageData(0, 0, canvas.width, canvas.height) });
}
browser.browserAction.onClicked.addListener(() => {
  shouldNotify = false;
  findActionIcon();
});
findActionIcon();