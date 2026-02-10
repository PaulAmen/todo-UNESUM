import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query } from "firebase/firestore";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { db, auth, googleProvider } from "./firebase";

// AUTH STORE
export class AuthStore {
    user = $state(undefined); // undefined = loading, null = not logged in
    authorizedEmail = 'amenster@gmail.com';

    constructor() {
        if (typeof window !== 'undefined') {
            onAuthStateChanged(auth, (u) => {
                if (u && u.email === this.authorizedEmail) {
                    this.user = u;
                } else {
                    if (u) signOut(auth); // Sign out if not authorized
                    this.user = null;
                }
            });
        }
    }

    async login() {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (e) {
            console.error("Login error:", e);
        }
    }

    async logout() {
        await signOut(auth);
    }
}

export const authStore = new AuthStore();

// TASK STORE
export class TaskStore {
    tasks = $state([]);
    loading = $state(true);
    error = $state(null);
    unsub = null;

    constructor() {
        // We initialize tasks only when user is authenticated in the UI component or here
    }

    init() {
        if (this.unsub) this.unsub();
        const q = query(collection(db, "tareas"));
        this.unsub = onSnapshot(q, (querySnapshot) => {
            let tempTasks = [];
            querySnapshot.forEach((doc) => {
                tempTasks.push({ id: doc.id, ...doc.data() });
            });
            this.tasks = tempTasks;
            this.loading = false;
        }, (err) => {
            console.error("Error fetching tasks:", err);
            this.error = err.message;
            this.loading = false;
        });
    }

    async addTask(task) {
        try {
            await addDoc(collection(db, "tareas"), task);
        } catch (e) {
            console.error("Error adding task: ", e);
            this.error = e.message;
        }
    }

    async updateTask(id, updatedData) {
        try {
            const taskRef = doc(db, "tareas", id);
            await updateDoc(taskRef, updatedData);
        } catch (e) {
            console.error("Error updating task: ", e);
            this.error = e.message;
        }
    }

    async toggleComplete(task) {
        try {
            const taskRef = doc(db, "tareas", task.id);
            await updateDoc(taskRef, {
                estado: task.estado === 'pending' ? 'completed' : 'pending'
            });
        } catch (e) {
            console.error("Error updating task: ", e);
            this.error = e.message;
        }
    }

    async deleteTask(id) {
         try {
            await deleteDoc(doc(db, "tareas", id));
        } catch (e) {
            console.error("Error deleting task: ", e);
            this.error = e.message;
        }
    }
}

export const taskStore = new TaskStore();