import { describeLocaleParity } from '../testing'
import en from './en.json' with { type: 'json' }
import th from './th.json' with { type: 'json' }

describeLocaleParity('common', { en, th })
