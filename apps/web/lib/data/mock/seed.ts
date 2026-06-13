/**
 * Mock seed data — mirrors the sample data of the approved demo
 * (demo/afrohrhub-demo.html). Replaced by Supabase queries later.
 */
import type {
  DocumentType,
  Employee,
  EmployeeCompensation,
  EmployeeDocument,
  EmployeeEvent,
  Grade,
  HseRecord,
  JobTitle,
  Project,
  ProjectAllocation,
  Tenant,
  WorkLocation,
} from "../types";

/** Frozen "today" so demo numbers (days-to-expiry etc.) stay stable. */
export const DEMO_TODAY = "2026-06-12";

export const MOCK_TENANT: Tenant = {
  id: "tn-afro",
  name_ar: "أفرو إيجيبت للمقاولات",
  name_en: "Afro Egypt Contracting",
  slug: "afro-egypt",
  plan: "enterprise",
  status: "active",
};

const base = (id: string) => ({
  id,
  tenant_id: MOCK_TENANT.id,
  created_at: "2024-01-01T08:00:00Z",
  updated_at: "2026-06-01T08:00:00Z",
  archived_at: null,
});

/* ------------------------------ Structure ------------------------------ */

export const GRADES: Grade[] = [
  { ...base("g-e2"), code: "E2" },
  { ...base("g-e3"), code: "E3" },
  { ...base("g-t2"), code: "T2" },
  { ...base("g-a2"), code: "A2" },
  { ...base("g-m1"), code: "M1" },
];

export const JOB_TITLES: JobTitle[] = [
  {
    ...base("jt-civil"),
    name_ar: "مهندس موقع مدني",
    name_en: "Civil Site Engineer",
    grade_id: "g-e3",
  },
  {
    ...base("jt-welder"),
    name_ar: "لحّام أرجون",
    name_en: "Argon Welder",
    grade_id: "g-t2",
  },
  {
    ...base("jt-pmo"),
    name_ar: "مهندسة تخطيط PMO",
    name_en: "PMO Planning Engineer",
    grade_id: "g-e3",
  },
  {
    ...base("jt-rigger"),
    name_ar: "ريجر CM/PM",
    name_en: "CM/PM Rigger",
    grade_id: "g-t2",
  },
  {
    ...base("jt-acct"),
    name_ar: "محاسب موقع",
    name_en: "Site Accountant",
    grade_id: "g-a2",
  },
  {
    ...base("jt-elec"),
    name_ar: "فني تركيبات كهربائية",
    name_en: "Electrical Installer",
    grade_id: "g-t2",
  },
  {
    ...base("jt-pm"),
    name_ar: "مدير مشروع",
    name_en: "Project Manager",
    grade_id: "g-m1",
  },
];

export const WORK_LOCATIONS: WorkLocation[] = [
  {
    ...base("loc-benban"),
    name_ar: "موقع بنبان — أسوان",
    name_en: "Benban site — Aswan",
    type: "site",
  },
  {
    ...base("loc-cairo"),
    name_ar: "القاهرة الجديدة",
    name_en: "New Cairo",
    type: "office",
  },
  {
    ...base("loc-alamein"),
    name_ar: "موقع العلمين",
    name_en: "Alamein site",
    type: "site",
  },
  {
    ...base("loc-assiut"),
    name_ar: "موقع أسيوط",
    name_en: "Assiut site",
    type: "site",
  },
  {
    ...base("loc-sokhna"),
    name_ar: "موقع العين السخنة",
    name_en: "Ain Sokhna site",
    type: "site",
  },
];

