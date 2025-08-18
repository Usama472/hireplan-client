import { InputField } from '@/components/common/InputField'
import { COMPANY_SIZES, INDUSTRIES } from '@/constants/form-constants'
import { INPUT_TYPES } from '@/interfaces'

export function CompanyInfoStep() {
  return (
    <div className='space-y-2'>
      <div className='grid grid-cols-1 md:grid-cols-2 md:gap-6'>
        <InputField
          name='companyName'
          label='Company Name'
          placeholder='Enter your company name'
          showIsRequired
        />
        <InputField
          name='websiteDomain'
          label='Website Domain'
          placeholder='https://yourcompany.com'
          showIsRequired
        />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <InputField
          name='industry'
          type={INPUT_TYPES.SELECT}
          label='Industry'
          placeholder='Select your industry'
          selectOptions={INDUSTRIES}
          showIsRequired
        />
        <InputField
          name='companySize'
          type={INPUT_TYPES.SELECT}
          label='Company Size'
          placeholder='Select company size'
          selectOptions={COMPANY_SIZES}
          showIsRequired
        />
      </div>

      <InputField
        name='address'
        label='Address'
        placeholder='Enter your company address'
        showIsRequired
      />

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <InputField
          name='city'
          label='City'
          placeholder='Enter city'
          showIsRequired
        />
        <InputField
          name='state'
          label='State'
          placeholder='Enter state'
          showIsRequired
        />
        <InputField
          name='zipCode'
          label='ZIP Code'
          placeholder='Enter ZIP code'
          showIsRequired
        />
      </div>
    </div>
  )
}
