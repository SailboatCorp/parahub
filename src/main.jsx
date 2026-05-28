import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const API = '/api';
const eventTypes = [
  { type: 'EMF', label: 'EMF', icon: '⚡', unit: 'mG', readingKey: 'emf' },
  { type: 'Temp', label: 'Temp', icon: '🌡️', unit: '°C', readingKey: 'temp' },
  { type: 'Sound', label: 'Sound', icon: '🔊', unit: 'dB', readingKey: 'sound' },
  { type: 'Voice', label: 'Voice note', icon: '🎙️' },
  { type: 'Photo', label: 'Photo note', icon: '📷' },
  { type: 'Motion', label: 'Motion', icon: '👣' },
  { type: 'Note', label: 'Note', icon: '📝' },
];



const CURRENT_TERMS_VERSION = '1.0';
const CURRENT_PRIVACY_VERSION = '1.0';
const TUTORIAL_VIDEO_URL = 'https://www.youtube.com/watch?v=kgVRi-xDDu4';
const TUTORIAL_EMBED_URL = 'https://www.youtube.com/embed/kgVRi-xDDu4?autoplay=1&playsinline=1&rel=0&modestbranding=1';

const creditPreferenceOptions = [
  'Anonymous investigator',
  'First name only',
  'Full name',
  'Custom credit name',
  'Do not publicly credit me',
];

const termsSummary = [
  'ParaHub is operated by Kaiden Jones for paranormal investigation, research, evidence logging, reports, archives, and related project use.',
  'Participation is voluntary and unpaid.',
  'Case materials, notes, uploads, readings, reports, and evidence submitted through ParaHub may be used by Kaiden Jones for research, analysis, publication, presentation, archiving, and future related work.',
  'You will only upload material you created yourself or have permission to use.',
  'You will not upload people’s faces, children, private documents, addresses, or unnecessary personal information as evidence.',
  'Evidence uploads should focus on surroundings, rooms, objects, equipment, environmental details, and case-relevant observations.',
  'You will not fake, stage, alter, delete, mislabel, or misrepresent evidence.',
  'You understand that public outputs may anonymise you by default unless named credit is agreed separately later.',
  'You agree to keep private case materials confidential.',
];

const fullTermsText = `ParaHub is operated by Kaiden Jones for paranormal investigation, case management, evidence logging, research, reporting, archiving, and related project use.

Participation in ParaHub investigations is voluntary and unpaid. Users are not employees, workers, contractors, partners, co-owners, or paid researchers unless a separate written agreement says otherwise.

User roles may include admin, investigator, viewer, guest, or other roles added in the future. Users must only access the cases, tools, evidence, and records they are authorised to access.

The ParaHub case structure, final case record, research framing, reports, exports, summaries, software design, and public outputs are controlled by Kaiden Jones.

Users may retain any copyright they personally own in material they create, unless a separate written agreement says otherwise. By uploading, submitting, recording, writing, or contributing material to ParaHub, users grant Kaiden Jones a permanent, worldwide, royalty-free, non-exclusive licence to use, copy, store, edit, analyse, publish, display, adapt, archive, distribute, and include that material in ParaHub, investigation reports, research outputs, publications, presentations, websites, videos, educational materials, software development, and future related projects.

Users must not upload photographs, videos, screenshots, or recordings that clearly show a person’s face, body, identity, private information, or personal belongings unless there is a clear reason and permission has been obtained.

ParaHub evidence uploads should focus on the investigation environment, not on identifying people. Acceptable evidence may include rooms, hallways, doors, windows, objects, equipment, environmental conditions, marks, movement, damage, shadows, reflections, or visual anomalies.

Users should avoid uploading close-up images of faces, photos of witnesses, residents, staff, neighbours, members of the public, images of children, private documents, addresses, letters, bank cards, medical information, personal belongings, screenshots, messages, or anything that identifies private individuals.

If a person accidentally appears in an image or video, the user should avoid uploading it where possible. If the material is important to the case, the user should blur, crop, obscure, or otherwise remove identifying features before upload where practical.

Kaiden Jones may remove, reject, anonymise, blur, crop, or restrict uploaded material that contains unnecessary personal information or identifiable people.

Users must not fake, stage, alter, delete, mislabel, exaggerate, or misrepresent evidence. If evidence has been edited, cleaned, cropped, enhanced, or processed, that should be clearly marked where relevant.

ParaHub may log who uploaded evidence, when it was uploaded, which case it belongs to, which room or area it relates to, and whether it was reviewed, rejected, edited, exported, archived, or published.

Device readings, environmental readings, audio anomalies, video anomalies, photographs, notes, and field observations are logged for review and research. They do not automatically prove paranormal activity, scientific causation, danger, or any final conclusion.

ParaHub must not be used to make medical, legal, spiritual, mental health, safety, or emergency claims. It must not be used to tell people they are haunted, possessed, cursed, mentally ill, unsafe, or in danger. ParaHub does not replace doctors, police, landlords, electricians, emergency services, legal advice, or professional safety checks.

Users must not use ParaHub for trespassing, breaking into buildings, entering restricted areas, filming on private land without permission, publishing private addresses without approval, or disturbing residents, staff, neighbours, animals, or members of the public.

Users are responsible for acting safely during investigations. Users must avoid unsafe access, climbing, blocked exits, damaged structures, exposed electrics, dangerous buildings, restricted areas, and any behaviour that creates unnecessary risk.

Users must protect third parties. Users should avoid collecting unnecessary information about residents, witnesses, neighbours, staff, property owners, children, vulnerable people, or members of the public.

Users must keep their account secure. They must not share logins, leak access links, access cases they were not invited to, misuse another person’s account, or allow unauthorised people to view private case material.

Raw evidence, witness details, private locations, screenshots, exports, internal notes, unpublished reports, and private case data must not be shared publicly without permission from Kaiden Jones.

Viewer-only users may view authorised material only. They must not copy, publish, leak, redistribute, download, or claim ParaHub case materials unless permission has been given.

Kaiden Jones has final control over reports, videos, screenshots, case studies, publications, research summaries, conclusions, public wording, and editorial decisions relating to ParaHub case materials.

ParaHub is provided as-is. Kaiden Jones will try to keep the software useful and reliable, but does not guarantee perfect access, uninterrupted service, permanent storage, no bugs, or recovery of lost or deleted data.

ParaHub may create backups, exports, archives, and copies of case data for preservation, security, research, reporting, and evidence integrity.

Users must not upload illegal content, stolen content, private messages without permission, sexual content, images of children, bank details, passwords, medical records, fabricated evidence, copyrighted material they do not have permission to use, or any material that unnecessarily exposes private people.

Kaiden Jones may update these terms. If the terms or privacy notice are updated, users may be asked to accept the new version before continuing to use ParaHub.

These terms are governed by the laws of England and Wales.`;

