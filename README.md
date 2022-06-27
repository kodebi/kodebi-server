<p align="center">
  <a href="http://dev.app.kodebi.de">
    <img src="kodebi_logo_classic.svg" width="250">
  </a>
</p>
<h1 align="center">
  Kodebi Server
</h1>

### Pakete installieren

```
npm install
Falls es einen Fehler geben sollte:
npm install --legacy-peer-deps
```

### Während der Entwicklung

Als Datenbank wird mongodb benutzt, welches vorher installiert werden muss:
[https://docs.mongodb.com/manual/installation/]
Datenbank starten mit

```
mongod
```

Server starten

```
npm run dev
```

In Prod:

```
npm run start
```

Im Browser aufrufen:
http://localhost:3000

### Beschreibung

Kodebi backend mit create, update, delete (CRUD) und authentication-authorization (auth)
Testen mit https://install.advancedrestclient.com/install

-   Body-Content-Type: application/json
-   Editor-view: Json visual Editor

#### application programming interface (API)

### User Routes

| Route                | HTTP Methode |                 Beschreibung |
| -------------------- | :----------: | ---------------------------: |
| `/api/users`         |    `POST`    |            Erstelle Benutzer |
| `/api/users`         |    `GET`     |         Liste aller Benutzer |
| `/api/users/:userId` |    `GET`     | Rufe bestimmten Benutzer auf |
| `/api/users/:userId` |    `PUT`     |        aktualisiere Benutzer |
| `/api/users/:userId` |   `DELETE`   |              Lösche Benutzer |
| `/auth/signin`       |    `POST`    |                     Anmelden |
| `/auth/signout`      |    `GET`     |                     Abmelden |

### Benutzer Felder in der Datenbank

| Feld            |       Typ       |                                                Beschreibung |
| --------------- | :-------------: | ----------------------------------------------------------: |
| name            |     string      |                                                   Notwendig |
| email           |     string      |                                     Notwendig (einzigartig) |
| password        |     string      |           Notwendig Passwort wird verschlüsselt gespeichert |
| createdAt       |      Date       |     Wann wurde der Benutzer erstellt? Automatisch generiert |
| updatedAt       |      Date       | Wann wurde der Benutzer aktualisiert? Automatisch generiert |
| group           |     string      |                                                    Optional |
| borrowedBooks   |  borrowedBooks  |                                        Ausgeliehende Bücher |
| bookmarkedBooks | bookmarkedBooks |                                             gemerkte Bücher |

### Bücher API

| Route                              | HTTP Methode |                               Beschreibung |
| ---------------------------------- | :----------: | -----------------------------------------: |
| `/api/books/`                      |    `GET`     |                         Liste aller Bücher |
| `/api/book/`                       |    `POST`    |                              Erstelle Buch |
| `/api/book/:bookId`                |    `GET`     |                  Finde ein bestimmtes Buch |
| `/api/book/:bookId`                |    `PUT`     |                             Verändere Buch |
| `/api/book/image/:bookId`          |    `PUT`     |            Verändere nur das Bild von Buch |
| `/api/book/:bookId`                |   `DELETE`   |                                Lösche Buch |
| `/api/book/user/:userId`           |    `GET`     | Erhalte alle Bücher eines bestimmten Users |
| `/api/borrow/:bookId/user/:userId` |    `PUT`     | Verleihe eigenes Buch mit bookId an userId |
| `/api/borrow`                      |    `GET`     |                   Eigene verliehene Bücher |
| `/api/return/:bookId`              |    `PUT`     |                       Buch zurück erhalten |
| `/api/bookmark/:bookId`            |    `PUT`     |                Trage Buch in Merkliste ein |
| `/api/bookmark`                    |    `GET`     |                     Eigene gemerkte Bücher |

### Book Schema

| Feld          |  Typ   |                     Beschreibung |
| ------------- | :----: | -------------------------------: |
| name          | string |                        Notwendig |
| author        | string |                        Notwendig |
| category      | string |                        Notwendig |
| language      | string |                        Notwendig |
| condition     | string |                        Notwendig |
| description   | string |                        Notwendig |
| status        | string |                         optional |
| ownerId       |  User  |            automatisch generiert |
| ownerName     | string |            automatisch generiert |
| createdAt     | Datum  |            automatisch generiert |
| updatedAt     | Datum  |            automatisch generiert |
| group         | string |                         Optional |
| timesBorrowed |  int   | Wie oft wurde das Buch geliehen? |

### BookList Schema

| Feld         |  Typ   |          Beschreibung |
| ------------ | :----: | --------------------: |
| name         | string |             Notwendig |
| author       | string |             Notwendig |
| ownerId      |  User  | automatisch generiert |
| ownerName    | string | automatisch generiert |
| borrowerId   |  User  |             Notwendig |
| borrowerName | string |             Notwendig |
| book         |  book  |             Notwendig |
| createdAt    | Datum  | automatisch generiert |
| updatedAt    | Datum  | automatisch generiert |

#### borrowedBooks/bookmarkedBooks

| Feld               |        Typ        | Beschreibung |
| ------------------ | :---------------: | -----------: |
| bookmarkedBookList | array of BookList |    Notwendig |
| borrowedBookList   | array of BookList |    Notwendig |

### Nachrichten API

| Route                        | HTTP Methode |                          Beschreibung |
| ---------------------------- | :----------: | ------------------------------------: |
| `/api/messages`              |    `POST`    |       Erstelle Nachricht/Konversation |
| `/api/messages/:convId`      |    `GET`     |                  Erhalte Konversation |
| `/api/messages/:convId`      |    `POST`    | Schicke Nachricht/Update Konversation |
| `/api/messages/:convId`      |   `DELETE`   |                   Lösche Konversation |
| `/api/messages/user/:userId` |    `GET`     |     Erhalte alle Nachrichten vom User |

### Nachrichten Felder in der Datenbank

| Feld         |       Typ       |               Beschreibung |
| ------------ | :-------------: | -------------------------: |
| senderId     | mongoose.userid |      automatisch generiert |
| senderName   |     string      |      automatisch generiert |
| recieverId   | mongoose.userid |                  Notwendig |
| recieverName |     string      |      automatisch generiert |
| message      |     string      |                  Notwendig |
| createdAt    |      Datum      | Wird automatisch generiert |
| updatedAt    |      Datum      | Wird automatisch generiert |
| group        |     string      |                   Optional |

### Konversation Felder in der Datenbank

| Feld       |         Typ         |                                                   Beschreibung |
| ---------- | :-----------------: | -------------------------------------------------------------: |
| recipients |   array of userid   |                   Wird automatisch gesetzt (nicht veränderbar) |
| messages   | arrray of MessageID |                  Neue Nachrichten werden automatisch eingefügt |
| createdAt  |        Datum        |                                     Wird automatisch generiert |
| updatedAt  |        Datum        |                                     Wird automatisch generiert |
| readAt     |        Datum        | Zeigt an wann die Konversation das letzte mal aufgerufen wurde |
| topic      |       string        |                                                       Optional |
| group      |       string        |                                                       Optional |

Bei ungelesen Nachrichten ist der Zeitstempel updatedAt neuer als readAt und der Sender der Nachricht ist nicht der gerade eingeloggte Benutzer
updatedAt > readAt und Sender der letzten Nachricht != Gerade eingeloggter Benutzer

### requestPasswordReset route

| Feld |  Typ   |   Beschreibung |
| ---- | :----: | -------------: |
| mail | string | Mail des Users |

### resetPassword route

| Feld     |       Typ       |           Beschreibung |
| -------- | :-------------: | ---------------------: |
| userId   | mongoose.userid |           ID des Users |
| token    |     string      | Token zum zurücksetzen |
| password |     string      |         Neues Passwort |

### registration activate route

| Feld   |       Typ       |           Beschreibung |
| ------ | :-------------: | ---------------------: |
| userId | mongoose.userid |           ID des Users |
| token  |     string      | Token zum zurücksetzen |