export const PROJECTS: Project[] = [
  {
    ...base("prj-benban"),
    code: "PRJ-014",
    name_ar: "محطة محولات بنبان 500 ك.ف",
    name_en: "Benban 500kV Substation",
    status: "active",
    project_manager_id: "emp-007",
    location_id: "loc-benban",
  },
  {
    ...base("prj-alamein"),
    code: "PRJ-009",
    name_ar: "أبراج العلمين الجديدة",
    name_en: "New Alamein Towers",
    status: "active",
    project_manager_id: null,
    location_id: "loc-alamein",
  },
  {
    ...base("prj-assiut"),
    code: "PRJ-021",
    name_ar: "كوبري النيل — أسيوط",
    name_en: "Nile Bridge — Assiut",
    status: "active",
    project_manager_id: null,
    location_id: "loc-assiut",
  },
  {
    ...base("prj-sokhna"),
    code: "PRJ-017",
    name_ar: "مصنع أسمنت العين السخنة",
    name_en: "Ain Sokhna Cement Plant",
    status: "active",
    project_manager_id: null,
    location_id: "loc-sokhna",
  },
  {
    ...base("prj-hq"),
    code: "HQ-001",
    name_ar: "المكتب الرئيسي — القاهرة",
    name_en: "Head Office — Cairo",
    status: "active",
    project_manager_id: null,
    location_id: "loc-cairo",
  },
];

/* ------------------------------ Employees ------------------------------ */

const employeeDefaults = {
  personal_email: null,
  work_email: null,
  photo_path: null,
  department_id: null,
  employment_type: "permanent" as const,
  contract_signing_date: null,
  social_insurance_number: null,
  insurance_office: null,
  is_rehire: false,
  requires_medical_exam: false,
  safety_sensitive_role: false,
};

export const EMPLOYEES: Employee[] = [
  {
    ...base("emp-001"),
    ...employeeDefaults,
    hr_code: "AFR-2024-0312",
    name_ar: "أحمد عبد الحليم سعد",
    name_en: "Ahmed Abdel Halim Saad",
    national_id: "29803011234567",
    mobile: "0100 234 5678",
    work_email: "a.abdelhalim@afroegypt.com",
    job_title_id: "jt-civil",
    grade_id: "g-e3",
    direct_manager_id: "emp-007",
    collar: "white",
    hire_date: "2024-03-10",
    contract_signing_date: "2024-03-10",
    status: "active",
    social_insurance_number: "1198xxxx21",
    insurance_office: "Nasr City",
  },
  {
    ...base("emp-002"),
    ...employeeDefaults,
    hr_code: "AFR-2023-0871",
    name_ar: "محمود سيد النجار",
    name_en: "Mahmoud Sayed El-Naggar",
    national_id: "29107151234568",
    mobile: "0106 551 0934",
    job_title_id: "jt-welder",
    grade_id: "g-t2",
    direct_manager_id: "emp-007",
    collar: "blue",
    hire_date: "2023-07-15",
    contract_signing_date: "2023-07-15",
    status: "active",
    safety_sensitive_role: true,
  },
  {
    ...base("emp-003"),
    ...employeeDefaults,
    hr_code: "AFR-2025-0044",
    name_ar: "سارة عادل توفيق",
    name_en: "Sara Adel Tawfik",
    national_id: "29605201234569",
    mobile: "0111 880 4521",
    work_email: "s.adel@afroegypt.com",
    job_title_id: "jt-pmo",
    grade_id: "g-e3",
    direct_manager_id: null,
    collar: "white",
    hire_date: "2025-01-05",
    contract_signing_date: "2025-01-05",
    status: "active",
  },
  {
    ...base("emp-004"),
    ...employeeDefaults,
    hr_code: "AFR-2026-0119",
    name_ar: "أحمد رجب عطية",
    name_en: "Ahmed Ragab Attia",
    national_id: "29401121234570",
    mobile: "0109 887 2231",
    job_title_id: "jt-rigger",
    grade_id: "g-t2",
    direct_manager_id: null,
    collar: "blue",
    hire_date: "2026-06-01",
    contract_signing_date: "2026-06-01",
    status: "pending",
    social_insurance_number: "1311xxxx08",
    requires_medical_exam: true,
    safety_sensitive_role: true,
  },
  {
    ...base("emp-005"),
    ...employeeDefaults,
    hr_code: "AFR-2021-0233",
    name_ar: "خالد منصور إبراهيم",
    name_en: "Khaled Mansour Ibrahim",
    national_id: "28909301234571",
    mobile: "0122 304 7785",
    work_email: "k.mansour@afroegypt.com",
    job_title_id: "jt-acct",
    grade_id: "g-a2",
    direct_manager_id: null,
    collar: "white",
    hire_date: "2021-04-01",
    contract_signing_date: "2021-04-01",
    status: "offboarding",
  },
  {
    ...base("emp-006"),
    ...employeeDefaults,
    hr_code: "AFR-2022-0540",
    name_ar: "كريم فوزي الشناوي",
    name_en: "Karim Fawzy El-Shenawy",
    national_id: "29311201234572",
    mobile: "0101 442 9087",
    job_title_id: "jt-elec",
    grade_id: "g-t2",
    direct_manager_id: "emp-007",
    collar: "blue",
    hire_date: "2022-11-20",
    contract_signing_date: "2022-11-20",
    status: "active",
    safety_sensitive_role: true,
  },
  {
    ...base("emp-007"),
    ...employeeDefaults,
    hr_code: "AFR-2019-0051",
    name_ar: "وليد الجندي",
    name_en: "Walid El-Gendy",
    national_id: "28204101234573",
    mobile: "0100 778 3412",
    work_email: "w.elgendy@afroegypt.com",
    job_title_id: "jt-pm",
    grade_id: "g-m1",
    direct_manager_id: null,
    collar: "white",
    hire_date: "2019-09-01",
    contract_signing_date: "2019-09-01",
    status: "active",
  },
];

