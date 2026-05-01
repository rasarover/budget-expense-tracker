// ── Static reference data ────────────────────────────────────────────────────

const COUNTRIES = {
  india: {
    name: "India", flag: "🇮🇳", currency: "INR", symbol: "₹",
    assetTypes: {
      "Government Schemes": [
        { name: "PPF (Public Provident Fund)", returns: "7.1% p.a.", lockIn: "15 years", taxBenefit: "Section 80C" },
        { name: "NSC (National Savings Certificate)", returns: "7.7% p.a.", lockIn: "5 years", taxBenefit: "Section 80C" },
        { name: "Sukanya Samriddhi Yojana", returns: "8.2% p.a.", lockIn: "21 years", taxBenefit: "Section 80C (girls only)" },
        { name: "Senior Citizen Savings Scheme (SCSS)", returns: "8.2% p.a.", lockIn: "5 years", taxBenefit: "Section 80C" },
        { name: "Kisan Vikas Patra (KVP)", returns: "7.5% p.a.", lockIn: "115 months", taxBenefit: "None" },
        { name: "PM Vaya Vandana Yojana (PMVVY)", returns: "7.4% p.a.", lockIn: "10 years", taxBenefit: "None (senior citizens)" },
        { name: "Post Office Monthly Income Scheme", returns: "7.4% p.a.", lockIn: "5 years", taxBenefit: "None" },
        { name: "Post Office Recurring Deposit", returns: "6.7% p.a.", lockIn: "5 years", taxBenefit: "None" },
        { name: "National Pension System (NPS)", returns: "8–12% (market)", lockIn: "Till retirement", taxBenefit: "80C + 80CCD(1B)" },
      ],
      "Mutual Funds": [
        { name: "ELSS (Equity Linked Savings Scheme)", returns: "12–15% historical", lockIn: "3 years", taxBenefit: "Section 80C" },
        { name: "Large Cap Equity Fund", returns: "10–13% historical", lockIn: "None", taxBenefit: "None" },
        { name: "Mid/Small Cap Equity Fund", returns: "12–18% historical", lockIn: "None", taxBenefit: "None" },
        { name: "Debt Mutual Fund", returns: "6–8%", lockIn: "None", taxBenefit: "None" },
        { name: "Hybrid / Balanced Fund", returns: "8–12%", lockIn: "None", taxBenefit: "None" },
        { name: "Index Fund (Nifty/Sensex)", returns: "10–12% historical", lockIn: "None", taxBenefit: "None" },
        { name: "ETF (Exchange Traded Fund)", returns: "Varies", lockIn: "None", taxBenefit: "None" },
        { name: "Liquid / Overnight Fund", returns: "6–7%", lockIn: "None", taxBenefit: "None" },
      ],
      "Stocks & Securities": [
        { name: "BSE / NSE Listed Stocks", returns: "Varies", lockIn: "None", taxBenefit: "None" },
        { name: "REITs (Real Estate Investment Trusts)", returns: "7–9%", lockIn: "None", taxBenefit: "None" },
        { name: "InvITs (Infrastructure Inv. Trusts)", returns: "8–10%", lockIn: "None", taxBenefit: "None" },
        { name: "SGBs (Sovereign Gold Bonds)", returns: "2.5% + gold price", lockIn: "8 years", taxBenefit: "Tax-free on maturity" },
      ],
      "Fixed Deposits & Recurring": [
        { name: "Bank Fixed Deposit", returns: "6.5–7.5%", lockIn: "Flexible (7 days–10 yrs)", taxBenefit: "None" },
        { name: "Corporate Fixed Deposit", returns: "7–9%", lockIn: "Flexible", taxBenefit: "None" },
        { name: "Tax Saving Fixed Deposit", returns: "6.5–7.5%", lockIn: "5 years", taxBenefit: "Section 80C" },
        { name: "Bank Recurring Deposit (RD)", returns: "6–7%", lockIn: "Flexible", taxBenefit: "None" },
      ],
      "Provident Funds": [
        { name: "EPF (Employee Provident Fund)", returns: "8.15%", lockIn: "Till retirement", taxBenefit: "Section 80C" },
        { name: "VPF (Voluntary Provident Fund)", returns: "8.15%", lockIn: "Till retirement", taxBenefit: "Section 80C" },
        { name: "GPF (General Provident Fund – Govt)", returns: "7.1%", lockIn: "Till retirement", taxBenefit: "Section 80C" },
      ],
      "Physical & Alternate Assets": [
        { name: "Physical Gold / Jewellery", returns: "Varies", lockIn: "None", taxBenefit: "None" },
        { name: "Digital Gold", returns: "Varies", lockIn: "None", taxBenefit: "None" },
        { name: "Silver", returns: "Varies", lockIn: "None", taxBenefit: "None" },
        { name: "Real Estate / Property", returns: "8–12% historical", lockIn: "None", taxBenefit: "80C on home loan principal" },
        { name: "Cryptocurrency", returns: "Highly volatile", lockIn: "None", taxBenefit: "30% flat tax" },
      ],
      "Insurance-cum-Investment": [
        { name: "LIC Endowment / Money Back Policy", returns: "5–6%", lockIn: "Policy term", taxBenefit: "Section 80C" },
        { name: "ULIP (Unit Linked Insurance Plan)", returns: "Varies (market)", lockIn: "5 years", taxBenefit: "Section 80C" },
        { name: "Guaranteed Return Insurance Plans", returns: "5–6%", lockIn: "Policy term", taxBenefit: "Section 80C" },
      ],
    }
  },
  usa: {
    name: "United States", flag: "🇺🇸", currency: "USD", symbol: "$",
    assetTypes: {
      "Retirement Accounts": [
        { name: "401(k) – Traditional", returns: "Varies (market)", lockIn: "Age 59½", taxBenefit: "Pre-tax contributions" },
        { name: "Roth 401(k)", returns: "Varies (market)", lockIn: "Age 59½", taxBenefit: "Tax-free growth & withdrawals" },
        { name: "Traditional IRA", returns: "Varies (market)", lockIn: "Age 59½", taxBenefit: "Tax-deductible contributions" },
        { name: "Roth IRA", returns: "Varies (market)", lockIn: "Age 59½", taxBenefit: "Tax-free growth & withdrawals" },
        { name: "SEP IRA", returns: "Varies (market)", lockIn: "Age 59½", taxBenefit: "High contribution limit, tax-deductible" },
        { name: "SIMPLE IRA", returns: "Varies (market)", lockIn: "Age 59½", taxBenefit: "Pre-tax contributions + employer match" },
        { name: "403(b) – Non-profit / Education", returns: "Varies (market)", lockIn: "Age 59½", taxBenefit: "Pre-tax contributions" },
        { name: "457(b) – Government employees", returns: "Varies (market)", lockIn: "Separation from service", taxBenefit: "Pre-tax contributions" },
        { name: "Solo 401(k) – Self-employed", returns: "Varies (market)", lockIn: "Age 59½", taxBenefit: "High contribution limit" },
      ],
      "Brokerage & Funds": [
        { name: "Individual Stocks (NYSE / NASDAQ)", returns: "Varies", lockIn: "None", taxBenefit: "Long-term cap gains rate" },
        { name: "S&P 500 Index Fund", returns: "~10% historical", lockIn: "None", taxBenefit: "Long-term cap gains rate" },
        { name: "Total Market ETF", returns: "~10% historical", lockIn: "None", taxBenefit: "Long-term cap gains rate" },
        { name: "Mutual Funds", returns: "Varies", lockIn: "None", taxBenefit: "None" },
        { name: "REITs", returns: "8–12%", lockIn: "None", taxBenefit: "None" },
        { name: "Dividend Growth Stocks", returns: "8–10%", lockIn: "None", taxBenefit: "Qualified dividend rate" },
      ],
      "Fixed Income": [
        { name: "Treasury Bonds (T-Bonds, 10–30 yr)", returns: "4–5%", lockIn: "10–30 years", taxBenefit: "State & local tax exempt" },
        { name: "Treasury Bills (T-Bills, <1 yr)", returns: "4–5%", lockIn: "4–52 weeks", taxBenefit: "State & local tax exempt" },
        { name: "Treasury Notes (T-Notes, 2–10 yr)", returns: "4–5%", lockIn: "2–10 years", taxBenefit: "State & local tax exempt" },
        { name: "TIPS (Inflation-Protected)", returns: "Inflation + real rate", lockIn: "5–30 years", taxBenefit: "State & local tax exempt" },
        { name: "I-Bonds (Series I)", returns: "Inflation-adjusted", lockIn: "1 year min, 5 yr penalty-free", taxBenefit: "State & local tax exempt" },
        { name: "Municipal Bonds", returns: "3–4%", lockIn: "Varies", taxBenefit: "Federal tax-exempt" },
        { name: "Corporate Bonds", returns: "4–7%", lockIn: "Varies", taxBenefit: "None" },
        { name: "CDs (Certificates of Deposit)", returns: "4–5%", lockIn: "Flexible", taxBenefit: "None" },
        { name: "High-Yield Savings Account", returns: "4–5%", lockIn: "None", taxBenefit: "None" },
        { name: "Money Market Fund", returns: "4–5%", lockIn: "None", taxBenefit: "None" },
      ],
      "Real Estate": [
        { name: "Direct Real Estate / Rental Property", returns: "8–12%", lockIn: "None", taxBenefit: "Mortgage interest deduction" },
        { name: "Real Estate Crowdfunding", returns: "8–12%", lockIn: "Varies", taxBenefit: "None" },
      ],
      "Education": [
        { name: "529 College Savings Plan", returns: "Varies (market)", lockIn: "Education use", taxBenefit: "Tax-free for qualified education" },
        { name: "Coverdell ESA", returns: "Varies (market)", lockIn: "Education use", taxBenefit: "Tax-free for qualified education" },
      ],
      "Alternative": [
        { name: "Cryptocurrency", returns: "Highly volatile", lockIn: "None", taxBenefit: "Long-term cap gains if >1 yr" },
        { name: "Gold / Precious Metals", returns: "Varies", lockIn: "None", taxBenefit: "Collectibles rate (28%)" },
        { name: "Commodities", returns: "Varies", lockIn: "None", taxBenefit: "None" },
        { name: "Annuities", returns: "Varies", lockIn: "Surrender period", taxBenefit: "Tax-deferred growth" },
      ],
    }
  },
  uk: {
    name: "United Kingdom", flag: "🇬🇧", currency: "GBP", symbol: "£",
    assetTypes: {
      "ISA & Tax-Advantaged": [
        { name: "Cash ISA", returns: "3–5%", lockIn: "None", taxBenefit: "Tax-free interest" },
        { name: "Stocks & Shares ISA", returns: "Varies (market)", lockIn: "None", taxBenefit: "Tax-free growth & income" },
        { name: "Lifetime ISA (LISA)", returns: "Varies", lockIn: "Till 60 or first home", taxBenefit: "25% government bonus (max £1,000/yr)" },
        { name: "Junior ISA (JISA)", returns: "Varies", lockIn: "Till 18", taxBenefit: "Tax-free for child" },
        { name: "Innovative Finance ISA", returns: "5–10%", lockIn: "Varies", taxBenefit: "Tax-free interest" },
      ],
      "Pensions": [
        { name: "SIPP (Self-Invested Personal Pension)", returns: "Varies (market)", lockIn: "Age 55", taxBenefit: "Tax relief on contributions" },
        { name: "Workplace Pension (auto-enrolment)", returns: "Varies (market)", lockIn: "Age 55", taxBenefit: "Tax relief + employer match" },
        { name: "Defined Benefit (DB) Pension", returns: "Guaranteed income", lockIn: "Retirement age", taxBenefit: "Tax relief" },
      ],
      "Stocks & Funds": [
        { name: "UK Stocks (LSE)", returns: "Varies", lockIn: "None", taxBenefit: "Annual CGT allowance" },
        { name: "ETFs", returns: "Varies", lockIn: "None", taxBenefit: "Annual CGT allowance" },
        { name: "Investment Trusts", returns: "Varies", lockIn: "None", taxBenefit: "Annual CGT allowance" },
        { name: "OEICs / Unit Trusts", returns: "Varies", lockIn: "None", taxBenefit: "Annual CGT allowance" },
        { name: "REITs (UK)", returns: "5–8%", lockIn: "None", taxBenefit: "None" },
      ],
      "Fixed Income & Savings": [
        { name: "Premium Bonds (NS&I)", returns: "Up to 4.65% (tax-free prizes)", lockIn: "None", taxBenefit: "Tax-free prizes" },
        { name: "UK Government Gilts", returns: "4–5%", lockIn: "Varies", taxBenefit: "None" },
        { name: "Corporate Bonds", returns: "5–7%", lockIn: "Varies", taxBenefit: "None" },
        { name: "Fixed Rate Savings Bond", returns: "4–5%", lockIn: "1–5 years", taxBenefit: "Personal Savings Allowance" },
        { name: "Notice Account", returns: "3–4%", lockIn: "30–120 days notice", taxBenefit: "Personal Savings Allowance" },
        { name: "Regular Saver Account", returns: "5–8%", lockIn: "12 months", taxBenefit: "Personal Savings Allowance" },
      ],
      "Real Estate": [
        { name: "Buy-to-Let Property", returns: "5–8%", lockIn: "None", taxBenefit: "Allowable expenses deduction" },
        { name: "Property Crowdfunding", returns: "5–8%", lockIn: "Varies", taxBenefit: "None" },
      ],
      "Venture & Alternative": [
        { name: "EIS (Enterprise Investment Scheme)", returns: "Varies", lockIn: "3 years", taxBenefit: "30% income tax relief" },
        { name: "SEIS (Seed EIS)", returns: "Varies", lockIn: "3 years", taxBenefit: "50% income tax relief" },
        { name: "VCT (Venture Capital Trust)", returns: "Varies", lockIn: "5 years", taxBenefit: "30% income tax relief" },
        { name: "Cryptocurrency", returns: "Highly volatile", lockIn: "None", taxBenefit: "Annual CGT allowance" },
        { name: "Gold / Precious Metals", returns: "Varies", lockIn: "None", taxBenefit: "Annual CGT allowance" },
      ],
    }
  },
  australia: {
    name: "Australia", flag: "🇦🇺", currency: "AUD", symbol: "A$",
    assetTypes: {
      "Superannuation": [
        { name: "Industry Super Fund", returns: "7–9%", lockIn: "Preservation age (60)", taxBenefit: "15% concessional tax rate" },
        { name: "Retail Super Fund", returns: "6–8%", lockIn: "Preservation age (60)", taxBenefit: "15% concessional tax rate" },
        { name: "SMSF (Self-Managed Super Fund)", returns: "Varies", lockIn: "Preservation age (60)", taxBenefit: "15% concessional tax rate" },
        { name: "Salary Sacrifice to Super", returns: "Varies (market)", lockIn: "Preservation age (60)", taxBenefit: "Concessional contributions taxed at 15%" },
        { name: "Government Co-Contribution", returns: "N/A – government top-up", lockIn: "Preservation age", taxBenefit: "Up to $500 free from govt" },
      ],
      "ASX Stocks & Funds": [
        { name: "ASX Listed Stocks", returns: "Varies", lockIn: "None", taxBenefit: "Franking credits, 50% CGT discount" },
        { name: "ASX ETFs", returns: "Varies", lockIn: "None", taxBenefit: "50% CGT discount (>1 year)" },
        { name: "Managed Funds", returns: "Varies", lockIn: "None", taxBenefit: "50% CGT discount" },
        { name: "LICs (Listed Investment Companies)", returns: "Varies", lockIn: "None", taxBenefit: "Franking credits" },
        { name: "A-REITs (Property Trusts)", returns: "5–8%", lockIn: "None", taxBenefit: "None" },
      ],
      "Fixed Income & Savings": [
        { name: "Term Deposit", returns: "4–5%", lockIn: "Fixed term", taxBenefit: "None" },
        { name: "Australian Government Bonds", returns: "4–5%", lockIn: "Varies", taxBenefit: "None" },
        { name: "Corporate Bonds", returns: "5–7%", lockIn: "Varies", taxBenefit: "None" },
        { name: "High Interest Savings Account", returns: "4–5%", lockIn: "None", taxBenefit: "None" },
      ],
      "Government Schemes": [
        { name: "First Home Super Saver Scheme (FHSS)", returns: "Super returns", lockIn: "First home purchase", taxBenefit: "Tax benefits via super" },
        { name: "First Home Guarantee (FHBG)", returns: "N/A – govt guarantee", lockIn: "None", taxBenefit: "5% deposit, no LMI" },
      ],
      "Real Estate": [
        { name: "Investment Property", returns: "6–10%", lockIn: "None", taxBenefit: "Negative gearing, 50% CGT discount" },
        { name: "Property Syndicate / Crowdfunding", returns: "6–9%", lockIn: "Varies", taxBenefit: "50% CGT discount" },
      ],
      "Alternative": [
        { name: "Cryptocurrency", returns: "Highly volatile", lockIn: "None", taxBenefit: "50% CGT discount (>1 year)" },
        { name: "Gold / Precious Metals", returns: "Varies", lockIn: "None", taxBenefit: "50% CGT discount" },
        { name: "Agricultural Investments / Farmland", returns: "Varies", lockIn: "Varies", taxBenefit: "Agribusiness managed investment schemes" },
      ],
    }
  },
  canada: {
    name: "Canada", flag: "🇨🇦", currency: "CAD", symbol: "C$",
    assetTypes: {
      "Registered Accounts": [
        { name: "RRSP (Registered Retirement Savings Plan)", returns: "Varies (market)", lockIn: "Till age 71 (convert to RRIF)", taxBenefit: "Tax-deductible contributions" },
        { name: "TFSA (Tax-Free Savings Account)", returns: "Varies (market)", lockIn: "None", taxBenefit: "Tax-free growth & withdrawals" },
        { name: "RESP (Registered Education Savings Plan)", returns: "Varies (market)", lockIn: "Education use", taxBenefit: "20% CESG grant (up to $500/yr)" },
        { name: "FHSA (First Home Savings Account)", returns: "Varies (market)", lockIn: "First home purchase", taxBenefit: "Tax-deductible + tax-free growth" },
        { name: "RDSP (Registered Disability Savings)", returns: "Varies (market)", lockIn: "Varies", taxBenefit: "Government grants & bonds" },
        { name: "Workplace Pension (DB/DC)", returns: "Varies", lockIn: "Retirement", taxBenefit: "Pre-tax contributions" },
        { name: "DPSP (Deferred Profit Sharing)", returns: "Varies", lockIn: "Varies", taxBenefit: "Tax-deferred" },
      ],
      "TSX Stocks & Funds": [
        { name: "TSX Listed Stocks", returns: "Varies", lockIn: "None", taxBenefit: "Dividend tax credit" },
        { name: "ETFs (TSX)", returns: "Varies", lockIn: "None", taxBenefit: "50% capital gains inclusion" },
        { name: "Mutual Funds", returns: "Varies", lockIn: "None", taxBenefit: "None" },
        { name: "REITs (Canadian)", returns: "5–8%", lockIn: "None", taxBenefit: "None" },
      ],
      "Fixed Income": [
        { name: "GICs (Guaranteed Investment Certificates)", returns: "4–5%", lockIn: "Fixed term", taxBenefit: "None" },
        { name: "Government of Canada Bonds", returns: "4–5%", lockIn: "Varies", taxBenefit: "None" },
        { name: "Provincial Bonds", returns: "4–5.5%", lockIn: "Varies", taxBenefit: "None" },
        { name: "Corporate Bonds", returns: "5–7%", lockIn: "Varies", taxBenefit: "None" },
        { name: "High Interest Savings Account (HISA)", returns: "4–5%", lockIn: "None", taxBenefit: "None" },
      ],
      "Real Estate": [
        { name: "Rental Property", returns: "6–10%", lockIn: "None", taxBenefit: "Expense deductions, CCA" },
        { name: "Real Estate Investment Trust (REIT)", returns: "5–8%", lockIn: "None", taxBenefit: "None" },
      ],
      "Alternative": [
        { name: "Cryptocurrency", returns: "Highly volatile", lockIn: "None", taxBenefit: "50% cap gains inclusion (>1 yr)" },
        { name: "Gold / Precious Metals", returns: "Varies", lockIn: "None", taxBenefit: "50% cap gains inclusion" },
        { name: "Private Equity / Venture Capital", returns: "Varies", lockIn: "Varies", taxBenefit: "None" },
      ],
    }
  },
  germany: {
    name: "Germany", flag: "🇩🇪", currency: "EUR", symbol: "€",
    assetTypes: {
      "Retirement (Altersvorsorge)": [
        { name: "Gesetzliche Rentenversicherung (GRV)", returns: "Varies", lockIn: "Retirement age (67)", taxBenefit: "Tax-deductible contributions" },
        { name: "Riester-Rente", returns: "Varies", lockIn: "Age 60+", taxBenefit: "Government subsidy + tax deduction" },
        { name: "Rürup-Rente (Basis-Rente)", returns: "Varies", lockIn: "Age 62+", taxBenefit: "High tax deductibility (self-employed)" },
        { name: "Betriebliche Altersvorsorge (bAV)", returns: "Varies", lockIn: "Retirement", taxBenefit: "Tax & social security savings" },
      ],
      "Savings & Fixed Income": [
        { name: "Tagesgeld (Overnight Deposit / Savings)", returns: "2–4%", lockIn: "None", taxBenefit: "Sparerpauschbetrag (€1,000 exempt)" },
        { name: "Festgeld (Fixed Deposit)", returns: "3–4%", lockIn: "Fixed term", taxBenefit: "Sparerpauschbetrag" },
        { name: "Bundesanleihen (Federal Bonds)", returns: "2–3%", lockIn: "Varies", taxBenefit: "None" },
        { name: "Bausparvertrag (Building Society)", returns: "Varies", lockIn: "Varies", taxBenefit: "Wohnungsbauprämie" },
        { name: "Pfandbriefe (Covered Bonds)", returns: "3–4%", lockIn: "Varies", taxBenefit: "None" },
      ],
      "Stocks & Funds": [
        { name: "DAX / MDAX Stocks", returns: "Varies", lockIn: "None", taxBenefit: "Sparerpauschbetrag" },
        { name: "ETFs (Xetra)", returns: "Varies", lockIn: "None", taxBenefit: "Sparerpauschbetrag" },
        { name: "Investment Funds (UCITS)", returns: "Varies", lockIn: "None", taxBenefit: "Sparerpauschbetrag" },
        { name: "Aktiensparpläne (Stock Savings Plans)", returns: "Varies", lockIn: "None", taxBenefit: "Sparerpauschbetrag" },
      ],
      "Real Estate": [
        { name: "Immobilien – Eigentum (Own property)", returns: "3–5% + appreciation", lockIn: "None", taxBenefit: "AfA depreciation (rental)" },
        { name: "Immobilienfonds (Real Estate Fund)", returns: "3–5%", lockIn: "Varies", taxBenefit: "None" },
      ],
      "Alternative": [
        { name: "Cryptocurrency", returns: "Highly volatile", lockIn: "None", taxBenefit: "Tax-free after 1 year hold" },
        { name: "Gold / Precious Metals", returns: "Varies", lockIn: "None", taxBenefit: "Tax-free after 1 year hold" },
        { name: "Crowdfunding / P2P Lending", returns: "5–10%", lockIn: "Varies", taxBenefit: "None" },
      ],
    }
  },
  singapore: {
    name: "Singapore", flag: "🇸🇬", currency: "SGD", symbol: "S$",
    assetTypes: {
      "CPF (Central Provident Fund)": [
        { name: "CPF Ordinary Account (OA)", returns: "2.5%", lockIn: "Age 55 (some earlier use)", taxBenefit: "CPF Relief on contributions" },
        { name: "CPF Special Account (SA)", returns: "4%", lockIn: "Retirement", taxBenefit: "CPF Relief on contributions" },
        { name: "CPF MediSave Account (MA)", returns: "4%", lockIn: "Medical / hospitalisation", taxBenefit: "CPF Relief" },
        { name: "CPF Retirement Account (RA)", returns: "4%", lockIn: "Age 65+", taxBenefit: "None (formed at age 55)" },
        { name: "SRS (Supplementary Retirement Scheme)", returns: "Varies (self-directed)", lockIn: "Statutory retirement age (63)", taxBenefit: "Tax deduction on contributions" },
        { name: "CPF LIFE (Annuity)", returns: "Lifelong payout", lockIn: "Age 65", taxBenefit: "None" },
      ],
      "Government Securities & Savings": [
        { name: "Singapore Government Securities (SGS Bonds)", returns: "3–4%", lockIn: "2–30 years", taxBenefit: "None" },
        { name: "Treasury Bills (T-Bills, 6M/1Y)", returns: "3–4%", lockIn: "6M–1 year", taxBenefit: "None" },
        { name: "Singapore Savings Bonds (SSB)", returns: "3–4% (step-up)", lockIn: "Up to 10 years (redeemable)", taxBenefit: "None" },
        { name: "Fixed Deposit (Singapore Banks)", returns: "2–4%", lockIn: "Fixed term", taxBenefit: "None" },
      ],
      "SGX Stocks & Funds": [
        { name: "SGX Listed Stocks", returns: "Varies", lockIn: "None", taxBenefit: "No capital gains tax" },
        { name: "ETFs (SGX)", returns: "Varies", lockIn: "None", taxBenefit: "No capital gains tax" },
        { name: "Unit Trusts / Mutual Funds", returns: "Varies", lockIn: "None", taxBenefit: "No capital gains tax" },
        { name: "S-REITs (Singapore REITs)", returns: "5–8%", lockIn: "None", taxBenefit: "Exempt from corp tax for REIT" },
        { name: "Business Trusts", returns: "Varies", lockIn: "None", taxBenefit: "No capital gains tax" },
      ],
      "Real Estate": [
        { name: "HDB Resale Flat", returns: "3–5%", lockIn: "5 yr MOP", taxBenefit: "None" },
        { name: "Private Condominium / Property", returns: "4–7%", lockIn: "None", taxBenefit: "None" },
      ],
      "Alternative & Digital": [
        { name: "Cryptocurrency", returns: "Highly volatile", lockIn: "None", taxBenefit: "No capital gains tax" },
        { name: "Gold (physical or ETF)", returns: "Varies", lockIn: "None", taxBenefit: "No capital gains tax" },
        { name: "Robo-Advisors (StashAway, Syfe, Endowus)", returns: "Varies", lockIn: "None", taxBenefit: "No capital gains tax" },
        { name: "P2P Lending (Funding Societies, etc.)", returns: "5–10%", lockIn: "Varies", taxBenefit: "None" },
      ],
    }
  },
  uae: {
    name: "UAE", flag: "🇦🇪", currency: "AED", symbol: "AED",
    assetTypes: {
      "Savings & Fixed Income": [
        { name: "Bank Fixed Deposit", returns: "3–5%", lockIn: "Fixed term", taxBenefit: "No income tax" },
        { name: "High-Interest Savings Account", returns: "2–4%", lockIn: "None", taxBenefit: "No income tax" },
        { name: "Sukuk (Islamic Bonds)", returns: "4–6%", lockIn: "Varies", taxBenefit: "No income tax" },
        { name: "Government Bonds", returns: "4–5%", lockIn: "Varies", taxBenefit: "No income tax" },
      ],
      "Stocks & Funds": [
        { name: "DFM / ADX Listed Stocks", returns: "Varies", lockIn: "None", taxBenefit: "No capital gains / income tax" },
        { name: "ETFs (DFM / NASDAQ Dubai)", returns: "Varies", lockIn: "None", taxBenefit: "No capital gains tax" },
        { name: "Mutual Funds", returns: "Varies", lockIn: "None", taxBenefit: "No income tax" },
        { name: "REITs (UAE / Global)", returns: "5–9%", lockIn: "None", taxBenefit: "No income tax" },
      ],
      "Real Estate": [
        { name: "UAE Property (Freehold zones)", returns: "6–10%", lockIn: "None", taxBenefit: "No income / capital gains tax" },
        { name: "Off-Plan Property", returns: "Varies", lockIn: "Construction period", taxBenefit: "No income tax" },
        { name: "Real Estate Crowdfunding", returns: "8–12%", lockIn: "Varies", taxBenefit: "No income tax" },
      ],
      "End-of-Service Gratuity": [
        { name: "DEWS (Dubai Employee WPS)", returns: "Varies (invested)", lockIn: "End of service", taxBenefit: "No income tax" },
        { name: "GPSSA (Abu Dhabi nationals)", returns: "Government defined", lockIn: "Retirement", taxBenefit: "No income tax" },
      ],
      "Alternative": [
        { name: "Cryptocurrency", returns: "Highly volatile", lockIn: "None", taxBenefit: "No capital gains tax" },
        { name: "Gold / Precious Metals", returns: "Varies", lockIn: "None", taxBenefit: "No income tax" },
        { name: "Private Equity / VC", returns: "Varies", lockIn: "Varies", taxBenefit: "No income tax" },
      ],
    }
  },
  other: {
    name: "Other / International", flag: "🌍", currency: "USD", symbol: "$",
    assetTypes: {
      "Global Investments": [
        { name: "Global Stocks / ETFs", returns: "Varies", lockIn: "None", taxBenefit: "Varies by country" },
        { name: "International Bonds", returns: "Varies", lockIn: "Varies", taxBenefit: "Varies by country" },
        { name: "REITs (Global)", returns: "5–9%", lockIn: "None", taxBenefit: "Varies by country" },
        { name: "Cryptocurrency", returns: "Highly volatile", lockIn: "None", taxBenefit: "Varies by country" },
        { name: "Gold / Precious Metals", returns: "Varies", lockIn: "None", taxBenefit: "Varies by country" },
        { name: "Real Estate", returns: "Varies", lockIn: "None", taxBenefit: "Varies by country" },
        { name: "Fixed Deposits / CDs", returns: "Varies", lockIn: "Fixed term", taxBenefit: "Varies by country" },
        { name: "Government Savings Bonds", returns: "Varies", lockIn: "Varies", taxBenefit: "Varies by country" },
        { name: "Pension / Retirement Plan", returns: "Varies", lockIn: "Retirement age", taxBenefit: "Varies by country" },
      ],
    }
  }
};

