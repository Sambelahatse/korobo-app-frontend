import { useMemo, useState } from 'react'
import { ModernIcon } from '../components/Icons'
import Modal from '../components/Modal'

type Role = 'Propriétaire' | 'Administrateur' | 'Technicien' | 'Lecteur'
type TeamUser = { id: string; name: string; email: string; role: Role; status: 'Actif' | 'En attente' | 'Suspendu'; initials: string; lastSeen: string }
const initialUsers: TeamUser[] = [
 {id:'USR-001',name:'Propriétaire de l’espace',email:'proprietaire@korobo.demo',role:'Propriétaire',status:'Actif',initials:'PR',lastSeen:'En ligne'},
 {id:'USR-002',name:'Rakoto Jean',email:'jean.rakoto@example.com',role:'Administrateur',status:'Actif',initials:'RJ',lastSeen:'Aujourd’hui, 09:42'},
 {id:'USR-003',name:'Randria Paul',email:'paul.randria@example.com',role:'Technicien',status:'Actif',initials:'RP',lastSeen:'Aujourd’hui, 08:15'},
 {id:'USR-004',name:'Solofo Eric',email:'eric.solofo@example.com',role:'Technicien',status:'En attente',initials:'SE',lastSeen:'Invitation envoyée'},
 {id:'USR-005',name:'Rabe Marie',email:'marie.rabe@example.com',role:'Lecteur',status:'Suspendu',initials:'RM',lastSeen:'Il y a 12 jours'},
]
const roles: Role[] = ['Propriétaire','Administrateur','Technicien','Lecteur']
const roleDescriptions: Record<Role,string> = {'Propriétaire':'Accès complet et gestion du compte principal.','Administrateur':'Gère les sites, équipements, utilisateurs et rapports.','Technicien':'Consulte les sites et met à jour les interventions.','Lecteur':'Consulte les informations sans les modifier.'}
const inputCls = 'mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-normal outline-none transition focus:border-[#5C8A42] focus:ring-2 focus:ring-[#5C8A42]/15'