/** Mock-only: document applicability category per employee. */
export const EMPLOYEE_CATEGORY: Record<
  string,
  "engineer" | "technician" | "other"
> = {
  "emp-001": "engineer",
  "emp-002": "technician",
  "emp-003": "engineer",
  "emp-004": "technician",
  "emp-005": "other",
  "emp-006": "technician",
  "emp-007": "engineer",
};

/** Mock-only: offboarding metadata (lives on offboarding_cases later). */
export const LAST_WORKING_DAYS: Record<string, string> = {
  "emp-005": "2026-06-19",
};

export const ASSETS_TO_RETURN: Record<string, number> = {
  "emp-005": 3,
};

/* ----------------------------- Allocations ----------------------------- */

const allocationDefaults = { end_date: null };

export const ALLOCATIONS: ProjectAllocation[] = [
  {
    ...base("al-001a"),
    ...allocationDefaults,
    employee_id: "emp-001",
    project_id: "prj-benban",
    allocation_pct: 80,
    work_location_id: "loc-benban",
    start_date: "2026-01-15",
  },
  {
    ...base("al-001b"),
    ...allocationDefaults,
    employee_id: "emp-001",
    project_id: "prj-hq",
    allocation_pct: 20,
    work_location_id: "loc-cairo",
    start_date: "2026-01-15",
  },
  {
    ...base("al-002"),
    ...allocationDefaults,
    employee_id: "emp-002",
    project_id: "prj-sokhna",
    allocation_pct: 100,
    work_location_id: "loc-sokhna",
    start_date: "2023-07-15",
  },
  {
    ...base("al-003"),
    ...allocationDefaults,
    employee_id: "emp-003",
    project_id: "prj-hq",
    allocation_pct: 100,
    work_location_id: "loc-cairo",
    start_date: "2025-01-05",
  },
  {
    ...base("al-004"),
    ...allocationDefaults,
    employee_id: "emp-004",
    project_id: "prj-alamein",
    allocation_pct: 100,
    work_location_id: "loc-alamein",
    start_date: "2026-06-01",
  },
  {
    ...base("al-005"),
    ...allocationDefaults,
    employee_id: "emp-005",
    project_id: "prj-assiut",
    allocation_pct: 100,
    work_location_id: "loc-assiut",
    start_date: "2021-04-01",
  },
  {
    ...base("al-006"),
    ...allocationDefaults,
    employee_id: "emp-006",
    project_id: "prj-benban",
    allocation_pct: 100,
    work_location_id: "loc-benban",
    start_date: "2022-11-20",
  },
  {
    ...base("al-007"),
    ...allocationDefaults,
    employee_id: "emp-007",
    project_id: "prj-benban",
    allocation_pct: 100,
    work_location_id: "loc-benban",
    start_date: "2019-09-01",
  },
];

