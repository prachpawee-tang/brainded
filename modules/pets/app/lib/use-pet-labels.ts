import { useTranslation } from 'react-i18next'
import type { PetSex, PetSpecies } from '../../shared/validation'
import { formatDate, formatWeightKg, petAge } from './format'

/** Translated, locale-formatted labels shared by pets screens. */
export const usePetLabels = () => {
  const { t, i18n } = useTranslation('pets')
  const language = i18n.language

  const species = (pet: { species: PetSpecies; speciesOther?: string | null }) =>
    pet.species === 'OTHER' && pet.speciesOther ? pet.speciesOther : t(`species.${pet.species}`)

  const sex = (value: PetSex) => t(`sex.${value}`)

  const age = (birthDate: string) => {
    const { years, months } = petAge(birthDate)
    if (years === 0 && months === 0) return t('age.newborn')
    if (years === 0) return t('age.months', { count: months })
    if (months === 0) return t('age.years', { count: years })
    return t('age.yearsMonths', {
      years: t('age.years', { count: years }),
      months: t('age.months', { count: months }),
    })
  }

  const kg = (grams: number) => t('common.kg', { value: formatWeightKg(grams, language) })
  const date = (isoDate: string) => formatDate(isoDate, language)

  return { t, language, species, sex, age, kg, date }
}
