import { ConflictError, UnauthorizedError } from "../errors/http_errors";
import { Note } from "../models/note";
import { User } from "../models/user";

async function fetchData(input: RequestInfo, init?: RequestInit) {
    const response = await fetch(input, init);
    // console.log(response);
    if (response.ok) {
        return response;
    } else {
        const errorBody = await response.json();
        const errorMessage = errorBody.error;
        if (response.status === 401) {
            throw new UnauthorizedError(errorMessage);
        } else if (response.status === 409) {
            throw new ConflictError(errorMessage);
        } else {
            throw Error("Request failed with status: " + response.status + " message: " + errorMessage);
        }
    }
}

export async function getLoggedInUser(): Promise<User> {
    const response = await fetchData("https://todo-plum-iota.vercel.app/api/users", { method: "GET", credentials: 'include' });
    // console.log(response);
    return response.json();
}

export interface SignUpCredentials {
    username: string,
    email: string,
    password: string,
}

export async function signUp(credentials: SignUpCredentials): Promise<User> {
    const response = await fetchData("https://todo-plum-iota.vercel.app/api/users/signup",
        {
            method: "POST",
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(credentials),
        });
    return response.json();
}

export interface LoginCredentials {
    username: string,
    password: string,
}

export async function login(credentials: LoginCredentials): Promise<User> {
    const response = await fetchData("https://todo-plum-iota.vercel.app/api/users/login",
        {
            method: "POST",
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(credentials),
        });
        console.log(response);
    return response.json();
}

export async function logout() {
    await fetchData("https://todo-plum-iota.vercel.app/api/users/logout", { method: "POST" });
}

export async function fetchNotes(): Promise<Note[]> {
    const response = await fetchData("https://todo-plum-iota.vercel.app/api/notes", { method: "GET", credentials: 'include' });
    return response.json();
}

export interface NoteInput {
    title: string,
    text?: string,
}

export async function createNote(note: NoteInput): Promise<Note> {
    const response = await fetchData("https://todo-plum-iota.vercel.app/api/notes",
        {
            method: "POST",
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(note),
        });
    return response.json();
}

export async function updateNote(noteId: string, note: NoteInput): Promise<Note> {
    const response = await fetchData("https://todo-plum-iota.vercel.app/api/notes/" + noteId,
        {
            method: "PATCH",
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(note),
        });
    return response.json();
}

export async function deleteNote(noteId: string) {
    await fetchData("https://todo-plum-iota.vercel.app/api/notes/" + noteId, { method: "DELETE", credentials: 'include' });
}