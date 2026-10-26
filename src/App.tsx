import DatePicker from './date-picker'
import ThemePicker from './theme-picker'

export default function App() {
  return (
    <div className="relative min-h-svh">
      <div className="absolute top-4 left-4">
        <ThemePicker />
      </div>
      <main className="mx-auto flex w-full max-w-md flex-col px-4 pt-24">
        <DatePicker />
      </main>
    </div>
  )
}
