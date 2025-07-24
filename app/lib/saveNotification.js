import { addDoc, collection, Timestamp } from "firebase/firestore"
import { db } from "./firebase"

export const saveNotification = async (data) => {
    console.log(data)
    await addDoc(collection(db,'notifications'),{
        title: data.title,
        body: data.body,
        icon: data.icon,
        image: data.image,
        read: false,
        createdAt: Timestamp.now()
    })
}