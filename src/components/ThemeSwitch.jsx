import { useEffect, useState } from 'react'

const STORAGE_KEY = 'karaoke-theme'

const OPTIONS = [
  { value: 'male', label: 'Муж' },
  { value: 'female', label: 'Жен' },
]

export default function ThemeSwitch() {
  const [value, setValue] = useState('male')

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'male' || stored === 'female') {
      setValue(stored)
    }
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = value
    localStorage.setItem(STORAGE_KEY, value)
  }, [value])

  return (
    <div className="theme-switch" role="radiogroup" aria-label="Смена темы">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          className="theme-switch__option"
          data-active={value === option.value}
          onClick={() => setValue(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
