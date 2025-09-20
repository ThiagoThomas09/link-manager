"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../page.module.css";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setMessage("✅ Usuário criado com sucesso! Redirecionando...");
        setTimeout(() => router.push("/"), 2000); 
      } else {
        setSuccess(false);
        setMessage(data.error || "Erro ao registrar.");
      }
    } catch (err: any) {
      setSuccess(false);
      setMessage("Erro ao conectar com o servidor.");
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.welcome}>Cadastro</h1>

        <div className={styles.loginBox}>
          <form onSubmit={handleRegister} className={styles.form}>
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
            <button type="submit">Registrar</button>
          </form>

          {message && (
            <p
              className={styles.message}
              style={{ color: success ? "green" : "red" }}
            >
              {message}
            </p>
          )}

          <p className={styles.toggleText}>
            Já tem conta?{" "}
            <button onClick={() => router.push("/")} className={styles.toggle}>
              Faça login
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
