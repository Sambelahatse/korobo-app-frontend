import { useState } from 'react'
import type { ListItem } from '../types'
import { XIcon, PlusIcon, FolderIcon, LocationIcon } from './Icons'

import type { Site } from "../types"
interface Props { onClose: () => void; site?: Site }

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

const years = Array.from({ length: 30 }, (_, i) => String(2025 - i))

/* ─── Main Modal ──────────────────────────────────────────────────────── */

export default function NewSiteModal({ onClose, site }: Props) {
  const [step, setStep] = useState(1)
  const TOTAL = 6

  // Step 1
  const [nomSite, setNomSite]                 = useState('')
  const [lieuSite, setLieuSite]               = useState('')
  const [proprietaire, setProprietaire]       = useState('')
  const [annee, setAnnee]                     = useState('2025')
  const [numAffaire, setNumAffaire]           = useState('')
  const [gps, setGps]                         = useState('')
  const [c1Nom, setC1Nom]                     = useState('')
  const [c1Tel, setC1Tel]                     = useState('')
  const [c2Nom, setC2Nom]                     = useState('')
  const [c2Tel, setC2Tel]                     = useState('')
  const [instNom, setInstNom]                 = useState('')
  const [instTel, setInstTel]                 = useState('')

  // Step 2
  const [typeInstall, setTypeInstall]         = useState('')
  const [installElec, setInstallElec]         = useState('')
  const [batteries, setBatteries]             = useState<ListItem[]>([
    { id: '1', quantity: '01', name: 'Battterie type 1' },
    { id: '2', quantity: '01', name: 'Battterie type 2' },
  ])

  // Step 3
  const [pvTypes, setPvTypes]                 = useState<ListItem[]>([
    { id: '1', quantity: '01', name: 'PV type 1' },
    { id: '2', quantity: '01', name: 'PV type 2' },
  ])
  const [mttpTypes, setMttpTypes]             = useState<ListItem[]>([
    { id: '1', quantity: '01', name: 'MTTP type 1' },
    { id: '2', quantity: '01', name: 'MTTP type 2' },
  ])

  // Step 4
  const [controllers, setControllers]         = useState<ListItem[]>([
    { id: '1', quantity: '01', name: 'controlleur type 1' },
    { id: '2', quantity: '01', name: 'controlleur type 2' },
  ])

  // Step 5
  const [groupeInfo, setGroupeInfo]           = useState('')

  // Step 6
  const [contratSav, setContratSav]           = useState('')

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
          <div className="flex flex-col items-center justify-center gap-5 py-12">
            <p className="text-[15px] font-semibold text-gray-800">Contrat SAV</p>
            <div className="relative w-80">
              <input
                className={`${inputCls} pr-12`}
                value={contratSav}
                onChange={e => setContratSav(e.target.value)}
                placeholder="Sélectionner un fichier..."
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"><FolderIcon size={18} /></span>
            </div>
          </div>
        )

      default: return null
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-5"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full sm:max-w-2xl rounded-t-2xl sm:rounded-xl max-h-[92vh] flex flex-col shadow-2xl">

        {/* Header */}
        <div className="px-5 sm:px-8 pt-5 sm:pt-7 pb-4 flex-shrink-0">
          <h2 className="font-syne font-bold text-xl text-[#3d6b2a]">
            {site ? `Modifier le site (Step ${step}/${TOTAL})` : `Creation d'un nouveau site (Step ${step}/${TOTAL})`}
          </h2>

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
              onClick={() => setStep(s => s + 1)}
              className="px-9 py-2.5 bg-[#3d6b2a] hover:bg-[#4e8a35] text-white text-sm font-semibold rounded-md transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-9 py-2.5 bg-[#3d6b2a] hover:bg-[#4e8a35] text-white text-sm font-semibold rounded-md transition-colors"
            >
              Finish
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
