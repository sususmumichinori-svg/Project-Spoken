function cleanText() {
  const input = document.getElementById("inputText").value;
  const mode = document.querySelector('input[name="mode"]:checked').value;

  const showSpeaker = document.getElementById("showSpeaker").checked;
  const colorSpeaker = document.getElementById("colorSpeaker").checked;
  const removeTime = document.getElementById("removeTime").checked;
  const removeLaugh = document.getElementById("removeLaugh").checked;
  const removeEmoji = document.getElementById("removeEmoji").checked;
  const compressLines = document.getElementById("compressLines").checked;

  const output = document.getElementById("output");
  output.innerHTML = "";

  const lines = input.split("\n");
  const speakers = {};
  let speakerIndex = 0;
  let lastSpeaker = null;
  let buffer = "";

  function flush() {
    if (!buffer.trim()) return;

    const div = document.createElement("div");
    div.classList.add("message");

    if (colorSpeaker && showSpeaker && lastSpeaker) {
      div.classList.add("speaker-" + (speakers[lastSpeaker] % 4));
    }

    div.textContent = showSpeaker && lastSpeaker
      ? lastSpeaker + ": " + buffer.trim()
      : buffer.trim();

    output.appendChild(div);
    buffer = "";
  }

  lines.forEach(line => {
    line = line.trim();
    if (!line) return;

    if (removeTime) line = line.replace(/\d{1,2}:\d{2}/g, "");
    if (removeLaugh) line = line.replace(/ㅋ+|ㅎ+/g, "");
    if (removeEmoji) line = line.replace(/[\u2600-\u27BF\u{1F300}-\u{1F6FF}]/gu, "");

    let name = null;
    let content = null;

    if (mode === "kakao") {
      line = line.replace(/^\d{4}년.*?,\s*/, "");
      const m = line.match(/^([^:]+)\s*:\s*(.*)/);
      if (m) { name = m[1]; content = m[2]; }
    }
    else if (mode === "twitter") {
      const m = line.match(/^@(\w+)\s*(.*)/);
      if (m) { name = "@" + m[1]; content = m[2]; }
    }
    else if (mode === "role") {
      const m = line.match(/^\[?([^\]]+)\]?\s*[:)]\s*(.*)/);
      if (m) { name = m[1]; content = m[2]; }
    }
    else {
      const m = line.match(/^([^:]+)\s*:\s*(.*)/);
      if (m) { name = m[1]; content = m[2]; }
    }

    if (name) {
      if (!(name in speakers)) speakers[name] = speakerIndex++;
      if (compressLines && name === lastSpeaker) {
        buffer += " " + content;
      } else {
        flush();
        lastSpeaker = name;
        buffer = content;
      }
    } else {
      if (compressLines) {
        buffer += " " + line;
      } else {
        flush();
        buffer = line;
        flush();
      }
    }
  });

  flush();
}

function copyText() {
  const text = document.getElementById("output").innerText;
  navigator.clipboard.writeText(text);
  alert("복사되었습니다.");
}

function downloadTxt() {
  const text = document.getElementById("output").innerText;
  if (!text.trim()) return alert("다운로드할 내용이 없습니다.");

  const blob = new Blob([text], { type: "text/plain;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "대화정리.txt";
  a.click();
  URL.revokeObjectURL(url);
}
