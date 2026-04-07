import { supabase } from './supabaseClient';

export type KYCStatus = 'pending' | 'under_review' | 'approved' | 'rejected';
export type DocumentType = 'national_id' | 'passport' | 'drivers_license' | 'utility_bill';

interface KYCDocument {
  id: number;
  user_id: number;
  document_type: DocumentType;
  document_url: string;
  status: KYCStatus;
  rejection_reason?: string;
  verified_at?: string;
  verified_by?: number;
}

class KYCVerificationService {
  async submitKYC(formData: FormData) {
    try {
      // Upload files to storage first
      const files = {
        idDocument: formData.get('idDocument') as File,
        proofOfAddress: formData.get('proofOfAddress') as File,
        selfie: formData.get('selfie') as File
      };

      const uploadPromises = Object.entries(files).map(async ([key, file]) => {
        if (file) {
          const fileName = `${Date.now()}_${file.name}`;
          const { data, error } = await supabase.storage
            .from('kyc-documents')
            .upload(fileName, file);
          
          if (error) throw error;
          return { [key]: data.path };
        }
        return {};
      });

      const uploadResults = await Promise.all(uploadPromises);
      const documentUrls = uploadResults.reduce((acc, result) => ({ ...acc, ...result }), {});

      // Save KYC data to database
      const kycData = {
        first_name: formData.get('firstName'),
        last_name: formData.get('lastName'),
        date_of_birth: formData.get('dateOfBirth'),
        phone_number: formData.get('phoneNumber'),
        address: formData.get('address'),
        city: formData.get('city'),
        state: formData.get('state'),
        bvn: formData.get('bvn'),
        nin: formData.get('nin'),
        id_type: formData.get('idType'),
        id_number: formData.get('idNumber'),
        id_document_url: documentUrls.idDocument,
        proof_of_address_url: documentUrls.proofOfAddress,
        selfie_url: documentUrls.selfie,
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('kyc_submissions')
        .insert(kycData)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
  async getUserKYC(userId: number) {
    const { data, error } = await supabase
      .from('kyc_documents')
      .select('*')
      .eq('user_id', userId);

    return { data, error };
  }

  async updateKYCStatus(
    documentId: number,
    status: KYCStatus,
    adminId: number,
    rejectionReason?: string
  ) {
    const { data, error } = await supabase
      .from('kyc_documents')
      .update({
        status,
        rejection_reason: rejectionReason,
        verified_at: status === 'approved' ? new Date().toISOString() : null,
        verified_by: adminId
      })
      .eq('id', documentId)
      .select()
      .single();

    if (!error && status === 'approved') {
      await supabase
        .from('users')
        .update({ kyc_verified: true })
        .eq('id', data.user_id);
    }

    return { data, error };
  }

  async getPendingKYC() {
    const { data, error } = await supabase
      .from('kyc_documents')
      .select('*, users(email, full_name)')
      .in('status', ['pending', 'under_review'])
      .order('created_at', { ascending: true });

    return { data, error };
  }
}

export const kycVerificationService = new KYCVerificationService();