/* ---------------------------- Compensation ----------------------------- */

const compDefaults = {
  payment_method: "bank_transfer" as const,
  bank_verified_by: "user-payroll",
};

export const COMPENSATIONS: EmployeeCompensation[] = [
  {
    ...base("comp-001"),
    ...compDefaults,
    employee_id: "emp-001",
    net_salary: 28500,
    gross_salary: 36200,
    insurable_salary: 12600,
    allowances: { site: 4000, transport: 1400, meal: 1000 },
    bank_name: "CIB",
    bank_account: "•••• 4471",
    bank_verified: true,
    bank_verified_at: "2024-03-11",
  },
  {
    ...base("comp-002"),
    ...compDefaults,
    employee_id: "emp-002",
    net_salary: 14200,
    gross_salary: 17800,
    insurable_salary: 9000,
    allowances: { site: 1500 },
    bank_name: "Banque Misr",
    bank_account: "•••• 8203",
    bank_verified: true,
    bank_verified_at: "2023-07-20",
  },
  {
    ...base("comp-003"),
    ...compDefaults,
    employee_id: "emp-003",
    net_salary: 31000,
    gross_salary: 39400,
    insurable_salary: 12600,
    allowances: { transport: 1200 },
    bank_name: "CIB",
    bank_account: "•••• 1190",
    bank_verified: true,
    bank_verified_at: "2025-01-08",
  },
  {
    ...base("comp-004"),
    ...compDefaults,
    employee_id: "emp-004",
    net_salary: 12000,
    gross_salary: 14600,
    insurable_salary: 8400,
    allowances: { site: 1200 },
    bank_name: null,
    bank_account: null,
    bank_verified: false,
    bank_verified_by: null,
    bank_verified_at: null,
  },
  {
    ...base("comp-005"),
    ...compDefaults,
    employee_id: "emp-005",
    net_salary: 17500,
    gross_salary: 21800,
    insurable_salary: 10200,
    allowances: { site: 2000 },
    bank_name: "NBE",
    bank_account: "•••• 6644",
    bank_verified: true,
    bank_verified_at: "2021-04-05",
  },
  {
    ...base("comp-006"),
    ...compDefaults,
    employee_id: "emp-006",
    net_salary: 11800,
    gross_salary: 14200,
    insurable_salary: 8400,
    allowances: { site: 1200 },
    bank_name: "Banque Misr",
    bank_account: "•••• 3327",
    bank_verified: true,
    bank_verified_at: "2022-11-25",
  },
  {
    ...base("comp-007"),
    ...compDefaults,
    employee_id: "emp-007",
    net_salary: 39600,
    gross_salary: 52000,
    insurable_salary: 12600,
    allowances: { transport: 2000 },
    bank_name: "NBE",
    bank_account: "•••• 2210",
    bank_verified: true,
    bank_verified_at: "2019-09-05",
  },
];

/* ------------------------- Document checklist --------------------------- */

/**
 * The manual's 12 mandatory documents (docs/02 §document_types) + the
 * signed contract / handbook acknowledgment as item 13 (tenant custom).
 */
