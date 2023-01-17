export const isDark = useLocalStorage("theme-appearance", false)
export const toggleDark = useToggle(isDark)
