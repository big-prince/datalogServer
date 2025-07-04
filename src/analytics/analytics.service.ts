/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { User } from '../entities/user.entity';
import { Sim } from '../entities/sim.entity';
import { DataLog } from '../entities/datalog.entity';
import { CustomError } from '../common/exceptions/customError';
import { CreateDataLogDto } from './dto/analytics.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Sim) private simRepository: Repository<Sim>,
    @InjectRepository(DataLog) private dataLogRepository: Repository<DataLog>,
  ) {}

  async getDashboardAnalytics(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['sims', 'dataLogs'],
    });

    if (!user) {
      throw new CustomError('User not found', 404);
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get recent data logs
    const recentDataLogs = await this.dataLogRepository.find({
      where: {
        user: { id: userId },
        purchaseDate: Between(thirtyDaysAgo, now),
      },
      relations: ['sim'],
      order: { purchaseDate: 'DESC' },
      take: 5,
    });

    // Get active (unexpired and unfinished) data logs for each SIM
    const activeDataLogs = await this.dataLogRepository.find({
      where: {
        user: { id: userId },
        isFinished: false,
      },
      relations: ['sim'],
    });

    // Filter to only truly active plans (not expired and not finished)
    const validActiveDataLogs = activeDataLogs.filter((log) => {
      const expiryDate = new Date(log.purchaseDate);
      expiryDate.setDate(expiryDate.getDate() + log.validityDays);
      return expiryDate > now;
    });

    // Weekly usage trend
    const weeklyUsage = await this.getWeeklyUsageTrend(userId);

    // Upcoming expirations from active plans
    const upcomingExpirations = validActiveDataLogs
      .map((log) => {
        const expiryDate = new Date(log.purchaseDate);
        expiryDate.setDate(expiryDate.getDate() + log.validityDays);
        return { ...log, expiryDate };
      })
      .filter((log) => {
        const daysDiff =
          (log.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff > 0 && daysDiff <= 7;
      })
      .sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime());

    // Calculate average daily usage based on actual finished plans
    const finishedPlans = await this.dataLogRepository.find({
      where: {
        user: { id: userId },
        isFinished: true,
      },
      relations: ['sim'],
      take: 10,
      order: { actualFinishDate: 'DESC' },
    });

    const avgDailyUsage =
      finishedPlans.length > 0
        ? finishedPlans.reduce((sum, log) => {
            if (log.actualFinishDate) {
              const daysUsed = Math.ceil(
                (new Date(log.actualFinishDate).getTime() -
                  new Date(log.purchaseDate).getTime()) /
                  (1000 * 60 * 60 * 24),
              );
              return sum + log.dataSize / Math.max(daysUsed, 1);
            }
            return sum;
          }, 0) / finishedPlans.length
        : 0;

    // Provider breakdown
    const providerBreakdown = await this.getProviderBreakdown(userId);

    // Monthly spending
    const monthlySpending = await this.getMonthlySpending(userId);

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
      },
      summary: {
        totalSpent: recentDataLogs.reduce((sum, log) => sum + log.price, 0),
        totalData: recentDataLogs.reduce((sum, log) => sum + log.dataSize, 0),
        avgCostPerGB:
          recentDataLogs.length > 0
            ? recentDataLogs.reduce((sum, log) => sum + log.price, 0) /
              recentDataLogs.reduce((sum, log) => sum + log.dataSize, 0)
            : 0,
        totalSims: user.sims.length,
        activePlans: validActiveDataLogs.length,
      },
      usage: {
        weekly: weeklyUsage,
        avgDaily: avgDailyUsage,
      },
      recentTransactions: recentDataLogs.map((log) => ({
        id: log.id,
        provider: log.sim?.provider || 'Unknown',
        amount: log.price,
        dataSize: log.dataSize,
        date: log.purchaseDate,
        expiryDate: log.expiryDate,
        source: log.source,
        simNickname: log.sim?.nickname || 'Unknown',
        purchaseDate: log.purchaseDate,
        price: log.price,
        validityDays: log.validityDays,
      })),
      upcomingExpirations: upcomingExpirations.map((log) => ({
        id: log.id,
        provider: log.sim?.provider || 'Unknown',
        dataSize: log.dataSize,
        expiryDate: log.expiryDate,
        daysLeft: Math.ceil(
          (new Date(log.expiryDate).getTime() - now.getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      })),
      sims: user.sims.map((sim) => {
        // Get active plans for this SIM
        const simActivePlans = validActiveDataLogs.filter(
          (log) => log.sim.id === sim.id,
        );

        // Get monthly spending for this SIM
        const currentMonth = new Date();
        currentMonth.setDate(1);
        const simMonthlyLogs = recentDataLogs.filter(
          (log) => log.sim.id === sim.id && log.purchaseDate >= currentMonth,
        );
        const totalSpent = simMonthlyLogs.reduce(
          (sum, log) => sum + log.price,
          0,
        );
        const purchaseCount = simMonthlyLogs.length;

        // Get last purchase date
        const lastPurchaseDate =
          recentDataLogs
            .filter((log) => log.sim.id === sim.id)
            .sort(
              (a, b) =>
                new Date(b.purchaseDate).getTime() -
                new Date(a.purchaseDate).getTime(),
            )[0]?.purchaseDate || null;

        // Get early finish data for this SIM to track usage patterns
        const simFinishedPlans = finishedPlans.filter(
          (log) => log.sim.id === sim.id,
        );
        const earlyFinishCount = simFinishedPlans.filter((log) => {
          if (log.actualFinishDate) {
            const expectedExpiry = new Date(log.purchaseDate);
            expectedExpiry.setDate(expectedExpiry.getDate() + log.validityDays);
            return new Date(log.actualFinishDate) < expectedExpiry;
          }
          return false;
        }).length;

        return {
          id: sim.id,
          nickname: sim.nickname,
          provider: sim.provider,
          phoneNumber: sim.phoneNumber,
          isActive: simActivePlans.length > 0,
          activePlansCount: simActivePlans.length,
          totalSpent,
          purchaseCount,
          lastPurchaseDate,
          earlyFinishRate:
            simFinishedPlans.length > 0
              ? (earlyFinishCount / simFinishedPlans.length) * 100
              : 0,
        };
      }),
      providerBreakdown,
      monthlySpending,
    };
  }

  async getUsageTrends(
    userId: string,
    period: 'week' | 'month' | 'year',
    simId?: string,
  ) {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    const whereCondition: any = {
      user: { id: userId },
      purchaseDate: Between(startDate, now),
    };

    if (simId) {
      whereCondition.sim = { id: simId };
    }

    const dataLogs = await this.dataLogRepository.find({
      where: whereCondition,
      relations: ['sim'],
      order: { purchaseDate: 'ASC' },
    });

    // Group data by time periods
    const groupedData = this.groupDataByPeriod(dataLogs, period);

    return {
      period,
      startDate,
      endDate: now,
      data: groupedData,
      totalDataPurchased: dataLogs.reduce((sum, log) => sum + log.dataSize, 0),
      totalSpent: dataLogs.reduce((sum, log) => sum + log.price, 0),
    };
  }

  async getSpendingAnalysis(userId: string, period: 'week' | 'month' | 'year') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    const dataLogs = await this.dataLogRepository.find({
      where: {
        user: { id: userId },
        purchaseDate: Between(startDate, now),
      },
      relations: ['sim'],
      order: { purchaseDate: 'DESC' },
    });

    const totalSpent = dataLogs.reduce((sum, log) => sum + log.price, 0);
    const totalData = dataLogs.reduce((sum, log) => sum + log.dataSize, 0);
    const avgCostPerGB = totalData > 0 ? totalSpent / totalData : 0;

    // Group by provider
    const providerSpending = dataLogs.reduce(
      (acc, log) => {
        const provider = log.sim?.provider || 'Unknown';
        if (!acc[provider]) {
          acc[provider] = { spent: 0, data: 0, count: 0 };
        }
        acc[provider].spent += log.price;
        acc[provider].data += log.dataSize;
        acc[provider].count += 1;
        return acc;
      },
      {} as Record<string, { spent: number; data: number; count: number }>,
    );

    // Calculate provider efficiency
    const providerAnalysis = Object.entries(providerSpending).map(
      ([provider, stats]) => ({
        provider,
        totalSpent: stats.spent,
        totalData: stats.data,
        avgCostPerGB: stats.data > 0 ? stats.spent / stats.data : 0,
        purchaseCount: stats.count,
        efficiency: stats.data > 0 ? stats.data / stats.spent : 0,
      }),
    );

    return {
      period,
      startDate,
      endDate: now,
      summary: {
        totalSpent,
        totalData,
        avgCostPerGB,
        purchaseCount: dataLogs.length,
      },
      providerAnalysis: providerAnalysis.sort(
        (a, b) => b.efficiency - a.efficiency,
      ),
      dailySpending: this.groupSpendingByDay(dataLogs),
    };
  }

  async getProviderComparison(userId: string) {
    const dataLogs = await this.dataLogRepository.find({
      where: { user: { id: userId } },
      relations: ['sim'],
    });

    const providerStats = dataLogs.reduce(
      (acc, log) => {
        const provider = log.sim?.provider || 'Unknown';
        if (!acc[provider]) {
          acc[provider] = {
            totalSpent: 0,
            totalData: 0,
            purchaseCount: 0,
            avgDataSize: 0,
            avgPrice: 0,
            costPerGB: 0,
          };
        }
        acc[provider].totalSpent += log.price;
        acc[provider].totalData += log.dataSize;
        acc[provider].purchaseCount += 1;
        return acc;
      },
      {} as Record<string, any>,
    );

    // Calculate averages and cost per GB
    Object.keys(providerStats).forEach((provider) => {
      const stats = providerStats[provider];
      stats.avgDataSize = stats.totalData / stats.purchaseCount;
      stats.avgPrice = stats.totalSpent / stats.purchaseCount;
      stats.costPerGB =
        stats.totalData > 0 ? stats.totalSpent / stats.totalData : 0;
    });

    return Object.entries(providerStats)
      .map(([provider, stats]) => ({
        provider,
        ...stats,
      }))
      .sort((a, b) => a.costPerGB - b.costPerGB);
  }

  async createDataLog(userId: string, createDataLogDto: CreateDataLogDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    const sim = await this.simRepository
      .findOne({
        where: { id: createDataLogDto.simId, user: { id: userId } },
      })
      .catch((error) => {
        console.error('Error fetching SIM:', error);
        throw new CustomError('Error fetching SIM', 500);
      });

    if (!sim) {
      throw new CustomError('SIM not found or does not belong to user', 404);
    }

    console.log(createDataLogDto);

    const expiryDate = new Date(createDataLogDto.purchaseDate);
    expiryDate.setDate(expiryDate.getDate() + createDataLogDto.validityDays);

    try {
      const dataLog = this.dataLogRepository.create({
        ...createDataLogDto,
        user,
        sim,
        expiryDate,
      });

      return await this.dataLogRepository.save(dataLog);
    } catch (error) {
      console.error('Error creating data log:', error);
      throw new CustomError('Error creating data log', 500);
    }
  }

  async getAllDataLogs(
    userId: string,
    page: number,
    limit: number,
    simId?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const skip = (page - 1) * limit;
    const whereCondition: any = { user: { id: userId } };

    if (simId) {
      whereCondition.sim = { id: simId };
    }

    if (startDate && endDate) {
      whereCondition.purchaseDate = Between(
        new Date(startDate),
        new Date(endDate),
      );
    }

    const [dataLogs, total] = await this.dataLogRepository.findAndCount({
      where: whereCondition,
      relations: ['sim'],
      order: { purchaseDate: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: dataLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUsagePredictions(userId: string, simId?: string) {
    // Simple prediction based on historical data
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const whereCondition: any = {
      user: { id: userId },
      purchaseDate: Between(thirtyDaysAgo, now),
    };

    if (simId) {
      whereCondition.sim = { id: simId };
    }

    const recentLogs = await this.dataLogRepository.find({
      where: whereCondition,
      relations: ['sim'],
      order: { purchaseDate: 'DESC' },
    });

    if (recentLogs.length === 0) {
      return {
        predictions: [],
        confidence: 'low',
        message: 'Not enough data for predictions',
      };
    }

    const avgDataPerPurchase =
      recentLogs.reduce((sum, log) => sum + log.dataSize, 0) /
      recentLogs.length;
    const avgSpendingPerPurchase =
      recentLogs.reduce((sum, log) => sum + log.price, 0) / recentLogs.length;
    const avgPurchaseInterval = this.calculateAvgPurchaseInterval(recentLogs);

    const nextPurchaseDate = new Date(
      now.getTime() + avgPurchaseInterval * 24 * 60 * 60 * 1000,
    );

    return {
      predictions: {
        nextPurchaseDate,
        estimatedDataSize: avgDataPerPurchase,
        estimatedCost: avgSpendingPerPurchase,
        monthlyEstimate: {
          data: (avgDataPerPurchase * 30) / avgPurchaseInterval,
          cost: (avgSpendingPerPurchase * 30) / avgPurchaseInterval,
        },
      },
      confidence:
        recentLogs.length >= 5
          ? 'high'
          : recentLogs.length >= 3
            ? 'medium'
            : 'low',
      basedOnLogs: recentLogs.length,
    };
  }

  async getActiveDataLogs(userId: string) {
    const now = new Date();

    const activeDataLogs = await this.dataLogRepository.find({
      where: {
        user: { id: userId },
        isFinished: false,
      },
      relations: ['sim'],
      order: { purchaseDate: 'DESC' },
    });

    // Filter out expired data logs that haven't been marked as finished
    const validActiveDataLogs = activeDataLogs.filter((log) => {
      const expiryDate = new Date(log.purchaseDate);
      expiryDate.setDate(expiryDate.getDate() + log.validityDays);
      return expiryDate > now;
    });

    return validActiveDataLogs;
  }

  async markDataLogAsFinished(
    userId: string,
    dataLogId: string,
    actualFinishDate: Date,
  ) {
    const dataLog = await this.dataLogRepository
      .findOne({
        where: {
          id: dataLogId,
          user: { id: userId },
        },
      })
      .catch((error) => {
        console.error('Error fetching data log:', error);
        throw new CustomError('Error fetching data log', 500);
      });

    console.log('🚀 ~ AnalyticsService ~ dataLog:', dataLog);

    if (!dataLog) {
      throw new CustomError('Data log not found', 404);
    }

    if (dataLog.isFinished) {
      throw new CustomError('Data log is already marked as finished', 400);
    }

    dataLog.isFinished = true;
    dataLog.actualFinishDate = actualFinishDate;

    await this.dataLogRepository.save(dataLog);

    return {
      message: 'Data log marked as finished successfully',
      dataLog,
    };
  }

  async updateDataLog(
    userId: string,
    dataLogId: string,
    updateData: Partial<DataLog>,
  ) {
    const dataLog = await this.dataLogRepository.findOne({
      where: {
        id: dataLogId,
        user: { id: userId },
      },
    });

    if (!dataLog) {
      throw new CustomError('Data log not found', 404);
    }

    Object.assign(dataLog, updateData);
    await this.dataLogRepository.save(dataLog);

    return {
      message: 'Data log updated successfully',
      dataLog,
    };
  }

  // Helper methods
  private async getWeeklyUsageTrend(userId: string) {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const dataLogs = await this.dataLogRepository.find({
      where: {
        user: { id: userId },
        purchaseDate: Between(sevenDaysAgo, now),
      },
      order: { purchaseDate: 'ASC' },
    });

    const dailyUsage: Array<{
      date: string;
      usage: number;
      purchases: number;
    }> = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      );
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const dayLogs = dataLogs.filter(
        (log) => log.purchaseDate >= dayStart && log.purchaseDate < dayEnd,
      );

      dailyUsage.push({
        date: dayStart.toISOString().split('T')[0],
        usage: dayLogs.reduce((sum, log) => sum + log.dataSize, 0),
        purchases: dayLogs.length,
      });
    }

    return dailyUsage;
  }

  private async getProviderBreakdown(userId: string) {
    const sims = await this.simRepository.find({
      where: { user: { id: userId } },
      relations: ['dataLogs'],
    });

    return sims.map((sim) => ({
      provider: sim.provider,
      nickname: sim.nickname,
      totalPurchases: sim.dataLogs.length,
      totalData: sim.dataLogs.reduce((sum, log) => sum + log.dataSize, 0),
      totalSpent: sim.dataLogs.reduce((sum, log) => sum + log.price, 0),
    }));
  }

  private async getMonthlySpending(userId: string) {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyLogs = await this.dataLogRepository.find({
      where: {
        user: { id: userId },
        purchaseDate: Between(firstDayOfMonth, now),
      },
    });

    return {
      current: monthlyLogs.reduce((sum, log) => sum + log.price, 0),
      target: 5000, // You can make this configurable
      daysLeft:
        new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() -
        now.getDate(),
    };
  }

  private groupDataByPeriod(
    dataLogs: DataLog[],
    period: 'week' | 'month' | 'year',
  ) {
    // Implementation for grouping data by time periods
    const grouped: Record<
      string,
      { data: number; spending: number; count: number }
    > = {};

    dataLogs.forEach((log) => {
      let key: string;
      const date = new Date(log.purchaseDate);

      switch (period) {
        case 'week':
          key = `${date.getFullYear()}-W${this.getWeekNumber(date)}`;
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'year':
          key = String(date.getFullYear());
          break;
      }

      if (!grouped[key]) {
        grouped[key] = { data: 0, spending: 0, count: 0 };
      }

      grouped[key].data += log.dataSize;
      grouped[key].spending += log.price;
      grouped[key].count += 1;
    });

    return Object.entries(grouped).map(([period, stats]) => ({
      period,
      ...stats,
    }));
  }

  private groupSpendingByDay(dataLogs: DataLog[]) {
    const grouped: Record<string, number> = {};

    dataLogs.forEach((log) => {
      const date = log.purchaseDate.toISOString().split('T')[0];
      grouped[date] = (grouped[date] || 0) + log.price;
    });

    return Object.entries(grouped).map(([date, amount]) => ({
      date,
      amount,
    }));
  }

  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear =
      (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  private calculateAvgPurchaseInterval(logs: DataLog[]): number {
    if (logs.length < 2) return 7; // Default to 7 days

    const intervals: number[] = [];
    for (let i = 1; i < logs.length; i++) {
      const timeDiff =
        logs[i - 1].purchaseDate.getTime() - logs[i].purchaseDate.getTime();
      const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
      intervals.push(Math.abs(daysDiff));
    }

    return (
      intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length
    );
  }
}
