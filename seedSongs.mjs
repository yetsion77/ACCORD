import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, set } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyB0aUyP6ctSwVYF8krHB0TuYkh14VVAeZU",
    authDomain: "accord-a9b7f.firebaseapp.com",
    databaseURL: "https://accord-a9b7f-default-rtdb.europe-west1.firebasedatabase.app/",
    projectId: "accord-a9b7f",
    storageBucket: "accord-a9b7f.firebasestorage.app",
    messagingSenderId: "433337752471",
    appId: "1:433337752471:web:e2abc953655c74259b82d2",
    measurementId: "G-BKSJY6494W"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const newSong = {
    title: 'אל בורות המים',
    lyricist: 'נעמי שמר',
    composer: 'נעמי שמר',
    content: `מאהב[Am]תי
הלכ[Dm]תי אל [Am]בורות המ[E7]ים
בדר[Am]כי מדבר
בארץ [Dm]לא [Am]זרו[E7]עה
מאהב[Am]תי
שכח[D]תי [F]עיר ו[E]בית
וב[F]עקבו[Am]תיך
בנהיה [E7]פרו[Am]עה[G7]

[C]אל בורות המים, אל בורות המים [Dm][Bm7b5]
[Am]אל המעי[Dm]ן אשר פועם ב[G]הר[G7]
[C]שם אהבתי [Dm]תמצא ע[Bm7b5]דין
מי מ[Am]בוע
[Dm]מי תה[Bm7b5]ום
[Am]ומי [E7]נהר`
};

const songsRef = ref(db, 'songs');
const newSongPush = push(songsRef);
set(newSongPush, newSong).then(() => {
    console.log("Song added successfully!");
    process.exit(0);
}).catch((error) => {
    console.error("Error adding song:", error);
    process.exit(1);
});
