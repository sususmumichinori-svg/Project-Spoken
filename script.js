const PARSER_PATTERNS = [
  { regex: /^\[([^\]]+)\]\s*(.*)/ },
  { regex: /^@(\w+)\s+(.*)/ },
  { regex: /^([^:]+)\s*:\s*(.*)/ },
  { regex: /^([^\s]+)\)\s*(.*)/ }
];

class ChatParser {
  constructor(options) {
    this.options = options;
    this.lastSpeaker = null;
  }

  cleanLine(line) {
    if (this.options.removeTime) {
      line = line.replace(/\[(오전|오후)?\s*\d{1,2}:\d{2}\]/g, "");
      line = line.replace(/(오전|오후)?\s*\d{1,2}:\d{2}/g, "");
    }

    if (this.options.removeLaugh) {
      line = line.replace(/[ㅋㅎㅜㅠ]+/g, "");
    }

    if (this.options.removeEmoji) {
      line = line.replace(/[\u2600-\u27BF\u{1F300}-\u{1F6FF}]/gu, "");
    }

    return line.trim();
  }

  parseLine(line) {
    for (let pattern of PARSER_PATTERNS) {
      const match = line.match(pattern.regex);
      if (match) {
        return { name: match[1].trim(), content: match[2].trim() };
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

        if (!this.options.showSpeaker) name = null;

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
        if (!this.options.showSpeaker) {
          line = line.replace(/^[^:]+:\s*/, "");
          line = line.replace(/^\[[^\]]+\]\s*/, "");
        }

        result.push({ name: null, content: line });
      }
    }

    return result;
  }
}

function cleanText() {
  const options = {
    showSpeaker: document.getElementById("showSpeaker").checked,
    colorSpeaker: document.getElementById("colorSpeaker").checked,
    compressLines: document.getElementById("compressLines").checked,
    removeTime: document.getElementById("removeTime").checked,
    removeLaugh: document.getElementById("removeLaugh").checked,
    removeEmoji: document.getElementById("removeEmoji").checked
  };

  if (!options.showSpeaker) {
    options.colorSpeaker = false;
    options.compressLines = false;
    document.getElementById("colorSpeaker").disabled = true;
    document.getElementById("compressLines").disabled = true;
  } else {
    document.getElementById("colorSpeaker").disabled = false;
    document.getElementById("compressLines").disabled = false;
  }

  const input = document.getElementById("inputText").value;
  const parser = new ChatParser(options);
  const messages = parser.process(input);

  render(messages, options);
}

function render(messages, options) {
  const output = document.getElementById("output");
  output.innerHTML = "";

  const speakerMap = {};
  let index = 0;

  messages.forEach(msg => {
    const div = document.createElement("div");
    div.classList.add("message");

    if (msg.name && options.showSpeaker) {
      if (!(msg.name in speakerMap)) {
        speakerMap[msg.name] = index++;
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

function copyText() {
  const text = document.getElementById("output").innerText;
  navigator.clipboard.writeText(text);
  alert("복사되었습니다.");
}

function downloadTxt() {
  const text = document.getElementById("output").innerText;
  const blob = new Blob([text], { type: "text/plain;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "SPOKEN.txt";
  a.click();
  URL.revokeObjectURL(url);
}
