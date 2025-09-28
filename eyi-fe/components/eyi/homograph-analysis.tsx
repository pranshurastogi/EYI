"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Shield, Eye, AlertCircle } from "lucide-react"

type HomographRisk = {
  ens: string
  riskLevel: "high" | "medium" | "low"
  description: string
  suspiciousChars: string[]
  originalChars: string[]
}

const homographRisks: HomographRisk[] = [
  {
    ens: "аlice.eth",
    riskLevel: "high",
    description: "Cyrillic 'а' instead of Latin 'a'",
    suspiciousChars: ["а"],
    originalChars: ["a"]
  },
  {
    ens: "b0b.eth",
    riskLevel: "medium",
    description: "Zero '0' instead of letter 'o'",
    suspiciousChars: ["0"],
    originalChars: ["o"]
  },
  {
    ens: "сharlie.eth",
    riskLevel: "high",
    description: "Cyrillic 'с' instead of Latin 'c'",
    suspiciousChars: ["с"],
    originalChars: ["c"]
  },
  {
    ens: "dіana.eth",
    riskLevel: "high",
    description: "Cyrillic 'і' instead of Latin 'i'",
    suspiciousChars: ["і"],
    originalChars: ["i"]
  },
  {
    ens: "еve.eth",
    riskLevel: "high",
    description: "Cyrillic 'е' instead of Latin 'e'",
    suspiciousChars: ["е"],
    originalChars: ["e"]
  },
  {
    ens: "fгаnk.eth",
    riskLevel: "high",
    description: "Mixed Cyrillic and Latin characters",
    suspiciousChars: ["г", "а"],
    originalChars: ["r", "a"]
  },
  {
    ens: "grаce.eth",
    riskLevel: "high",
    description: "Cyrillic 'а' instead of Latin 'a'",
    suspiciousChars: ["а"],
    originalChars: ["a"]
  },
  {
    ens: "hеnry.eth",
    riskLevel: "high",
    description: "Cyrillic 'е' instead of Latin 'e'",
    suspiciousChars: ["е"],
    originalChars: ["e"]
  },
  {
    ens: "іris.eth",
    riskLevel: "high",
    description: "Cyrillic 'і' instead of Latin 'i'",
    suspiciousChars: ["і"],
    originalChars: ["i"]
  },
  {
    ens: "jаck.eth",
    riskLevel: "high",
    description: "Cyrillic 'а' instead of Latin 'a'",
    suspiciousChars: ["а"],
    originalChars: ["a"]
  }
]

export function HomographAnalysis() {
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "high": return "bg-red-100 text-red-800 border-red-200"
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low": return "bg-green-100 text-green-800 border-green-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case "high": return <AlertTriangle className="size-4 text-red-500" />
      case "medium": return <AlertCircle className="size-4 text-yellow-500" />
      case "low": return <Shield className="size-4 text-green-500" />
      default: return <Eye className="size-4 text-gray-500" />
    }
  }

  return (
    <Card className="eyi-glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="size-5 text-red-500" />
          Homograph Risk Analysis
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Detected potential homograph attacks using lookalike characters
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {homographRisks.map((risk, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card">
              <div className="flex items-center gap-3">
                {getRiskIcon(risk.riskLevel)}
                <div>
                  <div className="font-mono text-sm font-medium">{risk.ens}</div>
                  <div className="text-xs text-muted-foreground">{risk.description}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getRiskColor(risk.riskLevel)}>
                  {risk.riskLevel.toUpperCase()}
                </Badge>
                <div className="text-xs text-muted-foreground">
                  {risk.suspiciousChars.join(", ")} → {risk.originalChars.join(", ")}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="size-4 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800">Security Warning</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Homograph attacks use characters that look identical but are from different Unicode blocks. 
                Always verify ENS names by copying and pasting them, or use a character inspector tool.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
