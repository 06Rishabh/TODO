import { useEffect, useState,useCallback } from 'react';
import update from 'immutability-helper';
import { Button, Col, Row, Spinner } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import { Note as NoteModel } from '../models/note';
import * as NotesApi from "../network/notes_api";
import styles from "../styles/NotesPage.module.css";
import styleUtils from "../styles/utils.module.css";
import AddEditNoteDialog from "./AddEditNoteDialog";
import Note from './Note';



const NotesPageLoggedInView = () => {

    const [notes, setNotes] = useState<NoteModel[]>([]);
    const [notesLoading, setNotesLoading] = useState(true);
    const [showNotesLoadingError, setShowNotesLoadingError] = useState(false);

    const [showAddNoteDialog, setShowAddNoteDialog] = useState(false);
    const [noteToEdit, setNoteToEdit] = useState<NoteModel | null>(null);
    const moveNote = useCallback((dragIndex: number, hoverIndex: number) => {
        setNotes((prevCards: NoteModel[]) =>
          update(prevCards, {
            $splice: [
              [dragIndex, 1],
              [hoverIndex, 0, prevCards[dragIndex] as NoteModel],
            ],
          }),
        )
      }, [])
  
      const renderNote = useCallback(
        (note: { _id: string ,title: string, createdAt: string,updatedAt: string,}, index: number) => {
          return (
         <Col key={note._id}>
                    <Note
                        moveNote={moveNote}
                        index={index}
                        note={note}
                        className={styles.note}
                        onNoteClicked={setNoteToEdit}
                        onDeleteNoteClicked={deleteNote}
                    />
                </Col>
          )
        },
        [],
      )
    useEffect(() => {
        async function loadNotes() {
            try {
                setShowNotesLoadingError(false);
                setNotesLoading(true);
                const notes = await NotesApi.fetchNotes();
                setNotes(notes);
            } catch (error) {
                console.error(error);
                setShowNotesLoadingError(true);
            } finally {
                setNotesLoading(false);
            }
        }
        loadNotes();
    }, []);

    async function deleteNote(note: NoteModel) {
        try {
            await NotesApi.deleteNote(note._id);
            setNotes(notes.filter(existingNote => existingNote._id !== note._id));
        } catch (error) {
            console.error(error);
            alert(error);
        }
    }

    const notesGrid =
        <Row xs={1} md={2} xl={3} className={`g-4 ${styles.notesGrid}`}>
            {notes.map((note, i) => renderNote(note, i))}
            {/* {notes.map(note => (
                <Col key={note._id}>
                    <Note
                        note={note}
                        className={styles.note}
                        onNoteClicked={setNoteToEdit}
                        onDeleteNoteClicked={deleteNote}
                    />
                </Col>
            ))} */}
        </Row>

    return (
        <>
            <Button
            variant='dark'
                className={`mb-4 ${styleUtils.blockCenter} ${styleUtils.flexCenter}`}
                onClick={() => setShowAddNoteDialog(true)}>
                <FaPlus />
                Add new note
            </Button>
            {notesLoading && <Spinner animation='border' variant='primary' />}
            {showNotesLoadingError && <p>Something went wrong. Please refresh the page.</p>}
            {!notesLoading && !showNotesLoadingError &&
                <>
                    {notes.length > 0
                        ? notesGrid
                        : <p>You don't have any notes yet</p>
                    }
                </>
            }
            {showAddNoteDialog &&
                <AddEditNoteDialog
                    onDismiss={() => setShowAddNoteDialog(false)}
                    onNoteSaved={(newNote) => {
                        setNotes([...notes, newNote]);
                        setShowAddNoteDialog(false);
                    }}
                />
            }
            {noteToEdit &&
                <AddEditNoteDialog
                    noteToEdit={noteToEdit}
                    onDismiss={() => setNoteToEdit(null)}
                    onNoteSaved={(updatedNote) => {
                        setNotes(notes.map(existingNote => existingNote._id === updatedNote._id ? updatedNote : existingNote));
                        setNoteToEdit(null);
                    }}
                />
            }
        </>
    );
}

export default NotesPageLoggedInView;