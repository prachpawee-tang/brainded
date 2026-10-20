import { describe, expect, it } from 'vitest'
import { createI18n } from './create-i18n'

describe('createI18n', () => {
  it('uses Thai by default with common namespace loaded', async () => {
    const i18n = await createI18n()
    expect(i18n.language).toBe('th')
    expect(i18n.t('common:actions.save')).toBe('บันทึก')
  })

  it('falls back to English when a key is missing in the active language', async () => {
    const i18n = await createI18n({
      lng: 'th',
      namespaces: { demo: { en: { onlyEn: 'English only' }, th: {} } },
    })
    expect(i18n.t('demo:onlyEn')).toBe('English only')
  })

  it('registers module namespaces', async () => {
    const i18n = await createI18n({
      lng: 'en',
      namespaces: { pets: { en: { title: 'Pets' }, th: { title: 'สัตว์เลี้ยง' } } },
    })
    expect(i18n.t('pets:title')).toBe('Pets')
    await i18n.changeLanguage('th')
    expect(i18n.t('pets:title')).toBe('สัตว์เลี้ยง')
  })
})
