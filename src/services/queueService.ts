/**
 * Distributed Queue Service
 * Handles scheduled tasks with retry logic
 */

interface QueueJob {
  id: string;
  type: string;
  data: any;
  scheduledFor: Date;
  attempts: number;
  maxAttempts: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

class DistributedQueueService {
  private jobs: Map<string, QueueJob> = new Map();
  private processing = false;

  /**
   * Add job to queue
   */
  async addJob(
    type: string,
    data: any,
    options?: {
      delay?: number;
      maxAttempts?: number;
    }
  ): Promise<string> {
    const id = `${type}-${Date.now()}-${Math.random()}`;
    const job: QueueJob = {
      id,
      type,
      data,
      scheduledFor: new Date(Date.now() + (options?.delay || 0)),
      attempts: 0,
      maxAttempts: options?.maxAttempts || 3,
      status: 'pending'
    };

    this.jobs.set(id, job);
    return id;
  }

  /**
   * Process pending jobs
   */
  async processJobs(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    const now = new Date();
    const entries = Array.from(this.jobs.entries());
    for (const [id, job] of entries) {
      if (job.status === 'pending' && job.scheduledFor <= now) {
        await this.processJob(job);
      }
    }

    this.processing = false;
  }

  /**
   * Process single job
   */
  private async processJob(job: QueueJob): Promise<void> {
    job.status = 'processing';
    job.attempts++;

    try {
      await this.executeJob(job);
      job.status = 'completed';
      
      // Remove completed jobs after 1 hour
      setTimeout(() => this.jobs.delete(job.id), 60 * 60 * 1000);
    } catch (error) {
      if (job.attempts >= job.maxAttempts) {
        job.status = 'failed';
        job.error = (error as Error).message;
      } else {
        job.status = 'pending';
        job.scheduledFor = new Date(Date.now() + 60000 * job.attempts); // Exponential backoff
      }
    }
  }

  /**
   * Execute job based on type
   */
  private async executeJob(job: QueueJob): Promise<void> {
    switch (job.type) {
      case 'process-cycles':
        // Import and call scheduler
        const { AjoSchedulerService } = await import('./ajoSchedulerService');
        await AjoSchedulerService.processPendingCycles();
        break;

      case 'create-cycles':
        const { AjoSchedulerService: Scheduler } = await import('./ajoSchedulerService');
        await Scheduler.createNextCycles();
        break;

      case 'send-notifications':
        const { AjoSchedulerService: NotifScheduler } = await import('./ajoSchedulerService');
        await NotifScheduler.sendPayoutNotifications();
        break;

      case 'cleanup-locks':
        const { AjoSchedulerService: CleanupScheduler } = await import('./ajoSchedulerService');
        await CleanupScheduler.cleanupExpiredLocks();
        break;

      default:
        throw new Error(`Unknown job type: ${job.type}`);
    }
  }

  /**
   * Get job status
   */
  getJobStatus(id: string): QueueJob | undefined {
    return this.jobs.get(id);
  }

  /**
   * Get all jobs
   */
  getAllJobs(): QueueJob[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Clear completed jobs
   */
  clearCompleted(): void {
    const entries = Array.from(this.jobs.entries());
    for (const [id, job] of entries) {
      if (job.status === 'completed') {
        this.jobs.delete(id);
      }
    }
  }
}

export const queue = new DistributedQueueService();

// Process jobs every minute
setInterval(() => queue.processJobs(), 60000);

// Schedule daily tasks
export function scheduleDailyTasks(): void {
  // Process cycles at midnight
  queue.addJob('process-cycles', {}, { delay: 0 });
  
  // Create next cycles at 1 AM
  queue.addJob('create-cycles', {}, { delay: 60 * 60 * 1000 });
  
  // Send notifications at 9 AM
  queue.addJob('send-notifications', {}, { delay: 9 * 60 * 60 * 1000 });
}

// Schedule hourly tasks
export function scheduleHourlyTasks(): void {
  queue.addJob('cleanup-locks', {}, { delay: 0 });
}

// Initialize schedules
scheduleDailyTasks();
setInterval(scheduleDailyTasks, 24 * 60 * 60 * 1000);
setInterval(scheduleHourlyTasks, 60 * 60 * 1000);
