'use client'

import { Card, CardContent } from '@/components/ui/card'

interface TopicInputProps {
  value: string
  onChange: (value: string) => void
}

export function TopicInput({ value, onChange }: TopicInputProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <label className="block pb-2 text-xs font-semibold">
          Topic or research question
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g., Efficacy of bariatric surgery in adolescents"
          className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          Single line — will become the review title and frame the introduction.
        </p>
      </CardContent>
    </Card>
  )
}
