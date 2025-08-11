"use strict";
// ipcHandlers.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerIpcHandlers = registerIpcHandlers;
const electron_1 = require("electron");
const uiohook_napi_1 = require("uiohook-napi");
// --- Typing Simulation State ---
let wpm = 100; // Default WPM, will be updated by the frontend
let isTyping = false;
let stopTypingFlag = false;
// --- Key Mappings for uiohook-napi ---
const keyMap = {
    a: uiohook_napi_1.UiohookKey.A,
    b: uiohook_napi_1.UiohookKey.B,
    c: uiohook_napi_1.UiohookKey.C,
    d: uiohook_napi_1.UiohookKey.D,
    e: uiohook_napi_1.UiohookKey.E,
    f: uiohook_napi_1.UiohookKey.F,
    g: uiohook_napi_1.UiohookKey.G,
    h: uiohook_napi_1.UiohookKey.H,
    i: uiohook_napi_1.UiohookKey.I,
    j: uiohook_napi_1.UiohookKey.J,
    k: uiohook_napi_1.UiohookKey.K,
    l: uiohook_napi_1.UiohookKey.L,
    m: uiohook_napi_1.UiohookKey.M,
    n: uiohook_napi_1.UiohookKey.N,
    o: uiohook_napi_1.UiohookKey.O,
    p: uiohook_napi_1.UiohookKey.P,
    q: uiohook_napi_1.UiohookKey.Q,
    r: uiohook_napi_1.UiohookKey.R,
    s: uiohook_napi_1.UiohookKey.S,
    t: uiohook_napi_1.UiohookKey.T,
    u: uiohook_napi_1.UiohookKey.U,
    v: uiohook_napi_1.UiohookKey.V,
    w: uiohook_napi_1.UiohookKey.W,
    x: uiohook_napi_1.UiohookKey.X,
    y: uiohook_napi_1.UiohookKey.Y,
    z: uiohook_napi_1.UiohookKey.Z,
    "0": uiohook_napi_1.UiohookKey['0'],
    "1": uiohook_napi_1.UiohookKey['1'],
    "2": uiohook_napi_1.UiohookKey['2'],
    "3": uiohook_napi_1.UiohookKey['3'],
    "4": uiohook_napi_1.UiohookKey['4'],
    "5": uiohook_napi_1.UiohookKey['5'],
    "6": uiohook_napi_1.UiohookKey['6'],
    "7": uiohook_napi_1.UiohookKey['7'],
    "8": uiohook_napi_1.UiohookKey['8'],
    "9": uiohook_napi_1.UiohookKey['9'],
    " ": uiohook_napi_1.UiohookKey.Space,
    "\n": uiohook_napi_1.UiohookKey.Enter,
    "\t": uiohook_napi_1.UiohookKey.Tab,
    ".": uiohook_napi_1.UiohookKey.Period,
    ",": uiohook_napi_1.UiohookKey.Comma,
    "-": uiohook_napi_1.UiohookKey.Minus,
    "=": uiohook_napi_1.UiohookKey.Equal,
    "[": uiohook_napi_1.UiohookKey.BracketLeft,
    "]": uiohook_napi_1.UiohookKey.BracketRight,
    "\\": uiohook_napi_1.UiohookKey.Backslash,
    ";": uiohook_napi_1.UiohookKey.Semicolon,
    "'": uiohook_napi_1.UiohookKey.Quote,
    "`": uiohook_napi_1.UiohookKey.Backquote,
    "/": uiohook_napi_1.UiohookKey.Slash
};
const shiftKeyMap = {
    A: uiohook_napi_1.UiohookKey.A,
    B: uiohook_napi_1.UiohookKey.B,
    C: uiohook_napi_1.UiohookKey.C,
    D: uiohook_napi_1.UiohookKey.D,
    E: uiohook_napi_1.UiohookKey.E,
    F: uiohook_napi_1.UiohookKey.F,
    G: uiohook_napi_1.UiohookKey.G,
    H: uiohook_napi_1.UiohookKey.H,
    I: uiohook_napi_1.UiohookKey.I,
    J: uiohook_napi_1.UiohookKey.J,
    K: uiohook_napi_1.UiohookKey.K,
    L: uiohook_napi_1.UiohookKey.L,
    M: uiohook_napi_1.UiohookKey.M,
    N: uiohook_napi_1.UiohookKey.N,
    O: uiohook_napi_1.UiohookKey.O,
    P: uiohook_napi_1.UiohookKey.P,
    Q: uiohook_napi_1.UiohookKey.Q,
    R: uiohook_napi_1.UiohookKey.R,
    S: uiohook_napi_1.UiohookKey.S,
    T: uiohook_napi_1.UiohookKey.T,
    U: uiohook_napi_1.UiohookKey.U,
    V: uiohook_napi_1.UiohookKey.V,
    W: uiohook_napi_1.UiohookKey.W,
    X: uiohook_napi_1.UiohookKey.X,
    Y: uiohook_napi_1.UiohookKey.Y,
    Z: uiohook_napi_1.UiohookKey.Z,
    "!": uiohook_napi_1.UiohookKey['1'], // Shift + 1
    "@": uiohook_napi_1.UiohookKey['2'], // Shift + 2
    "#": uiohook_napi_1.UiohookKey['3'], // Shift + 3
    "$": uiohook_napi_1.UiohookKey['4'], // Shift + 4
    "%": uiohook_napi_1.UiohookKey['5'], // Shift + 5
    "^": uiohook_napi_1.UiohookKey['6'], // Shift + 6
    "&": uiohook_napi_1.UiohookKey['7'], // Shift + 7
    "*": uiohook_napi_1.UiohookKey['8'], // Shift + 8
    "(": uiohook_napi_1.UiohookKey['9'], // Shift + 9
    ")": uiohook_napi_1.UiohookKey['0'], // Shift + 0
    _: uiohook_napi_1.UiohookKey.Minus,
    "+": uiohook_napi_1.UiohookKey.Equal,
    "{": uiohook_napi_1.UiohookKey.BracketLeft,
    "}": uiohook_napi_1.UiohookKey.BracketRight,
    "|": uiohook_napi_1.UiohookKey.Backslash,
    ":": uiohook_napi_1.UiohookKey.Semicolon,
    '"': uiohook_napi_1.UiohookKey.Quote,
    "~": uiohook_napi_1.UiohookKey.Backquote,
    "<": uiohook_napi_1.UiohookKey.Comma,
    ">": uiohook_napi_1.UiohookKey.Period,
    "?": uiohook_napi_1.UiohookKey.Slash
};
// --- Helper Functions ---
function calculateTypingDelay(currentWpm) {
    if (currentWpm <= 0)
        return 0; // Avoid division by zero
    // Introduce WPM variation of +-35%
    const wpmVariation = currentWpm * (Math.random() * 0.7 - 0.35); // +-35%
    const variedWpm = currentWpm + wpmVariation;
    // Average word length is 5 characters. WPM -> Characters per minute -> Chars per second
    const charactersPerMinute = variedWpm * 5;
    const charactersPerSecond = charactersPerMinute / 60;
    // Add some randomness to make it feel more human
    const baseDelay = 1000 / charactersPerSecond;
    const randomFactor = Math.random() * 0.5 + 0.75; // Fluctuation between 75% and 125% of the base delay
    return baseDelay * randomFactor;
}
async function tapKey(char) {
    const isShift = shiftKeyMap[char] !== undefined;
    const keyCode = isShift ? shiftKeyMap[char] : keyMap[char.toLowerCase()];
    if (keyCode === undefined) {
        console.warn(`Skipping character: "${char}" (no key mapping)`);
        return;
    }
    try {
        if (isShift) {
            uiohook_napi_1.uIOhook.keyToggle(uiohook_napi_1.UiohookKey.Shift, "down");
        }
        uiohook_napi_1.uIOhook.keyTap(keyCode);
        if (isShift) {
            uiohook_napi_1.uIOhook.keyToggle(uiohook_napi_1.UiohookKey.Shift, "up");
        }
    }
    catch (e) {
        console.error("Error tapping key. Is uiohook running?", e);
    }
}
async function typeHumanLike(text, options, appState) {
    isTyping = true;
    stopTypingFlag = false;
    const lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
        if (stopTypingFlag)
            break;
        let lineToType = lines[i];
        if (options.autoIndent) {
            lineToType = lineToType.trimLeft();
        }
        for (const char of lineToType) {
            if (stopTypingFlag) {
                console.log("Typing stopped by user.");
                break;
            }
            // Occasionally pause for a slightly longer duration
            if (Math.random() < 0.20) { // 5% chance of a longer pause
                await new Promise((resolve) => setTimeout(resolve, calculateTypingDelay(wpm) * 3));
            }
            if (options.autoBrackets && char === "}") {
                uiohook_napi_1.uIOhook.keyTap(uiohook_napi_1.UiohookKey.ArrowDown);
            }
            else {
                await tapKey(char);
            }
            const delay = calculateTypingDelay(wpm);
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
        if (stopTypingFlag) {
            break;
        }
        if (i < lines.length - 1) {
            await tapKey("\n");
            const delay = calculateTypingDelay(wpm);
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }
    isTyping = false;
    stopTypingFlag = false;
    appState.getMainWindow()?.webContents.send("typing-finished");
}
function registerIpcHandlers(appState) {
    uiohook_napi_1.uIOhook.start();
    electron_1.ipcMain.handle("update-content-dimensions", async (event, { width, height }) => {
        if (width && height) {
            appState.setWindowDimensions(width, height);
        }
    });
    electron_1.ipcMain.handle("type-text", async (event, text, options) => {
        if (isTyping) {
            return { success: false, message: "Already typing." };
        }
        const finalOptions = options || { autoIndent: false, autoBrackets: false };
        // Don't await, let it run in the background
        typeHumanLike(text, finalOptions, appState);
        return { success: true };
    });
    electron_1.ipcMain.handle("update-typing-speed", (event, newWpm) => {
        if (newWpm >= 80 && newWpm <= 180) {
            wpm = newWpm;
        }
    });
    electron_1.ipcMain.handle("stop-typing", () => {
        stopTypingFlag = true;
    });
    electron_1.ipcMain.handle("delete-screenshot", async (event, path) => {
        return appState.deleteScreenshot(path);
    });
    electron_1.ipcMain.handle("take-screenshot", async () => {
        try {
            const screenshotPath = await appState.takeScreenshot();
            const preview = await appState.getImagePreview(screenshotPath);
            return { path: screenshotPath, preview };
        }
        catch (error) {
            console.error("Error taking screenshot:", error);
            throw error;
        }
    });
    electron_1.ipcMain.handle("get-screenshots", async () => {
        console.log({ view: appState.getView() });
        try {
            let previews = [];
            if (appState.getView() === "queue") {
                previews = await Promise.all(appState.getScreenshotQueue().map(async (path) => ({
                    path,
                    preview: await appState.getImagePreview(path)
                })));
            }
            else {
                previews = await Promise.all(appState.getExtraScreenshotQueue().map(async (path) => ({
                    path,
                    preview: await appState.getImagePreview(path)
                })));
            }
            previews.forEach((preview) => console.log(preview.path));
            return previews;
        }
        catch (error) {
            console.error("Error getting screenshots:", error);
            throw error;
        }
    });
    electron_1.ipcMain.handle("toggle-window", async () => {
        appState.toggleMainWindow();
    });
    electron_1.ipcMain.handle("reset-queues", async () => {
        try {
            appState.clearQueues();
            console.log("Screenshot queues have been cleared.");
            return { success: true };
        }
        catch (error) {
            console.error("Error resetting queues:", error);
            return { success: false, error: error.message };
        }
    });
    // IPC handler for analyzing audio from base64 data
    electron_1.ipcMain.handle("analyze-audio-base64", async (event, data, mimeType) => {
        try {
            const result = await appState.processingHelper.processAudioBase64(data, mimeType);
            return result;
        }
        catch (error) {
            console.error("Error in analyze-audio-base64 handler:", error);
            throw error;
        }
    });
    // IPC handler for analyzing audio from file path
    electron_1.ipcMain.handle("analyze-audio-file", async (event, path) => {
        try {
            const result = await appState.processingHelper.processAudioFile(path);
            return result;
        }
        catch (error) {
            console.error("Error in analyze-audio-file handler:", error);
            throw error;
        }
    });
    // IPC handler for analyzing image from file path
    electron_1.ipcMain.handle("analyze-image-file", async (event, path) => {
        try {
            const result = await appState.processingHelper.getLLMHelper().analyzeImageFile(path);
            return result;
        }
        catch (error) {
            console.error("Error in analyze-image-file handler:", error);
            throw error;
        }
    });
    electron_1.ipcMain.handle("quit-app", () => {
        electron_1.app.quit();
    });
    electron_1.ipcMain.handle("set-model", (event, modelName) => {
        try {
            appState.processingHelper.getLLMHelper().setModel(modelName);
            return { success: true };
        }
        catch (error) {
            console.error("Error setting model:", error);
            return { success: false, error: error.message };
        }
    });
}
//# sourceMappingURL=ipcHandlers.js.map