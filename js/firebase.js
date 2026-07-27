// =====================================================
// CONEXION CON FIREBASE (la nube)
// =====================================================
const firebaseConfig = {
  apiKey: "AIzaSyB97uxKRLvXWkY7VRTXykwWmmJwAX1SaXk",
  authDomain: "arepotascon.firebaseapp.com",
  projectId: "arepotascon",
  storageBucket: "arepotascon.firebasestorage.app",
  messagingSenderId: "77320481330",
  appId: "1:77320481330:web:75b53c4bde602926b2aa2b"
};

// Inicializamos Firebase
firebase.initializeApp(firebaseConfig);

// Referencia a la base de datos Firestore (la nube)
const dbFirebase = firebase.firestore();

// Permite que la app funcione un rato sin internet y sincronice despues
dbFirebase.enablePersistence({ synchronizeTabs: true }).catch(function () {});