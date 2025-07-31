import { useEffect, useRef, useState } from "react";

const WhisperLines = () => {
  const [lines, setLines] = useState([]);

  const onWsMessage = (event) => {
    const data = JSON.parse(event.data);
    console.log(data)

    if (Array.isArray(data.lines)) {
      setLines(prevLines => {
        const newLines = [];
        for (let i = 0; i < data.lines.length; i++) {
          const line = data.lines[i]
          if(prevLines.length - 1 >= i)
            prevLines[i] = line;
          else
            newLines.push(line);
        }
        return [...prevLines, ...newLines];
      });
    }
  }

  return { onWsMessage, lines };

};

export default WhisperLines;
