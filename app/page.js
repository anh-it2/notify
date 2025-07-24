'use client'

import { useCallback, useEffect, useRef, useState } from "react";
import { app, db } from "./lib/firebase";
import {getMessaging, getToken, onMessage} from 'firebase/messaging'
import { collection, onSnapshot } from "firebase/firestore";

export default function Home() {

  const [notify, setNotify] = useState([])
  const [show, setShow] = useState(false)
  const [lastDoc, setLastDoc] = useState(null)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [unReadCount, setUnReadCOunt] = useState(0)

    const fetchData = async () => { 
      
      setLoading(true)
      const res = await fetch(`${self.location.origin}/api/fetchNotification`,{
        method: 'POST',
        headers:{
          'Content-Type':'application/json'
        },
        body: JSON.stringify({lastDoc: lastDoc?.createdAt ?? null})
      })

      const json = await res.json()

      const data = json.data
      console.log(data)
    
      if(data.length < 4){
        setHasMore(false)
      } else{
        setLastDoc(data.lastDoc)
      }
      setNotify((prev) => [...prev,...data])
      setUnReadCOunt(data.unReadCount)
      setLoading(false)
    }

  useEffect(() => {
    let lastFetch = 0
    const unSubcribe = onSnapshot(collection(db,'notifications'),() => {
      const now = Date.now()

      if(now - lastFetch > 100){
        fetchData() 
        setLastDoc(null)
        lastFetch = now
      }
    })
    return () => unSubcribe()
  },[])

  useEffect(() =>{
    const messaging = getMessaging(app)
    generateToken(messaging)
    onMessage(messaging,async (payload) =>{
      const {title, body} = payload.notification 
      const icon = payload.notification.icon ?? null
      const image = payload.notification.image ?? null

      await fetch(`${self.location.origin}/api/saveNotification`,{
        method:'POST',
        headers:{
          'Content-Type':'application/json'
        },
        body: JSON.stringify({
          title: title,
          body: body,
          icon: icon,
          image: image
        })
      })
    })
  },[])

  const observer = useRef()
  const scrollContainerRef = useRef()

  const lastElement = useCallback(node => {
    if(loading || !node) return
    if(observer.current) observer.current.disconnect()
    
    observer.current = new IntersectionObserver(entries => {
      if(entries[0].isIntersecting && hasMore){
        fetchData()
      }
    },{
      root: scrollContainerRef.current,
      rootMargin: '0px',
      threshold: 1.0
    })

    observer.current.observe(node)
  })

  return (
    <div>
    <button onClick={() => setShow(!show)}>click me to show notification {unReadCount}</button>
    {show &&<div className="notifications" ref={scrollContainerRef}>
      {[...notify]
      .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((message, index) => (
        <div key={index} ref={index === notify.length - 1 ? lastElement : null}>
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

