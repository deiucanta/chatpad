export const useDebounce = (func: Function, value = 250) => {
    let debounceTimer: ReturnType<typeof setTimeout>
    const debounce = (...args: any[]) => {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        func(...args)
      }, value)
    }
  
    return debounce
}
  