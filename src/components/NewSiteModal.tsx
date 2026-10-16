import { useEffect, useRef, useState } from 'react'
import { FilePond } from 'react-filepond'
import type { FilePondFile } from 'filepond'
import 'filepond/dist/filepond.min.css'
import type { ListItem } from '../types'
import { XIcon, PlusIcon, FolderIcon, LocationIcon } from './Icons'

import type { Site } from "../types"
interface Props { onClose: () => void; onSave: (site: Site) => void; site?: Site }

/* ─── Reusable sub-components ─────────────────────────────────────────── */

function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border border-gray-200 rounded-lg px-4 pb-4 mt-2">
      {title && (
        <legend className="px-2 text-[13px] font-bold text-gray-800">{title}</legend>
      )}
      <div className="flex flex-col gap-3 mt-1">{children}</div>
    </fieldset>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-gray-700">{label}</label>
      {children}
    </div>
  )
}

const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-md text-sm text-gray-800 outline-none focus:border-[#3d6b2a] transition-colors bg-white'

function TagList({
  label, items, onAdd, onRemove, onQtyChange,
}: {
  label: string
  items: ListItem[]
  onAdd: (name: string) => void
  onRemove: (id: string) => void
  onQtyChange: (id: string, qty: string) => void
}) {
  const [input, setInput] = useState('')

  const handleAdd = () => {
    if (input.trim()) { onAdd(input.trim()); setInput('') }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[13px] font-medium text-gray-500">{label}</span>

      {/* Input row */}
      <div className="flex">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder={`Ajouter...`}
          className="flex-1 px-3 py-2.5 border border-gray-200 border-r-0 rounded-l-md text-sm outline-none focus:border-[#3d6b2a] transition-colors"
        />
        <button
          onClick={handleAdd}
          className="w-10 flex items-center justify-center bg-gray-600 hover:bg-[#3d6b2a] text-white rounded-r-md transition-colors"
        >
          <PlusIcon size={14} />
        </button>
      </div>

      {/* Tag list */}
      {items.length > 0 && (
        <div className="bg-[#e8f2e3] rounded-md p-2 flex flex-col gap-1.5">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-3 px-2">
              <input
                type="text"
                value={item.quantity}
                onChange={e => onQtyChange(item.id, e.target.value)}
                maxLength={3}
                className="w-11 text-center px-1 py-1.5 border border-gray-300 rounded text-sm outline-none focus:border-[#3d6b2a]"
              />
              <span className="flex-1 text-sm text-gray-700">{item.name}</span>
              <button
                onClick={() => onRemove(item.id)}
                className="w-7 h-7 flex items-center justify-center bg-gray-500 hover:bg-red-500 text-white rounded transition-colors"
              >
                <XIcon size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Helpers ─────────────────────────────────────────────────────────── */

function makeAdder(setter: React.Dispatch<React.SetStateAction<ListItem[]>>) {
  return (name: string) =>
    setter(prev => [...prev, { id: Date.now().toString(), quantity: '01', name }])
}
function makeRemover(setter: React.Dispatch<React.SetStateAction<ListItem[]>>) {
  return (id: string) => setter(prev => prev.filter(i => i.id !== id))
}
function makeQtyChanger(setter: React.Dispatch<React.SetStateAction<ListItem[]>>) {
  return (id: string, qty: string) =>
    setter(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i))
}

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 30 }, (_, i) => String(currentYear - i))

/* ─── Main Modal ──────────────────────────────────────────────────────── */

export default function NewSiteModal({ onClose, onSave, site }: Props) {
  const [step, setStep] = useState(1)
  const TOTAL = 6

  // Step 1
  const [nomSite, setNomSite]                 = useState(site?.nom ?? '')
  const [lieuSite, setLieuSite]               = useState(site?.localisation ?? '')
  const [proprietaire, setProprietaire]       = useState(site?.proprietaire ?? '')
  const [annee, setAnnee]                     = useState(site?.annee ?? String(currentYear))
  const [numAffaire, setNumAffaire]           = useState(site?.numAffaire ?? '')
  const [gps, setGps]                         = useState(site?.gps ?? '')
  const [c1Nom, setC1Nom]                     = useState(site?.contact1Nom ?? '')
  const [c1Tel, setC1Tel]                     = useState(site?.contact1Tel ?? '')
  const [c2Nom, setC2Nom]                     = useState(site?.contact2Nom ?? '')
  const [c2Tel, setC2Tel]                     = useState(site?.contact2Tel ?? '')
  const [instNom, setInstNom]                 = useState(site?.installateurNom ?? '')
  const [instTel, setInstTel]                 = useState(site?.installateurTel ?? '')

  // Step 2
  const [typeInstall, setTypeInstall]         = useState(site?.typeInstallation ?? '')
  const [installElec, setInstallElec]         = useState(site?.installationElectrique ?? '')
  const [puissance, setPuissance]             = useState(String(site?.puissance ?? ''))
  const [formError, setFormError]             = useState('')
  const formErrorRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (formError) {
      formErrorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [formError])
  const [batteries, setBatteries]             = useState<ListItem[]>(site?.batteries ?? [
    { id: '1', quantity: '01', name: 'Battterie type 1' },
    { id: '2', quantity: '01', name: 'Battterie type 2' },
  ])

  // Step 3
  const [pvTypes, setPvTypes]                 = useState<ListItem[]>(site?.pvTypes ?? [
    { id: '1', quantity: '01', name: 'PV type 1' },
    { id: '2', quantity: '01', name: 'PV type 2' },
  ])
  const [mttpTypes, setMttpTypes]             = useState<ListItem[]>(site?.mttpTypes ?? [
    { id: '1', quantity: '01', name: 'MTTP type 1' },
    { id: '2', quantity: '01', name: 'MTTP type 2' },
  ])

  // Step 4
  const [controllers, setControllers]         = useState<ListItem[]>(site?.controllers ?? [
    { id: '1', quantity: '01', name: 'controlleur type 1' },
    { id: '2', quantity: '01', name: 'controlleur type 2' },
  ])

  // Step 5
  const [groupeInfo, setGroupeInfo]           = useState(site?.groupeInfo ?? '')

  // Step 6
  const [contratSav, setContratSav]           = useState(site?.contratSav ?? '')
  const handleContractFiles = (files: FilePondFile[]) => {
    setContratSav(files[0]?.file instanceof File ? files[0].file.name : '')
  }

  const validateStep = (targetStep: number) => {
    setFormError('')
    if (targetStep === 1) {
      if (!nomSite.trim() || !lieuSite.trim() || !proprietaire.trim()) {
        setFormError('Les champs Nom du site, Lieu du site et Propriétaire sont obligatoires.')
        return false
      }
      if (c1Tel.trim() && !/^[+0-9() .-]{7,20}$/.test(c1Tel.trim())) {
        setFormError('Le numéro du contact 1 semble invalide.')
        return false
      }
      if (c2Tel.trim() && !/^[+0-9() .-]{7,20}$/.test(c2Tel.trim())) {
        setFormError('Le numéro du contact 2 semble invalide.')
        return false
      }
    }
    if (targetStep === 2) {
      const parsedPower = Number(puissance)
      if (!typeInstall.trim()) {
        setFormError('Veuillez renseigner le type d’installation.')
        return false
      }
      if (!puissance.trim() || !Number.isFinite(parsedPower) || parsedPower <= 0) {
        setFormError('Veuillez saisir une puissance installée supérieure à 0 kW.')
        return false
      }
    }
    return true
  }

  const handleSave = () => {
    if (!validateStep(1)) { setStep(1); return }
    if (!validateStep(2)) { setStep(2); return }
    const parsedPower = Number(puissance)
    onSave({
      id: site?.id ?? String(Date.now()),
      nom: nomSite.trim(),
      localisation: lieuSite.trim(),
      contact1Nom: c1Nom.trim(),
      contact1Tel: c1Tel.trim(),
      contact2Nom: c2Nom.trim(),
      contact2Tel: c2Tel.trim(),
      proprietaire: proprietaire.trim(),
      annee,
      statut: site?.statut ?? 'actif',
      typeInstallation: typeInstall.trim(),
      puissance: parsedPower,
      gps: gps.trim(),
      numAffaire: numAffaire.trim(),
      installateurNom: instNom.trim(),
      installateurTel: instTel.trim(),
      installationElectrique: installElec.trim(),
      batteries: batteries.map(item => ({ ...item })),
      pvTypes: pvTypes.map(item => ({ ...item })),
      mttpTypes: mttpTypes.map(item => ({ ...item })),
      controllers: controllers.map(item => ({ ...item })),
      groupeInfo: groupeInfo.trim(),
      contratSav: contratSav.trim(),
    })
    onClose()
  }

  /* ─── Step renderers ── */
  const renderStep = () => {
    switch (step) {

      /* ── Step 1 : Infos générales ── */
      case 1:
        return (
          <div className="flex flex-col gap-4">
            <Field label="Nom du site">
              <input className={inputCls} value={nomSite} onChange={e => setNomSite(e.target.value)} />
            </Field>
            <Field label="Lieu du site">
              <input className={inputCls} value={lieuSite} onChange={e => setLieuSite(e.target.value)} />
            </Field>
            <Field label="Proprietaire du site">
              <input className={inputCls} value={proprietaire} onChange={e => setProprietaire(e.target.value)} />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <Field label="Année d'installation">
                <div className="relative">
                  <select
                    value={annee}
                    onChange={e => setAnnee(e.target.value)}
                    className={`${inputCls} appearance-none pr-8 cursor-pointer`}
                  >
                    {years.map(y => <option key={y}>{y}</option>)}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3d6b2a] pointer-events-none text-base">▾</span>
                </div>
              </Field>
              <Field label="Numero d'affaire">
                <input className={inputCls} value={numAffaire} onChange={e => setNumAffaire(e.target.value)} />
              </Field>
              <Field label="Coordonnée GPS">
                <div className="relative">
                  <input className={`${inputCls} pr-10`} value={gps} onChange={e => setGps(e.target.value)} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"><LocationIcon size={16} /></span>
                </div>
              </Field>
            </div>

            <FieldGroup title="Contact 1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Field label="Nom"><input className={inputCls} value={c1Nom} onChange={e => setC1Nom(e.target.value)} /></Field>
                <Field label="Contact"><input className={inputCls} value={c1Tel} onChange={e => setC1Tel(e.target.value)} /></Field>
              </div>
            </FieldGroup>

            <FieldGroup title="Contact 2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Field label="Nom"><input className={inputCls} value={c2Nom} onChange={e => setC2Nom(e.target.value)} /></Field>
                <Field label="Contact"><input className={inputCls} value={c2Tel} onChange={e => setC2Tel(e.target.value)} /></Field>
              </div>
            </FieldGroup>

            <FieldGroup title="Installateur">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Field label="Nom"><input className={inputCls} value={instNom} onChange={e => setInstNom(e.target.value)} /></Field>
                <Field label="Contact"><input className={inputCls} value={instTel} onChange={e => setInstTel(e.target.value)} /></Field>
              </div>
            </FieldGroup>
          </div>
        )

      /* ── Step 2 : Electrical + Batteries ── */
      case 2:
        return (
          <div className="flex flex-col gap-4">
            <FieldGroup title="Electrical Info">
              <Field label="type d'installation">
                <input className={inputCls} value={typeInstall} onChange={e => setTypeInstall(e.target.value)} />
              </Field>
              <Field label="Installation Electrique">
                <input className={inputCls} value={installElec} onChange={e => setInstallElec(e.target.value)} />
              </Field>
              <Field label="Puissance installée (kW)">
                <input className={inputCls} type="number" min="0.1" step="0.1" value={puissance} onChange={e => setPuissance(e.target.value)} placeholder="Ex. : 15" />
              </Field>
              <Field label="SLD">
                <div className="relative">
                  <input className={`${inputCls} pr-10`} readOnly />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"><FolderIcon size={16} /></span>
                </div>
              </Field>
            </FieldGroup>

            <FieldGroup title="Batteries">
              <TagList
                label="type de Batterie"
                items={batteries}
                onAdd={makeAdder(setBatteries)}
                onRemove={makeRemover(setBatteries)}
                onQtyChange={makeQtyChanger(setBatteries)}
              />
            </FieldGroup>
          </div>
        )

      /* ── Step 3 : PV & MTTP ── */
      case 3:
        return (
          <div className="flex flex-col gap-4">
            <FieldGroup title="PV & MTTP Info">
              <TagList
                label="type de PV"
                items={pvTypes}
                onAdd={makeAdder(setPvTypes)}
                onRemove={makeRemover(setPvTypes)}
                onQtyChange={makeQtyChanger(setPvTypes)}
              />
            </FieldGroup>
            <FieldGroup title="">
              <TagList
                label="type de MTTP"
                items={mttpTypes}
                onAdd={makeAdder(setMttpTypes)}
                onRemove={makeRemover(setMttpTypes)}
                onQtyChange={makeQtyChanger(setMttpTypes)}
              />
            </FieldGroup>
          </div>
        )

      /* ── Step 4 : Contrôleur ── */
      case 4:
        return (
          <div className="flex flex-col gap-4">
            <FieldGroup title="Controlleur d'hybridation">
              <TagList
                label="type de controlleur"
                items={controllers}
                onAdd={makeAdder(setControllers)}
                onRemove={makeRemover(setControllers)}
                onQtyChange={makeQtyChanger(setControllers)}
              />
            </FieldGroup>
          </div>
        )

      /* ── Step 5 : Groupe Électrogène ── */
      case 5:
        return (
          <div className="flex flex-col gap-4">
            <FieldGroup title="Groupe Électrogène">
              <Field label="Informations">
                <input className={inputCls} value={groupeInfo} onChange={e => setGroupeInfo(e.target.value)} />
              </Field>
            </FieldGroup>
          </div>
        )

      /* ── Step 6 : Contrat SAV ── */
      case 6:
        return (
          <div className="mx-auto flex w-full max-w-xl flex-col gap-5 py-6 sm:py-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#e8f2e3] text-[#3d6b2a]">
                <svg viewBox="0 0 24 24" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6M8 13h8M8 17h5" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-bold text-gray-900">Contrat SAV</p>
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500">Document</span>
                </div>
                <p className="mt-1.5 text-sm leading-5 text-gray-500">
                  Ajoutez le contrat de service après-vente associé à ce site. Vous pourrez le remplacer avant d’enregistrer.
                </p>
              </div>
            </div>

            {site?.contratSav && (
              <div className="flex items-center gap-3 rounded-xl border border-[#d8e7d0] bg-[#f5faf2] p-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white text-[#3d6b2a] shadow-sm">
                  <FolderIcon size={19} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#648458]">Contrat actuel</p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-gray-800" title={site.contratSav}>{site.contratSav}</p>
                </div>
                <span className="rounded-full bg-[#e2f0d9] px-2.5 py-1 text-xs font-semibold text-[#3d6b2a]">Enregistré</span>
              </div>
            )}

            <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm sm:p-4">
              <FilePond
                className="sav-contract-uploader"
                allowMultiple={false}
                maxFiles={1}
                instantUpload={false}
                onupdatefiles={handleContractFiles}
                labelIdle='<span style="display:block;margin-bottom:10px;color:#3d6b2a"><svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="display:block;margin:auto"><path d="M12 16V4m-5 5 5-5 5 5"/><path d="M20 16.5v2A2.5 2.5 0 0 1 17.5 21h-11A2.5 2.5 0 0 1 4 18.5v-2"/></svg></span><span style="font-weight:600;color:#374151">Déposez votre fichier ici</span><br><span style="font-size:12px;color:#6b7280">ou <span class="filepond--label-action">parcourez vos fichiers</span></span>'
                labelFileWaitingForSize="Calcul de la taille"
                labelFileSizeNotAvailable="Taille indisponible"
                labelFileLoading="Chargement"
                labelFileLoadError="Erreur pendant le chargement"
                labelFileProcessing="Traitement"
                labelFileProcessingComplete="Terminé"
                labelFileProcessingAborted="Traitement annulé"
                labelFileProcessingError="Erreur pendant le traitement"
                labelFileProcessingRevertError="Erreur pendant la suppression"
                labelFileRemoveError="Erreur pendant la suppression"
                labelTapToCancel="Appuyez pour annuler"
                labelTapToRetry="Appuyez pour réessayer"
                labelTapToUndo="Appuyez pour annuler"
                labelButtonRemoveItem="Retirer"
                labelButtonAbortItemLoad="Annuler"
                labelButtonRetryItemLoad="Réessayer"
                labelButtonAbortItemProcessing="Annuler"
                labelButtonUndoItemProcessing="Annuler"
                labelButtonRetryItemProcessing="Réessayer"
                labelButtonProcessItem="Traiter"
              />
              <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-2 pt-3">
                <span className="text-xs text-gray-400">Sélectionnez un seul fichier</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500">
                  <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <rect x="4" y="8" width="12" height="9" rx="2" /><path d="M7 8V5a3 3 0 0 1 6 0v3" />
                  </svg>
                  Sélection locale
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-lg bg-amber-50 px-3.5 py-3 text-xs leading-5 text-amber-800">
              <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" className="mt-0.5 flex-shrink-0" aria-hidden="true">
                <circle cx="10" cy="10" r="7.5" /><path d="M10 9v4M10 6.5h.01" />
              </svg>
              <p>Pour le moment, seul le nom du fichier est mémorisé. L’envoi et le stockage du document seront disponibles après l’intégration du backend.</p>
            </div>
          </div>
        )

      default: return null
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-5"
    >
      <div className="bg-white w-full sm:max-w-2xl rounded-t-2xl sm:rounded-xl max-h-[92vh] flex flex-col shadow-2xl">

        {/* Header */}
        <div className="px-5 sm:px-8 pt-5 sm:pt-7 pb-4 flex-shrink-0">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-syne font-bold text-xl text-[#3d6b2a]">
              {site ? `Modifier le site (Step ${step}/${TOTAL})` : `Creation d'un nouveau site (Step ${step}/${TOTAL})`}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer la fenêtre"
              title="Fermer"
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-gray-500 hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3d6b2a] transition-colors"
            >
              <XIcon size={18} />
            </button>
          </div>

          {/* Progress dots */}
          <div className="flex items-center gap-2 mt-4">
            {Array.from({ length: TOTAL }).map((_, i) => (
              <button
                key={i}
                onClick={() => i + 1 < step && setStep(i + 1)}
                className={`rounded-full transition-all ${
                  i + 1 === step
                    ? 'w-4 h-3 bg-[#3d6b2a]'
                    : i + 1 < step
                    ? 'w-2.5 h-2.5 bg-[#6aad46] cursor-pointer hover:scale-110'
                    : 'w-2.5 h-2.5 bg-gray-200'
                }`}
              />
            ))}
            <span className="ml-auto text-xs text-gray-400 font-medium">{step} / {TOTAL}</span>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-8 scrollbar-thin">
          {formError && <p ref={formErrorRef} role="alert" aria-live="assertive" className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}
          {renderStep()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-3 px-5 sm:px-8 py-4 sm:py-5 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={() => step > 1 ? setStep(s => s - 1) : onClose()}
            className="px-9 py-2.5 bg-gray-500 hover:bg-gray-600 text-white text-sm font-semibold rounded-md transition-colors"
          >
            Back
          </button>
          {step < TOTAL ? (
            <button
              onClick={() => { if (validateStep(step)) setStep(s => s + 1) }}
              className="px-9 py-2.5 bg-[#3d6b2a] hover:bg-[#4e8a35] text-white text-sm font-semibold rounded-md transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="px-9 py-2.5 bg-[#3d6b2a] hover:bg-[#4e8a35] text-white text-sm font-semibold rounded-md transition-colors"
            >
              {site ? 'Enregistrer' : 'Créer le site'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
