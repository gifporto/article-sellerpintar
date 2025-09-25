declare module "js-cookie" {
  interface CookiesStatic<T = any> {
    get(name: string): string | undefined;
    set(name: string, value: string, options?: T): void;
    remove(name: string, options?: T): void;
  }
  const Cookies: CookiesStatic;
  export default Cookies;
}
