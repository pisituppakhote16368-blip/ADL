export type VillageId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface VillageInfo {
  id: VillageId;
  villageNumber: number;
  name: string;
  fullName: string;
  subdistrict: string;
  district: string;
  province: string;
  healthCenter: string;
  volunteerLeader: string;
}

export type ADLCategory = 'social' | 'homebound' | 'bedridden';

export interface ADLCategoryInfo {
  category: ADLCategory;
  title: string;
  subtitle: string;
  scoreRange: string;
  minScore: number;
  maxScore: number;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  careGuidelines: string;
}

export type LTCGroup = 1 | 2 | 3 | 4;

export interface LTCGroupInfo {
  group: LTCGroup;
  title: string;
  condition: string;
  careFrequency: string;
  carePlanSummary: string;
}

export interface ADLItemOption {
  score: number;
  label: string;
  description: string;
}

export interface ADLItemDefinition {
  id: string;
  key: keyof ADLAnswers;
  number: number;
  title: string;
  subtitle: string;
  maxScore: number;
  options: ADLItemOption[];
}

export interface ADLAnswers {
  feeding: number;     // 0, 1, 2
  grooming: number;    // 0, 1
  transfer: number;    // 0, 1, 2, 3
  toilet: number;      // 0, 1, 2
  mobility: number;    // 0, 1, 2, 3
  dressing: number;    // 0, 1, 2
  stairs: number;      // 0, 1, 2
  bathing: number;     // 0, 1
  bowels: number;      // 0, 1, 2
  bladder: number;     // 0, 1, 2
}

export interface ADLAssessment {
  id: string;
  assessmentDate: string; // YYYY-MM-DD
  assessmentRound: number; // ครั้งที่ 1, 2, 3 ...
  evaluatorName: string;
  evaluatorRole: string; // 'อสม.', 'ผู้ดูแล (CG)', 'Care Manager (CM)', 'พยาบาลวิชาชีพ', 'นักกายภาพบำบัด'
  evaluatorAgency: string; // รพ.สต. หรือ ศูนย์บริการสาธารณสุข
  answers: ADLAnswers;
  totalScore: number;
  category: ADLCategory;
  ltcGroup: LTCGroup;
  clinicalNotes: string;
  suggestedEquipments: string[];
}

export interface CaregiverInfo {
  name: string;
  relationship: string;
  phone: string;
  lineId?: string;
  isMainCaregiver: boolean;
}

export interface SpecialConditions {
  hasBedsores: boolean;        // แผลกดทับ
  bedsoresStage?: string;     // ระดับ 1-4
  hasFoleyCatheter: boolean;   // สายสวนปัสสาวะ
  hasNGTube: boolean;          // สายให้อาหารทางจมูก
  hasTracheostomy: boolean;    // ท่อเจาะคอ
  cognitiveImpairment: 'none' | 'mild' | 'moderate' | 'severe'; // ภาวะสมองเสื่อม
  visualImpairment: boolean;   // ตาบอด/มองไม่เห็น
  hearingImpairment: boolean;  // หูตึง/ไม่ได้ยิน
  paralysisType: 'none' | 'hemiparesis' | 'hemiplegia' | 'paraplegia' | 'quadriplegia'; // อัมพฤกษ์/อัมพาต
}

export interface Patient {
  id: string;
  prefix: string; // นาย, นาง, นางสาว, ด.ช., ด.ญ.
  firstName: string;
  lastName: string;
  citizenId: string; // เลขประจำตัวประชาชน 13 หลัก
  birthDate: string; // YYYY-MM-DD
  age: number;
  gender: 'ชาย' | 'หญิง';
  phone: string;
  
  // ที่อยู่
  houseNumber: string;
  street: string;
  villageId: VillageId;
  villageName: string;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
  landmarks: string; // จุดสังเกต/ที่ตั้งบ้าน
  
  // ผู้ดูแล
  caregiver: CaregiverInfo;
  
  // สิทธิและสุขภาพ
  healthRights: string; // บัตรทอง (UC), ข้าราชการ/รัฐวิสาหกิจ, ประกันสังคม, จ่ายเอง
  chronicDiseases: string[];
  allergies?: string;
  specialConditions: SpecialConditions;
  
  // รูปถ่ายตามโจทย์
  idCardPhoto: string; // รูปถ่ายหน้าบัตรประชาชน (Base64)
  patientPhoto: string; // รูปถ่ายผู้ป่วย (Base64)
  
  // การประเมิน
  currentADL: ADLAssessment;
  assessmentHistory: ADLAssessment[];
  
  createdAt: string;
  updatedAt: string;
}
