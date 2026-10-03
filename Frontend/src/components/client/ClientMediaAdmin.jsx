import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { ImagePlus, Trash2, Loader2, Plus, Save, Trophy, Images, RefreshCw } from "lucide-react";
import { apiErrorMessage } from "../../utils/apiError";

/* Admin-only management of a client's gallery and performance standings.
   Endpoints (admin):
   - GET/POST  /api/client/:id/gallery            (POST multipart `image`, optional `caption`)
   - DELETE    /api/client/:id/gallery/:imageId
   - GET/PUT   /api/client/:id/performance        (PUT {standings:[{teamName,played,won,lost,points}]}) */

const CHARCOAL = "#1A1A1D";
const GOLD = "#AD8A56";
const SLATE = "#7A756C";
const RUST = "#A24A32";
const SAGE = "#3F6B52";
const HAIRLINE = "rgba(26,26,29,0.10)";

const BACKEND = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/+$/, "");
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const resolveImageUrl = (url) => {
  if (!url || typeof url !== "string") return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `${BACKEND}/${url.replace(/^\/+/, "")}`;
};

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const NUMERIC_FIELDS = ["played", "won", "lost", "points"];

const Card = ({ icon, title, subtitle, children }) => (
  <section
    className="mt-8 rounded-[1.25rem] border bg-white/85 p-6 shadow-[0_1px_2px_rgba(26,26,29,0.04),0_30px_70px_-32px_rgba(26,26,29,0.22)] backdrop-blur-md sm:p-8"
    style={{ borderColor: HAIRLINE }}
  >
    <div className="mb-6 flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-full border" style={{ borderColor: HAIRLINE, color: GOLD }}>
        {icon}
      </span>
      <div>
        <h3 className="text-[15px] font-semibold" style={{ color: CHARCOAL }}>{title}</h3>
        {subtitle && <p className="text-[11.5px]" style={{ color: SLATE }}>{subtitle}</p>}
      </div>
    </div>
    {children}
  </section>
);

const Notice = ({ tone = "error", children }) => (
  <p
    role={tone === "error" ? "alert" : "status"}
    className="mt-3 text-[12px] font-medium"
    style={{ color: tone === "error" ? RUST : SAGE }}
  >
    {children}
  </p>
);

