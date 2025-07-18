'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { useFormContext } from 'react-hook-form'

export function AIPreferencesStep() {
  const { watch, setValue } = useFormContext()

  const preferences = [
    {
      key: 'minimumMatchScore',
      label: 'Minimum Match Score',
      description: "Candidates below this score won't be shown",
      value: watch('minimumMatchScore') || 70,
      min: 0,
      max: 100,
      step: 5,
    },
    {
      key: 'autoRejectThreshold',
      label: 'Auto-Reject Threshold',
      description: 'Automatically reject candidates below this score',
      value: watch('autoRejectThreshold') || 30,
      min: 0,
      max: 100,
      step: 5,
    },
  ]

  const weights = [
    {
      key: 'experienceWeight',
      label: 'Experience Weight',
      description: 'How much to prioritize work experience',
      value: watch('experienceWeight') || 40,
    },
    {
      key: 'educationWeight',
      label: 'Education Weight',
      description: 'How much to prioritize educational background',
      value: watch('educationWeight') || 25,
    },
    {
      key: 'certificationsWeight',
      label: 'Certifications Weight',
      description: 'How much to prioritize professional certifications',
      value: watch('certificationsWeight') || 20,
    },
    {
      key: 'keywordsWeight',
      label: 'Keywords Weight',
      description: 'How much to prioritize keyword matches',
      value: watch('keywordsWeight') || 15,
    },
  ]

  const handleSliderChange = (key: string, value: number[]) => {
    setValue(key, value[0])
  }

  return (
    <div className='space-y-6'>
      <div className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Matching Thresholds</CardTitle>
            <CardDescription>
              Set minimum scores for candidate evaluation
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            {preferences.map((pref) => (
              <div key={pref.key} className='space-y-3'>
                <div className='flex justify-between items-center'>
                  <Label className='text-sm font-medium'>{pref.label}</Label>
                  <span className='text-sm font-semibold text-blue-600'>
                    {pref.value}%
                  </span>
                </div>
                <Slider
                  value={[pref.value]}
                  onValueChange={(value) => handleSliderChange(pref.key, value)}
                  min={pref.min}
                  max={pref.max}
                  step={pref.step}
                  className='w-full'
                />
                <p className='text-xs text-gray-500'>{pref.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>
              Evaluation Criteria Weights
            </CardTitle>
            <CardDescription>
              Adjust the importance of different factors in candidate evaluation
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            {weights.map((weight) => (
              <div key={weight.key} className='space-y-3'>
                <div className='flex justify-between items-center'>
                  <Label className='text-sm font-medium'>{weight.label}</Label>
                  <span className='text-sm font-semibold text-blue-600'>
                    {weight.value}%
                  </span>
                </div>
                <Slider
                  value={[weight.value]}
                  onValueChange={(value) =>
                    handleSliderChange(weight.key, value)
                  }
                  min={0}
                  max={100}
                  step={5}
                  className='w-full'
                />
                <p className='text-xs text-gray-500'>{weight.description}</p>
              </div>
            ))}

            <div className='mt-4 p-3 bg-blue-50 rounded-lg'>
              <p className='text-sm text-blue-800'>
                <strong>Total Weight:</strong>{' '}
                {weights.reduce((sum, weight) => sum + weight.value, 0)}%
              </p>
              <p className='text-xs text-blue-600 mt-1'>
                Weights don't need to total 100% - they represent relative
                importance
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
