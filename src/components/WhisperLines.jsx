import { useEffect, useRef, useState } from "react";

const WhisperLines = () => {
  const [lines, setLines] = useState([]);

  const onWsMessage = (event) => {
    const data = JSON.parse(event.data);
    console.log(data)

    if (Array.isArray(data.last_n_sents)) {
      setLines(prevLines => {
        const newLines = [];
        for (let i = 0; i < data.last_n_sents.length; i++) {
          const line = data.last_n_sents[i]
          for (let l = 0; l < line.sentences.length; l++) {
            const sentence = line.sentences[l];
            if(prevLines.length - 1 >= i)
              prevLines[i] = sentence;
            else
              newLines.push(sentence);
          }
          
        }
        return [...prevLines, ...newLines];
      });
    }
  }

  return { onWsMessage, lines };

};

export default WhisperLines;
