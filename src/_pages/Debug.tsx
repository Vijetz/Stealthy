// Debug.tsx
import React, { useState, useEffect, useRef } from "react"
import { useQuery, useQueryClient } from "react-query"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism"
import { ComplexitySection, ContentSection } from "./Solutions"
import ScreenshotQueue from "../components/Queue/ScreenshotQueue"
import {
  Toast,
  ToastDescription,
  ToastMessage,
  ToastTitle,
  ToastVariant
} from "../components/ui/toast"
import ExtraScreenshotsQueueHelper from "../components/Solutions/SolutionCommands"
import { Copy } from "lucide-react"
import { diffLines } from "diff"

type DiffLine = {
  value: string
  added?: boolean
  removed?: boolean
}

const CodeComparisonSection = ({
  oldCode,
  newCode,
  isLoading
}: {
  oldCode: string | null
  newCode: string | null
  isLoading: boolean
}) => {
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = () => {
    if (newCode) {
      navigator.clipboard.writeText(newCode)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }
  const computeDiff = () => {
    if (!oldCode || !newCode) return { leftLines: [], rightLines: [] }

    const normalizeCode = (code: string) => {
      return code.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim()
    }

    const normalizedOldCode = normalizeCode(oldCode)
    const normalizedNewCode = normalizeCode(newCode)

    const diff = diffLines(normalizedOldCode, normalizedNewCode, {
      newlineIsToken: true,
      ignoreWhitespace: true
    })

    const leftLines: DiffLine[] = []
    const rightLines: DiffLine[] = []

    diff.forEach((part) => {
      const lines = part.value.split('\n').filter(line => line.length > 0);
      if (part.added) {
        leftLines.push(...Array(lines.length).fill({ value: "" }))
        rightLines.push(...lines.map(line => ({ value: line, added: true })))
      } else if (part.removed) {
        leftLines.push(...lines.map(line => ({ value: line, removed: true })))
        rightLines.push(...Array(lines.length).fill({ value: "" }))
      } else {
        leftLines.push(...lines.map(line => ({ value: line })))
        rightLines.push(...lines.map(line => ({ value: line })))
      }
    })

    return { leftLines, rightLines }
  }

  const { leftLines, rightLines } = computeDiff()

  return (
    <div className="space-y-1.5">
      <h2 className="text-[13px] font-medium text-white tracking-wide">
        Code Comparison
      </h2>
      {isLoading ? (
        <div className="space-y-1">
          <div className="mt-3 flex">
            <p className="text-xs bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300 bg-clip-text text-transparent animate-pulse">
              Loading code comparison...
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-row gap-0.5 bg-[#161b22] rounded-lg overflow-hidden">
          <div className="w-1/2 border-r border-gray-700">
            <div className="bg-[#2d333b] px-3 py-1.5">
              <h3 className="text-[11px] font-medium text-gray-200">
                Previous Version
              </h3>
            </div>
            <div className="p-3 overflow-x-auto">
              <SyntaxHighlighter
                language="python"
                style={dracula}
                customStyle={{
                  maxWidth: "100%",
                  margin: 0,
                  padding: "1rem",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all"
                }}
                wrapLines={true}
                showLineNumbers={true}
                lineProps={(lineNumber) => ({
                  style: {
                    display: "block",
                    backgroundColor: leftLines[lineNumber - 1]?.removed
                      ? "rgba(139, 0, 0, 0.2)"
                      : "transparent"
                  }
                })}
              >
                {leftLines.map((line) => line.value).join("\n")}
              </SyntaxHighlighter>
            </div>
          </div>

          <div className="w-1/2">
            <div className="flex justify-between items-center bg-[#2d333b] px-3 py-1.5">
              <h3 className="text-[11px] font-medium text-gray-200">
                New Version
              </h3>
              <button
                onClick={handleCopy}
                className="text-xs text-gray-400 hover:text-white"
              >
                {isCopied ? "Copied!" : <Copy size={14} />}
              </button>
            </div>
            <div className="p-3 overflow-x-auto">
              <SyntaxHighlighter
                language="python"
                style={dracula}
                customStyle={{
                  maxWidth: "100%",
                  margin: 0,
                  padding: "1rem",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all"
                }}
                wrapLines={true}
                showLineNumbers={true}
                lineProps={(lineNumber) => ({
                  style: {
                    display: "block",
                    backgroundColor: rightLines[lineNumber - 1]?.added
                      ? "rgba(0, 139, 0, 0.2)"
                      : "transparent"
                  }
                })}
              >
                {rightLines.map((line) => line.value).join("\n")}
              </SyntaxHighlighter>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


interface DebugProps {
  isProcessing: boolean
  setIsProcessing: (isProcessing: boolean) => void
}

const Debug: React.FC<DebugProps> = ({ isProcessing, setIsProcessing }) => {
  const queryClient = useQueryClient()
  const contentRef = useRef<HTMLDivElement>(null)

  const [oldCode, setOldCode] = useState<string | null>(null)
  const [newCode, setNewCode] = useState<string | null>(null)
  const [explanation, setExplanation] = useState<string | null>(null)
  const [timeComplexityData, setTimeComplexityData] = useState<string | null>(
    null
  )
  const [spaceComplexityData, setSpaceComplexityData] = useState<string | null>(
    null
  )

  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<ToastMessage>({
    title: "",
    description: "",
    variant: "neutral"
  })

  const [isTooltipVisible, setIsTooltipVisible] = useState(false)
  const [tooltipHeight, setTooltipHeight] = useState(0)

  const { data: extraScreenshots = [], refetch } = useQuery({
    queryKey: ["extras"],
    queryFn: async () => {
      try {
        const existing = await window.electronAPI.getScreenshots()
        return existing
      } catch (error) {
        console.error("Error loading extra screenshots:", error)
        return []
      }
    },
    staleTime: Infinity,
    cacheTime: Infinity
  })

  const showToast = (
    title: string,
    description: string,
    variant: ToastVariant
  ) => {
    setToastMessage({ title, description, variant })
    setToastOpen(true)
  }

  const handleDeleteExtraScreenshot = async (index: number) => {
    const screenshotToDelete = extraScreenshots[index]

    try {
      const response = await window.electronAPI.deleteScreenshot(
        screenshotToDelete.path
      )

      if (response.success) {
        refetch()
      } else {
        console.error("Failed to delete extra screenshot:", response.error)
      }
    } catch (error) {
      console.error("Error deleting extra screenshot:", error)
    }
  }

  useEffect(() => {
    const originalSolution = queryClient.getQueryData("solution") as any;
    const newSolution = queryClient.getQueryData("new_solution") as any;

    if (originalSolution) {
      setOldCode(originalSolution.code || null)
    }

    if (newSolution) {
      setNewCode(newSolution.code || null)
      setExplanation(newSolution.explanation || null)
      setTimeComplexityData(newSolution.time_complexity || null)
      setSpaceComplexityData(newSolution.space_complexity || null)
      setIsProcessing(false)
    }

    const cleanupFunctions = [
      window.electronAPI.onScreenshotTaken(() => refetch()),
      window.electronAPI.onResetView(() => refetch()),
      window.electronAPI.onDebugSuccess(() => {
        const newSolutionData = queryClient.getQueryData("new_solution") as any;
        if (newSolutionData) {
          setNewCode(newSolutionData.code || null)
          setExplanation(newSolutionData.explanation || null)
          setTimeComplexityData(newSolutionData.time_complexity || null)
          setSpaceComplexityData(newSolutionData.space_complexity || null)
        }
        setIsProcessing(false)
      }),
      window.electronAPI.onDebugStart(() => {
        setIsProcessing(true)
      }),
      window.electronAPI.onDebugError((error: string) => {
        showToast(
          "Processing Failed",
          "There was an error debugging your code.",
          "error"
        )
        setIsProcessing(false)
        console.error("Processing error:", error)
      })
    ]

    const updateDimensions = () => {
      if (contentRef.current) {
        let contentHeight = contentRef.current.scrollHeight
        const contentWidth = contentRef.current.scrollWidth
        if (isTooltipVisible) {
          contentHeight += tooltipHeight
        }
        window.electronAPI.updateContentDimensions({
          width: contentWidth,
          height: contentHeight
        })
      }
    }

    const resizeObserver = new ResizeObserver(updateDimensions)
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current)
    }
    updateDimensions()

    return () => {
      resizeObserver.disconnect()
      cleanupFunctions.forEach((cleanup) => cleanup())
    }
  }, [queryClient, setIsProcessing])

  const handleTooltipVisibilityChange = (visible: boolean, height: number) => {
    setIsTooltipVisible(visible)
    setTooltipHeight(height)
  }

  return (
    <div ref={contentRef} className="relative space-y-3 px-4 py-3 ">
      <Toast
        open={toastOpen}
        onOpenChange={setToastOpen}
        variant={toastMessage.variant}
        duration={3000}
      >
        <ToastTitle>{toastMessage.title}</ToastTitle>
        <ToastDescription>{toastMessage.description}</ToastDescription>
      </Toast>

      <div className="bg-transparent w-fit">
        <div className="pb-3">
          <div className="space-y-3 w-fit">
            <ScreenshotQueue
              screenshots={extraScreenshots}
              onDeleteScreenshot={handleDeleteExtraScreenshot}
              isLoading={isProcessing}
            />
          </div>
        </div>
      </div>

      <ExtraScreenshotsQueueHelper
        extraScreenshots={extraScreenshots}
        onTooltipVisibilityChange={handleTooltipVisibilityChange}
      />

      <div className="w-full text-sm text-black bg-black/60 rounded-md">
        <div className="rounded-lg overflow-hidden">
          <div className="px-4 py-3 space-y-4">
            <ContentSection
              title="What I Changed"
              content={explanation}
              isLoading={isProcessing || !explanation}
            />

            <CodeComparisonSection
              oldCode={oldCode}
              newCode={newCode}
              isLoading={isProcessing || !oldCode || !newCode}
            />

            <ComplexitySection
              timeComplexity={timeComplexityData}
              spaceComplexity={spaceComplexityData}
              isLoading={isProcessing || !timeComplexityData || !spaceComplexityData}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Debug
