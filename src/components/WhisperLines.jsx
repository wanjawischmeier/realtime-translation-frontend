import { useState } from "react";
import Cookies from "js-cookie";
import trackUmami from "../help/umamiHelper";

const useWhisperLines = () => {
  const [lines, setLines] = useState([]);
  const [incompleteSentence, setIncompleteSentence] = useState("");
  const [readyToRecieveAudio, setReadyToRecieveAudio] = useState(false);

  const onTranscriptChunk = (chunk) => {
    console.log('Recieved transcript chunk:')
    console.log(chunk);
    if (chunk.transcription_delay + chunk.translation_delay > import.meta.env.VITE_TRANSCRIPT_DELAY_THRESHOLD) {
      console.log('Warning: Transcription running slow');
      console.log(chunk.transcription_delay);
      console.log(chunk.translation_delay);

      // Transcript severely delayed, send warning event
      trackUmami('transcript-delay', {
          transcription_delay: Math.round(chunk.transcription_delay),
          translation_delay: Math.round(chunk.translation_delay)
        });
    }

    if (Array.isArray(chunk.last_n_sents)) {
      setLines(oldLines => {
        const newLines = [...oldLines]
        for (let i = 0; i < chunk.last_n_sents.length; i++) {
          const line_idx = chunk.last_n_sents[i].line_idx
          while(newLines.length-1 < line_idx)
            newLines.push({
              sentences:[],
              speaker:chunk.last_n_sents[i].speaker
            })
            newLines[line_idx].beg = chunk.last_n_sents[i].beg
            newLines[line_idx].end = chunk.last_n_sents[i].end

          for (let l = 0; l < chunk.last_n_sents[i].sentences.length; l++) {
            const sentence = chunk.last_n_sents[i].sentences[l];
            while(newLines[line_idx].length-1 < sentence.sent_idx)
              newLines[line_idx].sentences.push({})
            newLines[line_idx].sentences[sentence.sent_idx] = sentence
          }
          
        }
        return [...newLines];
      });
    }

    setIncompleteSentence(chunk.incomplete_sentence);
  }

  const onWsMessage = (event) => {
    const data = JSON.parse(event.data);
    if ('info' in data) {
      // Recieved message with infos
      Object.entries(data.info).forEach(([key, info]) => {
      switch (key) {
        case 'ready_to_recieve_audio':
          console.log(`Recieved audio stream${info ? ' ' : ' not '}ready signal`);
          setReadyToRecieveAudio(info);
          break;
        case 'connection_id':
          console.log(`Recieved connection id: ${info}`);
          Cookies.set('connection_id', info); 
        default:
          break;
      }
    });
    } else {
      // Assume transcript chunk
      onTranscriptChunk(data);
    }
  }

  const reset = () => {
    setLines([]);
    setIncompleteSentence('');
    setReadyToRecieveAudio(false);
  }

  return { onWsMessage, lines, incompleteSentence, readyToRecieveAudio, setReadyToRecieveAudio, reset };

};

export default useWhisperLines;
