// firebase-config.js

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyA0DrFYD_CQ2j5iB_qwUUc7hueuAesosfU',
  authDomain: 'time-estimator-1618c.firebaseapp.com',
  projectId: 'time-estimator-1618c',
  storageBucket: 'time-estimator-1618c.firebasestorage.app',
  messagingSenderId: '562303848957',
  appId: '1:562303848957:web:29a1f4b373b56abfea8994',
  measurementId: 'G-YZNQ0PNFX2',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
