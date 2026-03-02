function cleanText() {
  const input = document.getElementById("inputText").value;
  const removeTime = document.getElementById("removeTime").checked;
  const removeLaugh = document.getElementById("removeLaugh").checked;
  const colorSpeaker = document.getElementById("colorSpeaker").checked;
  const removeSpeaker = document.getElementById("removeSpeaker").checked;
  const outputDiv = document.getElementById("output");

  outputDiv.innerHTML = "";

  const lines = input.split("\n");
  const speakers = {};
  let speakerIndex = 0;

  lines.forEach(function(line) {
    line = line.trim();
    if (!line) return;

    // 카카오톡 날짜 제거
    line = line.replace(/^\d{4}년.*?,\s*/, "");

    if (removeTime) {
      line = line.replace(/\d{1,2}:\d{2}/g, "");
    }

    if (removeLaugh) {
      line = line.replace(/ㅋ+|ㅎ+/g, "");
    }

    const match = line.match(/^([^:]+)\s*:\s*(.*)/);
    const div = document.createElement("div");

    if (match) {
      const name = match[1].trim();
      const content = match[2].trim();

      if (!(name in speakers)) {
        speakers[name] = speakerIndex++;
      }

      if (colorSpeaker && !removeSpeaker) {
        div.classList.add("speaker-" + (speakers[name] % 4));
      }

      div.textContent = removeSpeaker ? content : name + ": " + content;
    } else {
      div.textContent = line;
    }

    outputDiv.appendChild(div);
  });
}

function copyText() {
  const text = document.getElementById("output").innerText;
  navigator.clipboard.writeText(text);
  alert("복사되었습니다.");
}
