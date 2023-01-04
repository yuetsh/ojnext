const localStorage = window.localStorage;

export default {
  set(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  get(key: string) {
    const content = localStorage.getItem(key);
    if (content) {
      return JSON.parse(content);
    } else {
      return null;
    }
  },
  remove(key: string) {
    localStorage.removeItem(key);
  },
  clear() {
    localStorage.clear();
  },
};
