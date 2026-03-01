document.getElementById("cleanBtn").addEventListener("click", function() {

  const input = document.getElementById("inputText").value;
  const compress = document.getElementById("compress").checked;
  const removeTime = document.getElementById("removeTime").checked;
  const removeLaugh = document.getElementById("removeLaugh").checked;

  const output = document.getElementById("output");
  output.innerHTML = "";

  if (!input.trim()) {
    output.innerHTML = "<p>내용이 없습니다.</p>";
    return;
  }

  const lines = input.split("\n");
  let speakers = {};
  let speakerOrder = [];
  let lastSpeaker = null;
  let buffer = "";

  function flush() {
    if (!buffer) return;

    const bubble = document.createElement("div");
    bubble.classList.add("bubble");

    const side = speakerOrder.indexOf(lastSpeaker) % 2 === 0 ? "left" : "right";
    bubble.classList.add(side);

    const nameDiv = document.createElement("div");
    nameDiv.classList.add("name");
    nameDiv.textContent = lastSpeaker;

    const textDiv = document.createElement("div");
    textDiv.textContent = buffer;

    bubble.appendChild(nameDiv);
    bubble.appendChild(textDiv);
    output.appendChild(bubble);

    buffer = "";
  }

  for (let line of lines) {

    line = line.trim();
    if (!line) continue;

    if (removeTime) {
      line = line.replace(/(오전|오후)?\s*\d{1,2}:\d{2}/g, "");
    }

    if (removeLaugh) {
      line = line.replace(/ㅋ+|ㅎ+/g, "");
    }

    let match = line.match(/^([^:]+):\s*(.*)$/);

    if (match) {
      let name = match[1].trim();
      let text = match[2].trim();

      if (!speakers[name]) {
        speakers[name] = true;
        speakerOrder.push(name);
      }

      if (compress && name === lastSpeaker) {
        buffer += " " + text;
      } else {
        flush();
        lastSpeaker = name;
        buffer = text;
      }
    } else {
      if (compress) {
        buffer += " " + line;
      }
    }
  }

  flush();

});