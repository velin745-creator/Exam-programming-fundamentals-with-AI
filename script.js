document.addEventListener('DOMContentLoaded', () => {
    
    // Inputs
    const revenueInput = document.getElementById('revenue');
    const aovInput = document.getElementById('aov');
    const leadRateInput = document.getElementById('lead-rate');
    const prospectRateInput = document.getElementById('prospect-rate');
    
    // Outputs (Stats)
    const valProspects = document.getElementById('val-prospects');
    const valLeads = document.getElementById('val-leads');
    const valCustomers = document.getElementById('val-customers');
    
    const pctLeads = document.getElementById('pct-leads');
    const pctCustomers = document.getElementById('pct-customers');
    
    const fillProspects = document.getElementById('fill-prospects');
    const fillLeads = document.getElementById('fill-leads');
    const fillCustomers = document.getElementById('fill-customers');
    
    const leadRateVal = document.getElementById('lead-rate-val');
    const prospectRateVal = document.getElementById('prospect-rate-val');
    
    const languageSelect = document.getElementById('language-select');
    const currencySelect = document.getElementById('currency-select');
    const currencySymbols = document.querySelectorAll('.currency-symbol');
    
    // Translations dictionaries
    const i18n = {
        en: {
            language: "Language",
            currency: "Currency",
            campaign_start: "Campaign Start",
            campaign_end: "Campaign End",
            total_revenue: "Total Revenue",
            avg_order_value: "Avg. Order Value",
            months: "Months",
            people: "people",
            prospects: "Prospects",
            leads: "Leads",
            customers: "Customers",
            lead_response_rate: "Lead Response Rate",
            prospect_response_rate: "Prospect Response Rate",
            month_word: "Month"
        },
        bg: {
            language: "Език",
            currency: "Валута",
            campaign_start: "Начало на кампанията",
            campaign_end: "Край на кампанията",
            total_revenue: "Общи приходи",
            avg_order_value: "Средна стойност на поръчката",
            months: "Месеци",
            people: "хора",
            prospects: "Потенциални",
            leads: "Лийдове",
            customers: "Клиенти",
            lead_response_rate: "Процент на отговор (Лийдове)",
            prospect_response_rate: "Процент на отговор (Потенциални)",
            month_word: "Месец"
        }
    };
    
    let currentLang = 'en';

    // Chart Area
    const chartArea = document.getElementById('chart-area');
    const tooltip = document.getElementById('tooltip');

    // Max X scale in the chart is 120 based on screenshot (adjust dynamically or hardcode for visual matching)
    const MAX_X_SCALE = 120;
    
    function calculateData() {
        const rev = parseFloat(revenueInput.value) || 0;
        const aov = parseFloat(aovInput.value) || 1;
        
        const leadRate = parseFloat(leadRateInput.value) / 100;
        const prospectRate = parseFloat(prospectRateInput.value) / 100;
        
        // Math derived from funnel logic
        const targetCustomers = Math.ceil(rev / aov);
        const targetLeads = Math.ceil(targetCustomers / leadRate);
        const targetProspects = Math.ceil(targetLeads / prospectRate);
        
        return {
            customers: targetCustomers,
            leads: targetLeads,
            prospects: targetProspects,
            leadRate: leadRate,
            prospectRate: prospectRate
        };
    }
    
    function updateUI() {
        const data = calculateData();
        
        // Update Stats Values
        valProspects.textContent = data.prospects;
        valLeads.textContent = data.leads;
        valCustomers.textContent = data.customers;
        
        // Update Stat Percentages
        const leadsPctVal = data.prospects > 0 ? ((data.leads / data.prospects) * 100) : 0;
        const custPctVal = data.prospects > 0 ? ((data.customers / data.prospects) * 100) : 0;
        
        pctLeads.textContent = Math.round(leadsPctVal) + '%';
        pctCustomers.textContent = Math.round(custPctVal) + '%';
        
        // Update Progress Bars (Relative to prospects as 100%)
        fillProspects.style.width = '100%';
        fillLeads.style.width = Math.min(leadsPctVal, 100) + '%';
        fillCustomers.style.width = Math.min(custPctVal, 100) + '%';
        
        // Update Slider text
        leadRateVal.textContent = (data.leadRate * 100).toFixed(2) + '%';
        prospectRateVal.textContent = (data.prospectRate * 100).toFixed(2) + '%';
        
        updateChart(data);
    }
    
    function updateChart(data) {
        chartArea.innerHTML = '';
        const months = 6;
        const monthWord = i18n[currentLang].month_word;
        const prospectsWord = i18n[currentLang].prospects;
        const leadsWord = i18n[currentLang].leads;
        const customersWord = i18n[currentLang].customers;
        
        // For visual representation similar to the screenshot, 
        // the funnel accumulates or distributes over 6 months linearly.
        for (let i = 1; i <= months; i++) {
            const factor = i / months;
            
            const mProspects = Math.round(data.prospects * factor);
            const mLeads = Math.round(data.leads * factor);
            const mCustomers = Math.round(data.customers * factor);
            
            // Widths relative to the chart's max x domain (120 people scale)
            // If prospects exceed max scale, we cap at 100% for the CSS rendering
            const scaleProspects = Math.min((mProspects / MAX_X_SCALE) * 100, 100);
            const scaleLeads = Math.min((mLeads / MAX_X_SCALE) * 100, 100);
            const scaleCustomers = Math.min((mCustomers / MAX_X_SCALE) * 100, 100);
            
            const row = document.createElement('div');
            row.className = 'chart-row';
            
            const barProspects = document.createElement('div');
            barProspects.className = 'bar prospects';
            barProspects.style.width = scaleProspects + '%';
            
            const barLeads = document.createElement('div');
            barLeads.className = 'bar leads';
            barLeads.style.width = scaleLeads + '%';
            
            const barCustomers = document.createElement('div');
            barCustomers.className = 'bar customers';
            barCustomers.style.width = scaleCustomers + '%';
            
            // Hover Events for Tooltip
            row.addEventListener('mousemove', (e) => {
                tooltip.style.opacity = '1';
                tooltip.style.left = e.pageX + 15 + 'px';
                tooltip.style.top = e.pageY - 20 + 'px';
                tooltip.innerHTML = `${monthWord} #${i}\n${prospectsWord}: ${mProspects}\n${leadsWord}: ${mLeads}\n${customersWord}: ${mCustomers}`;
            });
            
            row.addEventListener('mouseleave', () => {
                tooltip.style.opacity = '0';
            });
            
            row.appendChild(barProspects);
            row.appendChild(barLeads);
            row.appendChild(barCustomers);
            
            chartArea.appendChild(row);
        }
    }
    
    function applyTranslations() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (i18n[currentLang] && i18n[currentLang][key]) {
                el.textContent = i18n[currentLang][key];
            }
        });
        updateChart(calculateData());
    }

    // Event Listeners
    languageSelect.addEventListener('change', (e) => {
        currentLang = e.target.value;
        applyTranslations();
    });

    currencySelect.addEventListener('change', (e) => {
        const symbol = e.target.value === 'eur' ? '€' : '$';
        currencySymbols.forEach(el => {
            el.textContent = symbol;
        });
    });

    revenueInput.addEventListener('input', updateUI);
    aovInput.addEventListener('input', updateUI);
    leadRateInput.addEventListener('input', updateUI);
    prospectRateInput.addEventListener('input', updateUI);
    
    // Initial Render
    updateUI();
});
