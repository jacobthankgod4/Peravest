// HAMBURGER MENU DIAGNOSTIC SCRIPT
// Copy and paste this into the browser console at http://localhost:3000/listings/27

console.log('=== HAMBURGER MENU AUDIT ===\n');

// 1. Check screen width
console.log('1. SCREEN WIDTH');
console.log('   Current width:', window.innerWidth, 'px');
console.log('   Should show hamburger:', window.innerWidth < 991 ? '✅ YES' : '❌ NO (resize to < 991px)');
console.log('');

// 2. Check if elements exist
console.log('2. DOM ELEMENTS');
const mobileMenuRight = document.querySelector('.mobile-menu-right');
const navbarToggler = document.querySelector('.navbar-toggler');
const toggleIcon = document.querySelector('.navbar-toggler-btn-icon i');
const menuContainer = document.querySelector('.mobile-menu-container');
const overlay = document.querySelector('.mobile-menu-overlay');

console.log('   .mobile-menu-right:', mobileMenuRight ? '✅ EXISTS' : '❌ MISSING');
console.log('   .navbar-toggler:', navbarToggler ? '✅ EXISTS' : '❌ MISSING');
console.log('   .navbar-toggler-btn-icon i:', toggleIcon ? '✅ EXISTS' : '❌ MISSING');
console.log('   .mobile-menu-container:', menuContainer ? '✅ EXISTS' : '❌ MISSING');
console.log('');

// 3. Check computed styles
console.log('3. COMPUTED STYLES');
if (mobileMenuRight) {
    const styles = window.getComputedStyle(mobileMenuRight);
    console.log('   .mobile-menu-right display:', styles.display);
    console.log('   .mobile-menu-right visibility:', styles.visibility);
    console.log('   .mobile-menu-right opacity:', styles.opacity);
} else {
    console.log('   ❌ Cannot check - element missing');
}
console.log('');

if (navbarToggler) {
    const btnStyles = window.getComputedStyle(navbarToggler);
    console.log('   .navbar-toggler display:', btnStyles.display);
    console.log('   .navbar-toggler visibility:', btnStyles.visibility);
    console.log('   .navbar-toggler z-index:', btnStyles.zIndex);
} else {
    console.log('   ❌ Cannot check - button missing');
}
console.log('');

// 4. Check CSS files loaded
console.log('4. CSS FILES');
const stylesheets = Array.from(document.styleSheets);
const headerFixCss = stylesheets.find(s => s.href && s.href.includes('header-fix'));
const listingMobileCss = stylesheets.find(s => s.href && s.href.includes('listing-mobile'));
console.log('   header-fix.css:', headerFixCss ? '✅ LOADED' : '❌ NOT LOADED');
console.log('   listing-mobile.css:', listingMobileCss ? '✅ LOADED' : '❌ NOT LOADED');
console.log('');

// 5. Check media query
console.log('5. MEDIA QUERY');
const mediaQuery = window.matchMedia('(max-width: 991px)');
console.log('   (max-width: 991px) matches:', mediaQuery.matches ? '✅ YES' : '❌ NO');
console.log('');

// 6. Check React component
console.log('6. REACT COMPONENT');
const header = document.querySelector('.header');
console.log('   .header element:', header ? '✅ EXISTS' : '❌ MISSING');
if (header) {
    console.log('   Header HTML preview:', header.innerHTML.substring(0, 200) + '...');
}
console.log('');

// 7. Try to click the button
console.log('7. FUNCTIONALITY TEST');
if (navbarToggler) {
    console.log('   Attempting to click hamburger button...');
    navbarToggler.click();
    setTimeout(() => {
        const hasShowClass = menuContainer?.classList.contains('show');
        const overlayExists = document.querySelector('.mobile-menu-overlay');
        console.log('   Menu opened:', hasShowClass ? '✅ YES' : '❌ NO');
        console.log('   Overlay appeared:', overlayExists ? '✅ YES' : '❌ NO');
        
        // Close it
        if (hasShowClass) {
            navbarToggler.click();
            console.log('   Menu closed successfully');
        }
    }, 500);
} else {
    console.log('   ❌ Cannot test - button not found');
}
console.log('');

// 8. Check for CSS conflicts
console.log('8. CSS CONFLICTS');
if (mobileMenuRight) {
    const allRules = [];
    for (let sheet of document.styleSheets) {
        try {
            const rules = sheet.cssRules || sheet.rules;
            for (let rule of rules) {
                if (rule.selectorText && rule.selectorText.includes('mobile-menu-right')) {
                    allRules.push({
                        selector: rule.selectorText,
                        display: rule.style.display,
                        file: sheet.href ? sheet.href.split('/').pop() : 'inline'
                    });
                }
            }
        } catch (e) {
            // CORS or other error
        }
    }
    console.log('   CSS rules for .mobile-menu-right:', allRules.length);
    allRules.forEach(rule => {
        console.log('   -', rule.selector, '{ display:', rule.display || 'not set', '}', 'in', rule.file);
    });
} else {
    console.log('   ❌ Cannot check - element missing');
}
console.log('');

// 9. Visual inspection helper
console.log('9. VISUAL INSPECTION');
if (navbarToggler) {
    navbarToggler.style.border = '3px solid red';
    navbarToggler.style.padding = '10px';
    console.log('   ✅ Added red border to hamburger button for visibility');
    console.log('   Look for a RED BORDER in the top-right of the page');
    setTimeout(() => {
        navbarToggler.style.border = '';
        navbarToggler.style.padding = '';
        console.log('   Border removed');
    }, 5000);
} else {
    console.log('   ❌ Cannot highlight - button not found');
}
console.log('');

// 10. Recommendations
console.log('10. RECOMMENDATIONS');
if (!mobileMenuRight) {
    console.log('   ❌ CRITICAL: .mobile-menu-right element is missing from DOM');
    console.log('   → Check if Header component is rendering correctly');
    console.log('   → Verify React component is using the updated Header.tsx');
}
if (!navbarToggler) {
    console.log('   ❌ CRITICAL: .navbar-toggler button is missing');
    console.log('   → Check if the button is being rendered in JSX');
}
if (window.innerWidth >= 991) {
    console.log('   ⚠️  WARNING: Screen width is too large');
    console.log('   → Resize browser window to less than 991px width');
}
if (mobileMenuRight && window.getComputedStyle(mobileMenuRight).display === 'none') {
    console.log('   ❌ ISSUE: Element exists but display is "none"');
    console.log('   → Check CSS media queries');
    console.log('   → Verify header-fix.css is loaded AFTER main style.css');
}

console.log('\n=== END AUDIT ===');
console.log('\nTo manually test:');
console.log('1. Resize browser to < 991px width');
console.log('2. Look for hamburger icon (☰) in top-right');
console.log('3. Click it to open menu');
console.log('4. Check if menu slides in from right');
