// This code looks weird because i literally copied it from the firebase website. 
// I don't know what it does, but it works. Don't touch it
const firebaseConfig = {
  apiKey: "AIzaSyCMqC_mgnE0wOIqUkJGEnndXVihacm21Ss",
  authDomain: "poisonfrog-1f89a.firebaseapp.com",
  projectId: "poisonfrog-1f89a",
  storageBucket: "poisonfrog-1f89a.firebasestorage.app",
  messagingSenderId: "245881766424",
  appId: "1:245881766424:web:da21c28d7d7badfbe7396d",
  measurementId: "G-6D5YC79V1S"
};
import {initializeApp} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";
import {getFirestore,doc,collection,getDoc,getDocs,addDoc,updateDoc,serverTimestamp,query,orderBy,limit,startAfter,documentId} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";
// Okay everything after this is my code. I don't know what the above does, but it works. Don't touch it
let database;
export function load(){
    console.log("Firebase loading...");
    const app=initializeApp(firebaseConfig);
    database=getFirestore(app);
    console.log("Firebase loaded");
    return [app,database];
};
export function getTimestamp(){return serverTimestamp();};
export async function read(path){
    const snapshot=await getDoc(doc(database,path));
    return snapshot.exists()?{...snapshot.data(),id:snapshot.id}:null;
};
export async function write(path,data){
    const reference=await addDoc(collection(database,path),data);
    return reference.id;
};
export async function update(path,data){
    await updateDoc(doc(database,path),data);
};
export async function getReadable(path,pageSize=20,cursor=null){
    const constraints=[orderBy("createdAt","desc"),orderBy(documentId()),limit(pageSize)];
    if(cursor){constraints.push(startAfter(cursor));};
    const snapshot=await getDocs(query(collection(database,path),...constraints));
    return{
        items:snapshot.docs.map(item=>({...item.data(),id:item.id})),
        nextCursor:snapshot.docs.length===pageSize?snapshot.docs.at(-1):null
    };
};
