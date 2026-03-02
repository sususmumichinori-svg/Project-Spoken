function processText() {
  const input = document.getElementById("inputText").value;
  const outputDiv = document.getElementById("output");
  outputDiv.innerHTML = "";

  if (!input.trim()) {
    alert("대화를 붙여넣어주세요 💬");
    return;
  }

  const lines = input.split("\n");

  let messages = [];
  let currentSpeaker = "";
  let currentText = "";

  lines.forEach(line => {

    // [이름] [오전 1:12] 메시지
    const match = line.match(/^\[(.*?)\]\s\[(오전|오후).*?\]\s(.+)/);

    if (match) {
      const speaker = match[1];
      let text = cleanText(match[3]);

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

  if (messages.length === 0) {
    alert("형식이 맞는지 확인해주세요 🥲");
    return;
  }

  renderMessages(messages);
}

function cleanText(text) {
  // 감정 노이즈 제거
  text = text.replace(/(ㅋ{2,}|ㅎ{2,}|ㅜ{2,}|ㅠ{2,})/g, "");
  text = text.replace(/\s+/g, " ").trim();
  return text;
}

function renderMessages(messages) {
  const outputDiv = document.getElementById("output");

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
