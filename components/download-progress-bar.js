function DownloadProgressBar({ bytesReceived, totalBytes }) {
  if (totalBytes === -1) {
    return React.createElement("progress", {
      indeterminate: true,
    });
  }
  const progress = (bytesReceived / totalBytes) * 100;
  return React.createElement("progress", {
    min: 0,
    max: 100,
    value: progress,
  });
}