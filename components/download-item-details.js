function DownloadItemDetails(item) {
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
    exists,
    speed
  } = item;
  let items = [];
  if (paused && canResume) {
    items.push("Paused");
  }

  if (state === "in_progress" && !error) {
    if (estimatedEndTime) {
      items.push(formatDuration(new Date(estimatedEndTime) - (new Date(Date.now()).getTime())) + ' left');
    }
  }
  if ((state === "in_progress" && !error) || canResume) {
    if (totalBytes !== -1) {
      items.push(formatBytes(bytesReceived) + " of " + formatBytes(totalBytes));
    } else {
      items.push(formatBytes(bytesReceived) + " downloaded");
    }
  }

  if (state === "in_progress" && speed && !error) {
    items.push("(" + formatSpeed(speed) + ")");
  }

  if (error && !canResume) {
    if (error.startsWith("FILE")) {
      switch (error) {
        case "FILE_ACCESS_DENIED":
          items.push("File permission error");
          break;
        case "FILE_NO_SPACE":
          items.push("No more space on hard drive");
          break;
        case "FILE_NAME_TOO_LONG":
          items.push("File name is too long");
          break;
        case "FILE_TOO_LARGE":
          items.push("File is too large");
          break;
        case "FILE_BLOCKED":
        case "FILE_VIRUS_INFECTED":
          items.push("File potentially unsafe");
          break;
        case "FILE_SECURITY_CHECK_FAILED":
          items.push("Could not check file safety");
          break;
        default:
          items.push("Failed to download file");
          break;
      }
    } else if (error.startsWith("NETWORK") || error.startsWith("SERVER")) {
      items.push("Network error");
    } else if (error.startsWith("USER")) {
      items.push("Canceled");
    } else {
      items.push("Failed to download file");
    }
  }

  if (state === "complete" && !exists) {
    items.push("File moved or missing")
  }

  if (state === "complete") {
    if (exists) {
      items.push(formatBytes(fileSize));
    }
    items.push(new URL(url).hostname);
  }
  return React.createElement("span", { className: "download-item-details", title: items.join(" - ") }, items.join(" - "));
}