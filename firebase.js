import { initializeApp, getApp, getApps } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"


const firebaseConfig = {
    apiKey: "AIzaSyD9s1bvhxZDOHvoq1R9lvYIy7gvpAkIhIY",
    authDomain: "twitter-001.firebaseapp.com",
    projectId: "twitter-001",
    storageBucket: "twitter-001.appspot.com",
    messagingSenderId: "18248016854",
    appId: "1:18248016854:web:c868813f8d452289eb3a77"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const db = getFirestore()
const storage = getStorage()

export default app
export { db, storage }