export const DOCUMENT_TYPES: DocumentType[] = [
  {
    ...base("dt-birth"),
    name_ar: "شهادة ميلاد كمبيوتر (أصل)",
    name_en: "Computerized birth certificate (original)",
    applies_to: "all",
    is_original: true,
    requires_expiry: false,
    sort_order: 1,
  },
  {
    ...base("dt-qualification"),
    name_ar: "شهادة المؤهل (أصل)",
    name_en: "Academic qualification certificate (original)",
    applies_to: "all",
    is_original: true,
    requires_expiry: false,
    sort_order: 2,
  },
  {
    ...base("dt-military"),
    name_ar: "شهادة الخدمة العسكرية (أصل)",
    name_en: "Military service certificate (original)",
    applies_to: "all",
    is_original: true,
    requires_expiry: false,
    sort_order: 3,
  },
  {
    ...base("dt-si-form6"),
    name_ar: "نموذج 6 تأمينات أو برنت رسمي",
    name_en: "Form 6 / official social insurance printout",
    applies_to: "all",
    is_original: false,
    requires_expiry: false,
    sort_order: 4,
  },
  {
    ...base("dt-kaab"),
    name_ar: "كعب العمل",
    name_en: "Employment card (Kaab Amal)",
    applies_to: "all",
    is_original: false,
    requires_expiry: false,
    sort_order: 5,
  },
  {
    ...base("dt-criminal"),
    name_ar: "فيش جنائي باسم الشركة",
    name_en: "Criminal record certificate (company name)",
    applies_to: "all",
    is_original: false,
    requires_expiry: true,
    sort_order: 6,
  },
  {
    ...base("dt-photos"),
    name_ar: "ست صور شخصية",
    name_en: "Six personal photos",
    applies_to: "all",
    is_original: false,
    requires_expiry: false,
    sort_order: 7,
  },
  {
    ...base("dt-nid"),
    name_ar: "صورتا بطاقة الرقم القومي السارية",
    name_en: "Two copies of valid National ID",
    applies_to: "all",
    is_original: false,
    requires_expiry: true,
    sort_order: 8,
  },
  {
    ...base("dt-medical"),
    name_ar: "تقرير الفحص الطبي — نموذج 111",
    name_en: "Medical exam report — Form 111",
    applies_to: "all",
    is_original: false,
    requires_expiry: true,
    sort_order: 9,
  },
  {
    ...base("dt-syndicate"),
    name_ar: "صورتا كارنيه نقابة المهندسين",
    name_en: "Engineers Syndicate card (two copies)",
    applies_to: "engineers",
    is_original: false,
    requires_expiry: true,
    sort_order: 10,
  },
  {
    ...base("dt-skill"),
    name_ar: "شهادة قياس مستوى مهارة",
    name_en: "Skill level certificate",
    applies_to: "technicians",
    is_original: false,
    requires_expiry: false,
    sort_order: 11,
  },
  {
    ...base("dt-license"),
    name_ar: "ترخيص مزاولة المهنة",
    name_en: "Professional practice license",
    applies_to: "technicians",
    is_original: false,
    requires_expiry: true,
    sort_order: 12,
  },
  {
    ...base("dt-contract"),
    name_ar: "العقد الموقّع + إقرار لائحة العمل",
    name_en: "Signed contract + Handbook acknowledgment",
    applies_to: "all",
    is_original: false,
    requires_expiry: false,
    sort_order: 13,
  },
];

type DocOverride = Partial<
  Pick<
    EmployeeDocument,
    | "status"
    | "expiry_date"
    | "original_received"
    | "received_at"
    | "note_ar"
    | "note_en"
  >
>;

function buildDocs(
  employeeId: string,
  defaults: DocOverride,
  overrides: Record<string, DocOverride | null>
): EmployeeDocument[] {
  const category = EMPLOYEE_CATEGORY[employeeId] ?? "other";
  return DOCUMENT_TYPES.filter((dt) => {
    if (dt.applies_to === "all") return true;
    if (dt.applies_to === "engineers") return category === "engineer";
    return category === "technician";
  }).map((dt) => {
    const override = overrides[dt.id];
    return {
      ...base(`doc-${employeeId}-${dt.id}`),
      employee_id: employeeId,
      document_type_id: dt.id,
      file_path:
        override?.status === "required"
          ? null
          : `${MOCK_TENANT.id}/${employeeId}/${dt.id}.pdf`,
      status: "verified",
      expiry_date: null,
      original_received: dt.is_original,
      received_by: "user-personnel",
      received_at: defaults.received_at ?? null,
      original_returned_at: null,
      ...defaults,
      ...(override ?? {}),
    };
  });
}