const privacyNoticeText = `ParaHub may collect and store information connected to user accounts, investigations, cases, evidence uploads, notes, readings, reports, timestamps, uploaded files, and user activity inside the app.

This may include usernames, display names, email addresses if used by the app, user roles, case access permissions, evidence uploads, written notes, environmental readings, audio files, video files, photographs, timestamps, room names, case names, comments, reports, and acceptance records for terms and privacy notices.

ParaHub uses this information for case management, paranormal investigation, research, evidence review, reporting, archiving, safety, software operation, account access, and project administration.

Users should not upload unnecessary personal information. Users should not upload people’s faces, children, private documents, addresses, bank details, medical information, private messages, or other identifiable personal information unless there is a clear case-relevant reason and permission has been obtained.

Where possible, public outputs may anonymise investigators, witnesses, third parties, and private individuals.

By default, investigators may be referred to as “Investigator”, “Investigator A”, or “the investigation team” in public outputs unless named credit is agreed separately later.

Case records may be kept long-term for research integrity, comparison, archive use, evidence review, reporting, and project history.

Users may stop participating in an investigation, but materials already submitted may continue to be stored and used where needed for research integrity, case continuity, safety, lawful use, archive purposes, or accurate reporting.

Users may ask Kaiden Jones about their data, request correction of inaccurate information, or ask whether identifying details can be removed from future public outputs. Some case materials may need to be retained where they form part of an investigation record.

Private case materials should only be accessed by authorised users.

Kaiden Jones may remove, restrict, anonymise, blur, crop, or delete material where appropriate.`;

function userHasAcceptedCurrentTerms(user) {
  return Boolean(
    user?.acceptedTerms &&
    user?.acceptedTermsVersion === CURRENT_TERMS_VERSION &&
    user?.acceptedPrivacyVersion === CURRENT_PRIVACY_VERSION
  );
}

function token() { return localStorage.getItem('parahub_token') || ''; }
function setToken(value) { value ? localStorage.setItem('parahub_token', value) : localStorage.removeItem('parahub_token'); }

async function api(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData)) headers.set('content-type', 'application/json');
  if (token()) headers.set('authorization', `Bearer ${token()}`);
  const res = await fetch(`${API}${path}`, { ...options, headers });
  const type = res.headers.get('content-type') || '';
  const data = type.includes('application/json') ? await res.json() : await res.text();
  if (!res.ok) throw new Error(data?.error || data || 'Something went wrong');
  return data;
}


async function compressImageFile(file, maxSide = 1280, quality = 0.72) {
  if (!file || !file.type?.startsWith('image/')) return file;
  const imageUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = imageUrl;
    });
    const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
    const width = Math.max(1, Math.round(img.width * scale));
    const height = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

