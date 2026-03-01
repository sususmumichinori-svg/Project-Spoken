// ==========================
// 🔥 PARSER PATTERNS
// ==========================
const PARSER_PATTERNS = [
  { type: "bracketName", regex: /^\[([^\]]+)\]\s*(.*)/ },
  { type: "mention", regex: /^@(\w+)\s+(.*)/ },
  { type: "colon", regex: /^([^:]+)\s*:\s*(.*)/ },
  { type: "role", regex: /^([^\s]+)\)\s*(.*)/ }
];

// ==========================
// 🔥 ChatParser CLASS
// ==========================
class ChatParser {
  constructor(options) {
    this.options = options;
    this.lastSpeaker = null;
  }

  cleanLine(line) {

    // 시간 제거
    if (this.options.removeTime) {
      line = line.replace(/\[(오전|오후)?\s*\d{1,2}:\d{2}\]/g, "");
      line = line.replace(/(오전|오후)?\s*\d{1,2}:\d{2}/g, "");
    }

    // 웃음 제거
    if (this.options.removeLaugh) {
      line = line.replace(/ㅋ+|ㅎ+/g, "");
    }

    // 이모지 제거
    if (this.options.removeEmoji) {
      line = line.replace(/[\u2600-\u27BF\u{1F300}-\u{1F6FF}]/gu, "");
    }

    return line.trim();
  }

  parseLine(line) {
    for (let pattern of PARSER_PATTERNS) {
      const match = line.match(pattern.regex);
      if (match) {
        return {
          name: match[1].trim(),
          content: match[2].trim()
        };
      }
    }
    return null;
  }

  process(text) {
    const lines = text.split("\n");
    const result = [];

    for (let raw of lines) {
      let line = this.cleanLine(raw);
      if (!line) continue;

      const parsed = this.parseLine(line);

      if (parsed) {
        let { name, content } = parsed;

        // 🔥 이름 제거 옵션 ON일 경우
        if (!this.options.showSpeaker) {
          name = null; // 이름 완전 제거
        }

        if (
          this.options.compressLines &&
          name &&
          name === this.lastSpeaker &&
          result.length > 0
        ) {
          result[result.length - 1].content += " " + content;
        } else {
          result.push({ name, content });
          this.lastSpeaker = name;
        }
      } else {

        // 🔥 이름 제거 옵션일 때 혹시 남은 "이름:" 패턴 강제 제거
        if (!this.options.showSpeaker) {
          line = line.replace(/^[^:]+:\s*/, "");
          line = line.replace(/^\[[^\]]+\]\s*/, "");
        }

        if (
          this.options.compressLines &&
          result.length > 0 &&
          result[result.length - 1].name === null
        ) {
          result[result.length - 1].content += " " + line;
        } else {
          result.push({ name: null, content: line });
        }
      }
    }

    return result;
  }
}

// ==========================
// 🔥 UI CONTROLLER
// ==========================
function cleanText() {
  const input = document.getElementById("inputText").value;

  const options = {
    showSpeaker: document.getElementById("showSpeaker").checked,
    colorSpeaker: document.getElementById("colorSpeaker").checked,
    removeTime: document.getElementById("removeTime").checked,
    removeLaugh: document.getElementById("removeLaugh").checked,
    removeEmoji: document.getElementById("removeEmoji").checked,
    compressLines: document.getElementById("compressLines").checked
  };

  const colorCheckbox = document.getElementById("colorSpeaker");

  if (!options.showSpeaker) {
    options.colorSpeaker = false;
    colorCheckbox.checked = false;
    colorCheckbox.disabled = true;
  } else {
    colorCheckbox.disabled = false;
  }

  const parser = new ChatParser(options);
  const messages = parser.process(input);

  render(messages, options);
}

// ==========================
// 🔥 RENDER
// ==========================
function render(messages, options) {
  const output = document.getElementById("output");
  output.innerHTML = "";

  const speakerMap = {};
  let speakerIndex = 0;

  messages.forEach(msg => {
    const div = document.createElement("div");
    div.classList.add("message");

    if (msg.name && options.showSpeaker) {
      if (!(msg.name in speakerMap)) {
        speakerMap[msg.name] = speakerIndex++;
      }

      if (options.colorSpeaker) {
        div.classList.add("speaker-" + (speakerMap[msg.name] % 4));
      }

      div.textContent = msg.name + ": " + msg.content;
    } else {
      div.textContent = msg.content;
    }

    output.appendChild(div);
  });
}

// ==========================
// 🔥 COPY
// ==========================
function copyText() {
  const text = document.getElementById("output").innerText;
  if (!text.trim()) return alert("복사할 내용이 없습니다.");
  navigator.clipboard.writeText(text);
  alert("복사되었습니다.");
}

// ==========================
// 🔥 DOWNLOAD TXT
// ==========================
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
