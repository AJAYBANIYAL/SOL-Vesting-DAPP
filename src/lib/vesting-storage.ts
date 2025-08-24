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
  lastClaimedAt?: number
  claimHistory?: ClaimHistory[]
}

export interface ClaimHistory {
  id: string
  amount: number
  timestamp: number
  transactionSignature?: string
  status: 'pending' | 'completed' | 'failed'
}

const STORAGE_KEY = 'vesting_schedules'

export class VestingStorage {
  static saveVestingSchedule(schedule: VestingScheduleData): void {
    try {
      const existingSchedules = this.getAllVestingSchedules()
      const updatedSchedules = [...existingSchedules, schedule]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSchedules))
      
      // Also save to a backup location for better persistence
      const backupKey = `vesting_backup_${Date.now()}`
      localStorage.setItem(backupKey, JSON.stringify(schedule))
      
      console.log('Vesting schedule saved successfully:', schedule.id)
    } catch (error) {
      console.error('Error saving vesting schedule:', error)
      throw new Error('Failed to save vesting schedule to storage')
    }
  }

  static getAllVestingSchedules(): VestingScheduleData[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const schedules = stored ? JSON.parse(stored) : []
      
      // Also try to recover from backup if main storage is empty
      if (schedules.length === 0) {
        const backupSchedules = this.recoverFromBackup()
        if (backupSchedules.length > 0) {
          console.log('Recovered schedules from backup:', backupSchedules.length)
          return backupSchedules
        }
      }
      
      return schedules
    } catch (error) {
      console.error('Error loading vesting schedules:', error)
      return []
    }
  }

  static recoverFromBackup(): VestingScheduleData[] {
    const schedules: VestingScheduleData[] = []
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('vesting_backup_')) {
          const stored = localStorage.getItem(key)
          if (stored) {
            const schedule = JSON.parse(stored)
            schedules.push(schedule)
          }
        }
      }
    } catch (error) {
      console.error('Error recovering from backup:', error)
    }
    return schedules
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
      
      // Update backup as well
      const updatedSchedule = updatedSchedules.find(s => s.id === id)
      if (updatedSchedule) {
        const backupKey = `vesting_backup_${updatedSchedule.createdAt}`
        localStorage.setItem(backupKey, JSON.stringify(updatedSchedule))
      }
      
      console.log('Vesting schedule updated successfully:', id)
    } catch (error) {
      console.error('Error updating vesting schedule:', error)
      throw new Error('Failed to update vesting schedule')
    }
  }

  static addClaimHistory(scheduleId: string, claim: ClaimHistory): void {
    try {
      const allSchedules = this.getAllVestingSchedules()
      const updatedSchedules = allSchedules.map(schedule => {
        if (schedule.id === scheduleId) {
          const claimHistory = schedule.claimHistory || []
          return {
            ...schedule,
            claimHistory: [...claimHistory, claim],
            lastClaimedAt: claim.timestamp
          }
        }
        return schedule
      })
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSchedules))
      
      // Also save claim history separately for better tracking
      const historyKey = `claim_history_${scheduleId}`
      const existingHistory = localStorage.getItem(historyKey)
      const history = existingHistory ? JSON.parse(existingHistory) : []
      history.push(claim)
      localStorage.setItem(historyKey, JSON.stringify(history))
      
      console.log('Claim history added successfully:', claim.id)
    } catch (error) {
      console.error('Error adding claim history:', error)
      throw new Error('Failed to add claim history')
    }
  }

  static getClaimHistory(scheduleId: string): ClaimHistory[] {
    try {
      const historyKey = `claim_history_${scheduleId}`
      const stored = localStorage.getItem(historyKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading claim history:', error)
      return []
    }
  }

  static deleteVestingSchedule(id: string): void {
    try {
      const allSchedules = this.getAllVestingSchedules()
      const filteredSchedules = allSchedules.filter(schedule => schedule.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredSchedules))
      
      // Clean up backup and history
      const backupKey = `vesting_backup_${id}`
      const historyKey = `claim_history_${id}`
      localStorage.removeItem(backupKey)
      localStorage.removeItem(historyKey)
      
      console.log('Vesting schedule deleted successfully:', id)
    } catch (error) {
      console.error('Error deleting vesting schedule:', error)
      throw new Error('Failed to delete vesting schedule')
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

  static exportVestingData(): string {
    try {
      const schedules = this.getAllVestingSchedules()
      const exportData = {
        schedules,
        exportDate: new Date().toISOString(),
        version: '1.0'
      }
      return JSON.stringify(exportData, null, 2)
    } catch (error) {
      console.error('Error exporting vesting data:', error)
      throw new Error('Failed to export vesting data')
    }
  }

  static importVestingData(data: string): void {
    try {
      const importData = JSON.parse(data)
      if (importData.schedules && Array.isArray(importData.schedules)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(importData.schedules))
        console.log('Vesting data imported successfully:', importData.schedules.length, 'schedules')
      } else {
        throw new Error('Invalid import data format')
      }
    } catch (error) {
      console.error('Error importing vesting data:', error)
      throw new Error('Failed to import vesting data')
    }
  }
}
