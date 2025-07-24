
import { db } from "@/app/lib/firebase"
import { addDoc, collection, Timestamp } from "firebase/firestore"
import { NextResponse } from "next/server"

export async function POST(request) {
    try {
        const data = await request.json()
        console.log(data.title)
        await addDoc(collection(db,'notifications'),{
                title: data.title,
                body: data.body,
                icon: data.icon,
                image: data.image,
                read: false,
                createdAt: Timestamp.now()
    })
    return NextResponse.json('success')
    } catch (error) {
        console.error("🔥 Error in /api/saveNotification:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Unknown error" },
            { status: 500 }
        );
        
    }
}