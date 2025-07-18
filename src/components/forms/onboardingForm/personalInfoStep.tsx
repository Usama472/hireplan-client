import { InputField } from '@/components/common/InputField'
import { INPUT_TYPES } from '@/interfaces'

export function PersonalInfoStep() {
  return (
    <div className='space-y-2'>
      <div className='grid grid-cols-1 md:grid-cols-2 md:gap-6'>
        <InputField
          name='firstName'
          label='First Name'
          placeholder='Enter your first name'
          showIsRequired
        />
        <InputField
          name='lastName'
          label='Last Name'
          placeholder='Enter your last name'
          showIsRequired
        />
      </div>

      <InputField
        name='email'
        type={INPUT_TYPES.EMAIL}
        label='Email Address'
        placeholder='Enter your email address'
        showIsRequired
      />

      <InputField
        name='password'
        type={INPUT_TYPES.PASSWORD}
        label='Password'
        placeholder='Create a secure password'
        showIsRequired
      />

      <InputField
        name='jobTitle'
        label='Job Title'
        placeholder='e.g., HR Manager, Talent Acquisition Specialist'
        showIsRequired
      />
    </div>
  )
}
