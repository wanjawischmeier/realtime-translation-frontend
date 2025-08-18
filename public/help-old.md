# Realtime Translate

## Backend
- /health
	- just returns 200: "ok"
	- or 503: "not ready"
- /rooms
	- returns a list of rooms (from now to end of event)
## Event (Das ganze SCC)
- title:str
- start:datetime.date
- end:datetime.date
- days:int  => z.B. nett um remaining Days anzuzeigen
- timezone:pytz.tzinfo
- colors: dict => z.B. nett um ähnliches Design zu haben
- tracks: list[dict[str, str]
    - name:str
    - color:str

## Room
- ID
- Title
- Description
- Location
- Time
- Organizer
- Status 
    - translation_available : bool
    - transcription_save: bool => wird von Organizer eingestellt und am Ende ein Download Button angezeigt (Mit Sprachauswahl)
- Transcription_Manager Instance




### Sonstige Überlegungen
- Room manager
	- Using PyTox
	- Each room has a transcription_manager instance
- Translation worker
	- Needs to keep track of room for each sentence
- Transcription manager
	- Push last n sentences of each update to all connected clients

![](https://pad.kanthaus.online/uploads/245d0749-bbba-4a24-9f3e-195f49b2b7cb.png)



### Backend TODOs
https://github.com/substratoo/realtime-translation-backend#todos


### Frontend TODOs
https://github.com/substratoo/realtime-translation-frontend#todos

### Roadmap
- SimulStreaming testen -> erstmal nicht
- Popup/Prompt im Frontend:
    - Solls gespeichert werden
        - Falls ja, Dürfen Nutzer Transkript runterladen
- Hilfe
    - Ne markdown machen (@whoami)
    - Als html compilen und ins frontend packen (@subtratoo)
- Donnerstag 14 Uhr mit Ngrok stresstesten
    - Whisper engine auf Desktop testen
    - Mit mehreren parralelen Events testen

- Mio macht is transcript public info speichern

- Susi macht noch die translation json fertig
- Susi macht help doc
- Namen von Raum in header
- Credentials müssen immer wieder eingegeben werden
- Transcript view scrollt nicht

Bugs:
- Raum schließt sich random nach einiger Zeit (susis Internet?)

Noch zu testen:
- Mit mehreren hosts reingehen, in beiden was sagen
    - Klappt das assozieren eines Hosts mit seinem Raum? Also kann ein Host in seinen noch offenen Raum gehen, wenn die max rooms cap erreicht ist?
- Schnell Sprachen wechseln
- Schnell aus Räumen raus und reingehen
- Wenn du fälschlicherweise "Multiple hosts connected" kriegst, finde bitte nen genauen Weg, um den Fehler zu reproduzieren. Hab ich bis jetzt noch nicht hingekriegt 
- Room restarts probieren und Rooms als admin schließen
    - Wie kommen Räume in einen broken state
    - Wenn sie broken sind, kann das dann durch nen Room close als admin gefixt werden?
- Werden transkripte wie erwartet gespeichert und verfügbar gemacht? Also je nachdem, was der Host bei Erstellung auswählt?