import { useState, useRef } from "react";
import './App.css';
//sdk
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
//hooks
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

//firebase config
firebase.initializeApp({
  apiKey: "AIzaSyCG-birdzq_ZfHW-931IMLdVCowdvw0Xb4",
  authDomain: "my-chatroom-afc5d.firebaseapp.com",
  projectId: "my-chatroom-afc5d",
  storageBucket: "my-chatroom-afc5d.appspot.com",
  messagingSenderId: "782186356615",
  appId: "1:782186356615:web:fd62323730018f02193d22"
})

//init
const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <SignOut />
        <h1>Jinzhou's chatroom</h1>
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {

  const signIn = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }
  return (
    <div class="wrapper">
      <a href="#" onClick={signIn}><span>Sign in with Google</span></a>
    </div>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button class="signOutBtn" onClick={() => auth.signOut()}>&laquo; </button>
  )
}

function ChatRoom() {
  const msgRef = firestore.collection('messages');
  const query = msgRef.orderBy('createdAt').limitToLast(25);

  //message history feed: a hook listening to data
  const [msgs] = useCollectionData(query, { idField: 'id' });
  //send new msg
  const [newMsg, setNewMsg] = useState('');
  // back to the lastest
  const lastest = useRef();

  //write new msg to firebase
  const sendMsg = async (e) => {
    e.preventDefault(); //stop refresh the page when submitting

    const { uid, photoURL, displayName } = auth.currentUser;//get what needs to be stored
    
    await msgRef.add({
      text: newMsg,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
      displayName
    })

    //reset the text and place
    setNewMsg('');
    lastest.current.scrollIntoView({ bahavior: 'smooth' });

  }
  return (
    <>
    <main>
        ✨
        {msgs && msgs.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <span ref={lastest}></span>
    </main>

    <form onSubmit={sendMsg}>
      <input value={newMsg} onChange={(e) => setNewMsg(e.target.value)} />
      <button class="sendBtn" type="submit" disabled={!newMsg}>🚀</button>
    </form>
    </>
  )
}

function ChatMessage(props) {
  const { text, uid, photoURL, displayName } = props.message;

  const sender = uid === auth.currentUser.uid ? 'me' : 'others';

  return (
    <>
    <div className={`message ${sender}`}>
      <div>
        <div className="name">{displayName}</div>
        <img src={photoURL} alt="profile"/>
      </div>
      <p className="bubble">{text}</p>
    </div>
    </>
  )
}

export default App;
