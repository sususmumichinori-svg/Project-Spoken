// 🔥 패턴 클래스 (여기서 예외 대응 가능)
const PARSER_PATTERNS = [
  {
    type: "bracketName",
    regex: /^\[([^\]]+)\]\s*(.*)/
  },
  {
    type: "mention",
    regex: /^@(\w+)\s+(.*)/
  },
  {
    type: "colon",
    regex: /^([^:]+)\s*:\s*(.*)/
  },
  {
    type: "role",
    regex: /^([^\s]+)\)\s*(.*)/
  }
];

function parseLine(line) {
  for (let pattern of PARSER_PATTERNS) {
    const match = line.match(pattern.regex);
    if (match) {
      return {
        type: pattern.type,
        name: match[1].trim(),
        content: match[2].trim()
      };
    }
  }
  return null;
}

function cleanText() {
  const input = document.getElementById("inputText").value;

  const showSpeaker = document.getElementById("showSpeaker").checked;
  const colorSpeaker = document.getElementById("colorSpeaker").checked;
  const removeTime = document.getElementById("removeTime").checked;
  const removeLaugh = document.getElementById("removeLaugh").checked;
  const removeEmoji = document.getElementById("removeEmoji").checked;
  const compressLines = document.getElementById("compressLines").checked;

  const output = document.getElementById("output");
  output.innerHTML = "";

  const speakers = {};
  let speakerIndex = 0;
  let lastSpeaker = null;
  let buffer = "";

  // 이름 유지 꺼지면 색상 비활성화
  const colorCheckbox = document.getElementById("colorSpeaker");
  if (!showSpeaker) {
    colorCheckbox.checked = false;
    colorCheckbox.disabled = true;
  } else {
    colorCheckbox.disabled = false;
  }

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

  const lines = input.split("\n");

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    // 시간 제거 (오전/오후 포함)
    if (removeTime) {
      line = line.replace(/(오전|오후)?\s*\d{1,2}:\d{2}/g, "");
    }

    if (removeLaugh) line = line.replace(/ㅋ+|ㅎ+/g, "");
    if (removeEmoji) line = line.replace(/[\u2600-\u27BF\u{1F300}-\u{1F6FF}]/gu, "");

    const parsed = parseLine(line);

    if (parsed) {
      const { name, content } = parsed;

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
  }

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
  a.download = "SPOKEN.txt";
  a.click();
  URL.revokeObjectURL(url);
}