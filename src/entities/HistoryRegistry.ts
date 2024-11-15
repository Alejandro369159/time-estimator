import type { QueryDocumentSnapshot } from 'firebase/firestore'

export type HistoryRegistry = {
  id?: string
  taskDificulty: number
  taskCompletitionTimeInMinutes: number
  authorId: string
  memberId: string
  createdAt: Date
}

export function registryFromFirestore(doc: QueryDocumentSnapshot): HistoryRegistry {
  return {
    id: doc.id,
    authorId: doc.data().authorId,
    memberId: doc.data().memberId,
    taskDificulty: doc.data().taskDificulty,
    taskCompletitionTimeInMinutes: doc.data().taskCompletitionTimeInMinutes,
    createdAt: doc.data().createdAt.toDate(),
  }
}
