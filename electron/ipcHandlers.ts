// ipcHandlers.ts

import { ipcMain, app } from "electron"
import { AppState } from "./main"
import { uIOhook, UiohookKey } from "uiohook-napi"

// --- Typing Simulation State ---
let wpm = 100 // Default WPM, will be updated by the frontend
let isTyping = false
let stopTypingFlag = false

// --- Key Mappings for uiohook-napi ---
const keyMap: { [key: string]: number } = {
  a: UiohookKey.A,
  b: UiohookKey.B,
  c: UiohookKey.C,
  d: UiohookKey.D,
  e: UiohookKey.E,
  f: UiohookKey.F,
  g: UiohookKey.G,
  h: UiohookKey.H,
  i: UiohookKey.I,
  j: UiohookKey.J,
  k: UiohookKey.K,
  l: UiohookKey.L,
  m: UiohookKey.M,
  n: UiohookKey.N,
  o: UiohookKey.O,
  p: UiohookKey.P,
  q: UiohookKey.Q,
  r: UiohookKey.R,
  s: UiohookKey.S,
  t: UiohookKey.T,
  u: UiohookKey.U,
  v: UiohookKey.V,
  w: UiohookKey.W,
  x: UiohookKey.X,
  y: UiohookKey.Y,
  z: UiohookKey.Z,
  "0": 2, // Using raw keycodes for numbers
  "1": 3,
  "2": 4,
  "3": 5,
  "4": 6,
  "5": 7,
  "6": 8,
  "7": 9,
  "8": 10,
  "9": 11,
  " ": UiohookKey.Space,
  "\n": UiohookKey.Enter,
  "\t": UiohookKey.Tab,
  ".": UiohookKey.Period,
  ",": UiohookKey.Comma,
  "-": UiohookKey.Minus,
  "=": UiohookKey.Equal,
  "[": UiohookKey.BracketLeft,
  "]": UiohookKey.BracketRight,
  "\\": UiohookKey.Backslash,
  ";": UiohookKey.Semicolon,
  "'": UiohookKey.Quote,
  "`": UiohookKey.Backquote,
  "/": UiohookKey.Slash
}

const shiftKeyMap: { [key: string]: number } = {
  A: UiohookKey.A,
  B: UiohookKey.B,
  C: UiohookKey.C,
  D: UiohookKey.D,
  E: UiohookKey.E,
  F: UiohookKey.F,
  G: UiohookKey.G,
  H: UiohookKey.H,
  I: UiohookKey.I,
  J: UiohookKey.J,
  K: UiohookKey.K,
  L: UiohookKey.L,
  M: UiohookKey.M,
  N: UiohookKey.N,
  O: UiohookKey.O,
  P: UiohookKey.P,
  Q: UiohookKey.Q,
  R: UiohookKey.R,
  S: UiohookKey.S,
  T: UiohookKey.T,
  U: UiohookKey.U,
  V: UiohookKey.V,
  W: UiohookKey.W,
  X: UiohookKey.X,
  Y: UiohookKey.Y,
  Z: UiohookKey.Z,
  "!": 2, // Key 1
  "@": 3, // Key 2
  "#": 4, // Key 3
  $: 5, // Key 4
  "%": 6, // Key 5
  "^": 7, // Key 6
  "&": 8, // Key 7
  "*": 9, // Key 8
  "(": 10, // Key 9
  ")": 11, // Key 0
  _: UiohookKey.Minus,
  "+": UiohookKey.Equal,
  "{": UiohookKey.BracketLeft,
  "}": UiohookKey.BracketRight,
  "|": UiohookKey.Backslash,
  ":": UiohookKey.Semicolon,
  '"': UiohookKey.Quote,
  "~": UiohookKey.Backquote,
  "<": UiohookKey.Comma,
  ">": UiohookKey.Period,
  "?": UiohookKey.Slash
}

// --- Helper Functions ---

function calculateTypingDelay(currentWpm: number): number {
  const wpmFluctuation = currentWpm * 0.25
  const fluctuatingWpm =
    currentWpm + Math.random() * wpmFluctuation * 2 - wpmFluctuation
  const cps = Math.max(fluctuatingWpm, 10) / 60 / 5 // Chars per sec, avg word length 5
  return 1000 / cps
}

async function tapKey(char: string) {
  const isShift = shiftKeyMap[char] !== undefined
  const keyCode = isShift ? shiftKeyMap[char] : keyMap[char.toLowerCase()]

  if (keyCode === undefined) {
    console.warn(`Skipping character: "${char}" (no key mapping)`)
    return
  }

  try {
    if (isShift) {
      uIOhook.keyToggle(UiohookKey.Shift, "down")
    }
    uIOhook.keyTap(keyCode as any)
    if (isShift) {
      uIOhook.keyToggle(UiohookKey.Shift, "up")
    }
  } catch (e) {
    console.error("Error tapping key. Is uiohook running?", e)
  }
}

