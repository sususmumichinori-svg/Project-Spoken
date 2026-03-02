function processText() {
  const input = document.getElementById("inputText").value;
  const outputDiv = document.getElementById("output");
  outputDiv.innerHTML = "";

  const lines = input.split("\n");

  let messages = [];
  let currentSpeaker = "";
  let currentText = "";

  lines.forEach(line => {
    const match = line.match(/,\s(.+?)\s:\s(.+)/);

    if (match) {
      const speaker = match[1];
      let text = cleanText(match[2]);

      if (speaker === currentSpeaker) {
        currentText += " " + text;
      } else {
        if (currentText) {
          messages.push({ speaker: currentSpeaker, text: currentText });
        }
        currentSpeaker = speaker;
        currentText = text;
      }
    }
  });

  if (currentText) {
    messages.push({ speaker: currentSpeaker, text: currentText });
  }

  renderMessages(messages);
}

function cleanText(text) {
  text = text.replace(/(ㅋ{2,}|ㅎ{2,}|ㅜ{2,}|ㅠ{2,})/g, "");
  text = text.replace(/\s+/g, " ").trim();
  return text;
}

function renderMessages(messages) {
  const outputDiv = document.getElementById("output");

  // 화자별 색상 매핑
  const speakerColors = {};
  const pastelColors = [
    "#ffd6e8",
    "#d6e8ff",
    "#fff0b3",
    "#d4ffd6",
    "#f3d6ff",
    "#ffe0cc"
  ];

  let colorIndex = 0;

  messages.forEach(msg => {
    if (!speakerColors[msg.speaker]) {
      speakerColors[msg.speaker] = pastelColors[colorIndex % pastelColors.length];
      colorIndex++;
    }

    const div = document.createElement("div");
    div.classList.add("message");
    div.style.backgroundColor = speakerColors[msg.speaker];
    div.innerText = msg.text;

    outputDiv.appendChild(div);
  });
}
