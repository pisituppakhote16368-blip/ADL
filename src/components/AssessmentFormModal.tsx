import React, { useState, useRef, useEffect } from 'react';
import { Patient, VillageId, ADLAnswers, SpecialConditions } from '../types';
import { VILLAGES, ADL_QUESTIONS, generateMockIdCardSvg, generateMockPatientPhotoSvg } from '../constants/villages';
import {
  calculateADLScore,
  getADLCategory,
  getLTCGroup,
  calculateAge,
  formatCitizenId,
  validateCitizenId,
  generateSuggestions,
} from '../utils/adlCalculator';
import { compressAndReadFile } from '../utils/imageHelper';
import {
  X,
  Camera,
  Upload,
  Check,
  AlertCircle,
  HelpCircle,
  Sparkles,
  User,
  MapPin,
  ClipboardList,
  FileText,
  Trash2,
} from 'lucide-react';

interface AssessmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (patient: Patient) => void;
  patientToEdit?: Patient | null;
  initialMode?: 'new' | 'edit' | 'reassess';
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

export const AssessmentFormModal: React.FC<AssessmentFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  patientToEdit,
  initialMode = 'new',
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'photos' | 'adl' | 'careplan'>('info');

  // Form Fields - Basic Info
  const [prefix, setPrefix] = useState('นาย');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [citizenId, setCitizenId] = useState('');
  const [birthDate, setBirthDate] = useState('1950-01-01');
  const [age, setAge] = useState(76);
  const [gender, setGender] = useState<'ชาย' | 'หญิง'>('ชาย');
  const [phone, setPhone] = useState('');

  // Address
  const [houseNumber, setHouseNumber] = useState('');
  const [street, setStreet] = useState('');
  const [villageId, setVillageId] = useState<VillageId>(1);
  const [subdistrict, setSubdistrict] = useState('ตำบลบ้านธาตุ');
  const [district, setDistrict] = useState('อำเภอเมือง');
  const [province, setProvince] = useState('จังหวัดอุดรธานี');
  const [landmarks, setLandmarks] = useState('');

  // Caregiver
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
  const [evaluatorName, setEvaluatorName] = useState('เจ้าหน้าที่ รพ.สต.');
  const [evaluatorRole, setEvaluatorRole] = useState('พยาบาลวิชาชีพ');
  const [evaluatorAgency, setEvaluatorAgency] = useState('รพ.สต.บ้านธาตุ');
  const [clinicalNotes, setClinicalNotes] = useState('');

  const idCardInputRef = useRef<HTMLInputElement>(null);
  const patientPhotoInputRef = useRef<HTMLInputElement>(null);

  // Calculate live scores
  const totalScore = calculateADLScore(adlAnswers);
  const currentCategory = getADLCategory(totalScore);
  const currentLtcGroup = getLTCGroup(totalScore, specialConditions, adlAnswers);
  const suggestedEquipments = generateSuggestions(totalScore, adlAnswers, specialConditions);

  // Initialize form when editing or opening
  useEffect(() => {
    if (patientToEdit) {
      setPrefix(patientToEdit.prefix || 'นาย');
      setFirstName(patientToEdit.firstName || '');
      setLastName(patientToEdit.lastName || '');
      setCitizenId(patientToEdit.citizenId || '');
      setBirthDate(patientToEdit.birthDate || '1950-01-01');
      setAge(patientToEdit.age || 76);
      setGender(patientToEdit.gender || 'ชาย');
      setPhone(patientToEdit.phone || '');

      setHouseNumber(patientToEdit.houseNumber || '');
      setStreet(patientToEdit.street || '');
      setVillageId(patientToEdit.villageId || 1);
      setSubdistrict(patientToEdit.subdistrict || 'ตำบลบ้านธาตุ');
      setDistrict(patientToEdit.district || 'อำเภอเมือง');
      setProvince(patientToEdit.province || 'จังหวัดอุดรธานี');
      setLandmarks(patientToEdit.landmarks || '');

      setCaregiverName(patientToEdit.caregiver?.name || '');
      setCaregiverRelation(patientToEdit.caregiver?.relationship || 'บุตร');
      setCaregiverPhone(patientToEdit.caregiver?.phone || '');

      setHealthRights(patientToEdit.healthRights || 'บัตรทอง (UC)');
      setChronicDiseasesInput(patientToEdit.chronicDiseases?.join(', ') || '');
      setSpecialConditions(patientToEdit.specialConditions || DEFAULT_SPECIAL_CONDITIONS);

      setIdCardPhoto(patientToEdit.idCardPhoto || '');
      setPatientPhoto(patientToEdit.patientPhoto || '');

      if (patientToEdit.currentADL) {
        setAdlAnswers(patientToEdit.currentADL.answers || DEFAULT_ANSWERS);
        setEvaluatorName(patientToEdit.currentADL.evaluatorName || 'เจ้าหน้าที่ รพ.สต.');
        setEvaluatorRole(patientToEdit.currentADL.evaluatorRole || 'พยาบาลวิชาชีพ');
        setEvaluatorAgency(patientToEdit.currentADL.evaluatorAgency || 'รพ.สต.บ้านธาตุ');
        setClinicalNotes(patientToEdit.currentADL.clinicalNotes || '');
      }

      if (initialMode === 'reassess') {
        setActiveTab('adl');
      } else {
        setActiveTab('info');
      }
    } else {
      // Reset to fresh form
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
      setSubdistrict('ตำบลบ้านธาตุ');
      setDistrict('อำเภอเมือง');
      setProvince('จังหวัดอุดรธานี');
      setLandmarks('');
      setCaregiverName('');
      setCaregiverRelation('บุตร');
      setCaregiverPhone('');
      setHealthRights('บัตรทอง (UC)');
      setChronicDiseasesInput('ความดันโลหิตสูง, เบาหวาน');
      setSpecialConditions(DEFAULT_SPECIAL_CONDITIONS);
      setIdCardPhoto('');
      setPatientPhoto('');
      setAdlAnswers(DEFAULT_ANSWERS);
      setEvaluatorName('พยาบาลวิชาชีพ รพ.สต.');
      setEvaluatorRole('Care Manager');
      setEvaluatorAgency('รพ.สต.บ้านธาตุ');
      setClinicalNotes('');
      setActiveTab('info');
    }
  }, [patientToEdit, initialMode, isOpen]);

  // Handle BirthDate Change and Age Calculation
  const handleBirthDateChange = (val: string) => {
    setBirthDate(val);
    const calculated = calculateAge(val);
    if (calculated > 0) setAge(calculated);
  };

  // Handle ID card upload
  const handleIdCardUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCompressingIdCard(true);
    try {
      const base64 = await compressAndReadFile(file, 900, 600, 0.85);
      setIdCardPhoto(base64);
    } catch (err) {
      console.error('Error compressing ID card:', err);
      alert('ไม่สามารถอัปโหลดไฟล์รูปภาพได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsCompressingIdCard(false);
    }
  };

  // Handle Patient photo upload
  const handlePatientPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCompressingPatientPhoto(true);
    try {
      const base64 = await compressAndReadFile(file, 600, 600, 0.85);
      setPatientPhoto(base64);
    } catch (err) {
      console.error('Error compressing patient photo:', err);
      alert('ไม่สามารถอัปโหลดไฟล์รูปภาพได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsCompressingPatientPhoto(false);
    }
  };

  // Generate Quick Mock ID Card & Patient Photo if user wants quick autofill
  const handleGenerateMockPhotos = () => {
    const v = VILLAGES.find((x) => x.id === villageId);
    const nameStr = `${prefix}${firstName || 'ตัวอย่าง'} ${lastName || 'นามสมมุติ'}`;
    const cid = citizenId || '3-4101-00000-00-1';
    const addr = `${houseNumber || '99'} ${street || ''} ${v?.fullName || 'หมู่ 1 บ้านธาตุ'} ${subdistrict} ${district}`;
    setIdCardPhoto(generateMockIdCardSvg(nameStr, cid, addr));
    setPatientPhoto(generateMockPatientPhotoSvg(nameStr, gender, age, currentCategory));
  };

  // Form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      alert('กรุณาระบุชื่อและนามสกุลของผู้ป่วย');
      setActiveTab('info');
      return;
    }

    if (!houseNumber.trim()) {
      alert('กรุณาระบุบ้านเลขที่');
      setActiveTab('info');
      return;
    }

    // Default photos if not set
    let finalIdPhoto = idCardPhoto;
    let finalPatientPhoto = patientPhoto;
    const v = VILLAGES.find((x) => x.id === villageId);
    const fullNameStr = `${prefix}${firstName} ${lastName}`;
    const addressStr = `${houseNumber} ${street} ${v?.fullName || ''}`;

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
      assessmentRound: patientToEdit ? (patientToEdit.assessmentHistory?.length || 0) + 1 : 1,
      evaluatorName: evaluatorName || 'เจ้าหน้าที่สาธารณสุข',
      evaluatorRole: evaluatorRole || 'พยาบาลวิชาชีพ',
      evaluatorAgency: evaluatorAgency || 'รพ.สต.บ้านธาตุ',
      answers: adlAnswers,
      totalScore,
      category: currentCategory,
      ltcGroup: currentLtcGroup,
      clinicalNotes,
      suggestedEquipments,
    };

    let history = patientToEdit?.assessmentHistory || [];
    if (patientToEdit && initialMode === 'reassess' && patientToEdit.currentADL) {
      history = [patientToEdit.currentADL, ...history];
    }

    const patientRecord: Patient = {
      id: patientToEdit ? patientToEdit.id : `pt-${Date.now()}`,
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
      assessmentHistory: history,
      createdAt: patientToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(patientRecord);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 overflow-y-auto flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div>
            <span className="text-[11px] font-semibold text-teal-700 tracking-wide uppercase">
              {initialMode === 'edit'
                ? 'แก้ไขประวัติ'
                : initialMode === 'reassess'
                ? 'ประเมินซ้ำรอบใหม่'
                : 'ลงทะเบียน & ประเมินใหม่'}
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {patientToEdit
                ? `${prefix}${firstName} ${lastName}` || 'แก้ไขข้อมูลผู้ป่วย'
                : 'แบบประเมินผู้ป่วยที่มีภาวะพึ่งพิง (Barthel ADL Index)'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="px-5 border-b border-slate-200 flex items-center gap-1 sm:gap-2 overflow-x-auto text-xs font-semibold bg-white shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'info'
                ? 'border-teal-600 text-teal-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>1. ข้อมูลผู้ป่วย & ที่อยู่</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('photos')}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'photos'
                ? 'border-teal-600 text-teal-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>2. รูปบัตรประชาชน & รูปผู้ป่วย</span>
            {(idCardPhoto || patientPhoto) && (
              <span className="w-2 h-2 rounded-full bg-teal-500 inline-block" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('adl')}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'adl'
                ? 'border-teal-600 text-teal-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>3. แบบประเมิน ADL (10 ข้อ)</span>
            <span className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded text-[10px]">
              {totalScore}/20
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('careplan')}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'careplan'
                ? 'border-teal-600 text-teal-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>4. สรุปผล & แผนการดูแล (LTC)</span>
          </button>
        </div>

        {/* Tab Contents */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* TAB 1: General Info & Address */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Personal Info Box */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5 border-b border-teal-100 pb-1.5">
                  <User className="w-4 h-4 text-teal-600" />
                  ข้อมูลส่วนบุคคลผู้ป่วย
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-medium text-slate-700 mb-1">คำนำหน้า *</label>
                    <select
                      value={prefix}
                      onChange={(e) => setPrefix(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-teal-500"
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
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-teal-500"
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
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-teal-500"
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
                      className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-700 mb-1">วัน/เดือน/ปีเกิด</label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => handleBirthDateChange(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-teal-500"
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
                      className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg p-2 text-center focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-700 mb-1">เพศ</label>
                    <div className="flex gap-4 pt-1 text-xs">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          checked={gender === 'ชาย'}
                          onChange={() => setGender('ชาย')}
                          className="text-teal-600 focus:ring-teal-500"
                        />
                        <span>ชาย</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
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
                      className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-700 mb-1">สิทธิการรักษาพยาบาล</label>
                    <select
                      value={healthRights}
                      onChange={(e) => setHealthRights(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="บัตรทอง (UC)">บัตรทอง (UC / 30 บาท)</option>
                      <option value="ข้าราชการ/รัฐวิสาหกิจ">ข้าราชการ / รัฐวิสาหกิจ</option>
                      <option value="ประกันสังคม">ประกันสังคม</option>
                      <option value="ชำระเงินเอง">ชำระเงินเอง</option>
                      <option value="อื่นๆ">อื่นๆ</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Address Box (With the 8 requested villages) */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5 border-b border-teal-100 pb-1.5">
                  <MapPin className="w-4 h-4 text-teal-600" />
                  ที่อยู่ผู้ป่วย (ระบุ 8 หมู่บ้านในเขตรับผิดชอบ)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold text-teal-900 mb-1">
                      เลือกหมู่บ้าน (8 หมู่บ้านตามพื้นที่) *
                    </label>
                    <select
                      value={villageId}
                      onChange={(e) => setVillageId(Number(e.target.value) as VillageId)}
                      className="w-full text-xs font-semibold bg-teal-50/60 border border-teal-300 text-teal-950 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500"
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
                      placeholder="เช่น 45/1 หรือ 109"
                      value={houseNumber}
                      onChange={(e) => setHouseNumber(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-medium text-slate-700 mb-1">ถนน / ซอย</label>
                    <input
                      type="text"
                      placeholder="เช่น ซอยร่วมใจ หรือ ถ.มิตรภาพชุมชน"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-medium text-slate-700 mb-1">จุดสังเกต / ที่ตั้งบ้าน</label>
                    <input
                      type="text"
                      placeholder="เช่น ตรงข้ามวัด, ติดศาลากลางหมู่บ้าน"
                      value={landmarks}
                      onChange={(e) => setLandmarks(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Caregiver Box */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5 border-b border-teal-100 pb-1.5">
                  <User className="w-4 h-4 text-teal-600" />
                  ข้อมูลผู้ดูแลหลัก (Caregiver)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">ชื่อ-สกุล ผู้ดูแล</label>
                    <input
                      type="text"
                      placeholder="เช่น นางมาลี บุญมี"
                      value={caregiverName}
                      onChange={(e) => setCaregiverName(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">ความสัมพันธ์</label>
                    <input
                      type="text"
                      placeholder="เช่น ภรรยา, บุตร, ผู้ช่วยดูแล CG"
                      value={caregiverRelation}
                      onChange={(e) => setCaregiverRelation(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">เบอร์โทรศัพท์ผู้ดูแล</label>
                    <input
                      type="tel"
                      placeholder="089-xxx-xxxx"
                      value={caregiverPhone}
                      onChange={(e) => setCaregiverPhone(e.target.value)}
                      className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Clinical Flags */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5 border-b border-teal-100 pb-1.5">
                  โรคประจำตัวและภาวะทางกายภาพ
                </h3>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    โรคประจำตัว (คั่นด้วยเครื่องหมายจุลภาค ,)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น ความดันโลหิตสูง, เบาหวาน, โรคหลอดเลือดสมอง"
                    value={chronicDiseasesInput}
                    onChange={(e) => setChronicDiseasesInput(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                  <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={specialConditions.hasBedsores}
                      onChange={(e) =>
                        setSpecialConditions({ ...specialConditions, hasBedsores: e.target.checked })
                      }
                      className="rounded text-teal-600"
                    />
                    <span className="font-medium text-rose-700">มีแผลกดทับ</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={specialConditions.hasFoleyCatheter}
                      onChange={(e) =>
                        setSpecialConditions({ ...specialConditions, hasFoleyCatheter: e.target.checked })
                      }
                      className="rounded text-teal-600"
                    />
                    <span className="font-medium text-amber-700">คาสายสวนปัสสาวะ</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={specialConditions.hasNGTube}
                      onChange={(e) =>
                        setSpecialConditions({ ...specialConditions, hasNGTube: e.target.checked })
                      }
                      className="rounded text-teal-600"
                    />
                    <span className="font-medium text-indigo-700">สายให้อาหาร (NG)</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={specialConditions.hasTracheostomy}
                      onChange={(e) =>
                        setSpecialConditions({ ...specialConditions, hasTracheostomy: e.target.checked })
                      }
                      className="rounded text-teal-600"
                    />
                    <span className="font-medium text-slate-800">ท่อเจาะคอ</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Photos (Thai National ID Card Photo & Patient Photo) */}
          {activeTab === 'photos' && (
            <div className="space-y-6">
              <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="text-xs text-teal-900">
                  <h3 className="font-bold mb-0.5">ส่วนบันทึกภาพถ่ายตามระเบียบ</h3>
                  <p className="text-teal-800">
                    โปรดอัปโหลดหรือถ่ายรูปหน้าบัตรประชาชนและรูปถ่ายผู้ป่วยเพื่อใช้เป็นหลักฐานประกอบการประเมินและการเบิกจ่ายกองทุน LTC
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateMockPhotos}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-xs shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>สร้างภาพตัวอย่างสมจริงอัตโนมัติ</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Photo 1: Thai ID Card Photo */}
                <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">1. รูปถ่ายหน้าบัตรประชาชน</h4>
                      <p className="text-[11px] text-slate-500">Thai National ID Card Photo</p>
                    </div>
                    {idCardPhoto && (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        พร้อมใช้งาน
                      </span>
                    )}
                  </div>

                  {/* ID Card Preview or Empty Placeholder */}
                  <div className="aspect-[16/10] bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl overflow-hidden flex items-center justify-center relative group">
                    {idCardPhoto ? (
                      <img
                        src={idCardPhoto}
                        alt="รูปหน้าบัตรประชาชน"
                        className="w-full h-full object-contain p-2"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <span className="text-xs font-medium text-slate-600 block">
                          ยังไม่มีรูปถ่ายหน้าบัตรประชาชน
                        </span>
                        <span className="text-[11px] text-slate-400 block mt-1">
                          รองรับการถ่ายรูปหรืออัปโหลดไฟล์ (.jpg, .png)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* ID Card Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
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
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{idCardPhoto ? 'เปลี่ยนรูปบัตรประชาชน' : 'ถ่ายหรือเลือกรูปบัตร'}</span>
                    </button>
                    {idCardPhoto && (
                      <button
                        type="button"
                        onClick={() => setIdCardPhoto('')}
                        className="p-2 text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors"
                        title="ลบรูป"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Photo 2: Patient Photo */}
                <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">2. รูปถ่ายผู้ป่วย</h4>
                      <p className="text-[11px] text-slate-500">Patient Current Portrait</p>
                    </div>
                    {patientPhoto && (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        พร้อมใช้งาน
                      </span>
                    )}
                  </div>

                  {/* Patient Photo Preview or Empty Placeholder */}
                  <div className="aspect-[16/10] bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl overflow-hidden flex items-center justify-center relative group">
                    {patientPhoto ? (
                      <img
                        src={patientPhoto}
                        alt="รูปถ่ายผู้ป่วย"
                        className="w-full h-full object-contain p-2"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <User className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <span className="text-xs font-medium text-slate-600 block">
                          ยังไม่มีรูปถ่ายผู้ป่วย
                        </span>
                        <span className="text-[11px] text-slate-400 block mt-1">
                          ถ่ายรูปหน้าตรงผู้ป่วย หรือถ่ายขณะนอน/นั่งทำกิจกรรม
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Patient Photo Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
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
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{patientPhoto ? 'เปลี่ยนรูปผู้ป่วย' : 'ถ่ายหรือเลือกรูปผู้ป่วย'}</span>
                    </button>
                    {patientPhoto && (
                      <button
                        type="button"
                        onClick={() => setPatientPhoto('')}
                        className="p-2 text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors"
                        title="ลบรูป"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ADL 10 Questions */}
          {activeTab === 'adl' && (
            <div className="space-y-6">
              {/* Sticky Score Dashboard Header */}
              <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="text-center bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">
                    <span className="text-2xl font-bold font-mono tabular-nums leading-none block">
                      {totalScore}
                    </span>
                    <span className="text-[10px] text-slate-300">เต็ม 20</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-300">ผลการประเมินปัจจุบัน:</span>
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
                      เกณฑ์จำแนก LTC: กลุ่มที่ {currentLtcGroup} (สำหรับจัดทำ Care Plan กองทุน LTC)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setAdlAnswers({
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
                      })
                    }
                    className="text-[11px] px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
                  >
                    ช่วยตัวเองได้หมด (20)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setAdlAnswers({
                        feeding: 0,
                        grooming: 0,
                        transfer: 0,
                        toilet: 0,
                        mobility: 0,
                        dressing: 0,
                        stairs: 0,
                        bathing: 0,
                        bowels: 0,
                        bladder: 0,
                      })
                    }
                    className="text-[11px] px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
                  >
                    ติดเตียงทั้งหมด (0)
                  </button>
                </div>
              </div>

              {/* 10 ADL Questions List */}
              <div className="space-y-4">
                {ADL_QUESTIONS.map((q) => {
                  const currentValue = adlAnswers[q.key];
                  return (
                    <div
                      key={q.id}
                      className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-xs font-bold text-teal-800">
                            ข้อ {q.number}. {q.title}
                          </span>
                          <p className="text-[11px] text-slate-500 mt-0.5">{q.subtitle}</p>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded shrink-0">
                          {currentValue} / {q.maxScore} คะแนน
                        </span>
                      </div>

                      {/* Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {q.options.map((opt) => {
                          const isSelected = currentValue === opt.score;
                          return (
                            <label
                              key={opt.score}
                              className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex flex-col justify-between ${
                                isSelected
                                  ? 'bg-teal-50/80 border-teal-500 text-teal-950 font-medium shadow-xs'
                                  : 'bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-slate-100/60'
                              }`}
                            >
                              <div className="flex items-start gap-2 mb-1.5">
                                <input
                                  type="radio"
                                  name={q.key}
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
          )}

          {/* TAB 4: Evaluator and Care Plan */}
          {activeTab === 'careplan' && (
            <div className="space-y-6">
              {/* Classification Summary Card */}
              <div
                className={`p-5 rounded-xl border ${
                  currentCategory === 'bedridden'
                    ? 'bg-rose-50/60 border-rose-300'
                    : currentCategory === 'homebound'
                    ? 'bg-amber-50/60 border-amber-300'
                    : 'bg-emerald-50/60 border-emerald-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">ผลสรุปการประเมิน Barthel Index</span>
                  <span className="text-xl font-bold font-mono">
                    คะแนนรวม: {totalScore} / 20 คะแนน
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  {currentCategory === 'bedridden'
                    ? 'กลุ่มที่ 3 : ติดเตียง (พึ่งพาตนเองไม่ได้/พึ่งพาผู้อื่นอย่างมาก)'
                    : currentCategory === 'homebound'
                    ? 'กลุ่มที่ 2 : ติดบ้าน (พึ่งพาตนเองได้ปานกลาง)'
                    : 'กลุ่มที่ 1 : ติดสังคม (พึ่งพาตนเองได้ดี)'}
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed mb-3">
                  {currentCategory === 'bedridden'
                    ? 'ผู้ป่วยติดเตียงต้องการการดูแลใกล้ชิดจากผู้ดูแลและทีมสหวิชาชีพ เพื่อป้องกันภาวะแทรกซ้อน เช่น แผลกดทับ ภาวะข้อติด ปอดอักเสบ และติดเชื้อทางเดินปัสสาวะ'
                    : currentCategory === 'homebound'
                    ? 'ผู้ป่วยติดบ้านต้องการการช่วยเหลือบางกิจวัตรประจำวัน การจัดหากายอุปกรณ์ช่วยเดิน และการปรับสภาพแวดล้อมที่อยู่อาศัยเพื่อป้องกันการพลัดตกหกล้ม'
                    : 'ผู้ป่วยสามารถปฏิบัติกิจวัตรประจำวันได้ด้วยตนเอง ควรส่งเสริมการออกกำลังกาย สุขภาพจิต และการตรวจคัดกรองโรคเรื้อรังต่อเนื่อง'}
                </p>
                <div className="text-xs font-semibold text-slate-800 bg-white/70 p-2.5 rounded-lg border border-slate-200">
                  เกณฑ์กลุ่ม LTC ของ สปสช. / กรมอนามัย: <strong>กลุ่มที่ {currentLtcGroup}</strong>
                </div>
              </div>

              {/* Recommended Aids / Equipment */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800">
                  อุปกรณ์และกายอุปกรณ์ที่แนะนำสำหรับผู้ป่วยรายนี้
                </h4>
                <div className="flex flex-wrap gap-2">
                  {suggestedEquipments.map((item, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-medium bg-teal-50 text-teal-800 border border-teal-200 px-3 py-1.5 rounded-lg"
                    >
                      ✓ {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Clinical Notes & Care Plan Details */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  บันทึกการประเมินและแผนการดูแล (Care Plan / Clinical Notes)
                </label>
                <textarea
                  rows={3}
                  placeholder="ระบุข้อสังเกตเพิ่มเติม เช่น อาการแขนขาอ่อนแรง ปัญหาการกลั้นขับถ่าย ความถี่ในการเยี่ยมบ้านของผู้ดูแล หรือความต้องการอุปกรณ์เพิ่มเติม..."
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-3 focus:ring-1 focus:ring-teal-500"
                />
              </div>

              {/* Evaluator Credentials */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800">
                  ข้อมูลผู้ประเมินและหน่วยบริการ
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">ชื่อผู้ประเมิน *</label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น นางสาวพัชราภรณ์ สุขใจ"
                      value={evaluatorName}
                      onChange={(e) => setEvaluatorName(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">ตำแหน่ง / หน้าที่</label>
                    <select
                      value={evaluatorRole}
                      onChange={(e) => setEvaluatorRole(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="พยาบาลวิชาชีพ">พยาบาลวิชาชีพ</option>
                      <option value="Care Manager (CM)">Care Manager (CM)</option>
                      <option value="ผู้ช่วยดูแลผู้สูงอายุ (CG)">ผู้ช่วยดูแลผู้สูงอายุ (CG)</option>
                      <option value="อสม.">อาสาสมัครสาธารณสุข (อสม.)</option>
                      <option value="นักกายภาพบำบัด">นักกายภาพบำบัด</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">สังกัดหน่วยบริการ</label>
                    <input
                      type="text"
                      placeholder="รพ.สต.บ้านธาตุ"
                      value={evaluatorAgency}
                      onChange={(e) => setEvaluatorAgency(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer / Navigation Buttons */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {activeTab !== 'info' && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === 'careplan') setActiveTab('adl');
                    else if (activeTab === 'adl') setActiveTab('photos');
                    else if (activeTab === 'photos') setActiveTab('info');
                  }}
                  className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  &lt; ย้อนกลับ
                </button>
              )}
              {activeTab !== 'careplan' && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === 'info') setActiveTab('photos');
                    else if (activeTab === 'photos') setActiveTab('adl');
                    else if (activeTab === 'adl') setActiveTab('careplan');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors border border-teal-200"
                >
                  ถัดไป &gt;
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>
                  {initialMode === 'edit'
                    ? 'บันทึกการแก้ไข'
                    : initialMode === 'reassess'
                    ? 'บันทึกการประเมินซ้ำ'
                    : 'บันทึกข้อมูลและแบบประเมิน'}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
