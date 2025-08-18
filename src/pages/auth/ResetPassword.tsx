import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle2, Lock, LogIn } from 'lucide-react'
import API from '@/http'
import { errorResolver } from '@/lib/utils'
import { toast } from 'sonner'

const ResetPassword = () => {
    const navigate = useNavigate()
    const params = useParams()
    const [searchParams] = useSearchParams()
    const tokenFromParam = params.token
    const tokenFromQuery = searchParams.get('token') || undefined
    const token = tokenFromParam || tokenFromQuery

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!token) {
            toast.error('Invalid or missing token')
            return
        }
        if (!password || password.length < 8) {
            toast.error('Password must be at least 8 characters')
            return
        }
        const hasLetter = /[A-Za-z]/.test(password)
        const hasSpecial = /[^A-Za-z0-9]/.test(password)
        if (!hasLetter || !hasSpecial) {
            toast.error('Password must include at least 1 alphabet letter and 1 special character')
            return
        }
        if (password !== confirmPassword) {
            toast.error('Passwords do not match')
            return
        }

        setIsSubmitting(true)
        try {
            const { status, message } = await API.auth.resetPasswordWithToken(token, password)
            console.log(message);
            if (status) {
                setIsSuccess(true)
                toast.success(message || 'Password updated successfully')
            } else {
                toast.error(message || 'Failed to reset password')
            }
        } catch (err) {
            const msg = errorResolver(err)
            toast.error(msg)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <Card>
                        <CardHeader className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-8 h-8 text-green-600" />
                            </div>
                            <CardTitle className="text-2xl">Password Reset Successful</CardTitle>
                            <CardDescription>
                                You can now log in with your new password
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={() => navigate('/login')} className="w-full">
                                <LogIn className="w-4 h-4 mr-2" /> Go to Login
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <Card>
                    <CardHeader className="text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Lock className="w-8 h-8 text-blue-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Set New Password</CardTitle>
                        <CardDescription>
                            Enter and confirm your new password to complete the reset
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <Label htmlFor="password">New Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter new password"
                                    className="mt-1"
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isSubmitting || !token}>
                                {isSubmitting ? 'Updating...' : 'Update Password'}
                            </Button>
                            {!token && (
                                <p className="text-sm text-red-600 text-center">Missing token. Please use the link from your email.</p>
                            )}
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default ResetPassword