function Pill({ children, tone = 'default' }) { return <span className={`pill ${tone}`}>{children}</span>; }
function Card({ children, className = '' }) { return <section className={`card ${className}`}>{children}</section>; }
function Button({ children, onClick, variant = 'default', type = 'button', disabled = false }) { return <button type={type} disabled={disabled} onClick={onClick} className={`btn ${variant}`}>{children}</button>; }
function Field({ label, value, setValue, placeholder = '', type = 'text' }) {
  return <label className="field"><span>{label}</span><input type={type} value={value} placeholder={placeholder} onChange={(e) => setValue(e.target.value)} /></label>;
}
function Select({ label, value, setValue, children }) { return <label className="field"><span>{label}</span><select value={value} onChange={(e) => setValue(e.target.value)}>{children}</select></label>; }

function Setup({ onDone }) {
  const [username, setUsername] = useState('kaiden');
  const [displayName, setDisplayName] = useState('Kaiden');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      await api('/setup', { method: 'POST', body: JSON.stringify({ username, display_name: displayName, password }) });
      onDone();
    } catch (err) { setError(err.message); }
  }
  return <main className="shell center"><Card className="login-card"><div className="logo">🌙</div><h1>Create your ParaHub admin account</h1><p>This is the first launch setup. No email required. Create the main admin login you will use to create cases and user accounts for investigators.</p><form onSubmit={submit} className="stack"><Field label="Username" value={username} setValue={setUsername} /><Field label="Display name" value={displayName} setValue={setDisplayName} /><Field label="Password, minimum 8 characters" value={password} setValue={setPassword} type="password" />{error && <div className="error">{error}</div>}<Button type="submit" variant="primary">Create admin account</Button></form></Card></main>;
}

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      const data = await api('/login', { method: 'POST', body: JSON.stringify({ username, password }) });
      setToken(data.token);
      onLogin(data.user);
    } catch (err) { setError(err.message); }
  }
  return <main className="shell center"><div className="login-grid"><Card><div className="logo">🌙</div><p className="eyebrow">ParaHub</p><h1>Secure investigation workspace</h1><p>Private paranormal investigation hub with admin accounts, field loggers, photo notes, voice notes, shared timeline, and case access controls.</p><div className="feature-grid"><div>💻<strong>Admin hub</strong><span>Watch the team timeline.</span></div><div>📱<strong>Field mode</strong><span>Fast mobile logging.</span></div><div>🔐<strong>Private</strong><span>Assigned cases only.</span></div></div></Card><Card><h2>Login</h2><form onSubmit={submit} className="stack"><Field label="Username" value={username} setValue={setUsername} /><Field label="Password" value={password} setValue={setPassword} type="password" />{error && <div className="error">{error}</div>}<Button type="submit" variant="primary">Log in</Button></form></Card></div></main>;
}

function Tutorial({ onClose }) {
  return <div className="modal-backdrop"><Card className="modal video-modal"><div className="modal-head"><div><p className="eyebrow">Investigator tutorial</p><h2>How to use ParaHub</h2><p>This tutorial was created for ParaHub investigators. Watch it once after accepting the terms, then reopen it any time from the Tutorial button.</p></div><Button onClick={onClose}>✕</Button></div><div className="video-frame"><iframe title="ParaHub investigator tutorial" src={TUTORIAL_EMBED_URL} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"></iframe></div><div className="tutorial-note"><strong>Quick reminder</strong><p>Select the correct room before logging evidence. Keep notes short. Mention normal causes. Do not upload faces, children, private documents, addresses, or unnecessary personal information.</p></div><div className="actions end"><a className="btn" href={TUTORIAL_VIDEO_URL} target="_blank" rel="noreferrer">Open on YouTube</a><Button onClick={onClose} variant="primary">Continue to ParaHub</Button></div></Card></div>;
}


