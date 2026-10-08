import { Patient } from '../types';
import { INITIAL_PATIENTS } from '../constants/villages';
import { db } from './firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  getDocs,
} from 'firebase/firestore';

const STORAGE_KEY = 'adl_patient_registry_v5';
const PATIENTS_COLLECTION = 'patients';

// Purge legacy mock data cache keys on load
if (typeof window !== 'undefined') {
  try {
    ['adl_patient_registry_v1', 'adl_patient_registry_v2', 'adl_patient_registry_v3', 'adl_patient_registry_v4'].forEach((k) => {
      localStorage.removeItem(k);
    });
  } catch {
    // Ignore storage errors in restricted contexts
  }
}

export const storageService = {
  /**
   * Get cached patients from localStorage
   */
  getPatients(): Patient[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return [];
      }
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return [];
    } catch (e) {
      console.error('Error reading patients from localStorage:', e);
      return [];
    }
  },

  /**
   * Save local cache
   */
  saveLocalCache(patients: Patient[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
    } catch (e) {
      console.error('Error saving local cache:', e);
    }
  },

  /**
   * Subscribe to real-time online updates from Cloud Firestore
   * Synchronizes data live across all users who have the link!
   */
  subscribeToPatients(
    onData: (patients: Patient[]) => void,
    onStatus?: (isOnline: boolean) => void
  ): () => void {
    const colRef = collection(db, PATIENTS_COLLECTION);

    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        onStatus?.(true);

        if (snapshot.empty) {
          // If Firestore is empty, do not seed mock patients automatically
          this.saveLocalCache([]);
          onData([]);
          return;
        }

        const items: Patient[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as Patient);
        });

        // Sort by updatedAt or createdAt desc
        items.sort(
          (a, b) =>
            new Date(b.updatedAt || b.createdAt).getTime() -
            new Date(a.updatedAt || a.createdAt).getTime()
        );

        this.saveLocalCache(items);
        onData(items);
      },
      (error) => {
        console.warn('Firestore real-time subscription error, using local cache:', error);
        onStatus?.(false);
        onData(this.getPatients());
      }
    );

    return unsubscribe;
  },

  /**
   * Save or Update patient to Cloud Firestore and local cache
   */
  async savePatient(patient: Patient): Promise<void> {
    const current = this.getPatients();
    const exists = current.some((p) => p.id === patient.id);
    const updated = exists
      ? current.map((p) => (p.id === patient.id ? patient : p))
      : [patient, ...current];
    this.saveLocalCache(updated);

    try {
      const docRef = doc(db, PATIENTS_COLLECTION, patient.id);
      await setDoc(docRef, patient, { merge: true });
    } catch (e) {
      console.error('Error saving patient to Firestore:', e);
    }
  },

  /**
   * Delete patient from Cloud Firestore and local cache
   */
  async deletePatient(id: string): Promise<void> {
    const current = this.getPatients();
    const updated = current.filter((p) => p.id !== id);
    this.saveLocalCache(updated);

    try {
      const docRef = doc(db, PATIENTS_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (e) {
      console.error('Error deleting patient from Firestore:', e);
    }
  },

  /**
   * Clear all patients from Firestore online and local cache
   */
  async clearAllPatients(): Promise<void> {
    this.saveLocalCache([]);

    try {
      const snapshot = await getDocs(collection(db, PATIENTS_COLLECTION));
      if (!snapshot.empty) {
        const batch = writeBatch(db);
        snapshot.forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }
    } catch (e) {
      console.error('Error clearing all patients from Firestore:', e);
    }
  },

  /**
   * Load or reset sample data (8 villages initial demo patients)
   */
  async loadSampleData(): Promise<Patient[]> {
    this.saveLocalCache(INITIAL_PATIENTS);

    try {
      const batch = writeBatch(db);
      INITIAL_PATIENTS.forEach((p) => {
        batch.set(doc(db, PATIENTS_COLLECTION, p.id), p);
      });
      await batch.commit();
    } catch (e) {
      console.error('Error seeding sample patients to Firestore:', e);
    }

    return INITIAL_PATIENTS;
  },

  /**
   * Export all patients to CSV (Excel with Thai UTF-8 BOM)
   */
  exportToCSV(patients: Patient[]): void {
    const headers = [
      'ลำดับ',
      'เลขบัตรประชาชน',
      'คำนำหน้า',
      'ชื่อ',
      'นามสกุล',
      'เพศ',
      'อายุ(ปี)',
      'วันเกิด',
      'เบอร์โทร',
      'บ้านเลขที่',
      'หมู่บ้าน',
      'สิทธิการรักษา',
      'คะแนน ADL',
      'กลุ่มภาวะพึ่งพิง',
      'กลุ่ม LTC',
      'โรคประจำตัว',
      'ผู้ดูแลหลัก',
      'เบอร์โทรผู้ดูแล',
      'ผู้ประเมิน',
      'วันที่ประเมินล่าสุด',
    ];

    const categoryNames: Record<string, string> = {
      social: 'ติดสังคม (12-20)',
      homebound: 'ติดบ้าน (5-11)',
      bedridden: 'ติดเตียง (0-4)',
    };

    const rows = patients.map((p, index) => {
      const adl = p.currentADL;
      return [
        index + 1,
        `"${p.citizenId}"`,
        `"${p.prefix}"`,
        `"${p.firstName}"`,
        `"${p.lastName}"`,
        `"${p.gender}"`,
        p.age,
        `"${p.birthDate}"`,
        `"${p.phone}"`,
        `"${p.houseNumber} ${p.street || ''}"`,
        `"${p.villageName}"`,
        `"${p.healthRights}"`,
        adl?.totalScore ?? '-',
        `"${categoryNames[adl?.category] || '-'}"`,
        adl?.ltcGroup ? `"LTC ${adl.ltcGroup}"` : '-',
        `"${p.chronicDiseases.join(', ')}"`,
        `"${p.caregiver?.name || '-'}"`,
        `"${p.caregiver?.phone || '-'}"`,
        `"${adl?.evaluatorName || '-'}"`,
        `"${adl?.assessmentDate || '-'}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `รายงานประเมินภาวะพึ่งพิง_ADL_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Export single patient evaluation to Excel
   */
  exportSinglePatientToExcel(patient: Patient): void {
    const adl = patient.currentADL;
    const categoryNames: Record<string, string> = {
      social: 'กลุ่มที่ 1 : ติดสังคม (12-20 คะแนน)',
      homebound: 'กลุ่มที่ 2 : ติดบ้าน (5-11 คะแนน)',
      bedridden: 'กลุ่มที่ 3 : ติดเตียง (0-4 คะแนน)',
    };

    const questionsMap: Record<string, { no: number; name: string; max: number; desc: string }> = {
      feeding: { no: 1, name: 'การรับประทานอาหาร (Feeding)', max: 2, desc: adl.answers.feeding === 2 ? 'รับประทานได้เองตามลำพัง' : adl.answers.feeding === 1 ? 'ตักเองได้แต่ต้องมีคนช่วยหั่น/เตรียม' : 'ไม่สามารถตักกินเองได้ ต้องป้อน/สายยาง' },
      grooming: { no: 2, name: 'การล้างหน้า แปรงฟัน หวีผม (Grooming)', max: 1, desc: adl.answers.grooming === 1 ? 'ทำได้เองทั้งหมด' : 'ต้องการความช่วยเหลือ' },
      transfer: { no: 3, name: 'การลุกนั่งจากที่นอนไปเก้าอี้ (Transfer)', max: 3, desc: adl.answers.transfer === 3 ? 'ทำได้เองทั้งหมด' : adl.answers.transfer === 2 ? 'ต้องการความช่วยเหลือบ้าง (1 คนพยุง)' : adl.answers.transfer === 1 ? 'ต้องการความช่วยเหลืออย่างมาก (2 คน)' : 'ไม่สามารถนั่งได้ นอนตลอด' },
      toilet: { no: 4, name: 'การใช้ห้องน้ำ (Toilet Use)', max: 2, desc: adl.answers.toilet === 2 ? 'ทำได้เองทั้งหมด' : adl.answers.toilet === 1 ? 'ทำเองได้บ้าง มีคนช่วยบางส่วน' : 'ช่วยตัวเองไม่ได้เลย' },
      mobility: { no: 5, name: 'การเคลื่อนที่/การเดิน (Mobility)', max: 3, desc: adl.answers.mobility === 3 ? 'เดินได้เองตามลำพัง' : adl.answers.mobility === 2 ? 'เดินได้โดยมีคนช่วยพยุง/วอล์กเกอร์' : adl.answers.mobility === 1 ? 'ใช้รถเข็นเข็นตัวเองได้' : 'เคลื่อนที่ไปไหนไม่ได้เลย' },
      dressing: { no: 6, name: 'การสวมใส่เสื้อผ้า (Dressing)', max: 2, desc: adl.answers.dressing === 2 ? 'สวมใส่ได้เองทั้งหมด' : adl.answers.dressing === 1 ? 'ช่วยตัวเองได้บ้างแต่ต้องช่วยติดกระดุม/กางเกง' : 'ต้องมีคนช่วยใส่ให้ทั้งหมด' },
      stairs: { no: 7, name: 'การขึ้นลงบันได (Stairs)', max: 2, desc: adl.answers.stairs === 2 ? 'ขึ้นลงได้เองปลอดภัย' : adl.answers.stairs === 1 ? 'ขึ้นลงได้แต่ต้องมีคนช่วยพยุง' : 'ไม่สามารถขึ้นลงบันไดได้' },
      bathing: { no: 8, name: 'การอาบน้ำ (Bathing)', max: 1, desc: adl.answers.bathing === 1 ? 'อาบน้ำได้เองทั้งหมด' : 'ต้องมีคนช่วยอาบหรือเช็ดตัว' },
      bowels: { no: 9, name: 'การกลั้นอุจจาระ (Bowels)', max: 2, desc: adl.answers.bowels === 2 ? 'กลั้นได้ปกติ' : adl.answers.bowels === 1 ? 'กลั้นไม่ได้เป็นบางครั้ง (<= 1 ครั้ง/สัปดาห์)' : 'กลั้นไม่ได้เลย/สวนอุจจาระ' },
      bladder: { no: 10, name: 'การกลั้นปัสสาวะ (Bladder)', max: 2, desc: adl.answers.bladder === 2 ? 'กลั้นได้ปกติ' : adl.answers.bladder === 1 ? 'กลั้นไม่ได้เป็นบางครั้ง (<= 1 ครั้ง/วัน)' : 'กลั้นไม่ได้เลย/คาสายสวนปัสสาวะ' },
    };

    const lines: string[] = [
      'แบบรายงานผลการประเมินภาวะพึ่งพิง Barthel ADL Index สำหรับผู้ป่วยรายบุคคล',
      `สังกัด: ${adl.evaluatorAgency || 'รพ.สต.บ้านธาตุ'},วันที่พิมพ์: ${new Date().toLocaleDateString('th-TH')}`,
      '',
      '--- ส่วนที่ 1: ข้อมูลผู้ป่วยและที่อยู่อาศัย ---',
      `ชื่อ-สกุล,"${patient.prefix}${patient.firstName} ${patient.lastName}"`,
      `เลขประจำตัวประชาชน,"${patient.citizenId}"`,
      `วันเกิด,"${patient.birthDate}",อายุ,"${patient.age} ปี",เพศ,"${patient.gender}"`,
      `ที่อยู่,"บ้านเลขที่ ${patient.houseNumber} ${patient.street}",หมู่บ้าน,"${patient.villageName}"`,
      `ตำบล,"${patient.subdistrict}",อำเภอ,"${patient.district}",จังหวัด,"${patient.province}"`,
      `จุดสังเกตที่ตั้งบ้าน,"${patient.landmarks || '-'}"`,
      `สิทธิการรักษาพยาบาล,"${patient.healthRights}",เบอร์โทรศัพท์,"${patient.phone || '-'}"`,
      `ผู้ดูแลหลัก (Caregiver),"${patient.caregiver?.name || '-'}",ความสัมพันธ์,"${patient.caregiver?.relationship || '-'}",เบอร์โทร,"${patient.caregiver?.phone || '-'}"`,
      `โรคประจำตัว,"${patient.chronicDiseases?.join('; ') || 'ไม่มี'}"`,
      '',
      '--- ส่วนที่ 2: สรุปผลการประเมิน ---',
      `คะแนนรวม ADL (Total Score),${adl.totalScore} / 20 คะแนน`,
      `การจัดกลุ่มตามเกณฑ์กระทรวงสาธารณสุข,"${categoryNames[adl.category] || adl.category}"`,
      `เกณฑ์จัดกลุ่ม LTC,"กลุ่มที่ ${adl.ltcGroup}"`,
      `ผู้ประเมิน,"${adl.evaluatorName}",ตำแหน่ง,"${adl.evaluatorRole}",วันที่ประเมิน,"${adl.assessmentDate}"`,
      `อุปกรณ์ที่แนะนำ,"${adl.suggestedEquipments?.join(', ') || '-'}"`,
      `บันทึกเพิ่มเติม,"${adl.clinicalNotes?.replace(/"/g, '""') || '-'}"`,
      '',
      '--- ส่วนที่ 3: รายละเอียดคะแนน 10 กิจวัตรประจำวัน ---',
      'ข้อ,กิจกรรม,คะแนนที่ได้,คะแนนเต็ม,ระดับความสามารถที่ประเมินได้',
    ];

    Object.values(questionsMap).forEach((q) => {
      const score = (adl.answers as any)[Object.keys(questionsMap).find((k) => questionsMap[k].no === q.no)!];
      lines.push(`${q.no},"${q.name}",${score},${q.max},"${q.desc}"`);
    });

    lines.push(`รวม,คะแนนรวมทั้งหมด,${adl.totalScore},20,"${categoryNames[adl.category]}"`);

    const csvContent = '\uFEFF' + lines.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ประเมินADL_${patient.firstName}_${patient.lastName}_${adl.assessmentDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
