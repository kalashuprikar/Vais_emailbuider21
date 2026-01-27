import React, { useState, useCallback } from "react";
import { EmailTemplate } from "./types";
import { renderTemplateToHTML } from "./utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Copy, Download, FileJson } from "lucide-react";
import { toast } from "sonner";

interface SourceCodeViewProps {
  template: EmailTemplate;
}

export const SourceCodeView: React.FC<SourceCodeViewProps> = ({ template }) => {
  const [copied, setCopied] = useState(false);
  const [openTooltip, setOpenTooltip] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [openDownloadTooltip, setOpenDownloadTooltip] = useState(false);

  const htmlContent = renderTemplateToHTML(template);

  const handleCopy = useCallback(() => {
    if (!htmlContent) {
      console.error("No content to copy");
      return;
    }

    navigator.clipboard.writeText(htmlContent).then(() => {
      console.log("Content copied to clipboard");
      setCopied(true);
      setOpenTooltip(true);
      setTimeout(() => {
        setCopied(false);
        setOpenTooltip(false);
      }, 2000);
    }).catch((err) => {
      console.error("Failed to copy:", err);
      // Fallback: use old method
      const textArea = document.createElement("textarea");
      textArea.value = htmlContent;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setOpenTooltip(true);
        setTimeout(() => {
          setCopied(false);
          setOpenTooltip(false);
        }, 2000);
      } catch (err) {
        console.error("Fallback copy failed:", err);
      }
      document.body.removeChild(textArea);
    });
  }, [htmlContent]);

  const handleDownloadHTML = () => {
    const element = document.createElement("a");
    const file = new Blob([htmlContent], { type: "text/html" });
    element.href = URL.createObjectURL(file);
    element.download = `${template.name || "template"}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    showDownloadedMessage();
  };

  const handleDownloadJSON = () => {
    const templateJson = JSON.stringify(template, null, 2);
    const element = document.createElement("a");
    const file = new Blob([templateJson], { type: "application/json" });
    element.href = URL.createObjectURL(file);
    element.download = `${template.name || "template"}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    showDownloadedMessage();
  };

  const handleDownloadPDF = () => {
    // Create a new window to print as PDF
    const printWindow = window.open("", "", "height=900,width=1200");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${template.name || "Template"}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            pre { background-color: #f4f4f4; padding: 15px; overflow-x: auto; }
            code { font-family: 'Courier New', monospace; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>${template.name || "Email Template"}</h1>
          <p><strong>Subject:</strong> ${template.subject}</p>
          <h2>HTML Preview:</h2>
          <div>${htmlContent}</div>
          <h2>HTML Source:</h2>
          <pre><code>${htmlContent.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>
        </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
        setTimeout(() => printWindow.close(), 100);
      }, 250);
    }

    showDownloadedMessage();
  };

  const showDownloadedMessage = () => {
    setDownloaded(true);
    setOpenDownloadTooltip(true);
    setTimeout(() => {
      setDownloaded(false);
      setOpenDownloadTooltip(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header with Actions */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            HTML Source Code
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Complete HTML for: {template.name || "Untitled Template"}
          </p>
        </div>
        <TooltipProvider delayDuration={200}>
          <div className="flex items-center gap-2">
            <Tooltip open={openTooltip} onOpenChange={setOpenTooltip}>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="font-medium" side="top">
                {copied ? "Copied!" : "Copy Code"}
              </TooltipContent>
            </Tooltip>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDownloadHTML}>
                  <Download className="w-4 h-4 mr-2" />
                  Download HTML
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadPDF}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Preview (PDF)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadJSON}>
                  <FileJson className="w-4 h-4 mr-2" />
                  Download Template (JSON)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TooltipProvider>
      </div>

      {/* Code Display */}
      <div className="flex-1 overflow-auto p-4">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <pre className="p-4 text-xs font-mono text-gray-800 overflow-auto max-h-full leading-relaxed">
            <code>{htmlContent}</code>
          </pre>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="bg-white border-t border-gray-200 p-4 text-sm text-gray-600 flex justify-between">
        <span>Lines: {htmlContent.split("\n").length}</span>
        <span>Characters: {htmlContent.length}</span>
        <span>Blocks: {template.blocks.length}</span>
      </div>
    </div>
  );
};