function TermsTextBlock({ title, text }) {
  return <div className="terms-document"><h3>{title}</h3>{text.split('\n\n').map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>;
}

function TermsAcceptance({ user, onAccepted }) {
  const [checked, setChecked] = useState(false);
  const [view, setView] = useState('summary');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function accept() {
    if (!checked || saving) return;
    setSaving(true);
    setError('');
    try {
      const data = await api('/terms', { method: 'POST', body: JSON.stringify({ accepted: true }) });
      onAccepted(data.user);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return <main className="shell center terms-shell"><Card className="terms-card"><div className="logo">🌙</div><p className="eyebrow">First login agreement</p><h1>Welcome to ParaHub</h1><p>Before using ParaHub, you must accept the ParaHub Terms of Use, Research Participation Agreement, Upload Rules, and Privacy Notice.</p><div className="chips"><Pill tone="blue">Terms v{CURRENT_TERMS_VERSION}</Pill><Pill tone="blue">Privacy v{CURRENT_PRIVACY_VERSION}</Pill><Pill>{user.display_name}</Pill></div><div className="terms-tabs"><Button variant={view === 'summary' ? 'primary' : 'default'} onClick={() => setView('summary')}>Summary</Button><Button variant={view === 'terms' ? 'primary' : 'default'} onClick={() => setView('terms')}>View full terms</Button><Button variant={view === 'privacy' ? 'primary' : 'default'} onClick={() => setView('privacy')}>View privacy notice</Button></div>{view === 'summary' && <div className="terms-panel"><h2>What you are agreeing to</h2><ul className="terms-list">{termsSummary.map((item) => <li key={item}>{item}</li>)}</ul></div>}{view === 'terms' && <div className="terms-panel scroll-panel"><TermsTextBlock title="ParaHub Terms of Use and Research Participation Agreement" text={fullTermsText} /></div>}{view === 'privacy' && <div className="terms-panel scroll-panel"><TermsTextBlock title="ParaHub Privacy Notice" text={privacyNoticeText} /></div>}<label className="check-row"><input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} /><span>I have read and agree to the ParaHub Terms of Use, Research Participation Agreement, Upload Rules, and Privacy Notice.</span></label>{error && <div className="error">{error}</div>}<div className="actions end"><Button variant="primary" disabled={!checked || saving} onClick={accept}>{saving ? 'Saving acceptance…' : 'Accept and Continue'}</Button></div></Card></main>;
}

function AccountManager({ users, refreshUsers, onClose }) {
  const [form, setForm] = useState({ username: '', display_name: '', password: '', role: 'investigator', credit_preference: 'Anonymous investigator', custom_credit_name: '' });
  const [error, setError] = useState('');
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  async function create(e) {
    e.preventDefault();
    setError('');
    try {
      await api('/users', { method: 'POST', body: JSON.stringify(form) });
      setForm({ username: '', display_name: '', password: '', role: 'investigator', credit_preference: 'Anonymous investigator', custom_credit_name: '' });
      await refreshUsers();
    } catch (err) { setError(err.message); }
  }
  return <div className="modal-backdrop"><Card className="modal wide"><div className="modal-head"><div><p className="eyebrow">Admin</p><h2>User accounts</h2><p>Create local ParaHub login accounts for investigators and viewers. No email required. Give each person their username and password.</p></div><Button onClick={onClose}>✕</Button></div><div className="split"><form onSubmit={create} className="stack"><Field label="Username" value={form.username} setValue={(v) => set('username', v)} /><Field label="Display name" value={form.display_name} setValue={(v) => set('display_name', v)} /><Field label="Password" value={form.password} setValue={(v) => set('password', v)} type="password" /><Select label="Role" value={form.role} setValue={(v) => set('role', v)}><option value="investigator">Investigator</option><option value="viewer">Viewer</option><option value="admin">Admin</option></Select><Select label="Public credit preference, for future reports/publications only" value={form.credit_preference} setValue={(v) => set('credit_preference', v)}>{creditPreferenceOptions.map((option) => <option key={option} value={option}>{option}</option>)}</Select><p className="help-text">This does not change the name shown inside ParaHub. It only records how this person should be credited later if case material is used in reports, research, videos, presentations, archives, or public outputs. Default is anonymous.</p>{form.credit_preference === 'Custom credit name' && <Field label="Custom credit name" value={form.custom_credit_name} setValue={(v) => set('custom_credit_name', v)} />}{error && <div className="error">{error}</div>}<Button type="submit" variant="primary">Create account</Button></form><div className="list">{users.map((u) => <div key={u.id} className="list-row"><div><strong>{u.display_name}</strong><span>@{u.username}</span><small>Public credit: {u.credit_preference || u.creditPreference || 'Anonymous investigator'}</small></div><Pill tone={u.role === 'admin' ? 'blue' : u.role === 'viewer' ? 'purple' : 'default'}>{u.role}</Pill></div>)}</div></div></Card></div>;
}

function Dashboard({ user, setUser, users, refreshUsers, cases, refreshCases, openCase, newCase }) {
  const [accountsOpen, setAccountsOpen] = useState(false);
  const [error, setError] = useState('');
  async function logout() {
    try { await api('/logout', { method: 'POST', body: JSON.stringify({}) }); } catch {}
    setToken('');
    setUser(null);
  }
  async function deleteCase(id) {
    if (!confirm('Delete this investigation and its uploaded media?')) return;
    setError('');
    try { await api(`/investigations/${id}`, { method: 'DELETE' }); await refreshCases(); } catch (err) { setError(err.message); }
  }
  return <main className="shell"><header className="topbar"><div><p className="eyebrow">Logged in as {user.display_name}</p><h1>Investigation Dashboard</h1><div className="chips"><Pill tone={user.role === 'admin' ? 'blue' : 'default'}>{user.role}</Pill><Pill>{cases.length} assigned</Pill></div></div><div className="actions">{user.role === 'admin' && <Button onClick={() => setAccountsOpen(true)}>User accounts</Button>}{user.role === 'admin' && <Button onClick={newCase} variant="primary">New investigation</Button>}<Button onClick={logout} variant="danger">Log out</Button></div></header>{error && <div className="error">{error}</div>}<div className="main-grid"><Card><div className="section-head"><div><h2>Assigned investigations</h2><p>Users only see cases they are assigned to.</p></div></div>{cases.length === 0 ? <div className="empty">No investigations yet.</div> : <div className="case-list">{cases.map((c) => <div key={c.id} className="case-row"><button onClick={() => openCase(c.id)}><strong>{c.title}</strong><span>{c.location || 'No location'} • {c.date || 'No date'}</span><span>{c.room_count} rooms • {c.event_count} events • your role: {c.member_role}</span></button>{user.role === 'admin' && <Button onClick={() => deleteCase(c.id)} variant="danger">Delete</Button>}</div>)}</div>}</Card><Card><h2>Fast start</h2><ol className="steps"><li>Create user accounts for investigators</li><li>Create investigation</li><li>Add rooms and base camp</li><li>Assign investigators</li><li>Everyone logs in from phones</li></ol></Card></div>{accountsOpen && <AccountManager users={users} refreshUsers={refreshUsers} onClose={() => setAccountsOpen(false)} />}</main>;
}

function NewCase({ user, users, onBack, onCreated }) {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }));
  const [lead, setLead] = useState(user.display_name);
  const [rooms, setRooms] = useState([]);
  const [roomName, setRoomName] = useState('');
  const [baseCampIndex, setBaseCampIndex] = useState(0);
  const [memberIds, setMemberIds] = useState(users.filter((u) => u.id !== user.id).map((u) => u.id));
  const [error, setError] = useState('');
  function addRoom() {
    const name = roomName.trim();
    if (!name) return;
    if (rooms.some((r) => r.name.toLowerCase() === name.toLowerCase())) return setError('That room already exists.');
    setRooms([...rooms, { name }]);
    setRoomName('');
    setError('');
  }
  function removeRoom(index) {
    const next = rooms.filter((_, i) => i !== index);
    setRooms(next);
    if (baseCampIndex >= next.length) setBaseCampIndex(0);
  }
  function toggleMember(id) { setMemberIds((m) => m.includes(id) ? m.filter((x) => x !== id) : [...m, id]); }
  async function create(e) {
    e.preventDefault();
    setError('');
    try {
      const data = await api('/investigations', { method: 'POST', body: JSON.stringify({ title, location, date, lead, rooms, baseCampIndex, memberUserIds: memberIds }) });
      onCreated(data.id);
    } catch (err) { setError(err.message); }
  }
  return <main className="shell"><header className="topbar"><div><button className="link" onClick={onBack}>← Back</button><h1>New investigation</h1><p>Add the real case details. Nothing is prefilled except today’s date and your name.</p></div></header><form onSubmit={create} className="main-grid"><Card><div className="form-grid"><Field label="Case name" value={title} setValue={setTitle} /><Field label="Location" value={location} setValue={setLocation} /><Field label="Date" value={date} setValue={setDate} /><Field label="Lead investigator" value={lead} setValue={setLead} /></div><hr /><h2>Rooms</h2><p>No default rooms. Add each real room and mark base camp.</p><div className="room-add"><input value={roomName} onChange={(e) => setRoomName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addRoom(); } }} placeholder="Example: Kitchen, Cellar, Bedroom 1" /><Button onClick={addRoom}>Add room</Button></div>{rooms.length === 0 ? <div className="empty">No rooms added yet.</div> : <div className="room-grid">{rooms.map((r, i) => <div key={`${r.name}-${i}`} className={`room-card ${baseCampIndex === i ? 'active' : ''}`}><button type="button" onClick={() => setBaseCampIndex(i)}><strong>{r.name}</strong><span>{baseCampIndex === i ? 'Base camp' : 'Click to mark base camp'}</span></button><Button onClick={() => removeRoom(i)} variant="danger">Delete</Button></div>)}</div>}{error && <div className="error">{error}</div>}</Card><Card><h2>Investigator access</h2><p>Select which user accounts can see this case when they log in.</p><div className="list">{users.filter((u) => u.id !== user.id).map((u) => <button key={u.id} type="button" onClick={() => toggleMember(u.id)} className={`member ${memberIds.includes(u.id) ? 'selected' : ''}`}><span><strong>{u.display_name}</strong><small>@{u.username}</small></span><Pill>{u.role}</Pill></button>)}</div><Button type="submit" variant="primary">Create case</Button></Card></form></main>;
}

