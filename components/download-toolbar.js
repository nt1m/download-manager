function DownloadToolbar() {
  return React.createElement("div", { className: "toolbar" },
    React.createElement("input", {
      className: "search-input",
      placeholder: "Search Downloads",
      onChange: (e) => {
        app.setState({ filter: e.target.value });
      }
    }),
    React.createElement("button", {
      className: "button clear-button",
      onClick: async () => {
        await browser.downloads.erase({ paused: false, state: "complete" });
        await browser.downloads.erase({ paused: false, state: "interrupted" });
      }
    })
  );
}