chrome.commands.onCommand.addListener(async (command) => {
  const [currentTab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });

  if (command === "openUI") {
    toggleJumpy(currentTab.id);
  }
});

function toggleJumpy(tabId) {
  chrome.scripting
    .executeScript({
      target: { tabId },
      func: () => {
        const headerExtensionExists = document.querySelector(".jumpyExt");
        // toggle on and off with same hotkey
        if (headerExtensionExists) {
          headerExtensionExists.remove();
          return;
        }

        const allHeaders = [];
        const headerList = document.querySelectorAll("h1,h2,h3,h4,h5,h6");
        const sideNavbar = document.querySelector("aside");

        headerList.forEach((hTag) => {
          if (sideNavbar?.contains(hTag)) {
            // for sidebar scrolling
          } else {
            allHeaders.push({
              type: hTag.nodeName,
              text: hTag.textContent.trim(),
              element: hTag,
            });
          }
        });

        const headerListContainer = document.createElement("div");
        headerListContainer.classList.add("jumpyExt");
        const styles = {
          position: "fixed",
          bottom: "0",
          width: "100%",
          padding: "10px",
          maxHeight: "350px",
          overflowY: "scroll",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#1e293b",
          color: "white",
          zIndex: "10000",
        };
        Object.assign(headerListContainer.style, styles);

        allHeaders.forEach((h) => {
          const button = document.createElement("button");
          button.innerText = h.text;
          const buttonStyles = {
            display: "block",
            paddingTop: "10px",
            paddingBottom: "10p",
            background: "transparent",
            border: "none",
            color: "white",
          };
          Object.assign(button.style, buttonStyles)

          button.addEventListener("keydown", function (event) {
            const scrollOffset = -150;
            const positionToScrollTo =
              h.element.getBoundingClientRect().top +
              window.scrollY +
              scrollOffset;

            if (event.key === "Enter") {
              window.scrollTo({ top: positionToScrollTo, behavior: "smooth" });
            }
          });

          headerListContainer.appendChild(button);
        });

        document.body.appendChild(headerListContainer);
        headerListContainer.tabIndex = 1;
        headerListContainer.firstChild.focus();
        return allHeaders;
      },
    })
    .then((res) => {});
}
