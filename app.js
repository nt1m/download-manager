class App {
  constructor({ renderer, initialState }) {
    this.renderer = renderer;
    this.state = initialState;
  }

  getState() {
    return this.state;
  }

  setState(state) {
    this.state = Object.assign(this.state, state);
    this.render();
    return this;
  }

  render() {
    this.renderer(this.state);
    return this;
  }
}

let app;
const iconMap = new Map();
const timeoutMap = new Map();

async function init() {
  app = new App({
    renderer({ downloads }) {
      let root = document.getElementById("app");
      ReactDOM.render(DownloadList({ downloads }), root)
    },
    initialState: {
      downloads: await getDownloadsList(),
      filter: "",
    }
  });

  app.render();

  async function getDownloadsList() {
    let downloads = await browser.downloads.search({});
    for (let download of downloads) {
      if (timeoutMap.has(download.id)) {
        let timeout = timeoutMap.get(download.id);
        clearTimeout(timeout);
        timeoutMap.delete(download.id);
      }
      if (!iconMap.has(download.id)) {
        let icon = await browser.downloads.getFileIcon(download.id, { size: 32  });
        iconMap.set(download.id, icon);
      }
      download.iconUrl = iconMap.get(download.id);

      // Estimated end time and speed polyfill
      if (download.state === "in_progress" &&
          download.bytesReceived > -1 &&
          download.totalBytes > -1 &&
          download.estimatedEndTime) {
        let now = new Date(Date.now()).getTime();
        let speed = (download.totalBytes - download.bytesReceived) / (new Date(download.estimatedEndTime).getTime() - now);
        download.speed = speed;
        timeoutMap.set(download.id, setTimeout(updateApp, 1000));
      }
    }
    return downloads.reverse();
  }
  async function updateApp() {

    app.setState({ downloads: await getDownloadsList() });
  }

  browser.downloads.onChanged.addListener(updateApp);
  browser.downloads.onCreated.addListener(updateApp);
  browser.downloads.onErased.addListener(() => {
    iconMap = new Map();
    updateApp();
  });

}

init();

chrome.runtime.getBackgroundPage(function(bgWindow) {
  bgWindow.shouldNotify = false;
  bgWindow.findActionIcon();
});
