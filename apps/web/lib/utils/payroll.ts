/**
 * Egyptian payroll tax engine — Law 91/2005 with amendments.
 * All amounts in EGP. Input gross/insurable are monthly.
 */

const ANNUAL_BRACKETS: { upTo: number; rate: number }[] = [
  { upTo: 15_000,   rate: 0     },
  { upTo: 30_000,   rate: 0.025 },
  { upTo: 45_000,   rate: 0.10  },
  { upTo: 60_000,   rate: 0.15  },
  { upTo: 200_000,  rate: 0.20  },
  { upTo: 400_000,  rate: 0.225 },
  { upTo: Infinity, rate: 0.25  },
];

const PERSONAL_EXEMPTION_ANNUAL = 15_000;
export const SI_WAGE_CEILING = 11_800;
export const SI_EMPLOYEE_RATE = 0.11;

export function calcAnnualTax(annualGross: number): number {
  const taxable = Math.max(0, annualGross - PERSONAL_EXEMPTION_ANNUAL);
  let remaining = taxable;
  let tax = 0;
  let prev = 0;
  for (const { upTo, rate } of ANNUAL_BRACKETS) {
    const slice = Math.min(remaining, upTo - prev);
    if (slice <= 0) break;
    tax += slice * rate;
    remaining -= slice;
    prev = upTo;
    if (remaining <= 0) break;
  }
  return Math.round(tax * 100) / 100;
}

export function calcMonthlyTax(monthlyGross: number): number {
  return Math.round((calcAnnualTax(monthlyGross * 12) / 12) * 100) / 100;
}

export function calcSocialInsurance(insurableSalary: number): number {
  const capped = Math.min(insurableSalary, SI_WAGE_CEILING);
  return Math.round(capped * SI_EMPLOYEE_RATE * 100) / 100;
}
