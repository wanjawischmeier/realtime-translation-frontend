import { useState } from "react";

const WhisperLines = () => {
  const [lines, setLines] = useState([]);
  const [incompleteSentence, setIncompleteSentence] = useState("");

  const onWsMessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Recieved transcript data:')
    console.log(data);
    if (data.transcription_delay + data.translation_delay > 5) {
      console.log('Warning: Transcription running slow');
      console.log(data.transcription_delay);
      console.log(data.translation_delay);
      // Transcript severely delayed, send warning event
      umami.track('transcript-delay', {
        transcription_delay: Math.round(data.transcription_delay),
        translation_delay: Math.round(data.translation_delay)
      });
    }

    if (Array.isArray(data.last_n_sents)) {
      setLines(oldLines => {
        const newLines = [...oldLines]
        for (let i = 0; i < data.last_n_sents.length; i++) {
          const line_idx = data.last_n_sents[i].line_idx
          while(newLines.length-1 < line_idx)
            newLines.push({
              sentences:[],
              speaker:data.last_n_sents[i].speaker
            })
            newLines[line_idx].beg = data.last_n_sents[i].beg
            newLines[line_idx].end = data.last_n_sents[i].end

          for (let l = 0; l < data.last_n_sents[i].sentences.length; l++) {
            const sentence = data.last_n_sents[i].sentences[l];
            while(newLines[line_idx].length-1 < sentence.sent_idx)
              newLines[line_idx].sentences.push({})
            newLines[line_idx].sentences[sentence.sent_idx] = sentence
          }
          
        }
        return [...newLines];
      });
    }

    setIncompleteSentence(data.incomplete_sentence);
  }

  return { onWsMessage, lines, incompleteSentence };

};

export default WhisperLines;
