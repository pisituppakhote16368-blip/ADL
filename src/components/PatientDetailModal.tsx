import React, { useState } from 'react';
import { Patient } from '../types';
import { ADL_QUESTIONS } from '../constants/villages';
import { formatThaiDate } from '../utils/adlCalculator';
import { storageService } from '../services/storageService';
import {
  X,
  Printer,
  Edit,
  RotateCcw,
  CreditCard,
  User,
  MapPin,
  Heart,
  Phone,
  Calendar,
  AlertTriangle,
  ZoomIn,
  Download,
} from 'lucide-react';

interface PatientDetailModalProps {
  patient: Patient | null;
  onClose: () => void;
  onPrint: (patient: Patient) => void;
  onEdit: (patient: Patient) => void;
  onReAssess: (patient: Patient) => void;
}

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  patient,
  onClose,
  onPrint,
  onEdit,
  onReAssess,
}) => {
  const [lightboxImage, setLightboxImage] = useState<{ title: string; src: string } | null>(null);

  if (!patient) return null;

  const adl = patient.currentADL;
  const isBedridden = adl?.category === 'bedridden';
  const isHomebound = adl?.category === 'homebound';

  const categoryBadge = isBedridden
    ? { title: 'กลุ่มที่ 3 : ติดเตียง (0-4 คะแนน)', bg: 'bg-rose-50 text-rose-800 border-rose-300' }
    : isHomebound
    ? { title: 'กลุ่มที่ 2 : ติดบ้าน (5-11 คะแนน)', bg: 'bg-amber-50 text-amber-800 border-amber-300' }
    : { title: 'กลุ่มที่ 1 : ติดสังคม (12-20 คะแนน)', bg: 'bg-emerald-50 text-emerald-800 border-emerald-300' };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 overflow-y-auto flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <span className="text-[11px] font-semibold text-teal-700 tracking-wide uppercase">
              ประวัติและผลการประเมินภาวะพึ่งพิง
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {patient.prefix}{patient.firstName} {patient.lastName} ({patient.villageName})
            </h2>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => storageService.exportSinglePatientToExcel(patient)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg transition-colors"
              title="ส่งออกรายงาน Excel"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">ส่งออก Excel</span>
            </button>
            <button
              onClick={() => onPrint(patient)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>พิมพ์รายงาน</span>
            </button>
            <button
              onClick={() => onReAssess(patient)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 hover:bg-teal-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ประเมินซ้ำ</span>
            </button>
            <button
              onClick={() => onEdit(patient)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">แก้ไข</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Top Profile Summary with Photos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
            {/* Photos Column */}
            <div className="space-y-3">
              {/* Patient Photo */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  รูปถ่ายผู้ป่วย
                </span>
                <div
                  className="aspect-square rounded-lg overflow-hidden border border-slate-200 relative group cursor-pointer bg-white"
                  onClick={() =>
                    setLightboxImage({
                      title: `รูปถ่ายผู้ป่วย: ${patient.prefix}${patient.firstName} ${patient.lastName}`,
                      src: patient.patientPhoto,
                    })
                  }
                >
                  <img
                    src={patient.patientPhoto}
                    alt={patient.firstName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium gap-1">
                    <ZoomIn className="w-4 h-4" />
                    <span>คลิกเพื่อขยาย</span>
                  </div>
                </div>
              </div>

              {/* ID Card Photo */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  รูปถ่ายหน้าบัตรประชาชน
                </span>
                <div
                  className="aspect-[16/10] rounded-lg overflow-hidden border border-slate-200 relative group cursor-pointer bg-white"
                  onClick={() =>
                    setLightboxImage({
                      title: `รูปบัตรประชาชน: ${patient.prefix}${patient.firstName} ${patient.lastName}`,
                      src: patient.idCardPhoto,
                    })
                  }
                >
                  <img
                    src={patient.idCardPhoto}
                    alt="ID Card"
                    className="w-full h-full object-contain p-1"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium gap-1">
                    <ZoomIn className="w-4 h-4" />
                    <span>คลิกเพื่อขยาย</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Demographics & Clinical Details */}
            <div className="md:col-span-2 space-y-4">
              {/* Classification Banner */}
              <div className={`p-4 rounded-xl border ${categoryBadge.bg} flex items-center justify-between`}>
                <div>
                  <span className="text-xs font-bold block">{categoryBadge.title}</span>
                  <span className="text-[11px] opacity-80">
                    เกณฑ์กระทรวงสาธารณสุข & กรมอนามัย · LTC กลุ่มที่ {adl?.ltcGroup || 1}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold font-mono tabular-nums leading-none block">
                    {adl?.totalScore} / 20
                  </span>
                  <span className="text-[10px] opacity-80">คะแนน ADL</span>
                </div>
              </div>

              {/* Bio Data Grid */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">เลขบัตรประชาชน</span>
                  <strong className="font-mono text-slate-900">{patient.citizenId}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">อายุ / เพศ</span>
                  <span className="font-semibold text-slate-900">
                    {patient.age} ปี ({patient.gender})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">วันเกิด</span>
                  <span className="text-slate-700">{formatThaiDate(patient.birthDate)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">หมู่บ้าน</span>
                  <span className="font-bold text-teal-800">{patient.villageName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">ที่อยู่บ้านเลขที่</span>
                  <span className="text-slate-800">{patient.houseNumber} {patient.street}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">สิทธิการรักษา</span>
                  <span className="text-slate-800">{patient.healthRights}</span>
                </div>
                <div className="col-span-2 sm:col-span-3">
                  <span className="text-slate-400 block text-[11px]">จุดสังเกตที่ตั้งบ้าน</span>
                  <span className="text-slate-700">{patient.landmarks || '-'}</span>
                </div>
              </div>

              {/* Caregiver & Health Conditions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Caregiver */}
                <div className="bg-white rounded-xl p-3.5 border border-slate-200 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    ผู้ดูแลหลัก (Caregiver)
                  </span>
                  <p className="font-bold text-slate-900">
                    {patient.caregiver?.name || 'ไม่มีข้อมูล'} ({patient.caregiver?.relationship || '-'})
                  </p>
                  {patient.caregiver?.phone && (
                    <p className="text-teal-700 flex items-center gap-1 font-mono">
                      <Phone className="w-3 h-3" />
                      {patient.caregiver.phone}
                    </p>
                  )}
                </div>

                {/* Chronic Diseases */}
                <div className="bg-white rounded-xl p-3.5 border border-slate-200 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    โรคประจำตัว
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {patient.chronicDiseases?.length > 0 ? (
                      patient.chronicDiseases.map((d, i) => (
                        <span key={i} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                          {d}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400">ไม่มี</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Special Alerts */}
              {(patient.specialConditions.hasBedsores ||
                patient.specialConditions.hasFoleyCatheter ||
                patient.specialConditions.hasNGTube ||
                patient.specialConditions.hasTracheostomy) && (
                <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-3 flex items-start gap-2 text-xs text-rose-900">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">ภาวะแทรกซ้อนทางการแพทย์ที่ต้องดูแล:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {patient.specialConditions.hasBedsores && (
                        <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-medium">
                          แผลกดทับ {patient.specialConditions.bedsoresStage || ''}
                        </span>
                      )}
                      {patient.specialConditions.hasFoleyCatheter && (
                        <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-medium">
                          คาสายสวนปัสสาวะ
                        </span>
                      )}
                      {patient.specialConditions.hasNGTube && (
                        <span className="bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded font-medium">
                          ให้อาหารทางสายยาง (NG Tube)
                        </span>
                      )}
                      {patient.specialConditions.hasTracheostomy && (
                        <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-medium">
                          ท่อเจาะคอ
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ADL 10-Item Detailed Score Breakdown */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  รายละเอียดคะแนนรายข้อ Barthel ADL Index (10 ข้อ)
                </h3>
                <p className="text-xs text-slate-500">
                  ประเมินโดย: {adl?.evaluatorName} ({adl?.evaluatorRole}) · วันที่: {adl?.assessmentDate}
                </p>
              </div>
              <span className="text-sm font-bold font-mono text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                รวม {adl?.totalScore} / 20 คะแนน
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {ADL_QUESTIONS.map((q) => {
                const score = adl?.answers ? adl.answers[q.key] : 0;
                const percent = (score / q.maxScore) * 100;
                const chosenOption = q.options.find((o) => o.score === score);

                return (
                  <div
                    key={q.id}
                    className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="font-semibold text-slate-800">
                        {q.number}. {q.title.split('(')[0].trim()}
                      </span>
                      <span className="font-mono font-bold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                        {score} / {q.maxScore}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2 mb-2">
                      {chosenOption?.description}
                    </p>

                    {/* Mini bar */}
                    <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className={`h-full ${
                          percent === 100
                            ? 'bg-emerald-500'
                            : percent > 0
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Care Plan & Recommendations */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              แผนการดูแลและอุปกรณ์ที่แนะนำ (Care Plan & Aids)
            </h3>
            {adl?.suggestedEquipments && adl.suggestedEquipments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {adl.suggestedEquipments.map((eq, i) => (
                  <span
                    key={i}
                    className="text-xs bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-1 rounded-md font-medium"
                  >
                    ✓ {eq}
                  </span>
                ))}
              </div>
            )}
            {adl?.clinicalNotes && (
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed">
                <span className="font-bold block text-slate-800 mb-1">บันทึกของผู้ประเมิน:</span>
                {adl.clinicalNotes}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div className="fixed inset-0 z-60 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl">
            <div className="p-3 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">{lightboxImage.title}</span>
              <button
                onClick={() => setLightboxImage(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold px-2 py-1"
              >
                ✕ ปิด
              </button>
            </div>
            <div className="p-4 bg-slate-900 flex items-center justify-center">
              <img
                src={lightboxImage.src}
                alt="Full preview"
                className="max-h-[75vh] w-auto rounded object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
