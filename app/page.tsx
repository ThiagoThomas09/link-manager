"use client";

import { useState } from "react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const router = useRouter(); 


  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const endpoint = isLogin ? "/api/login" : "/api/auth/register";

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token);
      setMessage(`Bem-vindo, ${data.email}!`);
      router.push("/dashboard");
    } else {
      setMessage(data.error);
    }
  } catch (err: any) {
    setMessage("Erro ao conectar com o servidor.");
    console.error(err);
  }
};


  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.welcome}>Bem-vindo!</h1>

        <div className={styles.loginBox}>
          <h2>{isLogin ? "Login" : "Cadastro"}</h2>

          <form onSubmit={handleSubmit} className={styles.form}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">{isLogin ? "Entrar" : "Registrar"}</button>
          </form>

          {message && <p className={styles.message}>{message}</p>}

            <p className={styles.toggleText}>
            Não tem conta?{" "}
            <button onClick={() => router.push("/register")} className={styles.toggle}>
              Cadastre-se
            </button>
            </p>
        </div>
      </main>
    </div>
  );
}
