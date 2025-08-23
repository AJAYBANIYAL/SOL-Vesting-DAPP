export interface VestingScheduleData {
  id: string
  authority: string
  beneficiary: string
  tokenMint: string
  startDate: string
  endDate: string
  totalAmount: number
  claimedAmount: number
  releaseFrequency: string
  transactionSignature?: string
  createdAt: number
  status: 'pending' | 'active' | 'completed'
}

const STORAGE_KEY = 'vesting_schedules'

export class VestingStorage {
  static saveVestingSchedule(schedule: VestingScheduleData): void {
    try {
      const existingSchedules = this.getAllVestingSchedules()
      const updatedSchedules = [...existingSchedules, schedule]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSchedules))
    } catch (error) {
      console.error('Error saving vesting schedule:', error)
    }
  }

  static getAllVestingSchedules(): VestingScheduleData[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading vesting schedules:', error)
      return []
    }
  }

  static getVestingSchedulesForUser(userAddress: string): VestingScheduleData[] {
    const allSchedules = this.getAllVestingSchedules()
    return allSchedules.filter(
      schedule => 
        schedule.authority === userAddress || 
        schedule.beneficiary === userAddress
    )
  }

  static getVestingSchedulesForBeneficiary(beneficiaryAddress: string): VestingScheduleData[] {
    const allSchedules = this.getAllVestingSchedules()
    return allSchedules.filter(schedule => schedule.beneficiary === beneficiaryAddress)
  }

  static updateVestingSchedule(id: string, updates: Partial<VestingScheduleData>): void {
    try {
      const allSchedules = this.getAllVestingSchedules()
      const updatedSchedules = allSchedules.map(schedule =>
        schedule.id === id ? { ...schedule, ...updates } : schedule
      )
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSchedules))
    } catch (error) {
      console.error('Error updating vesting schedule:', error)
    }
  }

  static deleteVestingSchedule(id: string): void {
    try {
      const allSchedules = this.getAllVestingSchedules()
      const filteredSchedules = allSchedules.filter(schedule => schedule.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredSchedules))
    } catch (error) {
      console.error('Error deleting vesting schedule:', error)
    }
  }

  static calculateClaimableAmount(schedule: VestingScheduleData): number {
    const currentTime = Date.now()
    const startTime = new Date(schedule.startDate).getTime()
    const endTime = new Date(schedule.endDate).getTime()
    
    if (currentTime < startTime) {
      return 0
    }
    
    if (currentTime >= endTime) {
      return schedule.totalAmount - schedule.claimedAmount
    }
    
    const totalDuration = endTime - startTime
    const elapsedTime = currentTime - startTime
    const totalClaimable = (schedule.totalAmount * elapsedTime) / totalDuration
    
    return Math.max(0, Math.floor(totalClaimable) - schedule.claimedAmount)
  }

  static getScheduleStatus(schedule: VestingScheduleData): 'pending' | 'active' | 'completed' {
    const currentTime = Date.now()
    const startTime = new Date(schedule.startDate).getTime()
    const endTime = new Date(schedule.endDate).getTime()
    
    if (currentTime < startTime) {
      return 'pending'
    } else if (currentTime >= endTime && schedule.claimedAmount >= schedule.totalAmount) {
      return 'completed'
    } else {
      return 'active'
    }
  }
}
