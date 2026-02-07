/** Recreate Nokia Snake sound effects using Web Audio API */
export class Sound {
    constructor() {
        this.ctx = null;
    }
    ensureContext() {
        if (!this.ctx) {
            this.ctx = new AudioContext();
        }
        return this.ctx;
    }
    beep(frequency, duration, volume = 0.15) {
        try {
            const ctx = this.ensureContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "square"; // Nokia used a piezo buzzer — square wave is closest
            osc.frequency.value = frequency;
            gain.gain.setValueAtTime(volume, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + duration);
        }
        catch {
            // Audio not available — silently ignore
        }
    }
    /** Food eaten — short high beep */
    eat() {
        this.beep(800, 0.05);
        // Second beep slightly delayed for that classic "pip-pip" feel
        setTimeout(() => this.beep(1200, 0.05), 40);
    }
    /** Snake died — descending tone */
    die() {
        this.beep(400, 0.1);
        setTimeout(() => this.beep(300, 0.1), 100);
        setTimeout(() => this.beep(200, 0.15), 200);
        setTimeout(() => this.beep(100, 0.25), 350);
    }
    /** Game start jingle */
    start() {
        this.beep(523, 0.08); // C5
        setTimeout(() => this.beep(659, 0.08), 80); // E5
        setTimeout(() => this.beep(784, 0.12), 160); // G5
    }
    /** Movement tick — very subtle */
    move() {
        this.beep(200, 0.015, 0.05);
    }
    /** Menu navigation — short click */
    navigate() {
        this.beep(600, 0.03, 0.1);
    }
}
// ---- 8-bit music engine for Fancy mode ----
// Note frequencies
const NOTE = {
    C4: 262, D4: 294, E4: 330, F4: 349, G4: 392, A4: 440, B4: 494,
    C5: 523, D5: 587, E5: 659, F5: 698, G5: 784, A5: 880, B5: 988,
    C6: 1047,
    C3: 131, D3: 147, E3: 165, G3: 196, A3: 220, B3: 247,
    R: 0, // rest
};
export class Music {
    constructor() {
        this.ctx = null;
        this.isPlaying = false;
        this.schedulerTimer = 0;
        this.nextNoteTime = 0;
        this.melodyIndex = 0;
        this.bassIndex = 0;
        this.masterGain = null;
        this.scheduler = () => {
            if (!this.isPlaying || !this.ctx)
                return;
            const lookAhead = 0.15; // schedule notes 150ms ahead
            while (this.nextNoteTime < this.ctx.currentTime + lookAhead) {
                // Schedule melody note
                const melNote = Music.MELODY[this.melodyIndex];
                const melDur = melNote.eighths * Music.EIGHTH;
                this.scheduleNote(melNote.freq, this.nextNoteTime, melDur * 0.9, "square", 0.3);
                // Schedule bass note
                const bassNote = Music.BASS[this.bassIndex];
                const bassDur = bassNote.eighths * Music.EIGHTH;
                this.scheduleNote(bassNote.freq, this.nextNoteTime, bassDur * 0.9, "triangle", 0.5);
                // Advance melody
                this.nextNoteTime += melDur;
                this.melodyIndex = (this.melodyIndex + 1) % Music.MELODY.length;
                // Advance bass independently based on its own duration
                // We track bass timing separately to allow different phrase lengths
                this.bassIndex = (this.bassIndex + 1) % Music.BASS.length;
            }
        };
    }
    ensureContext() {
        if (!this.ctx) {
            this.ctx = new AudioContext();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.12;
            this.masterGain.connect(this.ctx.destination);
        }
        return this.ctx;
    }
    scheduleNote(freq, startTime, duration, type, volume) {
        if (freq === 0)
            return; // rest
        const ctx = this.ensureContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(volume, startTime);
        gain.gain.setValueAtTime(volume, startTime + duration * 0.7);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(startTime);
        osc.stop(startTime + duration);
    }
    startMusic() {
        if (this.isPlaying)
            return;
        try {
            const ctx = this.ensureContext();
            this.isPlaying = true;
            this.melodyIndex = 0;
            this.bassIndex = 0;
            this.nextNoteTime = ctx.currentTime;
            this.schedulerTimer = window.setInterval(this.scheduler, 50);
        }
        catch {
            // Audio not available
        }
    }
    stopMusic() {
        this.isPlaying = false;
        if (this.schedulerTimer) {
            clearInterval(this.schedulerTimer);
            this.schedulerTimer = 0;
        }
    }
}
Music.BPM = 160;
Music.EIGHTH = 60 / Music.BPM / 2; // ~0.1875s
// Upbeat melody — original composition, game-like pentatonic feel
Music.MELODY = [
    // Phrase 1 — ascending energy
    { freq: NOTE.E5, eighths: 1 }, { freq: NOTE.E5, eighths: 1 },
    { freq: NOTE.R, eighths: 1 }, { freq: NOTE.E5, eighths: 1 },
    { freq: NOTE.R, eighths: 1 }, { freq: NOTE.C5, eighths: 1 },
    { freq: NOTE.E5, eighths: 2 },
    // Phrase 2 — peak
    { freq: NOTE.G5, eighths: 2 }, { freq: NOTE.R, eighths: 2 },
    { freq: NOTE.G4, eighths: 2 }, { freq: NOTE.R, eighths: 2 },
    // Phrase 3 — descent
    { freq: NOTE.C5, eighths: 2 }, { freq: NOTE.R, eighths: 1 },
    { freq: NOTE.G4, eighths: 2 }, { freq: NOTE.R, eighths: 1 },
    { freq: NOTE.E4, eighths: 2 },
    // Phrase 4 — bounce
    { freq: NOTE.A4, eighths: 1 }, { freq: NOTE.B4, eighths: 1 },
    { freq: NOTE.A5, eighths: 1 }, { freq: NOTE.A4, eighths: 1 },
    { freq: NOTE.R, eighths: 1 },
    { freq: NOTE.G4, eighths: 1 },
    { freq: NOTE.E5, eighths: 1 }, { freq: NOTE.G5, eighths: 1 },
    // Phrase 5 — resolution
    { freq: NOTE.A5, eighths: 2 },
    { freq: NOTE.F5, eighths: 1 }, { freq: NOTE.G5, eighths: 1 },
    { freq: NOTE.R, eighths: 1 },
    { freq: NOTE.E5, eighths: 1 },
    { freq: NOTE.C5, eighths: 1 }, { freq: NOTE.D5, eighths: 1 },
    { freq: NOTE.B4, eighths: 2 }, { freq: NOTE.R, eighths: 2 },
];
// Bass line — simple root notes
Music.BASS = [
    { freq: NOTE.C3, eighths: 2 }, { freq: NOTE.R, eighths: 1 }, { freq: NOTE.G3, eighths: 1 },
    { freq: NOTE.C3, eighths: 2 }, { freq: NOTE.R, eighths: 1 }, { freq: NOTE.G3, eighths: 1 },
    { freq: NOTE.C3, eighths: 2 }, { freq: NOTE.R, eighths: 1 }, { freq: NOTE.G3, eighths: 1 },
    { freq: NOTE.C3, eighths: 2 }, { freq: NOTE.E3, eighths: 1 }, { freq: NOTE.G3, eighths: 1 },
    { freq: NOTE.A3, eighths: 2 }, { freq: NOTE.R, eighths: 1 }, { freq: NOTE.E3, eighths: 1 },
    { freq: NOTE.A3, eighths: 2 }, { freq: NOTE.R, eighths: 1 }, { freq: NOTE.E3, eighths: 1 },
    { freq: NOTE.G3, eighths: 2 }, { freq: NOTE.R, eighths: 1 }, { freq: NOTE.D3, eighths: 1 },
    { freq: NOTE.G3, eighths: 2 }, { freq: NOTE.R, eighths: 1 }, { freq: NOTE.D3, eighths: 1 },
    { freq: NOTE.C3, eighths: 2 }, { freq: NOTE.R, eighths: 1 }, { freq: NOTE.G3, eighths: 1 },
    { freq: NOTE.C3, eighths: 4 },
];
//# sourceMappingURL=sound.js.map