export const EMPLOYEE_DOCUMENTS: EmployeeDocument[] = [
  ...buildDocs(
    "emp-001",
    { received_at: "2024-03-12" },
    {
      "dt-birth": {
        note_ar: "استلمتها هبة سمير 12/03/2024",
        note_en: "Received by Heba Samir 12/03/2024",
      },
      "dt-qualification": {
        note_ar: "بكالوريوس هندسة مدنية — تم التحقق",
        note_en: "BSc Civil Engineering — verified",
      },
      "dt-criminal": {
        status: "received",
        expiry_date: "2026-06-30",
        note_ar: "تنبيهات 60/30/7 مفعّلة",
        note_en: "60/30/7 alerts armed",
      },
      "dt-nid": {
        expiry_date: "2030-05-01",
        note_ar: "OCR ✓ مطابقة",
        note_en: "OCR ✓ match",
      },
      "dt-medical": {
        expiry_date: "2027-03-01",
        note_ar: "لائق — يُجدد 03/2027",
        note_en: "Fit — renew 03/2027",
      },
      "dt-syndicate": {
        expiry_date: "2026-12-31",
        note_ar: "عضوية 2024 ✓",
        note_en: "2024 membership ✓",
      },
      "dt-contract": {
        note_ar: "وُقّع 10/03/2024",
        note_en: "Signed 10/03/2024",
      },
    }
  ),
  ...buildDocs(
    "emp-002",
    { received_at: "2023-07-18" },
    {
      "dt-license": {
        status: "received",
        expiry_date: "2026-07-10",
        note_ar: "تجديد الترخيص قيد الإجراء",
        note_en: "License renewal in progress",
      },
      "dt-skill": {
        note_ar: "لحام أرجون — درجة أولى",
        note_en: "Argon welding — first class",
      },
      "dt-medical": { expiry_date: "2026-10-01" },
      "dt-nid": { expiry_date: "2029-02-01" },
      "dt-criminal": { expiry_date: "2026-11-15" },
    }
  ),
  ...buildDocs(
    "emp-003",
    { received_at: "2025-01-07" },
    {
      "dt-nid": { expiry_date: "2031-08-01" },
      "dt-criminal": { expiry_date: "2027-01-05" },
      "dt-medical": { expiry_date: "2027-06-01" },
      "dt-syndicate": { expiry_date: "2026-12-31" },
    }
  ),
  ...buildDocs(
    "emp-004",
    { received_at: "2026-06-03" },
    {
      // 9 of 12 applicable received — pending onboarding (demo case).
      "dt-criminal": { status: "required" },
      "dt-photos": { status: "required" },
      "dt-si-form6": { status: "required" },
      "dt-medical": {
        expiry_date: "2028-06-01",
        note_ar: "لائق — نموذج 111 مرفوع 05/06",
        note_en: "Fit — Form 111 uploaded 05/06",
      },
      "dt-nid": { expiry_date: "2030-01-01" },
    }
  ),
  ...buildDocs(
    "emp-005",
    { received_at: "2021-04-03" },
    {
      "dt-nid": { expiry_date: "2028-09-01" },
      "dt-criminal": { expiry_date: "2026-12-01" },
      "dt-medical": { expiry_date: "2027-04-01" },
    }
  ),
  ...buildDocs(
    "emp-006",
    { received_at: "2022-11-22" },
    {
      "dt-criminal": {
        status: "received",
        expiry_date: "2026-06-19",
        note_ar: "مطلوب فيش جديد باسم الشركة",
        note_en: "New certificate in company name required",
      },
      "dt-nid": { expiry_date: "2029-06-01" },
      "dt-medical": { expiry_date: "2026-12-01" },
      "dt-license": { expiry_date: "2027-02-01" },
    }
  ),
  ...buildDocs(
    "emp-007",
    { received_at: "2019-09-03" },
    {
      "dt-nid": { expiry_date: "2030-03-01" },
      "dt-criminal": { expiry_date: "2027-03-01" },
      "dt-medical": { expiry_date: "2027-09-01" },
      "dt-syndicate": { expiry_date: "2026-12-31" },
    }
  ),
];

/* ------------------------------ Timeline ------------------------------- */

