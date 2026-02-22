const NOTES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

/**
 * Transposes a single chord by a given number of semitones.
 * Handles major, minor, 7th, etc. (e.g., Cm7, Gsus4)
 */
export function transposeChord(chord, semitones) {
    if (!chord) return '';

    // Regular expression to find the note part and the modifier (m, 7, sus4, etc.)
    const match = chord.match(/^([A-G][#b]?)(.*)/);
    if (!match) return chord;

    const note = match[1];
    const modifier = match[2];

    let index = NOTES_SHARP.indexOf(note);
    if (index === -1) index = NOTES_FLAT.indexOf(note);
    if (index === -1) return chord;

    let newIndex = (index + semitones) % 12;
    while (newIndex < 0) newIndex += 12;

    // Choose scale based on common musical preference for certain keys
    // For now, simple logic: use flats for Eb, Ab, Bb etc.
    const flatKeys = [1, 3, 6, 8, 10]; // Db, Eb, Gb, Ab, Bb
    const scale = flatKeys.includes(newIndex) ? NOTES_FLAT : NOTES_SHARP;

    return scale[newIndex] + modifier;
}

/**
 * Parses raw text with bracketed chords e.g. "[C]Hello [G]world"
 * into a structured array of lines, where each line has parts with/without chords.
 */
export function parseSong(text) {
    if (!text) return [];

    const lines = text.split('\n');
    return lines.map(line => {
        const parts = [];
        const regex = /\[([^\]]+)\]/g;
        let match;
        let lastIndex = 0;

        while ((match = regex.exec(line)) !== null) {
            // Text before the first chord or between chords
            const leadingText = line.substring(lastIndex, match.index);
            if (leadingText) {
                // If we didn't have a chord yet, this is just plain text
                if (parts.length === 0 || parts[parts.length - 1].type !== 'group') {
                    parts.push({ type: 'text', content: leadingText });
                } else {
                    // This text belongs to the PREVIOUS chord group? 
                    // No, usually a chord [C] belongs to the text AFTER it.
                    // So leadingText here belongs to the previous part (which might be a group or plain text)
                    if (parts[parts.length - 1].type === 'group') {
                        parts[parts.length - 1].text += leadingText;
                    } else {
                        parts[parts.length - 1].content += leadingText;
                    }
                }
            }

            // Start a new group for this chord
            parts.push({
                type: 'group',
                chord: match[1],
                text: '' // This will be filled by the next iteration or the final cleanup
            });

            lastIndex = regex.lastIndex;
        }

        // Final cleanup for the last chord's text or remaining text
        const remainingText = line.substring(lastIndex);
        if (remainingText) {
            if (parts.length > 0 && parts[parts.length - 1].type === 'group') {
                parts[parts.length - 1].text = remainingText;
            } else {
                parts.push({ type: 'text', content: remainingText });
            }
        }

        // If line is empty, represent it as an empty line structure
        if (parts.length === 0) {
            parts.push({ type: 'text', content: ' ' });
        }

        return parts;
    });
}

/**
 * Transposes all chords in a structured song object.
 */
export function transposeSong(parsedSong, semitones) {
    if (semitones === 0) return parsedSong;

    return parsedSong.map(line =>
        line.map(part => {
            if (part.type === 'group') {
                return { ...part, chord: transposeChord(part.chord, semitones) };
            }
            return part;
        })
    );
}
