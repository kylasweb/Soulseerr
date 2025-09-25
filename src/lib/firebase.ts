// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
    getAuth,
    GoogleAuthProvider,
    FacebookAuthProvider,
    TwitterAuthProvider,
    GithubAuthProvider,
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User as FirebaseUser
} from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBQySBLINbgpfQiLLHvCUu53Gcp_YeDcfc",
    authDomain: "agileflow-etv98.firebaseapp.com",
    projectId: "agileflow-etv98",
    storageBucket: "agileflow-etv98.firebasestorage.app",
    messagingSenderId: "551463824538",
    appId: "1:551463824538:web:bef82f7994172514528323"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Configure auth providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

export const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope('email');

export const twitterProvider = new TwitterAuthProvider();

export const githubProvider = new GithubAuthProvider();
githubProvider.addScope('user:email');

// Social login functions
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signInWithFacebook = () => signInWithPopup(auth, facebookProvider);
export const signInWithTwitter = () => signInWithPopup(auth, twitterProvider);
export const signInWithGithub = () => signInWithPopup(auth, githubProvider);

// Sign out function
export const signOut = () => firebaseSignOut(auth);

// Auth state listener
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

export type { FirebaseUser };
export default app;