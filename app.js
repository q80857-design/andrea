(function () {
  "use strict";
  var C = window.CONFIG;
  var $ = function (s) { return document.querySelector(s); };

  document.title = C.pageTitle;

  function show(id) {
    var all = document.querySelectorAll(".screen");
    for (var i = 0; i < all.length; i++) all[i].classList.remove("active");
    document.getElementById(id).classList.add("active");
    window.scrollTo(0, 0);
  }

  /* ---------------- 登入 ---------------- */
  var fails = 0;
  var loginDone = false;
  $("#loginTitle").textContent = C.login.title;
  $("#loginSub").textContent = C.login.subtitle;

  $("#loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    if (loginDone) return;
    var acct = $("#acct").value.trim().toLowerCase();
    var pwd = $("#pwd").value.trim();
    var ok = acct === String(C.login.account).toLowerCase() && pwd === String(C.login.password);
    var msg = $("#loginMsg");
    if (ok) {
      loginDone = true;
      msg.textContent = "歡迎回來 ♡";
      setTimeout(startQuiz, 700);
      return;
    }
    fails++;
    if (fails >= C.login.maxFails) {
      loginDone = true;
      msg.textContent = C.login.giveUpText;
      setTimeout(startQuiz, 1200);
      return;
    }
    var left = C.login.maxFails - fails;
    msg.textContent = C.login.wrongText + "（再試 " + left + " 次）";
    var form = $("#loginForm");
    form.classList.remove("shake");
    void form.offsetWidth;
    form.classList.add("shake");
  });

  /* ---------------- 問答 ---------------- */
  var qi = 0;
  function startQuiz() {
    qi = 0;
    renderQuestion();
    show("quiz");
  }

  function renderQuestion() {
    var list = C.quiz.questions;
    var item = list[qi];
    $("#qProgress").textContent = "第 " + (qi + 1) + " / " + list.length + " 題";
    $("#qText").textContent = item.q;
    $("#qMsg").textContent = "";
    var box = $("#qOptions");
    box.innerHTML = "";
    item.options.forEach(function (text, idx) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "opt";
      b.textContent = text;
      b.addEventListener("click", function () { choose(idx, b); });
      box.appendChild(b);
    });
  }

  function choose(idx, btn) {
    var item = C.quiz.questions[qi];
    var btns = $("#qOptions").querySelectorAll(".opt");
    for (var i = 0; i < btns.length; i++) btns[i].disabled = true;
    var right = idx === item.answer;
    btn.classList.add(right ? "right" : "wrong");
    if (!right && btns[item.answer]) btns[item.answer].classList.add("right");
    $("#qMsg").textContent = right ? C.quiz.correctText : C.quiz.wrongText;
    setTimeout(function () {
      qi++;
      if (qi < C.quiz.questions.length) {
        renderQuestion();
      } else {
        resetEnvelope();
        show("envelope");
      }
    }, 1500);
  }

  /* ---------------- 信封 ---------------- */
  var opened = false;
  $("#envHint").textContent = C.envelope.hint;

  function resetEnvelope() {
    opened = false;
    $("#env").classList.remove("open");
  }

  function openEnvelope() {
    if (opened) return;
    opened = true;
    $("#env").classList.add("open");
    setTimeout(function () {
      buildLetter();
      show("letter");
    }, 2300);
  }
  $("#env").addEventListener("click", openEnvelope);
  $("#env").addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openEnvelope(); }
  });

  /* ---------------- 情書 ---------------- */
  function buildLetter() {
    var L = C.letter;
    var paper = $("#paper");
    paper.innerHTML = "";
    var n = 0;
    function addLine(text, cls) {
      var p = document.createElement("p");
      p.className = "line" + (cls ? " " + cls : "");
      p.style.animationDelay = (n * 0.6) + "s";
      p.textContent = text;
      paper.appendChild(p);
      n++;
      return p;
    }
    addLine(L.greeting, "greet");
    L.paragraphs.forEach(function (t) { addLine(t); });

    var photo = document.createElement("div");
    photo.className = "photo line";
    photo.style.animationDelay = (n * 0.6) + "s";
    n++;
    var img = new Image();
    img.alt = "我們的照片";
    img.onload = function () {
      photo.innerHTML = "";
      photo.appendChild(img);
      if (L.photoCaption) {
        var s = document.createElement("small");
        s.textContent = L.photoCaption;
        photo.appendChild(s);
      }
    };
    img.onerror = function () {
      photo.innerHTML = '<div class="ph">（這裡放照片：把照片命名為 ' + L.photo + ' 放進同一個資料夾）</div>';
    };
    img.src = L.photo;
    paper.appendChild(photo);

    addLine(L.signature + "\n" + L.date, "sign");
  }

  $("#again").addEventListener("click", function () {
    resetEnvelope();
    show("envelope");
  });

  /* ---------------- 飄落晶石（原創造型） ---------------- */
  var cv = $("#gems");
  var ctx = cv.getContext("2d");
  var W = 0, H = 0, gems = [];
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var PALETTE = [
    ["#fff0ff", "#eac1f7", "#c58be0"],
    ["#ffe8f4", "#f7bbdc", "#d98bbd"],
    ["#f3eaff", "#d2b9f7", "#a98be0"]
  ];

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    cv.width = W * dpr;
    cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var want = W < 500 ? 20 : 34;
    while (gems.length < want) gems.push(make(true));
    gems.length = want;
  }

  function make(initial) {
    return {
      x: Math.random() * W,
      y: initial ? Math.random() * H : -40 - Math.random() * 80,
      size: 8 + Math.random() * 10,
      vy: 0.35 + Math.random() * 0.7,
      sway: Math.random() * Math.PI * 2,
      amp: 0.3 + Math.random() * 0.6,
      rot: (Math.random() - 0.5) * 0.6,
      vr: (Math.random() - 0.5) * 0.01,
      spin: Math.random() * Math.PI * 2,
      vs: 0.01 + Math.random() * 0.025,
      alpha: 0.55 + Math.random() * 0.4,
      c: PALETTE[Math.floor(Math.random() * PALETTE.length)]
    };
  }

  function poly(pts, color) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  function drawGem(g) {
    var s = g.size, k = Math.cos(g.spin);
    if (Math.abs(k) < 0.12) k = k < 0 ? -0.12 : 0.12;
    ctx.save();
    ctx.translate(g.x, g.y);
    ctx.rotate(g.rot);
    ctx.scale(k, 1);
    ctx.globalAlpha = g.alpha;
    ctx.shadowColor = "rgba(210,150,240,.55)";
    ctx.shadowBlur = 8;
    var T = [0, -s], R = [s * 0.72, -s * 0.1], B = [0, s * 1.15], L = [-s * 0.72, -s * 0.1], M = [0, -s * 0.1];
    poly([T, L, M], g.c[0]);
    poly([T, R, M], g.c[1]);
    poly([L, M, B], g.c[1]);
    poly([R, M, B], g.c[2]);
    ctx.restore();
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < gems.length; i++) {
      var g = gems[i];
      g.y += g.vy;
      g.sway += 0.02;
      g.x += Math.sin(g.sway) * g.amp;
      g.rot += g.vr;
      g.spin += g.vs;
      if (g.y > H + 40) gems[i] = make(false);
      drawGem(gems[i]);
    }
    raf = 0;
    if (!document.hidden) start();
  }

  var raf = 0;
  function start() {
    if (!raf) raf = requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener("resize", resize);
  if (reduce) {
    ctx.clearRect(0, 0, W, H);
    gems.forEach(drawGem);
  } else {
    start();
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) start();
    });
  }
})();
