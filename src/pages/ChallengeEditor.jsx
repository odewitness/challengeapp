import { useMemo, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { parseVideoRef, watchUrl, SOURCE_LABEL } from '../lib/video'
import { useToast } from '../components/toastContext'

const EMPTY_SESSION = {
  semaine: 1,
  jour: 1,
  titre: '',
  videoInput: '',
  duree_min: '',
  categorie: '',
  materiel: '',
  texte: '',
}

export default function ChallengeEditor({ data }) {
  const { challengeId } = useParams()
  const isNew = !challengeId
  const navigate = useNavigate()
  const showToast = useToast()
  const {
    loading,
    findChallenge,
    canEditChallenge,
    getChallengeWeeks,
    createChallenge,
    updateChallenge,
    deleteChallenge,
    saveExercise,
    deleteExercise,
    moveExercise,
  } = data

  if (loading && !isNew) return <div className="page">Chargement…</div>

  if (isNew) return <NewChallenge createChallenge={createChallenge} navigate={navigate} />

  const challenge = findChallenge(challengeId)
  if (!challenge || !canEditChallenge(challengeId)) {
    return (
      <div className="page">
        <p style={{ marginBottom: 12 }}>Ce challenge ne peut pas être modifié.</p>
        <Link to="/challenges" className="btn btn-ghost">
          Retour aux challenges
        </Link>
      </div>
    )
  }

  return (
    <ExistingChallenge
      key={challengeId}
      challenge={challenge}
      weeks={getChallengeWeeks(challengeId)}
      updateChallenge={updateChallenge}
      deleteChallenge={deleteChallenge}
      saveExercise={saveExercise}
      deleteExercise={deleteExercise}
      moveExercise={moveExercise}
      navigate={navigate}
      showToast={showToast}
    />
  )
}

function NewChallenge({ createChallenge, navigate }) {
  const [nom, setNom] = useState('')
  const [description, setDescription] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!nom.trim() || busy) return
    setBusy(true)
    try {
      const created = await createChallenge({ nom, description })
      navigate(`/challenges/${created.id}/edit`, { replace: true })
    } catch (err) {
      setBusy(false)
      alert('Création impossible : ' + (err.message ?? err))
    }
  }

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate('/challenges')}>
        ← Tous les challenges
      </button>
      <span className="eyebrow">Nouveau</span>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Créer un challenge</h1>

      <form onSubmit={submit} className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Field label="Nom">
          <input value={nom} onChange={(e) => setNom(e.target.value)} required autoFocus />
        </Field>
        <Field label="Description (facultatif)">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </Field>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? 'Création…' : 'Créer et ajouter des séances'}
        </button>
      </form>

      <EditorStyles />
    </div>
  )
}

