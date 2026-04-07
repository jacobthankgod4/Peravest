import { supabase } from '../lib/supabase';
import { AjoFormData } from '../types/ajo';

export interface PaymentInitRequest {
  email: string;
  amount: number;
  ajoType: 'personal' | 'group';
  ajoData: AjoFormData;
  userId: number;
  fullName: string;
  phoneNumber: string;
}

export interface PaymentInitResponse {
  status: string;
  message: string;
  data: {
    link: string;
    reference: string;
  };
}

export interface PaymentVerification {
  status: string;
  message: string;
  data: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    amount: number;
    currency: string;
    payment_type: string;
    status: string;
    customer: {
      email: string;
      name: string;
      phone_number: string;
    };
    created_at: string;
  };
}

class AjoPaymentService {
  private flutterwavePublicKey = process.env.REACT_APP_FLUTTERWAVE_PUBLIC_KEY;
  private flutterwaveSecretKey = process.env.REACT_APP_FLUTTERWAVE_SECRET_KEY;
  private flutterwaveBaseUrl = 'https://api.flutterwave.com/v3';

  /**
   * Initialize payment with Flutterwave
   */
  async initializePayment(request: PaymentInitRequest): Promise<PaymentInitResponse> {
    try {
      const txRef = `ajo_${Date.now()}_${request.userId}`;
      
      const response = await fetch(`${this.flutterwaveBaseUrl}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.flutterwaveSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tx_ref: txRef,
          amount: request.amount,
          currency: 'NGN',
          redirect_url: `${window.location.origin}/ajo/payment-callback`,
          customer: {
            email: request.email,
            name: request.fullName,
            phone_number: request.phoneNumber,
          },
          customizations: {
            title: `Peravest ${request.ajoType === 'personal' ? 'Personal' : 'Group'} Ajo`,
            description: `${request.ajoType === 'personal' ? 'Personal Ajo' : 'Group Ajo'} - ₦${request.ajoData.contributionAmount}`,
            logo: 'https://peravest.com/logo.png',
          },
          meta: {
            ajoType: request.ajoType,
            userId: request.userId,
            ajoData: JSON.stringify(request.ajoData),
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to initialize payment');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Payment initialization error:', error);
      throw error;
    }
  }

  /**
   * Verify payment with Flutterwave
   */
  async verifyPayment(transactionId: string): Promise<PaymentVerification> {
    try {
      const response = await fetch(
        `${this.flutterwaveBaseUrl}/transactions/${transactionId}/verify`,
        {
          headers: {
            'Authorization': `Bearer ${this.flutterwaveSecretKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to verify payment');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  }

  /**
   * Create Ajo after successful payment
   */
  async createAjoAfterPayment(
    userId: number,
    formData: AjoFormData,
    paymentReference: string
  ) {
    try {
      if (formData.type === 'personal') {
        return await this.createPersonalAjo(userId, formData, paymentReference);
      } else {
        return await this.createGroupAjo(userId, formData, paymentReference);
      }
    } catch (error) {
      console.error('Error creating Ajo after payment:', error);
      throw error;
    }
  }

  /**
   * Create personal Ajo record
   */
  private async createPersonalAjo(
    userId: number,
    formData: AjoFormData,
    paymentReference: string
  ) {
    const { data, error } = await supabase
      .from('ajo_savings')
      .insert({
        user_id: userId,
        contribution_amount: formData.contributionAmount,
        frequency: formData.frequency,
        duration: formData.duration,
        start_date: formData.startDate,
        status: 'active',
        payment_reference: paymentReference,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Create group Ajo record
   */
  private async createGroupAjo(
    userId: number,
    formData: AjoFormData,
    paymentReference: string
  ) {
    // Create group
    const { data: groupData, error: groupError } = await supabase
      .from('ajo_groups')
      .insert({
        name: formData.groupName,
        description: formData.groupDescription,
        max_members: formData.maxMembers || 10,
        contribution_amount: formData.contributionAmount,
        frequency: formData.frequency,
        cycle_duration: formData.duration,
        created_by: userId,
        status: 'forming',
        reliability_threshold: formData.reliabilityThreshold || 0.7,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (groupError) throw groupError;

    // Add creator as first member
    const { data: memberData, error: memberError } = await supabase
      .from('ajo_group_members')
      .insert({
        group_id: groupData.id,
        user_id: userId,
        position: 1,
        status: 'active',
        join_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (memberError) throw memberError;

    // Create first cycle
    const startDate = new Date(formData.startDate);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + formData.duration);

    const { data: cycleData, error: cycleError } = await supabase
      .from('ajo_cycles')
      .insert({
        group_id: groupData.id,
        cycle_number: 1,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        contribution_deadline: new Date(startDate.getTime() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        total_expected: formData.contributionAmount * (formData.maxMembers || 10),
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (cycleError) throw cycleError;

    // Record payment transaction
    const { data: transactionData, error: transactionError } = await supabase
      .from('ajo_transactions')
      .insert({
        group_id: groupData.id,
        cycle_id: cycleData.id,
        user_id: userId,
        amount: formData.contributionAmount,
        transaction_type: 'contribution',
        status: 'completed',
        payment_reference: paymentReference,
        payment_method: 'flutterwave',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (transactionError) throw transactionError;

    return {
      group: groupData,
      member: memberData,
      cycle: cycleData,
      transaction: transactionData,
    };
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(transactionId: string) {
    try {
      const verification = await this.verifyPayment(transactionId);
      return {
        success: verification.data.status === 'successful',
        reference: verification.data.tx_ref,
        amount: verification.data.amount,
        paidAt: verification.data.created_at,
        email: verification.data.customer.email,
        flwRef: verification.data.flw_ref,
      };
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw error;
    }
  }

  /**
   * Calculate total amount to charge
   */
  calculatePaymentAmount(formData: AjoFormData): number {
    return formData.contributionAmount;
  }
}

export const ajoPaymentService = new AjoPaymentService();
