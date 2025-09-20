"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import styles from "../../page.module.css";
import { Folder as FolderIcon, Edit, Trash, Save, X, ExternalLink } from "lucide-react";

type LinkItem = {
  id: number;
  title: string;
  url: string;
  notes?: string | null;
};

export default function FolderPage() {
  const router = useRouter();
  const params = useParams();
  const folderId = params?.id as string;

  const [folderName, setFolderName] = useState<string>("");
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string>("");

  // criação
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newNotes, setNewNotes] = useState("");

  // edição inline
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  async function loadLinks(tok: string) {
    try {
      const res = await fetch(`/api/links?folderId=${folderId}`, {
        headers: { Authorization: `Bearer ${tok}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setLinks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadFolderName(tok: string) {
    try {
      const res = await fetch(`/api/folders`, {
        headers: { Authorization: `Bearer ${tok}` },
      });
      if (!res.ok) return;
      const all = await res.json();
      const f = (Array.isArray(all) ? all : []).find((x: any) => Number(x.id) === Number(folderId));
      if (f) setFolderName(f.name);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    if (!token) {
      router.push("/");
      return;
    }
    (async () => {
      await Promise.all([loadLinks(token), loadFolderName(token)]);
      setLoading(false);
    })();
  }, [router, folderId]);

  // criar link
  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const title = newTitle.trim();
    const url = newUrl.trim().startsWith("http")
        ? newUrl.trim()
        : `https://${newUrl.trim()}`;
    const notes = newNotes.trim();

    if (!title || !url) return;

    const res = await fetch("/api/links", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        folderId: Number(folderId),
        title,
        url,
        notes: notes || undefined,
      }),
    });

    if (res.ok) {
      setNewTitle("");
      setNewUrl("");
      setNewNotes("");
      await loadLinks(token);
      setMessage("");
    } else {
      const { error } = await res.json().catch(() => ({ error: "" }));
      setMessage(error || "Erro ao criar link");
    }
  };

  // entrar em modo edição
  const startEdit = (link: LinkItem) => {
    setEditingId(link.id);
    setEditTitle(link.title);
    setEditUrl(link.url);
    setEditNotes(link.notes ?? "");
  };

  // cancelar edição
  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditUrl("");
    setEditNotes("");
  };

  // salvar edição
  const saveEdit = async () => {
    if (!token || editingId === null) return;
    const title = editTitle.trim();
    const url = editUrl.trim();
    const notes = editNotes.trim();

    if (!title || !url) return;

    const res = await fetch("/api/links", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        id: editingId,
        title,
        url,
        notes: notes || undefined,
      }),
    });

    if (res.ok) {
      await loadLinks(token);
      cancelEdit();
      setMessage("");
    } else {
      const { error } = await res.json().catch(() => ({ error: "" }));
      setMessage(error || "Erro ao atualizar link");
    }
  };

  // deletar link
  const handleDeleteLink = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este link?")) return;
    if (!token) return;

    const res = await fetch(`/api/links?id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      await loadLinks(token);
      setMessage("");
    } else {
      const { error } = await res.json().catch(() => ({ error: "" }));
      setMessage(error || "Erro ao excluir link");
    }
  };

  if (loading) return <p className={styles.message}>Carregando...</p>;

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <button onClick={() => router.push("/dashboard")} className={styles.toggle} style={{ marginRight: 12 }}>
            Voltar
        </button>
        <h1 className={styles.welcome} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <FolderIcon size={26} />
          {folderName}
        </h1>

        {!!message && <p className={styles.message}>{message}</p>}

        <div className={styles.folderBox}>
            <form onSubmit={handleCreateLink} className={styles.form} style={{ marginBottom: 20 }}>
                <input
                type="text"
                placeholder="Título"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                />
                <input
                type="text"
                placeholder="URL"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                required
                />
                <input
                type="text"
                placeholder="Notas (opcional)"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                />
                <button type="submit">Adicionar Link</button>
            </form>

            {/* Lista */}
            {links.length === 0 ? (
                <p>Nenhum link criado ainda.</p>
            ) : (
                <ul className={styles.linkList}>
                {links.map((link) => (
                    <li key={link.id} className={styles.linkCard}>
                    {editingId === link.id ? (
                        <div className={styles.editForm}>
                        <div className={styles.linkHeader}>
                            <input
                            type="text"
                            placeholder="Título"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            />
                            <div className={styles.linkActions}>
                            <button onClick={saveEdit} className={`${styles.iconBtn} ${styles.saveBtn}`} title="Salvar">
                                <Save size={18} />
                            </button>
                            <button onClick={cancelEdit} className={`${styles.iconBtn} ${styles.cancelBtn}`} title="Cancelar">
                                <X size={18} />
                            </button>
                            </div>
                        </div>
                        <input
                            type="url"
                            placeholder="URL"
                            value={editUrl}
                            onChange={(e) => setEditUrl(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Notas (opcional)"
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                        />
                        </div>
                    ) : (
                        <>
                        <div className={styles.linkHeader}>
                            <div className={styles.linkTitle}>{link.title}</div>
                            <div className={styles.linkActions}>
                            <button onClick={() => startEdit(link)} className={`${styles.iconBtn} ${styles.editBtn}`} title="Editar">
                                <Edit size={18} />
                            </button>
                            <button onClick={() => handleDeleteLink(link.id)} className={`${styles.iconBtn} ${styles.deleteBtn}`} title="Apagar">
                                <Trash size={18} />
                            </button>
                            </div>
                        </div>

                        <div className={styles.linkUrl}>
                            <a href={link.url} target="_blank" rel="noreferrer">
                            <ExternalLink size={16} style={{ marginRight: 6, verticalAlign: "-2px" }} />
                            {link.url}
                            </a>
                        </div>

                        {link.notes && <div className={styles.linkNotes}>{link.notes}</div>}
                        </>
                    )}
                    </li>
                ))}
                </ul>
            )}
        </div>
      </main>
    </div>
  );
}