function MediaPreview({ event }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    let keep = true;
    let objectUrl = '';
    async function load() {
      if (!event.media_key) return;
      const res = await fetch(`${API}/media?key=${encodeURIComponent(event.media_key)}`, { headers: { authorization: `Bearer ${token()}` } });
      if (!res.ok) return;
      const blob = await res.blob();
      objectUrl = URL.createObjectURL(blob);
      if (keep) setUrl(objectUrl);
    }
    load();
    return () => { keep = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [event.media_key]);
  if (!event.media_key) return null;
  if (!url) return <div className="media-box">Loading media…</div>;
  if ((event.media_type || '').startsWith('image/')) return <img className="media-image" src={url} alt={event.media_name || 'Evidence'} />;
  if ((event.media_type || '').startsWith('audio/')) return <audio className="media-audio" controls src={url} />;
  return <a href={url} download={event.media_name}>Download media</a>;
}

function Timeline({ events, canDelete, onDelete }) {
  if (!events.length) return <div className="empty">No events logged yet.</div>;
  return <div className="timeline">{events.map((e) => <article key={e.id} className="event"><div className="event-head"><div><span className="time">{new Date(e.created_at).toLocaleTimeString('en-GB')}</span><Pill tone={e.classification === 'High-interest anomaly' ? 'danger' : e.classification === 'Unreviewed' ? 'warn' : 'default'}>{e.type}</Pill></div>{canDelete && <Button onClick={() => onDelete(e.id)} variant="danger">Delete</Button>}</div><p className="muted">{e.user_name} • {e.room_name} • {e.classification}</p>{e.value && <h3>{e.value} {e.unit}</h3>}{e.note && <p>{e.note}</p>}<MediaPreview event={e} /></article>)}</div>;
}

