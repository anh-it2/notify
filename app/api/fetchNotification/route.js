import { db } from "@/app/lib/firebase"
import { collection, getCountFromServer, getDocs, limit, orderBy, query, startAfter, Timestamp, where } from "firebase/firestore"
import { NextResponse } from "next/server"

export async function POST(req) {
    const request = await req.json()
    const {lastDoc} = request

    let q
    if(lastDoc){
        const lastTimestamp = Timestamp.fromMillis(lastDoc)
        q = query(
            collection(db,'notifications'),
            orderBy('createdAt','desc'),
            startAfter(lastTimestamp),
            limit(4)
        )
    }else{
        q = query(
            collection(db,'notifications'),
            orderBy('createdAt', 'desc'),
            limit(4)
        )
    }

    const querySnapshot = await getDocs(q)
    const doc = querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
            ...data,
            createdAt: data.createdAt.toMillis()
        }
    })
    const newLastDoc = querySnapshot.docs.at(-1).data().createdAt

    const countQuery = query(
        collection(db,'notifications'),
        where('read', '==', false)
    )

    const countSnap = await getCountFromServer(countQuery)
    const   unReadCount = countSnap.data().count

    return NextResponse.json({
        success:true,
        data:doc,
        lastDoc:newLastDoc,
        unReadCount
    })
}