# JSProjects
Repository where the different projects of the subject of Architecture and Programming of Systems on the Internet will be uploaded.
## 📝 Notes
Virtual notes manager.
#### Add Note
Add a note with information such as the title, content and author. It is assigned a random UUID for better identification. The process of add a note would be done by using this command in the terminal:
```js
npm start -- add --title="<title>" --body="<body>" --author="<author>"
```
#### Read Note
Show a specific note searched for its UUID.
The process of read a note would be done by using this command in the terminal:
```js
npm start -- read --uuid="<uuid>"
```
#### List Notes
Show all note's titles.
The process of list all note's titles would be done by using this command in the terminal:
```js
npm start -- list
```
#### Remove Note
Remove a specific note searched for its UUID.
The process of remove a note would be done by using this command in the terminal:
```js
npm start -- remove --uuid="<uuid>"
```
## 🥒 RickAndMorty
Information about Rick and Morty's characters througth [RickAndMorty's API](https://rickandmortyapi.com/).
#### List character's name
List every character wich contains the name introduced at selected API's page.
Search characters by using this command in terminal:
```js
npm start -- list --page=<page> --search="<name>"
```
#### List alive and dead characters
List every character with selected status at selected API's page.
Show characters by using this commmands in terminal:
```js
npm start -- list --page=<page> --status="alive"
```
```js
npm start -- list --page=<page> --status="dead"
```
#### Show character's information
Introduce an specific character to show this information: Name, Status (Dead or Alive), Species, Gender, Origin and Location.
Show information by using this command in terminal:
```js
npm start -- view --page=<page> --name="<name>"
```
## ⛅ WeatherApp
Weather info througth [MapBox](https://docs.mapbox.com/api/search/#geocoding) and [DarkSky's API](https://darksky.net/dev).
#### Search
Search a location by using this command in terminal:
```js
npm start -- search --location="<location>"
```
Program show a list with index of the different locations with the same name.
Then, user have to choose wich temperature location wants to know by using this commando in the terminal:
```js
npm start -- search --location="<location>" --index=<index>
```
Program will show the actual temperature of the choosen location.
