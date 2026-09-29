function load(key) {
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

function save(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    // Private windows and blocked storage: the page still works, it just forgets.
  }
}

// Cover the Spanish line. The choice carries over to the next page.
const cover = document.querySelector("[data-cover]");

function setCovered(covered) {
  document.body.classList.toggle("covered", covered);
  if (cover) {
    cover.setAttribute("aria-pressed", covered ? "true" : "false");
    cover.textContent = covered ? "Mostrar el español" : "Tapar el español";
  }
}

setCovered(load("ee-covered") === "1");
if (cover) {
  cover.addEventListener("click", () => {
    const covered = !document.body.classList.contains("covered");
    setCovered(covered);
    save("ee-covered", covered ? "1" : "0");
  });
}

// One audio player for every play control.
const player = new Audio();
let current = null;

function clearPlaying() {
  document.querySelectorAll("a.play.playing").forEach((link) => {
    link.classList.remove("playing");
  });
  current = null;
}

player.addEventListener("ended", clearPlaying);
player.addEventListener("error", clearPlaying);

document.querySelectorAll("a.play").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    if (current === link && !player.paused) {
      player.pause();
      clearPlaying();
      return;
    }
    clearPlaying();
    player.src = link.getAttribute("href");
    current = link;
    link.classList.add("playing");
    const started = player.play();
    if (started && typeof started.catch === "function") {
      started.catch(clearPlaying);
    }
  });
});

// Multiple-choice glosses: tap an option to see if it is right.
document.querySelectorAll(".options").forEach((group) => {
  group.querySelectorAll("button.option").forEach((button) => {
    button.addEventListener("click", () => {
      const right = button.dataset.right === "1";
      button.classList.add(right ? "right" : "wrong");
      button.setAttribute("aria-label", `${button.textContent}: ${right ? "sí" : "no"}`);
    });
  });
});

// Self-check: remember Sí, puedo / Todavía no for each unit.
document.querySelectorAll("fieldset[data-store]").forEach((fieldset) => {
  const key = `ee-${fieldset.dataset.store}`;
  const saved = load(key);
  fieldset.querySelectorAll("input[type=radio]").forEach((input) => {
    if (input.value === saved) input.checked = true;
    input.addEventListener("change", () => save(key, input.value));
  });
});