function LogModal({ caseId, room, user, eventType, onClose, onSaved }) {
  const meta = eventTypes.find((e) => e.type === eventType) || eventTypes[0];
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState(meta.unit || '');
  const [note, setNote] = useState('');
  const [classification, setClassification] = useState('Unreviewed');
  const [file, setFile] = useState(null);
  const [uploadConfirmed, setUploadConfirmed] = useState(false);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState('');
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const isUploadEvent = eventType === 'Voice' || eventType === 'Photo';
  const blockedByUploadConfirmation = Boolean(file && !uploadConfirmed);

  async function startRecording() {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const recorded = new File([blob], `voice-note-${Date.now()}.webm`, { type: 'audio/webm' });
        setFile(recorded);
        setUploadConfirmed(false);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch (err) { setError('Microphone permission failed or is not supported on this device.'); }
  }
  function stopRecording() { if (recorderRef.current && recording) { recorderRef.current.stop(); setRecording(false); } }
  async function chooseFile(nextFile) {
    setError('');
    setUploadConfirmed(false);
    if (!nextFile) { setFile(null); return; }
    try {
      const prepared = eventType === 'Photo' ? await compressImageFile(nextFile) : nextFile;
      setFile(prepared);
      if (prepared.size > 3 * 1024 * 1024) setError('That file is still larger than 3 MB. Try a shorter recording or smaller photo.');
    } catch {
      setError('Could not prepare that file. Try a different file.');
    }
  }
  async function save(e) {
    e.preventDefault();
    setError('');
    if (blockedByUploadConfirmation) {
      setError('Confirm the upload rule before saving this file.');
      return;
    }
    try {
      const form = new FormData();
      form.append('type', eventType);
      form.append('room_id', room.id);
      form.append('value', value);
      form.append('unit', unit);
      form.append('note', note);
      form.append('classification', classification);
      if (file) form.append('file', file);
      await api(`/investigations/${caseId}/events`, { method: 'POST', body: form });
      onSaved();
    } catch (err) { setError(err.message); }
  }
  return <div className="modal-backdrop"><Card className="modal"><div className="modal-head"><div><p className="eyebrow">Quick log</p><h2>{meta.icon} {meta.label} in {room.name}</h2><p>Logged by {user.display_name}. Timestamp saves automatically.</p></div><Button onClick={onClose}>✕</Button></div><form onSubmit={save} className="stack">{meta.readingKey && <div className="form-grid two"><Field label="Reading value" value={value} setValue={setValue} placeholder="Example: 3.2" /><Field label="Unit" value={unit} setValue={setUnit} /></div>}{isUploadEvent && <div className="upload-warning"><strong>Upload rules</strong><p>Upload surroundings, rooms, objects, equipment, environmental details, or case-relevant evidence only.</p><p>Do not upload people’s faces, children, private documents, addresses, bank cards, medical information, private messages, or unnecessary personal information.</p><p>Only upload material you created yourself or have permission to use. If a person appears accidentally, crop, blur, or obscure them before uploading where practical.</p></div>}{eventType === 'Voice' && <div className="upload-box"><h3>Voice note</h3><p>Record directly on the phone or upload an audio file.</p><div className="actions">{!recording ? <Button onClick={startRecording}>Start recording</Button> : <Button onClick={stopRecording} variant="danger">Stop recording</Button>}<input type="file" accept="audio/*" onChange={(e) => chooseFile(e.target.files?.[0] || null)} /></div>{file && <p className="success">Selected: {file.name}</p>}</div>}{eventType === 'Photo' && <div className="upload-box"><h3>Photo note</h3><p>Take a photo or upload one from the gallery.</p><input type="file" accept="image/*" capture="environment" onChange={(e) => chooseFile(e.target.files?.[0] || null)} />{file && <p className="success">Selected: {file.name}</p>}</div>}{file && <label className="check-row upload-confirm"><input type="checkbox" checked={uploadConfirmed} onChange={(e) => setUploadConfirmed(e.target.checked)} /><span>Before uploading, I confirm this file focuses on the investigation environment or case-relevant evidence, and does not unnecessarily show identifiable people or private personal information.</span></label>}<label className="field"><span>Note</span><textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="What happened? What was checked? Any obvious normal cause?" /></label><Select label="Initial classification" value={classification} setValue={setClassification}><option>Unreviewed</option><option>Known cause</option><option>Likely normal cause</option><option>Unclear</option><option>High-interest anomaly</option></Select>{error && <div className="error">{error}</div>}<div className="actions end"><Button onClick={onClose}>Cancel</Button><Button type="submit" variant="primary" disabled={blockedByUploadConfirmation}>Save to timeline</Button></div></form></Card></div>;
}

