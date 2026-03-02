// =====================
// Spoken Cleaner Script
// =====================

function processText() {
  const inputEl = document.getElementById("inputText");
  const outputEl = document.getElementById("output");

  if (!inputEl || !outputEl) {
    alert("HTML 요소를 찾을 수 없습니다.");
    return;
  }

  const input = inputEl.value.trim();
  outputEl.innerHTML = "";

  if (!input) {
    alert("대화를 붙여넣어주세요 💬");
    return;
  }

  const lines = input.split("\n");

  let messages = [];
  let currentSpeaker = null;
  let currentText = "";

  lines.forEach(line => {
    line = line.trim();
    if (!line) return;

    // [이름] [오전 1:12] 메시지 형식
    const match = line.match(/^\[(.*?)\]\s\[(.*?)\]\s?(.*)$/);

    if (match) {
      const speaker = match[1];
      let text = match[3] || "";

      text = cleanText(text);

      if (speaker === currentSpeaker) {
        currentText += " " + text;
      } else {
        if (currentSpeaker !== null) {
          messages.push({
            speaker: currentSpeaker,
            text: currentText
          });
        }
        currentSpeaker = speaker;
        currentText = text;
      }
    } else {
      // 다음 줄이 이어지는 메시지일 경우
      if (currentSpeaker !== null) {
        currentText += " " + cleanText(line);
      }
    }
  });

  if (currentSpeaker !== null) {
    messages.push({
      speaker: currentSpeaker,
      text: currentText
    });
  }

  if (messages.length === 0) {
    alert("카카오톡 형식이 맞는지 확인해주세요 🥲");
    return;
  }

  render(messages);
}


// 감정 노이즈 제거
function cleanText(text) {
  text = text.replace(/(ㅋ{2,}|ㅎ{2,}|ㅜ{2,}|ㅠ{2,})/g, "");
  text = text.replace(/\s+/g, " ").trim();
  return text;
}


// 화면에 렌더링
function render(messages) {
  const outputEl = document.getElementById("output");

  const pastelColors = [
    "#ffd6e8",
    "#d6e8ff",
    "#fff0b3",
    "#d4ffd6",
    "#f3d6ff",
    "#ffe0cc"
  ];

  const speakerColorMap = {};
  let colorIndex = 0;

  messages.forEach(msg => {

    if (!speakerColorMap[msg.speaker]) {
      speakerColorMap[msg.speaker] =
        pastelColors[colorIndex % pastelColors.length];
      colorIndex++;
    }

    const div = document.createElement("div");
    div.className = "message";
    div.style.backgroundColor = speakerColorMap[msg.speaker];
    div.innerText = msg.text;

    outputEl.appendChild(div);
  });
}


// 정리된 텍스트 가져오기
function getCleanText() {
  const messageEls = document.querySelectorAll(".message");
  let result = "";

  messageEls.forEach(el => {
    result += el.innerText + "\n\n";
  });

  return result.trim();
}


// 복사 기능
function copyText() {
  const text = getCleanText();

  if (!text) {
    alert("복사할 내용이 없어요 🥲");
    return;
  }

  navigator.clipboard.writeText(text)
    .then(() => {
      alert("복사 완료 💗");
    })
    .catch(() => {
      alert("복사 실패 😢");
    });
}


// TXT 다운로드
function downloadTXT() {
  const text = getCleanText();

  if (!text) {
    alert("내보낼 내용이 없어요 🥲");
    return;
  }

  const blob = new Blob([text], {
    type: "text/plain;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "spoken-cleaned.txt";
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
