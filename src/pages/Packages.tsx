import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Layout from '../components_main/Layout';
import PackageCard from './PackageCard';
import styles from './Packages.module.css';

interface Property {
  id: string;
  title: string;
  address: string;
  image: string;
  shareCost: number;
  interest: number;
  percent: number;
  investors: number;
  raised: number;
}

interface InvestmentPeriod {
  months: number;
  label: string;
  roi: number;
}

const Packages: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const propertyIdFromUrl = searchParams.get('property');
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriods, setSelectedPeriods] = useState<{ [key: string]: number }>({});

  const investmentPeriods: InvestmentPeriod[] = [
    { months: 3, label: '3 Months', roi: 9.25 },
    { months: 6, label: '6 Months', roi: 18.5 },
    { months: 9, label: '9 Months', roi: 27.75 },
    { months: 12, label: '12 Months', roi: 37 }
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProperties();
  }, [propertyIdFromUrl]);

  const fetchProperties = async () => {
    try {
      setError(null);
      
      let query = supabase
        .from('property')
        .select(`
          *,
          property_image(Image_Url, Display_Order),
          investment_package(Share_Cost, Interest_Rate, Property_Id)
        `)
        .eq('Status', 'active')
        .eq('is_deleted', false);
      
      if (propertyIdFromUrl) {
        query = query.eq('Id', propertyIdFromUrl);
      } else {
        query = query.limit(6);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[Packages] Property fetch error:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        setError('No properties found');
        setProperties([]);
        return;
      }
      
      console.log('[Packages] Raw property data:', data);
      
      const propertyIds = data.map((p: any) => p.Id);
      
      const { data: investData, error: investError } = await supabase
        .from('invest_now')
        .select('proptee_id, share_cost, Usa_Id')
        .in('proptee_id', propertyIds);
      
      if (investError) {
        console.error('[Packages] Investment fetch error:', investError);
      }
      
      console.log('[Packages] Investment data:', investData);
      
      const mapped = data.map((p: any) => {
        const imageUrls: string[] = [];
        if (p.property_image && Array.isArray(p.property_image) && p.property_image.length > 0) {
          imageUrls.push(...p.property_image.sort((a: any, b: any) => a.Display_Order - b.Display_Order).map((img: any) => img.Image_Url));
        } else if (p.Images && p.Images.trim()) {
          imageUrls.push(p.Images);
        }
        
        if (imageUrls.length === 0) {
          imageUrls.push('/assets/img/property/default.jpg');
        }

        const investments = (investData || []).filter((inv: any) => inv.proptee_id === p.Id);
        const totalRaised = investments.reduce((sum: number, inv: any) => sum + Number(inv.share_cost || 0), 0);
        const uniqueInvestors = new Set(investments.map((inv: any) => inv.Usa_Id)).size;
        const targetAmount = Number(p.Price || 10000000);
        const percentage = Math.min((totalRaised / targetAmount) * 100, 100);

        const packageData = p.investment_package;
        console.log('[Packages] Package data for', p.Title, ':', packageData);
        
        const interestRate = packageData ? Number(packageData.Interest_Rate) : 25;
        const shareCost = packageData ? Number(packageData.Share_Cost) : 5000;
        
        console.log('[Packages] Property:', p.Title, 'Interest:', interestRate, 'Share:', shareCost);

        return {
          id: p.Id,
          title: p.Title,
          address: p.Address,
          image: imageUrls.join(','),
          shareCost: shareCost,
          interest: interestRate,
          percent: Math.round(percentage),
          investors: uniqueInvestors,
          raised: totalRaised
        };
      });
      
      console.log('[Packages] Final mapped properties:', mapped);
      setProperties(mapped);
      
      const initialPeriods: { [key: string]: number } = {};
      mapped.forEach(p => {
        initialPeriods[p.id] = 3;
      });
      setSelectedPeriods(initialPeriods);
    } catch (error: any) {
      console.error('[Packages] Failed to fetch properties:', error);
      setError(error.message || 'Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (propertyId: string, period: number) => {
    setSelectedPeriods(prev => ({ ...prev, [propertyId]: period }));
  };

  const handleInvest = (propertyId: string) => {
    navigate(`/invest/${propertyId}`);
  };

  const getRoi = (propertyId: string) => {
    const period = selectedPeriods[propertyId] || 3;
    const periodData = investmentPeriods.find(p => p.months === period);
    return periodData ? periodData.roi : 9.25;
  };

  return (
    <Layout title="Investment Packages - Peravest">
      <div className={styles.packagesPage}>
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>Cooperative Participation Packages</h1>
          <p className={styles.heroSubtitle}>Select your preferred participation period and receive member benefits</p>
        </div>

        <div className={styles.container}>
          {error && <div className={styles.error}>{error}</div>}

          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p className={styles.loadingText}>Loading packages...</p>
            </div>
          ) : properties.length === 0 ? (
            <div className={styles.empty}>No packages available at the moment.</div>
          ) : (
            <div className={styles.packagesList}>
              {properties.map((property) => (
                <PackageCard
                  key={property.id}
                  property={property}
                  selectedPeriod={selectedPeriods[property.id] || 3}
                  roi={getRoi(property.id)}
                  onInvest={() => handleInvest(property.id)}
                  investmentPeriods={investmentPeriods}
                  onPeriodChange={(period) => handlePeriodChange(property.id, period)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Packages;
