import { useEffect, useRef, useState } from "react";

const WhisperLines = () => {
  const [lines, setLines] = useState([]);

  const onWsMessage = (event) => {
    console.log(event)
    const data = JSON.parse(event.data);

    if (Array.isArray(data.lines)) {
      setLines(prevLines => {
        const newLines = [];
        for (const line of data.lines) {
          if (!prevLines.some(
            l => l.beg === line.beg && l.end === line.end && l.speaker === line.speaker && l.text === line.text
          )) {
            newLines.push(line);
          }
        }
        return [...prevLines, ...newLines];
      });
    }
  }

  return { onWsMessage, lines };

};

export default WhisperLines;