export default function UtilisateursPage() {
 const [users,setUsers] = useState(initialUsers)
 const [query,setQuery] = useState('')
 const [roleFilter,setRoleFilter] = useState('Tous')
 const [showForm,setShowForm] = useState(false)
 const [editing,setEditing] = useState<TeamUser|null>(null)
 const [name,setName] = useState('')
 const [email,setEmail] = useState('')
 const [role,setRole] = useState<Role>('Technicien')
 const [error,setError] = useState('')
 const [notifyByEmail,setNotifyByEmail] = useState(true)
 const [feedback,setFeedback] = useState('')
 const filtered = useMemo(()=>users.filter(u=>(roleFilter==='Tous'||u.role===roleFilter)&&[u.name,u.email].some(v=>v.toLowerCase().includes(query.toLowerCase()))),[users,roleFilter,query])
 const openCreate=()=>{setEditing(null);setName('');setEmail('');setRole('Technicien');setNotifyByEmail(true);setError('');setFeedback('');setShowForm(true)}
 const openEdit=(user:TeamUser)=>{if(user.role==='Propriétaire')return;setEditing(user);setName(user.name);setEmail(user.email);setRole(user.role);setError('');setFeedback('');setShowForm(true)}
 const closeForm=()=>{setShowForm(false);setEditing(null);setError('')}
 const saveUser=(e:React.FormEvent<HTMLFormElement>)=>{
  e.preventDefault()
  if(!name.trim()||!email.trim()||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){setError('Saisissez un nom et une adresse e-mail valide.');return}
  if(users.some(u=>u.email.toLowerCase()===email.trim().toLowerCase()&&u.id!==editing?.id)){setError('Cette adresse e-mail existe déjà.');return}
  const initials=name.trim().split(/\s+/).slice(0,2).map(s=>s[0]).join('').toUpperCase()
  if(editing) {
   setUsers(prev=>prev.map(u=>u.id===editing.id?{...u,name:name.trim(),email:email.trim(),role,initials}:u))
   closeForm()
   setFeedback('Les informations de l’utilisateur ont été mises à jour.')
  } else {
   setUsers(prev=>[...prev,{id:`USR-${String(Math.max(0,...prev.map(u=>Number(u.id.split('-')[1])||0))+1).padStart(3,'0')}`,name:name.trim(),email:email.trim(),role,status:'En attente',initials,lastSeen:notifyByEmail?'Notification demandée — envoi non configuré':'Activation manuelle requise'}])
   closeForm()
   setFeedback(notifyByEmail
    ? `Utilisateur créé. L’invitation à ${email.trim()} est demandée, mais le service d’e-mail doit être connecté pour envoyer réellement le message.`
    : 'Utilisateur créé sans notification par e-mail. Son activation devra être organisée manuellement.')
  }
 }
 const changeStatus=(id:string)=>setUsers(prev=>prev.map(u=>u.id===id&&u.role!=='Propriétaire'?{...u,status:u.status==='Suspendu'?'Actif':'Suspendu'}:u))
 const statusClass=(s:TeamUser['status'])=>s==='Actif'?'bg-emerald-50 text-emerald-700':s==='En attente'?'bg-amber-50 text-amber-700':'bg-gray-100 text-gray-600'
 return <div className="min-h-full space-y-6 p-4 sm:p-6 lg:p-8">
  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#5C8A42]">Équipe & accès</p><h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Utilisateurs et rôles</h1><p className="mt-2 text-sm text-gray-500">Organisez votre équipe et définissez les niveaux d’accès à KOROBO.</p></div><button onClick={openCreate} className="rounded-xl bg-[#4A7A3B] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#3d672f]">+ Ajouter un utilisateur</button></div>
  {feedback&&<div role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-5 text-amber-900">{feedback}</div>}
  <div className="grid gap-3 sm:grid-cols-3">{[{label:'Membres',value:users.length,icon:'user-round' as const},{label:'Comptes actifs',value:users.filter(u=>u.status==='Actif').length,icon:'check-circle' as const},{label:'Invitations en attente',value:users.filter(u=>u.status==='En attente').length,icon:'bell' as const}].map(x=><div key={x.label} className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf4e9] text-[#4A7A3B]"><ModernIcon name={x.icon} size={22}/></div><div><p className="text-sm text-gray-500">{x.label}</p><p className="mt-1 text-2xl font-bold text-gray-900">{x.value}</p></div></div>)}</div>
  <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(260px,1fr)]"><section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"><div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold text-gray-900">Membres de l’équipe</h2><p className="mt-1 text-xs text-gray-500">{filtered.length} compte(s)</p></div><div className="flex flex-col gap-2 sm:flex-row"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Rechercher…" className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#5C8A42]"/><select value={roleFilter} onChange={e=>setRoleFilter(e.target.value)} className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#5C8A42]"><option>Tous</option>{roles.filter(r=>r!=='Propriétaire').map(r=><option key={r}>{r}</option>)}</select></div></div><div className="divide-y divide-gray-100">{filtered.map(u=><div key={u.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"><div className="flex min-w-0 flex-1 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#edf4e9] text-xs font-bold text-[#426b36]">{u.initials}</div><div className="min-w-0"><p className="truncate text-sm font-semibold text-gray-900">{u.name}</p><p className="truncate text-xs text-gray-500">{u.email}</p><p className="mt-1 text-[11px] text-gray-400">{u.lastSeen}</p></div></div><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(u.status)}`}>{u.status}</span><span className="rounded-lg bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-600">{u.role}</span>{u.role!=='Propriétaire'&&<><button onClick={()=>openEdit(u)} className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:border-[#5C8A42] hover:text-[#4A7A3B]">Modifier</button><button onClick={()=>changeStatus(u.id)} className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:border-rose-200 hover:text-rose-600">{u.status==='Suspendu'?'Réactiver':'Suspendre'}</button></>}</div></div>)}</div>{filtered.length===0&&<p className="p-8 text-center text-sm text-gray-500">Aucun utilisateur trouvé.</p>}</section>
  <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf4e9] text-[#4A7A3B]"><ModernIcon name="shield-check" size={22}/></div><div><h2 className="font-bold text-gray-900">Rôles et permissions</h2><p className="text-xs text-gray-500">Repères d’accès</p></div></div><div className="space-y-4">{roles.map(r=><div key={r} className="border-t border-gray-100 pt-4 first:border-0 first:pt-0"><div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-gray-800">{r}</h3><span className="text-xs text-gray-400">{users.filter(u=>u.role===r).length} membre(s)</span></div><p className="mt-1.5 text-xs leading-5 text-gray-500">{roleDescriptions[r]}</p></div>)}</div><div className="mt-5 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">Important : les rôles affichés ici sont une maquette d’interface. Les permissions doivent être vérifiées côté backend avant la mise en production.</div></section></div>
  <p className="text-xs text-gray-400">Mode démonstration : les comptes sont conservés dans l’état local de cette page. L’envoi réel des invitations et l’activation sécurisée nécessitent une API backend.</p>
  {showForm&&<Modal title={editing?'Modifier un utilisateur':'Ajouter un utilisateur'} description={editing?'Mettez à jour les coordonnées et le rôle du membre.':'Ajoutez un membre à votre espace KOROBO.'} onClose={closeForm}>
   <form onSubmit={saveUser} className="space-y-4">
    <label className="block text-sm font-semibold text-gray-700">Nom complet<input required value={name} onChange={e=>setName(e.target.value)} placeholder="Nom et prénom" className={inputCls}/></label>
    <label className="block text-sm font-semibold text-gray-700">Adresse e-mail<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="nom@entreprise.com" className={inputCls}/></label>
    <label className="block text-sm font-semibold text-gray-700">Rôle<select value={role} onChange={e=>setRole(e.target.value as Role)} className={inputCls}>{roles.filter(r=>r!=='Propriétaire').map(r=><option key={r}>{r}</option>)}</select></label>
    {!editing&&<label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#4A7A3B]/20 bg-[#f4f8f1] p-4">
      <input type="checkbox" checked={notifyByEmail} onChange={e=>setNotifyByEmail(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#4A7A3B]"/>
      <span><span className="block text-sm font-semibold text-gray-800">Envoyer une invitation par e-mail</span><span className="mt-1 block text-xs leading-5 text-gray-500">Permettre à l’utilisateur d’activer son compte. L’envoi effectif sera disponible une fois le backend de messagerie connecté.</span></span>
    </label>}
    {error&&<p role="alert" className="text-sm text-rose-600">{error}</p>}
    <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end"><button type="button" onClick={closeForm} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">Annuler</button><button type="submit" className="rounded-xl bg-[#4A7A3B] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#3d672f]">{editing?'Enregistrer les modifications':'Ajouter l’utilisateur'}</button></div>
   </form>
  </Modal>}
 </div>
}