const eventDefaults = { attachment_path: null, approval_request_id: null };

export const EMPLOYEE_EVENTS: EmployeeEvent[] = [
  {
    ...base("ev-001-5"),
    ...eventDefaults,
    employee_id: "emp-001",
    event_type: "promotion",
    effective_date: "2026-05-01",
    attachment_path: "tn-afro/emp-001/promotion-letter.pdf",
    approval_request_id: "apr-2210",
    payload: {
      title_ar: "ترقية إلى الدرجة E3 + علاوة استثنائية",
      title_en: "Promotion to Grade E3 + merit raise",
      note_ar: "اعتماد: مدير الموارد البشرية ← مدير المشروع · مرفق: خطاب الترقية",
      note_en:
        "Approved: HR Manager ← Project Manager · Attachment: promotion letter",
    },
  },
  {
    ...base("ev-001-4"),
    ...eventDefaults,
    employee_id: "emp-001",
    event_type: "transfer",
    effective_date: "2026-01-15",
    approval_request_id: "apr-1984",
    payload: {
      title_ar: "نقل جزئي إلى المكتب الرئيسي — توزيع التكلفة أصبح 80/20",
      title_en: "Partial transfer to Head Office — cost allocation now 80/20",
      note_ar: "بطلب من PMO · اعتماد مكتمل",
      note_en: "Requested by PMO · fully approved",
    },
  },
  {
    ...base("ev-001-3"),
    ...eventDefaults,
    employee_id: "emp-001",
    event_type: "contract_renewal",
    effective_date: "2025-03-01",
    payload: {
      title_ar: "تجديد العقد السنوي",
      title_en: "Annual contract renewal",
      note_ar: "وُقّع إلكترونياً",
      note_en: "Signed electronically",
    },
  },
  {
    ...base("ev-001-2"),
    ...eventDefaults,
    employee_id: "emp-001",
    event_type: "penalty",
    effective_date: "2024-08-22",
    payload: {
      title_ar: "إنذار شفهي — تكرار التأخير (مغلق)",
      title_en: "Verbal warning — repeated lateness (closed)",
      note_ar: "المدير المباشر · أُغلق بعد شهر من الالتزام",
      note_en: "Direct manager · resolved after a month of compliance",
    },
  },
  {
    ...base("ev-001-1"),
    ...eventDefaults,
    employee_id: "emp-001",
    event_type: "hire",
    effective_date: "2024-03-10",
    payload: {
      title_ar: "التعيين — مهندس موقع مدني",
      title_en: "Hired — Civil Site Engineer",
      note_ar: "اكتمل الـ Onboarding في 9 أيام عمل (P0 ✓ ضمن الـ SLA)",
      note_en: "Onboarding completed in 9 working days (P0 ✓ within SLA)",
    },
  },
  {
    ...base("ev-005-2"),
    ...eventDefaults,
    employee_id: "emp-005",
    event_type: "status_change",
    effective_date: "2026-06-05",
    payload: {
      title_ar: "فتح حالة إنهاء خدمة — استقالة عبر بوابة الموظف",
      title_en: "Offboarding case opened — resignation via ESS",
      note_ar: "آخر يوم عمل 19/06/2026 · مهمة قطع الـ Access مجدولة",
      note_en: "Last working day 19/06/2026 · access-cutoff task scheduled",
    },
  },
  {
    ...base("ev-005-1"),
    ...eventDefaults,
    employee_id: "emp-005",
    event_type: "hire",
    effective_date: "2021-04-01",
    payload: {
      title_ar: "التعيين — محاسب موقع",
      title_en: "Hired — Site Accountant",
    },
  },
  {
    ...base("ev-002-1"),
    ...eventDefaults,
    employee_id: "emp-002",
    event_type: "hire",
    effective_date: "2023-07-15",
    payload: {
      title_ar: "التعيين — لحّام أرجون",
      title_en: "Hired — Argon Welder",
    },
  },
  {
    ...base("ev-003-1"),
    ...eventDefaults,
    employee_id: "emp-003",
    event_type: "hire",
    effective_date: "2025-01-05",
    payload: {
      title_ar: "التعيين — مهندسة تخطيط PMO",
      title_en: "Hired — PMO Planning Engineer",
    },
  },
  {
    ...base("ev-004-1"),
    ...eventDefaults,
    employee_id: "emp-004",
    event_type: "hire",
    effective_date: "2026-06-01",
    payload: {
      title_ar: "بدء حالة Onboarding — أولوية P0",
      title_en: "Onboarding case started — priority P0",
      note_ar: "المرحلة 7 من 9 — متطلبات الـ HSE",
      note_en: "Stage 7 of 9 — HSE requirements",
    },
  },
  {
    ...base("ev-006-1"),
    ...eventDefaults,
    employee_id: "emp-006",
    event_type: "hire",
    effective_date: "2022-11-20",
    payload: {
      title_ar: "التعيين — فني تركيبات كهربائية",
      title_en: "Hired — Electrical Installer",
    },
  },
];

