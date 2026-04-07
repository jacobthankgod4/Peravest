// KYC Debug Utility
export const kycDebug = {
  logStatus: (status: string) => {
    console.group('🔍 KYC Status Debug');
    console.log('Current KYC Status:', status);
    console.log('Should Show KYC Button:', status !== 'verified');
    console.log('Button Condition (status !== "verified"):', status !== 'verified');
    console.groupEnd();
  },

  logDOMElements: () => {
    setTimeout(() => {
      console.group('🔍 DOM Debug - KYC Button');
      const kycButton = document.querySelector('a[aria-label="Complete KYC"]');
      console.log('✅ KYC Button Found in DOM:', !!kycButton);
      
      if (kycButton) {
        console.log('📍 KYC Button Element:', kycButton);
        const styles = window.getComputedStyle(kycButton);
        console.log('🎨 Display:', styles.display);
        console.log('👁️ Visibility:', styles.visibility);
        console.log('📦 Classes:', kycButton.className);
        console.log('📝 Text Content:', kycButton.textContent);
        console.log('🔗 Href:', kycButton.getAttribute('href'));
      } else {
        console.warn('❌ KYC Button NOT found in DOM');
        
        const primaryActions = document.querySelector('[class*="primaryActions"]');
        if (primaryActions) {
          console.log('✅ Primary Actions Container Found');
          console.log('👶 Children Count:', primaryActions.children.length);
          console.log('👶 Children Details:');
          Array.from(primaryActions.children).forEach((child, index) => {
            console.log(`  [${index}]`, {
              tag: child.tagName,
              text: child.textContent?.substring(0, 30),
              classes: child.className,
              display: window.getComputedStyle(child).display
            });
          });
        } else {
          console.error('❌ Primary Actions Container NOT found');
        }
      }
      console.groupEnd();
    }, 500);
  },

  logRenderCondition: (kycStatus: string) => {
    console.log('🔍 Rendering Primary Actions - KYC Status:', kycStatus);
    console.log('Condition (kycStatus !== "verified"):', kycStatus !== 'verified');
    if (kycStatus !== 'verified') {
      console.log('✅ KYC Button SHOULD render');
    } else {
      console.log('❌ KYC Button should NOT render (status is verified)');
    }
  },

  logKYCLoading: (userId: string) => {
    console.group('🔍 Loading KYC Status');
    console.log('User ID:', userId);
    console.log('Querying user_profiles table...');
  },

  logKYCLoadSuccess: (profile: any) => {
    console.log('✅ Profile Data:', profile);
    console.log('Raw KYC Status from DB:', profile?.kyc_status);
    if (profile?.kyc_status === 'approved') {
      console.log('📄 Setting KYC to: verified');
    } else if (profile?.kyc_status === 'pending') {
      console.log('📄 Setting KYC to: pending');
    } else {
      console.log('📄 Setting KYC to: not_verified (default)');
    }
    console.groupEnd();
  },

  logKYCLoadError: (error: any) => {
    console.error('❌ KYC Query Error:', error);
    console.error('Error Code:', error?.code);
    console.error('Error Message:', error?.message);
    console.groupEnd();
  },

  logCSSIssues: () => {
    console.group('🔍 CSS Debug - KYC Button');
    const kycBtn = document.querySelector('.kycBtn');
    if (kycBtn) {
      const styles = window.getComputedStyle(kycBtn);
      console.log('KYC Button CSS:');
      console.log('  background:', styles.background);
      console.log('  color:', styles.color);
      console.log('  display:', styles.display);
      console.log('  visibility:', styles.visibility);
      console.log('  opacity:', styles.opacity);
      console.log('  width:', styles.width);
      console.log('  height:', styles.height);
      console.log('  flex:', styles.flex);
    } else {
      console.warn('KYC Button class not found');
    }
    console.groupEnd();
  }
};
