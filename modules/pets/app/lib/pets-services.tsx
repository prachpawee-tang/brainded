import { createContext, type ReactNode, useContext } from 'react'

export type PickedImage = {
  uri: string
  mimeType?: string | null | undefined
  fileName?: string | null | undefined
}

/** Platform services the host app provides (keeps the module free of app internals). */
export type PetsServices = {
  /** Uploads an image and resolves to its storage key (for `photoKey`). */
  uploadPhoto: (image: PickedImage) => Promise<string>
}

const PetsServicesContext = createContext<PetsServices | null>(null)

export const PetsServicesProvider = ({
  value,
  children,
}: {
  value: PetsServices
  children: ReactNode
}) => <PetsServicesContext.Provider value={value}>{children}</PetsServicesContext.Provider>

export const usePetsServices = (): PetsServices => {
  const services = useContext(PetsServicesContext)
  if (!services) throw new Error('usePetsServices must be used inside <PetsServicesProvider>')
  return services
}
