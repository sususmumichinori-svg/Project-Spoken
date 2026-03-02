function cleanText() {
  const input = document.getElementById("inputText").value;
  const showSpeaker = document.getElementById("showSpeaker").checked;
  const colorSpeaker = document.getElementById("colorSpeaker").checked;
  const removeTime = document.getElementById("removeTime").checked;
  const removeLaugh = document.getElementById("removeLaugh").checked;
  const outputDiv = document.getElementById("output");

  outputDiv.innerHTML = "";

  const lines = input.split("\n");
  const speakers = {};
  let speakerIndex = 0;

  lines.forEach(function(line) {
    line = line.trim();
    if (!line) return;

    // 카카오 날짜 제거
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

      if (colorSpeaker && showSpeaker) {
        div.classList.add("speaker-" + (speakers[name] % 4));
      }

      div.textContent = showSpeaker ? name + ": " + content : content;
    } else {
      div.textContent = line;
    }

    outputDiv.appendChild(div);
  });
}

/* 화자 상하위 기능 제어 */
document.addEventListener("DOMContentLoaded", function() {
  const showSpeaker = document.getElementById("showSpeaker");
  const colorSpeaker = document.getElementById("colorSpeaker");

  function updateOptions() {
    if (!showSpeaker.checked) {
      colorSpeaker.checked = false;
      colorSpeaker.disabled = true;
      colorSpeaker.parentElement.style.opacity = "0.4";
    } else {
      colorSpeaker.disabled = false;
      colorSpeaker.parentElement.style.opacity = "1";
    }
  }

  showSpeaker.addEventListener("change", updateOptions);
  updateOptions();
});

function copyText() {
  const text = document.getElementById("output").innerText;
  navigator.clipboard.writeText(text);
  alert("복사되었습니다.");
}