function LiveCase({ user, caseId, onBack }) {
  const [data, setData] = useState(null);
  const [roomId, setRoomId] = useState('');
  const [logType, setLogType] = useState(null);
  const [error, setError] = useState('');
  async function load() {
    try {
      const next = await api(`/investigations/${caseId}`);
      setData(next);
      if (!roomId && next.rooms[0]) setRoomId(next.investigation.base_room_id || next.rooms[0].id);
    } catch (err) { setError(err.message); }
  }
  useEffect(() => { load(); const timer = setInterval(load, 4000); return () => clearInterval(timer); }, [caseId]);
  if (!data) return <main className="shell"><Button onClick={onBack}>← Back</Button><div className="empty">Loading investigation… {error}</div></main>;
  const { investigation, rooms, events, controls, current_member_role } = data;
  const currentRoom = rooms.find((r) => r.id === roomId) || rooms[0];
  const isAdmin = current_member_role === 'admin' || user.role === 'admin';
  const isViewer = current_member_role === 'viewer';
  const readings = {};
  for (const e of [...events].reverse()) {
    if (e.room_id !== currentRoom?.id) continue;
    if (e.type === 'EMF') readings.emf = e;
    if (e.type === 'Temp') readings.temp = e;
    if (e.type === 'Sound') readings.sound = e;
  }
  async function deleteEvent(id) { alert('Event deletion is not enabled in V1. Add a correction note instead, to preserve evidence history.'); }
  async function toggleControl(c) {
    try { await api(`/investigations/${caseId}/controls/${c.id}`, { method: 'PATCH', body: JSON.stringify({ checked: !c.checked }) }); await load(); } catch (err) { setError(err.message); }
  }
  if (!isAdmin) return <main className="shell mobile"><header className="topbar"><div><button className="link" onClick={onBack}>← Back</button><div className="chips"><Pill tone={isViewer ? 'purple' : 'live'}>{isViewer ? 'viewer' : 'field logger'}</Pill><Pill>{user.display_name}</Pill></div><h1>{investigation.title}</h1><p>{isViewer ? 'Read-only timeline view.' : 'Choose your room, then log fast.'}</p></div></header><Card><h2>Current room</h2><div className="room-buttons">{rooms.map((r) => <button key={r.id} onClick={() => setRoomId(r.id)} className={roomId === r.id ? 'active' : ''}>{r.name}{r.id === investigation.base_room_id ? ' • Base' : ''}</button>)}</div></Card>{!isViewer && <Card><h2>Log in {currentRoom?.name}</h2><div className="quick-grid">{eventTypes.map((t) => <button key={t.type} onClick={() => setLogType(t.type)}><span>{t.icon}</span><strong>{t.label}</strong></button>)}</div></Card>}<Card><h2>{isViewer ? 'Live timeline' : 'My recent logs'}</h2><Timeline events={isViewer ? events : events.filter((e) => e.user_id === user.id).slice(0, 8)} canDelete={false} /></Card>{logType && <LogModal caseId={caseId} room={currentRoom} user={user} eventType={logType} onClose={() => setLogType(null)} onSaved={() => { setLogType(null); load(); }} />}</main>;
  return <main className="shell"><header className="topbar"><div><button className="link" onClick={onBack}>← Back</button><div className="chips"><Pill tone="live">admin hub</Pill><Pill>{rooms.length} rooms</Pill><Pill>{events.length} events</Pill></div><h1>{investigation.title}</h1><p>{investigation.location || 'No location'} • Base: {rooms.find((r) => r.id === investigation.base_room_id)?.name || 'Not set'}</p></div><div className="actions"><Button onClick={() => setLogType('Note')}>Quick note</Button><Button onClick={() => setLogType('Photo')}>Photo note</Button><Button onClick={() => setLogType('Voice')}>Voice note</Button></div></header>{error && <div className="error">{error}</div>}<div className="hub-grid"><section className="stack"><div className="stat-grid"><Card><small>Last EMF</small><h2>{readings.emf ? `${readings.emf.value} ${readings.emf.unit}` : '--'}</h2><p>{readings.emf ? new Date(readings.emf.created_at).toLocaleTimeString('en-GB') : 'Not logged'}</p></Card><Card><small>Last temp</small><h2>{readings.temp ? `${readings.temp.value} ${readings.temp.unit}` : '--'}</h2><p>{readings.temp ? new Date(readings.temp.created_at).toLocaleTimeString('en-GB') : 'Not logged'}</p></Card><Card><small>Last sound</small><h2>{readings.sound ? `${readings.sound.value} ${readings.sound.unit}` : '--'}</h2><p>{readings.sound ? new Date(readings.sound.created_at).toLocaleTimeString('en-GB') : 'Not logged'}</p></Card></div><Card><div className="section-head"><div><h2>Current room</h2><p>Admin can log too, but phones will usually capture from the field.</p></div></div><div className="room-buttons">{rooms.map((r) => <button key={r.id} onClick={() => setRoomId(r.id)} className={roomId === r.id ? 'active' : ''}>{r.name}{r.id === investigation.base_room_id ? ' • Base' : ''}</button>)}</div><div className="quick-grid admin">{eventTypes.map((t) => <button key={t.type} onClick={() => setLogType(t.type)}><span>{t.icon}</span><strong>{t.label}</strong></button>)}</div></Card></section><aside className="stack"><Card><h2>Live team timeline</h2><Timeline events={events} canDelete={false} onDelete={deleteEvent} /></Card><Card><h2>Control checks</h2><div className="list">{controls.map((c) => <button key={c.id} onClick={() => toggleControl(c)} className={`member ${c.checked ? 'selected' : ''}`}><span>{c.checked ? '✅' : '⬜'} {c.label}</span></button>)}</div></Card></aside></div>{logType && <LogModal caseId={caseId} room={currentRoom} user={user} eventType={logType} onClose={() => setLogType(null)} onSaved={() => { setLogType(null); load(); }} />}</main>;
}

