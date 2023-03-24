import { useRef } from "react";
import type { Identifier, XYCoord } from 'dnd-core'
import styles from "../styles/Note.module.css";
import styleUtils from "../styles/utils.module.css";
import { Card } from "react-bootstrap";
import { Note as NoteModel } from "../models/note";
import { formatDate } from "../utils/formatDate";
import { MdDelete } from "react-icons/md";
import { useDrag, useDrop } from 'react-dnd'


import { ItemTypes } from './ItemTypes'
interface NoteProps {
    moveNote: (dragIndex: number, hoverIndex: number) => void,
    index: number,
    note: NoteModel,
    onNoteClicked: (note: NoteModel) => void,
    onDeleteNoteClicked: (note: NoteModel) => void,
    className?: string,
}

interface DragItem {
    index: number
    id: string
    type: string
  }

  
const style = {
    cursor: 'move',
  }
const Note = ({ note, onNoteClicked, onDeleteNoteClicked,index,moveNote ,className }: NoteProps) => {
    const ref = useRef<HTMLDivElement>(null)
    const [{ handlerId }, drop] = useDrop<
      DragItem,
      void,
      { handlerId: Identifier | null }
    >({
      accept: ItemTypes.NOTE,
      collect(monitor) {
        return {
          handlerId: monitor.getHandlerId(),
        }
      },
      hover(item: DragItem, monitor) {
        if (!ref.current) {
          return
        }
        const dragIndex = item.index
        const hoverIndex = index
  
        // Don't replace items with themselves
        if (dragIndex === hoverIndex) {
          return
        }
  
        // Determine rectangle on screen
        const hoverBoundingRect = ref.current?.getBoundingClientRect()
  
        // Get vertical middle
        const hoverMiddleY =
          (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
  
        // Determine mouse position
        const clientOffset = monitor.getClientOffset()
  
        // Get pixels to the top
        const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top
  
        // Only perform the move when the mouse has crossed half of the items height
        // When dragging downwards, only move when the cursor is below 50%
        // When dragging upwards, only move when the cursor is above 50%
  
        // Dragging downwards
        if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
          return
        }
  
        // Dragging upwards
        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
          return
        }
  
        // Time to actually perform the action
        moveNote(dragIndex, hoverIndex)
  
        // Note: we're mutating the monitor item here!
        // Generally it's better to avoid mutations,
        // but it's good here for the sake of performance
        // to avoid expensive index searches.
        item.index = hoverIndex
      },
    })
  
 
    const {
        _id,
        title,
        text,
        createdAt,
        updatedAt
    } = note;

    let createdUpdatedText: string;
    if (updatedAt > createdAt) {
        createdUpdatedText = "Updated: " + formatDate(updatedAt);
    } else {
        createdUpdatedText = "Created: " + formatDate(createdAt);
    }
    const [{ isDragging }, drag] = useDrag({
        type: ItemTypes.NOTE,
        item: () => {
          return { _id, index }
        },
        collect: (monitor: any) => ({
          isDragging: monitor.isDragging(),
        }),
      })
    
      const opacity = isDragging ? 0 : 1
      drag(drop(ref))
    return (
        <Card
        ref={ref}
        style={{ ...style, opacity }}
            className={`${styles.noteCard} ${className}`}
            data-handler-id={handlerId}
            onClick={() => onNoteClicked(note)}>
            <Card.Body className={styles.cardBody}>
                <Card.Title className={styleUtils.flexCenter}>
                    {title}
                    <MdDelete
                        className="text-muted ms-auto"
                        style={{cursor: "pointer"}}
                        onClick={(e) => {
                            onDeleteNoteClicked(note);
                            e.stopPropagation();
                            // window.location.reload();
                        }}
                    />
                </Card.Title>
                <Card.Text className={styles.cardText}>
                    {text}
                </Card.Text>
            </Card.Body>
            <Card.Footer className="text-muted">
                {createdUpdatedText}
            </Card.Footer>
        </Card>
    )
}

export default Note;