// ── Budget & Expense categories ───────────────────────────────────────────────

const DEFAULT_CATEGORIES = {
  "Housing": {
    icon: "fa-home", color: "#6366f1",
    subcategories: ["Rent / Mortgage", "Electricity", "Gas / LPG", "Water", "Internet / Broadband", "Mobile / Phone Bill", "Cable / DTH", "House Maintenance", "Society / HOA Charges", "Furniture & Appliances", "Cleaning / Housekeeping"]
  },
  "Food & Dining": {
    icon: "fa-utensils", color: "#f59e0b",
    subcategories: ["Groceries / Supermarket", "Fruits & Vegetables", "Milk & Dairy", "Eating Out / Restaurant", "Coffee & Cafes", "Food Delivery (Swiggy/Zomato/UberEats)", "Snacks & Beverages", "Work Lunch", "Party / Celebrations Food"]
  },
  "Transportation": {
    icon: "fa-car", color: "#10b981",
    subcategories: ["Fuel / Petrol / Diesel", "Car EMI / Lease", "Public Transport (Bus/Metro/Train)", "Ride-Sharing (Ola/Uber/Lyft)", "Taxi / Auto", "Car Maintenance & Service", "Parking Fees", "Toll Charges", "Two-Wheeler / Bike", "Flight Tickets", "Train / Long Distance"]
  },
  "Health & Fitness": {
    icon: "fa-heart", color: "#ef4444",
    subcategories: ["Health Insurance Premium", "Doctor / Consultation", "Hospital / Surgery", "Medicines / Pharmacy", "Dental Care", "Eye Care / Spectacles", "Lab Tests / Diagnostics", "Gym / Fitness Membership", "Yoga / Sports Classes", "Mental Health / Therapy", "Vitamins & Supplements"]
  },
  "Entertainment": {
    icon: "fa-film", color: "#8b5cf6",
    subcategories: ["Movies / OTT Subscriptions (Netflix/Prime)", "Games / Gaming", "Books / E-books / Kindle", "Music Streaming (Spotify/Apple Music)", "Events / Concerts / Sports", "Hobbies & Crafts", "Sports Equipment", "Indoor Activities", "Weekend Outings"]
  },
  "Shopping": {
    icon: "fa-shopping-bag", color: "#ec4899",
    subcategories: ["Clothing & Footwear", "Electronics & Gadgets", "Home Decor & Furnishings", "Kitchen Accessories", "Bags & Accessories", "Online Shopping (Amazon/Flipkart)", "Gifts for Others", "Books & Stationery", "Toys & Kids Items"]
  },
  "Education": {
    icon: "fa-graduation-cap", color: "#06b6d4",
    subcategories: ["School / College Fees", "Online Courses / Udemy / Coursera", "Coaching / Tuition", "Books & Study Material", "School Supplies / Stationery", "Exam Fees", "Skill Development Programs", "Kids Activities / Extracurricular"]
  },
  "Personal Care": {
    icon: "fa-spa", color: "#f97316",
    subcategories: ["Haircut / Salon / Barber", "Skincare & Beauty Products", "Cosmetics & Makeup", "Spa & Massage", "Grooming Products", "Toiletries & Personal Hygiene"]
  },
  "Travel & Vacation": {
    icon: "fa-plane", color: "#14b8a6",
    subcategories: ["Flight Tickets", "Hotel / Accommodation", "Holiday Packages", "Travel Insurance", "Sightseeing & Activities", "Local Transport at Destination", "Travel Gear / Luggage", "Visa Fees"]
  },
  "Insurance": {
    icon: "fa-shield-alt", color: "#64748b",
    subcategories: ["Life Insurance Premium", "Health Insurance Premium", "Vehicle Insurance", "Home / Property Insurance", "Term Insurance", "Travel Insurance", "Accidental Insurance"]
  },
  "Savings & Investments": {
    icon: "fa-piggy-bank", color: "#22c55e",
    subcategories: ["Emergency Fund Contribution", "Mutual Fund SIP", "Stock Market Investment", "PPF / NPS Contribution", "FD / RD Contribution", "Gold / Silver Purchase", "Retirement Fund", "Children Education Fund", "Tax Saving Investments"]
  },
  "Debt & Loan Payments": {
    icon: "fa-credit-card", color: "#dc2626",
    subcategories: ["Home Loan EMI", "Car Loan EMI", "Personal Loan EMI", "Credit Card Payment", "Education Loan EMI", "Business Loan EMI", "Buy Now Pay Later (BNPL)"]
  },
  "Gifts & Donations": {
    icon: "fa-gift", color: "#a855f7",
    subcategories: ["Gifts to Family / Friends", "Wedding Gifts", "Charitable Donations / NGO", "Religious Donations / Temple", "Festival Celebrations", "Birthday / Anniversary Gifts"]
  },
  "Kids & Family": {
    icon: "fa-child", color: "#fb923c",
    subcategories: ["Daycare / Childcare", "School / Tuition Fees", "Baby Supplies / Diapers", "Kids Clothing", "Kids Toys & Games", "Family Outings", "Elderly Care / Parents Support"]
  },
  "Taxes": {
    icon: "fa-file-invoice-dollar", color: "#78716c",
    subcategories: ["Income Tax", "Property Tax", "GST / VAT (paid)", "Professional Tax", "Capital Gains Tax", "Tax Filing / CA Charges"]
  },
  "Business Expenses": {
    icon: "fa-briefcase", color: "#3b82f6",
    subcategories: ["Office Rent", "Employee Salaries", "Marketing & Advertising", "Software / Tools Subscriptions", "Business Travel", "Utilities (Business)", "Professional Services / Legal"]
  },
  "Miscellaneous": {
    icon: "fa-ellipsis-h", color: "#9ca3af",
    subcategories: ["ATM / Bank Charges", "Fines & Penalties", "Unexpected Expenses", "Cash Withdrawal", "Other / Unlisted"]
  }
};

