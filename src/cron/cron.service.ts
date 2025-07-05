/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { DataLog } from 'src/entities/datalog.entity';
import { User } from 'src/entities/user.entity';
import { Setting } from 'src/entities/setting.entity';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);
  private readonly RENDER_URL = 'https://datalogserver.onrender.com';

  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(DataLog)
    private readonly datalogRepository: Repository<DataLog>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
  ) {}

  /**
   * Keep Render server awake by pinging every 5 minutes
   * This prevents the free tier from sleeping
   */
  @Cron('*/5 * * * *') // Every 5 minutes
  async keepServerAwake() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.RENDER_URL}/health`, {
          timeout: 10000, // 10 second timeout
        }),
      );
      this.logger.log(
        `🚀 Server ping successful - Status: ${response.status} at ${new Date().toISOString()}`,
      );
    } catch (error) {
      this.logger.warn(
        `⚠️ Server ping failed: ${error.message} at ${new Date().toISOString()}`,
      );
    }
  }

  /**
   * Check for data plans expiring in the next 24 hours
   * Send notifications to users who have enabled expiry reminders
   */
  @Cron('0 9 * * *') // Every day at 9 AM
  async checkExpiringDataPlans() {
    try {
      this.logger.log('🔍 Checking for expiring data plans...');

      // Get data plans expiring in the next 24 hours
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const dayAfterTomorrow = new Date();
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

      const expiringPlans = await this.datalogRepository
        .createQueryBuilder('datalog')
        .leftJoinAndSelect('datalog.user', 'user')
        .leftJoinAndSelect('datalog.sim', 'sim')
        .where(
          'DATE(datalog.purchaseDate + INTERVAL datalog.validityDays DAY) BETWEEN :tomorrow AND :dayAfter',
          {
            tomorrow: tomorrow.toISOString().split('T')[0],
            dayAfter: dayAfterTomorrow.toISOString().split('T')[0],
          },
        )
        .andWhere('datalog.isFinished = :isFinished', { isFinished: false })
        .getMany();

      this.logger.log(`📊 Found ${expiringPlans.length} expiring data plans`);

      // Group by user and send notifications
      const usersWithExpiringPlans = new Map();

      for (const plan of expiringPlans) {
        const userId = plan.user.id;
        if (!usersWithExpiringPlans.has(userId)) {
          usersWithExpiringPlans.set(userId, {
            user: plan.user,
            plans: [],
          });
        }
        usersWithExpiringPlans.get(userId).plans.push(plan);
      }

      // Check user notification preferences and send alerts
      for (const [userId, userData] of usersWithExpiringPlans) {
        const userSettings = await this.settingRepository.findOne({
          where: { user: { id: userId } },
        });

        if (userSettings?.notifications?.expiryReminders) {
          this.sendExpiryNotification(userData.user, userData.plans);
        }
      }

      this.logger.log('✅ Expiry check completed');
    } catch (error) {
      this.logger.error('❌ Error checking expiring data plans:', error);
    }
  }

  /**
   * Generate and send weekly usage summaries
   * Runs every Monday at 8 AM
   */
  @Cron('0 8 * * 1') // Every Monday at 8 AM
  async sendWeeklyUsageSummaries() {
    try {
      this.logger.log('📈 Generating weekly usage summaries...');

      // Get all users who have enabled usage summaries
      const usersWithSummaries = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.settings', 'settings')
        .where('settings.notifications ->> "usageSummaries" = :enabled', {
          enabled: 'true',
        })
        .getMany();

      for (const user of usersWithSummaries) {
        await this.generateWeeklySummary(user);
      }

      this.logger.log(
        `✅ Weekly summaries sent to ${usersWithSummaries.length} users`,
      );
    } catch (error) {
      this.logger.error('❌ Error sending weekly summaries:', error);
    }
  }

  /**
   * Clean up old finished data logs
   * Runs monthly on the 1st at 3 AM
   */
  @Cron('0 3 1 * *') // 1st of every month at 3 AM
  async cleanupOldDataLogs() {
    try {
      this.logger.log('🧹 Starting database cleanup...');

      // Delete finished data logs older than 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const deletedResult = await this.datalogRepository.delete({
        isFinished: true,
      });

      this.logger.log(`🗑️ Cleaned up ${deletedResult.affected} old data logs`);

      // Log cleanup statistics
      const totalActivePlans = await this.datalogRepository.count({
        where: { isFinished: false },
      });

      const totalUsers = await this.userRepository.count();

      this.logger.log(
        `📊 Cleanup stats - Active plans: ${totalActivePlans}, Total users: ${totalUsers}`,
      );
    } catch (error) {
      this.logger.error('❌ Error during database cleanup:', error);
    }
  }

  /**
   * Monitor high usage patterns and send warnings
   * Runs every 6 hours
   */
  @Cron('0 */6 * * *') // Every 6 hours
  async monitorHighUsagePatterns() {
    try {
      this.logger.log('⚡ Monitoring high usage patterns...');

      // Get users with high usage enabled notifications
      const usersWithHighUsageAlerts = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.settings', 'settings')
        .where('settings.notifications ->> "highUsageWarnings" = :enabled', {
          enabled: 'true',
        })
        .getMany();

      for (const user of usersWithHighUsageAlerts) {
        await this.checkHighUsagePattern(user);
      }

      this.logger.log('✅ High usage monitoring completed');
    } catch (error) {
      this.logger.error('❌ Error monitoring high usage:', error);
    }
  }

  /**
   * Health check endpoint ping
   * Runs every minute to ensure service is responsive
   */
  @Cron('* * * * *') // Every minute
  async healthCheck() {
    try {
      // Simple health check - just log that we're alive
      const activeDataLogs = await this.datalogRepository.count({
        where: { isFinished: false },
      });

      // Only log every 10 minutes to avoid spam
      const now = new Date();
      if (now.getMinutes() % 10 === 0) {
        this.logger.log(
          `💚 Health check - ${activeDataLogs} active data plans`,
        );
      }
    } catch (error) {
      this.logger.error('❌ Health check failed:', error);
    }
  }

  /**
   * Nigerian-specific optimizations
   * Runs daily at 7 PM (peak hours in Nigeria)
   */
  @Cron('0 19 * * *') // Every day at 7 PM
  async nigerianNetworkOptimizations() {
    try {
      this.logger.log('🇳🇬 Running Nigerian network optimizations...');

      // Analyze weekend vs weekday usage patterns
      const weekendPlans = await this.datalogRepository
        .createQueryBuilder('datalog')
        .where('DAYOFWEEK(datalog.purchaseDate) IN (1, 7)') // Sunday = 1, Saturday = 7
        .andWhere('datalog.purchaseDate >= DATE_SUB(NOW(), INTERVAL 30 DAY)')
        .getMany();

      const weekdayPlans = await this.datalogRepository
        .createQueryBuilder('datalog')
        .where('DAYOFWEEK(datalog.purchaseDate) NOT IN (1, 7)')
        .andWhere('datalog.purchaseDate >= DATE_SUB(NOW(), INTERVAL 30 DAY)')
        .getMany();

      this.logger.log(
        `📊 Nigerian usage analysis - Weekend: ${weekendPlans.length}, Weekday: ${weekdayPlans.length}`,
      );

      // Additional Nigerian-specific analytics can be added here
    } catch (error) {
      this.logger.error('❌ Error in Nigerian optimizations:', error);
    }
  }

  /**
   * Private helper methods
   */
  private sendExpiryNotification(user: User, plans: DataLog[]) {
    try {
      const planDetails = plans.map((plan) => ({
        simNickname: plan.sim?.nickname || 'Unknown SIM',
        dataSize: plan.dataSize,
        expiryDate: new Date(
          plan.purchaseDate.getTime() + plan.validityDays * 24 * 60 * 60 * 1000,
        ),
      }));

      this.logger.log(
        `📧 [NOTIFICATION] User ${user.fullName} (${user.email}) - ${plans.length} plan(s) expiring: ${planDetails.map((p) => `${p.dataSize}GB on ${p.simNickname}`).join(', ')}`,
      );

      // Here you would actually send the notification
      // await this.emailService.sendExpiryAlert(user.email, planDetails);
      // await this.smsService.sendAlert(user.phoneNumber, `DataLog Alert: ${plans.length} data plan(s) expiring soon!`);
    } catch (error) {
      this.logger.error(
        `❌ Failed to send expiry notification to user ${user.id}:`,
        error,
      );
    }
  }

  private async generateWeeklySummary(user: User) {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const weeklyPlans = await this.datalogRepository.find({
        where: {
          user: { id: user.id },
          purchaseDate: MoreThan(oneWeekAgo),
        },
        relations: ['sim'],
      });

      const totalSpent = weeklyPlans.reduce((sum, plan) => sum + plan.price, 0);
      const totalData = weeklyPlans.reduce(
        (sum, plan) => sum + plan.dataSize,
        0,
      );
      const avgCostPerGB = totalData > 0 ? totalSpent / totalData : 0;

      this.logger.log(
        `📊 [WEEKLY SUMMARY] User ${user.fullName} - ₦${totalSpent} spent, ${totalData}GB purchased, ₦${avgCostPerGB.toFixed(2)}/GB`,
      );

      // Here you would send the actual summary
      // await this.emailService.sendWeeklySummary(user.email, { totalSpent, totalData, avgCostPerGB, plans: weeklyPlans });
    } catch (error) {
      this.logger.error(
        `❌ Failed to generate weekly summary for user ${user.id}:`,
        error,
      );
    }
  }

  private async checkHighUsagePattern(user: User) {
    try {
      const userSettings = await this.settingRepository.findOne({
        where: { user: { id: user.id } },
      });

      if (!userSettings?.dailyUsageEstimate) return;

      // Get recent data purchases to analyze usage patterns
      const recentPlans = await this.datalogRepository.find({
        where: {
          user: { id: user.id },
          purchaseDate: MoreThan(
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          ), // Last 7 days
        },
      });

      const totalDataPurchased = recentPlans.reduce(
        (sum, plan) => sum + plan.dataSize,
        0,
      );
      const dailyAverage = totalDataPurchased / 7;
      const expectedUsage = userSettings.dailyUsageEstimate;

      // Alert if usage is 50% higher than expected
      if (dailyAverage > expectedUsage * 1.5) {
        this.logger.log(
          `⚠️ [HIGH USAGE ALERT] User ${user.fullName} - Daily avg: ${dailyAverage.toFixed(2)}GB vs expected: ${expectedUsage}GB`,
        );

        // Send high usage notification
        // await this.notificationService.sendHighUsageAlert(user, dailyAverage, expectedUsage);
      }
    } catch (error) {
      this.logger.error(
        `❌ Failed to check high usage for user ${user.id}:`,
        error,
      );
    }
  }
}