function App() {
  const [checked, setChecked] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [cases, setCases] = useState([]);
  const [screen, setScreen] = useState('dashboard');
  const [activeCaseId, setActiveCaseId] = useState(null);
  const [tutorial, setTutorial] = useState(false);

  async function refreshUsers() { if (user?.role === 'admin') { const data = await api('/users'); setUsers(data.users); } }
  async function refreshCases() { const data = await api('/investigations'); setCases(data.investigations); }
  async function afterLogin(nextUser) { setUser(nextUser); setTutorial(false); setScreen('dashboard'); }

  useEffect(() => { (async () => { try { const setup = await api('/setup'); setNeedsSetup(setup.needs_setup); if (!setup.needs_setup && token()) { try { const me = await api('/me'); setUser(me.user); } catch { setToken(''); } } } finally { setChecked(true); } })(); }, []);
  useEffect(() => { if (user && userHasAcceptedCurrentTerms(user)) { refreshCases(); refreshUsers().catch(() => {}); } }, [user]);

  if (!checked) return <main className="shell center"><div className="empty">Loading ParaHub…</div></main>;
  if (needsSetup) return <Setup onDone={() => setNeedsSetup(false)} />;
  if (!user) return <Login onLogin={afterLogin} />;
  if (!userHasAcceptedCurrentTerms(user)) return <TermsAcceptance user={user} onAccepted={(nextUser) => { setUser(nextUser); setTutorial(true); setScreen('dashboard'); }} />;
  return <>{screen === 'dashboard' && <Dashboard user={user} setUser={setUser} users={users} refreshUsers={refreshUsers} cases={cases} refreshCases={refreshCases} openCase={(id) => { setActiveCaseId(id); setScreen('live'); }} newCase={() => setScreen('new')} />}{screen === 'new' && <NewCase user={user} users={users} onBack={() => setScreen('dashboard')} onCreated={(id) => { setActiveCaseId(id); refreshCases(); setScreen('live'); }} />}{screen === 'live' && <LiveCase user={user} caseId={activeCaseId} onBack={() => { refreshCases(); setScreen('dashboard'); }} />}<button className="tutorial-button" onClick={() => setTutorial(true)}>❔ Tutorial</button>{tutorial && <Tutorial onClose={() => setTutorial(false)} />}</>;
}

createRoot(document.getElementById('root')).render(<App />);
