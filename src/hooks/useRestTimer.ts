'use client'
import { useState, useEffect, useCallback, useRef } from 'react'

interface RestTimerState {
  active: boolean
  remaining: number
  total: number
  exerciseName: string
  setNumber: number
}

const DEFAULT_STATE: RestTimerState = {
  active: false,
  remaining: 0,
  total: 0,
  exerciseName: '',
  setNumber: 0,
}

export function useRestTimer() {
  const [timer, setTimer] = useState<RestTimerState>(DEFAULT_STATE)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Clear interval on unmount
  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [])

  const startTimer = useCallback((seconds: number, exerciseName: string, setNumber: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current)

    setTimer({ active: true, remaining: seconds, total: seconds, exerciseName, setNumber })

    intervalRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev.remaining <= 1) {
          clearInterval(intervalRef.current!)
          return DEFAULT_STATE
        }
        return { ...prev, remaining: prev.remaining - 1 }
      })
    }, 1000)
  }, [])

  const dismiss = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setTimer(DEFAULT_STATE)
  }, [])

  const addTime = useCallback((seconds: number) => {
    setTimer(prev => ({ ...prev, remaining: prev.remaining + seconds }))
  }, [])

  return { timer, startTimer, dismiss, addTime }
}
