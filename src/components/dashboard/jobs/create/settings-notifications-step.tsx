'use client'

import { InputField } from '@/components/common/InputField'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { APPLICANT_STATUSES, INPUT_TYPES } from '@/interfaces'
import { Bell, Mail, MessageSquare, Plus, Settings, X, Zap } from 'lucide-react'
import { useState } from 'react'
import { useFormContext } from 'react-hook-form'

export function SettingsNotificationsStep() {
  const { watch, setValue } = useFormContext()
  const [newRecipient, setNewRecipient] = useState('')
  const [newCustomField, setNewCustomField] = useState('')

  const notifyOnApplication = watch('notifyOnApplication') || {
    enabled: false,
    recipients: [],
  }
  const dailyRoundup = watch('dailyRoundup') || {
    enabled: false,
    recipients: [],
    time: '09:00',
  }
  const customFields = watch('externalApplicationSetup.customFields') || []

  const addRecipient = (type: 'notify' | 'roundup') => {
    if (newRecipient.trim()) {
      const currentData = type === 'notify' ? notifyOnApplication : dailyRoundup
      const updatedRecipients = [...currentData.recipients, newRecipient.trim()]
      setValue(
        type === 'notify'
          ? 'notifyOnApplication.recipients'
          : 'dailyRoundup.recipients',
        updatedRecipients
      )
      setNewRecipient('')
    }
  }

  const removeRecipient = (type: 'notify' | 'roundup', index: number) => {
    const currentData = type === 'notify' ? notifyOnApplication : dailyRoundup
    const updatedRecipients = currentData.recipients.filter(
      (_: any, i: number) => i !== index
    )
    setValue(
      type === 'notify'
        ? 'notifyOnApplication.recipients'
        : 'dailyRoundup.recipients',
      updatedRecipients
    )
  }

  const addCustomField = () => {
    if (newCustomField.trim()) {
      const updatedFields = [...customFields, newCustomField.trim()]
      setValue('externalApplicationSetup.customFields', updatedFields)
      setNewCustomField('')
    }
  }

  const removeCustomField = (index: number) => {
    const updatedFields = customFields.filter(
      (_: any, i: number) => i !== index
    )
    setValue('externalApplicationSetup.customFields', updatedFields)
  }

  return (
    <div className='space-y-8'>
      <div>
        <h2 className='text-2xl font-bold text-gray-900'>
          Settings & Notifications
        </h2>
        <p className='text-gray-600 mt-1'>
          Configure posting schedule, notifications, and automation rules
        </p>
      </div>

      <Tabs defaultValue='schedule' className='space-y-6'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='schedule'>Schedule</TabsTrigger>
          <TabsTrigger value='notifications'>Notifications</TabsTrigger>
          <TabsTrigger value='templates'>Templates</TabsTrigger>
          <TabsTrigger value='automation'>Automation</TabsTrigger>
        </TabsList>

        {/* Schedule Tab */}
        <TabsContent value='schedule' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Settings className='w-5 h-5' />
                Posting Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <InputField
                  name='startDate'
                  type={INPUT_TYPES.TEXT}
                  label='Start Date'
                  placeholder='YYYY-MM-DD'
                  showIsRequired
                  description='When the job posting should go live'
                />
                <InputField
                  name='endDate'
                  type={INPUT_TYPES.TEXT}
                  label='End Date'
                  placeholder='YYYY-MM-DD'
                  showIsRequired
                  description='When the job posting should be removed'
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>External Application Setup</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <InputField
                name='externalApplicationSetup.redirectUrl'
                label='Custom Application URL'
                placeholder='https://yourcompany.com/apply'
                description='Optional: Redirect applicants to your own application page'
              />
              <div className='space-y-2'>
                <Label className='text-sm font-medium'>
                  Custom Application Fields
                </Label>
                <div className='flex gap-2'>
                  <Input
                    placeholder='Add custom field (e.g., Portfolio URL)'
                    value={newCustomField}
                    onChange={(e) => setNewCustomField(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === 'Enter' &&
                      (e.preventDefault(), addCustomField())
                    }
                  />
                  <Button
                    type='button'
                    size='sm'
                    variant='outline'
                    onClick={addCustomField}
                  >
                    <Plus className='w-4 h-4 mr-2' />
                    Add Field
                  </Button>
                </div>

                {customFields.length > 0 && (
                  <div className='mt-3 space-y-2 pl-2 border-l-2 border-blue-100'>
                    <p className='text-xs text-gray-500'>Custom fields:</p>
                    <div className='flex flex-wrap gap-2'>
                      {customFields.map((field: string, index: number) => (
                        <Badge
                          key={index}
                          variant='secondary'
                          className='flex items-center gap-1 text-sm py-1 px-2'
                        >
                          <span>{field}</span>
                          <X
                            className='w-3 h-3 cursor-pointer ml-1'
                            onClick={() => removeCustomField(index)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <p className='text-xs text-gray-500 mt-2'>
                      These fields will appear on your application form.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value='notifications' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Bell className='w-5 h-5' />
                Application Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <Label className='text-sm font-medium'>
                    Notify when someone applies
                  </Label>
                  <p className='text-xs text-gray-600'>
                    Get instant notifications for new applications
                  </p>
                </div>
                <Switch
                  checked={notifyOnApplication.enabled}
                  onCheckedChange={(checked) =>
                    setValue('notifyOnApplication.enabled', checked)
                  }
                />
              </div>

              {notifyOnApplication.enabled && (
                <div className='space-y-3 pl-4 border-l-2 border-blue-200'>
                  <div className='flex gap-2'>
                    <Input
                      placeholder='Enter email address'
                      value={newRecipient}
                      onChange={(e) => setNewRecipient(e.target.value)}
                    />
                    <Button
                      type='button'
                      onClick={() => addRecipient('notify')}
                      size='sm'
                    >
                      <Plus className='w-4 h-4' />
                    </Button>
                  </div>
                  {notifyOnApplication.recipients.length > 0 && (
                    <div className='flex flex-wrap gap-2'>
                      {notifyOnApplication.recipients.map(
                        (email: string, index: number) => (
                          <Badge
                            key={index}
                            variant='secondary'
                            className='flex items-center gap-1'
                          >
                            {email}
                            <X
                              className='w-3 h-3 cursor-pointer'
                              onClick={() => removeRecipient('notify', index)}
                            />
                          </Badge>
                        )
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Daily Application Roundup</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <Label className='text-sm font-medium'>
                    Send daily application summary
                  </Label>
                  <p className='text-xs text-gray-600'>
                    Get a daily summary of all applications
                  </p>
                </div>
                <Switch
                  checked={dailyRoundup.enabled}
                  onCheckedChange={(checked) =>
                    setValue('dailyRoundup.enabled', checked)
                  }
                />
              </div>

              {dailyRoundup.enabled && (
                <div className='space-y-3 pl-4 border-l-2 border-green-200'>
                  <InputField
                    name='dailyRoundup.time'
                    type={INPUT_TYPES.TEXT}
                    label='Send Time'
                    placeholder='09:00'
                    description='24-hour format (e.g., 09:00, 17:30)'
                  />
                  <div className='flex gap-2'>
                    <Input
                      placeholder='Enter email address'
                      value={newRecipient}
                      onChange={(e) => setNewRecipient(e.target.value)}
                    />
                    <Button
                      type='button'
                      onClick={() => addRecipient('roundup')}
                      size='sm'
                    >
                      <Plus className='w-4 h-4' />
                    </Button>
                  </div>
                  {dailyRoundup.recipients.length > 0 && (
                    <div className='flex flex-wrap gap-2'>
                      {dailyRoundup.recipients.map(
                        (email: string, index: number) => (
                          <Badge
                            key={index}
                            variant='secondary'
                            className='flex items-center gap-1'
                          >
                            {email}
                            <X
                              className='w-3 h-3 cursor-pointer'
                              onClick={() => removeRecipient('roundup', index)}
                            />
                          </Badge>
                        )
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value='templates' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <MessageSquare className='w-5 h-5' />
                Correspondence Templates
              </CardTitle>
              <p className='text-sm text-gray-600'>
                Create email and SMS templates for candidate communication
              </p>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <Card className='border-dashed'>
                  <CardContent className='p-4 text-center'>
                    <Mail className='w-8 h-8 text-gray-400 mx-auto mb-2' />
                    <h3 className='font-medium mb-2'>Email Templates</h3>
                    <p className='text-sm text-gray-600 mb-3'>
                      Create email templates for candidate communication
                    </p>
                    <Button size='sm' variant='outline'>
                      Create Email Template
                    </Button>
                  </CardContent>
                </Card>
                <Card className='border-dashed'>
                  <CardContent className='p-4 text-center'>
                    <MessageSquare className='w-8 h-8 text-gray-400 mx-auto mb-2' />
                    <h3 className='font-medium mb-2'>SMS Templates</h3>
                    <p className='text-sm text-gray-600 mb-3'>
                      Create SMS templates (120 character limit)
                    </p>
                    <Button size='sm' variant='outline'>
                      Create SMS Template
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Applicant Status Management</CardTitle>
              <p className='text-sm text-gray-600'>
                Customize applicant statuses and workflow
              </p>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
                {APPLICANT_STATUSES.map((status) => (
                  <Badge
                    key={status}
                    variant='outline'
                    className='justify-center py-2'
                  >
                    {status
                      .replace('-', ' ')
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Badge>
                ))}
              </div>
              <Button
                className='mt-4 bg-transparent'
                size='sm'
                variant='outline'
              >
                <Plus className='w-4 h-4 mr-2' />
                Add Custom Status
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Automation Tab */}
        <TabsContent value='automation' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Zap className='w-5 h-5' />
                AI & Automation Rules
              </CardTitle>
              <p className='text-sm text-gray-600'>
                Set up automated actions based on AI scores and status changes
              </p>
            </CardHeader>
            <CardContent className='space-y-4'>
              <Card className='border-dashed'>
                <CardContent className='p-4'>
                  <h3 className='font-medium mb-2'>AI Scoring Rules</h3>
                  <p className='text-sm text-gray-600 mb-3'>
                    Automatically categorize candidates based on AI match scores
                  </p>
                  <Button size='sm' variant='outline'>
                    <Plus className='w-4 h-4 mr-2' />
                    Create AI Rule
                  </Button>
                </CardContent>
              </Card>

              <Card className='border-dashed'>
                <CardContent className='p-4'>
                  <h3 className='font-medium mb-2'>Status Change Automation</h3>
                  <p className='text-sm text-gray-600 mb-3'>
                    Send templates or notifications when status changes
                  </p>
                  <Button size='sm' variant='outline'>
                    <Plus className='w-4 h-4 mr-2' />
                    Create Automation Rule
                  </Button>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resume Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>PDF Processing</span>
                  <Badge variant='default'>Enabled</Badge>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Word Document Processing</span>
                  <Badge variant='default'>Enabled</Badge>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Text File Processing</span>
                  <Badge variant='default'>Enabled</Badge>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Image File Processing</span>
                  <Badge variant='default'>Enabled</Badge>
                </div>
              </div>
              <p className='text-xs text-gray-600 mt-3'>
                System automatically processes and scores all supported file
                types
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
