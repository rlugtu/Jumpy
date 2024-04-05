chrome.storage.session.setAccessLevel({
  accessLevel: "TRUSTED_AND_UNTRUSTED_CONTEXTS",
});

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
          // chrome.storage.session.remove("lastJumpedHeader");
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
          paddingBottom: "10px",
          maxHeight: "350px",
          width: "500px",
          overflowY: "scroll",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          color: "white",
          zIndex: "10000",
          borderTopRightRadius: "15px",
        };
        Object.assign(headerListContainer.style, styles);

        function getPaddingByHeader(type) {
          switch (type) {
            case 'H1':
              return '20px';
            case 'H2':
              return '40px';
            case 'H3':
              return '60px';
            case 'H4':
              return '80px';
            case 'H5':
              return '100px';
            case 'H6':
              return '120px';
          }
        }

        allHeaders.forEach((h) => {
          const button = document.createElement("button");
          button.innerText = h.text;
          button.style.fontSize = "1rem";
          const buttonStyles = {
            display: "block",
            padding: "14px",
            backgroundColor: "transparent",
            outline: "none",
            border: "none",
            color: "white",
            fontSize: "18px",
            textAlign: "start",
            paddingLeft: `
            ${getPaddingByHeader(h.type)}
            `
          };
          Object.assign(button.style, buttonStyles);
          button.addEventListener("focus", function () {
            this.style.backgroundColor = "#334155";
          });

          button.addEventListener("blur", function () {
            this.style.backgroundColor = "transparent";
          });

          button.addEventListener("keydown", function (event) {
            const scrollOffset = -150;
            const positionToScrollTo =
              h.element.getBoundingClientRect().top +
              window.scrollY +
              scrollOffset;

            if (event.key === "Enter") {
              window.scrollTo({ top: positionToScrollTo, behavior: "smooth" });
              chrome.storage.session.set({
                lastJumpedHeader: h.text,
              });
            }
          });

          headerListContainer.appendChild(button);
        });

        document.body.appendChild(headerListContainer);

        chrome.storage.session.get(["lastJumpedHeader"]).then((res) => {
          const foundHeaderIdx = allHeaders.findIndex(
            (h) => h.text === res.lastJumpedHeader,
          );

          headerListContainer.tabIndex = 1;

          if (foundHeaderIdx === -1) {
            headerListContainer.firstChild.focus();
            chrome.storage.session.remove("lastJumpedHeader");

          } else {
            headerListContainer.children[foundHeaderIdx].focus();
          }
        });

        return allHeaders;
      },
    })
    .then((res) => {});
}
