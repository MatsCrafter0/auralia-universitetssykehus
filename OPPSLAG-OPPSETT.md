# Oppslagstavle med Google-administrator

Dette er en klargjort løsning. **Ikke aktiv før Firebase er konfigurert.**

1. Opprett et Firebase-prosjekt på https://console.firebase.google.com/ .
2. Legg til en **Web app** og kopier `firebaseConfig` til `oppslag-config.js`.
3. Under **Authentication > Sign-in method**, aktiver **Google**.
4. Legg GitHub Pages-domenet (og eventuelt eget domene) til **Authentication > Settings > Authorized domains**.
5. Opprett **Cloud Firestore**. Publiser reglene i `firestore.rules`, men bytt først `REPLACE_WITH_ADMIN_UID` til din egen Firebase Authentication UID.
6. For å få UID: Logg inn med Google etter at web-konfigurasjonen er satt inn, og finn brukeren i **Authentication > Users**. Sett samme UID i `oppslag-config.js`. Før dette vil innlogging ikke gi redigeringstilgang.
7. Test at riktig konto kan opprette, endre og slette oppslag, og at en annen Google-konto **ikke** kan gjøre det.

**Viktig:** Ikke bruk åpne standardregler som `allow write: if true`. Firebase-konfigurasjonen er ikke et passord. Den reelle sikkerheten ligger i publiserte Firestore-regler.

Oppslagstavlen bruker `oppslag.html`. Kun publiserte oppslag vises offentlig. Utkast kan leses av administratoren etter innlogging.

Dersom oppslagene ikke vises offentlig, kontroller Firestore-reglene og spørringsoppsettet.
