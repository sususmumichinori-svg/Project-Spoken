// ─────────────────────────────────────────────
//  형식 감지
// ─────────────────────────────────────────────

function detectFormat(input) {
  const lines = input.split("\n").map(l => l.trim()).filter(Boolean);

  if (/^.+님과 카카오톡 대화/.test(lines[0])) return "kakao_export";

  const kakaoPattern      = /^\[.+?\]\s\[.+?\]/;
  const discordPattern    = /^.+\s[—–-]\s.+\d{1,2}:\d{2}/;
  const discordLogPattern = /^\[.+?\]\s.+?:/;

  let kakaoCount = 0;
  let discordCount = 0;

  for (const line of lines) {
    if (kakaoPattern.test(line)) kakaoCount++;
    if (discordPattern.test(line) || discordLogPattern.test(line)) discordCount++;
  }

  if (kakaoCount >= discordCount && kakaoCount > 0) return "kakao";
  if (discordCount > 0) return "discord";
  return "unknown";
}

// ─────────────────────────────────────────────
//  카카오톡 일반 복붙 파서
// ─────────────────────────────────────────────

function parseKakao(lines) {
  let messages = [];
  let currentSpeaker = null;
  let currentText = "";

  lines.forEach(line => {
    line = line.trim();
    if (!line) return;

    const match = line.match(/^\[(.+?)\]\s\[.+?\]\s?(.*)$/);

    if (match) {
      const speaker = match[1];
      let text = cleanText(match[2] || "");

      if (speaker === currentSpeaker) {
        if (text) currentText += " " + text;
      } else {
        if (currentSpeaker !== null) {
          messages.push({ speaker: currentSpeaker, text: currentText.trim() });
        }
        currentSpeaker = speaker;
        currentText = text;
      }
    } else {
      if (currentSpeaker !== null) {
        const cleaned = cleanText(line);
        if (cleaned) currentText += " " + cleaned;
      }
    }
  });

  if (currentSpeaker !== null && currentText.trim()) {
    messages.push({ speaker: currentSpeaker, text: currentText.trim() });
  }

  return messages;
}

// ─────────────────────────────────────────────
//  카카오톡 텍스트 내보내기 파서
// ─────────────────────────────────────────────

function parseKakaoExport(lines) {
  let messages = [];
  let currentSpeaker = null;
  let currentText = "";

  const skipPatterns = [
    /^.+님과 카카오톡 대화$/,
    /^저장한 날짜\s*:/,
    /^-{3,}.+-{3,}$/,
    /^사진$/, /^이모티콘$/, /^동영상$/, /^파일$/, /^연락처$/, /^지도$/,
  ];

  const msgPattern = /^\[(.+?)\]\s\[.+?\]\s?(.*)$/;

  lines.forEach(line => {
    line = line.trim();
    if (!line) return;
    if (skipPatterns.some(p => p.test(line))) return;

    const match = line.match(msgPattern);

    if (match) {
      const speaker = match[1];
      const text = cleanText(match[2] || "");

      if (speaker === currentSpeaker) {
        if (text) currentText += " " + text;
      } else {
        if (currentSpeaker !== null && currentText.trim()) {
          messages.push({ speaker: currentSpeaker, text: currentText.trim() });
        }
        currentSpeaker = speaker;
        currentText = text;
      }
    } else {
      if (currentSpeaker !== null) {
        const cleaned = cleanText(line);
        if (cleaned) currentText += " " + cleaned;
      }
    }
  });

  if (currentSpeaker !== null && currentText.trim()) {
    messages.push({ speaker: currentSpeaker, text: currentText.trim() });
  }

  return messages;
}

// ─────────────────────────────────────────────
//  디스코드 UI 노이즈 제거
// ─────────────────────────────────────────────

function isDiscordNoise(line) {
  // 버튼/UI 요소
  if (/^(클릭해서 반응|반응 추가하기|수정|전달|기타|답장)$/.test(line)) return true;
  // 반응 이모지 단독 줄 (:thumbsup: 등)
  if (/^:[a-zA-Z0-9_]+:$/.test(line)) return true;
  // 날짜 단독 줄: "2026년 3월 3일 화요일 오후 10:42"
  if (/^\d{4}년 \d{1,2}월 \d{1,2}일 .+\d{1,2}:\d{2}$/.test(line)) return true;
  // 시스템 메시지
  if (/이 서버에 참가했습니다|님이 입장|님이 퇴장|메시지를 고정/.test(line)) return true;
  // 인용 블록 멘션 "@닉네임"
  if (/^@.+/.test(line)) return true;

  return false;
}

// ─────────────────────────────────────────────
//  디스코드 파서
// ─────────────────────────────────────────────

