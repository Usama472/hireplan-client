import type { SelectOption } from '@/interfaces'
import { City, State } from 'country-state-city'
import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'

interface UseLocationFieldsProps {
  stateFieldName: string
  cityFieldName: string
}

export const useLocationFields = ({
  stateFieldName,
  cityFieldName,
}: UseLocationFieldsProps) => {
  const { watch, setValue } = useFormContext()
  const [usStates, setUSStates] = useState<SelectOption[]>([])
  const [cities, setCities] = useState<SelectOption[]>([])
  const [initialized, setInitialized] = useState(false)

  const currentState = watch(stateFieldName)
  const currentCity = watch(cityFieldName)

  useEffect(() => {
    const statesList = State.getStatesOfCountry('US')

    const stateOptions = statesList.map((state) => ({
      value: state.name,
      label: state.name,
    }))

    stateOptions.sort((a, b) => a.label.localeCompare(b.label))

    setUSStates(stateOptions)
    setInitialized(true)
  }, [])

  useEffect(() => {
    if (!currentState || !initialized) return

    const stateObj = State.getStatesOfCountry('US').find(
      (state) => state.name === currentState
    )

    if (stateObj) {
      const citiesList = City.getCitiesOfState('US', stateObj.isoCode)
      const cityOptions = citiesList.map((city) => ({
        value: city.name,
        label: city.name,
      }))

      cityOptions.sort((a, b) => a.label.localeCompare(b.label))

      setCities(cityOptions)

      if (currentCity) {
        const cityExists = citiesList.some((city) => city.name === currentCity)
        if (!cityExists) {
          setValue(cityFieldName, '')
        }
      }
    } else {
      setCities([])
    }
  }, [currentState, initialized, setValue, cityFieldName, currentCity])

  return {
    stateOptions: usStates,
    cityOptions: cities,
  }
}
