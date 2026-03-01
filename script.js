let currentPlatform = "kakao";

document.querySelectorAll(".toggle").forEach(btn => {
  btn.addEventListener("click", () => {
    if (btn.dataset.platform) {
      document.querySelectorAll("[data-platform]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentPlatform = btn.dataset.platform;
      return;
    }

    btn.classList.toggle("active");

    if (btn.id === "showSpeaker") {
      const enabled = btn.classList.contains("active");
      document.getElementById("colorSpeaker").disabled = !enabled;
      document.getElementById("compressLines").disabled = !enabled;
    }
  });
});

function cleanText() {
  const options = {
    showSpeaker: isOn("showSpeaker"),
    colorSpeaker: isOn("colorSpeaker"),
    compressLines: isOn("compressLines"),
    removeTime: isOn("removeTime"),
    removeLaugh: isOn("removeLaugh"),
    removeEmoji: isOn("removeEmoji")
  };

  const input = document.getElementById("inputText").value;
  const lines = input.split("\n");
  const output = [];

  let lastSpeaker = null;

  lines.forEach(line => {
    if (options.removeTime) {
      line = line.replace(/\d{1,2}:\d{2}/g, "");
    }

    if (options.removeLaugh) {
      line = line.replace(/[ㅋㅎㅠㅜ]+/g, "");
    }

    if (options.removeEmoji) {
      line = line.replace(/[\u{1F300}-\u{1F6FF}]/gu, "");
    }

    line = line.trim();
    if (!line) return;

    let name = null;
    let content = line;

    if (currentPlatform === "kakao") {
      const match = line.match(/^([^:]+):\s*(.*)/);
      if (match) {
        name = match[1];
        content = match[2];
      }
    }

    if (!options.showSpeaker) {
      name = null;
    }

    if (options.compressLines && name && name === lastSpeaker) {
      output[output.length - 1].content += " " + content;
    } else {
      output.push({ name, content });
      lastSpeaker = name;
    }
  });

  render(output, options);
}

function render(messages, options) {
  const outputDiv = document.getElementById("output");
  outputDiv.innerHTML = "";

  messages.forEach(msg => {
    if (msg.name) {
      outputDiv.innerHTML += msg.name + ": " + msg.content + "\n";
    } else {
      outputDiv.innerHTML += msg.content + "\n";
    }
  });
}

function isOn(id) {
  return document.getElementById(id).classList.contains("active");
}
