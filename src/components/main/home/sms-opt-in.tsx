import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { MessageSquare, Phone, Shield } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'

export function SMSOptIn() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const navigate = useNavigate()

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')
    
    // Format as (XXX) XXX-XXXX
    if (digits.length >= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
    } else if (digits.length >= 3) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    } else {
      return digits
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhoneNumber(formatted)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phoneNumber || !agreed) return

    setIsSubmitting(true)
    
    try {
      // TODO: Implement SMS opt-in API call
      // await API.sms.optIn({ phoneNumber: phoneNumber.replace(/\D/g, '') })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setIsSubmitted(true)
    } catch (error) {
      console.error('SMS opt-in failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-green-800 mb-2">Successfully Subscribed!</h3>
          <p className="text-sm text-green-600 mb-4">
            You'll receive updates about new job opportunities and hiring tips.
          </p>
          <p className="text-xs text-gray-500">
            Reply STOP to unsubscribe at any time.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-lg mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <MessageSquare className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">💼 Get Hiring Tips via Text</h3>
          <p className="text-sm text-gray-600">
            Stay ahead with the latest recruiting insights
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="(555) 123-4567"
                  className="pl-10"
                  maxLength={14}
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={!phoneNumber || !agreed || isSubmitting}
              className="px-6"
            >
              {isSubmitting ? 'Joining...' : 'Join'}
            </Button>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="sms-consent"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked as boolean)}
              className="mt-1"
            />
            <Label htmlFor="sms-consent" className="text-xs text-gray-600 leading-relaxed">
              I agree to receive hiring tips and platform updates from HirePlan (frequency varies). 
              Msg & data rates may apply. Reply STOP to opt out or HELP for help. 
              Not required to use our services. See our{' '}
              <button
                type="button"
                onClick={() => navigate('/privacy')}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Privacy Policy
              </button>{' '}
              and{' '}
              <button
                type="button"
                onClick={() => navigate('/terms')}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Terms
              </button>.
            </Label>
          </div>
        </form>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            🔒 Secure • 📞 All carriers supported • ✉️ support@hireplan.co
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 