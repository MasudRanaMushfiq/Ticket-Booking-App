import {
  doc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  Timestamp,
  updateDoc,
  getDoc,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';

// Lock seats for 30 seconds
export const lockSeats = async (
  busId: string,
  seatLabels: string[],
  userId: string
) => {
  const expiresAt = Timestamp.fromDate(new Date(Date.now() + 60 * 1000)); // 30 seconds
  await setDoc(doc(db, `buses/${busId}/locks/${userId}`), {
    seatLabels,
    lockedAt: Timestamp.now(),
    expiresAt,
  });
};

// Get all locked seats that are not expired yet
export const getLockedSeats = async (busId: string): Promise<string[]> => {
  const q = collection(db, `buses/${busId}/locks`);
  const snapshot = await getDocs(q);
  const results: string[] = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    if (data.expiresAt?.toDate() > new Date()) {
      results.push(...data.seatLabels);
    }
  });

  return results;
};

// Unlock seats (remove lock document)
export const unlockSeats = async (busId: string, userId: string) => {
  await deleteDoc(doc(db, `buses/${busId}/locks/${userId}`));
};

// Update locked seats for user (e.g. extend or modify seatLabels)
export const updateLockedSeats = async (
  busId: string,
  userId: string,
  newSeats: string[]
) => {
  const seatLockRef = doc(db, 'buses', busId, 'locks', userId);
  await updateDoc(seatLockRef, {
    seatLabels: newSeats,
  });
};

// Confirm booking: add seats to bookedSeats array and unlock
export const confirmBooking = async (
  busId: string,
  userId: string,
  seatLabels: string[],
  bookingData: any
) => {
  const busRef = doc(db, 'buses', busId);
  const busSnap = await getDoc(busRef);
  if (!busSnap.exists()) throw new Error('Bus not found');

  const existing: string[] = busSnap.data().bookedSeats || [];
  seatLabels.forEach((s) => {
    if (existing.includes(s)) throw new Error(`${s} already booked`);
  });

  await updateDoc(busRef, { bookedSeats: arrayUnion(...seatLabels) });
  await unlockSeats(busId, userId);

  // Optionally store booking data under user tickets collection
  await setDoc(doc(db, `users/${userId}/tickets/${Date.now()}`), bookingData);
};
