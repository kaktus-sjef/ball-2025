import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  deleteDoc,
  doc
} from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyDy8bsgcc5fO34PUPRruMTydrQ4UmOf8fg",
  authDomain: "ball2025.firebaseapp.com",
  databaseURL: "https://ball2025-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "ball2025",
  storageBucket: "ball2025.appspot.com",
  messagingSenderId: "423532981325",
  appId: "1:423532981325:web:1535c6b0b70aca3cd90004"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {
  db,
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  deleteDoc,
  doc
};

