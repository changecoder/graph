export const addEventListener = (target: HTMLElement, eventType: string, callback: any) => {
  if (target) {
    if (typeof target.addEventListener === 'function') {
      target.addEventListener(eventType, callback, false)
      return {
        remove() {
          target.removeEventListener(eventType, callback, false)
        }
      }
    }
  }
}