function parseDiscord(lines) {
  let messages = [];
  let currentSpeaker = null;
  let currentText = "";

  // "미래 — 오후 10:42" 또는 "미래 — 오후 10:422026년..." 처럼 날짜가 붙은 경우도 처리
  const headerPattern  = /^(.+?)\s[—–-]\s(?:오전|오후)\s?\d{1,2}:\d{2}/;
  // 봇/로그: "[오후 10:42] 화자: 내용"
  const logPattern     = /^\[(?:오전|오후)\s?\d{1,2}:\d{2}\]\s(.+?):\s(.*)$/;
  // 타임스탬프만 있는 줄: "[오후 10:42]2026년..." — 스킵 대상
  const timestampOnly  = /^\[(?:오전|오후)\s?\d{1,2}:\d{2}\]/;

  lines.forEach(line => {
    line = line.trim();
    if (!line) return;

    // 노이즈 제거
    if (isDiscordNoise(line)) return;
    // 타임스탬프 단독/붙은 줄 스킵
    if (timestampOnly.test(line)) return;

    const headerMatch = line.match(headerPattern);
    const logMatch    = line.match(logPattern);

    if (headerMatch) {
      if (currentSpeaker !== null && currentText.trim()) {
        messages.push({ speaker: currentSpeaker, text: currentText.trim() });
      }
      currentSpeaker = headerMatch[1].trim();
      currentText = "";

    } else if (logMatch) {
      const speaker = logMatch[1].trim();
      const text    = cleanText(logMatch[2] || "");

      if (speaker === currentSpeaker) {
        if (text) currentText += " " + text;
      } else {
        if (currentSpeaker !== null && currentText.trim()) {
          messages.push({ speaker: currentSpeaker, text: currentText.trim() });
        }
        currentSpeaker = speaker;
        currentText = text;
      }

    } else {
      if (currentSpeaker !== null) {
        const cleaned = cleanText(line);
        if (cleaned) currentText += (currentText ? " " : "") + cleaned;
      }
    }
  });

  if (currentSpeaker !== null && currentText.trim()) {
    messages.push({ speaker: currentSpeaker, text: currentText.trim() });
  }

  return messages;
}

// ─────────────────────────────────────────────
//  공통 텍스트 클리닝
// ─────────────────────────────────────────────

function cleanText(text) {
  text = text.replace(/(ㅋ{2,}|ㅎ{2,}|ㅜ{2,}|ㅠ{2,})/g, "");
  text = text.replace(/:[a-zA-Z0-9_]+:/g, "");   // 인라인 이모지 코드
  text = text.replace(/\s+/g, " ").trim();
  return text;
}

// ─────────────────────────────────────────────
//  메인 처리 함수
// ─────────────────────────────────────────────

function processText() {
  const inputEl  = document.getElementById("inputText");
  const outputEl = document.getElementById("output");
  const actionEl = document.getElementById("resultActions");

  outputEl.innerHTML = "";
  actionEl.style.display = "none";

  const input = inputEl.value.trim();
  if (!input) {
    alert("대화를 붙여넣어주세요 💬");
    return;
  }

  const lines  = input.split("\n");
  const format = detectFormat(input);

  let messages = [];

  if (format === "kakao") {
    messages = parseKakao(lines);
  } else if (format === "kakao_export") {
    messages = parseKakaoExport(lines);
  } else if (format === "discord") {
    messages = parseDiscord(lines);
  } else {
    alert("지원하는 형식을 찾지 못했어요.\n카카오톡 또는 디스코드 대화를 붙여넣어주세요 🥲");
    return;
  }

  if (messages.length === 0) {
    alert("대화 내용을 분석하지 못했어요. 형식을 확인해주세요 🥲");
    return;
  }

  render(messages, format);
  actionEl.style.display = "block";
}

// ─────────────────────────────────────────────
//  렌더링
// ─────────────────────────────────────────────

function render(messages, format) {
  const outputEl = document.getElementById("output");

  const pastelColors  = ["#ffd6e8", "#d6e8ff", "#fff0b3", "#d4ffd6", "#f3d6ff", "#ffe0cc"];
  const discordColors = ["#d6e4ff", "#e8d6ff", "#d6fff0", "#fff5d6", "#ffd6d6", "#d6f0ff"];

  const palette = format === "discord" ? discordColors : pastelColors;
  const speakerColorMap = {};
  let colorIndex = 0;

  messages.forEach(msg => {
    if (!speakerColorMap[msg.speaker]) {
      speakerColorMap[msg.speaker] = palette[colorIndex % palette.length];
      colorIndex++;
    }

    const div = document.createElement("div");
    div.className = "message";
    div.style.backgroundColor = speakerColorMap[msg.speaker];
    div.innerText = msg.text;

    outputEl.appendChild(div);
  });
}

// ─────────────────────────────────────────────
//  복사 / 내보내기
// ─────────────────────────────────────────────

function getCleanText() {
  const messageEls = document.querySelectorAll(".message");
  let result = "";
  messageEls.forEach(el => {
    result += el.innerText + "\n\n";
  });
  return result.trim();
}

function copyText() {
  const text = getCleanText();
  if (!text) return alert("복사할 내용이 없어요 🥲");
  navigator.clipboard.writeText(text)
    .then(() => alert("복사 완료 💗"))
    .catch(() => alert("복사 실패 😢"));
}

function downloadTXT() {
  const text = getCleanText();
  if (!text) return alert("내보낼 내용이 없어요 🥲");

  const blob = new Blob([text], { type: "text/plain;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url;
  a.download = "spoken-cleaned.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
