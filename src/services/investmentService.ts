import { supabase } from '../lib/supabase';

export const investmentService = {
  getUserInvestments: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('No active session');
        return { data: [] };
      }

      const { data: userData, error: userError } = await supabase
        .from('user_accounts')
        .select('Id')
        .eq('Email', session.user.email)
        .maybeSingle();

      if (userError || !userData) {
        console.log('User not found in database');
        return { data: [] };
      }

      const { data: investments, error } = await supabase
        .from('invest_now')
        .select('*')
        .eq('Usa_Id', userData.Id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Investment fetch error:', error);
        return { data: [] };
      }
      
      if (!investments) return { data: [] };

      const propertyIds = investments.map((inv) => Number(inv.proptee_id)).filter(Boolean);

      const { data: propertiesData } = propertyIds.length > 0
        ? await supabase
            .from('property')
            .select('Id, Title, Images, Address, property_image(Image_Url, Display_Order)')
            .in('Id', propertyIds)
        : { data: [] };

      const propertiesMap = new Map((propertiesData || []).map((p: any) => [Number(p.Id), p]));

      const data = investments.map((inv) => {
        const propData = inv.proptee_id ? propertiesMap.get(Number(inv.proptee_id)) : null;
        return { ...inv, property: propData ? [propData] : null };
      });

      return { data };
    } catch (error) {
      console.error('getUserInvestments error:', error);
      return { data: [] };
    }
  },

  getStats: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return { data: { totalInvestments: 0, activeInvestments: 0, totalReturns: 0, pendingWithdrawals: 0 } };
      }
      const user = session.user;

      const { data: userData, error: userError } = await supabase
        .from('user_accounts')
        .select('Id')
        .eq('Email', user.email)
        .maybeSingle();

      if (userError || !userData) {
        return { data: { totalInvestments: 0, activeInvestments: 0, totalReturns: 0, pendingWithdrawals: 0 } };
      }

      const { data: investments } = await supabase
        .from('invest_now')
        .select('share_cost, interest, period')
        .eq('Usa_Id', userData.Id);

      const totalInvestments = investments?.reduce((sum, inv) => sum + Number(inv.share_cost), 0) || 0;
      const activeInvestments = investments?.length || 0;
      const totalReturns = investments?.reduce((sum, inv) => sum + Number(inv.interest), 0) || 0;

      return {
        data: {
          totalInvestments,
          activeInvestments,
          totalReturns,
          pendingWithdrawals: 0
        }
      };
    } catch (error) {
      console.error('getStats error:', error);
      throw error;
    }
  },

  getUserStats: async () => {
    return investmentService.getStats();
  },

  createInvestment: async (data: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');
      const user = session.user;

      const { data: userData, error: userError } = await supabase
        .from('user_accounts')
        .select('Id')
        .eq('Email', user.email)
        .maybeSingle();

      if (userError || !userData) {
        throw new Error('User not found');
      }

      const { data: investment, error } = await supabase
        .from('invest_now')
        .insert([{
          Usa_Id: userData.Id,
          proptee_id: data.propertyId,
          package_id: data.packageId,
          share_cost: data.amount,
          interest: data.interest,
          period: data.durationMonths,
          start_date: new Date()
        }])
        .select()
        .single();

      if (error) throw error;
      return { data: investment };
    } catch (error) {
      console.error('createInvestment error:', error);
      throw error;
    }
  },

  checkDuplicateInvestment: async (propertyId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;
    const user = session.user;

    const { data: userData } = await supabase
      .from('user_accounts')
      .select('Id')
      .eq('Email', user.email)
      .single();

    if (!userData) return false;

    const { data } = await supabase
      .from('invest_now')
      .select('Id_invest')
      .eq('Usa_Id', userData.Id)
      .eq('proptee_id', propertyId)
      .single();

    return !!data;
  },

  getRecentActivity: async (limit: number) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { data: [] };
    const user = session.user;

    const { data: userData } = await supabase
      .from('user_accounts')
      .select('Id')
      .eq('Email', user.email)
      .single();

    if (!userData) return { data: [] };

    const { data: investments, error } = await supabase
      .from('invest_now')
      .select('Id_invest, share_cost, created_at, proptee_id')
      .eq('Usa_Id', userData.Id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    if (!investments) return { data: [] };

    const data = await Promise.all(investments.map(async (inv: any) => {
      let propertyTitle = 'Property';
      if (inv.proptee_id) {
        const { data: propData } = await supabase
          .from('property')
          .select('Title')
          .eq('Id', inv.proptee_id)
          .single();
        if (propData) propertyTitle = propData.Title;
      }
      return {
        id: inv.Id_invest,
        type: 'investment' as const,
        amount: inv.share_cost,
        description: `Investment in ${propertyTitle}`,
        date: inv.created_at,
        status: 'active'
      };
    }));

    return { data };
  }
};
