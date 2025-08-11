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
  "0": UiohookKey['0'],
  "1": UiohookKey['1'],
  "2": UiohookKey['2'],
  "3": UiohookKey['3'],
  "4": UiohookKey['4'],
  "5": UiohookKey['5'],
  "6": UiohookKey['6'],
  "7": UiohookKey['7'],
  "8": UiohookKey['8'],
  "9": UiohookKey['9'],
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
  "!": UiohookKey['1'], // Shift + 1
  "@": UiohookKey['2'], // Shift + 2
  "#": UiohookKey['3'], // Shift + 3
  "$": UiohookKey['4'], // Shift + 4
  "%": UiohookKey['5'], // Shift + 5
  "^": UiohookKey['6'], // Shift + 6
  "&": UiohookKey['7'], // Shift + 7
  "*": UiohookKey['8'], // Shift + 8
  "(": UiohookKey['9'], // Shift + 9
  ")": UiohookKey['0'], // Shift + 0
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
  if (currentWpm <= 0) return 0 // Avoid division by zero

  // Introduce WPM variation of +-35%
  const wpmVariation = currentWpm * (Math.random() * 0.7 - 0.35) // +-35%
  const variedWpm = currentWpm + wpmVariation

  // Average word length is 5 characters. WPM -> Characters per minute -> Chars per second
  const charactersPerMinute = variedWpm * 5
  const charactersPerSecond = charactersPerMinute / 60

  // Add some randomness to make it feel more human
  const baseDelay = 1000 / charactersPerSecond
  const randomFactor = Math.random() * 0.5 + 0.75 // Fluctuation between 75% and 125% of the base delay
  return baseDelay * randomFactor
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

async function typeHumanLike(
  text: string,
  options: { autoIndent: boolean; autoBrackets: boolean },
  appState: AppState
) {
  isTyping = true
  stopTypingFlag = false

  const lines = text.split("\n")

  for (let i = 0; i < lines.length; i++) {
    if (stopTypingFlag) break

    let lineToType = lines[i]

    if (options.autoIndent) {
      lineToType = lineToType.trimLeft()
    }

    for (const char of lineToType) {
      if (stopTypingFlag) {
        console.log("Typing stopped by user.")
        break
      }

      // Occasionally pause for a slightly longer duration
      if (Math.random() < 0.20) { // 5% chance of a longer pause
        await new Promise((resolve) => setTimeout(resolve, calculateTypingDelay(wpm) * 3));
      }

      if (options.autoBrackets && char === "}") {
        uIOhook.keyTap(UiohookKey.ArrowDown)
      } else {
        await tapKey(char)
      }

      const delay = calculateTypingDelay(wpm)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }

    if (stopTypingFlag) {
      break
    }

    if (i < lines.length - 1) {
      await tapKey("\n")
      const delay = calculateTypingDelay(wpm)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  isTyping = false
  stopTypingFlag = false
  appState.getMainWindow()?.webContents.send("typing-finished")
}

export function registerIpcHandlers(appState: AppState): void {
  uIOhook.start()
  ipcMain.handle(
    "update-content-dimensions",
      async (event, { width, height }: { width: number; height: number }) => {
        if (width && height) {
          appState.setWindowDimensions(width, height)
        }
      }
    )

    ipcMain.handle(
      "type-text",
      async (event, text: string, options: { autoIndent: boolean; autoBrackets: boolean }) => {
        if (isTyping) {
          return { success: false, message: "Already typing." }
        }
        const finalOptions = options || { autoIndent: false, autoBrackets: false }
        // Don't await, let it run in the background
        typeHumanLike(text, finalOptions, appState)
        return { success: true }
      }
    )

    ipcMain.handle("update-typing-speed", (event, newWpm: number) => {
      if (newWpm >= 80 && newWpm <= 180) {
        wpm = newWpm
      }
    })

    ipcMain.handle("stop-typing", () => {
      stopTypingFlag = true
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
}
