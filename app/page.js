'use client'

import Image from "next/image";
import { useEffect, useState } from "react";
import { app, db } from "./lib/firebase";
import {getMessaging, getToken, onMessage} from 'firebase/messaging'
import { saveNotification } from "./lib/saveNotification";
import { fetNotification } from "./lib/fetchNotification";
import { notifications } from "./api/saveNotification/route";
import { collection, onSnapshot } from "firebase/firestore";


export default function Home() {

  const [notify, setNotify] = useState([])
  const [shouldFetch, setShouldFetch] = useState(false)
  const [show, setShow] = useState(false)
  const [lastDoc, setLastDoc] = useState(null)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    const unSubcribe = onSnapshot(collection(db,'notifications'),() => {
      setShouldFetch(true)
      // setLastDoc(null)
    })
    return () => unSubcribe()
  },[])

  useEffect(() =>{
    if(!shouldFetch) return
    const fetchData = async () => { 
      // setLoading(true)
      const data = await fetNotification()
      setNotify(data)
      setShouldFetch(false)
      // setLoading(false)
    }
    fetchData()
  },[shouldFetch])

  useEffect(() =>{
    const messaging = getMessaging(app)
    generateToken(messaging)
    onMessage(messaging,(payload) =>{
      console.log(payload)
      const {title, body} = payload.notification 
      const icon = payload.notification.icon ?? null
      const image = payload.notification.image ?? null
      const data = {title, body, icon, image}
      saveNotification(data)
      setNotify((prev) => [...prev, data])
    })
  },[])

  return (
    <div>
    <button onClick={() => setShow(!show)}>click me to show notification</button>
    {show &&<div className="notifications">
      {[...notify]
      .sort((a,b) => b.createdAt.toDate() - a.createdAt.toDate())
      .map((message, index) => (
        <div key={index}>
          <div>{message.title}</div>
          <div>{message.body}</div>
          {message.image? <img src={message.image} width={60} height={60} alt="icon" /> : <div>loading</div>}
        </div>
      ))}
    </div>}
    </div>
  )
}

async function generateToken(messaging) {
  const permisson = await Notification.requestPermission()
  console.log(permisson)

  if(permisson === 'granted'){
    const token = await getToken(messaging,{
      vapidKey: process.env.FIREBASE_VAPIDKEY
    })
    console.log(token)
  }
}