/* ------------------------------ HSE records ----------------------------- */

const hseDefaults = { certificate_path: null };

export const HSE_RECORDS: HseRecord[] = [
  {
    ...base("hse-001-1"),
    ...hseDefaults,
    employee_id: "emp-001",
    type: "medical_exam",
    course_key: null,
    name_ar: "الفحص الطبي (نموذج 111)",
    name_en: "Medical exam (Form 111)",
    result: "fit",
    issued_at: "2024-03-05",
    expiry_date: "2027-03-01",
  },
  {
    ...base("hse-001-2"),
    ...hseDefaults,
    employee_id: "emp-001",
    type: "safety_course",
    course_key: "course_firefighting",
    name_ar: "مكافحة الحريق",
    name_en: "Fire Fighting",
    result: "pass",
    issued_at: "2024-09-10",
    expiry_date: "2026-09-01",
  },
  {
    ...base("hse-001-3"),
    ...hseDefaults,
    employee_id: "emp-001",
    type: "safety_course",
    course_key: "course_first_aid",
    name_ar: "الإسعافات الأولية",
    name_en: "First Aid",
    result: "pass",
    issued_at: "2025-03-15",
    expiry_date: "2027-03-01",
  },
  {
    ...base("hse-001-4"),
    ...hseDefaults,
    employee_id: "emp-001",
    type: "safety_course",
    course_key: "course_risk_assessment",
    name_ar: "تقييم المخاطر",
    name_en: "Risk Assessment",
    result: "pass",
    issued_at: "2025-01-10",
    expiry_date: "2027-01-10",
  },
  {
    ...base("hse-001-5"),
    ...hseDefaults,
    employee_id: "emp-001",
    type: "safety_course",
    course_key: "course_heights",
    name_ar: "العمل على ارتفاعات",
    name_en: "Working at Heights",
    result: "pass",
    issued_at: "2024-07-20",
    expiry_date: "2026-07-20",
  },
  {
    ...base("hse-004-1"),
    ...hseDefaults,
    employee_id: "emp-004",
    type: "medical_exam",
    course_key: null,
    name_ar: "الفحص الطبي (نموذج 111) — إلزامي للريجر",
    name_en: "Medical exam (Form 111) — mandatory for riggers",
    result: "fit",
    issued_at: "2026-06-05",
    expiry_date: "2028-06-01",
  },
  {
    ...base("hse-004-2"),
    ...hseDefaults,
    employee_id: "emp-004",
    type: "safety_course",
    course_key: "course_firefighting",
    name_ar: "مكافحة الحريق",
    name_en: "Fire Fighting",
    result: "pass",
    issued_at: "2026-06-07",
    expiry_date: "2028-06-07",
  },
  {
    ...base("hse-004-3"),
    ...hseDefaults,
    employee_id: "emp-004",
    type: "safety_course",
    course_key: "course_first_aid",
    name_ar: "الإسعافات الأولية",
    name_en: "First Aid",
    result: "pass",
    issued_at: "2026-06-08",
    expiry_date: "2028-06-08",
  },
];
