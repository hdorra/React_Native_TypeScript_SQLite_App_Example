import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, FlatList } from 'react-native';
import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase({ name: 'notes.db', location: 'default' });

export default function App() {
    const [notes, setNotes] = useState([]);
    const [activeNoteIndex, setActiveNoteIndex] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        (db).transaction((tx) => {
            tx.executeSql(
                'CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT);'
            );
        });
        fetchNotes();
    }, []);

    const fetchNotes = () => {
        db.transaction((tx) => {
            tx.executeSql('SELECT * FROM notes;', [], (tx, results) => {
                const rows = results.rows;
                const notes = [];
                for (let i = 0; i < rows.length; i++) {
                    const { id, title, description } = rows.item(i);
                    notes.push({ id, title, description });
                }
                setNotes(notes);
            });
        });
    };

    const addNote = () => {
        db.transaction((tx) => {
            tx.executeSql('INSERT INTO notes (title, description) VALUES (?, ?);', [title, description], () => {
                fetchNotes();
            });
        });
        setTitle('');
        setDescription('');
    };

    const updateNote = () => {
        if (activeNoteIndex !== null && activeNoteIndex !== undefined) {
            const { id } = notes[activeNoteIndex];
            (db.transaction as any)((tx) => {
                tx.executeSql('UPDATE notes SET title = ?, description = ? WHERE id = ?;', [title, description, id], () => {
                    fetchNotes();
                });
            });
            setTitle('');
            setDescription('');
            setActiveNoteIndex(null);
        }
    };

    const deleteNote = () => {
        if (activeNoteIndex !== null && activeNoteIndex !== undefined) {
            const { id } = notes[activeNoteIndex];
            db.transaction((tx) => {
                tx.executeSql('DELETE FROM notes WHERE id = ?;', [id], () => {
                    fetchNotes();
                });
            });
            setTitle('');
            setDescription('');
            setActiveNoteIndex(null);
        }
    };

    const renderNoteItem = ({ item, index }) => {
        const isActive = index === activeNoteIndex;
        return (
            <TouchableOpacity
                style={[styles.noteItem, isActive && styles.activeNoteItem]}
                onPress={() => {
                    setTitle(item.title);
                    setDescription(item.description);
                    setActiveNoteIndex(index);
                }}
            >
                <Text style={styles.noteTitle}>{item.title}</Text>
                <Text style={styles.noteDescription}>{item.description}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.noteList}>
                <FlatList data={notes} renderItem={renderNoteItem} keyExtractor={(item) => item.id.toString()} />
            </View>
            <View style={styles.noteEditor}>
                <TextInput
                    style={styles.noteTitleInput}
                    placeholder="Title"
                    value={title}
                    onChangeText={(text) => setTitle(text)}
                />
                <TextInput
                    style={styles.noteDescriptionInput}
                    placeholder="Description"
                    value={description}
                    onChangeText={(text) => setDescription(text)}
                />
                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={[styles.button, activeNoteIndex !== null && styles.disabledButton]}
                        onPress={addNote}
                        disabled={activeNoteIndex !== null}
                    >
                        <Text style={styles.buttonText}>Add Note</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, activeNoteIndex === null && styles.disabledButton]}
                        onPress={updateNote}
                        disabled={activeNoteIndex === null}
                    >
                        <Text style={styles.buttonText}>Update Note</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, activeNoteIndex === null && styles.disabledButton]}
                        onPress={deleteNote}
                        disabled={activeNoteIndex === null}
                    >
                        <Text style={styles.buttonText}>Delete Note</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'stretch',
        justifyContent: 'center',
        padding: 20,
    },
    noteList: {
        flex: 1,
        marginBottom: 20,
    },
    noteEditor: {
        marginBottom: 20,
    },
    noteItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    activeNoteItem: {
        backgroundColor: '#eee',
    },
    noteTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    noteDescription: {
        fontSize: 16,
    },
    noteTitleInput: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    noteDescriptionInput: {
        fontSize: 16,
        marginBottom: 10,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    button: {
        padding: 10,
        backgroundColor: '#007aff',
        borderRadius: 5,
    },
    disabledButton: {
        opacity: 0.5,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});


