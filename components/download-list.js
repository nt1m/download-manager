function DownloadList({ downloads }) {
  if (downloads.length === 0) {
    return React.createElement("div", { className: "empty-notice" },
    "No downloads found.");
  }
  return React.createElement("div", { className: "downloads" },
    DownloadToolbar(),
    React.createElement("div", { className: "downloads-list" },
      ...downloads.filter(d => {
        return d.filename.replace(/.+\//g, "").toLowerCase().includes(app.state.filter.toLowerCase());
      }).map(d => DownloadItem(d))
    ),
    React.createElement("button", {
      className: "downloads-footer",
      onClick: () => browser.downloads.showDefaultFolder()
    },
      "Show downloads folder"
    )
  );
}