// ── Income categories ─────────────────────────────────────────────────────────

const INCOME_CATEGORIES = {
  "Employment Income": {
    icon: "fa-briefcase", color: "#22c55e",
    subcategories: ["Monthly Salary", "Annual Bonus", "Performance Incentive", "Overtime Pay", "Commission", "Allowances (HRA, TA, DA, etc.)", "Joining Bonus", "ESOP / Stock Options"]
  },
  "Self-Employment & Business": {
    icon: "fa-store", color: "#3b82f6",
    subcategories: ["Business Revenue / Sales", "Freelance Projects", "Consulting Fees", "Professional Fees", "Contract Work", "Agency / Brokerage Income"]
  },
  "Investment Returns": {
    icon: "fa-chart-line", color: "#8b5cf6",
    subcategories: ["Stock / MF Dividends", "Interest Income (FD/RD/Savings)", "Capital Gains (Stocks/MF)", "Rental Income", "Bond Interest", "PPF / NPS Maturity", "Royalties"]
  },
  "Government & Social": {
    icon: "fa-landmark", color: "#06b6d4",
    subcategories: ["Income Tax Refund", "Government Pension", "Social Security / Benefits", "Maternity / Paternity Pay", "Unemployment Benefits", "Subsidy / Grant"]
  },
  "Side Income": {
    icon: "fa-star", color: "#f59e0b",
    subcategories: ["Part-Time Job", "Online Selling (Amazon / eBay)", "YouTube / Content Creation", "Blog / Affiliate Marketing", "Tuition / Teaching", "Rental of Assets", "Reselling / Trading"]
  },
  "Windfalls & One-Time": {
    icon: "fa-coins", color: "#ec4899",
    subcategories: ["Inheritance / Estate", "Gift Received (Cash)", "Property Sale Proceeds", "Lottery / Contest Prize", "Insurance Claim Received", "Sale of Old Items / Assets"]
  },
  "Other Income": {
    icon: "fa-plus-circle", color: "#9ca3af",
    subcategories: ["Cashback / Rewards", "Reimbursements", "Tips / Gratuity", "Other Income"]
  }
};

const PAYMENT_METHODS = [
  "Cash", "Debit Card", "Credit Card", "UPI / Mobile Payment", "Net Banking", "Bank Transfer", "Cheque", "Wallet (Paytm/PhonePe/GPay)", "EMI", "Crypto", "Other"
];

const CURRENCIES = [
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "AED", symbol: "AED", name: "UAE Dirham" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
];
