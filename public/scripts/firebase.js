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
// Okay everything after this is my code. I don't know what the above does, but it works. Don't touch it
import {getFirestore,doc,collection,getDoc,getDocs,addDoc,setDoc,updateDoc,serverTimestamp,query,orderBy,limit,startAfter,documentId} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";
import {getAuth,createUserWithEmailAndPassword,signInWithEmailAndPassword,signOut,onAuthStateChanged,updateProfile} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";
let database;
let auth;
export function load(){
    console.log("Firebase loading...");
    const app=initializeApp(firebaseConfig);
    database=getFirestore(app);
    auth=getAuth(app);
    console.log("Firebase loaded");
    return [app,database];
};
function usernameEmail(username){
    const name=username.trim().toLowerCase();
    if(!/^[a-z0-9_]{3,20}$/.test(name)){throw new Error("Username must be 3-20 characters and contain only letters, numbers, and underscores.");}
    return `${name}@poisonfrog.invalid`;
}
export async function register(username,password){
    const credential=await createUserWithEmailAndPassword(auth,usernameEmail(username),password);
    await updateProfile(credential.user,{displayName:username.trim()});
    return credential.user;
}
export async function login(username,password){
    const credential=await signInWithEmailAndPassword(auth,usernameEmail(username),password);
    return credential.user;
}
export function onLogin(callback){return onAuthStateChanged(auth,callback);}
export async function logout(){await signOut(auth);}
export function getTimestamp(){return serverTimestamp();};
export async function read(path){
    const snapshot=await getDoc(doc(database,path));
    return snapshot.exists()?{...snapshot.data(),id:snapshot.id}:null;
};
export async function create(path,id,data){
    return await setDoc(doc(database,path,id),data);
};
export async function write(path,data){
    const reference=await addDoc(collection(database,path),data);
    return reference.id;
};
export async function update(path,data){
    await updateDoc(doc(database,path),data);
};
export async function getReadable(path,pageSize=20,cursor=null){
    const constraints=[orderBy("timestamp","desc"),orderBy(documentId()),limit(pageSize)];
    if(cursor){constraints.push(startAfter(cursor));};
    const snapshot=await getDocs(query(collection(database,path),...constraints));
    console.log("Fetched:",snapshot.docs.length);
    console.log("Message IDs:",snapshot.docs.map(d=>d.id));
    return{
        items:snapshot.docs.map(item=>({...item.data(),id:item.id})),
        nextCursor:snapshot.docs.length===pageSize?snapshot.docs.at(-1):null
    };
};