async function typeHumanLike(text: string) {
  isTyping = true
  stopTypingFlag = false

  const typeText = async (text: string) => {
    isTyping = true
    stopTypingFlag = false
  
    // Correctly calculate delay from WPM
    // Assumes average word length of 5 chars
    const delay = 60000 / (wpm * 5)
  
    for (const char of text) {
      if (stopTypingFlag) {
        console.log("Typing stopped by user.")
        break
      }

      const delay = calculateTypingDelay(wpm)
      await new Promise((resolve) => setTimeout(resolve, delay))

      // Simulate typos
      if (Math.random() < 0.02) {
        // 2% chance of a typo
        const randomChar = String.fromCharCode(97 + Math.floor(Math.random() * 26))
        await tapKey(randomChar)
        await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 100))
        uIOhook.keyTap(UiohookKey.Backspace as any)
        await new Promise((resolve) => setTimeout(resolve, 50 + Math.random() * 50))
      }

      // Simulate pauses
      if (
        [".", ",", "(", ")", "{", "}", ";", "\n"].includes(char) ||
        Math.random() < 0.04
      ) {
        await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 300))
      }

      await tapKey(char)
    }

    isTyping = false
    stopTypingFlag = false
  }

function initializeIpcHandlers(appState: AppState): void {
    uIOhook.start()
    ipcMain.handle(
      "update-content-dimensions",
      async (event, { width, height }: { width: number; height: number }) => {
        if (width && height) {
          appState.setWindowDimensions(width, height)
        }
      }
    )

    ipcMain.handle("type-text", async (event, text: string) => {
      if (isTyping) {
        return { success: false, message: "Already typing." }
      }
      // Don't await, let it run in the background
      typeHumanLike(text)
      return { success: true }
    })

    ipcMain.handle("update-typing-speed", (event, newWpm: number) => {
      if (newWpm >= 80 && newWpm <= 180) {
        wpm = newWpm
      }
    })

    ipcMain.handle("stop-typing", () => {
      if (isTyping) {
        stopTypingFlag = true
      }
    })

    ipcMain.handle("delete-screenshot", async (event, path: string) => {
      return appState.deleteScreenshot(path)
    })

    ipcMain.handle("take-screenshot", async () => {
      try {
        const screenshotPath = await appState.takeScreenshot()
        const preview = await appState.getImagePreview(screenshotPath)
        return { path: screenshotPath, preview }
      } catch (error) {
        console.error("Error taking screenshot:", error)
        throw error
      }
    })

    ipcMain.handle("get-screenshots", async () => {
      console.log({ view: appState.getView() })
      try {
        let previews = []
        if (appState.getView() === "queue") {
          previews = await Promise.all(
            appState.getScreenshotQueue().map(async (path) => ({
              path,
              preview: await appState.getImagePreview(path)
            }))
          )
        } else {
          previews = await Promise.all(
            appState.getExtraScreenshotQueue().map(async (path) => ({
              path,
              preview: await appState.getImagePreview(path)
            }))
          )
        }
        previews.forEach((preview: any) => console.log(preview.path))
        return previews
      } catch (error) {
        console.error("Error getting screenshots:", error)
        throw error
      }
    })

    ipcMain.handle("toggle-window", async () => {
      appState.toggleMainWindow()
    })

    ipcMain.handle("reset-queues", async () => {
      try {
        appState.clearQueues()
        console.log("Screenshot queues have been cleared.")
        return { success: true }
      } catch (error: any) {
        console.error("Error resetting queues:", error)
        return { success: false, error: error.message }
      }
    })

    // IPC handler for analyzing audio from base64 data
    ipcMain.handle("analyze-audio-base64", async (event, data: string, mimeType: string) => {
      try {
        const result = await appState.processingHelper.processAudioBase64(data, mimeType)
        return result
      } catch (error: any) {
        console.error("Error in analyze-audio-base64 handler:", error)
        throw error
      }
    })

    // IPC handler for analyzing audio from file path
    ipcMain.handle("analyze-audio-file", async (event, path: string) => {
      try {
        const result = await appState.processingHelper.processAudioFile(path)
        return result
      } catch (error: any) {
        console.error("Error in analyze-audio-file handler:", error)
        throw error
      }
    })

    // IPC handler for analyzing image from file path
    ipcMain.handle("analyze-image-file", async (event, path: string) => {
      try {
        const result = await appState.processingHelper.getLLMHelper().analyzeImageFile(path)
        return result
      } catch (error: any) {
        console.error("Error in analyze-image-file handler:", error)
        throw error
      }
    })

    ipcMain.handle("quit-app", () => {
      app.quit()
    })
  }}
