import { getDocs, collection, query, orderBy, startAfter, limit } from "firebase/firestore"
import { db } from "./firebase"

export const fetNotification = async (lastDoc) => {
    // const querySnapshot =  await getDocs(collection(db,'notifications'))
    // return querySnapshot.docs.map((doc) => doc.data())
    
    let q

    if(lastDoc){
        q = query(
            collection(db,'notifications'),
            orderBy('createdAt', 'desc'),
            startAfter(lastDoc),
            limit(4)
        )
    } else{
        q = query(
            collection(db,'notifications'),
            orderBy('createdAt', 'desc'),
            limit(4)
        )
    }

    const querySnapshot = await getDocs(q);
    const newLastDoc = querySnapshot.docs.at(-1)
    const data =  querySnapshot.docs.map((doc) => doc.data())
    return { data, lastDoc: newLastDoc }
}