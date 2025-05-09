import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useStaffStore } from '@/stores/useStaffStore'
import { useBookingStore } from '@/stores/useBookingStore'
import { Badge } from '@/components/ui/badge'
import { StaffMember } from '@/types/staff'
import { Loading } from '@/components/ui/loading'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { StaffAvatar } from '@/components/ui/staff-avatar'

export const StaffSelectionPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { staff, fetchStaff, isLoading, error } = useStaffStore()
  const { setSelectedStaff, resetBooking } = useBookingStore()

  useEffect(() => {
    // Reset any previous booking data when starting a new booking flow
    resetBooking()
    // Fetch all available staff members
    fetchStaff()
  }, [fetchStaff, resetBooking])

  const handleSelectStaff = (staffId: string) => {
    // Save the selected staff to the booking store
    const staffMember = staff.find((s: StaffMember) => s.id === staffId)
    if (staffMember) {
      setSelectedStaff(staffMember)
      // Navigate to service selection
      navigate({ to: '/user/services' })
    }
  }

  if (isLoading) {
    return <Loading centered className="py-8" text={t('staff.loading')} />
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-8">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (staff.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {t('staff.title')}
          </h1>
          <p className="text-muted-foreground mt-2">{t('staff.description')}</p>
        </div>
        <Alert className="my-8">
          <AlertDescription>{t('staff.noStaffAvailable')}</AlertDescription>
        </Alert>
        <Button onClick={() => navigate({ to: '/user/dashboard' })}>
          {t('common.back')}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          {t('staff.title')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('staff.selectDescription')}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {staff.map((member: StaffMember) => (
          <Card key={member.id}>
            <CardHeader>
              <div className="flex justify-center mb-4">
                <StaffAvatar
                  src={member.image}
                  name={member.name}
                  size="xl"
                  className="shadow-md"
                />
              </div>
              <CardTitle>{member.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t('staff.experience', { years: member.yearsOfExperience })}
              </p>
              <div className="flex flex-wrap gap-2">
                {member.specialties?.map(specialty => (
                  <Badge key={specialty} variant="secondary">
                    {specialty}
                  </Badge>
                ))}
              </div>
              <Button
                className="w-full"
                onClick={() => handleSelectStaff(member.id)}
              >
                {t('staff.select')}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default StaffSelectionPage
