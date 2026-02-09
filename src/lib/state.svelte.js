import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query } from "firebase/firestore";
import { db } from "./firebase";

export class TaskStore {
    tasks = $state([]);
    loading = $state(true);
    error = $state(null);
    unsub = null;

    constructor() {
        if (typeof window !== 'undefined') {
            this.init();
        }
    }

    init() {
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

    async updateTask(id, updatedData) {
        try {
            const taskRef = doc(db, "tareas", id);
            await updateDoc(taskRef, updatedData);
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