function ExistingChallenge({
  challenge,
  weeks,
  updateChallenge,
  deleteChallenge,
  saveExercise,
  deleteExercise,
  moveExercise,
  navigate,
  showToast,
}) {
  const [nom, setNom] = useState(challenge.nom)
  const [description, setDescription] = useState(challenge.description ?? '')
  const [ordre, setOrdre] = useState(challenge.ordre_affichage ?? 100)
  const [savingInfo, setSavingInfo] = useState(false)

  const [editing, setEditing] = useState(null) // null | 'new' | exerciseId
  const [form, setForm] = useState(EMPTY_SESSION)
  const [formError, setFormError] = useState(null)
  const [savingSession, setSavingSession] = useState(false)

  const infoDirty =
    nom !== challenge.nom ||
    description !== (challenge.description ?? '') ||
    Number(ordre) !== (challenge.ordre_affichage ?? 100)

  const allSessions = useMemo(
    () => weeks.flatMap((w) => w.jours.flatMap((j) => j.exercises)),
    [weeks]
  )

  const saveInfo = async () => {
    if (!nom.trim() || savingInfo) return
    setSavingInfo(true)
    try {
      await updateChallenge(challenge.id, {
        nom: nom.trim(),
        description: description.trim(),
        ordre_affichage: Number(ordre) || 0,
      })
      showToast('Challenge enregistré')
    } catch (err) {
      alert('Enregistrement impossible : ' + (err.message ?? err))
    } finally {
      setSavingInfo(false)
    }
  }

  const openNew = () => {
    const lastWeek = allSessions.reduce((m, e) => Math.max(m, e.semaine), 1)
    const lastDay = allSessions
      .filter((e) => e.semaine === lastWeek)
      .reduce((m, e) => Math.max(m, e.jour), 1)
    setForm({ ...EMPTY_SESSION, semaine: lastWeek, jour: lastDay })
    setFormError(null)
    setEditing('new')
  }

  const openEdit = (ex) => {
    setForm({
      semaine: ex.semaine,
      jour: ex.jour,
      titre: ex.titre ?? '',
      videoInput: watchUrl({ source: ex.source ?? 'youtube', video_id: ex.video_id ?? '' }),
      duree_min: ex.duree_min ?? '',
      categorie: ex.categorie ?? '',
      materiel: ex.materiel ?? '',
      texte: ex.texte ?? '',
    })
    setFormError(null)
    setEditing(ex.id)
  }

  const closeForm = () => {
    setEditing(null)
    setForm(EMPTY_SESSION)
    setFormError(null)
  }

  const submitSession = async (e) => {
    e.preventDefault()
    if (savingSession) return
    const ref = parseVideoRef(form.videoInput)
    if (!form.titre.trim()) return setFormError('Le titre est obligatoire.')
    if (!ref) return setFormError('Lien non reconnu (YouTube ou Instagram).')

    setSavingSession(true)
    try {
      await saveExercise(challenge.id, {
        id: editing === 'new' ? undefined : editing,
        semaine: Number(form.semaine) || 1,
        jour: Number(form.jour) || 1,
        titre: form.titre.trim(),
        video_id: ref.video_id,
        source: ref.source,
        duree_min: form.duree_min === '' ? null : Number(form.duree_min),
        categorie: form.categorie.trim(),
        materiel: form.materiel.trim(),
        texte: form.texte.trim(),
      })
      showToast(editing === 'new' ? 'Séance ajoutée' : 'Séance modifiée')
      closeForm()
    } catch (err) {
      setFormError('Enregistrement impossible : ' + (err.message ?? err))
    } finally {
      setSavingSession(false)
    }
  }

  const removeSession = async (ex) => {
    if (!confirm(`Supprimer la séance « ${ex.titre} » ?`)) return
    try {
      await deleteExercise(ex.id)
      showToast('Séance supprimée')
    } catch (err) {
      alert('Suppression impossible : ' + (err.message ?? err))
    }
  }

  const removeChallenge = async () => {
    if (!confirm(`Supprimer le challenge « ${challenge.nom} » et toutes ses séances ?`)) return
    try {
      await deleteChallenge(challenge.id)
      navigate('/challenges', { replace: true })
    } catch (err) {
      alert('Suppression impossible : ' + (err.message ?? err))
    }
  }

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate(`/challenges/${challenge.id}`)}>
        ← Planning du challenge
      </button>
      <span className="eyebrow">Modifier</span>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>{challenge.nom}</h1>

      <div className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Field label="Nom">
          <input value={nom} onChange={(e) => setNom(e.target.value)} required />
        </Field>
        <Field label="Description">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </Field>
        <Field label="Ordre d'affichage">
          <input
            type="number"
            value={ordre}
            onChange={(e) => setOrdre(e.target.value)}
            style={{ maxWidth: 120 }}
          />
        </Field>
        <button className="btn btn-primary" onClick={saveInfo} disabled={!infoDirty || savingInfo}>
          {savingInfo ? 'Enregistrement…' : 'Enregistrer les infos'}
        </button>
      </div>

      <div className="editor-sessions-head">
        <h2 style={{ fontSize: 16 }}>Séances</h2>
        {editing !== 'new' && (
          <button className="btn btn-ghost" onClick={openNew}>
            + Ajouter
          </button>
        )}
      </div>

      {editing === 'new' && (
        <SessionForm
          form={form}
          setForm={setForm}
          onSubmit={submitSession}
          onCancel={closeForm}
          error={formError}
          busy={savingSession}
          title="Nouvelle séance"
        />
      )}

      {weeks.length === 0 && editing !== 'new' && (
        <p style={{ fontSize: 13, color: 'var(--color-ink-faint)' }}>
          Aucune séance pour l'instant. Clique sur « Ajouter ».
        </p>
      )}

      {weeks.map((w) => (
        <div key={w.semaine} className="editor-week">
          <span className="eyebrow">Semaine {w.semaine}</span>
          {w.jours.map((j) => (
            <div key={j.jour} className="card editor-day">
              <strong style={{ fontSize: 14 }}>Jour {j.jour}</strong>
              <ul className="editor-list">
                {j.exercises.map((ex, i) => (
                  <li key={ex.id}>
                    {editing === ex.id ? (
                      <SessionForm
                        form={form}
                        setForm={setForm}
                        onSubmit={submitSession}
                        onCancel={closeForm}
                        error={formError}
                        busy={savingSession}
                        title="Modifier la séance"
                      />
                    ) : (
                      <div className="editor-row">
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span className="editor-row-title">{ex.titre}</span>
                          <span className="editor-row-meta">
                            {ex.duree_min ? `${ex.duree_min} min` : 'durée ?'}
                            {ex.categorie ? ` · ${ex.categorie}` : ''}
                            {ex.source === 'instagram' ? ' · Instagram' : ''}
                          </span>
                        </div>
                        <div className="editor-row-actions">
                          <button
                            aria-label="Monter"
                            disabled={i === 0}
                            onClick={() => moveExercise(challenge.id, ex.id, 'up')}
                          >
                            ↑
                          </button>
                          <button
                            aria-label="Descendre"
                            disabled={i === j.exercises.length - 1}
                            onClick={() => moveExercise(challenge.id, ex.id, 'down')}
                          >
                            ↓
                          </button>
                          <button aria-label="Modifier" onClick={() => openEdit(ex)}>
                            ✏️
                          </button>
                          <button aria-label="Supprimer" onClick={() => removeSession(ex)}>
                            🗑
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}

      <button className="btn btn-ghost editor-delete" onClick={removeChallenge}>
        Supprimer ce challenge
      </button>

      <EditorStyles />
    </div>
  )
}

function SessionForm({ form, setForm, onSubmit, onCancel, error, busy, title }) {
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const parsed = parseVideoRef(form.videoInput)

  return (
    <form onSubmit={onSubmit} className="card editor-form">
      <strong style={{ fontSize: 14 }}>{title}</strong>
      <div className="editor-form-grid">
        <Field label="Semaine">
          <input type="number" min="1" value={form.semaine} onChange={set('semaine')} />
        </Field>
        <Field label="Jour">
          <input type="number" min="1" value={form.jour} onChange={set('jour')} />
        </Field>
      </div>
      <Field label="Titre">
        <input value={form.titre} onChange={set('titre')} required />
      </Field>
      <Field label="Lien vidéo (YouTube ou Instagram) ou ID YouTube">
        <input
          value={form.videoInput}
          onChange={set('videoInput')}
          placeholder="https://youtu.be/… ou https://www.instagram.com/reel/…"
          required
        />
      </Field>
      {form.videoInput.trim() !== '' && (
        <p className={`editor-hint${parsed ? '' : ' bad'}`}>
          {parsed
            ? `${SOURCE_LABEL[parsed.source]} reconnu : ${parsed.video_id}`
            : 'Lien non reconnu'}
        </p>
      )}
      <div className="editor-form-grid">
        <Field label="Durée (min)">
          <input type="number" min="0" value={form.duree_min} onChange={set('duree_min')} />
        </Field>
        <Field label="Catégorie">
          <input value={form.categorie} onChange={set('categorie')} />
        </Field>
      </div>
      <Field label="Matériel (séparé par des virgules)">
        <input value={form.materiel} onChange={set('materiel')} placeholder="tapis, sangle" />
      </Field>
      <Field label="Consigne / notes (facultatif)">
        <textarea value={form.texte} onChange={set('texte')} rows={3} />
      </Field>
      {error && <p className="editor-hint bad">{error}</p>}
      <div style={{ display: 'flex', gap: 10 }}>
        <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={busy}>
          {busy ? 'Enregistrement…' : 'Enregistrer'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Annuler
        </button>
      </div>
    </form>
  )
}

function Field({ label, children }) {
  return (
    <label className="editor-field">
      <span>{label}</span>
      {children}
    </label>
  )
}

function EditorStyles() {
  return (
    <style>{`
      .editor-field { display: flex; flex-direction: column; gap: 4px; font-size: 13px; font-weight: 600; }
      .editor-field input, .editor-field textarea {
        width: 100%; padding: 10px 12px; font-size: 14px;
        font-family: var(--font-body); color: var(--color-ink);
        background: var(--color-bg-raised);
        border: 1px solid var(--color-line); border-radius: 10px;
      }
      .editor-field textarea { resize: vertical; }
      .editor-sessions-head { display: flex; align-items: center; justify-content: space-between; margin: 26px 0 12px; }
      .editor-week { margin-bottom: 18px; }
      .editor-day { padding: 14px; margin-top: 8px; }
      .editor-list { list-style: none; margin: 8px 0 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
      .editor-row { display: flex; align-items: center; gap: 8px; }
      .editor-row-title { display: block; font-size: 14px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .editor-row-meta { display: block; font-family: var(--font-mono); font-size: 11px; color: var(--color-ink-faint); }
      .editor-row-actions { display: flex; gap: 2px; flex-shrink: 0; }
      .editor-row-actions button {
        width: 30px; height: 30px; border: 1px solid var(--color-line);
        background: var(--color-bg-raised); border-radius: 8px; font-size: 13px;
        color: var(--color-ink-soft);
      }
      .editor-row-actions button:disabled { opacity: 0.35; }
      .editor-form { padding: 14px; display: flex; flex-direction: column; gap: 10px; margin: 8px 0; }
      .editor-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      .editor-hint { font-size: 12px; color: var(--color-primary-dark); margin: -2px 0 0; }
      .editor-hint.bad { color: var(--color-danger); }
      .editor-delete { width: 100%; margin-top: 24px; color: var(--color-danger); border-color: var(--color-danger); }
    `}</style>
  )
}
