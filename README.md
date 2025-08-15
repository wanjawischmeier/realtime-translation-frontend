# Dependencies
- react/npm
- Do `npm install`

# Run using
```bash
npm run dev
```

# Umami
Used for tracking certain events and pageviews. The server is expected to be ran from the [backend](https://github.com/substratoo/realtime-translation-backend#umami). The following custom events get triggered:
- `<host/client>-joined`
- `<host/client>-joined-slow` (if joining took >1s)
- `<host/client>-disconnected`
- `<host/client>-disconnected-unexpected` (if onclose is not clean or onerror)
- `transcript-delay` (if transcript chunk is recieved with combined delay >10s)
- `transcript-downloaded`
- `closed-room-admin`
- `closed-room-admin-failed`

# TODOs
- [x] Gibt ein paar Bugs für Host beim Streamen, wenn Verbindung abricht während Aufnahme läuft (easy fix möglich :))
- [x] Sprachauswahl nutzen um Übersetzung anzuzeigen (Backend sendet jetzt nötige Daten über RoomsProvider)
    - [x] RoomsProvider parses information to be used in RoomListView
    - Now provides `rooms, availableSourceLangs, availableTargetLangs, maxActiveRooms`
    - [x] `maxActiveRooms` respektieren und nicht mehr Räume aktivieren (sonst verweigert Backend Verbindung) (@substratoo)
    - [x] Use `availableSourceLangs, availableTargetLangs` for lang dropdowns
    - [x] Adapt to new [transcript chunk](https://github.com/substratoo/realtime-translation-backend#transcript-chunk) structure (no longer provides a default language)
    - [x] Show transcript in selected language and not in english
    - [x] Start host with current target lang if room already active
- [x] Roomprovider mit Backend verbinden (Im moment nur Hardcoded liste und fehlt noch Endpoint im Backend)
- [ ] Transcript Parsing and Display UI optimieren für längere Transscripts (Warten bis Übersetzung da sind vor dem Implementieren)
    - [x] Fix incomplete sentences alone not updating view
- [x] (Debugging: Ne Toast message im Frontend mit passthrough der Fehlermeldung, falls das Backend die Verbindung mit 1003 schließt)
    - [ ] Extensive Toasts bei Warnungen/Fehlern um vor Ort debuggen zu können
- [x] Fehlgeschlagene /auth buggy, muss gefixt werden
    - Auch wenn das backend sagt, dass das Passwort falsch ist, verhält sich das Frontend so, als ob alles ok wäre (speichert pw in cookie und geht zur Raumübersicht und versucht als host mit falschem PW zu joinen)
- [x] Back Button bei Streamer/Viewer
- [ ] Show proper room info, show if room is active (status led?)
- [x] Fix: Weirdes scaling des Streaming/Viewing Fensters basierend darauf, wie viel Text im Transkript steht
- [x] (Incomplete sentence buffer auch anzeigen (ausgegraut?) für responsiveres Gefühl)
- [x] Mobile friendly layout (entweder ausschließlich oder mit automatischer Erkennung)
- [x] (Animate in new text of transcript?)
- [x] Option to download transcript (filename could for example be timestamp of download)
    - Assume this endpoint: `@app.get("/room/{room_id}/transcript/{target_lang}")` (returns placeholder transcript rn)
    - [x] `TranscriptDownloadButton` widget
    - [x] Add to `WhisperLiveKitStreamer`
    - [x] Add to `WhisperLiveKitViewer`
    - [x] Option on homescreen to show list of old transcripts
        - [x] Make the list a scrollview
        - [x] Add room info
    - [x] Respect user preferences on wether to allow clients to download transcripts (@substratoo)
        - [x] Only show in transcript list if has access
        - [x] Only show download button on viewer side if public
- [x] Show loading animation whilst connecting websocket (can take a couple of seconds, especially when joining as host)
    - Page otherwise appears unresponsive
    - [x] (Generell Ladeanimationen wenn was gefetcht wird wären nice to have, aber brauchen wir nicht unbedingt)
- [x] Bug: Wenn ich von nem Raum zurück zur Raumübersicht gehe, versucht sich das frontend komischerweise neu mit dem Websocket zu verbinden (als ob ich noch auf der Raumseite wäre)
    - Passiert dann auch, wenn ich zurück auf die Root-Seite gehe
    - Fixt sich durch STRG-R
- [x] Implement umami stats (see [umami](#umami))
- [x] (Some stuff appears to be fetched twice in a row)
    - `/room_list` gets recieved twice
- [x] Handle websocket error disconnect
    - [x] Revert back to home screen and show error message toast if error code is 1003
        - 1003 means that backend consciously disconnected the client from that room (propably a good reason for the client not to be in the room, e.g. incorrect password)
        - [x] Clear password cookie if reason is invalid password (though we should in theory never get to this point in that case)
    - [x] Handle disconnect with other codes, currently leads to nullref exeptions
        - Maybe try to reconnect if error is not 1003
- [x] Bug: First incomplete sentence that comes in does not get displayed, only after a complete one has been recieved
- [x] Handle initial "ready" package
- [ ] For room list etc: refresh on connection reestablished
    - [ ] On connected callback in ServerHealthProvider
- [x] Add restart room logic
- [x] Bug: not always recognizing when password cookie expires, should be asking for pw again in that case. Implement new system for authentication
- [x] Add connection_id cookie
- [x] Ask if transcripts can be saved/downloaded by users (@substratoo)
- [x] Fix: room viewer not rendering properly
- [x] Add help section
- [x] Fix: make lists scrollable
- [x] Cleanup: Generalize loading spinners into a widget
- [x] Admin role
    - [x] Ability to force close rooms
- [x] Add background svg :)
- [x] Language switcher somewhere
- [x] Add server maintenance status message
- [x] Add github repo link
- [x] Add fullscreen mode for transcript display
