import { db } from "@/app/lib/firebase"
import { collection, getDoc, limit, orderBy, query, startAfter } from "firebase/firestore"
import { NextResponse } from "next/server"

export async function POST(req) {
    const request = await req.json()
    const {lastDoc} = request.lastDoc

    let q
    if(lastDoc){
        q = query(
            collection(db,'notifications'),
            orderBy('createdAt','desc'),
            startAfter(lastDoc),
            limit(4)
        )
    }else{
        q = query(
            collection(db,'notifications'),
            orderBy('createdAt', 'desc'),
            limit(4)
        )
    }

    const querySnapshot = getDoc(q)
    const doc = querySnapshot.docs.map((doc) => doc.data())
    const newLastDoc = querySnapshot.docs.at(-1)

    return NextResponse.json({
        success: true,
        data: doc,
        lastDoc: newLastDoc
    })
}