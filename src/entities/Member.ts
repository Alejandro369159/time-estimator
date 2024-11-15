import type { QueryDocumentSnapshot } from 'firebase/firestore'

export type Member = {
  id?: string
  name: string
  authorId: string
}

export function memberFromFirestore(doc: QueryDocumentSnapshot): Member {
  return {
    id: doc.id,
    name: doc.data().name,
    authorId: doc.data().authorId,
  }
}

// Todo => quiza agregarles createdAt
