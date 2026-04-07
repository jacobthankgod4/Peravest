// Custom Ajo Error Types

export class AjoError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AjoError';
  }
}

export class AjoGroupFullError extends AjoError {
  constructor(groupId: number, maxMembers: number) {
    super(
      `Group ${groupId} has reached maximum members (${maxMembers})`,
      'GROUP_FULL'
    );
    this.name = 'AjoGroupFullError';
  }
}

export class LowReliabilityError extends AjoError {
  constructor(userScore: number, requiredScore: number) {
    super(
      `Your reliability score (${userScore}) is below required threshold (${requiredScore})`,
      'LOW_RELIABILITY'
    );
    this.name = 'LowReliabilityError';
  }
}

export class NotEligibleForPayoutError extends AjoError {
  constructor(reason: string) {
    super(`Not eligible for payout: ${reason}`, 'NOT_ELIGIBLE_PAYOUT');
    this.name = 'NotEligibleForPayoutError';
  }
}

export class WithdrawalLockedError extends AjoError {
  constructor(lockType: string, unlocksAt: Date) {
    super(
      `Withdrawal locked (${lockType}) until ${unlocksAt.toISOString()}`,
      'WITHDRAWAL_LOCKED'
    );
    this.name = 'WithdrawalLockedError';
  }
}

export class CycleNotReadyError extends AjoError {
  constructor(cycleId: number, reason: string) {
    super(`Cycle ${cycleId} not ready: ${reason}`, 'CYCLE_NOT_READY');
    this.name = 'CycleNotReadyError';
  }
}

export class InvalidPositionError extends AjoError {
  constructor(position: number, maxMembers: number) {
    super(
      `Invalid position ${position}. Must be between 1 and ${maxMembers}`,
      'INVALID_POSITION'
    );
    this.name = 'InvalidPositionError';
  }
}

export class GroupNotFoundError extends AjoError {
  constructor(groupId: number) {
    super(`Group ${groupId} not found`, 'GROUP_NOT_FOUND');
    this.name = 'GroupNotFoundError';
  }
}

export class MemberNotFoundError extends AjoError {
  constructor(groupId: number, userId: number) {
    super(
      `Member ${userId} not found in group ${groupId}`,
      'MEMBER_NOT_FOUND'
    );
    this.name = 'MemberNotFoundError';
  }
}

export class DuplicateMemberError extends AjoError {
  constructor(groupId: number, userId: number) {
    super(
      `User ${userId} is already a member of group ${groupId}`,
      'DUPLICATE_MEMBER'
    );
    this.name = 'DuplicateMemberError';
  }
}

export class InvalidAjoTypeError extends AjoError {
  constructor(type: string) {
    super(
      `Invalid Ajo type: ${type}. Must be 'personal' or 'group'`,
      'INVALID_AJO_TYPE'
    );
    this.name = 'InvalidAjoTypeError';
  }
}

export class GracePeriodExpiredError extends AjoError {
  constructor(memberId: number) {
    super(
      `Grace period expired for member ${memberId}. Contribution marked as defaulted`,
      'GRACE_PERIOD_EXPIRED'
    );
    this.name = 'GracePeriodExpiredError';
  }
}

export class InsufficientFundsError extends AjoError {
  constructor(required: number, available: number) {
    super(
      `Insufficient funds. Required: ₦${required}, Available: ₦${available}`,
      'INSUFFICIENT_FUNDS'
    );
    this.name = 'InsufficientFundsError';
  }
}
