import { ADLAnswers, ADLCategory, LTCGroup, SpecialConditions } from '../types';

/**
 * คำนวณคะแนนรวม Barthel ADL Index (เต็ม 20 คะแนน)
 */
export function calculateADLScore(answers: ADLAnswers): number {
  return (
    (answers.feeding || 0) +
    (answers.grooming || 0) +
    (answers.transfer || 0) +
    (answers.toilet || 0) +
    (answers.mobility || 0) +
    (answers.dressing || 0) +
    (answers.stairs || 0) +
    (answers.bathing || 0) +
    (answers.bowels || 0) +
    (answers.bladder || 0)
  );
}

/**
 * แปลผลคะแนน ADL ตามเกณฑ์กระทรวงสาธารณสุข
 * 12 - 20 คะแนน: ติดสังคม
 * 5 - 11 คะแนน: ติดบ้าน
 * 0 - 4 คะแนน: ติดเตียง
 */
export function getADLCategory(score: number): ADLCategory {
  if (score >= 12) return 'social';
  if (score >= 5) return 'homebound';
  return 'bedridden';
}

/**
 * จำแนกกลุ่มผู้สูงอายุที่มีภาวะพึ่งพิงตามเกณฑ์ LTC (กลุ่ม 1-4) ของ สปสช. / กรมอนามัย
 */
export function getLTCGroup(
  score: number,
  conditions?: Partial<SpecialConditions>,
  answers?: Partial<ADLAnswers>
): LTCGroup {
  const isBedridden = score <= 4;
  const hasSevereDisease =
    conditions?.hasTracheostomy ||
    conditions?.hasNGTube ||
    conditions?.hasBedsores ||
    conditions?.cognitiveImpairment === 'severe';

  if (isBedridden || hasSevereDisease) {
    return 4; // กลุ่ม 4: ติดเตียง หรือเจ็บป่วยรุนแรง / ระยะท้าย
  }

  const cannotWalkOrEat =
    (answers?.mobility ?? 3) === 0 || (answers?.feeding ?? 2) === 0;

  if (cannotWalkOrEat || score <= 8) {
    return 3; // กลุ่ม 3: เคลื่อนไหวไม่ได้ หรือกินข้าวเองไม่ได้
  }

  const hasCognitiveOrIncontinence =
    conditions?.cognitiveImpairment === 'mild' ||
    conditions?.cognitiveImpairment === 'moderate' ||
    (answers?.bowels ?? 2) < 2 ||
    (answers?.bladder ?? 2) < 2;

  if (hasCognitiveOrIncontinence || score <= 11) {
    return 2; // กลุ่ม 2: เคลื่อนไหวได้ กินข้าวได้ แต่มีสมองเสื่อมหรือกลั้นไม่ได้
  }

  return 1; // กลุ่ม 1: เคลื่อนไหวได้ กินข้าวได้ สมองไม่เสื่อม
}

/**
 * ตรวจสอบความถูกต้องของเลขบัตรประชาชน 13 หลักของไทย (Checksum modulo 11)
 */
export function validateCitizenId(id: string): { isValid: boolean; message?: string } {
  const cleanId = id.replace(/[^0-9]/g, '');
  if (cleanId.length !== 13) {
    return { isValid: false, message: 'เลขประจำตัวประชาชนต้องครบ 13 หลัก' };
  }

  // Check repeating digits like 0000000000000 or 1111111111111
  if (/^(\d)\1{12}$/.test(cleanId)) {
    return { isValid: false, message: 'เลขประจำตัวประชาชนไม่ถูกต้อง' };
  }

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanId[i], 10) * (13 - i);
  }
  const checkDigit = (11 - (sum % 11)) % 10;

  if (checkDigit !== parseInt(cleanId[12], 10)) {
    return { isValid: false, message: 'เลขบัตรประชาชนไม่ตรงตามสูตรการตรวจสอบ' };
  }

  return { isValid: true };
}

/**
 * ฟอร์แมตเลขประจำตัวประชาชนไทย x-xxxx-xxxxx-xx-x
 */
export function formatCitizenId(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 13);
  if (digits.length === 0) return '';
  if (digits.length <= 1) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 1)}-${digits.slice(1)}`;
  if (digits.length <= 10) return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5, 10)}-${digits.slice(10)}`;
  return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5, 10)}-${digits.slice(10, 12)}-${digits.slice(12, 13)}`;
}

/**
 * คำนวณอายุจากวันเดือนปีเกิด (YYYY-MM-DD)
 */
export function calculateAge(birthDateString: string): number {
  if (!birthDateString) return 0;
  const birth = new Date(birthDateString);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

/**
 * แปลงวันที่เป็นรูปแบบภาษาไทย พ.ศ. เช่น "15 ต.ค. 2569"
 */
export function formatThaiDate(dateString: string): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const months = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
    ];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear() + 543;
    return `${day} ${month} ${year}`;
  } catch {
    return dateString;
  }
}

/**
 * แนะนำอุปกรณ์และแผนกายภาพตามผลการประเมิน
 */
export function generateSuggestions(
  score: number,
  answers: ADLAnswers,
  conditions: Partial<SpecialConditions>
): string[] {
  const suggestions: string[] = [];

  if (score <= 4 || conditions.hasBedsores) {
    suggestions.push('ที่นอนลมป้องกันแผลกดทับ');
    suggestions.push('เตียงปรับระดับ (2-3 ไก)');
  }
  if (answers.mobility <= 1) {
    suggestions.push('รถเข็นวีลแชร์ (Wheelchair)');
  } else if (answers.mobility === 2) {
    suggestions.push('เครื่องช่วยเดิน (Walker หรือ ไม้เท้า 4 ขา)');
  }

  if (answers.toilet <= 1) {
    suggestions.push('เก้าอี้นั่งถ่าย / ราวจับกันลื่นในห้องน้ำ');
  }

  if (answers.bathing === 0) {
    suggestions.push('เก้าอี้อาบน้ำสำหรับผู้สูงอายุ');
  }

  if (answers.bladder === 0 || answers.bowels === 0) {
    suggestions.push('ผ้าอ้อมผู้ใหญ่สำเร็จรูป / แผ่นรองซับ');
  }

  if (conditions.hasNGTube) {
    suggestions.push('อาหารทางการแพทย์และสายให้อาหารทางสายยาง');
  }
  if (conditions.hasFoleyCatheter) {
    suggestions.push('ชุดสายสวนและถุงเก็บปัสสาวะสเตอร์ไรล์');
  }
  if (conditions.hasTracheostomy) {
    suggestions.push('เครื่องดูดเสมหะและสายดูดเสมหะ');
  }

  if (suggestions.length === 0) {
    suggestions.push('ส่งเสริมออกกำลังกาย ยืดเหยียดกล้ามเนื้อ');
    suggestions.push('ตรวจวัดความดันโลหิตและระดับน้ำตาลประจำเดือน');
  }

  return Array.from(new Set(suggestions));
}
