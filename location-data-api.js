// Progressive enhancements for the Location Data API docs page.
// The page is fully readable without this script; it only adds
// copy-to-clipboard buttons on code blocks and active-section
// highlighting in the sidebar table of contents.

const resetButton = (button) => {
  button.textContent = "Copy";
  button.classList.remove("copied");
};

const markCopied = (button) => {
  button.textContent = "Copied";
  button.classList.add("copied");
  window.setTimeout(() => resetButton(button), 1500);
};

const markError = (button) => {
  button.textContent = "Error";
  window.setTimeout(() => resetButton(button), 1500);
};

const copyPre = (pre, button) => {
  navigator.clipboard
    .writeText(pre.innerText)
    .then(() => markCopied(button))
    .catch(() => markError(button));
};

// Wrap each <pre> and add a "Copy" button that copies its text.
const addCopyButtons = () => {
  document.querySelectorAll("pre").forEach((pre) => {
    const wrap = document.createElement("div");
    wrap.className = "pre-wrap";
    pre.parentNode.insertBefore(wrap, pre);
    wrap.appendChild(pre);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "copy-btn";
    button.textContent = "Copy";
    wrap.appendChild(button);

    button.addEventListener("click", () => copyPre(pre, button));
  });
};

// Highlight the table-of-contents link for the section in view.
const trackActiveSection = () => {
  const links = Array.from(document.querySelectorAll('nav.toc a[href^="#"]'));
  if (!links.length || !("IntersectionObserver" in window)) {
    return;
  }

  const idOf = (link) => link.getAttribute("href").slice(1);
  const visible = new Set();

  const setActive = () => {
    const current = links.find((link) => visible.has(idOf(link)));
    links.forEach((link) => link.classList.toggle("active", link === current));
  };

  const onIntersect = (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        visible.add(entry.target.id);
      } else {
        visible.delete(entry.target.id);
      }
    });
    setActive();
  };

  const observer = new IntersectionObserver(onIntersect, {
    rootMargin: "0px 0px -70% 0px",
  });

  links.forEach((link) => {
    const section = document.getElementById(idOf(link));
    if (section) {
      observer.observe(section);
    }
  });
};

const init = () => {
  addCopyButtons();
  trackActiveSection();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
