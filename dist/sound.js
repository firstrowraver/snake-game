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
//# sourceMappingURL=sound.js.map