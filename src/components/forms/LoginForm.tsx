'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'

import { InputField } from '@/components/common/InputField'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import API from '@/http'
import { mutateSession } from '@/http/auth/mutateSession'
import { INPUT_TYPES } from '@/interfaces'
import { errorResolver } from '@/lib/utils'
import { AlertCircle, X } from 'lucide-react'
import { useNavigate } from 'react-router'

const loginFormSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(1, { message: 'Password is required' })
    .min(8, { message: 'Password must be at least 8 characters' }),
  rememberMe: z.boolean(),
})

type LoginFormValues = z.infer<typeof loginFormSchema>

export const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true)
    setError(null)
    try {
      const response = await API.auth.signin(data.email, data.password)
      const user = response.user
      const token = response.tokens.accessToken.token
      if (user.status === 'active') {
        mutateSession({ shouldBroadcast: true, accessToken: token })
      }
    } catch (err) {
      const errMessage = errorResolver(err)
      setError(errMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {error && (
          <div className='mb-6 bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 flex items-start'>
            <AlertCircle className='h-5 w-5 mr-2 mt-0.5 flex-shrink-0' />
            <div className='flex-1'>{error}</div>
            <button
              type='button'
              onClick={() => setError(null)}
              className='ml-auto text-red-600 hover:text-red-800'
            >
              <X className='h-4 w-4' />
            </button>
          </div>
        )}

        <div className='space-y-1'>
          <InputField
            name='email'
            type={INPUT_TYPES.EMAIL}
            placeholder='Enter Email'
          />

          <InputField
            name='password'
            type={INPUT_TYPES.PASSWORD}
            placeholder='Enter your password'
          />
        </div>
        <div className='flex items-center justify-between w-full'>
          <FormField
            control={form.control}
            name='rememberMe'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center space-x-2 space-y-0'>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className='text-sm font-medium'>
                  Remember me
                </FormLabel>
              </FormItem>
            )}
          />
          <Button
            variant='link'
            className='text-sm font-medium text-primary underline-offset-4 hover:underline px-0'
            onClick={() => navigate('/forgot-password')}
          >
            Forgot password?
          </Button>
        </div>

        <Button type='submit' className='w-full mt-5' disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
    </FormProvider>
  )
}
