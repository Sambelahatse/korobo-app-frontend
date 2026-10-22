import PhoneInput from 'react-phone-number-input'
import type { Country } from 'react-phone-number-input'
import 'react-phone-number-input/style.css'

type Props = {
  value: string
  onChange: (value: string) => void
  id?: string
  placeholder?: string
  className?: string
  defaultCountry?: Country
  disabled?: boolean
  required?: boolean
  autoComplete?: string
}

export default function PhoneNumberField({
  value, onChange, id, placeholder = 'Numéro de téléphone', className = '',
  defaultCountry = 'MG', disabled = false, required = false, autoComplete = 'tel',
}: Props) {
  return (
    <PhoneInput
      id={id}
      defaultCountry={defaultCountry}
      countryCallingCodeEditable={false}
      value={value || undefined}
      onChange={nextValue => onChange(nextValue || '')}
      disabled={disabled}
      required={required}
      autoComplete={autoComplete}
      placeholder={placeholder}
      className={`phone-number-field flex w-full items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus-within:border-[#5C8A42] focus-within:ring-2 focus-within:ring-[#5C8A42]/15 ${className}`}
      numberInputProps={{
        className: 'min-w-0 w-full flex-1 border-0 bg-transparent p-0 text-sm text-gray-800 outline-none focus:ring-0 disabled:cursor-not-allowed',
        'aria-label': 'Numéro de téléphone',
      }}
    />
  )
}