/* ================= GALLERY ================= */
export const ClientGalleryManager = ({ clientId }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [inputKey, setInputKey] = useState(0);

  const load = useCallback(async () => {
    try {
      const res = await axios.get(`${BACKEND}/api/client/${clientId}/gallery`, { headers: authHeaders() });
      setImages(Array.isArray(res.data?.images) ? res.data.images : []);
      setLoadError("");
    } catch (err) {
      setLoadError(apiErrorMessage(err, "Couldn't load the gallery."));
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    load();
  }, [load]);

  const onFileChange = (e) => {
    const picked = e.target.files?.[0] || null;
    setUploadError("");
    if (picked && !ACCEPTED_IMAGE_TYPES.includes(picked.type)) {
      setUploadError("Choose a JPEG, PNG or WebP image.");
      setFile(null);
      return;
    }
    setFile(picked);
  };

  const upload = async (e) => {
    e.preventDefault();
    if (uploading) return;
    if (!file) {
      setUploadError("Choose an image to upload.");
      return;
    }
    setUploading(true);
    setUploadError("");
    try {
      const fd = new FormData();
      fd.append("image", file);
      if (caption.trim()) fd.append("caption", caption.trim());
      const res = await axios.post(`${BACKEND}/api/client/${clientId}/gallery`, fd, { headers: authHeaders() });
      const created = res.data?.image;
      if (created && created._id) {
        setImages((prev) => [created, ...prev]);
      } else {
        await load();
      }
      setFile(null);
      setCaption("");
      setInputKey((k) => k + 1); // reset the file input
    } catch (err) {
      setUploadError(apiErrorMessage(err, "Upload failed."));
    } finally {
      setUploading(false);
    }
  };

  const remove = async (imageId) => {
    if (deletingId) return;
    if (!window.confirm("Delete this image from the client's gallery?")) return;
    setDeletingId(imageId);
    try {
      await axios.delete(`${BACKEND}/api/client/${clientId}/gallery/${imageId}`, { headers: authHeaders() });
      setImages((prev) => prev.filter((img) => img._id !== imageId));
    } catch (err) {
      alert(apiErrorMessage(err, "Couldn't delete this image."));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card icon={<Images size={16} strokeWidth={1.5} />} title="Client gallery" subtitle="Images shown on the client's dashboard">
      <form onSubmit={upload} className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="block">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: SLATE }}>Image</span>
          <input
            key={inputKey}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            onChange={onFileChange}
            className="mt-1.5 block w-full text-[12px]"
          />
        </label>
        <label className="block">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: SLATE }}>Caption (optional)</span>
          <input
            type="text"
            value={caption}
            maxLength={200}
            onChange={(e) => setCaption(e.target.value)}
            className="mt-1.5 w-full rounded-lg border bg-white px-3 py-2 text-[13px] outline-none"
            style={{ borderColor: HAIRLINE }}
          />
        </label>
        <button
          type="submit"
          disabled={uploading || !file}
          className="flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white disabled:cursor-not-allowed disabled:opacity-40"
          style={{ backgroundColor: CHARCOAL }}
        >
          {uploading ? <Loader2 size={13} className="animate-spin" /> : <ImagePlus size={13} />}
          {uploading ? "Uploading…" : "Upload"}
        </button>
      </form>
      {uploadError && <Notice>{uploadError}</Notice>}

      <div className="mt-6">
        {loading ? (
          <p className="text-[12px]" style={{ color: SLATE }}>Loading gallery…</p>
        ) : loadError ? (
          <div className="flex items-center gap-3">
            <Notice>{loadError}</Notice>
            <button
              type="button"
              onClick={() => { setLoading(true); load(); }}
              className="mt-3 flex items-center gap-1 text-[11px] font-semibold"
              style={{ color: SLATE }}
            >
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        ) : images.length === 0 ? (
          <p className="rounded-lg border border-dashed px-4 py-6 text-center text-[12.5px]" style={{ borderColor: HAIRLINE, color: SLATE }}>
            No gallery images yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((img) => (
              <figure key={img._id} className="group relative overflow-hidden rounded-lg border" style={{ borderColor: HAIRLINE }}>
                <img src={resolveImageUrl(img.url)} alt={img.caption || "Client gallery image"} className="h-32 w-full object-cover" />
                <figcaption className="truncate px-2 py-1.5 text-[11px]" style={{ color: SLATE }}>
                  {img.caption || "—"}
                </figcaption>
                <button
                  type="button"
                  onClick={() => remove(img._id)}
                  disabled={deletingId === img._id}
                  aria-label="Delete image"
                  className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 shadow disabled:opacity-50"
                  style={{ color: RUST }}
                >
                  {deletingId === img._id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                </button>
              </figure>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

/* ================= PERFORMANCE STANDINGS ================= */
const emptyRow = () => ({ key: `new-${Math.random().toString(36).slice(2)}`, teamName: "", played: "0", won: "0", lost: "0", points: "0" });

const toRow = (s, i) => ({
  key: s._id || `row-${i}`,
  teamName: s.teamName || "",
  played: String(s.played ?? 0),
  won: String(s.won ?? 0),
  lost: String(s.lost ?? 0),
  points: String(s.points ?? 0),
});

export const ClientStandingsEditor = ({ clientId }) => {
  const [rows, setRows] = useState([]);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await axios.get(`${BACKEND}/api/client/${clientId}/performance`, { headers: authHeaders() });
      const list = Array.isArray(res.data?.standings) ? res.data.standings : [];
      setRows(list.map(toRow));
      setUpdatedAt(res.data?.updatedAt || null);
      setLoadError("");
    } catch (err) {
      setLoadError(apiErrorMessage(err, "Couldn't load standings."));
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    load();
  }, [load]);

  const updateRow = (key, field, value) => {
    setSaved(false);
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
  };

  const addRow = () => {
    setSaved(false);
    setRows((prev) => [...prev, emptyRow()]);
  };

  const removeRow = (key) => {
    setSaved(false);
    setRows((prev) => prev.filter((r) => r.key !== key));
  };

  // Mirrors the server rules so most mistakes are caught before saving.
  const validate = () => {
    const seen = new Set();
    for (const [i, r] of rows.entries()) {
      const name = r.teamName.trim();
      if (!name) return `Row ${i + 1}: team name is required.`;
      if (seen.has(name.toLowerCase())) return `Row ${i + 1}: duplicate team name "${name}".`;
      seen.add(name.toLowerCase());
      for (const f of NUMERIC_FIELDS) {
        if (!/^\d+$/.test(String(r[f]).trim())) return `Row ${i + 1}: ${f} must be a whole number (0 or more).`;
      }
      if (Number(r.won) + Number(r.lost) > Number(r.played)) {
        return `Row ${i + 1}: won + lost cannot exceed played.`;
      }
    }
    return "";
  };

  const save = async () => {
    if (saving) return;
    const problem = validate();
    if (problem) {
      setSaveError(problem);
      return;
    }
    setSaving(true);
    setSaveError("");
    setSaved(false);
    try {
      const standings = rows.map((r) => ({
        teamName: r.teamName.trim(),
        played: Number(r.played),
        won: Number(r.won),
        lost: Number(r.lost),
        points: Number(r.points),
      }));
      const res = await axios.put(
        `${BACKEND}/api/client/${clientId}/performance`,
        { standings },
        { headers: authHeaders() }
      );
      if (Array.isArray(res.data?.standings)) setRows(res.data.standings.map(toRow));
      setUpdatedAt(res.data?.updatedAt || new Date().toISOString());
      setSaved(true);
    } catch (err) {
      setSaveError(apiErrorMessage(err, "Couldn't save standings."));
    } finally {
      setSaving(false);
    }
  };

  const updatedLabel = (() => {
    if (!updatedAt) return "Not published yet";
    const d = new Date(updatedAt);
    return isNaN(d.getTime()) ? "—" : `Last updated ${d.toLocaleString("en-IN")}`;
  })();

  const inputCls = "w-full rounded-md border bg-white px-2 py-1.5 text-[13px] outline-none";

  return (
    <Card icon={<Trophy size={16} strokeWidth={1.5} />} title="Performance standings" subtitle={updatedLabel}>
      {loading ? (
        <p className="text-[12px]" style={{ color: SLATE }}>Loading standings…</p>
      ) : loadError ? (
        <div className="flex items-center gap-3">
          <Notice>{loadError}</Notice>
          <button
            type="button"
            onClick={() => { setLoading(true); load(); }}
            className="mt-3 flex items-center gap-1 text-[11px] font-semibold"
            style={{ color: SLATE }}
          >
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left">
              <thead>
                <tr className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: SLATE }}>
                  <th className="pb-2 pr-2">Team</th>
                  <th className="pb-2 pr-2 w-20">Played</th>
                  <th className="pb-2 pr-2 w-20">Won</th>
                  <th className="pb-2 pr-2 w-20">Lost</th>
                  <th className="pb-2 pr-2 w-20">Points</th>
                  <th className="pb-2 w-10" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.key}>
                    <td className="py-1 pr-2">
                      <input
                        aria-label="Team name"
                        value={r.teamName}
                        maxLength={100}
                        onChange={(e) => updateRow(r.key, "teamName", e.target.value)}
                        className={inputCls}
                        style={{ borderColor: HAIRLINE }}
                      />
                    </td>
                    {NUMERIC_FIELDS.map((f) => (
                      <td key={f} className="py-1 pr-2">
                        <input
                          aria-label={f}
                          type="number"
                          min="0"
                          step="1"
                          value={r[f]}
                          onChange={(e) => updateRow(r.key, f, e.target.value)}
                          className={inputCls}
                          style={{ borderColor: HAIRLINE }}
                        />
                      </td>
                    ))}
                    <td className="py-1">
                      <button
                        type="button"
                        onClick={() => removeRow(r.key)}
                        aria-label="Remove row"
                        className="rounded-full p-1.5"
                        style={{ color: RUST }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-[12.5px]" style={{ color: SLATE }}>
                      No standings yet. Add a row to start the table.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={addRow}
              className="flex items-center gap-1.5 rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em]"
              style={{ borderColor: CHARCOAL, color: CHARCOAL }}
            >
              <Plus size={13} /> Add row
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-full px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white disabled:opacity-40"
              style={{ backgroundColor: CHARCOAL }}
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              {saving ? "Saving…" : "Save standings"}
            </button>
          </div>
          {saveError && <Notice>{saveError}</Notice>}
          {saved && <Notice tone="ok">Standings saved. The client sees the updated table.</Notice>}
        </>
      )}
    </Card>
  );
};

const ClientMediaAdmin = ({ clientId }) => {
  if (!clientId) return null;
  return (
    <>
      <ClientGalleryManager clientId={clientId} />
      <ClientStandingsEditor clientId={clientId} />
    </>
  );
};

export default ClientMediaAdmin;
