import { initializeApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyCQAVWXlerNtqD5ZkuHZMBiSj1nNmjuIdw',
  authDomain: 'idolypride-spotlight.firebaseapp.com',
  projectId: 'idolypride-spotlight',
  storageBucket: 'idolypride-spotlight.appspot.com',
  messagingSenderId: '165203233082',
  appId: '1:165203233082:web:5004b5427ef1023582e803',
  measurementId: 'G-CVMRENHL3H',
}

const compatAuth = {
  currentUser: null,
  onIdTokenChanged: (_: never) => () => {
    // nope
  },
} as Auth

export default defineNuxtPlugin(() => ({
  provide: {
    auth: process.client ? getAuth(initializeApp(firebaseConfig)) : compatAuth,
  },
}))
