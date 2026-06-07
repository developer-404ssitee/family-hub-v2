import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)

let messaging: Messaging | null = null

try {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    messaging = getMessaging(app)
  }
} catch {
  console.warn('FCM init failed')
}

export { messaging }

export async function requestNotificationPermission(): Promise<string | null> {
  if (!messaging) return null
  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return null
    const sw = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: sw,
    })
    return token
  } catch (err) {
    console.warn('FCM token error:', err)
    return null
  }
}

export function onForegroundMessage(callback: (payload: any) => void) {
  if (!messaging) return () => {}
  return onMessage(messaging, callback)
}
