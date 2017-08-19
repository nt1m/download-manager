function DownloadItemActions(item) {
  let {
    id,
    url,
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

  if (state === "complete" && exists) {
    return React.createElement("button", {
      className: "download-item-action open-folder",
      onClick: () => {
        browser.downloads.show(id);
      }
    });
  }
  
  if ((state === "interrupted" || error) && !canResume) {
    return React.createElement("button", {
      className: "download-item-action retry",
      onClick: async () => {
        try {
          await browser.downloads.removeFile(id);
        } catch (e) {}
        await browser.downloads.erase({ id });
        await browser.downloads.download({ url, filename: filename.replace(/.+\//g, "") });
      }
    });
  }
  if (state === "in_progress" || canResume) {
    return React.createElement("div", { className: "download-item-actions" },
      !paused && React.createElement("button", {
        className: "download-item-action pause",
        onClick: async () => {
          await browser.downloads.pause(id);
        }
      }),
      paused && React.createElement("button", {
        className: "download-item-action resume",
        onClick: async () => {
          await browser.downloads.resume(id);
        }
      }),
      React.createElement("button", {
        className: "download-item-action cancel",
        onClick: () => browser.downloads.cancel(id)
      })
    );
  }
  return null;
}