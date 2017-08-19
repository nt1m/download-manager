function DownloadItem(item) {
  let {
    id,
    url,
    iconUrl,
    referrer,
    filename,
    incognito,
    danger,
    mime,
    startTime,
    endTime,
    estimatedEndTime,
    state,
    paused,
    canResume,
    error,
    bytesReceived,
    totalBytes,
    fileSize,
    exists
  } = item;

  return React.createElement("div", {
    className: "download-item"
  },
    React.createElement("div", {
      className: "download-item-info-wrapper",
      onClick: async () => {
        if (state !== "complete" || !exists || error) {
          return;
        }
        await browser.downloads.open(id);
      }
    },
      React.createElement("img", { src: iconUrl, className: "download-item-icon" }),
      React.createElement("div", { className: "download-item-info" },
        React.createElement("span", { className: "download-item-name" }, filename.replace(/.+\//g, "")),
        ((state === "in_progress" && !error) || paused) && DownloadProgressBar({ bytesReceived, totalBytes }),
        DownloadItemDetails(item)
      ),
    ),
    DownloadItemActions(item),
  );
}