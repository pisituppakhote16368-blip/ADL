import React, { useState, useRef } from 'react';
import { Patient, VillageId, ADLAnswers, SpecialConditions } from '../types';
import { VILLAGES, ADL_QUESTIONS, generateMockIdCardSvg, generateMockPatientPhotoSvg } from '../constants/villages';
import {
  calculateADLScore,
  getADLCategory,
  getLTCGroup,
  calculateAge,
  formatCitizenId,
  generateSuggestions,
  formatThaiDate,
} from '../utils/adlCalculator';
import { compressAndReadFile } from '../utils/imageHelper';
import {
  ClipboardCheck,
  User,
  MapPin,
  Camera,
  Upload,
  CheckCircle2,
  Lock,
  Printer,
  Sparkles,
  Phone,
  Trash2,
  RotateCcw,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface PublicAssessmentViewProps {
  onSaveAssessment: (patient: Patient) => void;
  onOpenAdminLogin: () => void;
}

const DEFAULT_ANSWERS: ADLAnswers = {
  feeding: 2,
  grooming: 1,
  transfer: 3,
  toilet: 2,
  mobility: 3,
  dressing: 2,
  stairs: 2,
  bathing: 1,
  bowels: 2,
  bladder: 2,
};

const DEFAULT_SPECIAL_CONDITIONS: SpecialConditions = {
  hasBedsores: false,
  hasFoleyCatheter: false,
  hasNGTube: false,
  hasTracheostomy: false,
  cognitiveImpairment: 'none',
  visualImpairment: false,
  hearingImpairment: false,
  paralysisType: 'none',
};

export const PublicAssessmentView: React.FC<PublicAssessmentViewProps> = ({
  onSaveAssessment,
  onOpenAdminLogin,
}) => {
  // Step or Submit State
  const [submittedPatient, setSubmittedPatient] = useState<Patient | null>(null);

  // Form Fields - Basic Info
  const [prefix, setPrefix] = useState('นาย');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [citizenId, setCitizenId] = useState('');
  const [birthDate, setBirthDate] = useState('1950-01-01');
  const [age, setAge] = useState(76);
  const [gender, setGender] = useState<'ชาย' | 'หญิง'>('ชาย');
  const [phone, setPhone] = useState('');

  // Address - 8 Villages
  const [houseNumber, setHouseNumber] = useState('');
  const [street, setStreet] = useState('');
  const [villageId, setVillageId] = useState<VillageId>(1);
  const [subdistrict, setSubdistrict] = useState('ตำบลบ้านธาตุ');
  const [district, setDistrict] = useState('อำเภอเมือง');
  const [province, setProvince] = useState('จังหวัดอุดรธานี');
  const [landmarks, setLandmarks] = useState('');

  // Caregiver / Contact
  const [caregiverName, setCaregiverName] = useState('');
  const [caregiverRelation, setCaregiverRelation] = useState('บุตร');
  const [caregiverPhone, setCaregiverPhone] = useState('');

  // Health
  const [healthRights, setHealthRights] = useState('บัตรทอง (UC)');
  const [chronicDiseasesInput, setChronicDiseasesInput] = useState('');
  const [specialConditions, setSpecialConditions] = useState<SpecialConditions>(DEFAULT_SPECIAL_CONDITIONS);

  // Photos
  const [idCardPhoto, setIdCardPhoto] = useState<string>('');
  const [patientPhoto, setPatientPhoto] = useState<string>('');
  const [isCompressingIdCard, setIsCompressingIdCard] = useState(false);
  const [isCompressingPatientPhoto, setIsCompressingPatientPhoto] = useState(false);

  // ADL
  const [adlAnswers, setAdlAnswers] = useState<ADLAnswers>(DEFAULT_ANSWERS);
  const [evaluatorName, setEvaluatorName] = useState('');
  const [evaluatorRole, setEvaluatorRole] = useState('อสม.');
  const [evaluatorPhone, setEvaluatorPhone] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');

  const idCardInputRef = useRef<HTMLInputElement>(null);
  const patientPhotoInputRef = useRef<HTMLInputElement>(null);

  // Live Scores
  const totalScore = calculateADLScore(adlAnswers);
  const currentCategory = getADLCategory(totalScore);
  const currentLtcGroup = getLTCGroup(totalScore, specialConditions, adlAnswers);
  const suggestedEquipments = generateSuggestions(totalScore, adlAnswers, specialConditions);

  // Handle BirthDate Change
  const handleBirthDateChange = (val: string) => {
    setBirthDate(val);
    const calculated = calculateAge(val);
    if (calculated > 0) setAge(calculated);
  };

  // Upload Photo Handlers
  const handleIdCardUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCompressingIdCard(true);
    try {
      const base64 = await compressAndReadFile(file, 900, 600, 0.85);
      setIdCardPhoto(base64);
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถอัปโหลดไฟล์รูปภาพได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsCompressingIdCard(false);
    }
  };

  const handlePatientPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCompressingPatientPhoto(true);
    try {
      const base64 = await compressAndReadFile(file, 600, 600, 0.85);
      setPatientPhoto(base64);
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถอัปโหลดไฟล์รูปภาพได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsCompressingPatientPhoto(false);
    }
  };

  const handleGenerateMockPhotos = () => {
    const v = VILLAGES.find((x) => x.id === villageId);
    const nameStr = `${prefix}${firstName || 'ผู้ป่วย'} ${lastName || 'ตัวอย่าง'}`;
    const cid = citizenId || '3-4101-00000-00-1';
    const addr = `${houseNumber || '1'} ${street || ''} ${v?.fullName || 'หมู่ 1 บ้านธาตุ'}`;
    setIdCardPhoto(generateMockIdCardSvg(nameStr, cid, addr));
    setPatientPhoto(generateMockPatientPhotoSvg(nameStr, gender, age, currentCategory));
  };

  const resetForm = () => {
    setSubmittedPatient(null);
    setPrefix('นาย');
    setFirstName('');
    setLastName('');
    setCitizenId('');
    setBirthDate('1950-01-01');
    setAge(76);
    setGender('ชาย');
    setPhone('');
    setHouseNumber('');
    setStreet('');
    setVillageId(1);
    setLandmarks('');
    setCaregiverName('');
    setCaregiverPhone('');
    setChronicDiseasesInput('');
    setSpecialConditions(DEFAULT_SPECIAL_CONDITIONS);
    setIdCardPhoto('');
    setPatientPhoto('');
    setAdlAnswers(DEFAULT_ANSWERS);
    setEvaluatorName('');
    setEvaluatorPhone('');
    setClinicalNotes('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      alert('กรุณากรอกชื่อและนามสกุลผู้ป่วย');
      return;
    }
    if (!houseNumber.trim()) {
      alert('กรุณากรอกบ้านเลขที่');
      return;
    }

    const v = VILLAGES.find((x) => x.id === villageId);
    const fullNameStr = `${prefix}${firstName} ${lastName}`;
    const addressStr = `${houseNumber} ${street} ${v?.fullName || ''}`;

    let finalIdPhoto = idCardPhoto;
    let finalPatientPhoto = patientPhoto;
    if (!finalIdPhoto) {
      finalIdPhoto = generateMockIdCardSvg(fullNameStr, citizenId || '3-4101-00000-00-0', addressStr);
    }
    if (!finalPatientPhoto) {
      finalPatientPhoto = generateMockPatientPhotoSvg(fullNameStr, gender, age, currentCategory);
    }

    const chronicDiseasesList = chronicDiseasesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const assessmentDate = new Date().toISOString().slice(0, 10);

    const newAssessment = {
      id: `adl-${Date.now()}`,
      assessmentDate,
      assessmentRound: 1,
      evaluatorName: evaluatorName.trim() || 'ผู้ประเมินชุมชน/อสม.',
      evaluatorRole: evaluatorRole || 'อสม.',
      evaluatorAgency: v?.healthCenter || 'รพ.สต.บ้านธาตุ',
      answers: adlAnswers,
      totalScore,
      category: currentCategory,
      ltcGroup: currentLtcGroup,
      clinicalNotes,
      suggestedEquipments,
    };

    const newPatient: Patient = {
      id: `pt-${Date.now()}`,
      prefix,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      citizenId: citizenId.trim() || '3-4101-00000-00-0',
      birthDate,
      age: Number(age) || 60,
      gender,
      phone: phone.trim(),
      houseNumber: houseNumber.trim(),
      street: street.trim(),
      villageId,
      villageName: v ? v.fullName : 'หมู่ 1 บ้านธาตุ',
      subdistrict,
      district,
      province,
      postalCode: '41000',
      landmarks: landmarks.trim(),
      caregiver: {
        name: caregiverName.trim(),
        relationship: caregiverRelation.trim(),
        phone: caregiverPhone.trim(),
        isMainCaregiver: true,
      },
      healthRights,
      chronicDiseases: chronicDiseasesList,
      specialConditions,
      idCardPhoto: finalIdPhoto,
      patientPhoto: finalPatientPhoto,
      currentADL: newAssessment,
      assessmentHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveAssessment(newPatient);
    setSubmittedPatient(newPatient);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If already submitted, show beautiful results confirmation card
  if (submittedPatient) {
    const adl = submittedPatient.currentADL;
    const cat = adl.category;
    const catColor =
      cat === 'bedridden'
        ? { title: 'กลุ่มที่ 3 : ติดเตียง', badge: 'bg-rose-100 text-rose-800 border-rose-300', text: 'พึ่งพาผู้อื่นอย่างมาก (0 - 4 คะแนน)' }
        : cat === 'homebound'
        ? { title: 'กลุ่มที่ 2 : ติดบ้าน', badge: 'bg-amber-100 text-amber-800 border-amber-300', text: 'พึ่งพาตนเองได้ปานกลาง (5 - 11 คะแนน)' }
        : { title: 'กลุ่มที่ 1 : ติดสังคม', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300', text: 'พึ่งพาตนเองได้ดี (12 - 20 คะแนน)' };

    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
            บันทึกการประเมิน ADL เรียบร้อยแล้ว
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
            ข้อมูลได้ถูกบันทึกเข้าสู่ระบบฐานข้อมูลของ {submittedPatient.villageName} และส่งต่อไปยังทีม Care Manager / รพ.สต. เพื่อวางแผนการดูแล
          </p>

          {/* Result Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-left max-w-xl mx-auto space-y-4">
            <div className="flex items-start gap-4 pb-4 border-b border-slate-200">
              <img
                src={submittedPatient.patientPhoto}
                alt=""
                className="w-16 h-16 rounded-lg object-cover border border-slate-300"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1">
                <span className="text-xs text-teal-700 font-semibold">{submittedPatient.villageName}</span>
                <h3 className="text-base font-bold text-slate-900">
                  {submittedPatient.prefix}{submittedPatient.firstName} {submittedPatient.lastName}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  เลขบัตร: {submittedPatient.citizenId} · อายุ {submittedPatient.age} ปี
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  บ้านเลขที่ {submittedPatient.houseNumber} {submittedPatient.street}
                </p>
              </div>
            </div>

            {/* Score box */}
            <div className={`p-4 rounded-xl border flex items-center justify-between ${catColor.badge}`}>
              <div>
                <span className="text-xs font-bold block">{catColor.title}</span>
                <span className="text-[11px] opacity-80">{catColor.text}</span>
                <span className="text-[11px] block mt-0.5 font-medium">เกณฑ์กองทุน LTC: กลุ่มที่ {adl.ltcGroup}</span>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold font-mono tabular-nums leading-none block">
                  {adl.totalScore}
                </span>
                <span className="text-[10px] opacity-75">เต็ม 20 คะแนน</span>
              </div>
            </div>

            {/* Recommendations */}
            {adl.suggestedEquipments.length > 0 && (
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1.5">
                  อุปกรณ์และบริการที่แนะนำให้จัดสรร:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {adl.suggestedEquipments.map((eq, i) => (
                    <span
                      key={i}
                      className="text-xs bg-white text-slate-800 border border-slate-200 px-2.5 py-1 rounded-md"
                    >
                      ✓ {eq}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>พิมพ์ใบผลการประเมิน</span>
            </button>
            <button
              onClick={resetForm}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>ประเมินผู้ป่วยคนต่อไป</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Public Header Notice */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <ClipboardCheck className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider block">
                ระบบเปิดใช้งานสาธารณะ · ไม่ต้องใส่รหัสผ่าน
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                แบบประเมินผู้ป่วยที่มีภาวะพึ่งพิง (ADL)
              </h1>
            </div>
          </div>

          {/* Admin Login Button */}
          <button
            onClick={onOpenAdminLogin}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-teal-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 self-start sm:self-auto shrink-0"
          >
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>เข้าสู่ระบบ Admin</span>
          </button>
        </div>

        <p className="text-xs text-slate-600 mt-4 leading-relaxed">
          ยินดีต้อนรับ อสม., ผู้ดูแล, และเจ้าหน้าที่ชุมชน ทุกคนสามารถกรอกข้อมูลประเมินความสามารถในการดำเนินชีวิตประจำวัน
          ตามเกณฑ์ดัชนีบาร์เธลเอดีแอล (Barthel ADL Index) 10 ข้อ ครอบคลุมพื้นที่ 8 หมู่บ้านได้ทันทีโดยไม่ต้องใส่รหัสผ่าน
        </p>

        {/* Live Score Quick Banner */}
        <div className="mt-4 bg-slate-900 text-white p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="text-center bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">
              <span className="text-2xl font-bold font-mono tabular-nums leading-none block">
                {totalScore}
              </span>
              <span className="text-[10px] text-slate-300">เต็ม 20</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300">คะแนนปัจจุบัน:</span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${
                    currentCategory === 'bedridden'
                      ? 'bg-rose-500 text-white'
                      : currentCategory === 'homebound'
                      ? 'bg-amber-500 text-slate-900'
                      : 'bg-emerald-500 text-white'
                  }`}
                >
                  {currentCategory === 'bedridden'
                    ? 'กลุ่มที่ 3: ติดเตียง (0-4 คะแนน)'
                    : currentCategory === 'homebound'
                    ? 'กลุ่มที่ 2: ติดบ้าน (5-11 คะแนน)'
                    : 'กลุ่มที่ 1: ติดสังคม (12-20 คะแนน)'}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                ระดับการพึ่งพิง LTC: กลุ่มที่ {currentLtcGroup}
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-300">
            ระบบคำนวณคะแนนและแปลผลอัตโนมัติตามแบบฟอร์มด้านล่าง
          </div>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Patient Bio & Address (8 Villages) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-teal-600" />
              <span>ส่วนที่ 1: ข้อมูลผู้ป่วยและที่อยู่บ้าน (8 หมู่บ้าน)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              ระบุชื่อ นามสกุล เลขบัตรประชาชน และเลือกหมู่บ้านที่ผู้ป่วยพำนัก
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-medium text-slate-700 mb-1">คำนำหน้า *</label>
              <select
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-teal-500"
              >
                <option value="นาย">นาย</option>
                <option value="นาง">นาง</option>
                <option value="นางสาว">นางสาว</option>
                <option value="ด.ช.">ด.ช.</option>
                <option value="ด.ญ.">ด.ญ.</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">ชื่อจริง *</label>
              <input
                type="text"
                required
                placeholder="เช่น สมหมาย"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-medium text-slate-700 mb-1">นามสกุล *</label>
              <input
                type="text"
                required
                placeholder="เช่น บุญมี"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                เลขประจำตัวประชาชน 13 หลัก
              </label>
              <input
                type="text"
                maxLength={17}
                placeholder="3-4101-00234-51-1"
                value={citizenId}
                onChange={(e) => setCitizenId(formatCitizenId(e.target.value))}
                className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">วัน/เดือน/ปีเกิด</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => handleBirthDateChange(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="sm:col-span-1">
              <label className="block text-xs font-medium text-slate-700 mb-1">อายุ (ปี)</label>
              <input
                type="number"
                min={0}
                max={120}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">เพศ</label>
              <div className="flex gap-4 pt-1.5 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="gender-pub"
                    checked={gender === 'ชาย'}
                    onChange={() => setGender('ชาย')}
                    className="text-teal-600 focus:ring-teal-500"
                  />
                  <span>ชาย</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="gender-pub"
                    checked={gender === 'หญิง'}
                    onChange={() => setGender('หญิง')}
                    className="text-teal-600 focus:ring-teal-500"
                  />
                  <span>หญิง</span>
                </label>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">เบอร์โทรศัพท์ผู้ป่วย</label>
              <input
                type="tel"
                placeholder="081-xxx-xxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">สิทธิการรักษา</label>
              <select
                value={healthRights}
                onChange={(e) => setHealthRights(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-teal-500"
              >
                <option value="บัตรทอง (UC)">บัตรทอง (UC / 30 บาท)</option>
                <option value="ข้าราชการ/รัฐวิสาหกิจ">ข้าราชการ / รัฐวิสาหกิจ</option>
                <option value="ประกันสังคม">ประกันสังคม</option>
                <option value="ชำระเงินเอง">ชำระเงินเอง</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
            </div>
          </div>

          {/* Address selection: 8 Villages */}
          <div className="pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wider mb-2 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>ที่อยู่บ้านในเขต 8 หมู่บ้าน</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-teal-950 mb-1">
                  เลือกหมู่บ้าน (1 ใน 8 หมู่บ้าน) *
                </label>
                <select
                  value={villageId}
                  onChange={(e) => setVillageId(Number(e.target.value) as VillageId)}
                  className="w-full text-xs font-semibold bg-teal-50/70 border border-teal-300 text-teal-950 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500"
                >
                  {VILLAGES.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-slate-700 mb-1">บ้านเลขที่ *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น 12 หรือ 45/1"
                  value={houseNumber}
                  onChange={(e) => setHouseNumber(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-slate-700 mb-1">ถนน / ซอย</label>
                <input
                  type="text"
                  placeholder="เช่น ซอยร่วมใจ"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-slate-700 mb-1">จุดสังเกตที่ตั้งบ้าน</label>
                <input
                  type="text"
                  placeholder="เช่น ตรงข้ามวัด, ใกล้ร้านค้าป้าแต๋ว"
                  value={landmarks}
                  onChange={(e) => setLandmarks(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Photos (Thai ID Card Photo & Patient Photo) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Camera className="w-4 h-4 text-teal-600" />
                <span>ส่วนที่ 2: รูปถ่ายหน้าบัตรประชาชน และ รูปถ่ายผู้ป่วย</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                ถ่ายรูปจากกล้อง หรือเลือกไฟล์จากโทรศัพท์/คอมพิวเตอร์
              </p>
            </div>
            <button
              type="button"
              onClick={handleGenerateMockPhotos}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors self-start sm:self-auto shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>สร้างภาพตัวอย่างอัตโนมัติ</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ID Card Photo */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900">รูปถ่ายหน้าบัตรประชาชน</h3>
                {idCardPhoto && (
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    มีรูปแล้ว
                  </span>
                )}
              </div>

              <div className="aspect-[16/10] bg-white border-2 border-dashed border-slate-200 rounded-xl overflow-hidden flex items-center justify-center relative">
                {idCardPhoto ? (
                  <img
                    src={idCardPhoto}
                    alt="ID Card"
                    className="w-full h-full object-contain p-2"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-center p-3 text-slate-400">
                    <Upload className="w-6 h-6 mx-auto mb-1" />
                    <span className="text-xs font-medium block">ยังไม่มีรูปหน้าบัตรประชาชน</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  ref={idCardInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleIdCardUpload}
                />
                <button
                  type="button"
                  disabled={isCompressingIdCard}
                  onClick={() => idCardInputRef.current?.click()}
                  className="flex-1 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{idCardPhoto ? 'เปลี่ยนรูปบัตรประชาชน' : 'ถ่ายหรือเลือกรูปบัตร'}</span>
                </button>
                {idCardPhoto && (
                  <button
                    type="button"
                    onClick={() => setIdCardPhoto('')}
                    className="p-2 text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Patient Photo */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900">รูปถ่ายผู้ป่วย</h3>
                {patientPhoto && (
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    มีรูปแล้ว
                  </span>
                )}
              </div>

              <div className="aspect-[16/10] bg-white border-2 border-dashed border-slate-200 rounded-xl overflow-hidden flex items-center justify-center relative">
                {patientPhoto ? (
                  <img
                    src={patientPhoto}
                    alt="Patient"
                    className="w-full h-full object-contain p-2"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-center p-3 text-slate-400">
                    <User className="w-6 h-6 mx-auto mb-1" />
                    <span className="text-xs font-medium block">ยังไม่มีรูปถ่ายผู้ป่วย</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  ref={patientPhotoInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  className="hidden"
                  onChange={handlePatientPhotoUpload}
                />
                <button
                  type="button"
                  disabled={isCompressingPatientPhoto}
                  onClick={() => patientPhotoInputRef.current?.click()}
                  className="flex-1 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{patientPhoto ? 'เปลี่ยนรูปผู้ป่วย' : 'ถ่ายหรือเลือกรูปผู้ป่วย'}</span>
                </button>
                {patientPhoto && (
                  <button
                    type="button"
                    onClick={() => setPatientPhoto('')}
                    className="p-2 text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Barthel ADL 10 Questions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-teal-600" />
                <span>ส่วนที่ 3: แบบประเมิน Barthel ADL Index (10 ข้อมาตรฐาน)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                เลือกคำตอบที่ตรงกับความสามารถของผู้ป่วยมากที่สุดในปัจจุบัน
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 self-start sm:self-auto">
              คะแนนปัจจุบัน {totalScore} / 20
            </span>
          </div>

          <div className="space-y-4">
            {ADL_QUESTIONS.map((q) => {
              const currentVal = adlAnswers[q.key];
              return (
                <div
                  key={q.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-bold text-teal-900">
                        ข้อ {q.number}. {q.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">{q.subtitle}</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
                      {currentVal} / {q.maxScore} คะแนน
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {q.options.map((opt) => {
                      const isSelected = currentVal === opt.score;
                      return (
                        <label
                          key={opt.score}
                          className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'bg-teal-50 border-teal-500 text-teal-950 font-medium shadow-xs'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start gap-2 mb-1.5">
                            <input
                              type="radio"
                              name={`public-${q.key}`}
                              value={opt.score}
                              checked={isSelected}
                              onChange={() =>
                                setAdlAnswers({
                                  ...adlAnswers,
                                  [q.key]: opt.score,
                                })
                              }
                              className="mt-0.5 text-teal-600 focus:ring-teal-500"
                            />
                            <span className="font-bold text-slate-900">{opt.label}</span>
                          </div>
                          <span className="text-[11px] leading-relaxed text-slate-600 pl-5">
                            {opt.description}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 4: Evaluator Information & Submit */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">
              ส่วนที่ 4: ข้อมูลผู้ประเมินและยืนยันการส่งแบบประเมิน
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              ระบุชื่อผู้ประเมิน (เช่น อสม. / ญาติ / ผู้ดูแล) และเบอร์ติดต่อ
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">ชื่อผู้ประเมิน *</label>
              <input
                type="text"
                required
                placeholder="เช่น นางสมใจ สุขสวัสดิ์"
                value={evaluatorName}
                onChange={(e) => setEvaluatorName(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">บทบาท / หน้าที่</label>
              <select
                value={evaluatorRole}
                onChange={(e) => setEvaluatorRole(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-teal-500"
              >
                <option value="อสม.">อาสาสมัครสาธารณสุข (อสม.)</option>
                <option value="ผู้ดูแล (CG)">ผู้ช่วยเหลือดูแลผู้สูงอายุ (CG)</option>
                <option value="ญาติ/ครอบครัว">ญาติ / บุตรหลาน</option>
                <option value="เจ้าหน้าที่สาธารณสุข">เจ้าหน้าที่สาธารณสุข</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">เบอร์โทรศัพท์ผู้ประเมิน</label>
              <input
                type="tel"
                placeholder="089-xxx-xxxx"
                value={evaluatorPhone}
                onChange={(e) => setEvaluatorPhone(e.target.value)}
                className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                บันทึกเพิ่มเติม (ถ้ามี)
              </label>
              <textarea
                rows={2}
                placeholder="ระบุอาการเพิ่มเติม เช่น แขนขาข้างใดอ่อนแรง กลั้นปัสสาวะไม่ได้ มีแผล หรือต้องการเตียง/รถเข็น..."
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              * ข้อมูลจะถูกจัดเก็บเข้าสู่ระบบและนำไปประมวลผลเพื่อวางแผนการช่วยเหลือ
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>ส่งแบบประเมินภาวะพึ่งพิง (บันทึกข้อมูล)</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
