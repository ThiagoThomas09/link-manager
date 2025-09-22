"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./Header.module.css";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLogged(!!token);
  }, [pathname]);

  const createClassName = (href: string, isActive?: (pathname: string) => boolean) => {
    const active = isActive ? isActive(pathname) : pathname === href;
    return active ? `${styles.navLink} ${styles.active}` : styles.navLink;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLogged(false);
    router.push("/");
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href={isLogged ? "/dashboard" : "/"} className={styles.brand}>
          Link Manager
        </Link>
        <nav className={styles.nav}>
          {isLogged ? (
            <>
              <Link
                href="/dashboard"
                className={createClassName("/dashboard", (p) =>
                  p.startsWith("/dashboard") || p.startsWith("/folders")
                )}
              >
                Dashboard
              </Link>
              <button onClick={handleLogout} className={styles.logoutBtn}>
                Sair
              </button>
            </>
          ) : (
            <>
              <Link href="/" className={createClassName("/", (p) => p === "/")}>
                Login
              </Link>
              <Link href="/register" className={createClassName("/register")}>
                Cadastro
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
