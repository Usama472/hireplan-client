'use client'

import { InputField } from '@/components/common/InputField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  DEPARTMENTS,
  EDUCATION_REQUIREMENTS,
  EEO_JOB_CATEGORIES,
  EMPLOYMENT_TYPES,
  EXEMPT_STATUSES,
  JOB_STATUSES,
  PAY_TYPES,
  WORKPLACE_TYPES,
} from '@/constants'
import { INPUT_TYPES } from '@/interfaces'
import { Plus, X } from 'lucide-react'
import { useState } from 'react'
import { useFormContext } from 'react-hook-form'

export function PositionDetailsStep() {
  const { watch, setValue, formState } = useFormContext()
  const [customDepartment, setCustomDepartment] = useState('')
  const [newRequirement, setNewRequirement] = useState('')

  const payType = watch('payType')
  const payRateType = watch('payRate.type') || 'fixed'
  const jobRequirements = watch('jobRequirements') || []
  const { errors, dirtyFields, touchedFields } = formState

  const addCustomDepartment = () => {
    if (customDepartment.trim()) {
      setValue('department', customDepartment.trim())
      setValue('customDepartment', customDepartment.trim())
      setCustomDepartment('')
    }
  }

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setValue('jobRequirements', [...jobRequirements, newRequirement.trim()])
      setNewRequirement('')
    }
  }

  const removeRequirement = (index: number) => {
    const updated = jobRequirements.filter((_: any, i: number) => i !== index)
    setValue('jobRequirements', updated)
  }

  return (
    <div className='space-y-8'>
      <div>
        <h2 className='text-2xl font-bold text-gray-900'>Position Details</h2>
        <p className='text-gray-600 mt-1'>
          Define the specifics of this role and compensation
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Left Column */}
        <div className='space-y-6'>
          {/* Job Status & Workplace */}
          <Card>
            <CardHeader>
              <CardTitle>Job Priority & Workplace</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <InputField
                name='jobStatus'
                type={INPUT_TYPES.SELECT}
                label='Job Priority'
                selectOptions={JOB_STATUSES}
                showIsRequired
              />
              <InputField
                name='workplaceType'
                type={INPUT_TYPES.SELECT}
                label='Workplace Type'
                selectOptions={WORKPLACE_TYPES}
                showIsRequired
              />
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Job Location</CardTitle>
              <p className='text-sm text-gray-600'>
                Job boards prefer City, State, and ZIP code
              </p>
            </CardHeader>
            <CardContent className='space-y-4'>
              <InputField
                name='jobLocation.address'
                label='Address'
                placeholder='123 Main Street'
                showIsRequired
              />
              <div className='grid grid-cols-2 gap-4'>
                <InputField
                  name='jobLocation.city'
                  label='City'
                  placeholder='San Francisco'
                  showIsRequired
                />
                <InputField
                  name='jobLocation.state'
                  label='State'
                  placeholder='CA'
                  showIsRequired
                />
              </div>
              <InputField
                name='jobLocation.zipCode'
                label='ZIP Code'
                placeholder='94105'
                showIsRequired
              />
            </CardContent>
          </Card>

          {/* Employment & Education */}
          <Card>
            <CardHeader>
              <CardTitle>Employment & Education</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <InputField
                name='employmentType'
                type={INPUT_TYPES.SELECT}
                label='Employment Type'
                selectOptions={EMPLOYMENT_TYPES}
                showIsRequired
              />
              <InputField
                name='educationRequirement'
                type={INPUT_TYPES.SELECT}
                label='Education Requirement'
                selectOptions={EDUCATION_REQUIREMENTS}
                showIsRequired
              />
            </CardContent>
          </Card>

          {/* Department */}
          <Card>
            <CardHeader>
              <CardTitle>Department</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <InputField
                name='department'
                type={INPUT_TYPES.SELECT}
                label='Department'
                selectOptions={DEPARTMENTS.map((dept) => ({
                  value: dept,
                  label: dept,
                }))}
                showIsRequired
              />
              <div className='space-y-2'>
                <Label className='text-sm font-medium'>
                  Add Custom Department
                </Label>
                <div className='flex gap-2'>
                  <Input
                    placeholder='Enter custom department'
                    value={customDepartment}
                    onChange={(e) => setCustomDepartment(e.target.value)}
                  />
                  <Button type='button' onClick={addCustomDepartment} size='sm'>
                    <Plus className='w-4 h-4' />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className='space-y-6'>
          {/* Compensation */}
          <Card>
            <CardHeader>
              <CardTitle>Compensation</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <InputField
                name='payType'
                type={INPUT_TYPES.SELECT}
                label='Pay Type'
                selectOptions={PAY_TYPES}
                showIsRequired
              />

              <div className='space-y-3'>
                <Label className='text-sm font-medium'>
                  Pay Rate Structure
                </Label>
                <RadioGroup
                  value={payRateType}
                  onValueChange={(value) => setValue('payRate.type', value)}
                >
                  <div className='flex items-center space-x-2'>
                    <RadioGroupItem value='fixed' id='fixed' />
                    <Label htmlFor='fixed'>Fixed Amount</Label>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <RadioGroupItem value='range' id='range' />
                    <Label htmlFor='range'>Salary Range</Label>
                  </div>
                </RadioGroup>
              </div>

              {payRateType === 'fixed' ? (
                <InputField
                  name='payRate.amount'
                  type={INPUT_TYPES.NUMBER}
                  label={`${payType === 'hourly' ? 'Hourly' : 'Annual'} Rate`}
                  placeholder={payType === 'hourly' ? '25.00' : '75000'}
                />
              ) : (
                <div className='grid grid-cols-2 gap-4'>
                  <InputField
                    name='payRate.min'
                    type={INPUT_TYPES.NUMBER}
                    label='Minimum'
                    placeholder={payType === 'hourly' ? '20.00' : '60000'}
                  />
                  <InputField
                    name='payRate.max'
                    type={INPUT_TYPES.NUMBER}
                    label='Maximum'
                    placeholder={payType === 'hourly' ? '30.00' : '90000'}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <InputField
                name='positionsToHire'
                type={INPUT_TYPES.TEXT}
                label='Number of Positions'
                placeholder='1'
                showIsRequired
              />
              <InputField
                name='exemptStatus'
                type={INPUT_TYPES.SELECT}
                label='Exempt Status'
                selectOptions={EXEMPT_STATUSES}
              />
              <InputField
                name='eeoJobCategory'
                type={INPUT_TYPES.SELECT}
                label='EEO Job Category'
                selectOptions={EEO_JOB_CATEGORIES.map((cat) => ({
                  value: cat,
                  label: cat,
                }))}
              />
            </CardContent>
          </Card>

          {/* Job Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Job Requirements</CardTitle>
              <p className='text-sm text-gray-600'>
                Add specific requirements or qualifications
              </p>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <div className='flex gap-2'>
                  <Input
                    placeholder='Enter a requirement'
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
                  />
                  <Button type='button' onClick={addRequirement} size='sm'>
                    <Plus className='w-4 h-4' />
                  </Button>
                </div>
              </div>

              {jobRequirements.length > 0 && (
                <div className='space-y-2'>
                  <Label className='text-sm font-medium'>Requirements:</Label>
                  <div className='space-y-2'>
                    {jobRequirements.map((req: string, index: number) => (
                      <div
                        key={index}
                        className='flex items-center justify-between bg-gray-50 p-2 rounded'
                      >
                        <span className='text-sm'>{req}</span>
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          onClick={() => removeRequirement(index)}
                        >
                          <X className='w-4 h-4' />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
