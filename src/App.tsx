import DatePicker from './date-picker'
import ThemePicker from './theme-picker'

export default function App() {
  return (
    <div className="relative min-h-svh">
      <div className="absolute top-4 left-4">
        <ThemePicker />
      </div>
      <header className="flex px-8 pt-16 pb-8">
        <div className="ml-auto max-w-56 text-right sm:max-w-max">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            ورودی های فارسی
          </h1>
          <p className="mt-1 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            کامپوننت های ورودی فارسی و راست چین
          </p>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-md flex-col px-4">
        <DatePicker />
      </main>
    </div>
  )
}
