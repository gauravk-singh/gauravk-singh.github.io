/* One small script for every page: theme toggle, shared header/footer, and data rendering. */
(function () {
  var SITE = {
    name: "Gaurav", // TODO: replace with your full name
    short: "Gaurav",
    nav: [
      ["index.html", "Home"],
      ["blog.html", "Research Blogs"],
      ["publications.html", "Publications"],
      ["seminars.html", "Seminars & Workshops"],
      ["gallery.html", "Gallery"],
      ["cv.html", "CV"],
      ["contact.html", "Contact"]
    ]
  };

  function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  // Theme: follow the system unless the visitor picked one.
  var saved = safeGet("theme");
  if (saved) document.documentElement.setAttribute("data-theme", saved);

  function isDark() {
    var t = document.documentElement.getAttribute("data-theme");
    if (t) return t === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  // Show TODO placeholders highlighted.
  function fmt(s) { return esc(s).replace(/(TODO[^<]*)/g, '<span class="todo">$1</span>'); }

  function buildChrome() {
    var page = location.pathname.split("/").pop() || "index.html";
    var inPosts = location.pathname.indexOf("/posts/") !== -1;
    var base = inPosts ? "../" : "";
    var current = inPosts ? "blog.html" : page;

    var links = SITE.nav.map(function (n) {
      var cur = n[0] === current ? ' aria-current="page"' : "";
      return '<a href="' + base + n[0] + '"' + cur + ">" + n[1] + "</a>";
    }).join("");

    var header = document.getElementById("site-header");
    if (header) {
      header.className = "site";
      header.innerHTML =
        '<div class="wrap"><a class="brand" href="' + base + 'index.html">' + esc(SITE.short) + "</a>" +
        '<nav class="main" aria-label="Main">' + links +
        '<button id="theme-toggle" type="button" aria-label="Toggle dark mode"></button></nav></div>';
    }
    var footer = document.getElementById("site-footer");
    if (footer) {
      footer.className = "site";
      footer.innerHTML = '<div class="wrap">&copy; ' + new Date().getFullYear() + " " + esc(SITE.name) + ". Built as a plain static site.</div>";
    }
    var btn = document.getElementById("theme-toggle");
    if (btn) {
      var paint = function () { btn.textContent = isDark() ? "Light" : "Dark"; };
      paint();
      btn.addEventListener("click", function () {
        var next = isDark() ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        safeSet("theme", next);
        paint();
      });
    }
  }

  function load(file, base) {
    return fetch((base || "") + "data/" + file).then(function (r) {
      if (!r.ok) throw new Error(file);
      return r.json();
    });
  }

  function empty(msg) { return '<div class="empty">' + fmt(msg) + "</div>"; }
  function link(url, label) { return url ? ' <a href="' + esc(url) + '" rel="noopener">' + esc(label) + "</a>" : ""; }

  var renderers = {
    publications: function (el, items) {
      if (!items.length) return empty("TODO: add your first publication in data/publications.json");
      el.innerHTML = items.map(function (p) {
        return '<div class="entry"><h3>' + fmt(p.title) + "</h3>" +
          '<div class="muted">' + fmt(p.authors) + "</div>" +
          '<div><span class="tag status">' + esc(p.status || "") + "</span>" + fmt(p.venue) + " " + esc(p.year || "") +
          link(p.paper, "Paper") + link(p.code, "Code") + "</div></div>";
      }).join("");
    },
    conferences: function (el, items) {
      if (!items.length) return empty("TODO: add conferences in data/conferences.json");
      el.innerHTML = items.map(function (c) {
        return '<div class="entry"><h3>' + fmt(c.name) + "</h3>" +
          '<div class="muted">' + fmt(c.place) + " &middot; " + fmt(c.date) + "</div>" +
          "<div>" + (c.role ? '<span class="tag">' + esc(c.role) + "</span>" : "") + fmt(c.note || "") + link(c.link, "Link") + "</div></div>";
      }).join("");
    },
    seminars: function (el, items) {
      if (!items.length) return empty("TODO: add seminars and workshops in data/seminars.json");
      el.innerHTML = items.map(function (c) {
        return '<div class="entry"><h3>' + fmt(c.name) + "</h3>" +
          '<div class="muted">' + fmt(c.place) + " &middot; " + fmt(c.date) + "</div>" +
          "<div>" + (c.role ? '<span class="tag">' + esc(c.role) + "</span>" : "") + fmt(c.note || "") + link(c.link, "Link") + "</div></div>";
      }).join("");
    },
    posts: function (el, items, limit) {
      if (!items.length) return empty("No posts yet. Copy posts/_template.html, then add an entry to data/posts.json.");
      var list = limit ? items.slice(0, limit) : items;
      el.className = "cards";
      el.innerHTML = list.map(function (p) {
        return '<div class="card"><h3><a href="posts/' + esc(p.slug) + '.html">' + fmt(p.title) + "</a></h3>" +
          '<div class="muted">' + esc(p.date) + "</div><p>" + fmt(p.summary) + "</p></div>";
      }).join("");
    },
    gallery: function (el, items) {
      if (!items.length) return empty("TODO: add photos to assets/img/gallery/ and list them in data/gallery.json");
      el.className = "gallery";
      el.innerHTML = items.map(function (g) {
        return "<figure><img loading=\"lazy\" src=\"" + esc(g.src) + "\" alt=\"" + esc(g.alt) + "\"><figcaption>" + fmt(g.caption || g.alt) + "</figcaption></figure>";
      }).join("");
    }
  };

  function renderData() {
    var nodes = document.querySelectorAll("[data-render]");
    Array.prototype.forEach.call(nodes, function (el) {
      var file = el.getAttribute("data-source");
      var kind = el.getAttribute("data-render");
      var limit = parseInt(el.getAttribute("data-limit") || "0", 10);
      load(file).then(function (items) { renderers[kind](el, items, limit); })
        .catch(function () {
          el.innerHTML = empty("Could not load " + file + ". If you opened this file directly, run a local server (see README).");
        });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    buildChrome();
    renderData();
  });
})();
