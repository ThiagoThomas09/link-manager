"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../page.module.css";

type Folder = {
  id: number;
  name: string;
};

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [newFolder, setNewFolder] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadFolders = async (token: string) => {
    try {
      const res = await fetch("/api/folders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 401) router.push("/");
        return;
      }
      const data = await res.json();
      setFolders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const run = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        router.push("/");
        return;
      }

      try {
        const res = await fetch("/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && !data?.error) {
          setUser(data);
          await loadFolders(token);
        } else {
          router.push("/");
        }
      } catch (err) {
        console.error(err);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [router]);

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    const name = newFolder.trim();
    if (!name) return;

    const res = await fetch("/api/folders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });

    if (res.ok) {
      setNewFolder("");
      await loadFolders(token);
    } else {
      const { error } = await res.json().catch(() => ({ error: "" }));
      alert(error || "Erro ao criar pasta");
    }
  };

  const handleRenameFolder = async (id: number) => {
    const raw = prompt("Novo nome da pasta:");
    const newName = (raw ?? "").trim();
    if (!newName) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch("/api/folders", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id, name: newName }),
    });

    if (res.ok) {
      await loadFolders(token);
    } else {
      const { error } = await res.json().catch(() => ({ error: "" }));
      alert(error || "Erro ao renomear pasta");
    }
  };

  const handleDeleteFolder = async (id: number) => {
    const confirmar = confirm("Tem certeza que deseja excluir esta pasta?");
    if (!confirmar) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch(`/api/folders?id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      await loadFolders(token);
    } else {
      const { error } = await res.json().catch(() => ({ error: "" }));
      alert(error || "Erro ao apagar pasta");
    }
  };

  if (loading) return <p className={styles.message}>Carregando...</p>;

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.welcome}>Dashboard</h1>
        <p>Você está logado como: <strong>{user?.email}</strong></p>

        <div className={styles.folderBox}>
          <h2>Suas Pastas</h2>
          {folders.length === 0 ? (
            <p>Nenhuma pasta criada ainda.</p>
          ) : (
            <ul className={styles.folderList}>
              {folders.map((f) => (
                <li key={f.id} className={styles.folderItem}>
                  <span>{f.name}</span>
                  <div className={styles.folderActions}>
                    <button
                      onClick={() => handleRenameFolder(f.id)}
                      className={styles.editBtn}
                    >
                      editar
                    </button>
                    <button
                      onClick={() => handleDeleteFolder(f.id)}
                      className={styles.deleteBtn}
                    >
                      apagar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleCreateFolder} className={styles.form}>
            <input
              type="text"
              placeholder="Nome da pasta"
              value={newFolder}
              onChange={(e) => setNewFolder(e.target.value)}
              required
            />
            <button type="submit">Criar Pasta</button>
          </form>
        </div>
      </main>
    </div>
  );
}
