// KYC Button Debug Script - Run this in browser console

console.clear();
console.log('%c=== KYC BUTTON DEBUG REPORT ===', 'font-size: 16px; font-weight: bold; color: #09c398;');

// 1. Check KYC Status State
console.group('%c1. KYC Status Check', 'font-weight: bold; color: #0d6efd;');
const kycStatus = localStorage.getItem('kycStatus') || 'not_verified';
console.log('Current KYC Status:', kycStatus);
console.log('Should Show Button:', kycStatus !== 'verified');
console.groupEnd();

// 2. Check DOM Elements
console.group('%c2. DOM Elements Check', 'font-weight: bold; color: #0d6efd;');
const kycButton = document.querySelector('a[aria-label="Complete KYC"]');
console.log('KYC Button Found:', !!kycButton);

if (kycButton) {
  console.log('Button Element:', kycButton);
  console.log('Button Text:', kycButton.textContent);
  console.log('Button Classes:', kycButton.className);
  const styles = window.getComputedStyle(kycButton);
  console.log('Display:', styles.display);
  console.log('Visibility:', styles.visibility);
  console.log('Opacity:', styles.opacity);
  console.log('Width:', styles.width);
  console.log('Height:', styles.height);
} else {
  console.warn('KYC Button NOT found in DOM');
}
console.groupEnd();

// 3. Check Primary Actions Container
console.group('%c3. Primary Actions Container', 'font-weight: bold; color: #0d6efd;');
const primaryActions = document.querySelector('[class*="primaryActions"]');
if (primaryActions) {
  console.log('Container Found:', primaryActions);
  console.log('Children Count:', primaryActions.children.length);
  console.log('Children:');
  Array.from(primaryActions.children).forEach((child, i) => {
    console.log(`  [${i}] ${child.tagName}:`, {
      text: child.textContent?.substring(0, 20),
      classes: child.className,
      display: window.getComputedStyle(child).display
    });
  });
} else {
  console.error('Primary Actions container NOT found');
}
console.groupEnd();

// 4. Check CSS Classes
console.group('%c4. CSS Classes Check', 'font-weight: bold; color: #0d6efd;');
const kycBtnClass = document.querySelector('.kycBtn');
console.log('KYC Button Class Found:', !!kycBtnClass);
if (kycBtnClass) {
  const css = window.getComputedStyle(kycBtnClass);
  console.log('Background:', css.background);
  console.log('Color:', css.color);
  console.log('Flex:', css.flex);
}
console.groupEnd();

// 5. Check Flex Layout
console.group('%c5. Flex Layout Debug', 'font-weight: bold; color: #0d6efd;');
if (primaryActions) {
  const parentStyles = window.getComputedStyle(primaryActions);
  console.log('Parent Display:', parentStyles.display);
  console.log('Parent Flex-Wrap:', parentStyles.flexWrap);
  console.log('Parent Gap:', parentStyles.gap);
  console.log('Parent Width:', parentStyles.width);
}
console.groupEnd();

// 6. Render Condition Check
console.group('%c6. Render Condition', 'font-weight: bold; color: #0d6efd;');
console.log('kycStatus !== "verified":', kycStatus !== 'verified');
console.log('Expected: Button should render if TRUE');
console.log('Actual: Button', kycButton ? 'IS rendered' : 'IS NOT rendered');
console.groupEnd();

console.log('%c=== END DEBUG REPORT ===', 'font-size: 16px; font-weight: bold; color: #09c398;');
