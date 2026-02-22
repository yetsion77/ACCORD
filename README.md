# ACCORD - Chord Notation App

A premium web application for musicians to manage lead sheets, transpose chords, and perform with auto-scroll.

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Firebase Configuration**:
   - Go to your [Firebase Console](https://console.firebase.google.com/).
   - Create a new project and add a Web App.
   - Copy the `firebaseConfig` object.
   - Paste it into `src/firebase.js`.
   - Enable **Realtime Database** in the console and ensure the rules allow read/write (for development).

3. **Run Locally**:
   ```bash
   npm run dev
   ```

## Usage Tips

- **Chord Format**: Use brackets before the word: `[G]Hello [D]World`.
- **Transposition**: Use the Tone controls in the Live View to shift keys instantly.
- **Auto-scroll**: Click the Play button in the bottom floating bar during Live View to start scrolling. Use +/- to adjust speed.

## Tech Stack

- React 19
- Vite
- Tailwind CSS
- Firebase (Realtime Database)
- Lucide React (Icons)
